'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ───────────────────────────────────────────────────────────────────

interface InsightsData {
  kpis: {
    revenueYTD:        { value: number; change: number; unit: string }
    grossMargin:       { value: number; change: number; unit: string }
    operatingExpenses: { value: number; change: number; unit: string }
    netIncome:         { value: number; change: number; unit: string }
  }
  sparklines: {
    revenueYTD: number[]
    grossMargin: number[]
    operatingExpenses: number[]
    netIncome: number[]
  }
  revenueBudget: { month: string; actual: number; budget: number }[]
  expenseBreakdown: { label: string; value: number; color: string }[]
  profitabilityByBU: { bu: string; profit: number }[]
  workingCapital: { month: string; currentAssets: number; currentLiabilities: number }[]
  keyRatios: { label: string; value: string; health: string }[]
  recentJournals: { date: string; account: string; debit: number; credit: number; posted: boolean }[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtM(n: number, unit: string) {
  if (unit === '%') return n.toFixed(1) + '%'
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n.toLocaleString('en-US')
}

function fmtAmt(n: number) {
  if (n === 0) return '—'
  return '$' + n.toLocaleString('en-US')
}

const healthColor = (h: string) => h === 'green' ? '#10b981' : h === 'amber' ? '#d97706' : '#ef4444'

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 64, H = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const area = `${pts} ${W},${H} 0,${H}`
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"/>
    </svg>
  )
}

// ─── Revenue vs Budget Chart ──────────────────────────────────────────────────

function RevenueBudgetChart({ data }: { data: InsightsData['revenueBudget'] }) {
  const W = 340, H = 160
  const padL = 44, padB = 28, padT = 20, padR = 8
  const innerW = W - padL - padR
  const innerH = H - padB - padT
  const maxVal = Math.max(...data.flatMap(d => [d.actual, d.budget])) * 1.15
  const groupW = innerW / data.length
  const barW = (groupW - 8) / 2

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = padT + innerH - t * innerH
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(99,102,241,0.1)" strokeWidth="1" strokeDasharray="3,3"/>
            <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8.5" fill="#94a3b8">
              ${(t * maxVal / 1_000_000).toFixed(1)}M
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const x = padL + i * groupW + 4
        const aH = (d.actual / maxVal) * innerH
        const bH = (d.budget / maxVal) * innerH
        const variance = ((d.actual - d.budget) / d.budget * 100).toFixed(1)
        const varColor = d.actual >= d.budget ? '#10b981' : '#ef4444'
        const topY = padT + innerH - Math.max(aH, bH) - 14
        return (
          <g key={d.month}>
            {/* Actual */}
            <rect x={x} y={padT + innerH - aH} width={barW} height={aH} rx="2" fill="#6366f1" opacity="0.85"/>
            {/* Budget */}
            <rect x={x + barW + 2} y={padT + innerH - bH} width={barW} height={bH} rx="2" fill="#334155" opacity="0.9"/>
            {/* Variance label */}
            <text x={x + barW} y={topY} textAnchor="middle" fontSize="8" fill={varColor} fontWeight="600">
              {d.actual >= d.budget ? '+' : ''}{variance}%
            </text>
            {/* Month label */}
            <text x={x + barW} y={H - 10} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.month}</text>
          </g>
        )
      })}
      {/* Legend */}
      <rect x={padL} y={H - 2} width="8" height="8" rx="1" fill="#6366f1" opacity="0.85"/>
      <text x={padL + 11} y={H + 6} fontSize="8.5" fill="#94a3b8">Actual</text>
      <rect x={padL + 50} y={H - 2} width="8" height="8" rx="1" fill="#334155" opacity="0.9"/>
      <text x={padL + 61} y={H + 6} fontSize="8.5" fill="#94a3b8">Budget</text>
    </svg>
  )
}

// ─── Expense Breakdown Pie ─────────────────────────────────────────────────────

