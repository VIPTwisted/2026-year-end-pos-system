'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { TrendingDown, TrendingUp, DollarSign, Filter } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface KPI {
  totalCostsMTD: number
  allocatedCosts: number
  varianceFromBudget: number
}

interface CostEntry {
  id: string
  account: string
  costElement: string
  costCenter: string
  actual: number
  budget: number
  variance: number
  variancePct: number
}

const COST_CENTERS = ['All', 'Assembly', 'Manufacturing', 'Facilities', 'QA']
const COST_ELEMENT_TYPES = ['All', 'Fixed', 'Variable', 'Semi-variable']
const DATE_RANGES = ['MTD', 'QTD', 'YTD', 'Custom']

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const MAX_BAR = 500000

export default function CostAccountingPage() {
  const [kpi, setKpi] = useState<KPI>({ totalCostsMTD: 0, allocatedCosts: 0, varianceFromBudget: 0 })
  const [ledger, setLedger] = useState<CostEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [centerFilter, setCenterFilter] = useState('All')
  const [elementTypeFilter, setElementTypeFilter] = useState('All')
  const [dateRange, setDateRange] = useState('MTD')

  useEffect(() => {
    fetch('/api/finance/cost-accounting')
      .then(r => r.json())
      .then(d => { setKpi(d.kpi); setLedger(d.ledger); setLoading(false) })
  }, [])

  const filtered = ledger.filter(e => centerFilter === 'All' || e.costCenter === centerFilter)

  const chartCenters = ['Assembly', 'Manufacturing', 'Facilities', 'QA']
  const chartData = chartCenters.map(cc => {
    const rows = ledger.filter(e => e.costCenter === cc)
    return {
      center: cc,
      actual: rows.reduce((s, e) => s + e.actual, 0),
      budget: rows.reduce((s, e) => s + e.budget, 0),
    }
  })

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Cost Accounting"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Cost Accounting', href: '/finance/cost-accounting' },
        ]}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Filters */}
        <aside className="w-52 shrink-0 border-r p-4 flex flex-col gap-5 overflow-y-auto" style={{ borderColor: 'rgba(99,102,241,0.12)', background: '#0f1129' }}>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Cost center
            </p>
            <div className="space-y-0.5">
              {COST_CENTERS.map(cc => (
                <button
                  key={cc}
                  onClick={() => setCenterFilter(cc)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] transition-colors ${centerFilter === cc ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                >
                  {cc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Date range</p>
            <div className="space-y-0.5">
              {DATE_RANGES.map(dr => (
                <button
                  key={dr}
                  onClick={() => setDateRange(dr)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] transition-colors ${dateRange === dr ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                >
                  {dr}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Cost element type</p>
            <div className="space-y-0.5">
              {COST_ELEMENT_TYPES.map(et => (
                <button
                  key={et}
                  onClick={() => setElementTypeFilter(et)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] transition-colors ${elementTypeFilter === et ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                >
                  {et}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto p-5 flex flex-col gap-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <KpiCard
              label="Total costs MTD"
              value={fmt(kpi.totalCostsMTD)}
              icon={<DollarSign className="w-5 h-5 text-indigo-400" />}
              sub="April 2026"
              accent="#6366f1"
            />
            <KpiCard
              label="Allocated costs"
              value={fmt(kpi.allocatedCosts)}
              icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
              sub={`${kpi.totalCostsMTD ? Math.round((kpi.allocatedCosts / kpi.totalCostsMTD) * 100) : 0}% of total`}
              accent="#3b82f6"
            />
            <KpiCard
              label="Variance from budget"
              value={fmt(kpi.varianceFromBudget)}
              icon={kpi.varianceFromBudget < 0 ? <TrendingDown className="w-5 h-5 text-red-400" /> : <TrendingUp className="w-5 h-5 text-emerald-400" />}
              sub={kpi.varianceFromBudget < 0 ? 'Over budget' : 'Under budget'}
              accent={kpi.varianceFromBudget < 0 ? '#ef4444' : '#10b981'}
              negative={kpi.varianceFromBudget < 0}
            />
          </div>

          {/* SVG Chart */}
          <div className="rounded-xl border p-5" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <h3 className="text-[12px] font-semibold text-zinc-300 mb-4">Actual vs Budget by Cost Center</h3>
            <div className="space-y-4">
              {chartData.map(d => (
                <div key={d.center} className="grid grid-cols-[7rem_1fr] items-center gap-3">
                  <span className="text-[11px] text-zinc-400 text-right">{d.center}</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <svg width="100%" height="14" className="flex-1">
                        <rect x={0} y={2} width="100%" height={10} rx={5} fill="rgba(255,255,255,0.04)" />
                        <rect
                          x={0} y={2}
                          width={`${Math.min((d.actual / MAX_BAR) * 100, 100)}%`}
                          height={10} rx={5}
                          fill={d.actual > d.budget ? '#f97316' : '#6366f1'}
                        />
                      </svg>
                      <span className="text-[10px] font-mono text-zinc-300 w-16 shrink-0">{fmt(d.actual)}</span>
                      <span className="text-[9px] text-zinc-600 w-10 shrink-0">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="100%" height="14" className="flex-1">
                        <rect x={0} y={2} width="100%" height={10} rx={5} fill="rgba(255,255,255,0.04)" />
                        <rect
                          x={0} y={2}
                          width={`${Math.min((d.budget / MAX_BAR) * 100, 100)}%`}
                          height={10} rx={5}
                          fill="#334155"
                        />
                      </svg>
                      <span className="text-[10px] font-mono text-zinc-500 w-16 shrink-0">{fmt(d.budget)}</span>
                      <span className="text-[9px] text-zinc-600 w-10 shrink-0">Budget</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <LegendDot color="#6366f1" label="Actual (on budget)" />
              <LegendDot color="#f97316" label="Actual (over budget)" />
              <LegendDot color="#334155" label="Budget" />
            </div>
          </div>

          {/* Cost Ledger Table */}
          {loading ? (
            <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">Loading ledger…</div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(99,102,241,0.15)', background: '#16213e' }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(99,102,241,0.1)', background: '#0d0e24' }}>
                <span className="text-[12px] font-semibold text-zinc-300">Cost Ledger</span>
                <span className="text-[11px] text-zinc-600">{filtered.length} entries · {dateRange}</span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(13,14,36,0.5)' }}>
                    {['Account','Cost element','Cost center','Actual','Budget','Variance','%'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-zinc-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => (
                    <tr
                      key={e.id}
                      className="hover:bg-indigo-500/5 transition-colors"
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <td className="px-3 py-2.5 font-mono text-zinc-400 text-[11px]">{e.account}</td>
                      <td className="px-3 py-2.5 text-zinc-200">{e.costElement}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400">{e.costCenter}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-zinc-100">{fmtFull(e.actual)}</td>
                      <td className="px-3 py-2.5 font-mono text-zinc-500">{fmtFull(e.budget)}</td>
                      <td className={`px-3 py-2.5 font-mono font-semibold ${e.variance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {e.variance < 0 ? '' : '+'}{fmtFull(e.variance)}
                      </td>
                      <td className={`px-3 py-2.5 font-mono text-[11px] ${e.variancePct < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {e.variancePct > 0 ? '+' : ''}{e.variancePct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, sub, accent, negative }: { label: string; value: string; icon: React.ReactNode; sub: string; accent: string; negative?: boolean }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-500">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
          {icon}
        </div>
      </div>
      <span className={`text-2xl font-bold font-mono ${negative ? 'text-red-400' : ''}`} style={!negative ? { color: accent } : undefined}>
        {value}
      </span>
      <span className="text-[10px] text-zinc-600">{sub}</span>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-2 rounded-sm inline-block" style={{ background: color }} />
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  )
}
