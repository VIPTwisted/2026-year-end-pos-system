'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Order = {
  id: string
  orderNumber: string
  accountName: string | null
  status: string
  totalAmount: number
  dueDate: string | null
  createdAt: string
  quote: { quoteNumber: string } | null
}

const statusColor: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-amber-500/20 text-amber-400',
  fulfilled: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const TABS = ['all', 'new', 'processing', 'fulfilled', 'cancelled']

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)

  async function load(status = 'all') {
    setLoading(true)
    const res = await fetch(`/api/sales/orders?status=${status}`)
    setOrders(await res.json())
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  async function createInvoice(id: string) {
    await fetch(`/api/sales/orders/${id}/create-invoice`, { method: 'POST' })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Orders</h1>
          <p className="text-sm text-zinc-400 mt-1">Sales orders management</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 text-sm capitalize transition-colors', tab === t ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300')}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Order #</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Account</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Quote #</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-medium">Total</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Due Date</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>}
            {!loading && orders.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">No orders found</td></tr>}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/sales/orders/${o.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{o.orderNumber.slice(-10)}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-300">{o.accountName || '—'}</td>
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{o.quote ? o.quote.quoteNumber.slice(-8) : '—'}</td>
                <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(o.totalAmount)}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{o.dueDate ? new Date(o.dueDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', statusColor[o.status] || 'bg-zinc-700 text-zinc-300')}>{o.status}</span>
                </td>
                <td className="px-4 py-3">
                  {o.status === 'fulfilled' && (
                    <button onClick={() => createInvoice(o.id)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      <FileText className="w-3.5 h-3.5" /> Invoice
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
