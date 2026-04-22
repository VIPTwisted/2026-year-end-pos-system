import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-zinc-700 text-zinc-200',
  open:     'bg-blue-900 text-blue-200',
  released: 'bg-emerald-900 text-emerald-300',
  pending_approval: 'bg-amber-900 text-amber-300',
  received: 'bg-purple-900 text-purple-300',
  cancelled:'bg-red-900 text-red-300',
}

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const po = await prisma.vendorPO.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines:  true,
      receipts: { include: { lines: true } },
    },
  })

  if (!po) notFound()

  const totalReceived = po.lines.reduce((sum, line) => sum + line.qtyReceived * line.unitCost, 0)
  const receiptCount = po.receipts.length

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title={`Purchase Order · ${po.poNumber}`}
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
          { label: 'Purchase Orders', href: '/purchasing/orders' },
        ]}
      />

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button className="px-3 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium transition-colors">
          Release
        </button>
        <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors">
          Post
        </button>
        <button className="px-3 py-1.5 text-xs bg-purple-700 hover:bg-purple-600 text-white rounded font-medium transition-colors">
          Receive
        </button>
        <button className="px-3 py-1.5 text-xs bg-amber-700 hover:bg-amber-600 text-white rounded font-medium transition-colors">
          Invoice
        </button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium transition-colors">
          Print
        </button>
        <span
          className={`ml-4 inline-block px-2.5 py-0.5 rounded text-xs font-semibold capitalize ${STATUS_COLORS[po.status] ?? 'bg-zinc-700 text-zinc-300'}`}
        >
          {po.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex gap-6 p-6">
        {/* Main content */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* General FastTab */}
          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">General</summary>
            <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">No.</p>
                <p className="font-mono text-zinc-100">{po.poNumber}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Buy-from Vendor</p>
                <Link href={`/purchasing/vendors/${po.vendorId}`} className="text-blue-400 hover:underline">
                  {po.vendor?.name ?? '—'}
                </Link>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Vendor Code</p>
                <p className="text-zinc-300 font-mono">{po.vendor?.vendorCode ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Order Date</p>
                <p className="text-zinc-300">{new Date(po.orderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Expected Receipt Date</p>
                <p className="text-zinc-300">{po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Received Date</p>
                <p className="text-zinc-300">{po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : '—'}</p>
              </div>
              {po.notes && (
                <div className="col-span-2 lg:col-span-3">
                  <p className="text-xs text-zinc-500 mb-0.5">Notes</p>
                  <p className="text-zinc-300 text-xs">{po.notes}</p>
                </div>
              )}
            </div>
          </details>

          {/* Shipping FastTab */}
          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Shipping</summary>
            <div className="px-4 pb-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Ship-to Location</p>
                <p className="text-zinc-300">{po.shippingAddress ?? '—'}</p>
              </div>
            </div>
          </details>

          {/* Lines FastTab */}
          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Lines</summary>
            <div className="px-4 pb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                    <th className="text-left pb-2 pr-4 font-medium">No. / SKU</th>
                    <th className="text-left pb-2 pr-4 font-medium">Description</th>
                    <th className="text-right pb-2 pr-4 font-medium">Qty Ordered</th>
                    <th className="text-right pb-2 pr-4 font-medium">Qty Received</th>
                    <th className="text-right pb-2 pr-4 font-medium">Unit Cost</th>
                    <th className="text-right pb-2 font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {po.lines.map(line => (
                    <tr key={line.id} className="hover:bg-zinc-800/30">
                      <td className="py-2.5 pr-4 font-mono text-xs text-zinc-400">{line.sku ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-zinc-200">{line.productName ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{line.qtyOrdered}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        <span className={line.qtyReceived >= line.qtyOrdered ? 'text-emerald-400' : line.qtyReceived > 0 ? 'text-amber-400' : 'text-zinc-400'}>
                          {line.qtyReceived}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-zinc-300">{formatCurrency(line.unitCost)}</td>
                      <td className="py-2.5 text-right tabular-nums font-semibold text-emerald-400">{formatCurrency(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={5} className="pt-2 text-right text-xs text-zinc-400 font-medium pr-4">Total Amount</td>
                    <td className="pt-2 text-right font-bold text-emerald-400 tabular-nums">{formatCurrency(po.totalAmt)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </details>

        </div>

        {/* FactBox sidebar */}
        <aside className="w-64 shrink-0 space-y-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">PO Statistics</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Order Amount</dt>
                <dd className="text-zinc-200 font-semibold tabular-nums">{formatCurrency(po.totalAmt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Amount Received</dt>
                <dd className="text-emerald-400 font-semibold tabular-nums">{formatCurrency(totalReceived)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Outstanding</dt>
                <dd className="text-amber-400 font-semibold tabular-nums">{formatCurrency(po.totalAmt - totalReceived)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-700 pt-2">
                <dt className="text-zinc-500">Receipts</dt>
                <dd className="text-zinc-200">{receiptCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Line Count</dt>
                <dd className="text-zinc-200">{po.lines.length}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Vendor Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-zinc-500 text-xs">Name</dt>
                <dd className="text-zinc-200">{po.vendor?.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs">Code</dt>
                <dd className="font-mono text-zinc-300">{po.vendor?.vendorCode ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs">Payment Terms</dt>
                <dd className="text-zinc-300">{po.vendor?.paymentTerms ?? '—'}</dd>
              </div>
            </dl>
            <Link href={`/purchasing/vendors/${po.vendorId}`} className="mt-3 block text-xs text-blue-400 hover:underline">
              Open Vendor Card
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
