import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Target, CheckCircle, AlertTriangle, TrendingUp, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PerformanceGoalsPage() {
  const now = new Date()
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const [goals, activeCount, completedThisQuarter] = await Promise.all([
    prisma.performanceGoal.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    }),
    prisma.performanceGoal.count({ where: { status: 'active' } }),
    prisma.performanceGoal.count({ where: { status: 'completed', completedAt: { gte: quarterStart } } }),
  ])

  const onTrack = goals.filter(g => g.status === 'active' && g.progressPct >= 50).length
  const atRisk = goals.filter(g => {
    if (g.status !== 'active') return false
    if (!g.targetDate) return false
    return new Date(g.targetDate) <= in14Days && g.progressPct < 80
  }).length

  const kpis = [
    { label: 'Active Goals', value: activeCount, icon: Target, color: 'text-blue-400' },
    { label: 'On Track', value: onTrack, icon: TrendingUp, color: 'text-green-400' },
    { label: 'At Risk', value: atRisk, icon: AlertTriangle, color: 'text-orange-400' },
    { label: 'Completed This Quarter', value: completedThisQuarter, icon: CheckCircle, color: 'text-purple-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="Performance Goals" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-400">{k.label}</span>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-200">Performance Goals</h2>
            <Link href="/hr/performance/goals/new"
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> New Goal
            </Link>
          </div>
          {goals.length === 0 ? (
            <p className="text-zinc-500 text-sm">No performance goals on file.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Goal</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Due Date</th>
                    <th className="pb-2 font-medium">Progress</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((g) => (
                    <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-3 text-zinc-200">
                        {g.employee.firstName} {g.employee.lastName}
                      </td>
                      <td className="py-3 text-zinc-300 max-w-[200px] truncate">{g.title}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          g.category === 'individual' ? 'bg-blue-500/20 text-blue-400' :
                          g.category === 'team' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>{g.category}</span>
                      </td>
                      <td className="py-3 text-zinc-400">
                        {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              g.progressPct >= 80 ? 'bg-green-500' :
                              g.progressPct >= 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`} style={{ width: `${g.progressPct}%` }} />
                          </div>
                          <span className="text-xs text-zinc-400">{g.progressPct}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          g.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          g.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          g.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>{g.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
