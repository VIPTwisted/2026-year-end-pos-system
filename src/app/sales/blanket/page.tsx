import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Repeat, Plus } from 'lucide-react'

export default async function BlanketSOPage() {
  const orders = await prisma.blanketSalesOrder.findMany({
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      store: { select: { id: true, name: true } },
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const openCount = orders.filter(o => o.status === 'open').length
  const closedCount = orders.filter(o => o.status === 'closed').length
  const totalValue = orders.filter(o => o.status === 'open').reduce((sum, o) => sum + o.lines.reduce((s, l) => s + l.lineTotal, 0), 0)

  return (
    <>
      <TopBar title="Blanket Sales Orders" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total BSOs', value: orders.length, color: 'text-zinc-100' },
            { label: 'Open', value: openCount, color: 'text-blue-400' },
            { label: 'Closed', value: closedCount, color: 'text-zinc-500' },
            { label: 'Open Value', value: formatCurrency(totalValue), color: 'text-emerald-400' },
          ].map(k => (
            <Card key={k.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{k.label}</p>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Blanket Sales Orders</h2>
            <p className="text-sm text-zinc-500">{orders.length} orders</p>
          </div>
          <Link href="/sales/blanket/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Blanket SO</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Repeat className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No Blanket Sales Orders</p>
              <Link href="/sales/blanket/new">
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Blanket SO</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Order #</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Store</th>
                  <th className="text-left pb-3 font-medium">Period</th>
                  <th className="text-center pb-3 font-medium">Lines</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-right pb-3 font-medium">Shipped</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map(order => {
                  const total = order.lines.reduce((s, l) => s + l.lineTotal, 0)
                  const shipped = order.lines.reduce((s, l) => s + l.qtyShipped * l.unitPrice, 0)
                  const pct = total > 0 ? (shipped / total) * 100 : 0
                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs">
                        <Link href={`/sales/blanket/${order.id}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{order.store.name}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {order.startDate ? formatDate(order.startDate) : '—'} → {order.endDate ? formatDate(order.endDate) : 'Open'}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant="outline" className="font-mono text-xs">{order.lines.length}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400">{formatCurrency(total)}</td>
                      <td className="py-3 pr-4 text-right text-xs">
                        <span className={pct >= 100 ? 'text-emerald-400' : pct > 0 ? 'text-amber-400' : 'text-zinc-500'}>
                          {formatCurrency(shipped)} ({pct.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={order.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
