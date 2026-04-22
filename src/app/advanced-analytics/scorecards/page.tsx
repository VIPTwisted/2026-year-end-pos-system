'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Target, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Plus, ExternalLink } from 'lucide-react'

type Metric = { id: string; name: string; metricType: string; target: number; warning: number; critical: number; unit: string; currentValue?: number }
type Scorecard = { id: string; name: string; description: string | null; isDefault: boolean; metrics: Metric[] }

function statusColor(m: Metric) { const v = m.currentValue ?? 0; return v >= m.target ? 'border-emerald-500 bg-emerald-500/10' : v >= m.warning ? 'border-amber-500 bg-amber-500/10' : 'border-red-500 bg-red-500/10' }
function statusText(m: Metric) { const v = m.currentValue ?? 0; return v >= m.target ? { color: 'text-emerald-400', label: 'On Target' } : v >= m.warning ? { color: 'text-amber-400', label: 'Warning' } : { color: 'text-red-400', label: 'Critical' } }
function fmtVal(v: number, unit: string) { if (unit === '$') { if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`; if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`; return `$${v.toFixed(0)}` } if (unit === '%') return `${v.toFixed(1)}%`; return `${v.toFixed(1)} ${unit}` }

function ScorecardCard({ card }: { card: Scorecard }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-100">{card.name}</span>
            {card.isDefault && <span className="px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">Default</span>}
          </div>
          {card.description && <div className="text-xs text-zinc-500 mt-0.5">{card.description}</div>}
        </div>
        <Link href={`/advanced-analytics/scorecards/${card.id}`} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-400 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Edit
        </Link>
      </div>
      {card.metrics.length === 0 ? (
        <div className="text-xs text-zinc-600 text-center py-4">No metrics. Click Edit to add.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {card.metrics.map(m => {
            const st = statusText(m)
            const v = m.currentValue ?? 0
            const pct = m.target > 0 ? Math.min((v / m.target) * 100, 150) : 0
            return (
              <div key={m.id} className={`border rounded-xl p-3 ${statusColor(m)}`}>
                <div className="text-xs text-zinc-500 mb-1 truncate">{m.name}</div>
                <div className="text-xl font-bold text-zinc-100">{fmtVal(v, m.unit)}</div>
                <div className="text-xs text-zinc-500 mt-0.5">of {fmtVal(m.target, m.unit)}</div>
                <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${v >= m.target ? 'bg-emerald-500' : v >= m.warning ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                  {v >= m.target ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ScorecardsPage() {
  const [scorecards, setScorecards] = useState<Scorecard[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => { fetch('/api/analytics/scorecards').then(r => r.json()).then(d => { setScorecards(d); setLoading(false) }) }, [])

  const createScorecard = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/analytics/scorecards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim() }) })
    const sc = await res.json()
    setScorecards(prev => [...prev, sc])
    setNewName(''); setCreating(false)
  }

  const toggle = (id: string) => setCollapsed(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })

  const defaultCard = scorecards.find(s => s.isDefault)
  const otherCards = scorecards.filter(s => !s.isDefault)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">KPI Scorecards</h1>
          <p className="text-sm text-zinc-400 mt-1">Target vs actual — real-time metric monitoring</p>
        </div>
        <button onClick={() => setCreating(!creating)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Scorecard
        </button>
      </div>

      {creating && (
        <div className="bg-zinc-900 border border-blue-600/50 rounded-xl p-4 flex gap-3">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createScorecard(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Scorecard name..." className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 outline-none text-sm" />
          <button onClick={createScorecard} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">Create</button>
          <button onClick={() => setCreating(false)} className="px-3 py-1.5 hover:bg-zinc-800 text-zinc-400 rounded-lg text-xs transition-colors">Cancel</button>
        </div>
      )}

      {loading ? <div className="text-zinc-500 text-sm">Loading scorecards...</div> : (
        <div className="space-y-4">
          {defaultCard && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Default Scorecard</span>
              </div>
              <ScorecardCard card={defaultCard} />
            </div>
          )}
          {otherCards.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Other Scorecards</div>
              <div className="space-y-2">
                {otherCards.map(sc => (
                  <div key={sc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggle(sc.id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-zinc-100">{sc.name}</span>
                        <span className="text-xs text-zinc-600">{sc.metrics.length} metrics</span>
                      </div>
                      {collapsed.has(sc.id) ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
                    </button>
                    {!collapsed.has(sc.id) && <div className="px-5 pb-5"><ScorecardCard card={sc} /></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {scorecards.length === 0 && (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <div className="text-zinc-400 text-sm">No scorecards yet. Create one above.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
