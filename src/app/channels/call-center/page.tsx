export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Phone, ShoppingCart, RotateCcw, RefreshCw, Shield, FileText, AlertTriangle, Plus, ChevronRight } from 'lucide-react'

export default async function ChannelCallCenterHub() {
  const [orders, rmas, continuity] = await Promise.all([
    prisma.callCenterOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.callCenterRMA.findMany({ where: { status: { in: ['pending', 'approved'] } } }),
    prisma.callCenterContinuity.findMany({ where: { status: 'active' } }),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today).length
  const onHold = orders.filter(o => o.status === 'on-hold').length
  const fraudHolds = orders.filter(o => o.status === 'fraud-hold').length

  const kpiCards = [
    { label: "Today's Orders", value: todayOrders, icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'On Hold', value: onHold, icon: AlertTriangle, color: 'text-orange-400' },
    { label: 'Fraud Holds', value: fraudHolds, icon: Shield, color: 'text-red-400' },
    { label: 'Active Continuity', value: continuity.length, icon: RefreshCw, color: 'text-green-400' },
    { label: 'Open RMAs', value: rmas.length, icon: RotateCcw, color: 'text-purple-400' },
  ]

  const quickLinks = [
    { label: 'All Orders', href: '/channels/call-center/orders', icon: ShoppingCart },
    { label: 'New Order', href: '/call-center/orders/new', icon: Plus },
    { label: 'RMA Management', href: '/call-center/rmas', icon: RotateCcw },
    { label: 'Continuity Programs', href: '/call-center/continuity', icon: RefreshCw },
    { label: 'Agent Scripts', href: '/call-center/scripts', icon: FileText },
    { label: 'Fraud Rules', href: '/call-center/fraud-rules', icon: Shield },
  ]

  const STATUS_BADGE: Record<string, string> = {
    draft: 'bg-zinc-700/60 text-zinc-300',
    submitted: 'bg-blue-500/20 text-blue-400',
    'on-hold': 'bg-orange-500/20 text-orange-400',
    'fraud-hold': 'bg-red-500/20 text-red-400',
    cancelled: 'bg-zinc-600/50 text-zinc-400',
    fulfilled: 'bg-green-500/20 text-green-400',
  }

  const CHANNEL_BADGE: Record<string, string> = {
    phone: 'bg-blue-500/20 text-blue-400',
    chat: 'bg-green-500/20 text-green-400',
    email: 'bg-yellow-500/20 text-yellow-400',
    web: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Phone className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Call Center</h1>
            <p className="text-xs text-zinc-500">NovaPOS Commerce — order entry, holds, RMAs, continuity</p>
          </div>
        </div>
        <Link
          href="/call-center/orders/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
        >
          <Plus className="w-3 h-3" /> New Order
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-6 gap-3">
        {quickLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 bg-[#16213e] border border-zinc-800/50 hover:border-zinc-600 rounded-lg px-3 py-2.5 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{label}</span>
            <ChevronRight className="w-3 h-3 ml-auto shrink-0 text-zinc-600" />
          </Link>
        ))}
      </div>

      {/* Recent orders preview */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/50">
          <h2 className="text-sm font-semibold text-zinc-100">Recent Orders</h2>
          <Link href="/channels/call-center/orders" className="text-xs text-blue-400 hover:text-blue-300">
            View all →
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-600 text-sm">No orders yet</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800/50">
                {['Order #', 'Agent', 'Channel', 'Total', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-2.5 text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-blue-400">
                    <Link href={`/call-center/orders/${order.id}`} className="hover:text-blue-300">
                      {order.orderNumber.slice(0, 12)}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-300">{order.agentName ?? <span className="text-zinc-600">—</span>}</td>
                  <td className="px-5 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${CHANNEL_BADGE[order.channel] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {order.channel}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-200 font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
