'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── Types ──────────────────────────────────────────────────────────────────
interface ReportDef {
  name: string
  description: string
  lastRun: string
  scheduled: string
}

interface Category {
  name: string
  count: number
  reports: ReportDef[]
}

// ── Data ───────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    name: 'Sales Reports', count: 8,
    reports: [
      { name: 'Daily Sales Summary',  description: 'Total sales by register, cashier, tender',   lastRun: 'Today 10:30 AM', scheduled: 'Daily 11 PM' },
      { name: 'Hourly Sales',         description: 'Sales volume by hour for period',             lastRun: 'Yesterday',      scheduled: 'No' },
      { name: 'Sales by Product',     description: 'Top/bottom performers, qty and revenue',      lastRun: 'This week',      scheduled: 'Weekly Mon' },
      { name: 'Sales by Category',    description: 'Revenue breakdown by category',               lastRun: 'This week',      scheduled: 'Weekly Mon' },
      { name: 'Sales by Cashier',     description: 'Per-employee sales performance',              lastRun: 'Today',          scheduled: 'Daily' },
      { name: 'Sales by Register',    description: 'Per-register performance comparison',         lastRun: 'Today',          scheduled: 'Daily' },
      { name: 'Discount Analysis',    description: 'All discounts and overrides applied',         lastRun: 'This week',      scheduled: 'No' },
      { name: 'Transaction Detail',   description: 'Full transaction list with all fields',       lastRun: 'Today',          scheduled: 'No' },
    ],
  },
  {
    name: 'Cash & Drawer Reports', count: 4,
    reports: [
      { name: 'Drawer Count Summary',   description: 'Opening/closing counts per register',      lastRun: 'Today',          scheduled: 'Daily' },
      { name: 'Cash Drop Log',          description: 'All cash drop events with timestamps',      lastRun: 'Today',          scheduled: 'Daily' },
      { name: 'Over/Short Report',      description: 'Variance between expected and actual cash', lastRun: 'Today',          scheduled: 'Daily' },
      { name: 'Tender Reconciliation',  description: 'Tender totals vs expected by shift',        lastRun: 'Yesterday',      scheduled: 'Daily' },
    ],
  },
  {
    name: 'Inventory Reports', count: 3,
    reports: [
      { name: 'Stock On Hand',         description: 'Current inventory levels by item/location', lastRun: 'Today 09:00 AM', scheduled: 'Daily 6 AM' },
      { name: 'Low Stock Alert',        description: 'Items below reorder point',                 lastRun: 'Today 09:00 AM', scheduled: 'Daily 6 AM' },
      { name: 'Shrinkage Report',       description: 'Inventory loss analysis by period',         lastRun: 'Last week',      scheduled: 'Weekly Sun' },
    ],
  },
  {
    name: 'Employee Reports', count: 4,
    reports: [
      { name: 'Time & Attendance',     description: 'Clock-in/out log with hours summary',       lastRun: 'Yesterday',      scheduled: 'Weekly' },
      { name: 'Sales Performance',     description: 'Units sold and revenue per employee',        lastRun: 'Today',          scheduled: 'Daily' },
      { name: 'Cashier Exceptions',    description: 'Voids, overrides, and no-sales',            lastRun: 'Today',          scheduled: 'Daily' },
      { name: 'Commission Report',     description: 'Commission earned by employee',             lastRun: 'This week',      scheduled: 'Weekly' },
    ],
  },
  {
    name: 'Return Reports', count: 3,
    reports: [
      { name: 'Returns Summary',       description: 'Total returns by period, reason, item',     lastRun: 'Today',          scheduled: 'Daily' },
      { name: 'Return by Reason',      description: 'Return reasons breakdown',                   lastRun: 'This week',      scheduled: 'Weekly' },
      { name: 'Exchange Report',       description: 'Exchange transactions detail',               lastRun: 'This week',      scheduled: 'No' },
    ],
  },
  {
    name: 'Tax Reports', count: 2,
    reports: [
      { name: 'Sales Tax Summary',     description: 'Tax collected by jurisdiction',             lastRun: 'This month',     scheduled: 'Monthly' },
      { name: 'Tax Exempt Sales',      description: 'All exempt transactions with certificates', lastRun: 'This month',     scheduled: 'Monthly' },
    ],
  },
  {
    name: 'Customer Reports', count: 3,
    reports: [
      { name: 'Top Customers',         description: 'Highest spend customers by period',         lastRun: 'This week',      scheduled: 'Weekly Mon' },
      { name: 'New Customers',         description: 'First-time buyers in the period',           lastRun: 'This week',      scheduled: 'Weekly Mon' },
      { name: 'Customer Retention',    description: 'Repeat purchase rate and frequency',        lastRun: 'This month',     scheduled: 'Monthly' },
    ],
  },
]

