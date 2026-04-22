'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const THEME = {
  bg: '#0d0e24',
  card: '#16213e',
  border: 'rgba(99,102,241,0.15)',
  accent: 'rgba(99,102,241,0.3)',
  text: '#e2e8f0',
  muted: '#94a3b8',
  indigo: '#6366f1',
  teal: '#14b8a6',
  amber: '#f59e0b',
  green: '#22c55e',
  red: '#ef4444',
  gray: '#64748b',
}

interface BudgetRow {
  plan: string
  year: string
  status: 'Approved' | 'Under Review' | 'Draft'
  total: string
  spent: string
  remaining: string
  pct: number
}

const BUDGET_ROWS: BudgetRow[] = [
  { plan: 'Annual Operating 2026', year: '2026', status: 'Approved', total: '$48.2M', spent: '$18.7M', remaining: '$29.5M', pct: 38.8 },
  { plan: 'Capital Expenditure', year: '2026', status: 'Approved', total: '$12.0M', spent: '$4.2M', remaining: '$7.8M', pct: 35.0 },
  { plan: 'R&D Initiative', year: '2026', status: 'Under Review', total: '$6.5M', spent: '$1.1M', remaining: '$5.4M', pct: 16.9 },
  { plan: 'Emergency Reserve', year: '2026', status: 'Approved', total: '$2.0M', spent: '$0.3M', remaining: '$1.7M', pct: 15.0 },
  { plan: 'Marketing Campaign', year: 'Q2 2026', status: 'Draft', total: '$1.8M', spent: '$0M', remaining: '$1.8M', pct: 0 },
]

const DEPT_DATA = [
  { dept: 'Finance', budget: 3200000, actual: 2100000 },
  { dept: 'Operations', budget: 4800000, actual: 3900000 },
  { dept: 'Sales', budget: 4200000, actual: 3100000 },
  { dept: 'Marketing', budget: 1800000, actual: 1584000 },
  { dept: 'IT', budget: 2600000, actual: 2392000 },
  { dept: 'HR', budget: 1400000, actual: 890000 },
]

const ALERTS = [
  { dept: 'IT', pct: 92, severity: 'red' as const, msg: 'IT dept 92% budget used — approaching limit' },
  { dept: 'Marketing', pct: 88, severity: 'amber' as const, msg: 'Marketing 88% used — monitor closely' },
  { dept: 'Travel', pct: 74, severity: 'amber' as const, msg: 'Travel 74% used — on watch' },
]

const FORECAST_DATA = [
  { cat: 'Revenue', forecast: 48.2, actual: 46.8 },
  { cat: 'OpEx', forecast: 32.1, actual: 33.4 },
  { cat: 'CapEx', forecast: 12.0, actual: 11.3 },
  { cat: 'Headcount', forecast: 8.5, actual: 8.7 },
]

