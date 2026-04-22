export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ─── Static mock data ──────────────────────────────────────────────────────────

const KPI_STRIP = [
  { label: 'Current Cash Balance', value: '$1,847,320', sub: 'as of Apr 22, 2026', color: 'text-zinc-100' },
  { label: '30-Day Forecast',       value: '$2,143,500', sub: '+$296,180 projected',  color: 'text-emerald-400' },
  { label: '90-Day Forecast',       value: '$2,891,200', sub: '+$1,043,880 projected', color: 'text-emerald-400' },
  { label: 'Largest Outflow',       value: '−$340,000',  sub: 'Apr 30 · Payroll+AP',  color: 'text-red-400' },
  { label: 'Forecast Accuracy',     value: '94.2%',       sub: 'last 12 months',       color: 'text-sky-400' },
]

// 90-day weekly data points (13 weeks, Apr 22 – Jul 20)
// cumulative cash balance starting at 1,847,320
const WEEKLY: { label: string; date: string; balance: number; inflow: number; outflow: number }[] = [
  { label: 'Apr 22', date: '4/22', balance: 1847320, inflow: 380000, outflow: 340000 },
  { label: 'Apr 29', date: '4/29', balance: 1887320, inflow: 290000, outflow: 250000 },
  { label: 'May 6',  date: '5/6',  balance: 1927320, inflow: 310000, outflow: 270000 },
  { label: 'May 13', date: '5/13', balance: 1970820, inflow: 350000, outflow: 306500 },
  { label: 'May 20', date: '5/20', balance: 2014320, inflow: 330000, outflow: 286500 },
  { label: 'May 27', date: '5/27', balance: 2057820, inflow: 345000, outflow: 301500 },
  { label: 'Jun 3',  date: '6/3',  balance: 2143500, inflow: 420000, outflow: 334320 },
  { label: 'Jun 10', date: '6/10', balance: 2229180, inflow: 310000, outflow: 224320 },
  { label: 'Jun 17', date: '6/17', balance: 2314860, inflow: 298000, outflow: 212320 },
  { label: 'Jun 24', date: '6/24', balance: 2480540, inflow: 385000, outflow: 219320 },
  { label: 'Jul 1',  date: '7/1',  balance: 2646220, inflow: 410000, outflow: 244320 },
  { label: 'Jul 8',  date: '7/8',  balance: 2768700, inflow: 340000, outflow: 217520 },
  { label: 'Jul 15', date: '7/15', balance: 2891200, inflow: 360000, outflow: 237500 },
]

const INFLOWS = [
  { source: 'Accounts Receivable – USMF', type: 'AR',    amount: 248000,  due: 'Apr 28', certainty: 92, status: 'Confirmed' },
  { source: 'Customer Sales – Retail',    type: 'Sales', amount: 182000,  due: 'Apr 30', certainty: 85, status: 'Projected' },
  { source: 'Accounts Receivable – USRT', type: 'AR',    amount: 134500,  due: 'May 5',  certainty: 88, status: 'Confirmed' },
  { source: 'Intercompany Transfer',      type: 'Other', amount: 95000,   due: 'May 10', certainty: 95, status: 'Confirmed' },
  { source: 'Customer Sales – Wholesale', type: 'Sales', amount: 210000,  due: 'May 15', certainty: 78, status: 'Projected' },
  { source: 'AR Collections – Overdue',   type: 'AR',    amount: 61200,   due: 'May 18', certainty: 60, status: 'At Risk' },
  { source: 'Contract Milestone – ABC',   type: 'Other', amount: 175000,  due: 'May 22', certainty: 90, status: 'Confirmed' },
  { source: 'Accounts Receivable – DEMF', type: 'AR',    amount: 88000,   due: 'May 31', certainty: 82, status: 'Projected' },
  { source: 'Grant Reimbursement',        type: 'Other', amount: 42000,   due: 'Jun 5',  certainty: 70, status: 'Projected' },
  { source: 'Customer Sales – Online',    type: 'Sales', amount: 320000,  due: 'Jun 15', certainty: 75, status: 'Projected' },
]

