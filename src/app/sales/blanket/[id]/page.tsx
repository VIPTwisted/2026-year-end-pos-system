import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { BlanketSOReleaseForm } from './BlanketSOReleaseForm'

export default async function BlanketSODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.blanketSalesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      store: true,
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { id: 'asc' },
      },
    },
  })
  if (!order) notFound()

  const totalValue = order.lines.reduce((s, l) => s + l.lineTotal, 0)
  const totalShipped = order.lines.reduce((s, l) => s + l.qtyShipped * l.unitPrice, 0)
  const totalRemaining = totalValue - totalShipped

  return (
    <>
      <TopBar title={`Blanket SO ${order.orderNumber}`} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/sales/blanket">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          </Link>
          <Badge variant={order.status === 'open' ? 'default' : 'secondary'} className="capitalize text-sm px-3 py-1">
            {order.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-base text-zinc-100">Order Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Order Number</p>
                  <p className="text-zinc-100 font-mono font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Customer</p>
                  <p className="text-zinc-100">{order.customer.firstName} {order.customer.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Store</p>
                  <p className="text-zinc-100">{order.store.name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Period</p>
                  <p className="text-zinc-100">
                    {order.startDate ? formatDate(order.startDate) : '—'} → {order.endDate ? formatDate(order.endDate) : 'Open'}
                  </p>
                </div>
                {order.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-zinc-500 mb-1">Notes</p>
                    <p className="text-zinc-300">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-base text-zinc-100">Lines ({order.lines.length})</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-center pb-2 font-medium">Ordered</th>
                      <th className="text-center pb-2 font-medium">Shipped</th>
                      <th className="text-center pb-2 font-medium">Remaining</th>
                      <th className="text-right pb-2 font-medium">Unit Price</th>
                      <th className="text-right pb-2 font-medium">Line Total</th>
                      <th className="text-left pb-2 font-medium">Next Ship</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {order.lines.map(line => {
                      const remaining = line.quantity - line.qtyShipped
                      const pct = line.quantity > 0 ? (line.qtyShipped / line.quantity) * 100 : 0
                      return (
                        <tr key={line.id}>
                          <td className="py-2 pr-4">
                            <p className="text-zinc-100">{line.product.name}</p>
                            <p className="text-xs text-zinc-500">{line.product.sku}</p>
                          </td>
                          <td className="py-2 pr-4 text-center text-zinc-100 font-mono">{line.quantity}</td>
                          <td className="py-2 pr-4 text-center">
                            <span className={pct >= 100 ? 'text-emerald-400' : pct > 0 ? 'text-amber-400' : 'text-zinc-500'}>
                              {line.qtyShipped}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-center">
                            <span className={remaining === 0 ? 'text-zinc-500' : 'text-blue-400'}>{remaining}</span>
                          </td>
                          <td className="py-2 pr-4 text-right text-zinc-300">{formatCurrency(line.unitPrice)}</td>
                          <td className="py-2 pr-4 text-right text-emerald-400">{formatCurrency(line.lineTotal)}</td>
                          <td className="py-2 text-xs text-zinc-400">
                            {line.nextShipDate ? formatDate(line.nextShipDate) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="border-t border-zinc-700">
                      <td colSpan={5} className="pt-3 pr-4 text-right text-xs text-zinc-500 font-medium uppercase">Total</td>
                      <td className="pt-3 text-right font-bold text-emerald-400">{formatCurrency(totalValue)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-sm text-zinc-100">Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Value</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(totalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shipped</span>
                  <span className="text-amber-400">{formatCurrency(totalShipped)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-2">
                  <span className="text-zinc-500">Remaining</span>
                  <span className="text-blue-400 font-bold">{formatCurrency(totalRemaining)}</span>
                </div>
              </CardContent>
            </Card>

            {order.status === 'open' && (
              <BlanketSOReleaseForm orderId={order.id} lines={order.lines.map(l => ({
                id: l.id,
                productName: l.product.name,
                sku: l.product.sku,
                quantity: l.quantity,
                qtyShipped: l.qtyShipped,
                unitPrice: l.unitPrice,
              }))} />
            )}
          </div>
        </div>
      </main>
    </>
  )
}
