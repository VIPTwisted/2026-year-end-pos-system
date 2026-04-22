'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Phone, ShoppingCart, RotateCcw, RefreshCw, Shield, FileText,
  AlertTriangle, Plus, ChevronRight,
} from 'lucide-react'

type CCOrder = {
  id: string
  orderNumber: string
  customerId: string | null
  agentName: string | null
  channel: string
  status: string
  total: number
  fraudScore: number
  createdAt: string
}

const CHANNEL_BADGE: Record<string, string> = {
  phone: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  chat: 'bg-green-500/20 text-green-400 border border-green-500/30',
  email: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  web: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  submitted: 'bg-blue-500/20 text-blue-400',
  'on-hold': 'bg-orange-500/20 text-orange-400',
  'fraud-hold': 'bg-red-500/20 text-red-400',
  cancelled: 'bg-zinc-600 text-zinc-400',
  fulfilled: 'bg-green-500/20 text-green-400',
}

const QUICK_LINKS = [
  { label: 'New Order', href: '/call-center/orders/new', Icon: Plus },
  { label: 'RMA Management', href: '/call-center/rmas', Icon: RotateCcw },
  { label: 'Continuity Programs', href: '/call-center/continuity', Icon: RefreshCw },
  { label: 'Fraud Rules', href: '/call-center/fraud-rules', Icon: Shield },
  { label: 'Agent Scripts', href: '/call-center/scripts', Icon: FileText },
]

export default function CallCenterHub() {
  const [orders, setOrders] = useState<CCOrder[]>([])
  const [kpis, setKpis] = useState({ todayOrders: 0, onHold: 0, fraudHolds: 0, activeContinuity: 0, openRmas: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, rmasRes, continuityRes] = await Promise.all([
          fetch('/api/call-center/orders?limit=20'),
          fetch('/api/call-center/rmas'),
          fetch('/api/call-center/continuity?status=active'),
        ])
        const ordersData = await ordersRes.json()
        const rmasData: { status: string }[] = await rmasRes.json()
        const continuityData: unknown[] = await continuityRes.json()
        const allOrders: CCOrder[] = ordersData.orders ?? []
        setOrders(allOrders)
        const today = new Date().toDateString()
        setKpis({
          todayOrders: allOrders.filter((o) => new Date(o.createdAt).toDateString() === today).length,
          onHold: allOrders.filter((o) => o.status === 'on-hold').length,
          fraudHolds: allOrders.filter((o) => o.status === 'fraud-hold').length,
          activeContinuity: Array.isArray(continuityData) ? continuityData.length : 0,
          openRmas: Array.isArray(rmasData) ? rmasData.filter((r) => r.status === 'pending' || r.status === 'approved').length : 0,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpiCards = [
    { label: "Today's Orders", value: kpis.todayOrders, Icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'On Hold', value: kpis.onHold, Icon: AlertTriangle, color: 'text-orange-400' },
    { label: 'Fraud Holds', value: kpis.fraudHolds, Icon: Shield, color: 'text-red-400' },
    { label: 'Active Continuity', value: kpis.activeContinuity, Icon: RefreshCw, color: 'text-green-400' },
    { label: 'Open RMAs', value: kpis.openRmas, Icon: RotateCcw, color: 'text-purple-400' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Phone className="w-6 h-6 text-blue-400" />
            Call Center
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">D365 Commerce Call Center — order entry, holds, RMAs, continuity</p>
        </div>
        <Link href="/call-center/orders/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />New Order
        </Link>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {kpiCards.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {QUICK_LINKS.map(({ label, href, Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-4 py-3 text-sm text-zinc-300 hover:text-zinc-100 transition-colors">
            <Icon className="w-4 h-4" />{label}<ChevronRight className="w-3 h-3 ml-auto" />
          </Link>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-100">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Order #', 'Customer', 'Channel', 'Agent', 'Total', 'Status', 'Fraud Score', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No orders yet.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{order.orderNumber.slice(0, 12)}</td>
                  <td className="px-4 py-3 text-zinc-300">{order.customerId ? order.customerId.slice(0, 8) + '…' : <span className="text-zinc-600">Guest</span>}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${CHANNEL_BADGE[order.channel] ?? 'bg-zinc-700 text-zinc-300'}`}>{order.channel}</span></td>
                  <td className="px-4 py-3 text-zinc-400">{order.agentName ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-200 font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{order.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-sm font-bold ${order.fraudScore >= 50 ? 'text-red-400' : order.fraudScore >= 25 ? 'text-yellow-400' : 'text-green-400'}`}>{order.fraudScore}</span></td>
                  <td className="px-4 py-3"><Link href={`/call-center/orders/${order.id}`} className="text-xs text-blue-400 hover:text-blue-300">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