const OUTFLOWS = [
  { name: 'Payroll – All Entities',    type: 'Payroll', amount: 340000, due: 'Apr 30', certainty: 99, status: 'Obligated' },
  { name: 'AP – Vendor Inv. #V-2891',  type: 'AP',      amount: 118500, due: 'May 2',  certainty: 97, status: 'Obligated' },
  { name: 'Q2 Estimated Tax',          type: 'Tax',     amount: 95000,  due: 'May 15', certainty: 99, status: 'Obligated' },
  { name: 'Office Lease – HQ',         type: 'Rent',    amount: 42000,  due: 'May 1',  certainty: 99, status: 'Obligated' },
  { name: 'AP – Supplier #S-0042',     type: 'AP',      amount: 76800,  due: 'May 8',  certainty: 88, status: 'Confirmed' },
  { name: 'SBA Loan #LN-2210',         type: 'Loan',    amount: 28000,  due: 'May 15', certainty: 99, status: 'Obligated' },
  { name: 'Payroll – May 15',          type: 'Payroll', amount: 340000, due: 'May 15', certainty: 99, status: 'Obligated' },
  { name: 'AP – Utilities & Services', type: 'AP',      amount: 24600,  due: 'May 20', certainty: 80, status: 'Projected' },
  { name: 'Equipment Lease #EL-114',   type: 'Loan',    amount: 18400,  due: 'Jun 1',  certainty: 99, status: 'Obligated' },
  { name: 'AP – Vendor Inv. #V-3105',  type: 'AP',      amount: 91200,  due: 'Jun 10', certainty: 75, status: 'Projected' },
]

