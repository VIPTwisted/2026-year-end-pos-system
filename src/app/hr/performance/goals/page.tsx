import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}
const CATEGORY_COLORS: Record<string, string> = {
  performance: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  development: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  learning: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
}

export default async function PerformanceGoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string; status?: string; category?: string }>
}) {
  const { employeeId, status, category } = await searchParams
  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (status) where.status = status
  if (category) where.category = category

  const goals = await prisma.performanceGoal.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const empIds = [...new Set(goals.map(g => g.employeeId))]
  const employees = await prisma.employee.findMany({
    where: { id: { in: empIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  return (
    <>
      <TopBar title="Performance Goals" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Performance Goals</h1>
          <p className="text-sm text-zinc-500">{goals.length} goals</p>
        </div>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <p className="text-sm">No goals found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3">Employee</th>
                  <th className="text-left pb-3">Title</th>
                  <th className="text-left pb-3">Category</th>
                  <th className="text-left pb-3">Due Date</th>
                  <th className="text-right pb-3">Weight %</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-center pb-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {goals.map(g => (
                  <tr key={g.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-medium text-zinc-100">{empMap[g.employeeId] ?? g.employeeId}</td>
                    <td className="py-3 pr-4 text-zinc-200">{g.title}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs border capitalize ${CATEGORY_COLORS[g.category] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {g.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">{g.dueDate ? new Date(g.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{g.weight > 0 ? `${g.weight}%` : '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs border ${STATUS_COLORS[g.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {g.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-center text-amber-400">{g.rating ? '★'.repeat(g.rating) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
