'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface KPIs {
  totalOrders: number
  onTimeInFullPct: number
  incompletePct: number
  earlyPct: number
  latePct: number
}

interface DateEntry {
  label: string
  onTime: number
  early: number
  late: number
  incomplete: number
  linePct: number
}

interface ProductEntry {
  label: string
  onTime: number
  early: number
  late: number
  incomplete: number
}

interface Bottom10Row {
  itemId: string
  productName: string
  onTimeInFull: number
  totalOrders: number
  pct: number
}

interface PerfData {
  kpis: KPIs
  byDate: DateEntry[]
  byProduct: ProductEntry[]
  plannedByDate: DateEntry[]
  bottom10: Bottom10Row[]
  itemGroups: string[]
  products: string[]
}

// ─── Chart Legend ─────────────────────────────────────────────────────────────

const LEGEND = [
  { color: '#6366f1', label: 'On-time & in full' },
  { color: '#1e3a5f', label: 'Early & in full' },
  { color: '#0e7490', label: 'Late & in full' },
  { color: '#1e293b', label: 'Incomplete' },
]
const LINE_COLOR = '#22c55e'

// ─── Stacked Bar + Line Chart ─────────────────────────────────────────────────

function StackedBarLineChart({
  data,
  bars,
  line,
  xLabels,
  height = 200,
  rightAxisMax = 100,
  rightAxisMin = 75,
}: {
  data: { label: string; values: number[]; lineVal?: number }[]
  bars: { color: string; label: string }[]
  line?: { color: string; label: string }
  xLabels: string[]
  height?: number
  rightAxisMax?: number
  rightAxisMin?: number
}) {
  const w = 380
  const padL = 40
  const padR = 50
  const padB = 32
  const padT = 10
  const chartW = w - padL - padR
  const chartH = height - padB - padT
  const maxBar = Math.max(...data.map((d) => d.values.reduce((a, b) => a + b, 0)), 1)

  // Y-axis ticks (bar, left side)
  const yTicks = [0, 25, 50, 75, 100]

  // Right axis (line %)
  const rTicks = [rightAxisMin, Math.round((rightAxisMin + rightAxisMax) / 2), rightAxisMax]

  // Build line points
  const linePoints = data
    .map((d, i) => {
      if (d.lineVal == null) return null
      const x = padL + (i + 0.5) * (chartW / data.length)
      const pct = (d.lineVal - rightAxisMin) / (rightAxisMax - rightAxisMin)
      const y = padT + chartH - pct * chartH
      return `${x},${y}`
    })
    .filter(Boolean)
    .join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} style={{ overflow: 'visible' }}>
      {/* Y-axis ticks left */}
      {yTicks.map((t) => {
        const y = padT + chartH - (t / 100) * chartH
        return (
          <g key={t}>
            <line x1={padL - 4} y1={y} x2={padL + chartW} y2={y} stroke="rgba(99,102,241,0.12)" strokeWidth={1} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
              {t}
            </text>
          </g>
        )
      })}

      {/* Right Y-axis ticks */}
      {rTicks.map((t) => {
        const pct = (t - rightAxisMin) / (rightAxisMax - rightAxisMin)
        const y = padT + chartH - pct * chartH
        return (
          <text key={t} x={padL + chartW + 4} y={y + 4} textAnchor="start" fontSize="9" fill="#64748b">
            {t}%
          </text>
        )
      })}

      {/* Bars */}
      {data.map((d, i) => {
        let yOff = 0
        const barW = Math.max((chartW / data.length) * 0.6, 8)
        const x = padL + (i + 0.5) * (chartW / data.length) - barW / 2
        return (
          <g key={i}>
            {d.values.map((v, j) => {
              const bh = (v / maxBar) * chartH
              const y = padT + chartH - yOff - bh
              yOff += bh
              return (
                <rect key={j} x={x} y={y} width={barW} height={Math.max(bh, 0)} fill={bars[j]?.color} rx={1} />
              )
            })}
          </g>
        )
      })}

      {/* Line */}
      {line && linePoints && (
        <polyline points={linePoints} fill="none" stroke={line.color} strokeWidth={2} strokeLinejoin="round" />
      )}
      {/* Line dots */}
      {line &&
        data.map((d, i) => {
          if (d.lineVal == null) return null
          const x = padL + (i + 0.5) * (chartW / data.length)
          const pct = (d.lineVal - rightAxisMin) / (rightAxisMax - rightAxisMin)
          const y = padT + chartH - pct * chartH
          return <circle key={i} cx={x} cy={y} r={3} fill={line.color} />
        })}

      {/* X axis labels */}
      {xLabels.map((l, i) => (
        <text
          key={i}
          x={padL + (i + 0.5) * (chartW / xLabels.length)}
          y={height - 4}
          textAnchor="middle"
          fontSize="9"
          fill="#64748b"
        >
          {l}
        </text>
      ))}

      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="rgba(99,102,241,0.3)" strokeWidth={1} />
      <line
        x1={padL}
        y1={padT + chartH}
        x2={padL + chartW}
        y2={padT + chartH}
        stroke="rgba(99,102,241,0.3)"
        strokeWidth={1}
      />
    </svg>
  )
}

