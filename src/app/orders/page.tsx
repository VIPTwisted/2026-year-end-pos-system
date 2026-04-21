import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  paid: 'success', pending: 'warning', refunded: 'destructive', voided: 'secondary',
}

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, store: true, items: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <>
      <TopBar title="Orders" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">Order History</h2>
          <p className="text-sm text-zinc-500">{orders.length} orders</p>
        </div>
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No orders yet — make a sale in POS Terminal</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Order #</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-right pb-3 font-medium">Items</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-left pb-3 font-medium">Payment</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(o.createdAt)}</td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Walk-in'}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{o.items.length}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-400">{formatCurrency(o.totalAmount)}</td>
                    <td className="py-3 pr-4 text-zinc-400 capitalize">{o.paymentMethod || '-'}</td>
                    <td className="py-3 text-center">
                      <Badge variant={STATUS_VARIANT[o.status] || 'secondary'}>{o.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
