'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const PROPOSAL_STATUS: Record<string, string> = {
  'Ready to Post': 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  'Under Review':  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  'Posted':        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'Rejected':      'bg-red-500/20 text-red-400 border border-red-500/30',
}

function fmt(n: number) { return '$' + n.toLocaleString() }

type Proposal = { id: string; project: string; customer: string; amount: number; status: string; created: string; due: string }
type Transaction = { date: string; employee: string; activity: string; units: number; rate: number; amount: number }
type AgingBucket = { bucket: string; amount: number }
type PaymentRow = { date: string; customer: string; amount: number; daysToPay: number }
type RevenueRow = { project: string; name: string; billed: number; contract: number }

type InvoicingData = {
  kpis: { invoiceableThisMonth: number; invoicedYTD: number; outstandingUnpaid: number; avgPaymentDays: number }
  proposals: Proposal[]
  billingDetail: { proposalId: string; transactions: Transaction[]; retentionPct: number; retained: number; toBill: number; total: number }
  revenueByProject: RevenueRow[]
  agingInvoices: AgingBucket[]
  paymentHistory: PaymentRow[]
}

function RevenueChart({ data }: { data: RevenueRow[] }) {
  const maxVal = Math.max(...data.map(d => d.contract))
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: 160 }}>
      {data.map((r, i) => {
        const y = 12 + i * 29
        const billedW = (r.billed / maxVal) * 200
        const totalW = (r.contract / maxVal) * 200
        return (
          <g key={r.project}>
            <text x="0" y={y + 9} fill="#94a3b8" fontSize="9" fontFamily="monospace">{r.project.slice(-7)}</text>
            {/* remaining bar */}
            <rect x={60} y={y} width={totalW} height={12} rx="3" fill="rgba(148,163,184,0.15)" />
            {/* billed bar */}
            <rect x={60} y={y} width={billedW} height={12} rx="3" fill="rgba(20,184,166,0.7)" />
            <text x={60 + totalW + 4} y={y + 9} fill="#94a3b8" fontSize="8">{fmt(r.billed)}</text>
          </g>
        )
      })}
      {/* legend */}
      <rect x={60} y={150} width={10} height={8} rx="2" fill="rgba(20,184,166,0.7)" />
      <text x={74} y={157} fill="#94a3b8" fontSize="8">Billed</text>
      <rect x={105} y={150} width={10} height={8} rx="2" fill="rgba(148,163,184,0.15)" />
      <text x={119} y={157} fill="#94a3b8" fontSize="8">Remaining</text>
    </svg>
  )
}

