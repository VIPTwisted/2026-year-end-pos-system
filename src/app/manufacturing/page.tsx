export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import {
  Cpu, ClipboardList, Layers, GitBranch, Settings2, TrendingUp,
} from 'lucide-react'

const STATUS_CHIP: Record<string, string> = {
  simulated: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  planned: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  firm_planned: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  released: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  finished: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const STATUS_BAR: Record<string, string> = {
  simulated: 'bg-zinc-600',
  planned: 'bg-blue-600',
  firm_planned: 'bg-amber-600',
  released: 'bg-orange-600',
  finished: 'bg-emerald-600',
}

function StatusChip({ status }: { status: string }) {
  const cls = STATUS_CHIP[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default async function ManufacturingPage() {
  const [orders, totalWC] = await Promise.all([
    prisma.productionOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        store: { select: { name: true } },
      },
      take: 20,
    }),
    prisma.workCenter.count(),
  ])

  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const openOrders = orders.filter(o => !['finished'].includes(o.status)).length
  const releasedOrders = orders.filter(o => o.status === 'released').length
  const finishingThisWeek = orders.filter(
    o => o.status === 'released' && o.dueDate && o.dueDate >= now && o.dueDate <= weekEnd,
  ).length
  const finishedThisMonth = orders.filter(
    o =>
      o.status === 'finished' &&
      o.updatedAt >= monthStart &&
      o.updatedAt <= monthEnd,
  ).length

  const statusCounts = ['simulated', 'planned', 'firm_planned', 'released', 'finished'].map(s => ({
    status: s,
    count: orders.filter(o => o.status === s).length,
    label: s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }))
  const maxCount = Math.max(...statusCounts.map(s => s.count), 1)

  const kpis = [
    { label: 'Open Orders', value: openOrders, icon: ClipboardList, color: 'text-blue-400' },
    { label: 'Released', value: releasedOrders, icon: TrendingUp, color: 'text-amber-400' },
    { label: 'Due This Week', value: finishingThisWeek, icon: Cpu, color: 'text-orange-400' },
    { label: 'Finished This Month', value: finishedThisMonth, icon: Settings2, color: 'text-emerald-400' },
  ]

  const quickLinks = [
    { label: 'Production Orders', href: '/manufacturing/production-orders', icon: ClipboardList, desc: 'Manage production runs' },
    { label: 'Bills of Material', href: '/manufacturing/boms', icon: Layers, desc: 'Component assemblies' },
    { label: 'Routings', href: '/manufacturing/routings', icon: GitBranch, desc: 'Operation sequences' },
    { label: 'Work Centers', href: '/manufacturing/work-centers', icon: Settings2, desc: `${totalWC} configured` },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Manufacturing" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-zinc-800/60 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Status Breakdown */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Order Status Breakdown</h3>
            <div className="space-y-3">
              {statusCounts.map(({ status, count, label }) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-zinc-400">{label}</span>
                    <span className="text-[13px] font-semibold text-zinc-300">{count}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${STATUS_BAR[status]}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Quick Access</h3>
            <div className="space-y-2">
              {quickLinks.map(({ label, href, icon: Icon, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors group"
                >
                  <Icon className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  <div>
                    <p className="text-[13px] font-medium text-zinc-300 group-hover:text-zinc-100">{label}</p>
                    <p className="text-[11px] text-zinc-600">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-zinc-800/30">
              <ClipboardList className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Recent Orders</h3>
              <Link href="/manufacturing/production-orders" className="ml-auto text-xs text-blue-400 hover:text-blue-300 hover:underline">
                View all
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="px-5 py-5 text-[13px] text-zinc-600">No production orders yet.</p>
            ) : (
              <div className="divide-y divide-zinc-800/30">
                {orders.slice(0, 8).map(order => (
                  <Link
                    key={order.id}
                    href={`/manufacturing/production-orders/${order.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-mono text-zinc-300 truncate">{order.orderNumber}</p>
                      <p className="text-[11px] text-zinc-600 truncate">{order.product.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusChip status={order.status} />
                      {order.dueDate && (
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          Due {new Date(order.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Full Recent Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800/30">
            <ClipboardList className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Production Orders</h3>
            <Link href="/manufacturing/production-orders/new" className="ml-auto">
              <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                + New Order
              </button>
            </Link>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Order #', 'Product', 'Qty', 'Due Date', 'Store', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                    No production orders.{' '}
                    <Link href="/manufacturing/production-orders/new" className="text-blue-400 hover:text-blue-300 hover:underline">Create one</Link>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/manufacturing/production-orders/${order.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-zinc-300">{order.product.name}</p>
                      <p className="text-[11px] text-zinc-600">{order.product.sku}</p>
                    </td>
                    <td className="px-4 py-2 text-zinc-300">
                      {order.quantity} {order.unitOfMeasure}
                    </td>
                    <td className="px-4 py-2 text-zinc-500">
                      {order.dueDate ? formatDate(order.dueDate) : '—'}
                    </td>
                    <td className="px-4 py-2 text-zinc-400">{order.store?.name ?? '—'}</td>
                    <td className="px-4 py-2">
                      <StatusChip status={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
