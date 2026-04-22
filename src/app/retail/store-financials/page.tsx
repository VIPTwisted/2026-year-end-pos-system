'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, FileText,
  Banknote, Download, Mail, ChevronDown,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoreOption { id: string; number: string; name: string }
interface HourlyBar { hour: string; sales: number }
interface PaymentMethod { method: string; amount: number; pct: number }
interface TopProduct { rank: number; name: string; units: number; revenue: number; margin: number }
interface CashManagement {
  openingFloat: number
  cashIn: number
  cashOut: number
  expectedClose: number
  actualClose: number
  variance: number
}

interface ApiData {
  stores: StoreOption[]
  selectedStore: StoreOption
  kpis: {
    todaySales: number
    weekToDate: number
    monthToDate: number
    vsLastMonthPct: number
  }
  hourlyBars: HourlyBar[]
  paymentMethods: PaymentMethod[]
  topProducts: TopProduct[]
  cashManagement: CashManagement
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Donut Chart (SVG) ────────────────────────────────────────────────────────
const DONUT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']

function DonutChart({ slices }: { slices: PaymentMethod[] }) {
  const R = 60, CX = 80, CY = 80, HOLE = 38
  let cumDeg = -90

  const arcs = slices.map((s, i) => {
    const deg = (s.pct / 100) * 360
    const startRad = (cumDeg * Math.PI) / 180
    cumDeg += deg
    const endRad = (cumDeg * Math.PI) / 180
    const large = deg > 180 ? 1 : 0
    const x1 = CX + R * Math.cos(startRad)
    const y1 = CY + R * Math.sin(startRad)
    const x2 = CX + R * Math.cos(endRad)
    const y2 = CY + R * Math.sin(endRad)
    const xi1 = CX + HOLE * Math.cos(startRad)
    const yi1 = CY + HOLE * Math.sin(startRad)
    const xi2 = CX + HOLE * Math.cos(endRad)
    const yi2 = CY + HOLE * Math.sin(endRad)
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${HOLE} ${HOLE} 0 ${large} 0 ${xi1} ${yi1} Z`
    return { d, color: DONUT_COLORS[i % DONUT_COLORS.length] }
  })

  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill={arc.color} fillOpacity={0.85} stroke="#18181b" strokeWidth="1.5" />
      ))}
      <circle cx={CX} cy={CY} r={HOLE - 2} fill="#18181b" />
    </svg>
  )
}

// ─── Bar Chart (SVG) ──────────────────────────────────────────────────────────
function HourlyBarChart({ bars }: { bars: HourlyBar[] }) {
  const W = 640, H = 140, PAD_L = 50, PAD_B = 30, INNER_W = W - PAD_L - 20
  const max = Math.max(...bars.map(b => b.sales), 1)
  const barW = Math.floor(INNER_W / bars.length) - 3
  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg width={W} height={H + PAD_B} viewBox={`0 0 ${W} ${H + PAD_B}`} className="w-full overflow-visible">
      {/* Grid */}
      {gridLines.map(f => {
        const y = H - f * H
        const label = fmt(f * max).replace('.00', '')
        return (
          <g key={f}>
            <line x1={PAD_L} x2={W - 20} y1={y} y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#71717a">{label}</text>
          </g>
        )
      })}

      {/* Bars */}
      {bars.map((bar, i) => {
        const bh = (bar.sales / max) * H
        const bx = PAD_L + i * (INNER_W / bars.length) + 2
        const by = H - bh
        return (
          <g key={bar.hour}>
            <rect x={bx} y={by} width={barW} height={bh} rx={3}
              fill="#3b82f6" fillOpacity={0.7} />
            <text x={bx + barW / 2} y={H + PAD_B - 4} textAnchor="middle" fontSize="9" fill="#71717a">
              {bar.hour.replace(' ', '\n')}
            </text>
          </g>
        )
      })}

      {/* Axes */}
      <line x1={PAD_L} x2={PAD_L} y1={0} y2={H} stroke="#3f3f46" strokeWidth="1" />
      <line x1={PAD_L} x2={W - 20} y1={H} y2={H} stroke="#3f3f46" strokeWidth="1" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StoreFinancialsPage() {
  const [data, setData] = useState<ApiData | null>(null)
  const [storeId, setStoreId] = useState('STR001')
  const [loading, setLoading] = useState(true)

  const load = useCallback((id: string) => {
    setLoading(true)
    fetch(`/api/retail/store-financials?storeId=${id}`)
      .then(r => r.json())
      .then((d: ApiData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load(storeId) }, [storeId, load])

  if (!data && loading) {
    return (
      <>
        <TopBar title="Store Financials" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-zinc-400 text-sm animate-pulse">Loading financials…</p>
        </main>
      </>
    )
  }

  const {
    stores = [], kpis, hourlyBars = [], paymentMethods = [], topProducts = [], cashManagement,
  } = data ?? {}

  const vsPct = kpis?.vsLastMonthPct ?? 0
  const vsPositive = vsPct >= 0

  return (
    <>
      <TopBar title="Store Financials" />
      <main className="flex-1 overflow-auto p-6 space-y-6">

        {/* Store Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Store</label>
          <div className="relative">
            <select
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-700 bg-zinc-800 pl-3 pr-8 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {stores.map(s => (
                <option key={s.id} value={s.id}>#{s.number} {s.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          </div>
          {loading && <span className="text-xs text-zinc-500 animate-pulse">Loading…</span>}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Today's Sales</p>
              <DollarSign className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-2xl font-bold text-zinc-100">{fmt(kpis?.todaySales ?? 0)}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Week to Date</p>
              <Calendar className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-2xl font-bold text-zinc-100">{fmt(kpis?.weekToDate ?? 0)}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Month to Date</p>
              <Calendar className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-2xl font-bold text-zinc-100">{fmt(kpis?.monthToDate ?? 0)}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">vs Last Month</p>
              {vsPositive ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
            <p className={`text-2xl font-bold ${vsPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {vsPositive ? '+' : ''}{vsPct}%
            </p>
          </div>
        </div>

        {/* Action Ribbon */}
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors">
            <FileText className="h-3.5 w-3.5" /> End of Day Report
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Banknote className="h-3.5 w-3.5" /> Cash Count
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            <FileText className="h-3.5 w-3.5" /> Z-Report
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            <FileText className="h-3.5 w-3.5" /> X-Report
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Mail className="h-3.5 w-3.5" /> Email Report
          </button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Hourly Sales */}
          <div className="xl:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">Sales by Hour</h2>
            <div className="overflow-x-auto">
              <HourlyBarChart bars={hourlyBars} />
            </div>
          </div>

          {/* Payment Methods Donut */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">Payment Methods</h2>
            <div className="flex items-center gap-6">
              <DonutChart slices={paymentMethods} />
              <div className="space-y-2 min-w-0">
                {paymentMethods.map((pm, i) => (
                  <div key={pm.method} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                    />
                    <span className="text-xs text-zinc-400 truncate">{pm.method}</span>
                    <span className="ml-auto text-xs font-medium text-zinc-200">{pm.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Top Products + Cash Management */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Top 10 Products */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100">Top 10 Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500 w-12">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Units</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.rank} className={`border-b border-zinc-800/50 last:border-0 ${i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/40'}`}>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs font-bold ${
                          p.rank === 1 ? 'text-amber-400' :
                          p.rank === 2 ? 'text-zinc-400' :
                          p.rank === 3 ? 'text-orange-700' : 'text-zinc-600'
                        }`}>#{p.rank}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-200">{p.name}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{p.units}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-medium text-zinc-100">{fmt(p.revenue)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="text-xs font-medium text-emerald-400">{p.margin}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Management */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100">Cash Management</h2>
            </div>
            <div className="p-5 space-y-1">
              {cashManagement && ([
                { label: 'Opening Float',    value: cashManagement.openingFloat,    accent: false },
                { label: 'Cash In',          value: cashManagement.cashIn,          accent: false },
                { label: 'Cash Out',         value: -cashManagement.cashOut,        accent: false },
                { label: 'Expected Close',   value: cashManagement.expectedClose,   accent: false },
                { label: 'Actual Close',     value: cashManagement.actualClose,     accent: false },
              ] as { label: string; value: number; accent: boolean }[]).map(row => (
                <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-zinc-800/60 last:border-0">
                  <span className="text-sm text-zinc-400">{row.label}</span>
                  <span className="text-sm font-medium text-zinc-100">{fmt(Math.abs(row.value))}</span>
                </div>
              ))}

              {cashManagement && (
                <div className={`flex items-center justify-between py-3 mt-2 rounded-lg px-3 ${
                  cashManagement.variance < 0
                    ? 'bg-red-950/30 border border-red-900/50'
                    : 'bg-emerald-950/20 border border-emerald-900/40'
                }`}>
                  <span className="text-sm font-semibold text-zinc-200">Variance</span>
                  <span className={`text-sm font-bold ${cashManagement.variance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {cashManagement.variance < 0 ? '-' : '+'}{fmt(Math.abs(cashManagement.variance))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
