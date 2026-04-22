'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Plus, CheckCircle, RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Forecast {
  id: string
  forecastName: string
  period: string
  periodType: string
  status: string
  notes: string | null
  createdAt: string
  lines: { id: string; actualQty: number | null; forecastedQty: number; variance: number | null }[]
}

const statusBadge: Record<string, string> = {
  draft: 'text-zinc-300 bg-zinc-800 border-zinc-700',
  active: 'text-emerald-300 bg-emerald-950/50 border-emerald-700',
  archived: 'text-zinc-500 bg-zinc-900 border-zinc-800',
}

const tabs = ['All', 'Draft', 'Active', 'Archived'] as const
type Tab = (typeof tabs)[number]

function computeAccuracy(lines: Forecast['lines']): number | null {
  const withActuals = lines.filter((l) => l.actualQty !== null && l.forecastedQty > 0)
  if (withActuals.length === 0) return null
  const accuracies = withActuals.map((l) => {
    const err = Math.abs((l.variance ?? 0) / l.forecastedQty) * 100
    return Math.max(0, 100 - err)
  })
  return Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
}

export default function ForecastsPage() {
  const [tab, setTab] = useState<Tab>('All')
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ forecastName: '', periodType: 'monthly', period: '', notes: '' })

  async function load(status?: string) {
    setLoading(true)
    try {
      const url = status && status !== 'All'
        ? `/api/forecasting/forecasts?status=${status.toLowerCase()}`
        : '/api/forecasting/forecasts'
      const res = await fetch(url)
      const data = await res.json()
      setForecasts(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(tab) }, [tab])

  async function createForecast() {
    if (!form.forecastName || !form.period) return
    setCreating(true)
    try {
      await fetch('/api/forecasting/forecasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setShowModal(false)
      setForm({ forecastName: '', periodType: 'monthly', period: '', notes: '' })
      load(tab)
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  async function activate(id: string) {
    await fetch(`/api/forecasting/forecasts/${id}/activate`, { method: 'POST' })
    load(tab)
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Demand Forecasts
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Create and manage period demand forecasts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(tab)}
            className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Forecast
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg w-fit border border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Forecast Name</th>
              <th className="text-left px-4 py-3">Period</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-center px-4 py-3">Lines</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-center px-4 py-3">Accuracy</th>
              <th className="text-left px-4 py-3">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : forecasts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-zinc-500 py-12">
                  No forecasts found. Create your first forecast.
                </td>
              </tr>
            ) : (
              forecasts.map((f) => {
                const accuracy = computeAccuracy(f.lines)
                return (
                  <tr key={f.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <a href={`/forecasting/forecasts/${f.id}`} className="text-zinc-100 hover:text-blue-400 font-medium transition-colors">
                        {f.forecastName}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{f.period}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border',
                        f.periodType === 'monthly'
                          ? 'text-blue-300 bg-blue-950/40 border-blue-800'
                          : 'text-purple-300 bg-purple-950/40 border-purple-800'
                      )}>
                        {f.periodType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-300">{f.lines.length}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusBadge[f.status] ?? statusBadge.draft)}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {accuracy !== null ? (
                        <span className={cn(
                          'text-sm font-semibold',
                          accuracy >= 80 ? 'text-emerald-400' : accuracy >= 60 ? 'text-amber-400' : 'text-red-400'
                        )}>
                          {accuracy}%
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {f.status === 'draft' && (
                        <button
                          onClick={() => activate(f.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-950/50 border border-emerald-800 rounded text-emerald-300 text-xs hover:bg-emerald-900/50 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Demand Forecast</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Forecast Name *</label>
                <input
                  type="text"
                  value={form.forecastName}
                  onChange={(e) => setForm({ ...form, forecastName: e.target.value })}
                  placeholder="e.g. May 2026 Monthly Forecast"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Period Type</label>
                  <select
                    value={form.periodType}
                    onChange={(e) => setForm({ ...form, periodType: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Period *</label>
                  <input
                    type="text"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    placeholder={form.periodType === 'monthly' ? '2026-05' : '2026-W20'}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Optional notes..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createForecast}
                disabled={creating || !form.forecastName || !form.period}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? 'Creating…' : 'Create Forecast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
