'use client'
import { useEffect, useState, use } from 'react'
import { TrendingUp, RefreshCw } from 'lucide-react'

interface ForecastEntry {
  id: string; period: string; forecastQty: number
  actualQty: number | null; variance: number | null; confidence: number | null
}
interface ForecastModel {
  id: string; name: string; modelType: string; periodType: string
  horizon: number; smoothingAlpha: number; isActive: boolean; entries: ForecastEntry[]
}

export default function ForecastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [model, setModel] = useState<ForecastModel | null>(null)
  const [generating, setGenerating] = useState(false)
  const [settings, setSettings] = useState({ name: '', modelType: 'moving-average', periodType: 'monthly', horizon: 12, smoothingAlpha: 0.3 })

  useEffect(() => { fetchModel() }, [id])

  async function fetchModel() {
    const data = await fetch(`/api/planning/forecasts/${id}`).then(r => r.json())
    setModel(data)
    setSettings({ name: data.name, modelType: data.modelType, periodType: data.periodType, horizon: data.horizon, smoothingAlpha: data.smoothingAlpha })
  }

  async function generate() {
    setGenerating(true)
    await fetch(`/api/planning/forecasts/${id}/generate`, { method: 'POST' })
    setGenerating(false); fetchModel()
  }

  async function saveSettings() {
    await fetch(`/api/planning/forecasts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    fetchModel()
  }

  if (!model) return <div className="p-6 text-zinc-500">Loading...</div>

  const barMax = Math.max(...model.entries.map(e => e.forecastQty), ...model.entries.filter(e => e.actualQty != null).map(e => e.actualQty!), 1)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{model.name}</h1>
          <p className="text-zinc-400 text-sm mt-1 capitalize">{model.modelType.replace('-', ' ')} · {model.periodType} · {model.horizon} periods</p>
        </div>
        <button onClick={generate} disabled={generating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}Generate Forecast
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-100">Model Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-zinc-400 mb-1">Name</label>
            <input value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Model Type</label>
            <select value={settings.modelType} onChange={e => setSettings({ ...settings, modelType: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
              <option value="moving-average">Moving Average</option>
              <option value="exponential-smoothing">Exponential Smoothing</option>
              <option value="linear-trend">Linear Trend</option>
              <option value="seasonal">Seasonal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Horizon</label>
            <input type="number" value={settings.horizon} onChange={e => setSettings({ ...settings, horizon: Number(e.target.value) })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save Settings</button>
      </div>

      {model.entries.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-4">Forecast vs Actual</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500" /><span className="text-xs text-zinc-400">Forecast</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-xs text-zinc-400">Actual</span></div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {model.entries.slice(0, 24).map(e => (
              <div key={e.id} className="grid grid-cols-[80px_1fr] gap-3 items-center">
                <span className="text-xs text-zinc-500 text-right font-mono">{e.period}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (e.forecastQty / barMax) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-zinc-400 w-14 text-right">{e.forecastQty.toFixed(0)}</span>
                  </div>
                  {e.actualQty != null && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (e.actualQty / barMax) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-zinc-400 w-14 text-right">{e.actualQty.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">Forecast Entries ({model.entries.length})</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">
            {['Period', 'Forecast Qty', 'Actual Qty', 'Variance', 'Confidence'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {model.entries.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-zinc-600">No entries yet — click Generate Forecast</td></tr>}
            {model.entries.map(e => {
              const variance = e.actualQty != null ? e.actualQty - e.forecastQty : null
              const variancePct = e.actualQty != null && e.forecastQty > 0 ? ((e.actualQty - e.forecastQty) / e.forecastQty * 100) : null
              return (
                <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-5 py-3 text-zinc-300 font-mono text-xs">{e.period}</td>
                  <td className="px-5 py-3 text-zinc-100">{e.forecastQty.toFixed(1)}</td>
                  <td className="px-5 py-3 text-zinc-300">{e.actualQty != null ? e.actualQty.toFixed(1) : <span className="text-zinc-600">—</span>}</td>
                  <td className="px-5 py-3">
                    {variance != null ? (
                      <span className={variance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {variance >= 0 ? '+' : ''}{variance.toFixed(1)} ({variancePct?.toFixed(1)}%)
                      </span>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    {e.confidence != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${e.confidence * 100}%` }} />
                        </div>
                        <span className="text-xs text-zinc-400">{(e.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ) : <span className="text-zinc-600">—</span>}
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
