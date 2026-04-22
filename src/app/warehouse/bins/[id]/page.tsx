export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'

const BIN_TYPE_COLOR: Record<string, string> = {
  RECEIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  SHIP: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PUTAWAY: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PICK: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  PUTPICK: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  QC: 'bg-red-500/10 text-red-400 border-red-500/30',
  FIXED: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
}

export default async function BinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [bin, activityLines] = await Promise.all([
    prisma.warehouseBin.findUnique({
      where: { id },
      include: {
        store: { select: { name: true } },
        zone: { select: { code: true, description: true } },
        contents: {
          include: { product: { select: { name: true, sku: true } } },
          orderBy: { lastUpdated: 'desc' },
        },
      },
    }),
    prisma.warehouseActivityLine.findMany({
      where: { binId: id },
      include: {
        product: { select: { name: true, sku: true } },
        activity: { select: { activityNo: true, type: true, status: true, createdAt: true } },
      },
      orderBy: { activity: { createdAt: 'desc' } },
      take: 10,
    }),
  ])

  if (!bin) notFound()

  const totalQty = bin.contents.reduce((s, c) => s + c.quantity, 0)
  const usedPct = bin.maxQty && bin.maxQty > 0 ? Math.min(100, (totalQty / bin.maxQty) * 100) : null

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Bin ${bin.code}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-zinc-100 font-mono">{bin.code}</h2>
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${BIN_TYPE_COLOR[bin.binType] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                  {bin.binType}
                </span>
                {bin.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                {bin.isEmpty && <Badge variant="outline">Empty</Badge>}
              </div>
              <p className="text-sm text-zinc-500">{bin.description ?? 'No description'}</p>
              <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                <span>Store: <span className="text-zinc-300">{bin.store?.name}</span></span>
                {bin.zone && <span>Zone: <span className="text-zinc-300 font-mono">{bin.zone.code}</span></span>}
                <span>Rank: <span className="text-zinc-300">{bin.rankNo}</span></span>
              </div>
            </div>
            <div className="text-right">
              {bin.maxQty && (
                <div className="text-xs text-zinc-500 mb-1">Capacity: {totalQty.toFixed(0)} / {bin.maxQty.toLocaleString()}</div>
              )}
              {usedPct !== null && (
                <div className="w-40 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${usedPct > 90 ? 'bg-red-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contents */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Bin Contents</h3>
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            {bin.contents.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">Bin is empty</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Product</th>
                    <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Lot #</th>
                    <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Serial #</th>
                    <th className="text-right px-4 py-2.5 text-zinc-500 text-xs font-medium">Qty</th>
                    <th className="text-right px-4 py-2.5 text-zinc-500 text-xs font-medium">Min</th>
                    <th className="text-right px-4 py-2.5 text-zinc-500 text-xs font-medium">Max</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 text-xs font-medium">Flags</th>
                    <th className="text-right px-4 py-2.5 text-zinc-500 text-xs font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {bin.contents.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3">
                        <p className="text-zinc-200 font-medium text-xs">{c.product?.name ?? 'Unknown'}</p>
                        <p className="text-zinc-600 text-xs font-mono">{c.product?.sku}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{c.lotNo ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{c.serialNo ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-100 tabular-nums">{c.quantity}</td>
                      <td className="px-4 py-3 text-right text-zinc-500 tabular-nums text-xs">{c.minQty}</td>
                      <td className="px-4 py-3 text-right text-zinc-500 tabular-nums text-xs">{c.maxQty ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          {c.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                          {c.isFixed && <Badge variant="outline" className="text-xs">Fixed</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 text-xs">{formatDate(c.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Activity History */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Recent Activity Lines</h3>
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            {activityLines.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">No activity history</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Activity</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 text-xs font-medium">Type</th>
                    <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Product</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 text-xs font-medium">Action</th>
                    <th className="text-right px-4 py-2.5 text-zinc-500 text-xs font-medium">Qty</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 text-xs font-medium">Handled</th>
                    <th className="text-right px-4 py-2.5 text-zinc-500 text-xs font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {activityLines.map(al => (
                    <tr key={al.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3">
                        <Link href={`/warehouse/activities/${al.activityId}`} className="font-mono text-xs text-blue-400 hover:text-blue-300">
                          {al.activity.activityNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="text-xs capitalize">{al.activity.type.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 text-xs">{al.product?.name ?? 'Unknown'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium ${al.actionType === 'take' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {al.actionType.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-300 font-semibold">{al.quantity}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={al.isHandled ? 'success' : 'secondary'} className="text-xs">
                          {al.isHandled ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 text-xs">{formatDate(al.activity.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