// ─── Chart Legend Row ─────────────────────────────────────────────────────────

function LegendRow({
  items,
  line,
}: {
  items: { color: string; label: string }[]
  line?: { color: string; label: string }
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 mb-2">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="inline-block w-3 h-2.5 rounded-sm" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
      {line && (
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <svg width="14" height="10">
            <line x1="0" y1="5" x2="14" y2="5" stroke={line.color} strokeWidth="2" />
            <circle cx="7" cy="5" r="2.5" fill={line.color} />
          </svg>
          {line.label}
        </span>
      )}
    </div>
  )
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  open,
  onToggle,
  data,
  selectedGroups,
  setSelectedGroups,
  selectedProducts,
  setSelectedProducts,
}: {
  open: boolean
  onToggle: () => void
  data: PerfData | null
  selectedGroups: Set<string>
  setSelectedGroups: (s: Set<string>) => void
  selectedProducts: Set<string>
  setSelectedProducts: (s: Set<string>) => void
}) {
  const [dateFrom] = useState('01/02/2016')
  const [dateTo] = useState('28/02/2017')
  const [sliderVal, setSliderVal] = useState(70)

  const toggleGroup = (g: string) => {
    const next = new Set(selectedGroups)
    if (g === '__all__') {
      if (next.size === (data?.itemGroups.length ?? 0)) next.clear()
      else data?.itemGroups.forEach((x) => next.add(x))
    } else {
      next.has(g) ? next.delete(g) : next.add(g)
    }
    setSelectedGroups(next)
  }

  const toggleProduct = (p: string) => {
    const next = new Set(selectedProducts)
    if (p === '__all__') {
      if (next.size === (data?.products.length ?? 0)) next.clear()
      else data?.products.forEach((x) => next.add(x))
    } else {
      next.has(p) ? next.delete(p) : next.add(p)
    }
    setSelectedProducts(next)
  }

  return (
    <div className="relative flex shrink-0">
      {/* Collapsible Panel */}
      <div
        className={`transition-all duration-300 overflow-hidden ${open ? 'w-56' : 'w-0'}`}
        style={{ minHeight: '100%' }}
      >
        <div className="w-56 bg-[#0d0e24] border-r border-[rgba(99,102,241,0.15)] h-full overflow-y-auto p-3 space-y-4">
          {/* Date Range */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Reported as finished
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>{dateFrom}</span>
              <span>{dateTo}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full h-1.5 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Item Group */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Item group</div>
            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer py-0.5">
              <input
                type="checkbox"
                className="accent-indigo-500"
                checked={selectedGroups.size === (data?.itemGroups.length ?? 0)}
                onChange={() => toggleGroup('__all__')}
              />
              Select all
            </label>
            {data?.itemGroups.map((g) => (
              <label key={g} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  className="accent-indigo-500"
                  checked={selectedGroups.has(g)}
                  onChange={() => toggleGroup(g)}
                />
                {g}
              </label>
            ))}
          </div>

          {/* Product */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Product</div>
            <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1">
              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  className="accent-indigo-500"
                  checked={selectedProducts.size === (data?.products.length ?? 0)}
                  onChange={() => toggleProduct('__all__')}
                />
                Select all
              </label>
              {data?.products.map((p) => (
                <label key={p} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    className="accent-indigo-500"
                    checked={selectedProducts.has(p)}
                    onChange={() => toggleProduct(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Tab */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -right-5 z-10 flex flex-col items-center justify-center w-5 h-20 rounded-r-md bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.25)] border-l-0 hover:bg-[rgba(99,102,241,0.25)] transition-colors"
        style={{ left: open ? '224px' : '0px' }}
      >
        <span className="text-[8px] font-bold text-indigo-400 tracking-widest [writing-mode:vertical-rl] rotate-180 select-none">
          FILTERS
        </span>
        {open ? (
          <ChevronLeft className="w-3 h-3 text-indigo-400 mt-1" />
        ) : (
          <ChevronRight className="w-3 h-3 text-indigo-400 mt-1" />
        )}
      </button>
    </div>
  )
}

// ─── Bottom 10 Table ──────────────────────────────────────────────────────────

type SortKey = 'itemId' | 'productName' | 'onTimeInFull' | 'totalOrders' | 'pct'
type SortDir = 'asc' | 'desc'

function Bottom10Table({ rows }: { rows: Bottom10Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('pct')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(k)
      setSortDir('asc')
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const va = a[sortKey]
    const vb = b[sortKey]
    const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const ColHead = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-400 transition-colors whitespace-nowrap"
      onClick={() => handleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === k ? 'text-indigo-400' : 'text-slate-600'}`} />
      </span>
    </th>
  )

  return (
    <div className="overflow-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-[rgba(99,102,241,0.15)]">
            <ColHead k="itemId" label="Item ID" />
            <ColHead k="productName" label="Product name" />
            <ColHead k="onTimeInFull" label="On-time & in full" />
            <ColHead k="totalOrders" label="Total orders" />
            <ColHead k="pct" label="On-time & in full %" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr
              key={r.itemId}
              className={`border-b border-[rgba(99,102,241,0.08)] hover:bg-[rgba(99,102,241,0.06)] transition-colors ${
                i % 2 === 0 ? '' : 'bg-[rgba(99,102,241,0.04)]'
              }`}
            >
              <td className="px-3 py-2 text-indigo-300 font-mono">{r.itemId}</td>
              <td className="px-3 py-2 text-slate-200">{r.productName}</td>
              <td className="px-3 py-2 text-slate-300 text-right">{r.onTimeInFull.toLocaleString()}</td>
              <td className="px-3 py-2 text-slate-300 text-right">{r.totalOrders.toLocaleString()}</td>
              <td className="px-3 py-2 text-right">
                <span
                  className={`font-semibold ${
                    r.pct >= 90 ? 'text-emerald-400' : r.pct >= 80 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {r.pct.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────

function KpiTile({ value, label, unit = '' }: { value: number | string; label: string; unit?: string }) {
  return (
    <div className="bg-[#1e2a3a] border border-[rgba(99,102,241,0.2)] rounded-lg px-4 py-3 flex flex-col items-center min-w-[90px]">
      <span className="text-2xl font-bold text-white leading-none">
        {value}
        {unit}
      </span>
      <span className="text-[10px] text-slate-400 mt-1 text-center leading-tight">{label}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductionPerformancePage() {
  const [data, setData] = useState<PerfData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(true)
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [bottom10Sort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'pct', dir: 'asc' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/manufacturing/production-performance')
      const json: PerfData = await res.json()
      setData(json)
      setSelectedGroups(new Set(json.itemGroups))
      setSelectedProducts(new Set(json.products))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Build chart data from API response
  const byDateData = (data?.byDate ?? []).map((d) => ({
    label: d.label,
    values: [d.onTime, d.early, d.late, d.incomplete],
    lineVal: d.linePct,
  }))

  const byProductData = (data?.byProduct ?? []).map((d) => ({
    label: d.label,
    values: [d.onTime, d.early, d.late, d.incomplete],
  }))

  const plannedData = (data?.plannedByDate ?? []).map((d) => ({
    label: d.label,
    values: [d.onTime, d.early, d.late, d.incomplete],
    lineVal: d.linePct,
  }))

  // Thin x-label set for byDate (show quarter markers)
  const byDateXLabels = (data?.byDate ?? []).map((d, i) => {
    const quarterLabels = ['Apr 2016', 'Jul 2016', 'Oct 2016', 'Jan 2017']
    return quarterLabels.includes(d.label) ? d.label : ''
  })

  const plannedXLabels = (data?.plannedByDate ?? []).map((d) => d.label)
  const byProductXLabels = (data?.byProduct ?? []).map((d) => d.label)

  const BARS_FULL = [
    { color: '#6366f1', label: 'On-time & in full' },
    { color: '#1e3a5f', label: 'Early & in full' },
    { color: '#0e7490', label: 'Late & in full' },
    { color: '#334155', label: 'Incomplete' },
  ]

  const PLANNED_BARS = [
    { color: '#6366f1', label: 'On-time' },
    { color: '#1e3a5f', label: 'Early' },
    { color: '#0e7490', label: 'Late' },
    { color: '#334155', label: 'Incomplete' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0d0e24]">
      <TopBar title="Production performance" />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── Header Row: Title + KPI Tiles ── */}
        <div className="border-b border-[rgba(99,102,241,0.15)] bg-[#0d0e24] px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-semibold text-white tracking-tight">Production performance</h1>

          <div className="flex items-center gap-3 flex-wrap">
            {loading || !data ? (
              <div className="text-slate-500 text-xs animate-pulse">Loading KPIs…</div>
            ) : (
              <>
                <KpiTile value={data.kpis.totalOrders} label="Total orders" />
                <KpiTile value={data.kpis.onTimeInFullPct} label="On-time & in full %" unit="%" />
                <KpiTile value={data.kpis.incompletePct} label="Incomplete %" unit="%" />
                <KpiTile value={data.kpis.earlyPct} label="Early %" unit="%" />
                <KpiTile value={data.kpis.latePct} label="Late %" unit="%" />
              </>
            )}
          </div>
        </div>

        {/* ── Body: Filter Panel + Charts ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Filter Panel */}
          <FilterPanel
            open={filterOpen}
            onToggle={() => setFilterOpen((v) => !v)}
            data={data}
            selectedGroups={selectedGroups}
            setSelectedGroups={setSelectedGroups}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
          />

          {/* Chart Area */}
          <div className="flex-1 overflow-auto p-5">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm animate-pulse">
                Loading charts…
              </div>
            ) : !data ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm">No data available</div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {/* ── Top Left: Number of productions by date ── */}
                <div className="bg-[#12121f] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
                  <div className="text-[12px] font-semibold text-slate-200 mb-1">Number of productions by date</div>
                  <LegendRow
                    items={BARS_FULL}
                    line={{ color: LINE_COLOR, label: 'On-time & in full %' }}
                  />
                  <StackedBarLineChart
                    data={byDateData}
                    bars={BARS_FULL}
                    line={{ color: LINE_COLOR, label: 'On-time & in full %' }}
                    xLabels={byDateXLabels}
                    height={210}
                    rightAxisMin={75}
                    rightAxisMax={100}
                  />
                </div>

                {/* ── Top Right: Number of productions by product ── */}
                <div className="bg-[#12121f] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
                  <div className="text-[12px] font-semibold text-slate-200 mb-1">
                    Number of productions by product
                  </div>
                  <LegendRow items={BARS_FULL} />
                  <StackedBarLineChart
                    data={byProductData}
                    bars={BARS_FULL}
                    xLabels={byProductXLabels}
                    height={210}
                    rightAxisMin={0}
                    rightAxisMax={500}
                  />
                </div>

                {/* ── Bottom Left: Number of planned productions by date ── */}
                <div className="bg-[#12121f] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
                  <div className="text-[12px] font-semibold text-slate-200 mb-1">
                    Number of planned productions by date
                  </div>
                  <LegendRow
                    items={PLANNED_BARS.slice(0, 3)}
                    line={{ color: LINE_COLOR, label: 'On-time %' }}
                  />
                  <StackedBarLineChart
                    data={plannedData}
                    bars={PLANNED_BARS}
                    line={{ color: LINE_COLOR, label: 'On-time %' }}
                    xLabels={plannedXLabels}
                    height={210}
                    rightAxisMin={20}
                    rightAxisMax={100}
                  />
                </div>

                {/* ── Bottom Right: Bottom 10 table ── */}
                <div className="bg-[#12121f] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
                  <div className="text-[12px] font-semibold text-slate-200 mb-3">
                    Bottom 10 products by on-time &amp; in full
                  </div>
                  <Bottom10Table rows={data.bottom10} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
