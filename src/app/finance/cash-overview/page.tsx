'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CashData {
  kpis: {
    totalCash: number
    availableForUse: number
    restrictedCash: number
    forecastedInflow: number
    forecastedOutflow: number
  }
  accounts: {
    id: number
    account: string
    bank: string
    currency: string
    balance: number
    status: string
  }[]
  transfers: {
    id: number
    from: string
    to: string
    amount: number
    date: string
    status: string
  }[]
  cashByEntity: {
    entity: string
    available: number
    restricted: number
  }[]
  cashFlow30Days: {
    day: number
    inflow: number
    outflow: number
  }[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, currency = 'USD') {
  if (currency === 'EUR') return '€' + n.toLocaleString('en-US')
  if (currency === 'GBP') return '£' + n.toLocaleString('en-US')
  return '$' + n.toLocaleString('en-US')
}

function fmtM(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n.toLocaleString('en-US')
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiTile({ label, value, color, arrow }: {
  label: string
  value: string
  color: string
  arrow?: 'up' | 'down' | 'none'
}) {
  return (
    <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px 20px' }}>
      <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {arrow === 'up' && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {arrow === 'down' && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3V11M7 11L3.5 7.5M7 11L10.5 7.5" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <span style={{ fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</span>
      </div>
    </div>
  )
}

function CashByEntityChart({ data }: { data: CashData['cashByEntity'] }) {
  const maxVal = Math.max(...data.map(d => d.available + d.restricted))
  const W = 480
  const H = 180
  const labelW = 52
  const barAreaW = W - labelW - 16
  const rowH = 38
  const barH = 13

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {/* X-axis gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const x = labelW + t * barAreaW
        return (
          <g key={t}>
            <line x1={x} y1={0} x2={x} y2={H - 20} stroke="rgba(99,102,241,0.12)" strokeWidth="1" strokeDasharray="3,3"/>
            <text x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {t === 0 ? '$0' : `$${(t * maxVal / 1_000_000).toFixed(1)}M`}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const y = i * rowH + 8
        const availW = (d.available / maxVal) * barAreaW
        const restW  = (d.restricted / maxVal) * barAreaW
        return (
          <g key={d.entity}>
            <text x={labelW - 6} y={y + barH + 1} textAnchor="end" fontSize="11" fill="#e2e8f0" fontWeight="600">{d.entity}</text>
            {/* Available bar */}
            <rect x={labelW} y={y} width={availW} height={barH} rx="3" fill="#0d9488" opacity="0.85"/>
            {/* Restricted bar */}
            <rect x={labelW} y={y + barH + 4} width={restW} height={barH - 2} rx="3" fill="#d97706" opacity="0.75"/>
          </g>
        )
      })}
      {/* Legend */}
      <rect x={labelW} y={H - 4} width="8" height="8" rx="1" fill="#0d9488" opacity="0.85"/>
      <text x={labelW + 11} y={H + 4} fontSize="9" fill="#94a3b8">Available</text>
      <rect x={labelW + 68} y={H - 4} width="8" height="8" rx="1" fill="#d97706" opacity="0.75"/>
      <text x={labelW + 79} y={H + 4} fontSize="9" fill="#94a3b8">Restricted</text>
    </svg>
  )
}

