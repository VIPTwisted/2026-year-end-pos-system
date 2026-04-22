import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, ListChecks } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TASK_TYPE_COLOR: Record<string, string> = {
  Posting:     'bg-emerald-500/20 text-emerald-400',
  Total:       'bg-zinc-700/40 text-zinc-400',
  'Begin-Total': 'bg-blue-500/20 text-blue-400',
  'End-Total':   'bg-purple-500/20 text-purple-400',
}

export default async function ProjectTasksPage() {
  const tasks = await prisma.projectTask.findMany({
    include: { project: { select: { projectNo: true, description: true } } },
    orderBy: [{ project: { projectNo: 'asc' } }, { taskNo: 'asc' }],
  })

  return (
    <>
      <TopBar title="Project Tasks" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Project Tasks</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{tasks.length} tasks across all projects</p>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Tasks',   value: tasks.length, color: 'text-zinc-100' },
              { label: 'Posting',       value: tasks.filter(t => t.taskType === 'Posting').length, color: 'text-emerald-400' },
              { label: 'Avg % Complete', value: tasks.length ? (tasks.reduce((s, t) => s + (t.completePct ?? 0), 0) / tasks.length).toFixed(0) + '%' : '0%', color: 'text-amber-400' },
              { label: 'Planned Cost',  value: formatCurrency(tasks.reduce((s, t) => s + (t.plannedCost ?? 0), 0)), color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[20px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          {tasks.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12">
              <ListChecks className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500">No project tasks found.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Project No.', 'Task No.', 'Description', 'Task Type', 'Work Type', '% Complete', 'Planned Cost', 'Usage Cost', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          ['% Complete','Planned Cost','Usage Cost'].includes(h) ? 'text-right' : 'text-left'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {tasks.map(task => (
                      <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/projects/${task.projectId}`} className="font-mono text-[11px] text-blue-400 hover:underline">
                            {task.project.projectNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{task.taskNo}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100 max-w-[200px] truncate">{task.description}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TASK_TYPE_COLOR[task.taskType] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {task.taskType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{task.workTypeCode ?? '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[11px] text-zinc-300 tabular-nums">{task.completePct ?? 0}%</span>
                            <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.completePct ?? 0}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-300 tabular-nums">{formatCurrency(task.plannedCost ?? 0)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-300 tabular-nums">{formatCurrency(task.usageCost ?? 0)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/projects/${task.projectId}`} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
