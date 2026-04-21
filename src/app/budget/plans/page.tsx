import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Plus } from 'lucide-react'

function statusVariant(status: string): 'secondary' | 'success' | 'outline' {
  if (status === 'active') return 'success'
  if (status === 'closed') return 'outline'
  return 'secondary'
}

export default async function BudgetPlansPage() {
  const plans = await prisma.budgetPlan.findMany({
    include: {
      _count: { select: { entries: true } },
      entries: { select: { budgetAmount: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <TopBar title="Budget Plans" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Budget Plans</h2>
            <p className="text-sm text-zinc-500">{plans.length} plan{plans.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link href="/budget/plans/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              New Budget Plan
            </Button>
          </Link>
        </div>

        {plans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Target className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No budget plans yet</p>
              <p className="text-sm mb-4">Create your first budget plan to start tracking vs. actuals</p>
              <Link href="/budget/plans/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New Budget Plan
                </Button>
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
                    <th className="text-left pb-3 pt-4 font-medium">Fiscal Year</th>
                    <th className="text-left pb-3 pt-4 font-medium">Status</th>
                    <th className="text-right pb-3 pt-4 font-medium">Entries</th>
                    <th className="text-right pb-3 pt-4 font-medium">Total Budgeted</th>
                    <th className="text-center px-5 pb-3 pt-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {plans.map(plan => {
                    const totalBudgeted = plan.entries.reduce(
                      (sum, e) => sum + Number(e.budgetAmount),
                      0
                    )
                    return (
                      <tr key={plan.id} className="hover:bg-zinc-900/50">
                        <td className="px-5 py-3 font-mono text-xs text-zinc-400">{plan.code}</td>
                        <td className="py-3 pr-4 text-zinc-200 font-medium">{plan.name}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="default">{plan.fiscalYear}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={statusVariant(plan.status)} className="capitalize">
                            {plan.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums">
                          {plan._count.entries}
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-emerald-400 tabular-nums">
                          {formatCurrency(totalBudgeted)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Link href={`/budget/plans/${plan.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
