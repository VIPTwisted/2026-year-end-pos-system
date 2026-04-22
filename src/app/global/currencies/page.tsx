'use client'
import { useEffect, useState } from 'react'
import { RefreshCw, Plus, Trash2, Edit2, Star, CheckCircle, X } from 'lucide-react'

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  isBase: boolean
  isActive: boolean
  exchangeRates: { toCurrencyCode: string; rate: number; effectiveDate: string }[]
  updatedAt: string
}

interface ConvertResult {
  amount: number
  from: string
  to: string
  rate: number
  converted: number
  formattedConverted: string
}

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState('')

  const [form, setForm] = useState({ code: '', name: '', symbol: '', decimalPlaces: 2, isBase: false })

  const [convertAmount, setConvertAmount] = useState('')
  const [convertFrom, setConvertFrom] = useState('')
  const [convertTo, setConvertTo] = useState('')
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null)
  const [converting, setConverting] = useState(false)
  const [convertError, setConvertError] = useState('')

  useEffect(() => { fetchCurrencies() }, [])

  async function fetchCurrencies() {
    setLoading(true)
    const res = await fetch('/api/global/currencies')
    const data = await res.json()
    setCurrencies(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editId ? 'PATCH' : 'POST'
    const url = editId ? `/api/global/currencies/${editId}` : '/api/global/currencies'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ code: '', name: '', symbol: '', decimalPlaces: 2, isBase: false })
    setShowForm(false)
    setEditId(null)
    fetchCurrencies()
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/global/currencies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchCurrencies()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this currency?')) return
    await fetch(`/api/global/currencies/${id}`, { method: 'DELETE' })
    fetchCurrencies()
  }

  async function handleRefresh() {
    setRefreshing(true)
    setRefreshMsg('')
    const res = await fetch('/api/global/currencies/refresh', { method: 'POST' })
    const data = await res.json()
    setRefreshMsg(`Updated ${data.updated} rates`)
    fetchCurrencies()
    setRefreshing(false)
  }

  function startEdit(c: Currency) {
    setForm({ code: c.code, name: c.name, symbol: c.symbol, decimalPlaces: c.decimalPlaces, isBase: c.isBase })
    setEditId(c.id)
    setShowForm(true)
  }

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault()
    setConverting(true)
    setConvertError('')
    setConvertResult(null)
    const res = await fetch('/api/global/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(convertAmount), fromCode: convertFrom, toCode: convertTo }),
    })
    const data = await res.json()
    if (!res.ok) setConvertError(data.error ?? 'Conversion failed')
    else setConvertResult(data)
    setConverting(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Currency Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh All Rates
          </button>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm({ code: '', name: '', symbol: '', decimalPlaces: 2, isBase: false }) }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Currency
          </button>
        </div>
      </div>

      {refreshMsg && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-lg text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          {refreshMsg}
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">{editId ? 'Edit Currency' : 'New Currency'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="USD" maxLength={3} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="US Dollar" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Symbol *</label>
              <input value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} placeholder="$" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Decimal Places</label>
              <input type="number" min={0} max={4} value={form.decimalPlaces} onChange={e => setForm(f => ({ ...f, decimalPlaces: parseInt(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isBase} onChange={e => setForm(f => ({ ...f, isBase: e.target.checked }))} className="w-4 h-4 rounded accent-blue-500" />
                <span className="text-sm text-zinc-300">Set as Base Currency</span>
              </label>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Symbol</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Decimals</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Base</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rate vs USD</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-zinc-600">Loading...</td></tr>
            ) : currencies.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-zinc-600">No currencies configured</td></tr>
            ) : currencies.map(c => {
              const usdRate = c.exchangeRates?.find(r => r.toCurrencyCode === 'USD') ?? c.exchangeRates?.[0]
              return (
                <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-zinc-100">{c.code}</td>
                  <td className="px-4 py-3 text-zinc-300">{c.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.symbol}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.decimalPlaces}</td>
                  <td className="px-4 py-3">{c.isBase && <span className="flex items-center gap-1 text-amber-400 text-xs font-medium"><Star className="w-3 h-3" /> Base</span>}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{usdRate ? usdRate.rate.toFixed(4) : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.id, c.isActive)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${c.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${c.isActive ? 'translate-x-4' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(c)} className="text-zinc-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Currency Converter</h2>
        <form onSubmit={handleConvert} className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Amount</label>
            <input type="number" step="0.01" value={convertAmount} onChange={e => setConvertAmount(e.target.value)} placeholder="100.00" required
              className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">From</label>
            <select value={convertFrom} onChange={e => setConvertFrom(e.target.value)} required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
              <option value="">Select...</option>
              {currencies.filter(c => c.isActive).map(c => <option key={c.id} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">To</label>
            <select value={convertTo} onChange={e => setConvertTo(e.target.value)} required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
              <option value="">Select...</option>
              {currencies.filter(c => c.isActive).map(c => <option key={c.id} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={converting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white disabled:opacity-50">
            {converting ? 'Converting...' : 'Convert'}
          </button>
        </form>
        {convertError && <p className="mt-3 text-red-400 text-sm">{convertError}</p>}
        {convertResult && (
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400 mb-1">{convertResult.formattedConverted}</div>
            <div className="text-xs text-zinc-500">Rate: 1 {convertResult.from} = {convertResult.rate.toFixed(6)} {convertResult.to}</div>
          </div>
        )}
      </div>
    </div>
  )
}
