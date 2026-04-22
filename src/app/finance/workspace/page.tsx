export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp, DollarSign, BarChart3, FileText,
  Clock, AlertTriangle, CheckCircle, ArrowRight, BookOpen, Globe, Building2
} from 'lucide-react'

function StatCard({ label, value, sub, color = 'text-zinc-100', href }: {
  label: string; value: string; sub?: string; color?: string; href?: string
}) {
  const inner = (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 hover:border-zinc-600/70 transition-colors">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-[22px] font-bold tabular-nums leading-none ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 mt-1.5">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function QuickLink({ href, label, icon: Icon, desc }: { href: string; label: string; icon: React.ElementType; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 hover:border-zinc-600/70 transition-colors group">
      <div className="w-9 h-9 bg-blue-600/15 border border-blue-600/20 rounded-md flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">{label}</p>
        <p className="text-[11px] text-zinc-500">{desc}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
    </Link>
  )
}

export default async function FinancialWorkspacePage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    openPeriods,
    draftJournals,
    postedJournalsThisMonth,
    arOpenCount,
    arOpenAmount,
    apOpenCount,
    apOpenAmount,
    bankAccounts,
    currencies,
    trialBalanceCount,
    recentJournals,
  ] = await Promise.all([
    prisma.fiscalPeriod.count({ where: { status: 'open' } }),
    prisma.gLJournal.count({ where: { status: 'draft' } }),
    prisma.gLJournal.count({ where: { status: 'posted', createdAt: { gte: monthStart } } }),
    prisma.customerInvoice.count({ where: { status: { notIn: ['paid', 'cancelled', 'voided'] } } }),
    prisma.customerInvoice.aggregate({ where: { status: { notIn: ['paid', 'cancelled', 'voided'] } }, _sum: { totalAmount: true } }),
    prisma.vendorInvoice.count({ where: { status: { notIn: ['paid', 'cancelled', 'voided'] } } }),
    prisma.vendorInvoice.aggregate({ where: { status: { notIn: ['paid', 'cancelled', 'voided'] } }, _sum: { totalAmount: true } }),
    prisma.bankAccount.findMany({
      select: { id: true, bankName: true, accountCode: true, currency: true, currentBalance: true },
      take: 6,
      orderBy: { currentBalance: 'desc' },
    }),
    prisma.currency.findMany({
      where: { isActive: true },
      select: { code: true, name: true, isBase: true },
      orderBy: [{ isBase: 'desc' }, { code: 'asc' }],
    }),
    prisma.gLTrialBalance.count(),
    prisma.gLJournal.findMany({
      where: { createdAt: { gte: monthStart } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        journalNumber: true,
        description: true,
        status: true,
        createdAt: true,
        _count: { select: { entries: true } },
      },
    }),
  ])

  const totalBankBalance = bankAccounts.reduce((s, b) => s + (b.currentBalance ?? 0), 0)
  const arAging = arOpenAmount._sum.totalAmount ?? 0
  const apAging = apOpenAmount._sum.totalAmount ?? 0

  const alerts: { level: 'warn' | 'ok'; msg: string; href: string }[] = []
  if (draftJournals > 0) alerts.push({ level: 'warn', msg: `${draftJournals} journal(s) awaiting posting`, href: '/finance/gl' })
  if (openPeriods === 0) alerts.push({ level: 'warn', msg: 'No open fiscal periods', href: '/finance/fiscal-years' })
  if (arAging > 50000) alerts.push({ level: 'warn', msg: `${formatCurrency(arAging)} open AR — review aging`, href: '/finance/ar-aging' })
  if (apAging > 50000) alerts.push({ level: 'warn', msg: `${formatCurrency(apAging)} open AP — review aging`, href: '/finance/ap-aging' })
  if (alerts.length === 0) alerts.push({ level: 'ok', msg: 'All finance checks passed', href: '#' })

  const statusCls = (s: string) => {
    if (s === 'posted') return 'bg-emerald-500/15 text-emerald-400'
    if (s === 'reversed') return 'bg-zinc-700/50 text-zinc-400'
    return 'bg-amber-500/15 text-amber-400'
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Financial Workspace" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">Finance Command Center</h2>
            <p className="text-[13px] text-zinc-500">
              {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}{openPeriods} open period{openPeriods !== 1 ? 's' : ''} · {currencies.length} currencies
            </p>
          </div>
        </div>

        {/* Alerts bar */}
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Link key={i} href={a.href} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-[12px] transition-colors ${
              a.level === 'warn'
                ? 'bg-amber-900/10 border-amber-800/40 text-amber-300 hover:bg-amber-900/20'
                : 'bg-emerald-900/10 border-emerald-800/30 text-emerald-400'
            }`}>
              {a.level === 'warn'
                ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                : <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
              {a.msg}
              {a.href !== '#' && <ArrowRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Bank Balance"
            value={formatCurrency(totalBankBalance)}
            sub={`${bankAccounts.length} accounts`}
            color="text-blue-400"
            href="/finance/bank-accounts"
          />
          <StatCard
            label="Open AR"
            value={formatCurrency(arAging)}
            sub={`${arOpenCount} invoices`}
            color="text-emerald-400"
            href="/finance/ar-aging"
          />
          <StatCard
            label="Open AP"
            value={formatCurrency(apAging)}
            sub={`${apOpenCount} invoices`}
            color="text-red-400"
            href="/finance/ap-aging"
          />
          <StatCard
            label="Net Working Capital"
            value={formatCurrency(arAging - apAging)}
            sub="AR minus AP"
            color={arAging - apAging >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </div>

        {/* Second KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Draft Journals"
            value={String(draftJournals)}
            sub="Pending posting"
            color={draftJournals > 0 ? 'text-amber-400' : 'text-zinc-100'}
            href="/finance/gl"
          />
          <StatCard
            label="Posted This Month"
            value={String(postedJournalsThisMonth)}
            sub="GL journals"
            color="text-zinc-100"
            href="/finance/journal-entries"
          />
          <StatCard
            label="Trial Balance Entries"
            value={String(trialBalanceCount)}
            sub="Ledger records"
            href="/finance/gl"
          />
          <StatCard
            label="Open Fiscal Periods"
            value={String(openPeriods)}
            sub="Active periods"
            href="/finance/fiscal-years"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Bank Accounts mini list */}
          <div className="col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-zinc-300">Bank Accounts</p>
              <Link href="/finance/bank-accounts" className="text-[11px] text-blue-400 hover:text-blue-300">View all</Link>
            </div>
            <div className="space-y-2">
              {bankAccounts.length === 0 && (
                <p className="text-[12px] text-zinc-600">No bank accounts configured.</p>
              )}
              {bankAccounts.map(b => (
                <div key={b.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-medium text-zinc-200">{b.bankName}</p>
                    <p className="text-[11px] text-zinc-500">{b.accountCode} · {b.currency}</p>
                  </div>
                  <p className={`text-[13px] font-bold font-mono tabular-nums ${(b.currentBalance ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(b.currentBalance ?? 0)}
                  </p>
                </div>
              ))}
            </div>

            {/* Currencies mini */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-[13px] font-semibold text-zinc-300">Active Currencies</p>
              <Link href="/finance/currency" className="text-[11px] text-blue-400 hover:text-blue-300">Manage</Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currencies.length === 0 && <p className="text-[12px] text-zinc-600">No currencies configured.</p>}
              {currencies.map(c => (
                <span key={c.code} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                  c.isBase
                    ? 'bg-blue-600/15 border-blue-600/30 text-blue-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}>
                  {c.code}
                  {c.isBase && <span className="text-[9px] font-sans normal-case text-blue-400">base</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Journals */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-zinc-300">Recent Journal Activity</p>
              <Link href="/finance/journal-entries" className="text-[11px] text-blue-400 hover:text-blue-300">View all</Link>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase">Journal #</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase">Description</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase">Lines</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase">Status</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {recentJournals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No journal activity this month.</td>
                    </tr>
                  )}
                  {recentJournals.map(j => (
                    <tr key={j.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href="/finance/journal-entries" className="font-mono text-[11px] text-blue-400 hover:text-blue-300">
                          {j.journalNumber ? j.journalNumber.slice(0, 12) : j.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 truncate max-w-[200px]">{j.description ?? '—'}</td>
                      <td className="px-4 py-2.5 text-right text-zinc-400">{j._count.entries}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${statusCls(j.status)}`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500">
                        {new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-[13px] font-semibold text-zinc-300 mb-3">Finance Modules</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <QuickLink href="/finance/gl" label="General Ledger" icon={BookOpen} desc="Journals, COA, trial balance" />
            <QuickLink href="/finance/journal-entries" label="Journal Entries" icon={FileText} desc="Post & review GL entries" />
            <QuickLink href="/finance/balance-sheet" label="Balance Sheet" icon={BarChart3} desc="Assets, liabilities, equity" />
            <QuickLink href="/finance/pl-statement" label="P&L Statement" icon={TrendingUp} desc="Revenue vs expenses" />
            <QuickLink href="/finance/cash-flow" label="Cash Flow" icon={DollarSign} desc="13-week cash forecast" />
            <QuickLink href="/finance/currency-revaluation" label="FX Revaluation" icon={Globe} desc="Currency revalue & exposure" />
            <QuickLink href="/finance/consolidation" label="Consolidation" icon={Building2} desc="Multi-entity roll-up" />
            <QuickLink href="/finance/intercompany" label="Intercompany" icon={ArrowRight} desc="IC transactions & settlements" />
            <QuickLink href="/finance/ar-aging" label="AR Aging" icon={Clock} desc="Receivables by age bucket" />
            <QuickLink href="/finance/ap-aging" label="AP Aging" icon={Clock} desc="Payables by age bucket" />
            <QuickLink href="/finance/reports" label="Report Templates" icon={FileText} desc="Custom financial reports" />
            <QuickLink href="/finance/fiscal-years" label="Fiscal Years" icon={BarChart3} desc="Periods & year-end close" />
          </div>
        </div>
      </main>
    </div>
  )
}
