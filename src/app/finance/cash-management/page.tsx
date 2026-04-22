'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import {
  Landmark, CreditCard, RefreshCw, FileText, ArrowDownCircle,
  Send, AlertCircle, TrendingUp, TrendingDown, DollarSign,
  CheckCircle, Clock, XCircle, ChevronRight, Download, Upload,
  BookOpen, List, Printer, Users
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface BankAccount {
  id: string
  code: string
  name: string
  currency: string
  currentBalance: number
  lastReconciled: string
  outstanding: number
  available: number
}

interface BankTransaction {
  id: string
  date: string
  type: string
  description: string
  amount: number
  bankAccount: string
  status: 'Posted' | 'Pending' | 'Voided'
}

interface CashSummary {
  bankAccountsTotal: number
  activeBankAccounts: number
  outstandingPayments: number
  outstandingDeposits: number
  statementsToReconcile: number
  reconciledLast7Days: number
  unprocessedVendorPayments: number
  electronicPaymentsToSend: number
  paymentsRequiringAttention: number
  cashPositionToday: number
  forecastedCash30Days: number
}

// ─── Static data (mirrors API defaults) ──────────────────────────────────────
const STATIC_ACCOUNTS: BankAccount[] = [
  { id: '1', code: 'CHECKING-USD', name: 'Primary Checking', currency: 'USD', currentBalance: 485230.50, lastReconciled: '2026-04-15', outstanding: 12400.00, available: 472830.50 },
  { id: '2', code: 'SAVINGS-USD',  name: 'Operating Savings', currency: 'USD', currentBalance: 312750.00, lastReconciled: '2026-04-10', outstanding: 0, available: 312750.00 },
  { id: '3', code: 'PAYROLL-USD',  name: 'Payroll Account', currency: 'USD', currentBalance: 98400.00, lastReconciled: '2026-04-18', outstanding: 4200.00, available: 94200.00 },
  { id: '4', code: 'OPERATING-EUR', name: 'EU Operations', currency: 'EUR', currentBalance: 187600.00, lastReconciled: '2026-04-12', outstanding: 9800.00, available: 177800.00 },
  { id: '5', code: 'RESERVES-USD', name: 'Capital Reserves', currency: 'USD', currentBalance: 116019.50, lastReconciled: '2026-04-01', outstanding: 0, available: 116019.50 },
]

const STATIC_TRANSACTIONS: BankTransaction[] = [
  { id: 't1',  date: '2026-04-22', type: 'ACH',     description: 'Vendor Payment – Acme Supply Co.', amount: -14250.00, bankAccount: 'CHECKING-USD', status: 'Posted' },
  { id: 't2',  date: '2026-04-22', type: 'Deposit',  description: 'Customer Receipt – INV-2841', amount: 32100.00, bankAccount: 'CHECKING-USD', status: 'Posted' },
  { id: 't3',  date: '2026-04-21', type: 'Wire',     description: 'Outbound Wire – EU Supplier', amount: -55000.00, bankAccount: 'OPERATING-EUR', status: 'Posted' },
  { id: 't4',  date: '2026-04-21', type: 'EFT',      description: 'Payroll Run – Period 8', amount: -87600.00, bankAccount: 'PAYROLL-USD', status: 'Posted' },
  { id: 't5',  date: '2026-04-20', type: 'Check',    description: 'Check #4421 – Rent Payment', amount: -12500.00, bankAccount: 'CHECKING-USD', status: 'Posted' },
  { id: 't6',  date: '2026-04-20', type: 'ACH',      description: 'Customer Payment – PO-1142', amount: 18900.00, bankAccount: 'CHECKING-USD', status: 'Pending' },
  { id: 't7',  date: '2026-04-19', type: 'Deposit',  description: 'Cash Deposit – Store #12', amount: 4820.00, bankAccount: 'CHECKING-USD', status: 'Posted' },
  { id: 't8',  date: '2026-04-19', type: 'EFT',      description: 'Utilities – April Invoice', amount: -3240.00, bankAccount: 'CHECKING-USD', status: 'Posted' },
  { id: 't9',  date: '2026-04-18', type: 'Wire',     description: 'Wire – Capital Reserves Transfer', amount: 50000.00, bankAccount: 'RESERVES-USD', status: 'Pending' },
  { id: 't10', date: '2026-04-17', type: 'Check',    description: 'Check #4398 – Voided Duplicate', amount: -8750.00, bankAccount: 'CHECKING-USD', status: 'Voided' },
]

