export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open:      'bg-blue-500/10 text-blue-400 border-blue-500/30',
    draft:     'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    released:  'bg-amber-500/10 text-amber-400 border-amber-500/30',
    shipped:   'bg-purple-500/10 text-purple-400 border-purple-500/30',
    received:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default async function TransferOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const transfer = await prisma.transferOrder.findUnique({
    where: { id },
    include: {
      fromStore: { select: { name: true } },
      toStore:   { select: { name: true } },
      lines: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!transfer) notFound()

  const docNo = transfer.transferNumber ?? transfer.orderNumber

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Transfer Order ${docNo}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* General FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/40">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">General</h3>
            <div className="flex items-center gap-2">
              {(transfer.status === 'open' || transfer.status === 'draft') && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                  Release
                </button>
              )}
              {transfer.status === 'released' && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors">
                  Post Shipment
                </button>
              )}
              {transfer.status === 'shipped' && (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                  Post Receipt
                </button>
              )}
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 transition-colors">
                Print
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <h2 className="text-xl font-bold text-zinc-100 font-mono">{docNo}</h2>
              <StatusChip status={transfer.status} />
            </div>
            <dl className="grid grid-cols-3 gap-x-8 gap-y-2 text-xs">
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-32">Transfer-from</dt>
                <dd className="text-zinc-300">{transfer.fromStore?.name ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-32">Transfer-to</dt>
                <dd className="text-zinc-300">{transfer.toStore?.name ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-32">In-Transit Code</dt>
                <dd className="text-zinc-300 font-mono">{transfer.inTransitCode ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-32">Shipment Date</dt>
                <dd className="text-zinc-300">{transfer.shipmentDate ? formatDate(transfer.shipmentDate) : '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-32">Receipt Date</dt>
                <dd className="text-zinc-300">{transfer.receiptDate ? formatDate(transfer.receiptDate) : '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 w-32">Created</dt>
                <dd className="text-zinc-300">{formatDate(transfer.createdAt)}</dd>
              </div>
              {transfer.notes && (
                <div className="col-span-3 flex gap-2">
                  <dt className="text-zinc-500 w-32">Notes</dt>
                  <dd className="text-zinc-300">{transfer.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Lines FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800/40">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Lines ({transfer.lines.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {transfer.lines.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">No lines on this transfer order</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Line No.</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Item No.</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Description</th>
                    <th className="text-right px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Qty</th>
                    <th className="text-right px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Qty Shipped</th>
                    <th className="text-right px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Qty Received</th>
                    <th className="text-left px-4 py-2.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">UOM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {transfer.lines.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3 text-zinc-500 tabular-nums text-xs">{l.id.slice(-6)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{l.productId ?? '—'}</td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-200 text-xs font-medium">{l.productId ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{l.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-400">{l.quantityShipped}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-400">{l.quantityReceived}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{l.unitOfMeasure}</td>
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
