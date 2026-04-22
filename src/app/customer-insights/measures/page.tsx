'use client'
import { useEffect, useState, useCallback } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Calculator, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Measure {
  id: string
  measureName: string
  description: string | null
  measureType: string
  category: string | null
  currentValue: number | null
  changePercent: number | null
  lastCalculatedAt: string | null
  isActive: boolean
}

const CATEGORIES = ['All', 'Revenue', 'Engagement', 'Retention', 'Acquisition', 'Loyalty']
const MEASURE_TYPES = ['customer', 'business', 'segment']
const BLANK = { measureName: '', description: '', measureType: 'customer', category: 'Revenue' }

export default function MeasuresPage() {
  const [measures, setMeasures] = useState<Measure[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [calculating, setCalculating] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/customer-insights/measures')
      .then(r => r.json())
      .then(d => { setMeasures(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = cat === 'All' ? measures : measures.filter(m => (m.category ?? '').toLowerCase() === cat.toLowerCase())

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    await fetch('/api/customer-insights/measures', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm(BLANK)
    load()
  }

  async function calculate(id: string) {
    setCalculating(id)
    await fetch(`/api/customer-insights/measures/${id}/calculate`, { method: 'POST' })
    setCalculating(null)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold">Measures</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Measure
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', cat === c ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200')}>{c}</button>
        ))}
      </div>

      {/* Measures Grid */}
      {loading ? (
        <div className="text-zinc-500 text-center py-10">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-zinc-500 text-center py-10">No measures found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(m => (
            <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{m.measureName}</div>
                  {m.category && <div className="text-xs text-zinc-500 mt-0.5">{m.category}</div>}
                </div>
                <span className={cn('text-xs px-1.5 py-0.5 rounded capitalize', m.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500')}>
                  {m.isActive ? 'active' : 'off'}
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-amber-400">
                {m.currentValue != null ? m.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
              </div>
              {m.changePercent != null && (
                <div className={cn('flex items-center gap-1 text-sm font-medium', m.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {m.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {m.changePercent >= 0 ? '+' : ''}{m.changePercent.toFixed(1)}%
                </div>
              )}
              {m.description && <div className="text-xs text-zinc-400 leading-relaxed">{m.description}</div>}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  {m.lastCalculatedAt ? new Date(m.lastCalculatedAt).toLocaleDateString() : 'Never calculated'}
                </div>
                <button
                  onClick={() => calculate(m.id)}
                  disabled={calculating === m.id}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors"
                >
                  <Calculator className={cn('w-3.5 h-3.5', calculating === m.id && 'animate-spin')} />
                  {calculating === m.id ? '...' : 'Calculate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Measure</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Measure Name</label>
                <input value={form.measureName} onChange={e => setF('measureName', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Description</label>
                <input value={form.description} onChange={e => setF('description', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Type</label>
                <select value={form.measureType} onChange={e => setF('measureType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                  {MEASURE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Category</label>
                <select value={form.category} onChange={e => setF('category', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={save} disabled={!form.measureName} className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
