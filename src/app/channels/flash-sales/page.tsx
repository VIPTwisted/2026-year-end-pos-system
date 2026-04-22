'use client'
import { useEffect, useState, useCallback } from 'react'
import { Zap, Plus, Clock, Tag, TrendingUp, X } from 'lucide-react'

type FlashSale = {
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

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-zinc-700/60 text-zinc-300 border-zinc-700',
  active:    'bg-green-500/20 text-green-400 border-green-500/30',
  expired:   'bg-zinc-600/50 text-zinc-400 border-zinc-600',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_TABS = ['all', 'active', 'pending', 'expired']

function CountdownTimer({ endedAt, duration, startedAt }: { endedAt: string | null; duration: number; startedAt: string | null }) {
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    const calcRemaining = () => {
      if (endedAt) {
        return Math.max(0, Math.floor((new Date(endedAt).getTime() - Date.now()) / 1000))
      }
      if (startedAt) {
        const end = new Date(startedAt).getTime() + duration * 1000
        return Math.max(0, Math.floor((end - Date.now()) / 1000))
      }
      return 0
    }
    setRemaining(calcRemaining())
    const interval = setInterval(() => setRemaining(calcRemaining()), 1000)
    return () => clearInterval(interval)
  }, [endedAt, duration, startedAt])

  if (remaining <= 0) return <span className="text-zinc-600">—</span>

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60

  return (
    <span className={`font-mono text-xs font-bold ${remaining < 60 ? 'text-red-400' : remaining < 300 ? 'text-yellow-400' : 'text-green-400'}`}>
      {h > 0 ? `${h}h ` : ''}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

type CreateForm = {
  name: string
  productName: string
  originalPrice: string
  salePrice: string
  quantity: string
  duration: string
}

export default function FlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<CreateForm>({
    name: '',
    productName: '',
    originalPrice: '',
    salePrice: '',
    quantity: '50',
    duration: '300',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const params = tab !== 'all' ? `?status=${tab}` : ''
    const res = await fetch(`/api/flash-sales${params}`)
    const data = await res.json()
    setSales(Array.isArray(data) ? data : data.sales ?? [])
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  const discountPct = (orig: number, sale: number) =>
    orig > 0 ? Math.round((1 - sale / orig) * 100) : 0

  const sellThrough = (sold: number, qty: number) =>
    qty > 0 ? Math.round((sold / qty) * 100) : 0

  const handleCreate = async () => {
    if (!form.name || !form.productName || !form.salePrice) return
    setCreating(true)
    await fetch('/api/flash-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        productName: form.productName,
        originalPrice: parseFloat(form.originalPrice) || 0,
        salePrice: parseFloat(form.salePrice),
        quantity: parseInt(form.quantity) || 50,
        duration: parseInt(form.duration) || 300,
      }),
    })
    setCreating(false)
    setShowCreate(false)
    setForm({ name: '', productName: '', originalPrice: '', salePrice: '', quantity: '50', duration: '300' })
    load()
  }

  const activeSales = sales.filter(s => s.status === 'active')
  const totalRevenue = sales.reduce((sum, s) => sum + s.salePrice * s.soldQty, 0)

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Flash Sales</h1>
            <p className="text-xs text-zinc-500">NovaPOS Commerce — time-limited flash promotions</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors"
        >
          <Plus className="w-3 h-3" /> New Flash Sale
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Active Now</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">{activeSales.length}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Total Sales</span>
            <Tag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400">{sales.length}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Units Sold</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{sales.reduce((s, f) => s + f.soldQty, 0)}</div>
        </div>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-zinc-800/50">
        {STATUS_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium transition-colors capitalize border-b-2 -mb-px ${
              tab === t
                ? 'text-yellow-400 border-yellow-400'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                {['Name', 'Product', 'Original', 'Sale Price', 'Discount', 'Units', 'Sold', 'Sell-through', 'Status', 'Countdown', 'Started'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-10 text-center text-zinc-600">Loading...</td></tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center">
                    <Zap className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium">No flash sales found</p>
                    <p className="text-zinc-600 text-xs mt-1">Create one to get started</p>
                  </td>
                </tr>
              ) : sales.map(sale => {
                const disc = discountPct(sale.originalPrice, sale.salePrice)
                const st = sellThrough(sale.soldQty, sale.quantity)
                return (
                  <tr key={sale.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-200">{sale.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{sale.productName}</td>
                    <td className="px-4 py-3 text-zinc-400 line-through">
                      {sale.originalPrice > 0 ? `$${sale.originalPrice.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-yellow-400 font-semibold">${sale.salePrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {disc > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">-{disc}%</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{sale.quantity}</td>
                    <td className="px-4 py-3 text-zinc-300">{sale.soldQty}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-zinc-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${st >= 80 ? 'bg-red-400' : st >= 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                            style={{ width: `${st}%` }}
                          />
                        </div>
                        <span className="text-zinc-400">{st}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded border text-xs font-medium ${STATUS_BADGE[sale.status] ?? 'bg-zinc-700 text-zinc-300 border-zinc-700'}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sale.status === 'active' ? (
                        <CountdownTimer endedAt={sale.endedAt} duration={sale.duration} startedAt={sale.startedAt} />
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                      {sale.startedAt ? new Date(sale.startedAt).toLocaleString() : <span className="text-zinc-700">Scheduled</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#16213e] border border-zinc-700 rounded-2xl p-6 w-[480px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-base font-semibold text-zinc-100">New Flash Sale</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Sale Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Summer Blowout Flash Deal"
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Product</label>
                <input
                  type="text"
                  value={form.productName}
                  onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                  placeholder="Product name or SKU"
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Original Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Sale Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salePrice}
                    onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Max Units</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Duration</label>
                  <select
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-yellow-500/50"
                  >
                    <option value="300">5 minutes</option>
                    <option value="600">10 minutes</option>
                    <option value="900">15 minutes</option>
                    <option value="1800">30 minutes</option>
                    <option value="3600">1 hour</option>
                    <option value="7200">2 hours</option>
                    <option value="86400">24 hours</option>
                  </select>
                </div>
              </div>

              {/* Discount preview */}
              {form.originalPrice && form.salePrice && parseFloat(form.originalPrice) > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="text-xs text-yellow-300">
                    {discountPct(parseFloat(form.originalPrice), parseFloat(form.salePrice))}% discount —
                    saves ${(parseFloat(form.originalPrice) - parseFloat(form.salePrice)).toFixed(2)} per unit
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2 text-xs font-medium text-zinc-400 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.name || !form.productName || !form.salePrice}
                className="flex-1 px-4 py-2 text-xs font-medium bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {creating ? 'Creating...' : 'Create Flash Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
