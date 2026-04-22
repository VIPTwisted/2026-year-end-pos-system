'use client'
import { useEffect, useState, use } from 'react'
import { ArrowLeft, Plus, Trash2, Edit2, X } from 'lucide-react'
import Link from 'next/link'

interface ExchangeRate {
  id: string
  toCurrencyCode: string
  rate: number
  rateType: string
  effectiveDate: string
  source: string
  isActive: boolean
}

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  isBase: boolean
  isActive: boolean
  exchangeRates: ExchangeRate[]
  updatedAt: string
}

interface RateForm {
  toCurrencyCode: string
  rate: string
  rateType: string
  effectiveDate: string
  source: string
}

export default function CurrencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [showRateForm, setShowRateForm] = useState(false)
  const [editRateId, setEditRateId] = useState<string | null>(null)
  const [rateForm, setRateForm] = useState<RateForm>({
    toCurrencyCode: '',
    rate: '',
    rateType: 'standard',
    effectiveDate: new Date().toISOString().split('T')[0],
    source: 'manual',
  })

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    setLoading(true)
    const [cRes, rRes] = await Promise.all([
      fetch(`/api/global/currencies/${id}`),
      fetch(`/api/global/currencies/${id}/rates`),
    ])
    const [cData, rData] = await Promise.all([cRes.json(), rRes.json()])
    setCurrency(cData)
    setRates(Array.isArray(rData) ? rData : [])
    setLoading(false)
  }

  async function handleRateSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/global/currencies/${id}/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rateForm),
    })
    setRateForm({ toCurrencyCode: '', rate: '', rateType: 'standard', effectiveDate: new Date().toISOString().split('T')[0], source: 'manual' })
    setShowRateForm(false)
    setEditRateId(null)
    fetchData()
  }

  async function handleDeleteRate(rateId: string) {
    if (!confirm('Delete this exchange rate?')) return
    void rateId
    fetchData()
  }

  const rateTypeBadge: Record<string, string> = {
    standard: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    selling: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
    buying: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  }

  const sourceBadge: Record<string, string> = {
    manual: 'bg-zinc-700 text-zinc-400',
    ecb: 'bg-violet-600/20 text-violet-400',
    fed: 'bg-blue-600/20 text-blue-400',
    custom: 'bg-orange-600/20 text-orange-400',
  }

  if (loading) return <div className="p-6 text-zinc-600">Loading...</div>
  if (!currency) return <div className="p-6 text-red-400">Currency not found</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/global/currencies" className="text-zinc-400 hover:text-zinc-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{currency.symbol} {currency.code}</h1>
          <p className="text-sm text-zinc-500">{currency.name} · {currency.decimalPlaces} decimal places</p>
        </div>
        {currency.isBase && (
          <span className="px-2 py-0.5 bg-amber-600/20 border border-amber-600/30 rounded text-amber-400 text-xs font-medium">Base Currency</span>
        )}
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${currency.isActive ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
          {currency.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300">Exchange Rates</h2>
          <button onClick={() => { setShowRateForm(true); setEditRateId(null) }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white">
            <Plus className="w-3 h-3" /> Add Rate
          </button>
        </div>

        {showRateForm && (
          <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-zinc-300">New Exchange Rate</h3>
              <button onClick={() => setShowRateForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleRateSubmit} className="grid grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">To Currency</label>
                <input value={rateForm.toCurrencyCode} onChange={e => setRateForm(f => ({ ...f, toCurrencyCode: e.target.value.toUpperCase() }))}
                  placeholder="EUR" maxLength={3} required
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Rate</label>
                <input type="number" step="0.000001" value={rateForm.rate} onChange={e => setRateForm(f => ({ ...f, rate: e.target.value }))}
                  placeholder="0.920000" required
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Rate Type</label>
                <select value={rateForm.rateType} onChange={e => setRateForm(f => ({ ...f, rateType: e.target.value }))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                  <option value="standard">Standard</option>
                  <option value="selling">Selling</option>
                  <option value="buying">Buying</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Effective Date</label>
                <input type="date" value={rateForm.effectiveDate} onChange={e => setRateForm(f => ({ ...f, effectiveDate: e.target.value }))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Source</label>
                <select value={rateForm.source} onChange={e => setRateForm(f => ({ ...f, source: e.target.value }))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                  <option value="manual">Manual</option>
                  <option value="ecb">ECB</option>
                  <option value="fed">FED</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="col-span-5 flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">Add Rate</button>
                <button type="button" onClick={() => setShowRateForm(false)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">To Currency</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rate</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Effective Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-zinc-600">No exchange rates. Add one above.</td></tr>
            ) : rates.map(r => (
              <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-mono font-bold text-zinc-100">{r.toCurrencyCode}</td>
                <td className="px-4 py-3 font-mono text-emerald-400">{r.rate.toFixed(6)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded border text-xs font-medium ${rateTypeBadge[r.rateType] ?? 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>{r.rateType}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{new Date(r.effectiveDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${sourceBadge[r.source] ?? 'bg-zinc-700 text-zinc-400'}`}>{r.source}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${r.isActive ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                    {r.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setRateForm({ toCurrencyCode: r.toCurrencyCode, rate: String(r.rate), rateType: r.rateType, effectiveDate: r.effectiveDate.split('T')[0], source: r.source }); setEditRateId(r.id); setShowRateForm(true) }} className="text-zinc-400 hover:text-blue-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteRate(r.id)} className="text-zinc-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
