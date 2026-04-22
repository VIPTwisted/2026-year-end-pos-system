'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPIs {
  customersPastDue: number
  customersBalanceDue: number
  customersOverCreditLimit: number
}

interface AgedBalance {
  label: string
  value: number
  color: string
}

interface ProductRevenue {
  name: string
  highEnd: number
  accessories: number
  autoAudio: number
  autoSpeakers: number
  parts: number
  speakers: number
  salamanca: number
}

interface BankBalance {
  company: string
  account: string
  currency: string
  actualBalance: number
  systemBalance: number
  usdBalance: number
}

interface CustomerRevenue {
  name: string
  main: number
  other: number
  retail: number
  wholesale: number
  demand: number
}

interface PurchaseSeries {
  name: string
  color: string
  values: number[]
}

interface PurchasesByMonth {
  months: string[]
  series: PurchaseSeries[]
}

interface AnalyticsData {
  kpis: KPIs
  agedBalances: AgedBalance[]
  topProductsByRevenue: ProductRevenue[]
  bankBalances: BankBalance[]
  topCustomersByRevenue: CustomerRevenue[]
  purchasesByMonth: PurchasesByMonth
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'bn'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(2)
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({ segments }: { segments: AgedBalance[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const cx = 120, cy = 120, r = 90, inner = 55
  let angle = -Math.PI / 2

  const arcs = segments.map(seg => {
    const sweep = (seg.value / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    angle += sweep
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const xi1 = cx + inner * Math.cos(angle - sweep)
    const yi1 = cy + inner * Math.sin(angle - sweep)
    const xi2 = cx + inner * Math.cos(angle)
    const yi2 = cy + inner * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    const midAngle = angle - sweep / 2
    const labelR = r + 22
    const lx = cx + labelR * Math.cos(midAngle)
    const ly = cy + labelR * Math.sin(midAngle)
    return { ...seg, x1, y1, x2, y2, xi1, yi1, xi2, yi2, large, lx, ly, midAngle }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="240" height="240" viewBox="0 0 240 240">
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={`M ${arc.x1} ${arc.y1} A ${r} ${r} 0 ${arc.large} 1 ${arc.x2} ${arc.y2} L ${arc.xi2} ${arc.yi2} A ${inner} ${inner} 0 ${arc.large} 0 ${arc.xi1} ${arc.yi1} Z`}
            fill={arc.color}
            stroke="#0d0e24"
            strokeWidth="2"
          />
        ))}
        {arcs.map((arc, i) => {
          const pct = (arc.value / total * 100).toFixed(0)
          return (
            <text key={`lbl-${i}`} x={arc.lx} y={arc.ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.7)" fontSize="9">
              {arc.label} {fmt(arc.value)}
            </text>
          )
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{fmt(total)}</text>
        <text x={cx} y={cx + 8} textAnchor="middle" fill="rgba(165,180,252,0.6)" fontSize="9">Total AR</text>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
            <span className="text-[11px] text-zinc-400">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Horizontal Bar Chart (Top 10 Products) ───────────────────────────────────

const PRODUCT_SERIES_COLORS = {
  highEnd:     '#1e3a5f',
  accessories: '#2563eb',
  autoAudio:   '#0891b2',
  autoSpeakers:'#059669',
  parts:       '#7c3aed',
  speakers:    '#db2777',
  salamanca:   '#d97706',
}

const PRODUCT_SERIES_LABELS: Record<string, string> = {
  highEnd:     'High end',
  accessories: 'Accessories',
  autoAudio:   'Auto audio systems',
  autoSpeakers:'Auto speakers',
  parts:       'Parts',
  speakers:    'Speakers',
  salamanca:   'Salamanca',
}

function HBarChart({ data }: { data: ProductRevenue[] }) {
  const keys = Object.keys(PRODUCT_SERIES_COLORS) as (keyof typeof PRODUCT_SERIES_COLORS)[]
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k as keyof ProductRevenue] as number)))
  const barH = 18
  const gap = 8
  const rowH = barH + gap
  const paddingLeft = 86
  const chartWidth = 460
  const height = data.length * rowH + 10

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${paddingLeft + chartWidth + 40} ${height}`} style={{ overflow: 'visible' }}>
        {data.map((row, i) => {
          const y = i * rowH
          const barWidths = keys.map(k => {
            const v = row[k as keyof ProductRevenue] as number
            return (v / maxVal) * chartWidth
          })
          return (
            <g key={i} transform={`translate(0,${y})`}>
              <text x={paddingLeft - 6} y={barH / 2} textAnchor="end" dominantBaseline="middle" fill="rgba(200,210,240,0.8)" fontSize="10">{row.name}</text>
              {barWidths.map((w, ki) => w > 0 && (
                <rect key={ki} x={paddingLeft} y={0} width={w} height={barH} rx="2"
                  fill={PRODUCT_SERIES_COLORS[keys[ki]]} opacity="0.9" />
              ))}
              {barWidths.map((w, ki) => {
                const v = row[keys[ki] as keyof ProductRevenue] as number
                return v > 0 && (
                  <text key={`v${ki}`} x={paddingLeft + w + 4} y={barH / 2} dominantBaseline="middle" fill="rgba(255,255,255,0.7)" fontSize="9">{fmt(v)}</text>
                )
              })}
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 px-1">
        {keys.map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PRODUCT_SERIES_COLORS[k] }} />
            <span className="text-[11px] text-zinc-400">{PRODUCT_SERIES_LABELS[k]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Grouped Vertical Bar Chart (Top 10 Customers) ────────────────────────────

const CUST_SERIES = [
  { key: 'main',      label: 'Main Customers',    color: '#312e81' },
  { key: 'other',     label: 'Other Customers',   color: '#ea580c' },
  { key: 'retail',    label: 'Retail Customers',  color: '#0d9488' },
  { key: 'wholesale', label: 'Wholesale Customers', color: '#1d4ed8' },
  { key: 'demand',    label: 'Demand Distributors', color: '#be185d' },
]

function VGroupedBarChart({ data }: { data: CustomerRevenue[] }) {
  const keys = CUST_SERIES.map(s => s.key) as (keyof CustomerRevenue)[]
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] as number)))
  const svgW = 620, svgH = 220
  const padL = 40, padB = 55, padT = 10
  const chartW = svgW - padL - 10
  const chartH = svgH - padB - padT
  const groupW = chartW / data.length
  const barW = (groupW - 8) / keys.length

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`}>
        {/* Y gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padT + chartH * (1 - pct)
          return (
            <g key={pct}>
              <line x1={padL} x2={svgW - 10} y1={y} y2={y} stroke="rgba(99,102,241,0.1)" strokeWidth="1" />
              <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fill="rgba(148,163,184,0.5)" fontSize="8">{fmt(maxVal * pct)}</text>
            </g>
          )
        })}
        {/* Bars */}
        {data.map((row, gi) => {
          const gx = padL + gi * groupW + 4
          return (
            <g key={gi}>
              {keys.map((k, ki) => {
                const val = row[k] as number
                const barH = (val / maxVal) * chartH
                const bx = gx + ki * barW
                const by = padT + chartH - barH
                return (
                  <rect key={ki} x={bx} y={by} width={barW - 1} height={barH} rx="1.5"
                    fill={CUST_SERIES[ki].color} opacity="0.85" />
                )
              })}
              <text x={gx + (groupW - 8) / 2} y={svgH - padB + 10} textAnchor="middle" fill="rgba(200,210,240,0.7)" fontSize="8" transform={`rotate(-30,${gx + (groupW - 8) / 2},${svgH - padB + 10})`}>
                {row.name.length > 14 ? row.name.slice(0, 14) + '…' : row.name}
              </text>
            </g>
          )
        })}
        {/* X axis */}
        <line x1={padL} x2={svgW - 10} y1={padT + chartH} y2={padT + chartH} stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
      </svg>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 px-1">
        {CUST_SERIES.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-[11px] text-zinc-400">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Multi-Line Chart (Purchases by Month) ────────────────────────────────────

function MultiLineChart({ data }: { data: PurchasesByMonth }) {
  const svgW = 880, svgH = 200
  const padL = 42, padB = 30, padT = 10
  const chartW = svgW - padL - 20
  const chartH = svgH - padB - padT
  const allVals = data.series.flatMap(s => s.values)
  const maxVal = Math.max(...allVals)
  const months = data.months
  const xStep = chartW / (months.length - 1)

  function pts(values: number[]) {
    return values.map((v, i) => {
      const x = padL + i * xStep
      const y = padT + chartH * (1 - v / maxVal)
      return `${x},${y}`
    }).join(' ')
  }

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`}>
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padT + chartH * (1 - pct)
          return (
            <g key={pct}>
              <line x1={padL} x2={svgW - 20} y1={y} y2={y} stroke="rgba(99,102,241,0.1)" strokeWidth="1" />
              <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fill="rgba(148,163,184,0.5)" fontSize="8">{Math.round(maxVal * pct)}M</text>
            </g>
          )
        })}
        {data.series.map((s, i) => (
          <polyline key={i} points={pts(s.values)} fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.85" />
        ))}
        {months.map((m, i) => (
          <text key={i} x={padL + i * xStep} y={svgH - padB + 14} textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="8">{m}</text>
        ))}
        <line x1={padL} x2={svgW - 20} y1={padT + chartH} y2={padT + chartH} stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.series.map(s => (
          <div key={s.name} className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 rounded" style={{ background: s.color }} />
            <span className="text-[10px] text-zinc-500">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bank Balances Table ───────────────────────────────────────────────────────

function BankTable({ rows }: { rows: BankBalance[] }) {
  const grouped: Record<string, BankBalance[]> = {}
  rows.forEach(r => {
    if (!grouped[r.company]) grouped[r.company] = []
    grouped[r.company].push(r)
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
            {['Company', 'Bank account', 'Actual balance', 'Actual balance in system currency', 'USD: Actual balance', 'Actual ba...'].map(h => (
              <th key={h} className="text-left px-3 py-2.5 font-semibold text-zinc-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([company, accts]) => {
            const totActual = accts.reduce((s, a) => s + a.actualBalance, 0)
            const totSys    = accts.reduce((s, a) => s + a.systemBalance, 0)
            const totUsd    = accts.reduce((s, a) => s + a.usdBalance, 0)
            return [
              ...accts.map((a, i) => (
                <tr key={`${company}-${i}`} className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                  <td className="px-3 py-2 text-zinc-400 uppercase font-mono">{i === 0 ? company : ''}</td>
                  <td className="px-3 py-2 text-zinc-300">{a.account} <span className="text-zinc-600">{a.currency}</span></td>
                  <td className="px-3 py-2 text-right tabular-nums text-zinc-300">{fmtCurrency(a.actualBalance)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-zinc-400">{fmtCurrency(a.systemBalance)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-zinc-300">{fmtCurrency(a.usdBalance)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-zinc-400">{fmtCurrency(a.usdBalance)}</td>
                </tr>
              )),
              <tr key={`${company}-total`} style={{ background: 'rgba(99,102,241,0.07)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                <td className="px-3 py-2 font-semibold text-zinc-200 uppercase">{company}</td>
                <td className="px-3 py-2 text-zinc-500 text-[10px]">Total</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold text-white">{fmtCurrency(totActual)}</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold text-zinc-200">{fmtCurrency(totSys)}</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold text-white">{fmtCurrency(totUsd)}</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold text-zinc-200">{fmtCurrency(totUsd)}</td>
              </tr>
            ]
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab strip ────────────────────────────────────────────────────────────────

const TABS = [
  'Financial overview',
  'Revenue and expense insights',
  'Subledger insights',
  'Trial balance',
  'Balance sheet',
  'Income statement by region',
  'Income statement actual vs budget',
  'Revenue statement with variances',
  '12 month trend income statement',
  'Expenses three year trend',
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceAnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetch('/api/finance/analytics')
      .then(r => r.json())
      .then(setData)
  }, [])

  const card = 'rounded-xl p-5' as const
  const cardStyle = { background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }

  if (!data) {
    return (
      <>
        <TopBar title="Finance Analytics" breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Analytics', href: '/finance/analytics' }]} />
        <main className="flex-1 p-6 flex items-center justify-center" style={{ background: '#0d0e24' }}>
          <div className="text-zinc-500 text-sm">Loading analytics...</div>
        </main>
      </>
    )
  }

  const { kpis, agedBalances, topProductsByRevenue, bankBalances, topCustomersByRevenue, purchasesByMonth } = data

  return (
    <>
      <TopBar
        title="Finance Analytics"
        breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Analytics', href: '/finance/analytics' }]}
      />
      <main className="flex-1 overflow-auto" style={{ background: '#0d0e24' }}>
        <div className="p-6 space-y-5">

          {/* ── Row 1: KPI cards + Donut ── */}
          <div className="grid grid-cols-12 gap-5">
            {/* KPI Cards — col span 4 */}
            <div className="col-span-4 flex flex-col gap-4">
              {[
                { label: 'Customers past due',                 value: kpis.customersPastDue.toString(),             accent: '#f87171' },
                { label: 'Customers balance due',              value: fmt(kpis.customersBalanceDue),                accent: '#fbbf24' },
                { label: 'Customers amount over credit limit', value: fmt(kpis.customersOverCreditLimit),           accent: '#a78bfa' },
              ].map(({ label, value, accent }) => (
                <div key={label} className={card} style={cardStyle}>
                  <p className="text-[11px] text-zinc-500 mb-1">{label}</p>
                  <p className="text-3xl font-bold tabular-nums" style={{ color: accent }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Donut chart — col span 8 */}
            <div className="col-span-8" style={{ ...cardStyle, borderRadius: 12, padding: '20px 24px' }}>
              <p className="text-sm font-semibold text-zinc-200 mb-4">Customer aged balances</p>
              <DonutChart segments={agedBalances} />
            </div>
          </div>

          {/* ── Row 2: Top 10 Products ── */}
          <div className={card} style={cardStyle}>
            <p className="text-sm font-semibold text-zinc-200 mb-4">Top 10 products by revenue</p>
            <HBarChart data={topProductsByRevenue} />
          </div>

          {/* ── Row 3: Bank Balances Table ── */}
          <div className={card} style={cardStyle}>
            <p className="text-sm font-semibold text-zinc-200 mb-4">Balance by bank account</p>
            <BankTable rows={bankBalances} />
          </div>

          {/* ── Row 4: Top 10 Customers ── */}
          <div className={card} style={cardStyle}>
            <p className="text-sm font-semibold text-zinc-200 mb-4">Top 10 customers by revenue</p>
            <VGroupedBarChart data={topCustomersByRevenue} />
          </div>

          {/* ── Row 5: Purchases by Month ── */}
          <div className={card} style={cardStyle}>
            <p className="text-sm font-semibold text-zinc-200 mb-4">Purchases by month</p>
            <MultiLineChart data={purchasesByMonth} />
          </div>

        </div>

        {/* ── Tab strip ── */}
        <div style={{ borderTop: '1px solid rgba(99,102,241,0.15)', background: '#0d0e24' }}>
          <div className="flex overflow-x-auto scrollbar-none px-6">
            {TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className="shrink-0 px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap"
                style={activeTab === i
                  ? { color: '#818cf8', borderBottom: '2px solid #6366f1' }
                  : { color: 'rgba(148,163,184,0.6)', borderBottom: '2px solid transparent' }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
