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
}

const SIDEBAR_TILES = [
  { label: 'All bank accounts', count: 8 },
  { label: 'Pending reconciliation', count: 3, amber: true },
  { label: 'Unmatched transactions', count: 27, amber: true },
  { label: 'Electronic payments', count: 12 },
  { label: 'Positive pay files', count: 2 },
]

const BANK_ACCOUNTS = [
  { id: 'BA-001', bank: 'JPMorgan Chase', type: 'Checking', currency: 'USD', book: '$5,234,100', bankBal: '$5,234,100', diff: '$0', reconciled: 'Apr 20', ok: true },
  { id: 'BA-002', bank: 'Bank of America', type: 'Checking', currency: 'USD', book: '$2,967,341', bankBal: '$2,972,000', diff: '-$4,659', reconciled: 'Apr 18', ok: false },
  { id: 'BA-003', bank: 'Wells Fargo', type: 'Payroll', currency: 'USD', book: '$1,001,000', bankBal: '$1,001,000', diff: '$0', reconciled: 'Apr 22', ok: true },
  { id: 'BA-004', bank: 'Deutsche Bank', type: 'Checking', currency: 'EUR', book: '€891,200', bankBal: '€891,200', diff: '€0', reconciled: 'Apr 19', ok: true },
  { id: 'BA-005', bank: 'HSBC', type: 'GBP', currency: 'GBP', book: '£412,850', bankBal: '£415,200', diff: '-£2,350', reconciled: 'Apr 15', ok: false },
  { id: 'BA-006', bank: 'Citibank', type: 'Savings', currency: 'USD', book: '$750,000', bankBal: '$750,000', diff: '$0', reconciled: 'Apr 21', ok: true },
  { id: 'BA-007', bank: 'TD Bank', type: 'Checking', currency: 'CAD', book: 'CA$320,000', bankBal: 'CA$320,000', diff: 'CA$0', reconciled: 'Apr 20', ok: true },
  { id: 'BA-008', bank: 'Silicon Valley Bank', type: 'Operating', currency: 'USD', book: '$185,400', bankBal: '$185,400', diff: '$0', reconciled: 'Apr 22', ok: true },
]

const TRANSACTIONS = [
  { date: 'Apr 22', desc: 'Wire Transfer — Vendor XYZ', amount: '-$48,200.00', type: 'Debit', matched: true },
  { date: 'Apr 22', desc: 'Customer Payment #1041', amount: '+$125,000.00', type: 'Credit', matched: true },
  { date: 'Apr 21', desc: 'ACH Payroll Run', amount: '-$312,480.00', type: 'Debit', matched: true },
  { date: 'Apr 21', desc: 'Interest Income', amount: '+$1,240.00', type: 'Credit', matched: false },
  { date: 'Apr 20', desc: 'Supplier Invoice #8821', amount: '-$22,650.00', type: 'Debit', matched: true },
  { date: 'Apr 20', desc: 'Customer Deposit #4502', amount: '+$89,300.00', type: 'Credit', matched: false },
  { date: 'Apr 19', desc: 'Bank Fee — Monthly', amount: '-$85.00', type: 'Debit', matched: false },
  { date: 'Apr 19', desc: 'Wire Receipt — Partner A', amount: '+$500,000.00', type: 'Credit', matched: true },
  { date: 'Apr 18', desc: 'Check #4421', amount: '-$3,400.00', type: 'Debit', matched: false },
  { date: 'Apr 18', desc: 'Refund — Vendor B', amount: '+$1,200.00', type: 'Credit', matched: true },
]

const RECON_STATUS = [
  { account: 'BA-001', bank: 'JPMorgan Chase', book: '$5,234,100', bankBal: '$5,234,100', unmatched: 0, ok: true },
  { account: 'BA-002', bank: 'Bank of America', book: '$2,967,341', bankBal: '$2,972,000', unmatched: 12, ok: false },
  { account: 'BA-005', bank: 'HSBC', book: '£412,850', bankBal: '£415,200', unmatched: 8, ok: false },
]

// 14-day cash flow forecast data
const FORECAST_DAYS = ['Apr 22', 'Apr 23', 'Apr 24', 'Apr 25', 'Apr 26', 'Apr 27', 'Apr 28', 'Apr 29', 'Apr 30', 'May 1', 'May 2', 'May 3', 'May 4', 'May 5']
const INFLOWS =  [125000, 89300, 210000, 45000, 320000, 0, 0, 175000, 98000, 450000, 120000, 0, 0, 88000]
const OUTFLOWS = [48200, 312480, 22650, 95000, 180000, 0, 0, 85000, 420000, 65000, 38000, 0, 0, 72000]

