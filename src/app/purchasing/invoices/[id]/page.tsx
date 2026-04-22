import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-zinc-700 text-zinc-200',
  posted:    'bg-emerald-900 text-emerald-300',
  matched:   'bg-blue-900 text-blue-200',
  paid:      'bg-purple-900 text-purple-300',
  partial:   'bg-amber-900 text-amber-300',
  cancelled: 'bg-red-900 text-red-300',
}

export default async function PurchaseInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const invoice = await prisma.vendorInvoice.findUnique({
    where: { id },
    include: {
      vendor:      true,
      lines:       true,
      settlements: { include: { payment: true } },
    },
  })

  if (!invoice) notFound()

  const remaining = invoice.totalAmount - invoice.paidAmount

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title={`Purchase Invoice · ${invoice.invoiceNumber}`}
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
          { label: 'Purchase Invoices', href: '/purchasing/invoices' },
        ]}
      />

      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button className="px-3 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium transition-colors">
          Post
        </button>
        <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors">
          Apply Entries
        </button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium transition-colors">
          Print
        </button>
        <button className="px-3 py-1.5 text-xs bg-red-800 hover:bg-red-700 text-white rounded font-medium transition-colors">
          Cancel
        </button>
        <span className={`ml-4 inline-block px-2.5 py-0.5 rounded text-xs font-semibold capitalize ${STATUS_COLORS[invoice.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {invoice.status}
        </span>
      </div>

      <div className="flex gap-6 p-6">
        <div className="flex-1 space-y-4 min-w-0">

          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">General</summary>
            <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Invoice No.</p>
                <p className="font-mono text-zinc-100">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Vendor</p>
                <Link href={`/purchasing/vendors/${invoice.vendorId}`} className="text-blue-400 hover:underline">{invoice.vendor?.name ?? '—'}</Link>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Invoice Date</p>
                <p className="text-zinc-300">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Posting Date</p>
                <p className="text-zinc-300">{new Date(invoice.postingDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Due Date</p>
                <p className="text-zinc-300">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Matching Status</p>
                <p className="text-zinc-300 capitalize">{invoice.matchingStatus}</p>
              </div>
              {invoice.notes && (
                <div className="col-span-3">
                  <p className="text-xs text-zinc-500 mb-0.5">Notes</p>
                  <p className="text-zinc-300 text-xs">{invoice.notes}</p>
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
                    <th className="text-left pb-2 pr-4 font-medium">Description</th>
                    <th className="text-right pb-2 pr-4 font-medium">Qty</th>
                    <th className="text-right pb-2 pr-4 font-medium">Unit Price</th>
                    <th className="text-right pb-2 pr-4 font-medium">Tax Amount</th>
                    <th className="text-right pb-2 font-medium">Line Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {invoice.lines.map(line => (
                    <tr key={line.id} className="hover:bg-zinc-800/30">
                      <td className="py-2.5 pr-4 text-zinc-200">{line.description}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{line.quantity}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-zinc-300">{formatCurrency(line.unitPrice)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-zinc-400">{formatCurrency(line.taxAmount)}</td>
                      <td className="py-2.5 text-right tabular-nums font-semibold text-emerald-400">{formatCurrency(line.lineAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={3} className="pt-2 text-right text-xs text-zinc-400 pr-4">Subtotal</td>
                    <td className="pt-2 text-right tabular-nums text-zinc-400 pr-4">{formatCurrency(invoice.subtotal)}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="pt-1 text-right text-xs text-zinc-400 pr-4">Tax Amount</td>
                    <td className="pt-1 text-right tabular-nums text-zinc-400 pr-4">{formatCurrency(invoice.taxAmount)}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="pt-1 pb-2 text-right text-xs font-bold text-zinc-200 pr-4">Total Amount</td>
                    <td className="pt-1 pb-2 text-right font-bold text-emerald-400 tabular-nums pr-4">{formatCurrency(invoice.totalAmount)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </details>

          {invoice.settlements.length > 0 && (
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Payment Applications</summary>
              <div className="px-4 pb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                      <th className="text-left pb-2 pr-4 font-medium">Payment No.</th>
                      <th className="text-left pb-2 pr-4 font-medium">Date</th>
                      <th className="text-right pb-2 pr-4 font-medium">Amount Applied</th>
                      <th className="text-right pb-2 font-medium">Discount Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {invoice.settlements.map(s => (
                      <tr key={s.id}>
                        <td className="py-2 pr-4 font-mono text-xs text-blue-400">{s.payment.paymentNumber}</td>
                        <td className="py-2 pr-4 text-zinc-400 text-xs">{new Date(s.settledAt).toLocaleDateString()}</td>
                        <td className="py-2 pr-4 text-right text-emerald-400 tabular-nums">{formatCurrency(s.settledAmount)}</td>
                        <td className="py-2 text-right text-zinc-400 tabular-nums">{formatCurrency(s.discountTaken)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>

        <aside className="w-64 shrink-0 space-y-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Invoice Statistics</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Total Amount</dt>
                <dd className="text-emerald-400 font-semibold tabular-nums">{formatCurrency(invoice.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Paid Amount</dt>
                <dd className="text-zinc-200 tabular-nums">{formatCurrency(invoice.paidAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-700 pt-2">
                <dt className="text-zinc-500">Remaining</dt>
                <dd className={`font-bold tabular-nums ${remaining > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>{formatCurrency(remaining)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Vendor Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-zinc-500 text-xs">Name</dt>
                <dd className="text-zinc-200">{invoice.vendor?.name ?? '—'}</dd>
              </div>
            </dl>
            <Link href={`/purchasing/vendors/${invoice.vendorId}`} className="mt-3 block text-xs text-blue-400 hover:underline">Open Vendor Card</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
