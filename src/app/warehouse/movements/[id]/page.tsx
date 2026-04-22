export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'secondary' | 'destructive'> = {
  open: 'default',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'secondary',
}

export default async function MovementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const movement = await prisma.warehouseMovement.findUnique({
    where: { id },
    include: {
      store: { select: { name: true } },
      lines: {
        include: { product: { select: { name: true, sku: true } } },
        orderBy: [{ lineNo: 'asc' }],
      },
    },
  })
  if (!movement) notFound()

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Movement ${movement.movementNo}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* General FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/40">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">General</h3>
            <div className="flex items-center gap-2">
              {movement.status === 'open' && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                  Register Movement
                </button>
              )}
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 transition-colors">
                Print
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-3 mb-2">
              <h2 className="text-xl font-bold text-zinc-100 font-mono">{movement.movementNo}</h2>
              <Badge variant={STATUS_VARIANT[movement.status] ?? 'default'} className="capitalize">
                {movement.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-28">Location</dt>
                <dd className="text-zinc-300 font-mono">{movement.locationCode ?? movement.store?.name ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-28">Assigned User ID</dt>
                <dd className="text-zinc-300">{movement.assignedUserId ?? '—'}</dd>
              </div>
              {movement.description && (
                <div className="col-span-2 flex gap-2">
                  <dt className="text-zinc-500 w-28">Description</dt>
                  <dd className="text-zinc-300">{movement.description}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-28">Created</dt>
                <dd className="text-zinc-300">{formatDate(movement.createdAt)}</dd>
              </div>
              {movement.completedAt && (
                <div className="flex gap-2">
                  <dt className="text-zinc-500 w-28">Completed</dt>
                  <dd className="text-zinc-300">{formatDate(movement.completedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Lines FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800/40">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Lines ({movement.lines.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {movement.lines.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">No lines on this movement</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">Action Type</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">Item</th>
                    <th className="text-right px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">Qty</th>
                    <th className="text-right px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">Handled</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">UOM</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">From Zone</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">From Bin</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">To Zone</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">To Bin</th>
                    <th className="text-center px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium">Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {movement.lines.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${l.actionType === 'Take' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {l.actionType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-200 text-xs font-medium">{l.product?.name ?? l.description ?? 'Unknown'}</p>
                        {l.product?.sku && <p className="text-zinc-600 text-xs font-mono">{l.product.sku}</p>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{l.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={l.qtyHandled >= l.quantity ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                          {l.qtyHandled}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{l.unitOfMeasure}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{l.fromZoneCode ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{l.fromBinCode ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{l.toZoneCode ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{l.toBinCode ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={l.isHandled ? 'success' : 'secondary'} className="text-xs">
                          {l.isHandled ? 'Yes' : 'No'}
                        </Badge>
                      </td>
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
