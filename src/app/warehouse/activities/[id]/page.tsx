export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { ActivityActions } from './ActivityActions'

const TYPE_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  put_away: 'success',
  pick: 'warning',
  movement: 'default',
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const activity = await prisma.warehouseActivity.findUnique({
    where: { id },
    include: {
      store: { select: { name: true } },
      receipt: { select: { id: true, receiptNo: true } },
      shipment: { select: { id: true, shipmentNo: true } },
      lines: {
        include: {
          product: { select: { name: true, sku: true } },
          bin: { select: { id: true, code: true, zone: { select: { code: true } } } },
        },
        orderBy: { lineNo: 'asc' },
      },
    },
  })
  if (!activity) notFound()

  // Group lines into take/place pairs by pairing consecutive lines
  const takeLines = activity.lines.filter(l => l.actionType === 'take')
  const placeLines = activity.lines.filter(l => l.actionType === 'place')
  const totalHandled = activity.lines.filter(l => l.isHandled).length
  const totalLines = activity.lines.length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Activity ${activity.activityNo}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-zinc-100 font-mono">{activity.activityNo}</h2>
                <Badge variant={TYPE_VARIANT[activity.type] ?? 'secondary'} className="capitalize">
                  {activity.type.replace('_', ' ')}
                </Badge>
                <Badge variant={activity.status === 'completed' ? 'success' : activity.status === 'in_progress' ? 'warning' : 'default'} className="capitalize">
                  {activity.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                <span>Store: <span className="text-zinc-300">{activity.store?.name}</span></span>
                {activity.assignedTo && <span>Assigned: <span className="text-zinc-300">{activity.assignedTo}</span></span>}
                {activity.receipt && (
                  <span>Receipt: <Link href={`/warehouse/receipts/${activity.receipt.id}`} className="text-blue-400 hover:text-blue-300 font-mono">{activity.receipt.receiptNo}</Link></span>
                )}
                {activity.shipment && (
                  <span>Shipment: <Link href={`/warehouse/shipments/${activity.shipment.id}`} className="text-blue-400 hover:text-blue-300 font-mono">{activity.shipment.shipmentNo}</Link></span>
                )}
                <span>Created: <span className="text-zinc-300">{formatDate(activity.createdAt)}</span></span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden max-w-xs">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: totalLines > 0 ? `${(totalHandled / totalLines) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-zinc-500">{totalHandled}/{totalLines} lines handled</span>
              </div>
            </div>
            {activity.status !== 'completed' && (
              <ActivityActions
                activityId={id}
                lines={activity.lines.map(l => ({
                  id: l.id,
                  lineNo: l.lineNo,
                  actionType: l.actionType,
                  productName: l.product?.name ?? 'Unknown',
                  productSku: l.product?.sku ?? '',
                  binCode: l.bin?.code ?? null,
                  zoneCode: l.bin?.zone?.code ?? null,
                  quantity: l.quantity,
                  qtyHandled: l.qtyHandled,
                  isHandled: l.isHandled,
                }))}
              />
            )}
          </div>
        </div>

        {/* Lines table */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Activity Lines ({activity.lines.length})</h3>
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Line</th>
                  <th className="text-center px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Bin</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Qty</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Handled</th>
                  <th className="text-center px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {activity.lines.map((line, idx) => {
                  // Alternate row background for take/place pairs
                  const pairIdx = Math.floor(idx / 2)
                  const bgClass = pairIdx % 2 === 0 ? '' : 'bg-zinc-900/20'
                  return (
                    <tr key={line.id} className={`hover:bg-zinc-900/40 transition-colors ${bgClass}`}>
                      <td className="px-4 py-3 text-right text-zinc-600 tabular-nums text-xs">{line.lineNo}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${line.actionType === 'take' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {line.actionType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-200 text-xs font-medium">{line.product?.name ?? 'Unknown'}</p>
                        <p className="text-zinc-600 text-xs font-mono">{line.product?.sku}</p>
                      </td>
                      <td className="px-4 py-3">
                        {line.bin ? (
                          <div>
                            <Link href={`/warehouse/bins/${line.bin.id}`} className="font-mono text-xs text-blue-400 hover:text-blue-300">{line.bin.code}</Link>
                            {line.bin.zone && <p className="text-zinc-600 text-xs">{line.bin.zone.code}</p>}
                          </div>
                        ) : <span className="text-zinc-600 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-zinc-100">{line.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={line.qtyHandled > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                          {line.qtyHandled}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={line.isHandled ? 'success' : 'secondary'} className="text-xs">
                          {line.isHandled ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Take/Place summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">Take Lines</h4>
            <p className="text-2xl font-bold text-zinc-100">{takeLines.length}</p>
            <p className="text-xs text-zinc-500 mt-1">{takeLines.filter(l => l.isHandled).length} handled</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Place Lines</h4>
            <p className="text-2xl font-bold text-zinc-100">{placeLines.length}</p>
            <p className="text-xs text-zinc-500 mt-1">{placeLines.filter(l => l.isHandled).length} handled</p>
          </div>
        </div>
      </main>
    </div>
  )
}
