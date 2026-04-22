'use client'
import { useEffect, useState } from 'react'
import { Repeat, Plus, Pause, Play, X, Trash2 } from 'lucide-react'

interface OrderLine { productName: string; sku: string; qty: number; unitPrice: number }
interface RecurringOrder {
  id: string
  orderNumber: string
  customerName: string
  frequency: string
  nextOrderDate?: string
  lastOrderDate?: string
  status: string
  totalOrders: number
  _count?: { lines: number }
  lines?: OrderLine[]
}

const FREQS = ['weekly', 'monthly', 'quarterly', 'annually']

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const freqBadge: Record<string, string> = {
  weekly: 'bg-cyan-500/20 text-cyan-400',
  monthly: 'bg-blue-500/20 text-blue-400',
  quarterly: 'bg-violet-500/20 text-violet-400',
  annually: 'bg-emerald-500/20 text-emerald-400',
}

export default function RecurringOrdersPage() {
  const [orders, setOrders] = useState<RecurringOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ customerName: '', frequency: 'monthly', nextOrderDate: '' })
  const [lines, setLines] = useState<OrderLine[]>([{ productName: '', sku: '', qty: 1, unitPrice: 0 }])
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/subscriptions/recurring-orders').then(r => r.json()).then(d => { setOrders(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    setSaving(true)
    await fetch('/api/subscriptions/recurring-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lines: lines.filter(l => l.productName.trim()) }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ customerName: '', frequency: 'monthly', nextOrderDate: '' })
    setLines([{ productName: '', sku: '', qty: 1, unitPrice: 0 }])
    load()
  }

  const doAction = async (id: string, action: 'pause' | 'resume') => {
    await fetch(`/api/subscriptions/recurring-orders/${id}/${action}`, { method: 'POST' })
    load()
  }

  const cancel = async (id: string) => {
    if (!confirm('Cancel this recurring order?')) return
    await fetch(`/api/subscriptions/recurring-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    load()
  }

  const updateLine = (i: number, field: keyof OrderLine, value: string | number) => {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><Repeat className="w-6 h-6 text-blue-400" />Recurring Orders</h1>
          <p className="text-zinc-500 text-sm mt-1">{orders.length} recurring orders</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Recurring Order
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-zinc-200">New Recurring Order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Customer Name</label>
              <input value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Frequency</label>
              <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                {FREQS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Next Order Date</label>
              <input type="date" value={form.nextOrderDate} onChange={e => setForm(p => ({ ...p, nextOrderDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-zinc-400 font-medium">Order Lines</div>
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={line.productName} onChange={e => updateLine(i, 'productName', e.target.value)} placeholder="Product name" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                <input value={line.sku} onChange={e => updateLine(i, 'sku', e.target.value)} placeholder="SKU" className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                <input type="number" value={line.qty} onChange={e => updateLine(i, 'qty', +e.target.value)} placeholder="Qty" className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                <input type="number" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', +e.target.value)} placeholder="Price" className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                <button onClick={() => setLines(p => p.filter((_, j) => j !== i))} className="p-2 text-zinc-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={() => setLines(p => [...p, { productName: '', sku: '', qty: 1, unitPrice: 0 }])} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <Plus className="w-3 h-3" />Add Line
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} disabled={saving || !form.customerName} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Creating…' : 'Create Order'}</button>
            <button onClick={() => setShowForm(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950">
            <tr>
              {['Order #', 'Customer', 'Frequency', 'Next Order', 'Last Order', 'Status', 'Lines', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No recurring orders yet</td></tr>
            ) : orders.map(order => (
              <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{order.orderNumber}</td>
                <td className="px-4 py-3 text-zinc-200">{order.customerName}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${freqBadge[order.frequency] ?? 'bg-zinc-700 text-zinc-400'}`}>{order.frequency}</span></td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{order.nextOrderDate ? new Date(order.nextOrderDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{order.lastOrderDate ? new Date(order.lastOrderDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[order.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{order.status}</span></td>
                <td className="px-4 py-3 text-zinc-500">{order._count?.lines ?? order.lines?.length ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {order.status === 'active' && <button onClick={() => doAction(order.id, 'pause')} className="p-1.5 rounded bg-zinc-800 hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-400 transition-colors"><Pause className="w-3.5 h-3.5" /></button>}
                    {order.status === 'paused' && <button onClick={() => doAction(order.id, 'resume')} className="p-1.5 rounded bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"><Play className="w-3.5 h-3.5" /></button>}
                    {order.status !== 'cancelled' && <button onClick={() => cancel(order.id)} className="p-1.5 rounded bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