function CashFlowChart({ data }: { data: CashData['cashFlow30Days'] }) {
  const W = 480
  const H = 160
  const padL = 40
  const padB = 24
  const padR = 8
  const padT = 8
  const innerW = W - padL - padR
  const innerH = H - padB - padT
  const maxVal = 5_000_000

  function xPos(day: number) { return padL + ((day - 1) / 29) * innerW }
  function yPos(val: number) { return padT + innerH - Math.min(val / maxVal, 1) * innerH }

  const inflowPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(d.day).toFixed(1)},${yPos(d.inflow).toFixed(1)}`).join(' ')
  const outflowPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(d.day).toFixed(1)},${yPos(d.outflow).toFixed(1)}`).join(' ')
  const inflowArea  = inflowPath + ` L${xPos(30).toFixed(1)},${(padT + innerH).toFixed(1)} L${xPos(1).toFixed(1)},${(padT + innerH).toFixed(1)} Z`
  const outflowArea = outflowPath + ` L${xPos(30).toFixed(1)},${(padT + innerH).toFixed(1)} L${xPos(1).toFixed(1)},${(padT + innerH).toFixed(1)} Z`

  const yTicks = [0, 1_250_000, 2_500_000, 3_750_000, 5_000_000]

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 16}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Y gridlines */}
      {yTicks.map(v => {
        const y = yPos(v)
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(99,102,241,0.1)" strokeWidth="1" strokeDasharray="3,3"/>
            <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8.5" fill="#94a3b8">
              {v === 0 ? '$0' : `$${(v / 1_000_000).toFixed(1)}M`}
            </text>
          </g>
        )
      })}
      {/* Area fills */}
      <path d={inflowArea}  fill="url(#inflowGrad)"/>
      <path d={outflowArea} fill="url(#outflowGrad)"/>
      {/* Lines */}
      <path d={inflowPath}  fill="none" stroke="#0d9488" strokeWidth="1.8"/>
      <path d={outflowPath} fill="none" stroke="#ef4444" strokeWidth="1.8"/>
      {/* X axis ticks: every 5 days */}
      {[1, 5, 10, 15, 20, 25, 30].map(d => (
        <text key={d} x={xPos(d)} y={H + 4} textAnchor="middle" fontSize="8.5" fill="#94a3b8">
          Day {d}
        </text>
      ))}
      {/* Legend */}
      <line x1={padL} y1={H + 14} x2={padL + 16} y2={H + 14} stroke="#0d9488" strokeWidth="2"/>
      <text x={padL + 20} y={H + 18} fontSize="9" fill="#94a3b8">Projected Inflow</text>
      <line x1={padL + 110} y1={H + 14} x2={padL + 126} y2={H + 14} stroke="#ef4444" strokeWidth="2"/>
      <text x={padL + 130} y={H + 18} fontSize="9" fill="#94a3b8">Projected Outflow</text>
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CashOverviewPage() {
  const [data, setData] = useState<CashData | null>(null)

  useEffect(() => {
    fetch('/api/finance/cash-overview')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  const kpis = data?.kpis

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Cash Overview"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Cash Overview', href: '/finance/cash-overview' },
        ]}
      />

      <div style={{ padding: '24px 28px', maxWidth: 1600 }}>

        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
          <KpiTile label="Total Cash Position"  value={kpis ? fmtM(kpis.totalCash)          : '—'} color="#e2e8f0"  arrow="up"   />
          <KpiTile label="Available for Use"    value={kpis ? fmtM(kpis.availableForUse)    : '—'} color="#60a5fa"  arrow="none" />
          <KpiTile label="Restricted Cash"      value={kpis ? fmtM(kpis.restrictedCash)     : '—'} color="#d97706"  arrow="none" />
          <KpiTile label="Forecasted Inflow"    value={kpis ? fmtM(kpis.forecastedInflow)   : '—'} color="#10b981"  arrow="up"   />
          <KpiTile label="Forecasted Outflow"   value={kpis ? fmtM(kpis.forecastedOutflow)  : '—'} color="#ef4444"  arrow="down" />
        </div>

        {/* 2-Column Main */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 20 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Cash by Legal Entity */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>Cash by Legal Entity</p>
              {data ? <CashByEntityChart data={data.cashByEntity} /> : (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Loading…</span>
                </div>
              )}
            </div>

            {/* Cash Flow — Next 30 Days */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>Cash Flow — Next 30 Days</p>
              {data ? <CashFlowChart data={data.cashFlow30Days} /> : (
                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Loading…</span>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Bank Account Balances */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Bank Account Balances</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {['Account', 'Bank', 'Currency', 'Balance', 'Status'].map(h => (
                        <th key={h} style={{
                          padding: '6px 10px', textAlign: h === 'Balance' ? 'right' : 'left',
                          color: '#94a3b8', fontWeight: 500, fontSize: 10, textTransform: 'uppercase',
                          letterSpacing: '0.05em', borderBottom: '1px solid rgba(99,102,241,0.15)'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.accounts ?? []).map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                        <td style={{ padding: '8px 10px', color: '#e2e8f0', fontWeight: 500 }}>{row.account}</td>
                        <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{row.bank}</td>
                        <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{row.currency}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                          color: row.status === 'Restricted' ? '#d97706' : '#e2e8f0', fontWeight: 600 }}>
                          {fmt(row.balance, row.currency)}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                            background: row.status === 'Restricted' ? 'rgba(217,119,6,0.15)' : 'rgba(16,185,129,0.12)',
                            color: row.status === 'Restricted' ? '#d97706' : '#10b981',
                            border: `1px solid ${row.status === 'Restricted' ? 'rgba(217,119,6,0.3)' : 'rgba(16,185,129,0.25)'}`,
                          }}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Transfers */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>Pending Transfers</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(data?.transfers ?? []).map(t => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 8,
                    background: '#0d0e24', border: '1px solid rgba(99,102,241,0.12)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{t.from}</span>
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                          <path d="M1 5h12M8 1l4 4-4 4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{t.to}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', fontVariantNumeric: 'tabular-nums' }}>
                        ${t.amount.toLocaleString('en-US')}
                      </span>
                      <span style={{
                        display: 'inline-block', padding: '2px 9px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                        background: t.status === 'Approved' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.15)',
                        color: t.status === 'Approved' ? '#10b981' : '#a5b4fc',
                        border: `1px solid ${t.status === 'Approved' ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.3)'}`,
                      }}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