const ENTITIES = [
  { id: 'USMF', name: 'US Manufacturing', balance: 1124800, points: [1124800, 1158000, 1140000, 1182000, 1210000, 1195000, 1238000] },
  { id: 'USRT', name: 'US Retail',         balance: 412500,  points: [412500,  430000,  418000,  445000,  460000,  452000,  478000] },
  { id: 'DEMF', name: 'DE Manufacturing',  balance: 218020,  points: [218020,  225000,  219000,  230000,  242000,  238000,  251000] },
  { id: 'GBSI', name: 'GB Services',       balance: 92000,   points: [92000,   97000,   94000,   99000,   104000,  101000,  108000] },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function statusBadge(s: string) {
  if (s === 'Confirmed' || s === 'Obligated') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (s === 'At Risk')                         return 'bg-red-500/10 text-red-400 border-red-500/20'
  return 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
}

function typeBadge(t: string) {
  const map: Record<string, string> = {
    AR:      'bg-sky-500/10 text-sky-400',
    Sales:   'bg-violet-500/10 text-violet-400',
    Other:   'bg-zinc-700/50 text-zinc-400',
    AP:      'bg-amber-500/10 text-amber-400',
    Payroll: 'bg-rose-500/10 text-rose-400',
    Tax:     'bg-orange-500/10 text-orange-400',
    Rent:    'bg-cyan-500/10 text-cyan-400',
    Loan:    'bg-purple-500/10 text-purple-400',
  }
  return map[t] ?? 'bg-zinc-700 text-zinc-400'
}

// ─── SVG Chart helpers ─────────────────────────────────────────────────────────

const CHART_W = 900
const CHART_H = 380
const PAD_L   = 72
const PAD_R   = 24
const PAD_T   = 24
const PAD_B   = 40

const INNER_W = CHART_W - PAD_L - PAD_R
const INNER_H = CHART_H - PAD_T - PAD_B

const MIN_THRESHOLD = 1_200_000

function toPoints(arr: number[], min: number, max: number): string {
  return arr
    .map((v, i) => {
      const x = PAD_L + (i / (arr.length - 1)) * INNER_W
      const y = PAD_T + INNER_H - ((v - min) / (max - min)) * INNER_H
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function toPath(arr: number[], min: number, max: number): string {
  return arr
    .map((v, i) => {
      const x = PAD_L + (i / (arr.length - 1)) * INNER_W
      const y = PAD_T + INNER_H - ((v - min) / (max - min)) * INNER_H
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function toAreaPath(arr: number[], min: number, max: number): string {
  const pts = arr.map((v, i) => {
    const x = PAD_L + (i / (arr.length - 1)) * INNER_W
    const y = PAD_T + INNER_H - ((v - min) / (max - min)) * INNER_H
    return { x, y }
  })
  const baseline = PAD_T + INNER_H
  const open  = `M ${pts[0].x.toFixed(1)} ${baseline}`
  const lines = pts.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const close = `L ${pts[pts.length - 1].x.toFixed(1)} ${baseline} Z`
  return `${open} ${lines} ${close}`
}

function miniSparkPath(pts: number[]): string {
  const w = 160, h = 36
  const mn = Math.min(...pts), mx = Math.max(...pts)
  const range = mx - mn || 1
  return pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * w
      const y = h - ((v - mn) / range) * (h - 4) - 2
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export default function CashFlowForecastingPage() {
  const balances  = WEEKLY.map(w => w.balance)
  const inflows   = WEEKLY.map(w => w.inflow)
  const outflows  = WEEKLY.map(w => w.outflow)

  const allVals   = [...balances, ...inflows, ...outflows, MIN_THRESHOLD]
  const chartMin  = Math.floor(Math.min(...allVals) * 0.9)
  const chartMax  = Math.ceil(Math.max(...allVals)  * 1.05)

  const balancePath  = toPath(balances, chartMin, chartMax)
  const inflowArea   = toAreaPath(inflows, chartMin, chartMax)
  const outflowArea  = toAreaPath(outflows, chartMin, chartMax)

  // Today marker x position (index 0)
  const todayX = PAD_L

  // Min threshold y
  const threshY = PAD_T + INNER_H - ((MIN_THRESHOLD - chartMin) / (chartMax - chartMin)) * INNER_H

  // Y axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = chartMin + ((chartMax - chartMin) / 4) * i
    const y   = PAD_T + INNER_H - ((val - chartMin) / (chartMax - chartMin)) * INNER_H
    return { val, y }
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Cash Flow Forecast"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <>
            <button className="h-8 px-3 rounded-md text-[12px] font-medium bg-[#16213e] border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
              Recalculate
            </button>
            <button className="h-8 px-3 rounded-md text-[12px] font-medium bg-[#16213e] border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
              Print
            </button>
          </>
        }
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-5 gap-3">
          {KPI_STRIP.map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">{k.label}</p>
              <p className={`text-[22px] font-bold tabular-nums leading-none ${k.color}`}>{k.value}</p>
              <p className="text-[11px] text-zinc-600 mt-1.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main SVG chart ── */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[13px] font-semibold text-zinc-100">90-Day Cash Flow Forecast</p>
              <p className="text-[11px] text-zinc-500">Apr 22 – Jul 20, 2026 · weekly intervals</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-5 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 bg-white inline-block rounded" />
                Cash Balance
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-3 rounded-sm bg-emerald-500/40 inline-block border border-emerald-500/60" />
                Inflows
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-3 rounded-sm bg-red-500/40 inline-block border border-red-500/60" />
                Outflows
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 border-t border-dashed border-amber-400 inline-block" />
                Min Cash
              </span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full"
            style={{ height: 480 }}
            aria-label="90-day cash flow forecast chart"
          >
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yTicks.map((t, i) => (
              <g key={i}>
                <line
                  x1={PAD_L} y1={t.y.toFixed(1)}
                  x2={CHART_W - PAD_R} y2={t.y.toFixed(1)}
                  stroke="#27272a" strokeWidth="1"
                />
                <text
                  x={(PAD_L - 8).toString()}
                  y={(t.y + 4).toFixed(1)}
                  textAnchor="end"
                  fontSize="10"
                  fill="#71717a"
                >
                  {t.val >= 1_000_000
                    ? `$${(t.val / 1_000_000).toFixed(1)}M`
                    : `$${(t.val / 1000).toFixed(0)}k`}
                </text>
              </g>
            ))}

            {/* Inflow area */}
            <path d={inflowArea} fill="url(#inflowGrad)" />
            {/* Outflow area */}
            <path d={outflowArea} fill="url(#outflowGrad)" />

            {/* Min cash threshold dashed line */}
            <line
              x1={PAD_L} y1={threshY.toFixed(1)}
              x2={CHART_W - PAD_R} y2={threshY.toFixed(1)}
              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4"
            />
            <text x={(CHART_W - PAD_R + 4).toString()} y={(threshY + 4).toFixed(1)} fontSize="9" fill="#f59e0b">Min</text>

            {/* Today vertical marker */}
            <line
              x1={todayX.toFixed(1)} y1={PAD_T.toString()}
              x2={todayX.toFixed(1)} y2={(PAD_T + INNER_H).toString()}
              stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 3"
            />
            <text x={(todayX + 4).toString()} y={(PAD_T + 12).toString()} fontSize="9" fill="#818cf8">Today</text>

            {/* Cash balance line */}
            <path d={balancePath} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />

            {/* Dots on balance line */}
            {WEEKLY.map((w, i) => {
              const x = PAD_L + (i / (WEEKLY.length - 1)) * INNER_W
              const y = PAD_T + INNER_H - ((w.balance - chartMin) / (chartMax - chartMin)) * INNER_H
              return (
                <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.5" fill="#0f0f1a" stroke="#ffffff" strokeWidth="2" />
              )
            })}

            {/* X-axis labels */}
            {WEEKLY.map((w, i) => {
              const x = PAD_L + (i / (WEEKLY.length - 1)) * INNER_W
              return (
                <text
                  key={i}
                  x={x.toFixed(1)}
                  y={(CHART_H - 8).toString()}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#52525b"
                >
                  {w.label}
                </text>
              )
            })}

            {/* X axis line */}
            <line
              x1={PAD_L.toString()} y1={(PAD_T + INNER_H).toString()}
              x2={(CHART_W - PAD_R).toString()} y2={(PAD_T + INNER_H).toString()}
              stroke="#3f3f46" strokeWidth="1"
            />
            <line
              x1={PAD_L.toString()} y1={PAD_T.toString()}
              x2={PAD_L.toString()} y2={(PAD_T + INNER_H).toString()}
              stroke="#3f3f46" strokeWidth="1"
            />
          </svg>
        </div>

        {/* ── Inflow / Outflow tables ── */}
        <div className="grid grid-cols-2 gap-5">

          {/* Inflow Sources */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-zinc-100">Inflow Sources</p>
              <span className="text-[11px] text-emerald-400">+{fmt(INFLOWS.reduce((s, r) => s + r.amount, 0))}</span>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Source</th>
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Type</th>
                  <th className="px-4 py-2 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Amount</th>
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Due</th>
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium w-28">Certainty</th>
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {INFLOWS.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 text-zinc-300 truncate max-w-[160px]">{r.source}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${typeBadge(r.type)}`}>{r.type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-emerald-400 tabular-nums font-semibold">{fmt(r.amount)}</td>
                    <td className="px-4 py-2.5 text-zinc-400 tabular-nums">{r.due}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${r.certainty}%` }} />
                        </div>
                        <span className="text-[10px] text-zinc-500 w-7 text-right">{r.certainty}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-medium ${statusBadge(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Outflow Obligations */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-zinc-100">Outflow Obligations</p>
              <span className="text-[11px] text-red-400">−{fmt(OUTFLOWS.reduce((s, r) => s + r.amount, 0))}</span>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Obligation</th>
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Type</th>
                  <th className="px-4 py-2 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Amount</th>
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Due</th>
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium w-28">Certainty</th>
                  <th className="px-4 py-2 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {OUTFLOWS.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 text-zinc-300 truncate max-w-[160px]">{r.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${typeBadge(r.type)}`}>{r.type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-red-400 tabular-nums font-semibold">{fmt(r.amount)}</td>
                    <td className="px-4 py-2.5 text-zinc-400 tabular-nums">{r.due}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500/70 rounded-full" style={{ width: `${r.certainty}%` }} />
                        </div>
                        <span className="text-[10px] text-zinc-500 w-7 text-right">{r.certainty}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-medium ${statusBadge(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Cash Flow by Legal Entity ── */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-[13px] font-semibold text-zinc-100 mb-4">Cash Flow by Legal Entity</p>
          <div className="grid grid-cols-4 gap-4">
            {ENTITIES.map(e => {
              const trend = e.points[e.points.length - 1] >= e.points[0]
              return (
                <div key={e.id} className="bg-zinc-900/60 border border-zinc-800/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">{e.id}</span>
                    <span className={`text-[10px] font-semibold ${trend ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trend ? '▲' : '▼'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-2">{e.name}</p>
                  <p className={`text-[18px] font-bold tabular-nums mb-3 ${trend ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmt(e.balance)}
                  </p>
                  <svg viewBox="0 0 160 36" className="w-full" style={{ height: 36 }}>
                    <path
                      d={miniSparkPath(e.points)}
                      fill="none"
                      stroke={trend ? '#10b981' : '#ef4444'}
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-[10px] text-zinc-600 mt-1">30-day projection</p>
                </div>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}