const HOURLY_BARS = [
  { hour: '9AM',  sales: 842 },
  { hour: '10AM', sales: 1240 },
  { hour: '11AM', sales: 980 },
  { hour: '12PM', sales: 1480 },
  { hour: '1PM',  sales: 1120 },
  { hour: '2PM',  sales: 760 },
  { hour: '3PM',  sales: 940 },
  { hour: '4PM',  sales: 1320 },
  { hour: '5PM',  sales: 1580 },
  { hour: '6PM',  sales: 1200 },
  { hour: '7PM',  sales: 840 },
  { hour: '8PM',  sales: 720 },
  { hour: '9PM',  sales: 480 },
]

const REGISTERS = [
  { reg: 'Register 1', cashier: 'Sarah M.',  txn: 38, total: 2841.20 },
  { reg: 'Register 2', cashier: 'James C.',  txn: 31, total: 2204.80 },
  { reg: 'Register 3', cashier: 'Lisa P.',   txn: 34, total: 1984.61 },
  { reg: 'Register 4', cashier: 'Carlos R.', txn: 24, total: 1216.71 },
]

const TENDER_DATA = [
  { type: 'Cash',      amount: 2841.20, pct: 34 },
  { type: 'Card',      amount: 4892.41, pct: 59 },
  { type: 'Gift Card', amount: 513.71,  pct: 7  },
]