function ExpensePie({ data }: { data: InsightsData['expenseBreakdown'] }) {
  const R = 55, cx = 66, cy = 66
  let cumAngle = -Math.PI / 2
  const slices = data.map(d => {
    const angle = (d.value / 100) * Math.PI * 2
    const startA = cumAngle
    cumAngle += angle
    const endA = cumAngle
    const x1 = cx + R * Math.cos(startA), y1 = cy + R * Math.sin(startA)
    const x2 = cx + R * Math.cos(endA),   y2 = cy + R * Math.sin(endA)
    const large = angle > Math.PI ? 1 : 0
    return { ...d, path: `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z` }
  })

  return (
    <svg width="100%" viewBox="0 0 280 140" style={{ overflow: 'visible' }}>
      <g>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity="0.85" stroke="#0d0e24" strokeWidth="1.5"/>
        ))}
      </g>
      {/* Legend */}
      <g transform="translate(144, 16)">
        {slices.map((s, i) => (
          <g key={i} transform={`translate(0, ${i * 22})`}>
            <rect width="10" height="10" rx="2" fill={s.color} opacity="0.85" y="1"/>
            <text x="15" y="10" fontSize="11" fill="#e2e8f0">{s.label}</text>
            <text x="120" y="10" textAnchor="end" fontSize="11" fill="#94a3b8" fontVariantNumeric="tabular-nums">{s.value}%</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

// ─── Profitability by BU Chart ────────────────────────────────────────────────

function ProfitByBUChart({ data }: { data: InsightsData['profitabilityByBU'] }) {
  const maxVal = Math.max(...data.map(d => d.profit))
  const W = 320, rowH = 36, labelW = 94

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${data.length * rowH + 16}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="buBarGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d9488"/>
          <stop offset="100%" stopColor="#6366f1"/>
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const y = i * rowH + 8
        const barW = ((d.profit / maxVal) * (W - labelW - 60))
        return (
          <g key={d.bu}>
            <text x={labelW - 6} y={y + 13} textAnchor="end" fontSize="11" fill="#e2e8f0">{d.bu}</text>
            <rect x={labelW} y={y} width={barW} height={20} rx="4" fill="url(#buBarGrad)" opacity="0.85"/>
            <text x={labelW + barW + 6} y={y + 13} fontSize="10" fill="#94a3b8">
              ${(d.profit / 1_000_000).toFixed(1)}M
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Working Capital Chart ─────────────────────────────────────────────────────

function WorkingCapitalChart({ data }: { data: InsightsData['workingCapital'] }) {
  const W = 320, H = 140
  const padL = 38, padB = 24, padT = 8, padR = 8
  const innerW = W - padL - padR
  const innerH = H - padB - padT
  const maxVal = Math.max(...data.flatMap(d => [d.currentAssets, d.currentLiabilities])) * 1.1

  function xPos(i: number) { return padL + (i / (data.length - 1)) * innerW }
  function yPos(v: number) { return padT + innerH - (v / maxVal) * innerH }

  const assetsPath    = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(d.currentAssets).toFixed(1)}`).join(' ')
  const liabPath      = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(d.currentLiabilities).toFixed(1)}`).join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 18}`} style={{ overflow: 'visible' }}>
      {[0, 0.5, 1].map(t => {
        const y = yPos(t * maxVal)
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(99,102,241,0.1)" strokeWidth="1" strokeDasharray="3,3"/>
            <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8.5" fill="#94a3b8">
              ${(t * maxVal / 1_000_000).toFixed(0)}M
            </text>
          </g>
        )
      })}
      <path d={assetsPath} fill="none" stroke="#0d9488" strokeWidth="1.8"/>
      <path d={liabPath}   fill="none" stroke="#ef4444" strokeWidth="1.8"/>
      {data.map((d, i) => (
        i % 3 === 0 ? (
          <text key={i} x={xPos(i)} y={H - 4} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{d.month}</text>
        ) : null
      ))}
      {/* Legend */}
      <line x1={padL} y1={H + 10} x2={padL + 16} y2={H + 10} stroke="#0d9488" strokeWidth="2"/>
      <text x={padL + 20} y={H + 14} fontSize="8.5" fill="#94a3b8">Current Assets</text>
      <line x1={padL + 110} y1={H + 10} x2={padL + 126} y2={H + 10} stroke="#ef4444" strokeWidth="2"/>
      <text x={padL + 130} y={H + 14} fontSize="8.5" fill="#94a3b8">Current Liabilities</text>
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinancialInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [dateRange, setDateRange] = useState('This Quarter')
  const [legalEntity, setLegalEntity] = useState('All')
  const [businessUnit, setBusinessUnit] = useState('All')

  useEffect(() => {
    fetch('/api/finance/financial-insights')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  const kpiDefs: { key: keyof InsightsData['kpis']; label: string; sparkKey: keyof InsightsData['sparklines']; color: string }[] = [
    { key: 'revenueYTD',        label: 'Revenue YTD',          sparkKey: 'revenueYTD',        color: '#6366f1' },
    { key: 'grossMargin',       label: 'Gross Margin',          sparkKey: 'grossMargin',       color: '#0d9488' },
    { key: 'operatingExpenses', label: 'Operating Expenses',    sparkKey: 'operatingExpenses', color: '#d97706' },
    { key: 'netIncome',         label: 'Net Income',            sparkKey: 'netIncome',         color: '#10b981' },
  ]

  const selectStyle: React.CSSProperties = {
    background: '#16213e', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 7,
    color: '#e2e8f0', fontSize: 12, padding: '5px 10px', outline: 'none', cursor: 'pointer'
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Financial Insights"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Financial Insights', href: '/finance/financial-insights' },
        ]}
      />

      <div style={{ padding: '24px 28px', maxWidth: 1600 }}>

        {/* Filters Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
          background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '10px 16px'
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filters:</span>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={selectStyle}>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>Last Quarter</option>
            <option>Last 12 Months</option>
          </select>
          <select value={legalEntity} onChange={e => setLegalEntity(e.target.value)} style={selectStyle}>
            <option>All</option>
            <option>USMF</option>
            <option>USRT</option>
            <option>DEMF</option>
            <option>GBSI</option>
          </select>
          <select value={businessUnit} onChange={e => setBusinessUnit(e.target.value)} style={selectStyle}>
            <option>All</option>
            <option>Manufacturing</option>
            <option>Retail</option>
            <option>Services</option>
            <option>Distribution</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6366f1' }}>
            {dateRange} · {legalEntity === 'All' ? 'All Entities' : legalEntity} · {businessUnit === 'All' ? 'All BUs' : businessUnit}
          </span>
        </div>

        {/* Top KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {kpiDefs.map(def => {
            const kpi = data?.kpis[def.key]
            const spark = data?.sparklines[def.sparkKey]
            const isPositiveGood = def.key !== 'operatingExpenses'
            const changePos = kpi ? kpi.change > 0 : null
            const isGood = kpi ? (isPositiveGood ? kpi.change > 0 : kpi.change < 0) : null
            const changeColor = isGood === null ? '#94a3b8' : isGood ? '#10b981' : '#ef4444'
            return (
              <div key={def.key} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px 18px' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{def.label}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: 6 }}>
                      {kpi ? fmtM(kpi.value, kpi.unit) : '—'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {kpi && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          {changePos
                            ? <path d="M6 9V3M6 3L3 5.5M6 3L9 5.5" stroke={changeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            : <path d="M6 3V9M6 9L3 6.5M6 9L9 6.5" stroke={changeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          }
                        </svg>
                      )}
                      <span style={{ fontSize: 11, color: changeColor, fontWeight: 600 }}>
                        {kpi ? `${kpi.change > 0 ? '+' : ''}${kpi.change}${def.key === 'grossMargin' ? 'pp' : '%'} vs prior` : '—'}
                      </span>
                    </div>
                  </div>
                  {spark && <Sparkline values={spark} color={def.color}/>}
                </div>
              </div>
            )
          })}
        </div>

        {/* 3-Column Main */}
        <div style={{ display: 'grid', gridTemplateColumns: '35% 35% 30%', gap: 18 }}>

          {/* COL 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Revenue vs Budget */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Revenue vs Budget</p>
              {data ? <RevenueBudgetChart data={data.revenueBudget}/> : (
                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Loading…</span>
                </div>
              )}
            </div>

            {/* Expense Breakdown */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Expense Breakdown</p>
              {data ? <ExpensePie data={data.expenseBreakdown}/> : (
                <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Loading…</span>
                </div>
              )}
            </div>

          </div>

          {/* COL 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Profitability by BU */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Profitability by Business Unit</p>
              {data ? <ProfitByBUChart data={data.profitabilityByBU}/> : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Loading…</span>
                </div>
              )}
            </div>

            {/* Working Capital Trend */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Working Capital Trend</p>
              {data ? <WorkingCapitalChart data={data.workingCapital}/> : (
                <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Loading…</span>
                </div>
              )}
            </div>

          </div>

          {/* COL 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Key Ratios */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Key Ratios</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(data?.keyRatios ?? []).map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < (data?.keyRatios.length ?? 0) - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none'
                  }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{r.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>{r.value}</span>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: healthColor(r.health),
                        boxShadow: `0 0 6px ${healthColor(r.health)}60`,
                        display: 'inline-block', flexShrink: 0
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Journal Entries */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Recent Journal Entries</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      {['Date', 'Account', 'Debit', 'Credit', 'Status'].map(h => (
                        <th key={h} style={{
                          padding: '5px 8px', textAlign: ['Debit','Credit'].includes(h) ? 'right' : 'left',
                          color: '#94a3b8', fontWeight: 500, fontSize: 10, textTransform: 'uppercase',
                          letterSpacing: '0.05em', borderBottom: '1px solid rgba(99,102,241,0.15)'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentJournals ?? []).map((j, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                        <td style={{ padding: '7px 8px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{j.date}</td>
                        <td style={{ padding: '7px 8px', color: '#e2e8f0', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.account}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: j.debit ? '#60a5fa' : '#475569' }}>
                          {fmtAmt(j.debit)}
                        </td>
                        <td style={{ padding: '7px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: j.credit ? '#10b981' : '#475569' }}>
                          {fmtAmt(j.credit)}
                        </td>
                        <td style={{ padding: '7px 8px' }}>
                          <span style={{
                            display: 'inline-block', padding: '1px 7px', borderRadius: 999, fontSize: 9, fontWeight: 600,
                            background: j.posted ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.15)',
                            color: j.posted ? '#10b981' : '#a5b4fc',
                            border: `1px solid ${j.posted ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.3)'}`,
                          }}>{j.posted ? 'Posted' : 'Draft'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
