export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ─── Static mock data ────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: 'May',  rev: 2210000, cogs: 1105000, gp: 1105000 },
  { month: 'Jun',  rev: 2380000, cogs: 1190000, gp: 1190000 },
  { month: 'Jul',  rev: 2290000, cogs: 1145000, gp: 1145000 },
  { month: 'Aug',  rev: 2450000, cogs: 1200000, gp: 1250000 },
  { month: 'Sep',  rev: 2510000, cogs: 1230000, gp: 1280000 },
  { month: 'Oct',  rev: 2620000, cogs: 1270000, gp: 1350000 },
  { month: 'Nov',  rev: 2780000, cogs: 1340000, gp: 1440000 },
  { month: 'Dec',  rev: 3100000, cogs: 1490000, gp: 1610000 },
  { month: 'Jan',  rev: 2420000, cogs: 1180000, gp: 1240000 },
  { month: 'Feb',  rev: 2560000, cogs: 1240000, gp: 1320000 },
  { month: 'Mar',  rev: 2700000, cogs: 1300000, gp: 1400000 },
  { month: 'Apr',  rev: 2840000, cogs: 1360000, gp: 1480000 },
]

const TOP_PRODUCTS = [
  { name: 'NovaPOS Terminal Pro', revenue: 428000, units: 214, spark: [40,55,48,62,71,68,75,80] },
  { name: 'Inventory Scanner X7', revenue: 312000, units: 890, spark: [30,28,35,40,38,45,50,48] },
  { name: 'Cloud License — Starter', revenue: 298000, units: 1240, spark: [50,52,55,58,60,62,65,68] },
  { name: 'Receipt Printer LP80', revenue: 187000, units: 467, spark: [20,22,18,25,30,28,35,32] },
  { name: 'Cloud License — Pro', revenue: 162000, units: 540, spark: [15,18,22,20,25,28,30,35] },
  { name: 'Barcode Scanner BT400', revenue: 148000, units: 1200, spark: [40,38,42,45,43,48,50,52] },
  { name: 'Cash Drawer CD200', revenue: 132000, units: 660, spark: [25,27,23,28,30,29,32,35] },
  { name: 'NovaPOS Mobile App', revenue: 118000, units: 2360, spark: [10,15,20,25,28,32,38,42] },
  { name: 'Customer Display KP7', revenue: 98000,  units: 245, spark: [18,20,22,19,24,23,26,28] },
  { name: 'Support License Annual', revenue: 87000,  units: 870, spark: [60,62,65,63,68,70,72,75] },
]

const CUSTOMERS_SCATTER = [
  { seg: 'Enterprise',  count: 42,  ltv: 8400, color: '#6366f1' },
  { seg: 'Mid-Market',  count: 187, ltv: 2800, color: '#3b82f6' },
  { seg: 'SMB',         count: 940, ltv: 847,  color: '#06b6d4' },
  { seg: 'Micro',       count: 3200,ltv: 220,  color: '#10b981' },
]

const COHORT = [
  [100, 72, 61, 55, 50, 47],
  [100, 68, 57, 51, 46, 43],
  [100, 74, 63, 58, 53, 49],
  [100, 71, 59, 53, 48, 45],
  [100, 76, 65, 60, 55, 52],
  [100, 69, 58, 52, 47, 44],
]
const COHORT_MONTHS = ['M+0','M+1','M+2','M+3','M+4','M+5']
const COHORT_LABELS = ['Nov','Dec','Jan','Feb','Mar','Apr']

const FULFILLMENT = [
  { channel: 'Online', sameDay: 82, nextDay: 91, standard: 97 },
  { channel: 'In-Store', sameDay: 99, nextDay: 100, standard: 100 },
  { channel: 'Wholesale', sameDay: 71, nextDay: 85, standard: 96 },
  { channel: 'B2B', sameDay: 68, nextDay: 79, standard: 94 },
]

const CYCLE_TIME = [
  { w: 'W1',  h: 28 }, { w: 'W2', h: 26 }, { w: 'W3', h: 31 },
  { w: 'W4',  h: 24 }, { w: 'W5', h: 22 }, { w: 'W6', h: 20 },
  { w: 'W7',  h: 19 }, { w: 'W8', h: 17 }, { w: 'W9', h: 18 },
  { w: 'W10', h: 16 }, { w: 'W11', h: 15 }, { w: 'W12', h: 14 },
]

