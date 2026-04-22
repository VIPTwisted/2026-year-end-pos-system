'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, TrendingUp, TrendingDown, Edit2, Check, X } from 'lucide-react'

type Metric = { id: string; name: string; metricType: string; target: number; warning: number; critical: number; unit: string; position: number; currentValue?: number }
type Scorecard = { id: string; name: string; description: string | null; isDefault: boolean; metrics: Metric[] }

const METRIC_TYPES = ['revenue', 'units-sold', 'avg-transaction', 'conversion', 'basket-size', 'employee-productivity', 'inventory-turns', 'gross-margin']
function statusRing(m: Metric) { const v = m.currentValue ?? 0; return v >= m.target ? 'ring-emerald-500' : v >= m.warning ? 'ring-amber-500' : 'ring-red-500' }
function statusBg(m: Metric) { const v = m.currentValue ?? 0; return v >= m.target ? 'bg-emerald-500/10 border-emerald-500/30' : v >= m.warning ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30' }
function fmtVal(v: number, unit: string) { if (unit === '$') { if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`; if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`; return `$${v.toFixed(0)}` } if (unit === '%') return `${v.toFixed(1)}%`; return `${v.toFixed(1)} ${unit}` }

function EditMetricInline({ metric, onSave, onCancel }: { metric: Metric; onSave: (data: Partial<Metric>) => void; onCancel: () => void }) {
  const [f, setF] = useState({ name: metric.name, target: metric.target.toString(), warning: metric.warning.toString(), critical: metric.critical.toString(), unit: metric.unit })
  return (
    <div className="space-y-3">
      <input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))}
        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-blue-500" />
      <div className="grid grid-cols-2 gap-2">
        {(['target', 'warning', 'critical'] as const).map(k => (
          <div key={k}>
            <label className="text-xs text-zinc-600 block mb-0.5 capitalize">{k}</label>
            <input type="number" value={f[k]} onChange={e => setF(p => ({ ...p, [k]: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 outline-none focus:border-blue-500" />
          </div>
        ))}
        <div>
          <label className="text-xs text-zinc-600 block mb-0.5">Unit</label>
          <select value={f.unit} onChange={e => setF(p => ({ ...p, unit: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 outline-none">
            {['$', '%', 'units', 'days'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave({ name: f.name, target: parseFloat(f.target)||0, warning: parseFloat(f.warning)||0, critical: parseFloat(f.critical)||0, unit: f.unit })}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors">
          <Check className="w-3 h-3" /> Save
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 hover:bg-zinc-800 text-zinc-400 rounded text-xs transition-colors"><X className="w-3 h-3" /></button>
      </div>
    </div>
  )
}

export default function ScorecardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [scorecard, setScorecard] = useState<Scorecard | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingMid, setEditingMid] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', metricType: 'revenue', target: '', warning: '', critical: '', unit: '$' })

  useEffect(() => { fetch(`/api/analytics/scorecards/${id}`).then(r => r.json()).then(d => { setScorecard(d); setLoading(false) }) }, [id])

  const addMetric = async () => {
    if (!form.name.trim()) return
    setSubmitting(true)
    const res = await fetch(`/api/analytics/scorecards/${id}/metrics`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, metricType: form.metricType, target: parseFloat(form.target)||0, warning: parseFloat(form.warning)||0, critical: parseFloat(form.critical)||0, unit: form.unit }),
    })
    const m = await res.json()
    setScorecard(sc => sc ? { ...sc, metrics: [...sc.metrics, { ...m, currentValue: Math.random() * m.target * 1.2 }] } : sc)
    setForm({ name: '', metricType: 'revenue', target: '', warning: '', critical: '', unit: '$' })
    setShowAdd(false); setSubmitting(false)
  }

  const deleteMetric = async (mid: string) => {
    if (!confirm('Delete metric?')) return
    await fetch(`/api/analytics/scorecards/${id}/metrics/${mid}`, { method: 'DELETE' })
    setScorecard(sc => sc ? { ...sc, metrics: sc.metrics.filter(m => m.id !== mid) } : sc)
  }

  const saveMetric = async (mid: string, data: Partial<Metric>) => {
    await fetch(`/api/analytics/scorecards/${id}/metrics/${mid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setScorecard(sc => sc ? { ...sc, metrics: sc.metrics.map(m => m.id === mid ? { ...m, ...data } : m) } : sc)
    setEditingMid(null)
  }

  if (loading) return <div className="p-6 text-zinc-500 text-sm">Loading...</div>
  if (!scorecard) return <div className="p-6 text-red-400 text-sm">Scorecard not found.</div>

  const sorted = [...scorecard.metrics].sort((a, b) => a.position - b.position)

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/advanced-analytics/scorecards" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-2 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Scorecards
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{scorecard.name}</h1>
            {scorecard.description && <p className="text-sm text-zinc-400 mt-1">{scorecard.description}</p>}
            {scorecard.isDefault && <span className="mt-2 inline-block px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">Default Scorecard</span>}
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Metric
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">New Metric</h3>
            <button onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 block mb-1">Metric Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Monthly Revenue"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Metric Type</label>
              <select value={form.metricType} onChange={e => setForm(f => ({ ...f, metricType: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500">
                {METRIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500">
                {['$', '%', 'units', 'days'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {(['target', 'warning', 'critical'] as const).map(k => (
              <div key={k}>
                <label className="text-xs text-zinc-400 block mb-1 capitalize">{k}</label>
                <input type="number" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm hover:text-zinc-100 transition-colors">Cancel</button>
            <button onClick={addMetric} disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Metric'}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-zinc-500 text-sm">No metrics yet. Add one above.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(m => {
            const v = m.currentValue ?? 0
            const pct = m.target > 0 ? Math.min((v / m.target) * 100, 150) : 0
            return (
              <div key={m.id} className={`border rounded-xl p-5 ${statusBg(m)}`}>
                {editingMid === m.id ? (
                  <EditMetricInline metric={m} onSave={(data) => saveMetric(m.id, data)} onCancel={() => setEditingMid(null)} />
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">{m.metricType}</div>
                        <div className="text-sm font-semibold text-zinc-100">{m.name}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingMid(m.id)} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteMetric(m.id)} className="p-1 hover:bg-red-500/10 rounded text-zinc-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${statusRing(m)} ring-2 rounded-lg p-2 text-center`}>{fmtVal(v, m.unit)}</div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden my-3">
                      <div className={`h-full rounded-full ${v >= m.target ? 'bg-emerald-500' : v >= m.warning ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><div className="text-zinc-600">Target</div><div className="text-emerald-400 font-medium">{fmtVal(m.target, m.unit)}</div></div>
                      <div><div className="text-zinc-600">Warning</div><div className="text-amber-400 font-medium">{fmtVal(m.warning, m.unit)}</div></div>
                      <div><div className="text-zinc-600">Critical</div><div className="text-red-400 font-medium">{fmtVal(m.critical, m.unit)}</div></div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
                      <span className={`text-xs font-medium ${v >= m.target ? 'text-emerald-400' : v >= m.warning ? 'text-amber-400' : 'text-red-400'}`}>
                        {v >= m.target ? 'On Target' : v >= m.warning ? 'Warning' : 'Critical'}
                      </span>
                      {v >= m.target ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
