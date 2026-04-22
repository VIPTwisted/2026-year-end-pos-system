'use client'
import { useEffect, useState } from 'react'
import { Zap, Plus, X, Play, Square } from 'lucide-react'

interface FlashSale {
  id: string
  name: string
  showId: string | null
  productName: string
  originalPrice: number
  salePrice: number
  quantity: number
  soldQty: number
  duration: number
  status: string
  startedAt: string | null
  endedAt: string | null
  createdAt: string
}

function CountdownTimer({ sale }: { sale: FlashSale }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!sale.startedAt || sale.status !== 'active') return
    const end = new Date(sale.startedAt).getTime() + sale.duration * 1000
    const update = () => setRemaining(Math.max(0, Math.floor((end - Date.now()) / 1000)))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [sale.startedAt, sale.duration, sale.status])

  if (sale.status !== 'active') return null
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  return (
    <span className={`font-mono font-bold ${remaining < 60 ? 'text-red-400' : 'text-amber-400'}`}>
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

function discountPct(orig: number, sale: number) {
  if (orig <= 0) return 0
  return Math.round(((orig - sale) / orig) * 100)
}

export default function FlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', showId: '', productName: '', originalPrice: '', salePrice: '', quantity: '10', duration: '300' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await fetch('/api/live/flash-sales').then(r => r.json())
    setSales(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleStart(id: string) {
    await fetch(`/api/live/flash-sales/${id}/start`, { method: 'POST' })
    load()
  }

  async function handleEnd(id: string) {
    await fetch(`/api/live/flash-sales/${id}/end`, { method: 'POST' })
    load()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/live/flash-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, showId: form.showId || null }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', showId: '', productName: '', originalPrice: '', salePrice: '', quantity: '10', duration: '300' })
    load()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activeNow = sales.filter(s => s.status === 'active').length
  const completedToday = sales.filter(s => s.status === 'ended' && s.endedAt && new Date(s.endedAt) >= today).length
  const totalUnitsSoldToday = sales
    .filter(s => s.endedAt && new Date(s.endedAt) >= today)
    .reduce((sum, s) => sum + s.soldQty, 0)

  const kpis = [
    { label: 'Active Now', value: activeNow.toString(), color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Completed Today', value: completedToday.toString(), color: 'text-zinc-300', bg: 'bg-zinc-800' },
    { label: 'Units Sold Today', value: totalUnitsSoldToday.toString(), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Flash Sales</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Time-limited live drops</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Flash Sale
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="font-semibold text-zinc-100">New Flash Sale</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Product Name *</label>
                <input required value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Show ID (optional)</label>
                <input value={form.showId} onChange={e => setForm(f => ({ ...f, showId: e.target.value }))}
                  placeholder="Link to a live show..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Original Price</label>
                  <input type="number" step="0.01" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Sale Price *</label>
                  <input required type="number" step="0.01" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Quantity</label>
                  <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Duration (seconds)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-400 text-sm rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Flash Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} border border-zinc-800 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs text-zinc-500">{kpi.label}</span>
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Product</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Original</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Sale Price</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Discount</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Qty</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Sold</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Remaining</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Timer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={11} className="text-center py-12 text-zinc-600 text-sm">Loading...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-12 text-zinc-600 text-sm">No flash sales yet</td></tr>
            ) : sales.map(sale => {
              const remaining = sale.quantity - sale.soldQty
              const pct = discountPct(sale.originalPrice, sale.salePrice)
              return (
                <tr key={sale.id} className={`hover:bg-zinc-800/30 transition-colors ${sale.status === 'active' ? 'bg-amber-500/5' : ''}`}>
                  <td className="px-4 py-3 font-medium text-zinc-100">{sale.name}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{sale.productName}</td>
                  <td className="px-4 py-3 text-right text-zinc-500 line-through text-xs">
                    {sale.originalPrice > 0 ? fmt(sale.originalPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{fmt(sale.salePrice)}</td>
                  <td className="px-4 py-3 text-right">
                    {pct > 0 ? (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded font-medium">{pct}% off</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">{sale.quantity}</td>
                  <td className="px-4 py-3 text-right text-zinc-400">{sale.soldQty}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={remaining <= 0 ? 'text-red-400 font-semibold' : 'text-zinc-300'}>{remaining}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sale.status === 'active'
                      ? <CountdownTimer sale={sale} />
                      : <span className="text-zinc-600 text-xs">{Math.floor(sale.duration / 60)}m {sale.duration % 60}s</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    {sale.status === 'pending' && <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-400 border border-zinc-700">Pending</span>}
                    {sale.status === 'active' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        Active
                      </span>
                    )}
                    {sale.status === 'ended' && <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-500 border border-zinc-700">Ended</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {sale.status === 'pending' && (
                        <button onClick={() => handleStart(sale.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors">
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                      {sale.status === 'active' && (
                        <button onClick={() => handleEnd(sale.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 text-zinc-300 border border-zinc-600 rounded hover:bg-zinc-600 transition-colors">
                          <Square className="w-3 h-3" /> End
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
