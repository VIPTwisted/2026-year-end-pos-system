'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Currency {
  code: string; name: string; symbol: string; rate: number
  rateDate: string; rateType: string; rounding: string; active: boolean
}
interface CurrencyData {
  baseCurrency: string; activeCurrencies: number; lastRateUpdate: string; currencies: Currency[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const S = {
  bg: '#0d0e24', card: '#16213e', border: 'rgba(99,102,241,0.15)',
  text: '#e2e8f0', muted: '#94a3b8', indigo: '#6366f1',
}

// ─── SVG Exchange Rate Chart ──────────────────────────────────────────────────
function RateTrendChart() {
  const W = 820, H = 200, PAD = { top: 20, right: 20, bottom: 30, left: 50 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const days = 22 // Apr 1 – Apr 22
  const yMin = 0.6, yMax = 1.4

  // Seed deterministic data for 3 lines over 22 days
  const seed = (base: number, amp: number, i: number, s: number) =>
    base + amp * Math.sin(i * 0.45 + s) + amp * 0.3 * Math.sin(i * 1.2 + s * 2)

  const eurData = Array.from({ length: days }, (_, i) => seed(1.084, 0.012, i, 0))
  const gbpData = Array.from({ length: days }, (_, i) => seed(1.263, 0.015, i, 1.5))
  const cadData = Array.from({ length: days }, (_, i) => seed(0.740, 0.010, i, 3.0))

  const xScale = (i: number) => PAD.left + (i / (days - 1)) * chartW
  const yScale = (v: number) => PAD.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH

  const toPath = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ')

  const lines = [
    { data: eurData, color: '#2dd4bf', label: 'EUR/USD' },
    { data: gbpData, color: '#6366f1', label: 'GBP/USD' },
    { data: cadData, color: '#f59e0b', label: 'CAD/USD' },
  ]

  // Y gridlines
  const yTicks = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4]
  // X labels: Apr 1, Apr 8, Apr 15, Apr 22
  const xLabels = [0, 7, 14, 21]

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* Grid */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)} stroke="rgba(99,102,241,0.1)" strokeWidth={1} />
          <text x={PAD.left - 6} y={yScale(v) + 4} textAnchor="end" fontSize={9} fill={S.muted}>{v.toFixed(1)}</text>
        </g>
      ))}
      {/* X axis labels */}
      {xLabels.map(i => (
        <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle" fontSize={9} fill={S.muted}>Apr {i + 1}</text>
      ))}
      {/* Lines */}
      {lines.map(l => (
        <path key={l.label} d={toPath(l.data)} fill="none" stroke={l.color} strokeWidth={1.8} strokeLinejoin="round" />
      ))}
      {/* End dots */}
      {lines.map(l => (
        <circle key={l.label + '-dot'} cx={xScale(days - 1)} cy={yScale(l.data[days - 1])} r={3} fill={l.color} />
      ))}
      {/* Legend */}
      {lines.map((l, i) => (
        <g key={l.label + '-leg'} transform={`translate(${PAD.left + i * 100}, ${PAD.top})`}>
          <line x1={0} y1={6} x2={16} y2={6} stroke={l.color} strokeWidth={2} />
          <text x={20} y={10} fontSize={10} fill={S.muted}>{l.label}</text>
        </g>
      ))}
      {/* Hover tooltip hint */}
      <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} fill="transparent" style={{ cursor: 'crosshair' }} />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CurrenciesPage() {
  const [data, setData]         = useState<CurrencyData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol]   = useState<keyof Currency>('code')
  const [sortAsc, setSortAsc]   = useState(true)

  useEffect(() => {
    fetch('/api/admin/currencies')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const sorted = (data?.currencies ?? []).slice().sort((a, b) => {
    const av = String(a[sortCol]), bv = String(b[sortCol])
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  const toggleSort = (col: keyof Currency) => {
    if (sortCol === col) setSortAsc(!sortAsc); else { setSortCol(col); setSortAsc(true) }
  }
  const toggleRow = (code: string) => {
    setSelected(prev => { const s = new Set(prev); s.has(code) ? s.delete(code) : s.add(code); return s })
  }
  const toggleAll = () => setSelected(prev => prev.size === sorted.length ? new Set() : new Set(sorted.map(c => c.code)))

  const ColHead = ({ col, label }: { col: keyof Currency; label: string }) => (
    <th onClick={() => toggleSort(col)} style={{
      padding: '10px 14px', textAlign: 'left', fontSize: 11, color: S.muted, fontWeight: 600,
      cursor: 'pointer', userSelect: 'none', borderBottom: `1px solid ${S.border}`,
      whiteSpace: 'nowrap', background: S.card,
    }}>
      {label} {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  )

  return (
    <div style={{ minHeight: '100dvh', background: S.bg, display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title="Currencies"
        breadcrumb={[
          { label: 'Administration', href: '/admin' },
          { label: 'Currencies', href: '/admin/currencies' },
        ]}
        actions={
          <>
            <button style={btnPrimary}>Add Currency</button>
            <button style={btnSecondary}>Update Exchange Rates</button>
            <button style={btnSecondary}>Rate History</button>
          </>
        }
      />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '20px 24px 0' }}>
        {[
          { label: 'Base Currency',     value: data?.baseCurrency ?? '—',     sub: 'System default' },
          { label: 'Active Currencies', value: String(data?.activeCurrencies ?? '—'), sub: 'Enabled for transactions' },
          { label: 'Last Rate Update',  value: data?.lastRateUpdate ?? '—',   sub: 'Auto-updated daily' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: S.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: S.text, marginTop: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ margin: '20px 24px 0', border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: S.muted }}>Loading currencies...</div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px', borderBottom: `1px solid ${S.border}`, background: S.card, width: 36 }}>
                    <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0} onChange={toggleAll} />
                  </th>
                  <ColHead col="code"      label="Code" />
                  <ColHead col="name"      label="Name" />
                  <ColHead col="symbol"    label="Symbol" />
                  <ColHead col="rate"      label="Exchange Rate to USD" />
                  <ColHead col="rateDate"  label="Rate Date" />
                  <ColHead col="rateType"  label="Rate Type" />
                  <ColHead col="rounding"  label="Rounding" />
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, color: S.muted, fontWeight: 600, borderBottom: `1px solid ${S.border}`, background: S.card }}>Active</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(c => {
                  const isBase = c.code === 'USD'
                  const isSelected = selected.has(c.code)
                  return (
                    <tr
                      key={c.code}
                      onClick={() => toggleRow(c.code)}
                      style={{
                        borderBottom: `1px solid ${S.border}`, cursor: 'pointer',
                        background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                        transition: 'background .12s',
                      }}
                    >
                      <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRow(c.code)} />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: S.indigo }}>{c.code}</span>
                          {isBase && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'rgba(34,197,94,0.12)', color: '#4ade80', fontWeight: 700 }}>BASE</span>}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: S.text }}>{c.name}</td>
                      <td style={{ padding: '10px 14px', color: S.muted, fontFamily: 'monospace', fontSize: 14 }}>{c.symbol}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: isBase ? '#4ade80' : S.text }}>
                          {c.rate.toFixed(5)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12 }}>{c.rateDate}</td>
                      <td style={{ padding: '10px 14px', color: S.muted, fontSize: 12 }}>{c.rateType}</td>
                      <td style={{ padding: '10px 14px', color: S.muted, fontFamily: 'monospace', fontSize: 12 }}>{c.rounding}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {c.active ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill="rgba(34,197,94,0.15)" stroke="#4ade80" strokeWidth="1.5" />
                            <polyline points="4.5,8 7,10.5 11.5,5.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill="rgba(148,163,184,0.1)" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" />
                          </svg>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rate trend chart */}
      <div style={{ margin: '20px 24px 24px', border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden', background: S.card }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${S.border}` }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: S.text }}>Exchange Rate Trend</span>
          <span style={{ marginLeft: 10, fontSize: 11, color: S.muted }}>Apr 1 – Apr 22, 2026 · EUR/USD · GBP/USD · CAD/USD</span>
        </div>
        <div style={{ padding: '16px' }}>
          <RateTrendChart />
        </div>
      </div>
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: 'pointer', border: 'none',
  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
}
const btnSecondary: React.CSSProperties = {
  padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer',
  background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)',
}
