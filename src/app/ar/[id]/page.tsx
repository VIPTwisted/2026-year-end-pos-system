export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ARInvoiceActions } from './ARInvoiceActions'

function statusBadge(status: string) {
  const map: Record<string, 'secondary' | 'default' | 'success' | 'warning' | 'destructive'> = {
    draft: 'secondary',
    posted: 'default',
    paid: 'success',
    partial: 'warning',
    cancelled: 'destructive',
  }
  return <Badge variant={map[status] ?? 'secondary'}>{status}</Badge>
}

export default async function ARInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: true,
      settlements: { orderBy: { settledAt: 'desc' } },
    },
  })

  if (!invoice) notFound()

  const balance = invoice.totalAmount - invoice.paidAmount
  const now = new Date()
  const overdue =
    invoice.dueDate < now && !['paid', 'cancelled'].includes(invoice.status)

  return (
    <>
      <TopBar title={`Invoice ${invoice.invoiceNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

              {/* Invoice Identity */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-zinc-100">
                    {invoice.invoiceNumber}
                  </span>
                  {statusBadge(invoice.status)}
                  <Badge variant="secondary" className="capitalize">
                    {invoice.invoiceType === 'free_text' ? 'Free Text' : 'Sales'}
                  </Badge>
                </div>
                <div className="text-sm text-zinc-400">
                  <span className="font-semibold text-zinc-200">
                    {invoice.customer.firstName} {invoice.customer.lastName}
                  </span>
                  {invoice.customer.email && (
                    <span className="text-zinc-500 ml-2">{invoice.customer.email}</span>
                  )}
                  {invoice.customer.phone && (
                    <span className="text-zinc-500 ml-2">{invoice.customer.phone}</span>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-zinc-500 mt-2">
                  <span>
                    Invoice Date:{' '}
                    <span className="text-zinc-300">
                      {new Date(invoice.invoiceDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </span>
                  </span>
                  <span>
                    Due:{' '}
                    <span className={overdue ? 'text-red-400 font-semibold' : 'text-zinc-300'}>
                      {new Date(invoice.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      {overdue && ' — OVERDUE'}
                    </span>
                  </span>
                  <span>
                    Posted:{' '}
                    <span className="text-zinc-300">
                      {new Date(invoice.postingDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </span>
                  </span>
                </div>
                {invoice.notes && (
                  <p className="text-xs text-zinc-500 mt-2 italic">{invoice.notes}</p>
                )}
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Subtotal</p>
                  <p className="text-lg font-semibold text-zinc-200">{formatCurrency(invoice.subtotal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Tax</p>
                  <p className="text-lg font-semibold text-zinc-200">{formatCurrency(invoice.taxAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total</p>
                  <p className="text-lg font-bold text-zinc-100">{formatCurrency(invoice.totalAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Paid</p>
                  <p className="text-lg font-semibold text-emerald-400">{formatCurrency(invoice.paidAmount)}</p>
                </div>
              </div>
            </div>

            {/* Balance row */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Balance Remaining</span>
              <span
                className={`text-3xl font-bold ${
                  balance <= 0
                    ? 'text-emerald-400'
                    : overdue
                    ? 'text-red-400'
                    : 'text-amber-400'
                }`}
              >
                {formatCurrency(balance)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Description</th>
                  <th className="text-right pb-3 font-medium">Qty</th>
                  <th className="text-right pb-3 font-medium">Unit Price</th>
                  <th className="text-right pb-3 font-medium">Tax</th>
                  <th className="text-right pb-3 font-medium">Line Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {invoice.lines.map(line => (
                  <tr key={line.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 text-zinc-100">{line.description}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{line.quantity}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{formatCurrency(line.unitPrice)}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{formatCurrency(line.taxAmount)}</td>
                    <td className="py-3 text-right text-emerald-400 font-semibold">
                      {formatCurrency(line.lineAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td colSpan={3} />
                  <td className="py-3 pr-4 text-right text-xs text-zinc-500 uppercase tracking-wide">Subtotal</td>
                  <td className="py-3 text-right text-zinc-200 font-semibold">{formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} />
                  <td className="py-2 pr-4 text-right text-xs text-zinc-500 uppercase tracking-wide">Tax</td>
                  <td className="py-2 text-right text-zinc-200 font-semibold">{formatCurrency(invoice.taxAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={3} />
                  <td className="py-3 pr-4 text-right text-xs text-zinc-500 uppercase tracking-wide font-bold">Total</td>
                  <td className="py-3 text-right text-zinc-100 font-bold text-base">{formatCurrency(invoice.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Payment History */}
        {invoice.settlements.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-left pb-3 font-medium">Reference</th>
                    <th className="text-right pb-3 font-medium">Amount Applied</th>
                    <th className="text-right pb-3 font-medium">Discount Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {invoice.settlements.map(s => (
                    <tr key={s.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {formatDate(s.settledAt)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-300 font-mono text-xs">
                        {s.paymentRef || <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-right text-emerald-400 font-semibold">
                        {formatCurrency(s.settledAmount)}
                      </td>
                      <td className="py-3 text-right text-amber-400">
                        {s.discountTaken > 0 ? formatCurrency(s.discountTaken) : <span className="text-zinc-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Actions: Post / Record Payment */}
        <ARInvoiceActions
          invoiceId={invoice.id}
          status={invoice.status}
          totalAmount={invoice.totalAmount}
          paidAmount={invoice.paidAmount}
        />

      </main>
    </>
  )
}
