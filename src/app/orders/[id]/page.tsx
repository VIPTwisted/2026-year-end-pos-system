import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ShoppingCart, CreditCard, Store } from 'lucide-react'
import { OrderActions } from './OrderActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  paid: 'success', pending: 'warning', refunded: 'destructive', voided: 'secondary',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      store: { select: { id: true, name: true, address: true, city: true, state: true } },
      items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      payments: true,
    },
  })

  if (!order) notFound()

  const canVoid = ['pending', 'paid'].includes(order.status)

  return (
    <>
      <TopBar title={`Order ${order.orderNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Orders
        </Link>

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-mono text-zinc-100">{order.orderNumber}</span>
                  <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    {order.store.name}
                  </span>
                  {order.customer && (
                    <span>
                      Customer:{' '}
                      <Link href={`/customers/${order.customer.id}`} className="text-blue-400 hover:underline">
                        {order.customer.firstName} {order.customer.lastName}
                      </Link>
                    </span>
                  )}
                  <span>Date: <span className="text-zinc-300">{formatDate(order.createdAt)}</span></span>
                  {order.paymentMethod && (
                    <span className="capitalize">Method: <span className="text-zinc-300">{order.paymentMethod}</span></span>
                  )}
                </div>
                {order.notes && <p className="text-xs text-zinc-500 italic">{order.notes}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 text-center">
                {[
                  { label: 'Subtotal', value: formatCurrency(order.subtotal) },
                  { label: 'Tax', value: formatCurrency(order.taxAmount) },
                  { label: 'Discount', value: formatCurrency(order.discountAmount) },
                  { label: 'Total', value: formatCurrency(order.totalAmount), highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-zinc-200'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {canVoid && (
              <div className="mt-5 pt-4 border-t border-zinc-800">
                <OrderActions orderId={order.id} status={order.status} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Line Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-zinc-400" />
                  Line Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Product','SKU','Qty','Unit Price','Tax','Total'].map(h => (
                        <th key={h} className={`px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Product' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-2.5 text-zinc-100">{item.productName}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-zinc-500">{item.sku}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-300">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-400">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-500">{formatCurrency(item.taxAmount)}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-400 font-semibold">{formatCurrency(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700">
                      <td colSpan={5} className="px-4 py-2.5 text-right text-xs text-zinc-500 uppercase tracking-wide">Order Total</td>
                      <td className="px-4 py-2.5 text-right text-zinc-100 font-bold">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Payments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-400" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.payments.length === 0 ? (
                <p className="text-xs text-zinc-600">No payments recorded.</p>
              ) : (
                order.payments.map(pmt => (
                  <div key={pmt.id} className="flex items-center justify-between border-b border-zinc-800/50 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="text-xs text-zinc-300 capitalize">{pmt.method}</p>
                      <p className="text-xs text-zinc-600">{formatDate(pmt.createdAt)}</p>
                      {pmt.reference && <p className="text-xs font-mono text-zinc-600">{pmt.reference}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{formatCurrency(pmt.amount)}</p>
                      <Badge variant={pmt.status === 'completed' ? 'success' : 'secondary'} className="text-xs capitalize">
                        {pmt.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
              {order.amountTendered && (
                <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-500">
                  <div className="flex justify-between"><span>Tendered</span><span>{formatCurrency(order.amountTendered)}</span></div>
                  <div className="flex justify-between mt-1"><span>Change</span><span>{formatCurrency(order.changeDue ?? 0)}</span></div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  )
}
