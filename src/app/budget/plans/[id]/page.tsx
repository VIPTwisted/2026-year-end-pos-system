export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BudgetActivateButton } from './BudgetActivateButton'

function statusVariant(status: string): 'secondary' | 'success' | 'outline' {
  if (status === 'active') return 'success'
  if (status === 'closed') return 'outline'
  return 'secondary'
}

function varianceColor(variance: number, type: string): string {
  // For expenses: under budget (positive variance) = green
  // For revenue: over actual vs budget (positive variance) = green
  if (type === 'expense') return variance >= 0 ? 'text-emerald-400' : 'text-red-400'
  if (type === 'revenue') return variance <= 0 ? 'text-emerald-400' : 'text-red-400'
  return 'text-zinc-400'
}

export default async function BudgetPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const plan = await prisma.budgetPlan.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          account: { select: { id: true, code: true, name: true, type: true, balance: true } },
        },
        orderBy: { account: { code: 'asc' } },
      },
    },
  })

  if (!plan) notFound()
  const safePlan = plan!

  const revenueEntries = safePlan.entries.filter(e => e.account.type === 'revenue')
  const expenseEntries = safePlan.entries.filter(e => e.account.type === 'expense')

  function sectionTotals(entries: typeof safePlan.entries) {
    const totalBudgeted = entries.reduce((s, e) => s + Number(e.budgetAmount), 0)
    const totalActual = entries.reduce((s, e) => s + (e.account.balance ?? 0), 0)
    const totalVariance = totalBudgeted - totalActual
    const pctUsed = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0
    return { totalBudgeted, totalActual, totalVariance, pctUsed }
  }

  const revTotals = sectionTotals(revenueEntries)
  const expTotals = sectionTotals(expenseEntries)

  return (
    <>
      <TopBar title={`Budget Plan: ${safePlan.code}`} />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-zinc-100">{safePlan.name}</h2>
              <Badge variant={statusVariant(safePlan.status)} className="capitalize">{safePlan.status}</Badge>
              <Badge variant="default">{safePlan.fiscalYear}</Badge>
            </div>
            <p className="text-sm text-zinc-500 font-mono">{safePlan.code}</p>
            {safePlan.description && (
              <p className="text-sm text-zinc-400 mt-1">{safePlan.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {safePlan.status === 'draft' && (
              <BudgetActivateButton planId={plan.id} />
            )}
            <Link href={`/budget/plans/${plan.id}/edit`}>
              <Button variant="outline" size="sm">Edit</Button>
            </Link>
            <Link href="/budget/plans">
              <Button variant="ghost" size="sm">Back</Button>
            </Link>
          </div>
        </div>

        {/* Revenue Section */}
        {revenueEntries.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Revenue Accounts</h3>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 pb-3 pt-4 font-medium">Account</th>
                      <th className="text-left pb-3 pt-4 font-medium">Name</th>
                      <th className="text-right pb-3 pt-4 font-medium">Budgeted</th>
                      <th className="text-right pb-3 pt-4 font-medium">Actual</th>
                      <th className="text-right pb-3 pt-4 font-medium">Variance</th>
                      <th className="text-right px-5 pb-3 pt-4 font-medium">% Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {revenueEntries.map(entry => {
                      const budgeted = Number(entry.budgetAmount)
                      const actual = entry.account.balance ?? 0
                      const variance = budgeted - actual
                      const pctUsed = budgeted > 0 ? (actual / budgeted) * 100 : 0
                      return (
                        <tr key={entry.id} className="hover:bg-zinc-900/50">
                          <td className="px-5 py-3 font-mono text-xs text-zinc-500">{entry.account.code}</td>
                          <td className="py-3 pr-4 text-zinc-300">{entry.account.name}</td>
                          <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums font-medium">
                            {formatCurrency(budgeted)}
                          </td>
                          <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums">
                            {formatCurrency(actual)}
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${varianceColor(variance, 'revenue')}`}>
                            {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                          </td>
                          <td className={`px-5 py-3 text-right text-xs font-medium tabular-nums ${pctUsed > 100 ? 'text-emerald-400' : pctUsed > 70 ? 'text-amber-400' : 'text-zinc-400'}`}>
                            {budgeted > 0 ? `${pctUsed.toFixed(1)}%` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700 bg-zinc-900/40">
                      <td colSpan={2} className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Total Revenue</td>
                      <td className="py-3 pr-4 text-right font-bold text-zinc-200 tabular-nums">{formatCurrency(revTotals.totalBudgeted)}</td>
                      <td className="py-3 pr-4 text-right font-bold text-zinc-200 tabular-nums">{formatCurrency(revTotals.totalActual)}</td>
                      <td className={`py-3 pr-4 text-right font-bold tabular-nums ${varianceColor(revTotals.totalVariance, 'revenue')}`}>
                        {revTotals.totalVariance >= 0 ? '+' : ''}{formatCurrency(revTotals.totalVariance)}
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-semibold text-zinc-300 tabular-nums">
                        {revTotals.totalBudgeted > 0 ? `${revTotals.pctUsed.toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Expense Section */}
        {expenseEntries.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Expense Accounts</h3>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 pb-3 pt-4 font-medium">Account</th>
                      <th className="text-left pb-3 pt-4 font-medium">Name</th>
                      <th className="text-right pb-3 pt-4 font-medium">Budgeted</th>
                      <th className="text-right pb-3 pt-4 font-medium">Actual</th>
                      <th className="text-right pb-3 pt-4 font-medium">Variance</th>
                      <th className="text-right px-5 pb-3 pt-4 font-medium">% Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {expenseEntries.map(entry => {
                      const budgeted = Number(entry.budgetAmount)
                      const actual = entry.account.balance ?? 0
                      const variance = budgeted - actual
                      const pctUsed = budgeted > 0 ? (actual / budgeted) * 100 : 0
                      return (
                        <tr key={entry.id} className="hover:bg-zinc-900/50">
                          <td className="px-5 py-3 font-mono text-xs text-zinc-500">{entry.account.code}</td>
                          <td className="py-3 pr-4 text-zinc-300">{entry.account.name}</td>
                          <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums font-medium">
                            {formatCurrency(budgeted)}
                          </td>
                          <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums">
                            {formatCurrency(actual)}
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${varianceColor(variance, 'expense')}`}>
                            {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                          </td>
                          <td className={`px-5 py-3 text-right text-xs font-medium tabular-nums ${pctUsed > 90 ? 'text-red-400' : pctUsed > 70 ? 'text-amber-400' : 'text-zinc-400'}`}>
                            {budgeted > 0 ? `${pctUsed.toFixed(1)}%` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700 bg-zinc-900/40">
                      <td colSpan={2} className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Total Expenses</td>
                      <td className="py-3 pr-4 text-right font-bold text-zinc-200 tabular-nums">{formatCurrency(expTotals.totalBudgeted)}</td>
                      <td className="py-3 pr-4 text-right font-bold text-zinc-200 tabular-nums">{formatCurrency(expTotals.totalActual)}</td>
                      <td className={`py-3 pr-4 text-right font-bold tabular-nums ${varianceColor(expTotals.totalVariance, 'expense')}`}>
                        {expTotals.totalVariance >= 0 ? '+' : ''}{formatCurrency(expTotals.totalVariance)}
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-semibold text-zinc-300 tabular-nums">
                        {expTotals.totalBudgeted > 0 ? `${expTotals.pctUsed.toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </section>
        )}

        {safePlan.entries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <p className="text-base font-medium text-zinc-300 mb-2">No budget entries</p>
              <p className="text-sm">Edit this plan to add account budget amounts</p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
