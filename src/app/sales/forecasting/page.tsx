'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Target, DollarSign, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Forecast = {
  id: string
  period: string
  fiscalYear: string
  ownerName: string | null
  forecastedRevenue: number
  committedRevenue: number
  bestCaseRevenue: number
  actualRevenue: number
  status: string
  notes: string | null
}

const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4']
const YEARS = ['2024', '2025', '2026', '2027']

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default function ForecastingPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [period, setPeriod] = useState('Q2')
  const [year, setYear] = useState('2026')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ period: 'Q2', fiscalYear: '2026', ownerName: '', forecastedRevenue: '', committedRevenue: '', bestCaseRevenue: '', actualRevenue: '' })

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/sales/forecasts?period=${period}&fiscalYear=${year}`)
    setForecasts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [period, year])

  async function create() {
    await fetch('/api/sales/forecasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        forecastedRevenue: parseFloat(form.forecastedRevenue) || 0,
        committedRevenue: parseFloat(form.committedRevenue) || 0,
        bestCaseRevenue: parseFloat(form.bestCaseRevenue) || 0,
        actualRevenue: parseFloat(form.actualRevenue) || 0,
      }),
    })
    setShowModal(false)
    load()
  }

  const totals = forecasts.reduce(
    (acc, f) => ({
      forecasted: acc.forecasted + f.forecastedRevenue,
      committed: acc.committed + f.committedRevenue,
      bestCase: acc.bestCase + f.bestCaseRevenue,
      actual: acc.actual + f.actualRevenue,
    }),
    { forecasted: 0, committed: 0, bestCase: 0, actual: 0 }
  )

  const kpis = [
    { label: 'Forecasted', value: fmt(totals.forecasted), icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Committed', value: fmt(totals.committed), icon: Target, color: 'text-amber-400' },
    { label: 'Best Case', value: fmt(totals.bestCase), icon: BarChart3, color: 'text-violet-400' },
    { label: 'Actual', value: fmt(totals.actual), icon: DollarSign, color: 'text-emerald-400' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Sales Forecasting</h1>
          <p className="text-sm text-zinc-400 mt-1">Revenue projections by period</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
            {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors">
            <Plus className="w-4 h-4" /> New Forecast
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-xs text-zinc-500">{kpi.label}</span>
              </div>
              <p className="text-xl font-semibold text-zinc-100">{kpi.value}</p>
            </div>
          )
        })}
      </div>

      {/* Forecasts Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Owner</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Period</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-medium">Forecasted</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-medium">Committed</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-medium">Best Case</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-medium">Actual</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>}
            {!loading && forecasts.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">No forecasts for {period} {year}</td></tr>}
            {forecasts.map((f) => (
              <tr key={f.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-200">{f.ownerName || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{f.period} {f.fiscalYear}</td>
                <td className="px-4 py-3 text-right text-blue-400 font-mono">{fmt(f.forecastedRevenue)}</td>
                <td className="px-4 py-3 text-right text-amber-400 font-mono">{fmt(f.committedRevenue)}</td>
                <td className="px-4 py-3 text-right text-violet-400 font-mono">{fmt(f.bestCaseRevenue)}</td>
                <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(f.actualRevenue)}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', f.status === 'closed' ? 'bg-zinc-700 text-zinc-400' : 'bg-emerald-500/20 text-emerald-400')}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">New Forecast</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Period</label>
                <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                  {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Fiscal Year</label>
                <select value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Owner</label>
              <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            {[{ k: 'forecastedRevenue', label: 'Forecasted Revenue' }, { k: 'committedRevenue', label: 'Committed Revenue' }, { k: 'bestCaseRevenue', label: 'Best Case Revenue' }, { k: 'actualRevenue', label: 'Actual Revenue' }].map(({ k, label }) => (
              <div key={k}>
                <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                <input type="number" value={(form as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={create} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
