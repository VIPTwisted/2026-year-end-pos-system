import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, DollarSign, TrendingDown, BarChart3, Plus, BookOpen } from 'lucide-react'

type CenterType = 'department' | 'project' | 'region' | 'product_line'
type CategoryType = 'personnel' | 'overhead' | 'materials' | 'services' | 'capex'

function centerTypeVariant(type: string): 'default' | 'secondary' | 'warning' | 'success' | 'outline' {
  if (type === 'department') return 'default'
  if (type === 'project') return 'success'
  if (type === 'region') return 'warning'
  if (type === 'product_line') return 'outline'
  return 'secondary'
}

function categoryTypeVariant(type: string): 'default' | 'secondary' | 'warning' | 'success' | 'outline' {
  if (type === 'personnel') return 'default'
  if (type === 'overhead') return 'secondary'
  if (type === 'materials') return 'warning'
  if (type === 'services') return 'success'
  if (type === 'capex') return 'outline'
  return 'secondary'
}

function varianceColor(variance: number): string {
  // For costs: under budget (positive) = green, over budget (negative) = red
  return variance >= 0 ? 'text-emerald-400' : 'text-red-400'
}

export default async function CostAccountingPage() {
  const FISCAL_YEAR = 'FY2026'

  const [centers, categories, allEntries, allBudgets] = await Promise.all([
    prisma.costCenter.findMany({
      where: { isActive: true },
      include: { _count: { select: { entries: true } } },
      orderBy: { code: 'asc' },
    }),
    prisma.costCategory.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    }),
    prisma.costLedgerEntry.findMany({
      where: { fiscalYear: FISCAL_YEAR },
      select: { costCenterId: true, costCategoryId: true, amount: true },
    }),
    prisma.costBudget.findMany({
      where: { fiscalYear: FISCAL_YEAR },
      select: { costCenterId: true, costCategoryId: true, budgetAmount: true },
    }),
  ])

  // Aggregate actuals + budgets by center
  const actualByCenterId = new Map<string, number>()
  for (const e of allEntries) {
    actualByCenterId.set(e.costCenterId, (actualByCenterId.get(e.costCenterId) ?? 0) + e.amount)
  }
  const budgetByCenterId = new Map<string, number>()
  for (const b of allBudgets) {
    budgetByCenterId.set(b.costCenterId, (budgetByCenterId.get(b.costCenterId) ?? 0) + b.budgetAmount)
  }

  // Aggregate actuals by category
  const actualByCategoryId = new Map<string, number>()
  for (const e of allEntries) {
    actualByCategoryId.set(e.costCategoryId, (actualByCategoryId.get(e.costCategoryId) ?? 0) + e.amount)
  }

  const totalActualYTD = allEntries.reduce((s, e) => s + e.amount, 0)
  const totalBudgetedYTD = allBudgets.reduce((s, b) => s + b.budgetAmount, 0)
  const totalVariance = totalBudgetedYTD - totalActualYTD

  return (
    <>
      <TopBar title="Cost Accounting" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Cost Accounting</h2>
            <p className="text-sm text-zinc-500">Cost centers, categories, and ledger entries — {FISCAL_YEAR}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/finance/cost-accounting/entry/new">
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-1" />
                Post Entry
              </Button>
            </Link>
            <Link href="/finance/cost-accounting/new">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                New Cost Center
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Cost Centers</p>
              </div>
              <p className="text-2xl font-bold text-blue-400 tabular-nums">{centers.length}</p>
              <p className="text-xs text-zinc-600 mt-1">active centers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Actual YTD</p>
              </div>
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{formatCurrency(totalActualYTD)}</p>
              <p className="text-xs text-zinc-600 mt-1">all cost centers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Budgeted YTD</p>
              </div>
              <p className="text-2xl font-bold text-zinc-300 tabular-nums">{formatCurrency(totalBudgetedYTD)}</p>
              <p className="text-xs text-zinc-600 mt-1">all cost centers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className={`w-4 h-4 ${totalVariance >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Variance</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${varianceColor(totalVariance)}`}>
                {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">budget minus actual</p>
            </CardContent>
          </Card>
        </div>

        {/* Cost by Center Table */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Cost by Center</h3>
          {centers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Building2 className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No cost centers</p>
                <p className="text-sm mb-4">Create a cost center to begin tracking costs</p>
                <Link href="/finance/cost-accounting/new">
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Cost Center</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 pb-3 pt-4 font-medium">Code</th>
                      <th className="text-left pb-3 pt-4 font-medium">Name</th>
                      <th className="text-left pb-3 pt-4 font-medium">Type</th>
                      <th className="text-right pb-3 pt-4 font-medium">Actual YTD</th>
                      <th className="text-right pb-3 pt-4 font-medium">Budgeted</th>
                      <th className="text-right pb-3 pt-4 font-medium">Variance</th>
                      <th className="text-right px-5 pb-3 pt-4 font-medium">% Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {centers.map(center => {
                      const actual = actualByCenterId.get(center.id) ?? 0
                      const budgeted = budgetByCenterId.get(center.id) ?? 0
                      const variance = budgeted - actual
                      const pctUsed = budgeted > 0 ? (actual / budgeted) * 100 : 0
                      return (
                        <tr key={center.id} className="hover:bg-zinc-900/50">
                          <td className="px-5 py-3 font-mono text-xs text-zinc-500">{center.code}</td>
                          <td className="py-3 pr-4 text-zinc-200 font-medium">{center.name}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={centerTypeVariant(center.type as CenterType)} className="capitalize">
                              {center.type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums font-medium">
                            {formatCurrency(actual)}
                          </td>
                          <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums">
                            {budgeted > 0 ? formatCurrency(budgeted) : <span className="text-zinc-700">—</span>}
                          </td>
                          <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${budgeted > 0 ? varianceColor(variance) : 'text-zinc-600'}`}>
                            {budgeted > 0 ? (variance >= 0 ? '+' : '') + formatCurrency(variance) : '—'}
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
                      <td colSpan={3} className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Total</td>
                      <td className="py-3 pr-4 text-right font-bold text-zinc-200 tabular-nums">{formatCurrency(totalActualYTD)}</td>
                      <td className="py-3 pr-4 text-right font-bold text-zinc-200 tabular-nums">{formatCurrency(totalBudgetedYTD)}</td>
                      <td className={`py-3 pr-4 text-right font-bold tabular-nums ${varianceColor(totalVariance)}`}>
                        {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-semibold text-zinc-300 tabular-nums">
                        {totalBudgetedYTD > 0 ? `${((totalActualYTD / totalBudgetedYTD) * 100).toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Cost by Category Table */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Cost by Category</h3>
          {categories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-1">No categories yet</p>
                <p className="text-sm">Cost categories will appear here once created</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 pb-3 pt-4 font-medium">Code</th>
                      <th className="text-left pb-3 pt-4 font-medium">Name</th>
                      <th className="text-left pb-3 pt-4 font-medium">Type</th>
                      <th className="text-right pb-3 pt-4 font-medium">Actual YTD</th>
                      <th className="text-right px-5 pb-3 pt-4 font-medium">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {categories.map(cat => {
                      const actual = actualByCategoryId.get(cat.id) ?? 0
                      const pct = totalActualYTD > 0 ? (actual / totalActualYTD) * 100 : 0
                      return (
                        <tr key={cat.id} className="hover:bg-zinc-900/50">
                          <td className="px-5 py-3 font-mono text-xs text-zinc-500">{cat.code}</td>
                          <td className="py-3 pr-4 text-zinc-200 font-medium">{cat.name}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={categoryTypeVariant(cat.type as CategoryType)} className="capitalize">
                              {cat.type}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums font-medium">
                            {actual > 0 ? formatCurrency(actual) : <span className="text-zinc-700">—</span>}
                          </td>
                          <td className="px-5 py-3 text-right text-xs font-medium tabular-nums text-zinc-400">
                            {totalActualYTD > 0 && actual > 0 ? `${pct.toFixed(1)}%` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </section>

      </main>
    </>
  )
}
