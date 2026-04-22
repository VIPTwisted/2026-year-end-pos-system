'use client'

import { useState, useEffect } from 'react'
import TopBar from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type AttentionRow = {
  order: string
  customer: string
  date: string
  amount: string
  issue: string
  issueType: 'hold' | 'stock' | 'approval' | 'dispute' | 'payment' | 'address' | 'fraud' | 'expired'
}

type RepRow = {
  name: string
  amount: number
  color: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ATTENTION_ROWS: AttentionRow[] = [
  { order: 'SO-2026-4812', customer: 'Fabrikam Inc', date: 'Apr 15', amount: '$24,300', issue: 'Credit hold', issueType: 'hold' },
  { order: 'SO-2026-4891', customer: 'Adatum Corp', date: 'Apr 18', amount: '$8,750', issue: 'Awaiting stock', issueType: 'stock' },
  { order: 'SO-2026-4902', customer: 'Contoso Ltd', date: 'Apr 19', amount: '$156,000', issue: 'Pending approval', issueType: 'approval' },
  { order: 'SO-2026-4915', customer: 'Trey Research', date: 'Apr 20', amount: '$3,200', issue: 'Address invalid', issueType: 'address' },
  { order: 'SO-2026-4921', customer: 'Litware Inc', date: 'Apr 20', amount: '$47,600', issue: 'Payment dispute', issueType: 'dispute' },
  { order: 'SO-2026-4933', customer: 'Northwind Traders', date: 'Apr 21', amount: '$12,875', issue: 'Credit hold', issueType: 'hold' },
  { order: 'SO-2026-4940', customer: 'Alpine Ski House', date: 'Apr 21', amount: '$5,490', issue: 'Expired quote', issueType: 'expired' },
  { order: 'SO-2026-4947', customer: 'Wide World Importers', date: 'Apr 22', amount: '$88,100', issue: 'Fraud review', issueType: 'fraud' },
]

const REP_ROWS: RepRow[] = [
  { name: 'Alice Chen', amount: 284300, color: '#6366f1' },
  { name: 'Bob Wilson', amount: 241750, color: '#6366f1' },
  { name: 'Carlos Mendez', amount: 198200, color: '#6366f1' },
  { name: 'Sarah Lopez', amount: 162400, color: '#6366f1' },
  { name: 'John Smith', amount: 134800, color: '#6366f1' },
  { name: 'Dana Park', amount: 97600, color: '#6366f1' },
]

const ISSUE_CHIP: Record<string, string> = {
  hold: 'bg-red-500/20 text-red-400 border border-red-500/30',
  stock: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  approval: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  address: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  dispute: 'bg-red-500/20 text-red-400 border border-red-500/30',
  expired: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30',
  fraud: 'bg-red-500/20 text-red-400 border border-red-500/30',
  payment: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
}

const ACTION_LABEL: Record<string, string> = {
  hold: 'Release',
  stock: 'Expedite',
  approval: 'Approve',
  address: 'Edit',
  dispute: 'Review',
  expired: 'Reactivate',
  fraud: 'Escalate',
  payment: 'Contact',
}

const NAV_TILES = [
  { label: 'Open orders', count: 284, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { label: 'Orders to invoice', count: 47, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { label: 'Backorders', count: 12, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { label: 'Unconfirmed', count: 8, color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
  { label: 'My orders', count: 31, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { label: 'All quotations', count: 156, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
]

const FUNNEL_STAGES = [
  { label: 'Quotes', count: 156, pct: null, w: 100 },
  { label: 'Confirmed', count: 284, pct: '182%', w: 85 },
  { label: 'Shipped', count: 201, pct: '70.8%', w: 70 },
  { label: 'Invoiced', count: 47, pct: '23.4%', w: 55 },
]

const MAX_BAR = REP_ROWS[0].amount

function fmtK(n: number) {
  return '$' + (n / 1000).toFixed(0) + 'k'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProcessingInquiryPage() {
  const [activeNav, setActiveNav] = useState(0)
  const [_data, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/sales/processing-inquiry')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Sales Order Processing & Inquiry"
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
          { label: 'Processing & Inquiry', href: '/sales/processing-inquiry' },
        ]}
        actions={
          <>
            <button
              className="px-3 py-1.5 rounded text-xs font-medium text-white"
              style={{ background: 'rgba(99,102,241,0.75)' }}
            >
              New Sales Order
            </button>
            <button
              className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}
            >
              New Quote
            </button>
          </>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left nav 220px ── */}
        <aside
          className="w-[220px] shrink-0 overflow-y-auto py-4 px-3 flex flex-col gap-1"
          style={{ background: '#0d0e24', borderRight: '1px solid rgba(99,102,241,0.15)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
            Order Views
          </p>
          {NAV_TILES.map((tile, i) => (
            <button
              key={tile.label}
              onClick={() => setActiveNav(i)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs transition-colors ${
                activeNav === i
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
              style={activeNav === i ? { border: '1px solid rgba(99,102,241,0.3)' } : { border: '1px solid transparent' }}
            >
              <span>{tile.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tile.color}`}
                style={{ border: `1px solid` }}
              >
                {tile.count}
              </span>
            </button>
          ))}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* Order Pipeline Funnel */}
          <section
            className="rounded-xl p-5"
            style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">Order Pipeline</h2>
            <div className="flex flex-col gap-2 items-center">
              {FUNNEL_STAGES.map((stage, i) => (
                <div key={stage.label} className="w-full flex items-center gap-3">
                  <div className="w-[72px] shrink-0 text-right text-xs font-medium" style={{ color: '#94a3b8' }}>
                    {stage.label}
                  </div>
                  <div className="flex-1 flex items-center justify-center" style={{ maxWidth: '640px' }}>
                    <svg
                      width="100%"
                      height="38"
                      viewBox="0 0 640 38"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id={`funnel-grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={i === 0 ? '#0d9488' : i === 1 ? '#0891b2' : i === 2 ? '#7c3aed' : '#4f46e5'} stopOpacity="0.9" />
                          <stop offset="100%" stopColor={i === 0 ? '#14b8a6' : i === 1 ? '#22d3ee' : i === 2 ? '#a855f7' : '#818cf8'} stopOpacity="0.7" />
                        </linearGradient>
                      </defs>
                      {/* Trapezoid funnel shape */}
                      <polygon
                        points={`${(100 - stage.w) / 2 * 6.4},2 ${(100 - (100 - stage.w) / 2) * 6.4},2 ${(100 - (100 - FUNNEL_STAGES[Math.min(i + 1, 3)].w) / 2) * 6.4},36 ${(100 - FUNNEL_STAGES[Math.min(i + 1, 3)].w) / 2 * 6.4},36`}
                        fill={`url(#funnel-grad-${i})`}
                      />
                      <text x="320" y="24" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">
                        {stage.count}
                      </text>
                    </svg>
                  </div>
                  <div className="w-[64px] shrink-0 text-xs" style={{ color: stage.pct ? '#94a3b8' : 'transparent' }}>
                    {stage.pct && (
                      <span className="text-teal-400 font-medium">{stage.pct}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Orders Requiring Attention */}
          <section
            className="rounded-xl"
            style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              <h2 className="text-sm font-semibold text-zinc-100">Orders Requiring Attention</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                {ATTENTION_ROWS.length} issues
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.10)' }}>
                    {['Order #', 'Customer', 'Order Date', 'Amount', 'Issue', 'Action'].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left font-medium" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ATTENTION_ROWS.map((row, i) => (
                    <tr
                      key={row.order}
                      className="transition-colors hover:bg-white/[0.03]"
                      style={{ borderBottom: i < ATTENTION_ROWS.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}
                    >
                      <td className="px-5 py-3 font-mono text-indigo-300">{row.order}</td>
                      <td className="px-5 py-3 text-zinc-200">{row.customer}</td>
                      <td className="px-5 py-3" style={{ color: '#94a3b8' }}>{row.date}</td>
                      <td className="px-5 py-3 font-medium text-zinc-100">{row.amount}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${ISSUE_CHIP[row.issueType]}`}>
                          {row.issue}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                          {ACTION_LABEL[row.issueType]}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Sales by Rep — Horizontal Bar Chart */}
          <section
            className="rounded-xl p-5"
            style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">Sales by Rep — This Month</h2>
            <svg width="100%" height={REP_ROWS.length * 46 + 12} viewBox={`0 0 720 ${REP_ROWS.length * 46 + 12}`}>
              {REP_ROWS.map((rep, i) => {
                const barW = Math.round((rep.amount / MAX_BAR) * 420)
                const y = i * 46 + 6
                return (
                  <g key={rep.name}>
                    {/* Name label */}
                    <text x="0" y={y + 22} fill="#94a3b8" fontSize="12" fontWeight="500">{rep.name}</text>
                    {/* Bar background */}
                    <rect x="148" y={y + 8} width="420" height="22" rx="4" fill="rgba(99,102,241,0.08)" />
                    {/* Bar fill */}
                    <rect x="148" y={y + 8} width={barW} height="22" rx="4" fill="rgba(99,102,241,0.55)" />
                    {/* Highlight shimmer */}
                    <rect x="148" y={y + 8} width={barW} height="8" rx="4" fill="rgba(255,255,255,0.06)" />
                    {/* Amount label */}
                    <text x={148 + barW + 8} y={y + 22} fill="#e2e8f0" fontSize="12" fontWeight="600">{fmtK(rep.amount)}</text>
                  </g>
                )
              })}
            </svg>
          </section>

        </main>
      </div>
    </div>
  )
}
