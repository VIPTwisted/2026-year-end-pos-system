export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { ReceiptActions } from './ReceiptActions'

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const receipt = await prisma.warehouseReceipt.findUnique({
    where: { id },
    include: {
      store: { select: { name: true } },
      lines: {
        include: { product: { select: { name: true, sku: true, unit: true } } },
      },
      activities: {
        include: { _count: { select: { lines: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!receipt) notFound()

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Receipt ${receipt.receiptNo}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-zinc-100 font-mono">{receipt.receiptNo}</h2>
                <Badge variant={receipt.status === 'posted' ? 'secondary' : 'default'} className="capitalize">
                  {receipt.status}
                </Badge>
              </div>
              <div className="flex gap-4 text-xs text-zinc-500">
                <span>Store: <span className="text-zinc-300">{receipt.store?.name}</span></span>
                {receipt.sourceType && <span>Source: <span className="text-zinc-300 capitalize">{receipt.sourceType}</span></span>}
                {receipt.sourceId && <span>Ref: <span className="text-zinc-300 font-mono">{receipt.sourceId}</span></span>}
                {receipt.expectedDate && <span>Expected: <span className="text-zinc-300">{formatDate(receipt.expectedDate)}</span></span>}
                <span>Created: <span className="text-zinc-300">{formatDate(receipt.createdAt)}</span></span>
              </div>
            </div>
            <ReceiptActions receiptId={id} status={receipt.status} />
          </div>
        </div>

        {/* Lines */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Lines ({receipt.lines.length})</h3>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Product</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">UOM</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Expected</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Received</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">To Receive</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Lot #</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Serial #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {receipt.lines.map(l => (
                  <tr key={l.id} className="hover:bg-zinc-900/40">
                    <td className="px-4 py-3">
                      <p className="text-zinc-200 text-xs font-medium">{l.product?.name ?? 'Unknown'}</p>
                      <p className="text-zinc-600 text-xs font-mono">{l.product?.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs font-mono">{l.unitOfMeasure}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{l.qtyExpected}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={l.qtyReceived >= l.qtyExpected ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                        {l.qtyReceived}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-amber-400 font-semibold">{l.qtyToReceive}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{l.lotNo ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{l.serialNo ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activities */}
        {receipt.activities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Put-Away Activities</h3>
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Activity #</th>
                    <th className="text-center px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Type</th>
                    <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Lines</th>
                    <th className="text-center px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {receipt.activities.map(a => (
                    <tr key={a.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3">
                        <Link href={`/warehouse/activities/${a.id}`} className="font-mono text-xs text-blue-400 hover:text-blue-300">
                          {a.activityNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="success" className="text-xs capitalize">{a.type.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-300 text-xs">{a._count.lines}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={a.status === 'completed' ? 'success' : 'default'} className="text-xs capitalize">{a.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 text-xs">{formatDate(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
