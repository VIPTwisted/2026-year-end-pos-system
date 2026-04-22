export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart, TrendingUp, TrendingDown, DollarSign, Settings2, AlertCircle } from 'lucide-react'

const FISCAL_YEAR = 'FY2026'

// Placeholder budget amounts — no Budget model yet, all zeroed
const BUDGET_STUBS: Record<string, number> = {}

function getBudgetAmount(accountCode: string): number {
  return BUDGET_STUBS[accountCode] ?? 0
}

function getVarianceClass(variance: number, budgeted: number): string {
  if (budgeted === 0) return 'text-zinc-500'
  return variance >= 0 ? 'text-emerald-400' : 'text-red-400'
}

export default async function BudgetPage() {
  const [accounts, journalLines] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: 'asc' } }),
    prisma.journalLine.findMany({ include: { account: true } }),
  ])

  // Compute actuals per account from journal lines
  const actualsMap: Record<string, number> = {}
  for (const line of journalLines) {
    const id = line.accountId
    if (!actualsMap[id]) actualsMap[id] = 0
    // Net: debits increase asset/expense, credits increase liability/equity/revenue
    actualsMap[id] += line.debit - line.credit
  }

  // Filter to expense and revenue accounts for budgeting focus
  const budgetableTypes = ['expense', 'revenue']
  const budgetAccounts = accounts.filter(a => budgetableTypes.includes(a.type))
  const allAccounts = accounts

  // Summary totals
  const totalBudgeted = allAccounts.reduce((sum, a) => sum + getBudgetAmount(a.code), 0)
  const totalActuals = allAccounts.reduce((sum, a) => {
    const actual = Math.abs(actualsMap[a.id] ?? a.balance)
    return sum + actual
  }, 0)
  const remainingBudget = totalBudgeted - totalActuals
  const pctUtilized = totalBudgeted > 0 ? Math.min(100, (totalActuals / totalBudgeted) * 100) : 0

  // Group accounts by type
  const grouped: Record<string, typeof accounts> = {}
  for (const acct of allAccounts) {
    if (!grouped[acct.type]) grouped[acct.type] = []
    grouped[acct.type].push(acct)
  }

  const typeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense']

  return (
    <>
      <TopBar title="Budget Management" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Budget Management</h2>
            <p className="text-sm text-zinc-500">{FISCAL_YEAR} — Fiscal Year Budget vs. Actuals</p>
          </div>
          <Link href="/budget/new">
            <Button>
              <Settings2 className="w-4 h-4 mr-1" />
              Set Budget
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Budget</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalBudgeted)}</p>
              <p className="text-xs text-zinc-600 mt-1">{FISCAL_YEAR} plan</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Actual Spend</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalActuals)}</p>
              <p className="text-xs text-zinc-600 mt-1">from GL balances</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                {remainingBudget >= 0
                  ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                  : <TrendingDown className="w-4 h-4 text-red-400" />}
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Remaining</p>
              </div>
              <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(remainingBudget)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">{remainingBudget >= 0 ? 'under budget' : 'over budget'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-4 h-4 text-zinc-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">% Utilized</p>
              </div>
              <p className={`text-2xl font-bold ${pctUtilized > 90 ? 'text-red-400' : pctUtilized > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {totalBudgeted > 0 ? `${pctUtilized.toFixed(1)}%` : 'N/A'}
              </p>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pctUtilized > 90 ? 'bg-red-500' : pctUtilized > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(pctUtilized, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget vs Actuals Table — grouped by account type */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Budget vs. Actuals by Account</h2>

          {typeOrder.filter(t => grouped[t]?.length > 0).map(type => (
            <div key={type} className="mb-6">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 pl-1 capitalize">
                {type} Accounts
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 font-medium">Code</th>
                      <th className="text-left pb-3 font-medium">Account Name</th>
                      <th className="text-right pb-3 font-medium">Set Budget</th>
                      <th className="text-right pb-3 font-medium">Actual (GL)</th>
                      <th className="text-right pb-3 font-medium">Variance</th>
                      <th className="text-right pb-3 font-medium">Var %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {grouped[type].map(acct => {
                      const budgeted = getBudgetAmount(acct.code)
                      const actual = Math.abs(actualsMap[acct.id] ?? acct.balance)
                      const variance = budgeted - actual
                      const varPct = budgeted > 0 ? (variance / budgeted) * 100 : null
                      const varClass = getVarianceClass(variance, budgeted)

                      return (
                        <tr key={acct.id} className="hover:bg-zinc-900/50">
                          <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{acct.code}</td>
                          <td className="py-3 pr-4 text-zinc-200">
                            {acct.name}
                            {acct.subtype && (
                              <span className="text-xs text-zinc-600 ml-2">({acct.subtype})</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-right text-zinc-500">
                            {budgeted > 0 ? (
                              <span className="text-zinc-300">{formatCurrency(budgeted)}</span>
                            ) : (
                              <span className="text-zinc-700">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-right font-medium text-zinc-300">
                            {formatCurrency(actual)}
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold ${varClass}`}>
                            {budgeted > 0 ? (
                              <span>{variance >= 0 ? '+' : ''}{formatCurrency(variance)}</span>
                            ) : (
                              <span className="text-zinc-700">—</span>
                            )}
                          </td>
                          <td className={`py-3 text-right text-xs font-medium ${varClass}`}>
                            {varPct !== null
                              ? `${varPct >= 0 ? '+' : ''}${varPct.toFixed(1)}%`
                              : <span className="text-zinc-700">—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {allAccounts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <PieChart className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No accounts found in the chart of accounts.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Budget Setup Coming Soon */}
        <section>
          <Card className="border-zinc-700 bg-zinc-900/40">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">Budget Register — Setup Required</h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    This module currently displays GL account balances as actuals. To enable full budget vs. actual tracking,
                    configure a budget plan by assigning target amounts to each account for {FISCAL_YEAR}.
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-1 mb-4 list-disc list-inside">
                    <li>Budget entries will be stored against each GL account code</li>
                    <li>Actuals are pulled in real-time from posted journal lines</li>
                    <li>Variance alerts fire when spend exceeds 90% of budget</li>
                    <li>Period-locking aligns with Fiscal Calendar close dates</li>
                  </ul>
                  <Link href="/budget/new">
                    <Button variant="outline" size="sm">
                      <Settings2 className="w-4 h-4 mr-1" />
                      Configure Budget Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>
    </>
  )
}
