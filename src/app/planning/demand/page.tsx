'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, BarChart3, Target, AlertCircle, ChevronDown } from 'lucide-react'

interface ForecastRow {
  productName: string
  category: string
  periods: {
    period: string
    forecastQty: number
    actualQty: number | null
    mape: number | null
  }[]
  avgMape: number
}

interface KpiData {
  avgMape: number
  bestCategory: string
  worstCategory: string
  totalProducts: number
}

const HORIZON_OPTIONS = [3, 6, 12] as const
type Horizon = typeof HORIZON_OPTIONS[number]

const CATEGORY_OPTIONS = ['All', 'Electronics', 'Apparel', 'Hardware', 'Consumables', 'Raw Materials']

export default function DemandPlanningPage() {
  const [rows, setRows] = useState<ForecastRow[]>([])
  const [kpis, setKpis] = useState<KpiData>({ avgMape: 0, bestCategory: '—', worstCategory: '—', totalProducts: 0 })
  const [horizon, setHorizon] = useState<Horizon>(12)
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [horizon, category])

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ horizon: String(horizon), category })
    const data = await fetch(`/api/planning/demand?${params}`).then(r => r.json()).catch(() => ({}))
    setRows(Array.isArray(data.rows) ? data.rows : [])
    if (data.kpis) setKpis(data.kpis)
    setLoading(false)
  }

  const mapeColor = (mape: number | null) => {
    if (mape === null) return 'text-zinc-600'
    if (mape < 10) return 'text-emerald-400'
    if (mape < 20) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Statistical Demand Planning</h1>
          <p className="text-zinc-400 text-sm mt-1">12-month rolling forecast with MAPE accuracy tracking</p>
        </div>
        <Link href="/planning/demand/models"
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Forecast Models
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg MAPE',         value: `${kpis.avgMape.toFixed(1)}%`,  icon: Target,      color: kpis.avgMape < 15 ? 'text-emerald-400' : 'text-yellow-400' },
          { label: 'Total Products',   value: kpis.totalProducts,             icon: BarChart3,   color: 'text-blue-400' },
          { label: 'Best Category',    value: kpis.bestCategory,              icon: TrendingUp,  color: 'text-emerald-400' },
          { label: 'Worst Category',   value: kpis.worstCategory,             icon: AlertCircle, color: 'text-red-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className="text-xl font-bold text-zinc-100 truncate">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Horizon:</span>
          <div className="flex gap-1">
            {HORIZON_OPTIONS.map(h => (
              <button key={h} onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${horizon === h ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {h}mo
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Category:</span>
          <div className="relative">
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="appearance-none bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:border-blue-500">
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Forecast table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Rolling Forecast — {horizon} Months</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-10 text-center text-zinc-600 text-sm">Loading forecast data…</div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-10 text-center text-zinc-600 text-sm">No forecast data. Run a forecast model to generate periods.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider sticky left-0 bg-[#16213e]">Product</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Category</th>
                  {rows[0]?.periods.map(p => (
                    <th key={p.period} colSpan={2} className="text-center px-2 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider border-l border-zinc-800">
                      {p.period}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Avg MAPE</th>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-4 py-1 sticky left-0 bg-[#16213e]" />
                  <th className="px-4 py-1" />
                  {rows[0]?.periods.map(p => (
                    <>
                      <th key={`${p.period}-f`} className="text-center px-2 py-1 text-xs text-zinc-600 border-l border-zinc-800">Fcst</th>
                      <th key={`${p.period}-a`} className="text-center px-2 py-1 text-xs text-zinc-600">Actual</th>
                    </>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.productName} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-4 py-3 text-zinc-100 font-medium sticky left-0 bg-[#16213e]">{row.productName}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{row.category}</td>
                    {row.periods.map(p => (
                      <>
                        <td key={`${p.period}-f`} className="px-2 py-3 text-center text-zinc-300 text-xs border-l border-zinc-800/50">
                          {p.forecastQty.toLocaleString()}
                        </td>
                        <td key={`${p.period}-a`} className="px-2 py-3 text-center text-xs">
                          {p.actualQty !== null
                            ? <span className={p.actualQty > p.forecastQty ? 'text-emerald-400' : 'text-yellow-400'}>{p.actualQty.toLocaleString()}</span>
                            : <span className="text-zinc-600">—</span>}
                        </td>
                      </>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-mono font-medium ${mapeColor(row.avgMape)}`}>
                        {row.avgMape > 0 ? `${row.avgMape.toFixed(1)}%` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
