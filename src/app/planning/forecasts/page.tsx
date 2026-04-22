'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, Eye, RefreshCw } from 'lucide-react'

interface ForecastModel {
  id: string; name: string; modelType: string; periodType: string
  horizon: number; smoothingAlpha: number; isActive: boolean
  _count: { entries: number }
}

const INIT = { name: '', modelType: 'moving-average', periodType: 'monthly', horizon: 12, smoothingAlpha: 0.3 }

export default function ForecastsPage() {
  const [models, setModels] = useState<ForecastModel[]>([])
  const [form, setForm] = useState(INIT)
  const [showForm, setShowForm] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  useEffect(() => { fetchModels() }, [])

  async function fetchModels() {
    const data = await fetch('/api/planning/forecasts').then(r => r.json())
    setModels(Array.isArray(data) ? data : [])
  }

  async function create() {
    if (!form.name.trim()) return
    await fetch('/api/planning/forecasts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm(INIT); setShowForm(false); fetchModels()
  }

  async function generate(id: string) {
    setGeneratingId(id)
    await fetch(`/api/planning/forecasts/${id}/generate`, { method: 'POST' })
    setGeneratingId(null); fetchModels()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Demand Forecasting</h1>
          <p className="text-zinc-400 text-sm mt-1">Statistical forecasting — moving average, exponential smoothing, trend</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />New Model
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">New Forecast Model</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Model Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Widget Alpha Forecast"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Model Type</label>
              <select value={form.modelType} onChange={e => setForm({ ...form, modelType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="moving-average">Moving Average</option>
                <option value="exponential-smoothing">Exponential Smoothing</option>
                <option value="linear-trend">Linear Trend</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Period</label>
              <select value={form.periodType} onChange={e => setForm({ ...form, periodType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Horizon</label>
              <input type="number" value={form.horizon} onChange={e => setForm({ ...form, horizon: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={create} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create</button>
            <button onClick={() => { setShowForm(false); setForm(INIT) }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">
            {['Name', 'Model Type', 'Period', 'Horizon', 'Status', 'Entries', 'Actions'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {models.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-zinc-600">No forecast models yet.</td></tr>}
            {models.map(m => (
              <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-5 py-3 text-zinc-100 font-medium">{m.name}</td>
                <td className="px-5 py-3 text-zinc-400 capitalize">{m.modelType.replace('-', ' ')}</td>
                <td className="px-5 py-3 text-zinc-400 capitalize">{m.periodType}</td>
                <td className="px-5 py-3 text-zinc-400">{m.horizon}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${m.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                    {m.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-300">{m._count.entries}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => generate(m.id)} disabled={generatingId === m.id}
                      className="flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-1 rounded transition-colors disabled:opacity-50">
                      {generatingId === m.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}Generate
                    </button>
                    <Link href={`/planning/forecasts/${m.id}`} className="flex items-center gap-1 text-xs bg-zinc-700 text-zinc-300 hover:bg-zinc-600 px-2 py-1 rounded transition-colors">
                      <Eye className="w-3 h-3" />View
                    </Link>
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
