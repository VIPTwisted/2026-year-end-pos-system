import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BarChart2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-zinc-700 text-zinc-300',
  active: 'bg-blue-500/20 text-blue-300',
  on_hold: 'bg-amber-500/20 text-amber-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  cancelled: 'bg-red-500/20 text-red-300',
}

export default async function ProjectForecastsOverviewPage() {
  const projects = await prisma.project.findMany({
    include: {
      tasks: { select: { budgetHours: true, actualHours: true, percentComplete: true } },
      planningLines: { select: { lineAmount: true } },
      actuals: { select: { amount: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const rows = projects.map(p => {
    const budgetCost = p.planningLines.reduce((s, l) => s + l.lineAmount, 0) || p.budgetAmount
    const actualCost = p.actuals.reduce((s, a) => s + a.amount, 0)
    const variance = budgetCost - actualCost
    const totalTasks = p.tasks.length
    const completionPct = totalTasks > 0
      ? Math.round(p.tasks.reduce((s, t) => s + t.percentComplete, 0) / totalTasks)
      : 0
    const forecastCost = actualCost + (budgetCost > 0 ? (budgetCost - actualCost) * (1 - completionPct / 100) : 0)

    return {
      id: p.id,
      projectNo: p.projectNo,
      description: p.description,
      status: p.status,
      budget: budgetCost,
      forecastCost,
      actualCost,
      variance,
      completionPct,
    }
  })

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0)
  const totalActual = rows.reduce((s, r) => s + r.actualCost, 0)
  const totalVariance = totalBudget - totalActual
  const overBudget = rows.filter(r => r.variance < 0).length

  return (
    <>
      <TopBar
        title="Project Forecasts"
        breadcrumb={[{ label: 'Projects', href: '/projects' }]}
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen space-y-6">

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">Total Budget</p>
            <p className="text-xl font-bold text-zinc-100">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">Total Actual</p>
            <p className="text-xl font-bold text-zinc-100">{formatCurrency(totalActual)}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">Portfolio Variance</p>
            <p className={`text-xl font-bold ${totalVariance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
            </p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">Over Budget</p>
            <p className="text-xl font-bold text-red-400">{overBudget}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">All Projects — Forecast vs Actual</h3>
          </div>
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-zinc-600">No projects found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Project', 'Status', 'Budget', 'Forecast', 'Actual', 'Variance', 'Completion', ''].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Project' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const isOver = row.variance < 0
                  return (
                    <tr key={row.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm text-zinc-200 font-medium">{row.description}</p>
                        <p className="text-xs text-zinc-600 font-mono mt-0.5">{row.projectNo}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_COLORS[row.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatCurrency(row.budget)}</td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-300">{formatCurrency(row.forecastCost)}</td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-300">{formatCurrency(row.actualCost)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isOver ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {isOver ? '' : '+'}{formatCurrency(row.variance)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${row.completionPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400 w-8 text-right">{row.completionPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/projects/${row.id}/forecasts`} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          Detail <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </>
  )
}