function CashFlowChart() {
  const W = 520, H = 160
  const pad = { t: 16, r: 16, b: 28, l: 44 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b
  const n = FORECAST_DAYS.length
  const maxVal = Math.max(...INFLOWS, ...OUTFLOWS) * 1.15

  const scaleY = (v: number) => pad.t + iH - (v / maxVal) * iH
  const scaleX = (i: number) => pad.l + (i / (n - 1)) * iW

  // Build area paths
  const inPath = INFLOWS.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ')
  const inArea = `${inPath} L${scaleX(n - 1).toFixed(1)},${(pad.t + iH).toFixed(1)} L${scaleX(0).toFixed(1)},${(pad.t + iH).toFixed(1)} Z`

  const outPath = OUTFLOWS.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ')
  const outArea = `${outPath} L${scaleX(n - 1).toFixed(1)},${(pad.t + iH).toFixed(1)} L${scaleX(0).toFixed(1)},${(pad.t + iH).toFixed(1)} Z`

  // Net line
  const netPath = INFLOWS.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i).toFixed(1)},${scaleY(v - OUTFLOWS[i]).toFixed(1)}`).join(' ')

  // Y axis labels
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal]

  return (
    <svg width={W} height={H} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <line key={i} x1={pad.l} y1={scaleY(t)} x2={pad.l + iW} y2={scaleY(t)} stroke="rgba(99,102,241,0.08)" strokeWidth={1} />
      ))}

      {/* Areas */}
      <path d={inArea} fill="url(#inGrad)" />
      <path d={outArea} fill="url(#outGrad)" />

      {/* Lines */}
      <path d={inPath} fill="none" stroke="#22d3ee" strokeWidth={1.5} />
      <path d={outPath} fill="none" stroke="#ef4444" strokeWidth={1.5} />
      <path d={netPath} fill="none" stroke="rgba(226,232,240,0.7)" strokeWidth={1.5} strokeDasharray="4,3" />

      {/* X axis labels — every other */}
      {FORECAST_DAYS.map((d, i) => i % 2 === 0 && (
        <text key={d} x={scaleX(i)} y={H - 6} textAnchor="middle" fill={THEME.muted} fontSize={8}>{d}</text>
      ))}

      {/* Y axis labels */}
      {yTicks.filter((_, i) => i > 0).map((t, i) => (
        <text key={i} x={pad.l - 4} y={scaleY(t) + 4} textAnchor="end" fill={THEME.muted} fontSize={8}>
          {t >= 1000000 ? `$${(t / 1000000).toFixed(1)}M` : `$${(t / 1000).toFixed(0)}K`}
        </text>
      ))}

      {/* Legend */}
      <rect x={pad.l} y={4} width={8} height={8} rx={1} fill="#22d3ee" fillOpacity={0.5} />
      <text x={pad.l + 12} y={12} fill={THEME.muted} fontSize={8}>Inflows</text>
      <rect x={pad.l + 60} y={4} width={8} height={8} rx={1} fill="#ef4444" fillOpacity={0.4} />
      <text x={pad.l + 74} y={12} fill={THEME.muted} fontSize={8}>Outflows</text>
      <line x1={pad.l + 120} y1={8} x2={pad.l + 136} y2={8} stroke="rgba(226,232,240,0.7)" strokeWidth={1.5} strokeDasharray="4,3" />
      <text x={pad.l + 140} y={12} fill={THEME.muted} fontSize={8}>Net Cash</text>
    </svg>
  )
}

export default function BankManagementPage() {
  const [, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/finance/bank-management').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'var(--font-geist-sans, system-ui)' }}>
      <TopBar
        title="Bank Management"
        breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Bank Management', href: '/finance/bank-management' }]}
        actions={
          <>
            <button style={{ background: 'rgba(99,102,241,0.9)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New Bank Account</button>
            <button style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Reconcile</button>
            <button style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Import Statement</button>
          </>
        }
      />
      <div style={{ display: 'flex', height: 'calc(100dvh - 80px)' }}>

        {/* Left Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, background: THEME.card, borderRight: `1px solid ${THEME.border}`, padding: '16px 0', overflowY: 'auto' }}>
          <div style={{ padding: '0 12px 12px', fontSize: 11, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Workspace</div>
          {SIDEBAR_TILES.map(t => (
            <div key={t.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 16px', cursor: 'pointer', fontSize: 13, color: THEME.muted,
              borderLeft: '2px solid transparent',
            }}>
              <span>{t.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, borderRadius: 10, padding: '1px 7px',
                background: t.amber ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.1)',
                color: t.amber ? '#f59e0b' : '#818cf8',
              }}>{t.count}</span>
            </div>
          ))}
        </aside>

        {/* Main Content — 2 columns */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'grid', gridTemplateColumns: '60% 40%', gap: 20, alignContent: 'start' }}>

          {/* LEFT: Bank Accounts Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${THEME.border}`, fontSize: 13, fontWeight: 600 }}>Bank Accounts Overview</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                      {['Account', 'Bank Name', 'Type', 'Currency', 'Book Balance', 'Bank Balance', 'Difference', 'Last Reconciled'].map((h, i) => (
                        <th key={h} style={{
                          padding: '10px 12px',
                          textAlign: (i >= 4 && i <= 6) ? 'right' : 'left',
                          color: THEME.muted, fontWeight: 600, whiteSpace: 'nowrap',
                          borderBottom: `1px solid ${THEME.border}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BANK_ACCOUNTS.map((a, i) => (
                      <tr key={a.id} style={{
                        background: !a.ok ? 'rgba(245,158,11,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                        borderBottom: `1px solid ${THEME.border}`,
                      }}>
                        <td style={{ padding: '9px 12px', color: '#818cf8', fontWeight: 600, fontFamily: 'monospace' }}>{a.id}</td>
                        <td style={{ padding: '9px 12px', color: THEME.text }}>{a.bank}</td>
                        <td style={{ padding: '9px 12px', color: THEME.muted }}>{a.type}</td>
                        <td style={{ padding: '9px 12px' }}>
                          <span style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontFamily: 'monospace' }}>{a.currency}</span>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', color: THEME.text, fontFamily: 'monospace' }}>{a.book}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', color: THEME.text, fontFamily: 'monospace' }}>{a.bankBal}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: a.ok ? '#34d399' : '#f59e0b' }}>{a.diff}</td>
                        <td style={{ padding: '9px 12px', color: a.ok ? '#34d399' : '#f59e0b', fontSize: 11 }}>{a.reconciled}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Flow Forecast Chart */}
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Cash Flow — 14 Day Forecast</div>
              <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 14 }}>Apr 22 – May 5, 2026</div>
              <CashFlowChart />
            </div>
          </div>

          {/* RIGHT: Transactions + Reconciliation Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Recent Bank Transactions */}
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${THEME.border}`, fontSize: 13, fontWeight: 600 }}>Recent Bank Transactions</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                      {['Date', 'Description', 'Amount', 'Type', 'Matched'].map((h, i) => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: i === 2 ? 'right' : 'left', color: THEME.muted, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: `1px solid ${THEME.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TRANSACTIONS.map((tx, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '8px 12px', color: THEME.muted, whiteSpace: 'nowrap' }}>{tx.date}</td>
                        <td style={{ padding: '8px 12px', color: THEME.text, fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.desc}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: tx.amount.startsWith('+') ? '#34d399' : '#f59e0b' }}>{tx.amount}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ background: tx.type === 'Credit' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', color: tx.type === 'Credit' ? '#34d399' : '#f59e0b', padding: '1px 6px', borderRadius: 3, fontSize: 10 }}>{tx.type}</span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          {tx.matched ? (
                            <svg width={14} height={14} viewBox="0 0 14 14" style={{ display: 'inline-block' }}>
                              <circle cx={7} cy={7} r={6} fill="rgba(52,211,153,0.15)" />
                              <path d="M4 7l2 2 4-4" stroke="#34d399" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width={14} height={14} viewBox="0 0 14 14" style={{ display: 'inline-block' }}>
                              <circle cx={7} cy={7} r={6} fill="rgba(245,158,11,0.15)" />
                              <path d="M5 5l4 4M9 5l-4 4" stroke="#f59e0b" strokeWidth={1.5} strokeLinecap="round" />
                            </svg>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reconciliation Status */}
            <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Reconciliation Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RECON_STATUS.map(r => (
                  <div key={r.account} style={{ background: THEME.bg, borderRadius: 6, padding: 12, border: `1px solid ${r.ok ? THEME.border : 'rgba(245,158,11,0.2)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', fontFamily: 'monospace' }}>{r.account}</span>
                        <span style={{ fontSize: 11, color: THEME.muted, marginLeft: 8 }}>{r.bank}</span>
                      </div>
                      {r.ok ? (
                        <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Reconciled</span>
                      ) : (
                        <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{r.unmatched} Unmatched</span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8, fontSize: 11 }}>
                      <div><span style={{ color: THEME.muted }}>Book: </span><span style={{ color: THEME.text, fontFamily: 'monospace' }}>{r.book}</span></div>
                      <div><span style={{ color: THEME.muted }}>Bank: </span><span style={{ color: THEME.text, fontFamily: 'monospace' }}>{r.bankBal}</span></div>
                    </div>
                    {!r.ok && (
                      <button style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 5, padding: '4px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>Reconcile</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