const AI_INSIGHTS = [
  { text: 'Revenue is tracking +8.3% MoM — Q2 target achievable if April closes above $2.9M.', confidence: 94, color: '#10b981' },
  { text: 'Inventory Scanner X7 inventory at 18 days of supply — reorder risk in 12 days.', confidence: 88, color: '#f59e0b' },
  { text: 'Customer LTV in SMB segment increased $47 YoY driven by Cloud License upsells.', confidence: 91, color: '#6366f1' },
  { text: 'Wholesale fulfillment rate (same-day 68%) is below SLA — escalate to ops.', confidence: 96, color: '#ef4444' },
  { text: 'NPS of 68 is 6 points above industry median — leverage for referral campaign.', confidence: 83, color: '#3b82f6' },
]

const SAVED_REPORTS = [
  { name: 'Monthly P&L Summary', owner: 'J. Martinez', lastRun: '22 Apr 2026', type: 'Finance' },
  { name: 'Top Products by Revenue', owner: 'A. Chen', lastRun: '21 Apr 2026', type: 'Sales' },
  { name: 'Customer Cohort Analysis', owner: 'M. Williams', lastRun: '20 Apr 2026', type: 'CRM' },
  { name: 'Inventory Velocity Report', owner: 'K. Patel', lastRun: '19 Apr 2026', type: 'Ops' },
  { name: 'Fulfillment SLA Tracker', owner: 'J. Martinez', lastRun: '18 Apr 2026', type: 'Ops' },
  { name: 'CAC by Channel', owner: 'A. Chen', lastRun: '17 Apr 2026', type: 'Marketing' },
  { name: 'Churn Prediction Model', owner: 'T. Nguyen', lastRun: '15 Apr 2026', type: 'CRM' },
  { name: 'NPS Trend (Rolling 12M)', owner: 'M. Williams', lastRun: '14 Apr 2026', type: 'CX' },
]

const SCHEDULED_REPORTS = [
  { name: 'Weekly Revenue Digest', freq: 'Every Monday 7:00 AM', dest: 'exec-team@company.com', next: 'Apr 28' },
  { name: 'Daily Ops Flash', freq: 'Daily 6:00 AM', dest: 'ops-lead@company.com', next: 'Apr 23' },
  { name: 'Monthly Finance Package', freq: '1st of month 8:00 AM', dest: 'CFO + Controller', next: 'May 1' },
  { name: 'Inventory Alert Report', freq: 'Every Friday 4:00 PM', dest: 'warehouse@company.com', next: 'Apr 25' },
]

const REPORT_CATEGORIES = [
  { name: 'Revenue', count: 12, active: true },
  { name: 'Customers', count: 8, active: false },
  { name: 'Inventory', count: 10, active: false },
  { name: 'Operations', count: 7, active: false },
  { name: 'Finance', count: 15, active: false },
  { name: 'Marketing', count: 6, active: false },
  { name: 'Custom', count: 4, active: false },
]

const FAVORITES = [
  { name: 'Monthly P&L Summary' },
  { name: 'Customer Cohort Analysis' },
  { name: 'NPS Trend (Rolling 12M)' },
]

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function AreaChart() {
  const W = 540, H = 160, PAD = { t: 12, r: 12, b: 30, l: 52 }
  const cw = W - PAD.l - PAD.r
  const ch = H - PAD.t - PAD.b
  const n = MONTHLY_REVENUE.length

  const allVals = MONTHLY_REVENUE.flatMap(d => [d.rev, d.cogs, d.gp])
  const maxVal = Math.max(...allVals)
  const minVal = 0

  function xp(i: number) { return PAD.l + (i / (n - 1)) * cw }
  function yp(v: number) { return PAD.t + ((maxVal - v) / (maxVal - minVal)) * ch }

  function linePath(key: 'rev' | 'cogs' | 'gp') {
    return MONTHLY_REVENUE.map((d, i) => `${i === 0 ? 'M' : 'L'}${xp(i)},${yp(d[key])}`).join(' ')
  }
  function areaPath(key: 'rev' | 'cogs' | 'gp') {
    const line = MONTHLY_REVENUE.map((d, i) => `${xp(i)},${yp(d[key])}`).join(' ')
    return `M${xp(0)},${yp(MONTHLY_REVENUE[0][key])} L${line} L${xp(n - 1)},${PAD.t + ch} L${xp(0)},${PAD.t + ch} Z`
  }

  const yTicks = [0, 1000000, 2000000, 3000000]
  function fmtTick(v: number) { return v === 0 ? '0' : `$${v / 1000000}M` }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      <defs>
        <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gGP" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PAD.l} y1={yp(v)} x2={W - PAD.r} y2={yp(v)} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.l - 6} y={yp(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">{fmtTick(v)}</text>
        </g>
      ))}
      <path d={areaPath('rev')} fill="url(#gRev)" />
      <path d={areaPath('gp')} fill="url(#gGP)" />
      <path d={linePath('rev')} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={linePath('cogs')} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" />
      <path d={linePath('gp')} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {MONTHLY_REVENUE.map((d, i) => (
        <text key={d.month} x={xp(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#52525b">{d.month}</text>
      ))}
    </svg>
  )
}

