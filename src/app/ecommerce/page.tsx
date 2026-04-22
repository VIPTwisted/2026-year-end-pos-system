import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Globe, ShoppingCart, Clock, Star } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400',
  confirmed: 'text-blue-400',
  processing: 'text-indigo-400',
  shipped: 'text-cyan-400',
  delivered: 'text-emerald-400',
  cancelled: 'text-red-400',
  returned: 'text-rose-400',
}

const STATUS_BAR: Record<string, string> = {
  pending: 'bg-amber-400',
  confirmed: 'bg-blue-400',
  processing: 'bg-indigo-400',
  shipped: 'bg-cyan-400',
  delivered: 'bg-emerald-400',
  cancelled: 'bg-red-400',
  returned: 'bg-rose-400',
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  processing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  shipped: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  returned: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
}

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default async function ECommerceDashboard() {
  const [orders, pendingRatings] = await Promise.all([
    prisma.onlineOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        channel: { select: { id: true, name: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.productRating.count({ where: { isApproved: false } }),
  ])

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const recentOrders = orders.slice(0, 20)

  const statusCounts: Record<string, number> = {}
  for (const s of ORDER_STATUSES) {
    statusCounts[s] = orders.filter(o => o.status === s).length
  }
  const maxCount = Math.max(...Object.values(statusCounts), 1)

  const kpis = [
    { label: 'Total Online Orders', value: orders.length.toString(), accent: 'bg-blue-500' },
    { label: 'Online Revenue', value: formatCurrency(totalRevenue), accent: 'bg-emerald-500' },
    { label: 'Pending Orders', value: pendingOrders.toString(), accent: 'bg-amber-500' },
    { label: 'Pending Reviews', value: pendingRatings.toString(), accent: 'bg-yellow-500' },
  ]

  return (
    <>
      <TopBar title="E-Commerce" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">E-Commerce Dashboard</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{orders.length} total online orders</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/ecommerce/orders"
              className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
            >
              View Orders
            </Link>
            <Link
              href="/ecommerce/channels"
              className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
            >
              Channels
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {kpis.map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className={`h-[3px] w-full ${k.accent}`} />
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{k.label}</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Breakdown */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">Order Status Breakdown</h3>
            <div className="space-y-3">
              {ORDER_STATUSES.map(s => (
                <div key={s} className="flex items-center gap-3">
                  <span className={`text-[11px] font-medium w-20 capitalize ${STATUS_COLORS[s] ?? 'text-zinc-400'}`}>{s}</span>
                  <div className="flex-1 bg-zinc-800 rounded-r h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-r ${STATUS_BAR[s] ?? 'bg-zinc-500'}`}
                      style={{ width: `${(statusCounts[s] / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 w-6 text-right tabular-nums">{statusCounts[s]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links placeholder spanning 2 cols */}
          <div className="lg:col-span-2 bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 flex flex-col justify-center items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-zinc-700" />
            <p className="text-[13px] text-zinc-500">Recent orders listed below</p>
            <Link href="/ecommerce/orders" className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors">
              View all online orders →
            </Link>
          </div>
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Recent Orders</span>
          <div className="flex-1 h-px bg-zinc-800/60" />
          <Link href="/ecommerce/orders" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
        </div>

        {/* Recent Orders table */}
        {recentOrders.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12 text-zinc-500">
            <ShoppingCart className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-[13px]">No online orders yet</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Order #</th>
                    <th className="text-left py-2.5 font-medium">Channel</th>
                    <th className="text-left py-2.5 font-medium">Customer / Guest</th>
                    <th className="text-right py-2.5 font-medium">Total</th>
                    <th className="text-center py-2.5 font-medium">Status</th>
                    <th className="text-right px-4 py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, idx) => (
                    <tr
                      key={o.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== recentOrders.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-[13px] text-blue-400">
                        <Link href={`/ecommerce/orders/${o.id}`} className="hover:underline">{o.orderNumber}</Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-[11px]">{o.channel.name}</td>
                      <td className="py-2.5 pr-4 text-zinc-300 text-[13px]">
                        {o.customer
                          ? `${o.customer.firstName} ${o.customer.lastName}`
                          : (o.guestName || o.guestEmail || 'Guest')}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-emerald-400 tabular-nums">{formatCurrency(o.total)}</td>
                      <td className="py-2.5 pr-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${STATUS_BADGE[o.status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-500 text-[11px]">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
