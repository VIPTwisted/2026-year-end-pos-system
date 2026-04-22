import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-zinc-700 text-zinc-200',
  open:     'bg-blue-900 text-blue-200',
  sent:     'bg-indigo-900 text-indigo-300',
  accepted: 'bg-emerald-900 text-emerald-300',
  rejected: 'bg-red-900 text-red-300',
  expired:  'bg-zinc-700 text-zinc-500',
}

export default async function PurchaseQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const quote = await prisma.vendorPO.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines:  true,
    },
  })

  if (!quote) notFound()

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title={`Purchase Quote · ${quote.poNumber}`}
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
          { label: 'Purchase Quotes', href: '/purchasing/quotes' },
        ]}
      />

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors">
          Make Order
        </button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium transition-colors">
          Send
        </button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium transition-colors">
          Print
        </button>
        <button className="px-3 py-1.5 text-xs bg-red-800 hover:bg-red-700 text-white rounded font-medium transition-colors">
          Reject
        </button>
        <span className={`ml-4 inline-block px-2.5 py-0.5 rounded text-xs font-semibold capitalize ${STATUS_COLORS[quote.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {quote.status}
        </span>
      </div>

      <div className="flex gap-6 p-6">
        <div className="flex-1 space-y-4 min-w-0">

          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">General</summary>
            <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">No.</p>
                <p className="font-mono text-zinc-100">{quote.poNumber}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Buy-from Vendor</p>
                <Link href={`/purchasing/vendors/${quote.vendorId}`} className="text-blue-400 hover:underline">{quote.vendor?.name ?? '—'}</Link>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Quote Date</p>
                <p className="text-zinc-300">{new Date(quote.orderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Valid Until</p>
                <p className="text-zinc-300">{quote.expectedDate ? new Date(quote.expectedDate).toLocaleDateString() : '—'}</p>
              </div>
              {quote.notes && (
                <div className="col-span-3">
                  <p className="text-xs text-zinc-500 mb-0.5">Notes</p>
                  <p className="text-zinc-300 text-xs">{quote.notes}</p>
                </div>
              )}
            </div>
          </details>

          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Lines</summary>
            <div className="px-4 pb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                    <th className="text-left pb-2 pr-4 font-medium">No.</th>
                    <th className="text-left pb-2 pr-4 font-medium">Description</th>
                    <th className="text-right pb-2 pr-4 font-medium">Qty</th>
                    <th className="text-right pb-2 pr-4 font-medium">Unit Cost</th>
                    <th className="text-right pb-2 font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {quote.lines.map(line => (
                    <tr key={line.id} className="hover:bg-zinc-800/30">
                      <td className="py-2.5 pr-4 font-mono text-xs text-zinc-400">{line.sku ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-zinc-200">{line.productName ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{line.qtyOrdered}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-zinc-300">{formatCurrency(line.unitCost)}</td>
                      <td className="py-2.5 text-right tabular-nums font-semibold text-emerald-400">{formatCurrency(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={4} className="pt-2 text-right text-xs text-zinc-400 font-medium pr-4">Total Amount</td>
                    <td className="pt-2 text-right font-bold text-emerald-400 tabular-nums">{formatCurrency(quote.totalAmt)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </details>
        </div>

        <aside className="w-64 shrink-0">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Quote Statistics</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Total Amount</dt>
                <dd className="text-emerald-400 font-semibold tabular-nums">{formatCurrency(quote.totalAmt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Lines</dt>
                <dd className="text-zinc-200">{quote.lines.length}</dd>
              </div>
            </dl>
            <Link href={`/purchasing/vendors/${quote.vendorId}`} className="mt-3 block text-xs text-blue-400 hover:underline">
              Open Vendor Card
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