// ── Hourly SVG Bar Chart ───────────────────────────────────────────────────
function HourlyChart() {
  const maxVal = Math.max(...HOURLY_BARS.map(b => b.sales))
  const W = 600
  const H = 140
  const pad = { top: 10, bottom: 28, left: 8, right: 8 }
  const plotW = W - pad.left - pad.right
  const plotH = H - pad.top - pad.bottom
  const barW = Math.floor(plotW / HOURLY_BARS.length) - 4

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 160 }}>
      {HOURLY_BARS.map((b, i) => {
        const barH = Math.round((b.sales / maxVal) * plotH)
        const x = pad.left + i * (plotW / HOURLY_BARS.length) + 2
        const y = pad.top + plotH - barH
        return (
          <g key={b.hour}>
            <rect x={x} y={y} width={barW} height={barH} rx={2} fill="rgba(99,102,241,0.6)" />
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={8} fill="#94a3b8">{b.hour}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
export default function POSReportsPage() {
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Sales Reports')
  const [previewReport, setPreviewReport] = useState<ReportDef | null>(null)

  useEffect(() => {
    fetch('/api/pos/reports')
      .then(r => r.json())
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [])

  const currentCat = CATEGORIES.find(c => c.name === activeCategory) ?? CATEGORIES[0]

  const handleRun = (report: ReportDef) => setPreviewReport(report)

  const actions = (
    <>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">Run Report</button>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Schedule</button>
      <button className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Export All</button>
    </>
  )

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0d0e24' }}>
      <TopBar
        title="POS Reports"
        breadcrumb={[{ label: 'POS', href: '/pos' }, { label: 'Reports', href: '/pos/reports' }]}
        actions={actions}
      />

      <main className="flex-1 flex gap-0 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 flex flex-col overflow-y-auto" style={{ background: '#16213e', borderRight: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
            <p className="text-[11px] text-[#94a3b8] uppercase tracking-widest">Report Categories</p>
          </div>
          <nav className="flex-1 py-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors ${activeCategory === cat.name ? 'bg-indigo-600/20 text-indigo-300' : 'text-[#94a3b8] hover:bg-[rgba(99,102,241,0.05)] hover:text-[#e2e8f0]'}`}
                onClick={() => { setActiveCategory(cat.name); setPreviewReport(null) }}
              >
                <span>{cat.name}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.name ? 'bg-indigo-600/40 text-indigo-300' : 'bg-[rgba(99,102,241,0.1)] text-[#94a3b8]'}`}>{cat.count}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">

          {/* Report List */}
          <div className={`flex flex-col overflow-hidden ${previewReport ? 'w-[40%]' : 'flex-1'}`} style={{ borderRight: previewReport ? '1px solid rgba(99,102,241,0.15)' : undefined }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-[13px] font-medium text-[#e2e8f0]">{currentCat.name}</p>
              <p className="text-[11px] text-[#94a3b8]">{currentCat.count} reports</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-[#94a3b8] text-sm">Loading reports...</div>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                      {['Report Name', 'Description', 'Last Run', 'Scheduled', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-[#94a3b8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentCat.reports.map((r, idx) => (
                      <tr
                        key={r.name}
                        className={`hover:bg-[rgba(99,102,241,0.05)] transition-colors ${previewReport?.name === r.name ? 'bg-[rgba(99,102,241,0.08)]' : ''}`}
                        style={{ borderBottom: idx < currentCat.reports.length - 1 ? '1px solid rgba(99,102,241,0.08)' : undefined }}
                      >
                        <td className="px-5 py-3 text-[#e2e8f0] font-medium whitespace-nowrap">{r.name}</td>
                        <td className="px-5 py-3 text-[#94a3b8] text-[12px]">{r.description}</td>
                        <td className="px-5 py-3 text-[#94a3b8] text-[12px] whitespace-nowrap">{r.lastRun}</td>
                        <td className="px-5 py-3 text-[12px] whitespace-nowrap">
                          <span className={r.scheduled === 'No' ? 'text-[#94a3b8]' : 'text-indigo-400'}>{r.scheduled}</span>
                        </td>
                        <td className="px-5 py-3">
                          <button className="px-3 py-1 rounded-md text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors whitespace-nowrap" onClick={() => handleRun(r)}>
                            Run
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Report Preview Panel */}
          {previewReport && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Preview Header */}
              <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                <div>
                  <p className="text-[13px] font-medium text-[#e2e8f0]">{previewReport.name}</p>
                  <p className="text-[11px] text-[#94a3b8]">April 22, 2026</p>
                </div>
                <button className="text-[#94a3b8] hover:text-[#e2e8f0] text-lg leading-none" onClick={() => setPreviewReport(null)}>x</button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Report Meta */}
                <div className="text-[12px] text-[#94a3b8] space-y-0.5">
                  <div><span className="text-[#e2e8f0]">Store:</span> Main Street Store #001</div>
                  <div><span className="text-[#e2e8f0]">Date:</span> April 22, 2026</div>
                  <div><span className="text-[#e2e8f0]">Generated By:</span> System</div>
                  <div><span className="text-[#e2e8f0]">Time:</span> 10:45 AM</div>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Sales',   value: '$8,247.32', color: 'text-emerald-400' },
                    { label: 'Transactions',  value: '127',       color: 'text-blue-400' },
                    { label: 'Avg Ticket',    value: '$64.94',    color: 'text-indigo-400' },
                    { label: 'Returns',       value: '$124.48',   color: 'text-orange-400' },
                  ].map(k => (
                    <div key={k.label} className="rounded-md p-3" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <p className="text-[11px] text-[#94a3b8] mb-1">{k.label}</p>
                      <p className={`text-lg font-semibold tabular-nums ${k.color}`}>{k.value}</p>
                    </div>
                  ))}
                </div>

                {/* Sales by Register */}
                <div>
                  <p className="text-[11px] text-[#94a3b8] uppercase tracking-widest mb-2">Sales by Register</p>
                  <div className="rounded-md overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)', background: '#16213e' }}>
                          {['Register', 'Cashier', 'Transactions', 'Total'].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-[11px] font-medium text-[#94a3b8]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {REGISTERS.map((r, i) => (
                          <tr key={r.reg} style={{ borderBottom: i < REGISTERS.length - 1 ? '1px solid rgba(99,102,241,0.08)' : undefined }}>
                            <td className="px-3 py-2 text-[#e2e8f0]">{r.reg}</td>
                            <td className="px-3 py-2 text-[#94a3b8]">{r.cashier}</td>
                            <td className="px-3 py-2 text-[#94a3b8] tabular-nums">{r.txn}</td>
                            <td className="px-3 py-2 text-emerald-400 font-medium tabular-nums">${r.total.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr style={{ background: 'rgba(99,102,241,0.05)', borderTop: '1px solid rgba(99,102,241,0.15)' }}>
                          <td className="px-3 py-2 font-medium text-[#e2e8f0]" colSpan={2}>Total</td>
                          <td className="px-3 py-2 font-medium text-[#e2e8f0] tabular-nums">{REGISTERS.reduce((a, r) => a + r.txn, 0)}</td>
                          <td className="px-3 py-2 font-semibold text-emerald-400 tabular-nums">${REGISTERS.reduce((a, r) => a + r.total, 0).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sales by Tender */}
                <div>
                  <p className="text-[11px] text-[#94a3b8] uppercase tracking-widest mb-2">Sales by Tender</p>
                  <div className="space-y-2">
                    {TENDER_DATA.map(t => (
                      <div key={t.type} className="flex items-center gap-3">
                        <span className="w-20 text-[12px] text-[#94a3b8]">{t.type}</span>
                        <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                          <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${t.pct}%` }} />
                        </div>
                        <span className="w-16 text-right text-[12px] text-emerald-400 font-medium tabular-nums">${t.amount.toFixed(2)}</span>
                        <span className="w-8 text-right text-[11px] text-[#94a3b8]">{t.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hourly Chart */}
                <div>
                  <p className="text-[11px] text-[#94a3b8] uppercase tracking-widest mb-2">Hourly Sales Trend</p>
                  <div className="rounded-md p-3" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <HourlyChart />
                  </div>
                </div>
              </div>

              {/* Export Bar */}
              <div className="flex items-center gap-2 px-6 py-3" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
                <button className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Export CSV</button>
                <button className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Export Excel</button>
                <button className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Print</button>
                <button className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-[#16213e] hover:bg-[#1e2d4a] text-[#e2e8f0] border border-[rgba(99,102,241,0.3)] transition-colors">Email Report</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
