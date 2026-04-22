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
  yellow: '#eab308',
}

interface Company {
  code: string
  name: string
  currency: string
  converted: string | null
  ownership: string
  status: 'Included' | 'Excluded'
}

interface RunHistory {
  date: string
  period: string
  companies: number
  eliminations: number
  status: 'Completed' | 'In Progress'
  user: string
}

interface Elimination {
  account: string
  debit: string
  credit: string
  description: string
}

interface ExchangeRate {
  pair: string
  rate: number
  variance: string
}

const COMPANIES: Company[] = [
  { code: 'USMF', name: 'Contoso US', currency: 'USD', converted: null, ownership: '100%', status: 'Included' },
  { code: 'USRT', name: 'Contoso Retail', currency: 'USD', converted: null, ownership: '100%', status: 'Included' },
  { code: 'DEMF', name: 'Contoso DE', currency: 'EUR', converted: 'USD', ownership: '100%', status: 'Included' },
  { code: 'GBSI', name: 'Contoso UK', currency: 'GBP', converted: 'USD', ownership: '100%', status: 'Included' },
]

const RUN_HISTORY: RunHistory[] = [
  { date: 'Apr 21, 2026', period: 'Apr 2026', companies: 4, eliminations: 23, status: 'Completed', user: 'jsmith' },
  { date: 'Mar 31, 2026', period: 'Mar 2026', companies: 4, eliminations: 19, status: 'Completed', user: 'jsmith' },
  { date: 'Feb 28, 2026', period: 'Feb 2026', companies: 4, eliminations: 21, status: 'Completed', user: 'adavis' },
  { date: 'Jan 31, 2026', period: 'Jan 2026', companies: 4, eliminations: 18, status: 'Completed', user: 'adavis' },
  { date: 'Dec 31, 2025', period: 'Dec 2025', companies: 4, eliminations: 27, status: 'Completed', user: 'jsmith' },
]

const ELIMINATIONS: Elimination[] = [
  { account: '13100 – IC Receivable USMF', debit: '$0', credit: '$284,200', description: 'USMF → DEMF interco offset' },
  { account: '21300 – IC Payable DEMF', debit: '$284,200', credit: '$0', description: 'DEMF → USMF interco offset' },
  { account: '40100 – IC Revenue USRT', debit: '$192,400', credit: '$0', description: 'USRT interco revenue elim.' },
  { account: '50200 – IC COGS GBSI', debit: '$0', credit: '$192,400', description: 'GBSI interco COGS elim.' },
  { account: '39000 – Investment in Sub', debit: '$0', credit: '$519,000', description: 'Subsidiary equity elim.' },
]

const EXCHANGE_RATES: ExchangeRate[] = [
  { pair: 'EUR/USD', rate: 1.0842, variance: '+0.32%' },
  { pair: 'GBP/USD', rate: 1.2634, variance: '-0.18%' },
  { pair: 'CAD/USD', rate: 0.7398, variance: '+0.07%' },
]

const KPI_TILES = [
  { label: 'Last Run', value: 'Apr 21, 2026', color: THEME.muted },
  { label: 'Companies Consolidated', value: '4', color: '#60a5fa' },
  { label: 'Elimination Entries', value: '23', color: THEME.green },
  { label: 'Intercompany Differences', value: '$1,240', color: THEME.amber },
]

export default function ConsolidationsPage() {
  const [_data, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/finance/consolidations')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null)
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <TopBar
        title="Consolidations"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Consolidations', href: '/finance/consolidations' },
        ]}
        actions={
          <>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: THEME.indigo, color: '#fff', border: 'none', cursor: 'pointer' }}>
              Run Consolidation
            </button>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'transparent', color: THEME.text, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
              View History
            </button>
          </>
        }
      />

      <div style={{ padding: '20px 24px' }}>
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {KPI_TILES.map((k) => (
            <div key={k.label} style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Main 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 20 }}>
          {/* LEFT */}
          <div>
            {/* Consolidation Group Tree */}
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Consolidation Group</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    {['Company Code', 'Name', 'Currency', 'Ownership', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Parent row */}
                  <tr style={{ borderBottom: `1px solid ${THEME.border}`, background: THEME.accent }}>
                    <td colSpan={5} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 12, color: THEME.text }}>
                      <span style={{ marginRight: 8, opacity: 0.6 }}>▾</span>
                      NovaPOS Holdings (USD) — Parent
                    </td>
                  </tr>
                  {COMPANIES.map((c) => (
                    <tr key={c.code} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ padding: '9px 14px 9px 28px', color: THEME.muted, fontFamily: 'monospace', fontSize: 11 }}>{c.code}</td>
                      <td style={{ padding: '9px 14px', fontWeight: 500, color: THEME.text }}>{c.name}</td>
                      <td style={{ padding: '9px 14px', fontSize: 11 }}>
                        <span style={{ color: THEME.muted }}>{c.currency}</span>
                        {c.converted && <span style={{ color: THEME.amber, marginLeft: 4 }}>→ {c.converted}</span>}
                      </td>
                      <td style={{ padding: '9px 14px', color: THEME.muted }}>{c.ownership}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: THEME.green }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Run History */}
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Consolidation Run History</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    {['Run Date', 'Period', 'Companies', 'Eliminations', 'Status', 'User'].map((h) => (
                      <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RUN_HISTORY.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ padding: '9px 14px', color: THEME.muted }}>{r.date}</td>
                      <td style={{ padding: '9px 14px', color: THEME.text }}>{r.period}</td>
                      <td style={{ padding: '9px 14px', color: THEME.muted }}>{r.companies}</td>
                      <td style={{ padding: '9px 14px', color: THEME.muted }}>{r.eliminations}</td>
                      <td style={{ padding: '9px 14px' }}>
                        {r.status === 'In Progress' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(234,179,8,0.15)', color: THEME.yellow }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.yellow, animation: 'pulse 1.5s infinite' }} />
                            In Progress
                          </span>
                        ) : (
                          <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: THEME.green }}>
                            Completed
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px', color: THEME.muted, fontFamily: 'monospace', fontSize: 11 }}>{r.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            {/* Intercompany Eliminations */}
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Intercompany Eliminations</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    {['Account', 'Debit', 'Credit', 'Description'].map((h) => (
                      <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 9.5, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ELIMINATIONS.map((e, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ padding: '8px 12px', color: THEME.muted, fontFamily: 'monospace', fontSize: 10 }}>{e.account}</td>
                      <td style={{ padding: '8px 12px', color: e.debit !== '$0' ? THEME.red : THEME.muted }}>{e.debit}</td>
                      <td style={{ padding: '8px 12px', color: e.credit !== '$0' ? THEME.green : THEME.muted }}>{e.credit}</td>
                      <td style={{ padding: '8px 12px', color: THEME.muted, fontSize: 10 }}>{e.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Currency Translation */}
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Currency Translation</p>
              <p style={{ fontSize: 10, color: THEME.muted, marginBottom: 14 }}>Exchange rates used in consolidation run</p>
              {EXCHANGE_RATES.map((r) => (
                <div key={r.pair} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${THEME.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 20, borderRadius: 4, background: THEME.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: THEME.indigo, fontFamily: 'monospace' }}>{r.pair.split('/')[0]}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: THEME.text }}>{r.pair}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>{r.rate.toFixed(4)}</p>
                    <p style={{ fontSize: 10, color: r.variance.startsWith('+') ? THEME.green : THEME.red }}>{r.variance} vs budget</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
