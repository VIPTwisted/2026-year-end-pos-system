'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Plus,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  ChevronRight,
  X,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface B2BOrder {
  id: string
  orderNumber: string
  account: { companyName: string; accountCode: string }
  status: string
  orderDate: string
  requestedDate: string | null
  totalAmt: number
  poReference: string | null
  _count: { lines: number }
}

interface B2BAccount {
  id: string
  accountCode: string
  companyName: string
}

type TabKey = 'all' | 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-900/40 text-amber-400 border-amber-800/40',
  approved: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
  processing: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
  shipped: 'bg-purple-900/40 text-purple-400 border-purple-800/40',
  delivered: 'bg-emerald-900/60 text-emerald-300 border-emerald-800/60',
  cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
}

interface OrderLine {
  productName: string
  sku: string
  qty: number
  unitPrice: number
  discountPct: number
}

function NewOrderModal({ accounts, onClose, onCreated }: { accounts: B2BAccount[]; onClose: () => void; onCreated: () => void }) {
  const [accountId, setAccountId] = useState('')
  const [lines, setLines] = useState<OrderLine[]>([{ productName: '', sku: '', qty: 1, unitPrice: 0, discountPct: 0 }])
  const [notes, setNotes] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [poReference, setPoReference] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addLine = () => setLines((l) => [...l, { productName: '', sku: '', qty: 1, unitPrice: 0, discountPct: 0 }])
  const removeLine = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i))

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice * (1 - l.discountPct / 100), 0)
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/b2b/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, lines, notes, requestedDate: requestedDate || null, poReference: poReference || null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      onCreated(); onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">New B2B Order</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Account *</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500">
              <option value="">Select account...</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.companyName} ({a.accountCode})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">PO Reference</label>
              <input value={poReference} onChange={(e) => setPoReference(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Requested Date</label>
              <input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add Line</button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={l.productName} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, productName: e.target.value } : x))} placeholder="Product" className="col-span-4 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input value={l.sku} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, sku: e.target.value } : x))} placeholder="SKU" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={1} value={l.qty} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, qty: parseInt(e.target.value) || 1 } : x))} placeholder="Qty" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={0} step={0.01} value={l.unitPrice} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, unitPrice: parseFloat(e.target.value) || 0 } : x))} placeholder="Price" className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <input type="number" min={0} max={100} value={l.discountPct} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, discountPct: parseFloat(e.target.value) || 0 } : x))} placeholder="Disc%" className="col-span-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500" />
                  <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1} className="col-span-1 text-zinc-600 hover:text-red-400 disabled:opacity-30 flex justify-center"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Subtotal: <span className="text-zinc-100 font-semibold">{fmt(subtotal)}</span></span>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
            <button type="submit" disabled={saving || !accountId} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium">{saving ? 'Creating...' : 'Create Order'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function B2BOrdersPage() {
  const [orders, setOrders] = useState<B2BOrder[]>([])
  const [accounts, setAccounts] = useState<B2BAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('all')
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tab !== 'all') params.set('status', tab)
      const [ordersRes, accountsRes] = await Promise.all([
        fetch(`/api/b2b/orders?${params}`),
        fetch('/api/b2b/accounts?isApproved=true&isActive=true'),
      ])
      const [ordersData, accountsData] = await Promise.all([ordersRes.json(), accountsRes.json()])
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setAccounts(Array.isArray(accountsData) ? accountsData : [])
    } finally { setLoading(false) }
  }, [tab])

  useEffect(() => { load() }, [load])

  async function approveOrder(id: string) {
    await fetch(`/api/b2b/orders/${id}/approve`, { method: 'POST' })
    load()
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const totalOrders = orders.length
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const approvedCount = orders.filter((o) => o.status === 'approved').length
  const totalRevenue = orders.filter((o) => !['cancelled'].includes(o.status)).reduce((s, o) => s + o.totalAmt, 0)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-400" />
              B2B Orders
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Wholesale order management</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: totalOrders, icon: Package, color: 'text-blue-400' },
            { label: 'Pending Approval', value: pendingCount, icon: Clock, color: 'text-amber-400' },
            { label: 'Approved', value: approvedCount, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Total Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <p className="text-2xl font-bold text-zinc-100">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit flex-wrap">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', tab === key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Order #', 'Account', 'PO Ref', 'Order Date', 'Req. Date', 'Lines', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-zinc-500">No orders found</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">{o.orderNumber.slice(0, 12)}</td>
                    <td className="px-4 py-3 text-zinc-100 font-medium">{o.account.companyName}</td>
                    <td className="px-4 py-3 text-zinc-400">{o.poReference || '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{fmtDate(o.orderDate)}</td>
                    <td className="px-4 py-3 text-zinc-400">{o.requestedDate ? fmtDate(o.requestedDate) : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{o._count.lines}</td>
                    <td className="px-4 py-3 text-zinc-100 font-medium">{fmt(o.totalAmt)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs border capitalize', STATUS_BADGE[o.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700')}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {o.status === 'pending' && (
                          <button onClick={() => approveOrder(o.id)} className="px-2 py-1 text-xs bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-400 border border-emerald-800/50 rounded">Approve</button>
                        )}
                        <Link href={`/b2b/orders/${o.id}`} className="text-zinc-500 hover:text-zinc-200">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <NewOrderModal accounts={accounts} onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  )
}
