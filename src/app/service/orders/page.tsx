import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wrench, Plus, AlertTriangle, ChevronRight } from 'lucide-react'

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  urgent: 'destructive',
  high: 'warning',
  normal: 'default',
  low: 'secondary',
}

const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success' | 'secondary' | 'destructive'> = {
  open: 'warning',
  'in-progress': 'default',
  'on-hold': 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

export default async function ServiceOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const statusFilter = sp.status ?? ''
  const techFilter = sp.tech ?? ''

  const orders = await prisma.serviceOrder.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(techFilter ? { assignedTech: techFilter } : {}),
    },
    include: { customer: true, serviceItem: true },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const open = orders.filter(o => o.status === 'open').length
  const inProgress = orders.filter(o => o.status === 'in-progress').length
  const overdue = orders.filter(o =>
    o.dueDate && o.dueDate < now && !['completed', 'cancelled'].includes(o.status)
  ).length
  const completedToday = orders.filter(o => {
    if (!o.completedAt) return false
    const d = o.completedAt
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  }).length

  return (
    <>
      <TopBar title="Service Orders" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open</p>
            <p className={`text-2xl font-bold ${open > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>{open}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-400">{inProgress}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Overdue</p>
            <p className={`text-2xl font-bold ${overdue > 0 ? 'text-red-400' : 'text-zinc-400'}`}>{overdue}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Completed Today</p>
            <p className="text-2xl font-bold text-emerald-400">{completedToday}</p>
          </CardContent></Card>
        </div>

        {/* Filters + header */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-zinc-100">Orders</h2>
              <div className="flex gap-1">
                {['', 'open', 'in-progress', 'on-hold', 'completed', 'cancelled'].map(s => (
                  <Link
                    key={s}
                    href={s ? `/service/orders?status=${s}` : '/service/orders'}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      statusFilter === s
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {s || 'All'}
                  </Link>
                ))}
              </div>
            </div>
            <Button asChild>
              <Link href="/service/orders/new">
                <Plus className="w-4 h-4 mr-1" />
                New Order
              </Link>
            </Button>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Wrench className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No service orders</p>
                <Button asChild variant="outline">
                  <Link href="/service/orders/new">Create First Order</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Order #</th>
                    <th className="text-left pb-3 font-medium">Customer</th>
                    <th className="text-left pb-3 font-medium">Item</th>
                    <th className="text-left pb-3 font-medium max-w-[180px]">Description</th>
                    <th className="text-left pb-3 font-medium">Tech</th>
                    <th className="text-center pb-3 font-medium">Priority</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Due</th>
                    <th className="text-right pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.map(o => {
                    const isOverdue = o.dueDate && o.dueDate < now && !['completed', 'cancelled'].includes(o.status)
                    return (
                      <tr key={o.id} className="hover:bg-zinc-900/50 transition-colors group">
                        <td className="py-3 pr-4 font-mono text-xs">
                          <Link href={`/service/orders/${o.id}`} className="font-medium text-zinc-100 group-hover:text-blue-300 transition-colors">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-zinc-300 text-xs">
                          {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs max-w-[120px] truncate">
                          {o.serviceItem?.description ?? '—'}
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs max-w-[180px] truncate">
                          {o.description}
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">
                          {o.assignedTech ?? <span className="text-zinc-700">Unassigned</span>}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <Badge variant={PRIORITY_VARIANT[o.priority] ?? 'secondary'} className="capitalize text-xs">
                            {o.priority}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'} className="capitalize text-xs">
                            {o.status.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {o.dueDate ? (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
                              {isOverdue && <AlertTriangle className="w-3 h-3" />}
                              {formatDate(o.dueDate)}
                            </span>
                          ) : (
                            <span className="text-zinc-700">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/service/orders/${o.id}`}>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