function AgingDonut({ data }: { data: AgingBucket[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0)
  const colors = ['#14b8a6','#f59e0b','#f97316','#ef4444']
  let angle = -90
  const cx = 44, cy = 44, r = 32, ir = 18

  const slices = data.map((d, i) => {
    const deg = (d.amount / total) * 360
    const startAngle = angle
    angle += deg
    const start = { x: cx + r * Math.cos(startAngle * Math.PI / 180), y: cy + r * Math.sin(startAngle * Math.PI / 180) }
    const end = { x: cx + r * Math.cos((startAngle + deg) * Math.PI / 180), y: cy + r * Math.sin((startAngle + deg) * Math.PI / 180) }
    const iStart = { x: cx + ir * Math.cos(startAngle * Math.PI / 180), y: cy + ir * Math.sin(startAngle * Math.PI / 180) }
    const iEnd = { x: cx + ir * Math.cos((startAngle + deg) * Math.PI / 180), y: cy + ir * Math.sin((startAngle + deg) * Math.PI / 180) }
    const largeArc = deg > 180 ? 1 : 0
    return { d: `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} L ${iEnd.x} ${iEnd.y} A ${ir} ${ir} 0 ${largeArc} 0 ${iStart.x} ${iStart.y} Z`, color: colors[i] }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg viewBox="0 0 88 88" style={{ width: 88, height: 88, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} opacity="0.8" />)}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.map((d, i) => (
          <div key={d.bucket} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[i] }} />
            <span style={{ color: '#94a3b8', minWidth: 60 }}>{d.bucket}</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{fmt(d.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InvoicingPage() {
  const [data, setData] = useState<InvoicingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState('IP-2026-041')
  const [openBilling, setOpenBilling] = useState(true)
  const [openRetention, setOpenRetention] = useState(true)

  useEffect(() => {
    fetch('/api/projects/invoicing')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  const kpiLabels = ['Invoiceable This Month','Invoiced YTD','Outstanding (Unpaid)','Avg Payment Days']
  const kpiValues = data ? [data.kpis.invoiceableThisMonth, data.kpis.invoicedYTD, data.kpis.outstandingUnpaid, data.kpis.avgPaymentDays] : [0,0,0,0]
  const kpiFormats = [fmt, fmt, fmt, (n: number) => n + ' days']
  const kpiColors = ['#14b8a6','#6366f1','#f59e0b','#94a3b8']

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <TopBar
        title="Project Invoicing"
        breadcrumb={[{ label: 'Projects', href: '/projects' }, { label: 'Invoicing', href: '/projects/invoicing' }]}
        actions={
          <>
            <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create Invoice Proposal</button>
            <button style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Post Invoice</button>
            <button style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Print</button>
            <button style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Send by Email</button>
          </>
        }
      />

      {/* KPI Strip */}
      <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {kpiLabels.map((label, i) => (
          <div key={label} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpiColors[i] }}>
              {loading ? '—' : kpiFormats[i](kpiValues[i])}
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div style={{ padding: '0 24px 32px', display: 'grid', gridTemplateColumns: '60% 40%', gap: 16 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Invoice Proposals */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Invoice Proposals</h3>
              <span style={{ fontSize: 11, color: '#475569' }}>{data?.proposals.length || 0} proposals</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.04)' }}>
                    {['Proposal #','Project','Customer','Amount','Status','Created','Due'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#475569' }}>Loading…</td></tr>
                  ) : data?.proposals.map(p => (
                    <tr key={p.id} onClick={() => setSelectedProposal(p.id)}
                      style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', cursor: 'pointer', background: selectedProposal === p.id ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (selectedProposal !== p.id) e.currentTarget.style.background = 'rgba(99,102,241,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = selectedProposal === p.id ? 'rgba(99,102,241,0.08)' : 'transparent' }}
                    >
                      <td style={{ padding: '9px 12px', color: '#6366f1', fontWeight: 600, fontFamily: 'monospace' }}>{p.id}</td>
                      <td style={{ padding: '9px 12px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: 11 }}>{p.project}</td>
                      <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{p.customer}</td>
                      <td style={{ padding: '9px 12px', color: '#e2e8f0', fontWeight: 600, textAlign: 'right' }}>{fmt(p.amount)}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <span className={PROPOSAL_STATUS[p.status] || ''} style={{ borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '9px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.created}</td>
                      <td style={{ padding: '9px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing Detail FastTabs */}
          {data && (
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '10px 18px', borderBottom: '1px solid rgba(99,102,241,0.1)', fontSize: 12, color: '#94a3b8' }}>
                Billing Detail — <span style={{ color: '#6366f1', fontWeight: 600, fontFamily: 'monospace' }}>{selectedProposal}</span>
              </div>

              {/* Billable Transactions FastTab */}
              <details open={openBilling} onToggle={e => setOpenBilling((e.target as HTMLDetailsElement).open)}>
                <summary style={{ padding: '12px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#e2e8f0', background: 'rgba(99,102,241,0.04)', borderBottom: '1px solid rgba(99,102,241,0.08)', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6366f1', fontSize: 11 }}>{openBilling ? '▾' : '▸'}</span>
                  Billable Transactions
                </summary>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.03)' }}>
                        {['Date','Employee','Activity','Hours/Units','Rate','Amount'].map(h => (
                          <th key={h} style={{ padding: '7px 12px', textAlign: h === 'Amount' || h === 'Hours/Units' || h === 'Rate' ? 'right' : 'left', color: '#475569', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.billingDetail.transactions.map((t, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.05)' }}>
                          <td style={{ padding: '7px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{t.date}</td>
                          <td style={{ padding: '7px 12px', color: '#e2e8f0' }}>{t.employee}</td>
                          <td style={{ padding: '7px 12px', color: '#94a3b8' }}>{t.activity}</td>
                          <td style={{ padding: '7px 12px', color: '#e2e8f0', textAlign: 'right' }}>{t.units}h</td>
                          <td style={{ padding: '7px 12px', color: '#94a3b8', textAlign: 'right' }}>${t.rate}/h</td>
                          <td style={{ padding: '7px 12px', color: '#e2e8f0', fontWeight: 600, textAlign: 'right' }}>{fmt(t.amount)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)' }}>
                        <td colSpan={5} style={{ padding: '9px 12px', fontWeight: 700, color: '#e2e8f0', textAlign: 'right' }}>Total</td>
                        <td style={{ padding: '9px 12px', fontWeight: 800, color: '#10b981', textAlign: 'right', fontSize: 13 }}>{fmt(data.billingDetail.total)}.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>

              {/* Retention FastTab */}
              <details open={openRetention} onToggle={e => setOpenRetention((e.target as HTMLDetailsElement).open)} style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                <summary style={{ padding: '12px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#e2e8f0', background: 'rgba(99,102,241,0.04)', borderBottom: '1px solid rgba(99,102,241,0.08)', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6366f1', fontSize: 11 }}>{openRetention ? '▾' : '▸'}</span>
                  Retention
                </summary>
                <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    ['Retention %', `${data.billingDetail.retentionPct}%`, '#f59e0b'],
                    ['Retained', fmt(data.billingDetail.retained), '#ef4444'],
                    ['To Bill', fmt(data.billingDetail.toBill), '#10b981'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 6, padding: '12px 14px', border: '1px solid rgba(99,102,241,0.1)' }}>
                      <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: color as string }}>{value}</div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Revenue by Project */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', margin: '0 0 12px' }}>Revenue by Project</h3>
            {loading ? <div style={{ color: '#475569', fontSize: 12 }}>Loading…</div> : data && <RevenueChart data={data.revenueByProject} />}
          </div>

          {/* Aging Invoices */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', margin: '0 0 14px' }}>Aging Invoices</h3>
            {loading ? <div style={{ color: '#475569', fontSize: 12 }}>Loading…</div> : data && <AgingDonut data={data.agingInvoices} />}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(99,102,241,0.1)', fontSize: 11, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Outstanding</span>
              <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{data ? fmt(data.agingInvoices.reduce((s, d) => s + d.amount, 0)) : '—'}</span>
            </div>
          </div>

          {/* Customer Payment History */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Customer Payment History</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.04)' }}>
                  {['Date','Customer','Amount','Days'].map(h => (
                    <th key={h} style={{ padding: '7px 14px', textAlign: 'left', color: '#475569', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#475569' }}>Loading…</td></tr>
                ) : data?.paymentHistory.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                    <td style={{ padding: '8px 14px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.date}</td>
                    <td style={{ padding: '8px 14px', color: '#e2e8f0' }}>{p.customer}</td>
                    <td style={{ padding: '8px 14px', color: '#10b981', fontWeight: 600 }}>{fmt(p.amount)}</td>
                    <td style={{ padding: '8px 14px', color: p.daysToPay <= 30 ? '#10b981' : p.daysToPay <= 45 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{p.daysToPay}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