const STATIC_SUMMARY: CashSummary = {
  bankAccountsTotal: 5,
  activeBankAccounts: 4,
  outstandingPayments: 12,
  outstandingDeposits: 3,
  statementsToReconcile: 7,
  reconciledLast7Days: 2,
  unprocessedVendorPayments: 2,
  electronicPaymentsToSend: 1,
  paymentsRequiringAttention: 0,
  cashPositionToday: 1200000,
  forecastedCash30Days: 890000,
}

// ─── SVG Forecast Chart ───────────────────────────────────────────────────────
function ForecastChart() {
  // 7-day data points: today (index 3) is the boundary between actual and forecast
  const points = [
    { day: 'Apr 16', val: 1380000, forecast: false },
    { day: 'Apr 17', val: 1310000, forecast: false },
    { day: 'Apr 18', val: 1290000, forecast: false },
    { day: 'Apr 19', val: 1250000, forecast: false },
    { day: 'Apr 20', val: 1210000, forecast: false },
    { day: 'Apr 21', val: 1200000, forecast: false },
    { day: 'Apr 22', val: 1200000, forecast: true },
    { day: 'Apr 23', val: 1140000, forecast: true },
    { day: 'Apr 24', val: 1080000, forecast: true },
    { day: 'Apr 25', val: 1020000, forecast: true },
    { day: 'Apr 26', val: 960000,  forecast: true },
    { day: 'Apr 27', val: 920000,  forecast: true },
    { day: 'Apr 28', val: 890000,  forecast: true },
  ]

  const W = 520, H = 110
  const PAD_L = 10, PAD_R = 10, PAD_T = 10, PAD_B = 24
  const minV = 800000, maxV = 1450000
  const toX = (i: number) => PAD_L + (i / (points.length - 1)) * (W - PAD_L - PAD_R)
  const toY = (v: number) => PAD_T + (1 - (v - minV) / (maxV - minV)) * (H - PAD_T - PAD_B)

  const actualPts = points.filter(p => !p.forecast)
  const allPts = points

  // Build path strings
  const linePath = (pts: typeof points) =>
    pts.map((p, i) => {
      const idx = points.indexOf(p)
      return `${i === 0 ? 'M' : 'L'}${toX(idx).toFixed(1)},${toY(p.val).toFixed(1)}`
    }).join(' ')

  const areaPath = (pts: typeof points) => {
    const first = points.indexOf(pts[0])
    const last = points.indexOf(pts[pts.length - 1])
    const line = pts.map((p, i) => {
      const idx = points.indexOf(p)
      return `${i === 0 ? 'M' : 'L'}${toX(idx).toFixed(1)},${toY(p.val).toFixed(1)}`
    }).join(' ')
    return `${line} L${toX(last).toFixed(1)},${(H - PAD_B).toFixed(1)} L${toX(first).toFixed(1)},${(H - PAD_B).toFixed(1)} Z`
  }

  const forecastPts = [actualPts[actualPts.length - 1], ...points.filter(p => p.forecast)]
  const todayX = toX(actualPts.length - 1)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: 110 }}>
      <defs>
        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Forecast area */}
      <path d={areaPath(forecastPts)} fill="url(#forecastGrad)" />
      {/* Actual area */}
      <path d={areaPath(actualPts)} fill="url(#actualGrad)" />

      {/* Today vertical line */}
      <line x1={todayX} y1={PAD_T} x2={todayX} y2={H - PAD_B} stroke="rgba(99,102,241,0.5)" strokeWidth="1" strokeDasharray="3,3" />

      {/* Forecast line */}
      <path d={linePath(forecastPts)} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4,3" />
      {/* Actual line */}
      <path d={linePath(actualPts)} fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />

      {/* Day labels */}
      {points.filter((_, i) => i % 2 === 0).map(p => {
        const idx = points.indexOf(p)
        return (
          <text key={p.day} x={toX(idx)} y={H - 4} textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.5)">{p.day}</text>
        )
      })}

      {/* Today label */}
      <text x={todayX} y={PAD_T + 6} textAnchor="middle" fontSize="7" fill="rgba(99,102,241,0.8)">Today</text>
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}
function fmtFull(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)
}
function fmtK(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

const STATUS_CHIP: Record<string, string> = {
  Posted:  'bg-emerald-500/15 text-emerald-400',
  Pending: 'bg-amber-500/15 text-amber-400',
  Voided:  'bg-red-500/15 text-red-400',
}

// ─── Tile component ───────────────────────────────────────────────────────────
function Tile({
  label, value, accent, href, large, currency,
}: {
  label: string
  value: number | string
  accent?: 'blue' | 'orange' | 'green' | 'teal' | 'gray'
  href?: string
  large?: boolean
  currency?: string
}) {
  const accentMap: Record<string, string> = {
    blue:   'text-blue-400',
    orange: 'text-orange-400',
    green:  'text-emerald-400',
    teal:   'text-teal-400',
    gray:   'text-zinc-500',
  }
  const displayVal = typeof value === 'number'
    ? (currency ? fmtK(value) : value.toLocaleString())
    : value
  const valClass = `font-bold tabular-nums ${large ? 'text-xl' : 'text-2xl'} ${accent ? accentMap[accent] : 'text-zinc-100'}`

  const inner = (
    <div className="flex flex-col gap-0.5">
      <span className={valClass}>{displayVal}</span>
      <span className="text-[11px] text-zinc-500 leading-tight">{label}</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block px-3 py-2.5 rounded hover:bg-zinc-800/60 transition-colors group cursor-pointer">
        {inner}
        <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 mt-0.5 transition-colors" />
      </Link>
    )
  }
  return <div className="px-3 py-2.5">{inner}</div>
}

function TileGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/60">{title}</div>
      <div className="divide-y divide-zinc-800/40">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CashManagementPage() {
  const [summary] = useState<CashSummary>(STATIC_SUMMARY)
  const [accounts] = useState<BankAccount[]>(STATIC_ACCOUNTS)
  const [transactions] = useState<BankTransaction[]>(STATIC_TRANSACTIONS)

  const actions = (
    <div className="flex items-center gap-1.5">
      <Link href="/finance/journals/payment"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors">
        <Send className="w-3.5 h-3.5" /> New Payment Journal
      </Link>
      <Link href="/finance/journals/cash-receipts"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <ArrowDownCircle className="w-3.5 h-3.5" /> New Cash Receipt Journal
      </Link>
      <Link href="/finance/bank-reconciliation"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <RefreshCw className="w-3.5 h-3.5" /> Reconcile
      </Link>
    </div>
  )

  return (
    <>
      <TopBar
        title="Cash and Bank Management"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">

        {/* ── Left Summary Tiles Panel ── */}
        <aside className="w-64 shrink-0 border-r border-zinc-800/50 bg-[#0d0e1f] overflow-y-auto">
          <div className="space-y-0">

            <TileGroup title="Bank Accounts">
              <Tile label="Bank accounts" value={summary.bankAccountsTotal} href="/finance/bank-accounts" />
              <Tile label="Active bank accounts" value={summary.activeBankAccounts} accent="green" />
            </TileGroup>

            <TileGroup title="Bank Reconciliation">
              <Tile label="Outstanding payments" value={summary.outstandingPayments} accent="blue" />
              <Tile label="Outstanding deposits" value={summary.outstandingDeposits} />
              <Tile
                label="Statements to reconcile"
                value={summary.statementsToReconcile}
                accent={summary.statementsToReconcile > 0 ? 'orange' : undefined}
              />
              <Tile label="Reconciled last 7 days" value={summary.reconciledLast7Days} accent="green" />
            </TileGroup>

            <TileGroup title="Electronic Payments">
              <Tile label="Unprocessed vendor payments" value={summary.unprocessedVendorPayments} accent="blue" />
              <Tile label="Electronic payments to send" value={summary.electronicPaymentsToSend} />
              <Tile
                label="Payments requiring attention"
                value={summary.paymentsRequiringAttention}
                accent={summary.paymentsRequiringAttention === 0 ? 'gray' : 'orange'}
              />
            </TileGroup>

            <TileGroup title="Cash Forecasting">
              <Tile label="Cash position today" value={summary.cashPositionToday} currency="USD" accent="teal" large />
              <Tile label="Forecasted cash (30 days)" value={summary.forecastedCash30Days} currency="USD" large />
            </TileGroup>

          </div>
        </aside>

        {/* ── Right Main Content ── */}
        <main className="flex-1 p-5 space-y-5 overflow-auto">

          {/* Bank Balances Table */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[13px] font-semibold text-zinc-200">Bank Account Balances</h2>
              <Link href="/finance/bank-accounts" className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-[#13142a] border border-zinc-800/50 rounded-lg overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/30">
                    {['Bank Account', 'Currency', 'Current Balance', 'Last Reconciled', 'Outstanding', 'Available'].map(h => (
                      <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${h === 'Bank Account' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acct, idx) => (
                    <tr key={acct.id} className={`hover:bg-[rgba(99,102,241,0.05)] transition-colors ${idx < accounts.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-zinc-200">{acct.code}</div>
                        <div className="text-[11px] text-zinc-500">{acct.name}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-700/60 text-zinc-300">{acct.currency}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-100">
                        {fmtFull(acct.currentBalance, acct.currency)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-zinc-400">{acct.lastReconciled}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-amber-400">
                        {acct.outstanding > 0 ? fmtFull(acct.outstanding, acct.currency) : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400 font-semibold">
                        {fmtFull(acct.available, acct.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-800/80 bg-zinc-900/20">
                    <td className="px-4 py-2.5 text-[11px] font-semibold text-zinc-400" colSpan={2}>Total (USD equivalent)</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-teal-400">
                      {fmtFull(accounts.reduce((s, a) => s + a.currentBalance, 0))}
                    </td>
                    <td />
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-amber-400">
                      {fmtFull(accounts.reduce((s, a) => s + a.outstanding, 0))}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-400">
                      {fmtFull(accounts.reduce((s, a) => s + a.available, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Recent Transactions + Forecast Chart row */}
          <div className="grid grid-cols-[1fr_340px] gap-5">

            {/* Recent Bank Transactions */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[13px] font-semibold text-zinc-200">Recent Bank Transactions</h2>
                <span className="text-[11px] text-zinc-500">{transactions.length} transactions</span>
              </div>
              <div className="bg-[#13142a] border border-zinc-800/50 rounded-lg overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/30">
                      {['Date', 'Type', 'Description', 'Amount', 'Bank Account', 'Status'].map(h => (
                        <th key={h} className={`px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr key={tx.id} className={`hover:bg-[rgba(99,102,241,0.04)] transition-colors ${idx < transactions.length - 1 ? 'border-b border-zinc-800/30' : ''}`}>
                        <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{tx.date}</td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-700/50 text-zinc-300">{tx.type}</span>
                        </td>
                        <td className="px-3 py-2 text-zinc-300 max-w-[200px] truncate">{tx.description}</td>
                        <td className={`px-3 py-2 text-right tabular-nums font-medium ${tx.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {tx.amount < 0 ? '-' : '+'}{fmtFull(Math.abs(tx.amount))}
                        </td>
                        <td className="px-3 py-2 text-zinc-500 font-mono text-[11px]">{tx.bankAccount}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_CHIP[tx.status]}`}>
                            {tx.status === 'Posted'  && <CheckCircle className="w-2.5 h-2.5" />}
                            {tx.status === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                            {tx.status === 'Voided'  && <XCircle className="w-2.5 h-2.5" />}
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Cash Forecast Chart */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[13px] font-semibold text-zinc-200">Cash Forecast</h2>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-teal-400 rounded" /> Actual</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-indigo-400 rounded border-t border-dashed border-indigo-400" /> Forecast</span>
                </div>
              </div>
              <div className="bg-[#13142a] border border-zinc-800/50 rounded-lg p-4">
                <div className="flex gap-4 mb-3">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Today</div>
                    <div className="text-lg font-bold text-teal-400">{fmtK(summary.cashPositionToday)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">30-Day Forecast</div>
                    <div className="text-lg font-bold text-indigo-400">{fmtK(summary.forecastedCash30Days)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Delta</div>
                    <div className="text-lg font-bold text-red-400 flex items-center gap-0.5">
                      <TrendingDown className="w-4 h-4" />
                      {fmtK(summary.cashPositionToday - summary.forecastedCash30Days)}
                    </div>
                  </div>
                </div>
                <ForecastChart />
              </div>

              {/* Quick Links */}
              <div className="mt-5">
                <h2 className="text-[13px] font-semibold text-zinc-200 mb-2.5">Quick Links</h2>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Payment Journal',        href: '/finance/journals/payment',       icon: CreditCard },
                    { label: 'Cash Receipt Journal',   href: '/finance/journals/cash-receipts', icon: ArrowDownCircle },
                    { label: 'Bank Reconciliation',    href: '/finance/bank-reconciliation',    icon: RefreshCw },
                    { label: 'Statement Import',       href: '/finance/bank-accounts',          icon: Upload },
                    { label: 'Positive Pay Export',    href: '/finance/bank-accounts',          icon: Download },
                    { label: 'Check Register',         href: '/finance/journals/payment',       icon: BookOpen },
                    { label: 'Vendor Payments',        href: '/finance/vendor-payments',        icon: Users },
                    { label: 'Customer Payments',      href: '/ar',                             icon: FileText },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link key={label} href={href}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 hover:bg-[rgba(99,102,241,0.1)] border border-zinc-800/50 hover:border-indigo-500/30 rounded text-[11px] text-zinc-400 hover:text-zinc-200 transition-all group">
                      <Icon className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </>
  )
}
