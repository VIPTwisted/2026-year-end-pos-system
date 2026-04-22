import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ExternalLink, Plus, Package, Truck, CheckCircle, DollarSign } from 'lucide-react'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  open: 'default',
  sent: 'warning',
  received: 'success',
  closed: 'secondary',
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-600',
  sent: 'bg-amber-600',
  received: 'bg-emerald-600',
  closed: 'bg-zinc-600',
}

export default async function SubcontractingPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [orders, monthOrders] = await Promise.all([
    prisma.subcontractingOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: { select: { id: true, name: true, vendorCode: true } },
      },
    }),
    prisma.subcontractingOrder.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { totalCost: true },
    }),
  ])

  const openCount = orders.filter(o => o.status === 'open').length
  const sentCount = orders.filter(o => o.status === 'sent').length
  const receivedCount = orders.filter(o => o.status === 'received').length
  const monthCost = monthOrders.reduce((s, o) => s + o.totalCost, 0)

  const kpis = [
    { label: 'Open Orders', value: openCount, icon: Package, color: 'text-blue-400' },
    { label: 'Sent to Vendor', value: sentCount, icon: Truck, color: 'text-amber-400' },
    { label: 'Received', value: receivedCount, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'This Month Cost', value: formatCurrency(monthCost), icon: DollarSign, color: 'text-violet-400' },
  ]

  return (
    <>
      <TopBar title="Subcontracting" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Subcontracting Orders</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Outsourced manufacturing operations</p>
          </div>
          <Link href="/manufacturing/subcontracting/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> New Order
            </Button>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map(k => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">{k.label}</div>
                    <div className="text-xl font-bold text-zinc-100">{k.value}</div>
                  </div>
                  <k.icon className={`w-5 h-5 ${k.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Order #</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Vendor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Prod. Order</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Operation</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Qty</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Unit Cost</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Expected</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-zinc-600">
                        No subcontracting orders yet
                      </td>
                    </tr>
                  )}
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/manufacturing/subcontracting/${o.id}`}
                          className="font-mono text-blue-400 hover:text-blue-300 transition-colors text-xs"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{o.vendor.name}</td>
                      <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{o.productionOrderId ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-400">{o.operationNo ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-300">{o.quantity} {o.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-right text-zinc-300">{formatCurrency(o.unitCost)}</td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-100">{formatCurrency(o.totalCost)}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {o.expectedDate ? formatDate(o.expectedDate) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[o.status]}`} />
                          <Badge variant={STATUS_BADGE[o.status] ?? 'secondary'} className="text-xs capitalize">
                            {o.status}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