function statusColor(s: BudgetRow['status']) {
  if (s === 'Approved') return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' }
  if (s === 'Under Review') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' }
  return { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
}

function pctBarColor(pct: number) {
  if (pct > 90) return THEME.red
  if (pct > 70) return THEME.amber
  return THEME.green
}

// SVG grouped bar chart
function BudgetVsActualChart() {
  const W = 680
  const H = 280
  const padL = 60
  const padR = 16
  const padT = 20
  const padB = 48
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const maxVal = 5000000
  const groupW = chartW / DEPT_DATA.length
  const barW = groupW * 0.3
  const gap = groupW * 0.04

  function yScale(v: number) {
    return padT + chartH - (v / maxVal) * chartH
  }

  const yTicks = [0, 1000000, 2000000, 3000000, 4000000, 5000000]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Y grid + labels */}
      {yTicks.map((t) => {
        const y = yScale(t)
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill={THEME.muted}>
              ${t === 0 ? '0' : `${t / 1000000}M`}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {DEPT_DATA.map((d, i) => {
        const cx = padL + i * groupW + groupW / 2
        const bx = cx - barW - gap / 2
        const ax = cx + gap / 2
        const bH = (d.budget / maxVal) * chartH
        const aH = (d.actual / maxVal) * chartH
        const pct = Math.round((d.actual / d.budget) * 100)
        return (
          <g key={d.dept}>
            {/* Budget bar */}
            <rect x={bx} y={yScale(d.budget)} width={barW} height={bH} fill={THEME.indigo} rx={2} opacity={0.85} />
            {/* Actual bar */}
            <rect x={ax} y={yScale(d.actual)} width={barW} height={aH} fill={THEME.teal} rx={2} opacity={0.85} />
            {/* % label */}
            <text x={cx} y={yScale(d.actual) - 5} textAnchor="middle" fontSize={8.5} fill={THEME.muted}>
              {pct}%
            </text>
            {/* X label */}
            <text x={cx} y={H - padB + 16} textAnchor="middle" fontSize={9.5} fill={THEME.text}>
              {d.dept}
            </text>
          </g>
        )
      })}

      {/* Legend */}
      <rect x={padL + 2} y={padT - 14} width={10} height={8} fill={THEME.indigo} rx={1} />
      <text x={padL + 16} y={padT - 7} fontSize={9} fill={THEME.muted}>Budget</text>
      <rect x={padL + 62} y={padT - 14} width={10} height={8} fill={THEME.teal} rx={1} />
      <text x={padL + 76} y={padT - 7} fontSize={9} fill={THEME.muted}>Actual</text>
    </svg>
  )
}

// Small dot-plot for forecast accuracy
function ForecastDotPlot() {
  const W = 240
  const H = 110
  const padL = 52
  const padR = 10
  const padT = 12
  const padB = 12
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const minV = 0
  const maxV = 55

  function xScale(v: number) {
    return padL + ((v - minV) / (maxV - minV)) * chartW
  }

  const rowH = chartH / FORECAST_DATA.length

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {FORECAST_DATA.map((d, i) => {
        const y = padT + i * rowH + rowH / 2
        const fx = xScale(d.forecast)
        const ax = xScale(d.actual)
        const diff = d.actual - d.forecast
        const lineColor = Math.abs(diff) < 1 ? THEME.green : diff > 0 ? THEME.red : THEME.amber
        return (
          <g key={d.cat}>
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={8.5} fill={THEME.muted}>{d.cat}</text>
            <line x1={Math.min(fx, ax)} y1={y} x2={Math.max(fx, ax)} y2={y} stroke={lineColor} strokeWidth={1.5} opacity={0.5} />
            <circle cx={fx} cy={y} r={4} fill={THEME.indigo} />
            <circle cx={ax} cy={y} r={4} fill={THEME.teal} />
          </g>
        )
      })}
      {/* legend */}
      <circle cx={padL} cy={H - 4} r={3} fill={THEME.indigo} />
      <text x={padL + 6} y={H - 1} fontSize={7.5} fill={THEME.muted}>Forecast</text>
      <circle cx={padL + 50} cy={H - 4} r={3} fill={THEME.teal} />
      <text x={padL + 56} y={H - 1} fontSize={7.5} fill={THEME.muted}>Actual</text>
    </svg>
  )
}

const NAV_TILES = [
  { label: 'All budget plans', count: 12, badge: null },
  { label: 'My budget plans', count: 3, badge: null },
  { label: 'Awaiting approval', count: 2, badge: 'amber' as const },
  { label: 'Budget register entries', count: 847, badge: null },
  { label: 'Forecast positions', count: 156, badge: null },
]

export default function LedgerBudgetsPage() {
  const [_data, setData] = useState<unknown>(null)
  const [activeNav, setActiveNav] = useState(0)

  useEffect(() => {
    fetch('/api/finance/ledger-budgets')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null)
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <TopBar
        title="Ledger Budgets & Forecasts"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Ledger Budgets', href: '/finance/ledger-budgets' },
        ]}
        actions={
          <>
            <button
              style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: THEME.indigo, color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Create Budget
            </button>
            <button
              style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'transparent', color: THEME.text, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}
            >
              Import
            </button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 0, height: 'calc(100dvh - 72px)' }}>
        {/* LEFT SIDEBAR */}
        <aside style={{ borderRight: `1px solid ${THEME.border}`, padding: '16px 12px', overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Workspace</p>
          {NAV_TILES.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActiveNav(i)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '9px 12px', borderRadius: 7, marginBottom: 4,
                background: activeNav === i ? THEME.accent : THEME.card,
                border: `1px solid ${activeNav === i ? THEME.indigo : THEME.border}`,
                color: activeNav === i ? '#fff' : THEME.text,
                fontSize: 12, fontWeight: activeNav === i ? 600 : 400,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span>{t.label}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 7px',
                background: t.badge === 'amber' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.15)',
                color: t.badge === 'amber' ? THEME.amber : THEME.muted,
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </aside>

        {/* MAIN */}
        <main style={{ overflowY: 'auto', padding: '20px 24px' }}>
          {/* Chart */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Budget vs Actual YTD</p>
            <BudgetVsActualChart />
          </div>

          {/* Budget Table */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.border}` }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Budget Plans</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    {['Budget Plan', 'Fiscal Year', 'Status', 'Total Budget', 'Spent', 'Remaining', '% Used'].map((h) => (
                      <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BUDGET_ROWS.map((row, i) => {
                    const sc = statusColor(row.status)
                    const barC = pctBarColor(row.pct)
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '10px 14px', fontWeight: 500, color: THEME.text }}>{row.plan}</td>
                        <td style={{ padding: '10px 14px', color: THEME.muted }}>{row.year}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{row.status}</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: THEME.text }}>{row.total}</td>
                        <td style={{ padding: '10px 14px', color: THEME.text }}>{row.spent}</td>
                        <td style={{ padding: '10px 14px', color: THEME.text }}>{row.remaining}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 64, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                              <div style={{ width: `${Math.min(row.pct, 100)}%`, height: '100%', borderRadius: 3, background: barC }} />
                            </div>
                            <span style={{ fontSize: 11, color: barC, fontWeight: 600, minWidth: 36 }}>{row.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside style={{ borderLeft: `1px solid ${THEME.border}`, padding: '16px 14px', overflowY: 'auto' }}>
          {/* Budget Alerts */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '14px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Budget Alerts</p>
            {ALERTS.map((a) => (
              <div key={a.dept} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: a.severity === 'red' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 16 16" width={14} height={14} fill={a.severity === 'red' ? THEME.red : THEME.amber}>
                    <path d="M8 1.5L1.5 13h13L8 1.5zm0 2.1l5.2 9H2.8L8 3.6zM7.25 7v3h1.5V7h-1.5zm0 4v1.5h1.5V11h-1.5z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: a.severity === 'red' ? THEME.red : THEME.amber, marginBottom: 2 }}>{a.dept} — {a.pct}% used</p>
                  <p style={{ fontSize: 10, color: THEME.muted, lineHeight: 1.4 }}>{a.msg}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Forecast Accuracy */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '14px 14px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Forecast Accuracy</p>
            <p style={{ fontSize: 10, color: THEME.muted, marginBottom: 10 }}>Last quarter forecast vs actual</p>
            <ForecastDotPlot />
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {FORECAST_DATA.map((d) => (
                <div key={d.cat} style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: 9, color: THEME.muted }}>{d.cat}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, color: Math.abs(d.actual - d.forecast) < 1 ? THEME.green : THEME.amber }}>
                    {d.actual > d.forecast ? '+' : ''}{((d.actual - d.forecast) / d.forecast * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
