import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowRight } from 'lucide-react'

function statusCls(status: string): string {
  if (status === 'posted') return 'bg-blue-500/10 text-blue-400'
  if (status === 'reversed') return 'bg-zinc-700/40 text-zinc-500'
  return 'bg-zinc-700/60 text-zinc-400'
}

export default async function FinanceSummaryPage() {
  const currentYear = new Date().getFullYear()
  const currentFY = `FY${currentYear}`

  const [accounts, recentEntries, activeBudgetPlan] = await Promise.all([
    prisma.account.findMany({
      orderBy: { code: 'asc' },
    }),
    prisma.journalEntry.findMany({
      include: {
        lines: {
          include: { account: { select: { code: true, name: true, type: true } } },
        },
      },
      orderBy: { date: 'desc' },
      take: 10,
    }),
    prisma.budgetPlan.findFirst({
      where: { fiscalYear: currentFY, status: 'active' },
      include: { entries: { select: { accountId: true, budgetAmount: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Group accounts by type
  const grouped = accounts.reduce<Record<string, typeof accounts>>((acc, a) => {
    if (!acc[a.type]) acc[a.type] = []
    acc[a.type].push(a)
    return acc
  }, {})

  // P&L computation from account balances
  const revenueAccounts = grouped['revenue'] ?? []
  const expenseAccounts = grouped['expense'] ?? []
  const assetAccounts   = grouped['asset']   ?? []
  const liabilityAccts  = grouped['liability'] ?? []
  const equityAccounts  = grouped['equity']   ?? []

  const totalRevenue  = revenueAccounts.reduce((s, a) => s + (a.balance ?? 0), 0)
  // For expenses, balance is typically a debit balance (positive = money spent)
  const totalExpenses = expenseAccounts.reduce((s, a) => s + Math.abs(a.balance ?? 0), 0)
  const netIncome     = totalRevenue - totalExpenses

  const totalAssets      = assetAccounts.reduce((s, a) => s + (a.balance ?? 0), 0)
  const totalLiabilities = liabilityAccts.reduce((s, a) => s + (a.balance ?? 0), 0)
  const totalEquity      = equityAccounts.reduce((s, a) => s + (a.balance ?? 0), 0)

  // Budget variance summary
  const budgetByAccountId = new Map<string, number>()
  if (activeBudgetPlan) {
    for (const entry of activeBudgetPlan.entries) {
      budgetByAccountId.set(
        entry.accountId,
        (budgetByAccountId.get(entry.accountId) ?? 0) + Number(entry.budgetAmount)
      )
    }
  }

  const totalBudgeted = Array.from(budgetByAccountId.values()).reduce((s, v) => s + v, 0)
  const totalActualSpend = totalExpenses
  const budgetVariance = totalBudgeted - totalActualSpend

  const TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
  type AccountType = typeof TYPE_ORDER[number]

  const TYPE_LABELS: Record<AccountType, string> = {
    asset: 'Assets', liability: 'Liabilities', equity: 'Equity',
    revenue: 'Revenue', expense: 'Expenses',
  }
  const TYPE_COLORS: Record<AccountType, string> = {
    asset: 'text-blue-400', liability: 'text-rose-400', equity: 'text-violet-400',
    revenue: 'text-emerald-400', expense: 'text-amber-400',
  }
  const TYPE_DOT: Record<AccountType, string> = {
    asset: 'bg-blue-500', liability: 'bg-rose-500', equity: 'bg-violet-500',
    revenue: 'bg-emerald-500', expense: 'bg-amber-500',
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Financial Summary" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Page Header */}
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Financial Summary</h2>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            {currentFY} · {accounts.length} GL accounts · {recentEntries.length} recent journal entries
          </p>
        </div>

        {/* P&L Summary */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            Period P&amp;L (from GL Balances)
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Revenue</div>
              </div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-zinc-500 mt-1">{revenueAccounts.length} revenue accounts</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Expenses</div>
              </div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">{formatCurrency(totalExpenses)}</div>
              <div className="text-xs text-zinc-500 mt-1">{expenseAccounts.length} expense accounts</div>
            </div>
            <div className={`bg-[#16213e] border rounded-lg p-5 ${netIncome >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className={`w-3.5 h-3.5 ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Income</div>
              </div>
              <div className={`text-2xl font-bold tabular-nums ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Revenue − Expenses</div>
            </div>
          </div>
        </section>

        {/* Balance Sheet Summary */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            Balance Sheet Summary
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Assets</div>
              <div className="text-xl font-bold text-blue-400 tabular-nums">{formatCurrency(totalAssets)}</div>
              <div className="text-xs text-zinc-500 mt-1">{assetAccounts.length} asset accounts</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Liabilities</div>
              <div className="text-xl font-bold text-rose-400 tabular-nums">{formatCurrency(totalLiabilities)}</div>
              <div className="text-xs text-zinc-500 mt-1">{liabilityAccts.length} liability accounts</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Equity</div>
              <div className="text-xl font-bold text-violet-400 tabular-nums">{formatCurrency(totalEquity)}</div>
              <div className="text-xs text-zinc-500 mt-1">{equityAccounts.length} equity accounts</div>
            </div>
          </div>
        </section>

        {/* GL Account Balances by Type */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            GL Account Balances
          </p>
          <div className="space-y-3">
            {TYPE_ORDER.filter(t => (grouped[t] ?? []).length > 0).map(type => {
              const typeAccounts = grouped[type] ?? []
              const typeTotal = typeAccounts.reduce((s, a) => s + (a.balance ?? 0), 0)
              return (
                <div key={type} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-900/40">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${TYPE_DOT[type as AccountType]}`} />
                      <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">
                        {TYPE_LABELS[type as AccountType]}
                      </span>
                      <span className="text-[11px] text-zinc-600">({typeAccounts.length})</span>
                    </div>
                    <span className={`text-[13px] font-semibold tabular-nums ${TYPE_COLORS[type as AccountType]}`}>
                      {formatCurrency(typeTotal)}
                    </span>
                  </div>
                  <table className="w-full text-[13px]">
                    <tbody>
                      {typeAccounts.map((acct, idx) => (
                        <tr
                          key={acct.id}
                          className={`hover:bg-zinc-800/30 transition-colors ${idx !== typeAccounts.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
                        >
                          <td className="px-4 py-2 font-mono text-[11px] text-zinc-500 w-20">{acct.code}</td>
                          <td className="py-2 pr-4 text-zinc-300">{acct.name}</td>
                          <td className="py-2 pr-4 text-zinc-600 text-[11px] capitalize">{acct.subtype ?? ''}</td>
                          <td className={`px-4 py-2 text-right font-semibold tabular-nums ${(acct.balance ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(acct.balance ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </section>

        {/* Recent Journal Entries */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            Recent Journal Entries
          </p>
          {recentEntries.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12 text-zinc-600">
              <p className="text-[13px]">No journal entries yet</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Reference</th>
                      <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Description</th>
                      <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Lines</th>
                      <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Total Debits</th>
                      <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEntries.map((entry, idx) => {
                      const totalDebits = entry.lines.reduce((s, l) => s + (l.debit ?? 0), 0)
                      return (
                        <tr
                          key={entry.id}
                          className={`hover:bg-zinc-800/20 transition-colors ${idx !== recentEntries.length - 1 ? 'border-b border-zinc-800/30' : ''}`}
                        >
                          <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-300">{entry.reference}</td>
                          <td className="px-4 py-2.5 text-[12px] text-zinc-500 whitespace-nowrap">{formatDate(entry.date)}</td>
                          <td className="px-4 py-2.5 text-[13px] text-zinc-400 max-w-[200px] truncate" title={entry.description ?? ''}>
                            {entry.description || <span className="text-zinc-700">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right text-[13px] text-zinc-500 tabular-nums">{entry.lines.length}</td>
                          <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-emerald-400 tabular-nums">
                            {formatCurrency(totalDebits)}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusCls(entry.status)}`}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-zinc-800/50">
                <Link
                  href="/finance/journal-entries"
                  className="inline-flex items-center gap-1.5 text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View all journal entries
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Budget Variance Summary */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Budget Variance Summary
            </p>
            <Link
              href="/budget"
              className="inline-flex items-center gap-1.5 text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Budget Management
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {!activeBudgetPlan ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 flex items-center justify-between">
              <div>
                <p className="text-[13px] text-zinc-300 font-medium mb-1">No active budget plan for {currentFY}</p>
                <p className="text-[13px] text-zinc-500">Create and activate a budget plan to see variance tracking here.</p>
              </div>
              <Link
                href="/budget/plans/new"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 h-9 text-[13px] font-medium transition-colors shrink-0"
              >
                New Budget Plan
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Plan</div>
                <div className="text-[15px] font-semibold text-zinc-100">{activeBudgetPlan.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{activeBudgetPlan.fiscalYear} · Active</div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Budgeted</div>
                <div className="text-xl font-bold text-zinc-100 tabular-nums">{formatCurrency(totalBudgeted)}</div>
                <div className="text-xs text-zinc-500 mt-1">{activeBudgetPlan.entries.length} budget entries</div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Variance</div>
                <div className={`text-xl font-bold tabular-nums ${budgetVariance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {budgetVariance >= 0 ? '+' : ''}{formatCurrency(budgetVariance)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{budgetVariance >= 0 ? 'under budget' : 'over budget'}</div>
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
