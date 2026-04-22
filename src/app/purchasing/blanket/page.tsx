export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Repeat, Plus } from 'lucide-react'

export default async function BlanketPOPage() {
  const orders = await prisma.blanketPurchaseOrder.findMany({
    include: {
      vendor: { select: { id: true, name: true } },
      lines: { include: { product: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const openCount = orders.filter(o => o.status === 'open').length
  const closedCount = orders.filter(o => o.status === 'closed').length
  const totalValue = orders.filter(o => o.status === 'open').reduce((sum, o) => sum + o.lines.reduce((s, l) => s + l.lineTotal, 0), 0)
  const totalLines = orders.reduce((sum, o) => sum + o.lines.length, 0)

  return (
    <>
      <TopBar title="Blanket Purchase Orders" />
      <main className="flex-1 p-6 overflow-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total BPOs', value: orders.length, color: 'text-zinc-100' },
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

        {/* Table header + action */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Blanket Purchase Orders</h2>
            <p className="text-sm text-zinc-500">{orders.length} orders · {totalLines} total lines</p>
          </div>
          <Link href="/purchasing/blanket/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Blanket PO</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Repeat className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No Blanket Purchase Orders</p>
              <Link href="/purchasing/blanket/new">
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Blanket PO</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Order #</th>
                  <th className="text-left pb-3 font-medium">Vendor</th>
                  <th className="text-left pb-3 font-medium">Period</th>
                  <th className="text-center pb-3 font-medium">Lines</th>
                  <th className="text-right pb-3 font-medium">Total Value</th>
                  <th className="text-right pb-3 font-medium">Received</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map(order => {
                  const totalVal = order.lines.reduce((s, l) => s + l.lineTotal, 0)
                  const totalReceived = order.lines.reduce((s, l) => s + (l.qtyReceived * l.unitCost), 0)
                  const pct = totalVal > 0 ? (totalReceived / totalVal) * 100 : 0
                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs">
                        <Link href={`/purchasing/blanket/${order.id}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">{order.vendor?.name ?? '—'}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {order.startDate ? formatDate(order.startDate) : '—'} → {order.endDate ? formatDate(order.endDate) : 'Open'}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant="outline" className="font-mono text-xs">{order.lines.length}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400">{formatCurrency(totalVal)}</td>
                      <td className="py-3 pr-4 text-right text-xs">
                        <span className={pct >= 100 ? 'text-emerald-400' : pct > 0 ? 'text-amber-400' : 'text-zinc-500'}>
                          {formatCurrency(totalReceived)} ({pct.toFixed(0)}%)
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
