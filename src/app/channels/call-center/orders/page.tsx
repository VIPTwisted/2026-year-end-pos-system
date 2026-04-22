'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Phone, Plus, Search, Filter, AlertTriangle, Shield, ChevronLeft } from 'lucide-react'

type CCOrder = {
  id: string
  orderNumber: string
  customerId: string | null
  agentName: string | null
  channel: string
  status: string
  holdReason: string | null
  fraudScore: number
  subtotal: number
  tax: number
  shipping: number
  total: number
  paymentMethod: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  _count?: { lines: number }
}

const STATUS_BADGE: Record<string, string> = {
  draft:        'bg-zinc-700/60 text-zinc-300 border-zinc-700',
  submitted:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'on-hold':    'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'fraud-hold': 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled:    'bg-zinc-600/50 text-zinc-400 border-zinc-600',
  fulfilled:    'bg-green-500/20 text-green-400 border-green-500/30',
}

const CHANNEL_BADGE: Record<string, string> = {
  phone: 'bg-blue-500/20 text-blue-400',
  chat:  'bg-green-500/20 text-green-400',
  email: 'bg-yellow-500/20 text-yellow-400',
  web:   'bg-purple-500/20 text-purple-400',
}

const ALL_STATUSES = ['draft', 'submitted', 'on-hold', 'fraud-hold', 'fulfilled', 'cancelled']

export default function CallCenterOrdersPage() {
  const [orders, setOrders] = useState<CCOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (channelFilter) params.set('channel', channelFilter)
    params.set('limit', '100')
    const res = await fetch(`/api/call-center/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  // search is local client-side filter (future); API filters by status/channel
  }, [statusFilter, channelFilter])

  useEffect(() => { load() }, [load])

  const fraudColor = (score: number) =>
    score >= 50 ? 'text-red-400 font-bold' : score >= 25 ? 'text-yellow-400' : 'text-green-400'

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/channels/call-center" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Call Center
        </Link>
        <span className="text-zinc-700">/</span>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-400" />
          <h1 className="text-sm font-semibold text-zinc-100">Call Center Orders</h1>
        </div>
        <span className="ml-2 px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded-full">{total}</span>
        <div className="flex-1" />
        <Link
          href="/call-center/orders/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
        >
          <Plus className="w-3 h-3" /> New Order
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search order #, agent, customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-[#16213e] border border-zinc-800/50 rounded text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#16213e] border border-zinc-800/50 rounded text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="">All statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#16213e] border border-zinc-800/50 rounded text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="">All channels</option>
            {['phone', 'chat', 'email', 'web'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                {['Order #', 'Agent', 'Customer', 'Channel', 'Lines', 'Subtotal', 'Tax', 'Total', 'Status', 'Fraud', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-zinc-600">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center">
                    <Phone className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-600">No orders found</p>
                  </td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-blue-400">
                    <Link href={`/call-center/orders/${order.id}`} className="hover:text-blue-300 hover:underline">
                      {order.orderNumber.slice(0, 14)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{order.agentName ?? <span className="text-zinc-600">—</span>}</td>
                  <td className="px-4 py-3 text-zinc-400 font-mono">
                    {order.customerId ? order.customerId.slice(0, 8) + '…' : <span className="text-zinc-600">Guest</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${CHANNEL_BADGE[order.channel] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {order.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{order._count?.lines ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">${order.subtotal.toFixed(2)}</td>
                  <td className="px-4 py-3 text-zinc-400">${order.tax.toFixed(2)}</td>
                  <td className="px-4 py-3 text-zinc-100 font-semibold">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded border text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-zinc-700 text-zinc-300 border-zinc-700'}`}>
                      {order.status === 'on-hold' && <AlertTriangle className="inline w-2.5 h-2.5 mr-1" />}
                      {order.status === 'fraud-hold' && <Shield className="inline w-2.5 h-2.5 mr-1" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${fraudColor(order.fraudScore)}`}>
                      {order.fraudScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/call-center/orders/${order.id}`}
                      className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