function SparkLine({ data }: { data: number[] }) {
  const W = 60, H = 22
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={60} height={22}>
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ScatterPlot() {
  const W = 320, H = 160, PAD = 24
  const maxCount = 3200, maxLTV = 9000
  function cx(v: number) { return PAD + (v / maxCount) * (W - PAD * 2) }
  function cy(v: number) { return H - PAD - (v / maxLTV) * (H - PAD * 2) }
  const r = [14, 9, 6, 4]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#27272a" strokeWidth="1" />
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#27272a" strokeWidth="1" />
      <text x={PAD - 2} y={PAD + 4} fontSize="8" fill="#52525b" textAnchor="end">LTV</text>
      <text x={W - PAD} y={H - PAD + 12} fontSize="8" fill="#52525b" textAnchor="end">Count</text>
      {CUSTOMERS_SCATTER.map((s, i) => (
        <g key={s.seg}>
          <circle cx={cx(s.count)} cy={cy(s.ltv)} r={r[i]} fill={s.color} fillOpacity="0.7" />
          <text x={cx(s.count)} y={cy(s.ltv) - r[i] - 3} fontSize="8" fill="#a1a1aa" textAnchor="middle">{s.seg}</text>
        </g>
      ))}
    </svg>
  )
}

function CohortHeatmap() {
  const cellW = 52, cellH = 26, labelW = 36
  const W = labelW + COHORT_MONTHS.length * cellW
  const H = 16 + COHORT.length * cellH
  function color(v: number) {
    if (v >= 90) return '#4f46e5'
    if (v >= 70) return '#6366f1'
    if (v >= 55) return '#818cf8'
    if (v >= 45) return '#312e81'
    if (v >= 35) return '#1e1b4b'
    return '#111827'
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {COHORT_MONTHS.map((m, j) => (
        <text key={m} x={labelW + j * cellW + cellW / 2} y={12} textAnchor="middle" fontSize="8" fill="#71717a">{m}</text>
      ))}
      {COHORT.map((row, i) => (
        <g key={i}>
          <text x={labelW - 4} y={16 + i * cellH + cellH / 2 + 4} textAnchor="end" fontSize="8" fill="#71717a">{COHORT_LABELS[i]}</text>
          {row.map((val, j) => (
            <g key={j}>
              <rect x={labelW + j * cellW + 1} y={16 + i * cellH + 1} width={cellW - 2} height={cellH - 2} rx="2" fill={color(val)} />
              <text x={labelW + j * cellW + cellW / 2} y={16 + i * cellH + cellH / 2 + 4} textAnchor="middle" fontSize="8" fill="#e4e4e7">{val}%</text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}

function FulfillmentBars() {
  const W = 380, H = 140, PAD = { t: 16, r: 12, b: 28, l: 72 }
  const cw = W - PAD.l - PAD.r
  const ch = H - PAD.t - PAD.b
  const maxV = 100
  const barCount = 3
  const groupW = cw / FULFILLMENT.length
  const bW = (groupW * 0.8) / barCount
  const colors = ['#6366f1', '#3b82f6', '#10b981']
  const keys: ('sameDay' | 'nextDay' | 'standard')[] = ['sameDay', 'nextDay', 'standard']
  const labels = ['Same-Day', 'Next-Day', 'Standard']
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={PAD.l} y1={PAD.t + ((maxV - v) / maxV) * ch} x2={W - PAD.r} y2={PAD.t + ((maxV - v) / maxV) * ch} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.l - 4} y={PAD.t + ((maxV - v) / maxV) * ch + 4} textAnchor="end" fontSize="8" fill="#52525b">{v}%</text>
        </g>
      ))}
      {FULFILLMENT.map((row, gi) => {
        const gx = PAD.l + gi * groupW + groupW * 0.1
        return (
          <g key={row.channel}>
            {keys.map((k, bi) => {
              const val = row[k]
              const bh = (val / maxV) * ch
              const bx = gx + bi * bW
              const by = PAD.t + ch - bh
              return (
                <g key={k}>
                  <rect x={bx} y={by} width={bW - 1} height={bh} rx="2" fill={colors[bi]} fillOpacity="0.85" />
                </g>
              )
            })}
            <text x={PAD.l + gi * groupW + groupW / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="#71717a">{row.channel}</text>
          </g>
        )
      })}
      {labels.map((l, i) => (
        <g key={l}>
          <rect x={W - 100 + i * 32} y={4} width={8} height={8} rx="1" fill={colors[i]} />
          <text x={W - 90 + i * 32} y={12} fontSize="7" fill="#71717a">{l[0]}</text>
        </g>
      ))}
      <text x={W - 102} y={12} fontSize="7" fill="#71717a">{labels[0].slice(0,1)}</text>
    </svg>
  )
}

function CycleTimeLine() {
  const W = 380, H = 100, PAD = { t: 10, r: 12, b: 24, l: 28 }
  const cw = W - PAD.l - PAD.r
  const ch = H - PAD.t - PAD.b
  const vals = CYCLE_TIME.map(d => d.h)
  const minV = Math.min(...vals) - 2, maxV = Math.max(...vals) + 2
  const n = CYCLE_TIME.length
  function xp(i: number) { return PAD.l + (i / (n - 1)) * cw }
  function yp(v: number) { return PAD.t + ((maxV - v) / (maxV - minV)) * ch }
  const pts = CYCLE_TIME.map((d, i) => `${xp(i)},${yp(d.h)}`).join(' ')
  const area = `M${xp(0)},${yp(CYCLE_TIME[0].h)} L${pts.slice(pts.indexOf(',') + 1 - xp(0).toString().length)} M${CYCLE_TIME.map((d,i)=>`${xp(i)},${yp(d.h)}`).join(' L')} L${xp(n-1)},${PAD.t+ch} L${xp(0)},${PAD.t+ch} Z`
  const linePts = CYCLE_TIME.map((d, i) => `${xp(i)},${yp(d.h)}`).join(' ')
  const areaPts = `M${xp(0)},${yp(CYCLE_TIME[0].h)} L${linePts.replace(/M/g, '')} L${xp(n-1)},${PAD.t+ch} L${xp(0)},${PAD.t+ch} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="gCycle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPts} fill="url(#gCycle)" />
      <polyline points={linePts} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {CYCLE_TIME.filter((_, i) => i % 2 === 0).map((d, idx) => (
        <text key={d.w} x={xp(idx * 2)} y={H - 6} textAnchor="middle" fontSize="8" fill="#52525b">{d.w}</text>
      ))}
    </svg>
  )
}

function PieDot({ pct, color }: { pct: number; color: string }) {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 6, flexShrink: 0 }} />
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function AdvancedAnalyticsPage() {
  const kpis = [
    { label: 'Monthly Revenue', value: '$2.84M', delta: '+8.3%', up: true },
    { label: 'MoM Growth', value: '+8.3%', delta: '+1.1pp', up: true },
    { label: 'Customer LTV', value: '$847', delta: '+$47', up: true },
    { label: 'Churn Rate', value: '2.1%', delta: '-0.3pp', up: true },
    { label: 'CAC', value: '$43', delta: '-$4', up: true },
    { label: 'NPS Score', value: '68', delta: '+3', up: true },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0f0f1a', color: '#e4e4e7' }}>
      <TopBar
        title="Advanced Analytics"
        actions={
          <>
            <button style={{ padding: '5px 12px', fontSize: 12, background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#a5b4fc', cursor: 'pointer' }}>New Report</button>
            <button style={{ padding: '5px 12px', fontSize: 12, background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#a5b4fc', cursor: 'pointer' }}>Schedule</button>
            <button style={{ padding: '5px 12px', fontSize: 12, background: '#6366f1', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Export</button>
          </>
        }
      />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, padding: '20px 24px 0' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f4f4f5', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.up ? '#10b981' : '#ef4444', marginTop: 4 }}>{k.delta} vs last month</div>
          </div>
        ))}
      </div>

      {/* 3-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: 16, padding: '16px 24px 24px', flex: 1, minHeight: 0 }}>

        {/* Left: Report tree */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Report Categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {REPORT_CATEGORIES.map(c => (
                <div key={c.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                  background: c.active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: c.active ? '#a5b4fc' : '#71717a',
                  fontSize: 13,
                }}>
                  <span style={{ fontWeight: c.active ? 600 : 400 }}>{c.name}</span>
                  <span style={{ fontSize: 10, background: c.active ? 'rgba(99,102,241,0.3)' : '#27272a', padding: '1px 6px', borderRadius: 10, color: c.active ? '#c7d2fe' : '#52525b' }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              <svg style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7.5 4.5H11L8 6.8L9.2 10.5L6 8.2L2.8 10.5L4 6.8L1 4.5H4.5L6 1Z" fill="#f59e0b" />
              </svg>
              Favorites
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {FAVORITES.map(f => (
                <div key={f.name} style={{ fontSize: 12, color: '#a1a1aa', padding: '5px 8px', borderRadius: 5, cursor: 'pointer', background: 'rgba(245,158,11,0.05)', borderLeft: '2px solid #f59e0b' }}>
                  {f.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Main chart area with tabs */}
        <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Tab strip */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(63,63,70,0.5)', padding: '0 16px' }}>
            {['Revenue', 'Customers', 'Operations'].map((tab, i) => (
              <div key={tab} style={{
                padding: '12px 16px', fontSize: 13, fontWeight: i === 0 ? 600 : 400, cursor: 'pointer',
                color: i === 0 ? '#a5b4fc' : '#71717a',
                borderBottom: i === 0 ? '2px solid #6366f1' : '2px solid transparent',
              }}>
                {tab}
              </div>
            ))}
          </div>

          <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
            {/* Revenue tab content */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>Revenue vs COGS vs Gross Profit — Last 12 Months</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                  {[['Revenue','#6366f1'],['COGS','#f59e0b'],['Gross Profit','#10b981']].map(([l,c])=>(
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 20, height: 2, background: c, display: 'inline-block', borderRadius: 2 }} />
                      <span style={{ color: '#71717a' }}>{l}</span>
                    </span>
                  ))}
                </div>
              </div>
              <AreaChart />

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 10 }}>Top 10 Products by Revenue</div>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
                      {['#', 'Product', 'Revenue', 'Units', 'Trend'].map(h => (
                        <th key={h} style={{ textAlign: h === '#' || h === 'Revenue' || h === 'Units' ? 'right' : 'left', padding: '6px 10px', color: '#52525b', fontWeight: 500, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_PRODUCTS.map((p, i) => (
                      <tr key={p.name} style={{ borderBottom: '1px solid rgba(39,39,42,0.5)' }}>
                        <td style={{ padding: '8px 10px', color: '#52525b', textAlign: 'right', fontSize: 11 }}>{i + 1}</td>
                        <td style={{ padding: '8px 10px', color: '#e4e4e7' }}>{p.name}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#a5b4fc', fontWeight: 500 }}>${(p.revenue / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#71717a' }}>{p.units.toLocaleString()}</td>
                        <td style={{ padding: '8px 10px' }}><SparkLine data={p.spark} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Insights + Saved/Scheduled */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

          {/* AI Insights */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1C3.69 1 1 3.69 1 7s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 2a1 1 0 110 2 1 1 0 010-2zm0 3c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1z" fill="#818cf8" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc' }}>AI Insights</div>
                <div style={{ fontSize: 10, color: '#52525b' }}>Powered by NovaPOS AI</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AI_INSIGHTS.map((ins, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(15,15,26,0.5)', borderRadius: 8, borderLeft: `3px solid ${ins.color}` }}>
                  <div style={{ fontSize: 12, color: '#d4d4d8', lineHeight: 1.5, marginBottom: 6 }}>{ins.text}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 3, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${ins.confidence}%`, height: '100%', background: ins.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#71717a' }}>{ins.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Reports FastTab */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Saved Reports</div>
              <span style={{ fontSize: 10, color: '#6366f1' }}>View all</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SAVED_REPORTS.map(r => (
                <div key={r.name} style={{ padding: '8px 10px', background: 'rgba(15,15,26,0.5)', borderRadius: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <div style={{ fontSize: 12, color: '#e4e4e7', flex: 1, marginRight: 8 }}>{r.name}</div>
                    <span style={{ fontSize: 9, background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '1px 5px', borderRadius: 4, whiteSpace: 'nowrap' }}>{r.type}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#52525b' }}>{r.owner} · {r.lastRun}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                    <button style={{ fontSize: 10, color: '#6366f1', background: 'rgba(99,102,241,0.1)', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>Run</button>
                    <button style={{ fontSize: 10, color: '#71717a', background: '#1e293b', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Reports FastTab */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Scheduled Reports</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SCHEDULED_REPORTS.map(s => (
                <div key={s.name} style={{ padding: '9px 10px', background: 'rgba(15,15,26,0.5)', borderRadius: 7, borderLeft: '2px solid #10b981' }}>
                  <div style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 500, marginBottom: 3 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: '#52525b', marginBottom: 2 }}>{s.freq}</div>
                  <div style={{ fontSize: 10, color: '#71717a' }}>→ {s.dest}</div>
                  <div style={{ fontSize: 10, color: '#10b981', marginTop: 3 }}>Next: {s.next}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
