import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ShoppingCart, CreditCard, MapPin, Truck } from 'lucide-react'
import { OnlineOrderActions } from './OnlineOrderActions'

const BADGE_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  pending: 'warning',
  confirmed: 'default',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
  returned: 'destructive',
}

export default async function OnlineOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.onlineOrder.findUnique({
    where: { id },
    include: {
      channel: true,
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
      payments: true,
    },
  })
  if (!order) notFound()

  const shippingAddr = order.shippingAddress as Record<string, string> | null
  const billingAddr = order.billingAddress as Record<string, string> | null

  return (
    <>
      <TopBar title={`Order ${order.orderNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/ecommerce/orders"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Online Orders
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-mono text-zinc-100">{order.orderNumber}</span>
                  <Badge variant={BADGE_VARIANT[order.status] ?? 'secondary'} className="capitalize">
                    {order.status}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">{order.fulfillmentType}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span>Channel: <span className="text-zinc-300">{order.channel.name}</span></span>
                  {order.customer && (
                    <span>Customer: <Link href={`/customers/${order.customer.id}`} className="text-blue-400 hover:underline">{order.customer.firstName} {order.customer.lastName}</Link></span>
                  )}
                  {order.guestEmail && <span>Guest: <span className="text-zinc-300">{order.guestName ?? order.guestEmail}</span></span>}
                  <span>Date: <span className="text-zinc-300">{formatDate(order.createdAt)}</span></span>
                  {order.trackingNumber && (
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span className="text-zinc-300 font-mono">{order.trackingNumber}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 text-center">
                {[
                  { label: 'Subtotal', value: formatCurrency(order.subtotal) },
                  { label: 'Shipping', value: formatCurrency(order.shippingCost) },
                  { label: 'Tax', value: formatCurrency(order.taxAmount) },
                  { label: 'Total', value: formatCurrency(order.total), highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-zinc-200'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <OnlineOrderActions orderId={order.id} status={order.status} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Line Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-zinc-400" />
                  Line Items ({order.lines.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Product', 'SKU', 'Qty', 'Unit Price', 'Total', 'Fulfillment'].map(h => (
                        <th key={h} className={`px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Product' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.lines.map(line => (
                      <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30">
                        <td className="px-4 py-2.5 text-zinc-100">{line.product.name}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-zinc-500">{line.product.sku}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-300">{line.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-400">{formatCurrency(line.unitPrice)}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-400 font-semibold">{formatCurrency(line.lineTotal)}</td>
                        <td className="px-4 py-2.5 text-right text-xs text-zinc-500 capitalize">{line.fulfillmentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700">
                      <td colSpan={4} className="px-4 py-2.5 text-right text-xs text-zinc-500 uppercase tracking-wide">Order Total</td>
                      <td className="px-4 py-2.5 text-right text-zinc-100 font-bold">{formatCurrency(order.total)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5" /> Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {shippingAddr ? (
                    <div className="text-xs text-zinc-300 space-y-0.5">
                      {shippingAddr.name && <p className="font-medium">{shippingAddr.name}</p>}
                      {shippingAddr.line1 && <p>{shippingAddr.line1}</p>}
                      {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
                      {(shippingAddr.city || shippingAddr.state || shippingAddr.zip) && (
                        <p>{[shippingAddr.city, shippingAddr.state, shippingAddr.zip].filter(Boolean).join(', ')}</p>
                      )}
                      {shippingAddr.country && <p>{shippingAddr.country}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600">No shipping address</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5" /> Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {billingAddr ? (
                    <div className="text-xs text-zinc-300 space-y-0.5">
                      {billingAddr.name && <p className="font-medium">{billingAddr.name}</p>}
                      {billingAddr.line1 && <p>{billingAddr.line1}</p>}
                      {billingAddr.line2 && <p>{billingAddr.line2}</p>}
                      {(billingAddr.city || billingAddr.state || billingAddr.zip) && (
                        <p>{[billingAddr.city, billingAddr.state, billingAddr.zip].filter(Boolean).join(', ')}</p>
                      )}
                      {billingAddr.country && <p>{billingAddr.country}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600">No billing address</p>
                  )}
                </CardContent>
              </Card>
            </div>
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
                      <p className="text-xs text-zinc-300 capitalize">{pmt.method.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-zinc-600">{formatDate(pmt.createdAt)}</p>
                      {pmt.reference && <p className="text-xs font-mono text-zinc-600">{pmt.reference}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{formatCurrency(pmt.amount)}</p>
                      <Badge variant={pmt.status === 'captured' ? 'success' : pmt.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs capitalize">
                        {pmt.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  )
}
