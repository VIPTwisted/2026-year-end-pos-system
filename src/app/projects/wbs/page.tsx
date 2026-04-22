'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ClipboardList, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react'

type ProjectSummary = {
  id: string
  projectNo: string
  description: string
  status: string
  startDate?: string
  endDate?: string
  budgetCost?: number
  actualCost?: number
  _count: { tasks: number }
}

type WBSTask = {
  id: string
  projectId: string
  taskNo: string
  description: string
  taskType?: string        // Posting | Heading | Total
  startDate?: string
  endDate?: string
  percentComplete: number
  status: string
  budgetHours: number
  budgetCost?: number
  actualHours: number
  actualCost?: number
  resource?: { name: string } | null
  parentTaskId?: string | null
}

const TASK_TYPE_BADGE: Record<string, string> = {
  Heading: 'font-bold text-zinc-100',
  Total: 'font-semibold text-zinc-300 italic',
  Posting: 'text-zinc-300',
}

const STATUS_CLR: Record<string, string> = {
  open: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-zinc-600/40 text-zinc-400 border-zinc-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

function pctBar(pct: number) {
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-zinc-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function AllWBSPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [tasks, setTasks] = useState<WBSTask[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.ok ? r.json() : [])
      .then((data: ProjectSummary[]) => {
        setProjects(data)
        if (data.length > 0) setSelectedProject(data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingProjects(false))
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    setLoadingTasks(true)
    fetch(`/api/projects/${selectedProject}/wbs`)
      .then(r => r.ok ? r.json() : [])
      .then((data: WBSTask[]) => setTasks(data))
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false))
  }, [selectedProject])

  const project = projects.find(p => p.id === selectedProject)

  const totalBudgetCost = tasks.reduce((s, t) => s + (t.budgetCost ?? t.budgetHours * 100), 0)
  const totalActualCost = tasks.reduce((s, t) => s + (t.actualCost ?? t.actualHours * 100), 0)
  const overallPct = tasks.length > 0
    ? Math.round(tasks.reduce((s, t) => s + t.percentComplete, 0) / tasks.length)
    : 0

  const toggleCollapse = (id: string) =>
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <>
      <TopBar title="Work Breakdown Structure" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-full mx-auto p-6 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Project Management</p>
              <h2 className="text-xl font-bold text-zinc-100">Work Breakdown Structure</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Project task hierarchy with budget vs actual tracking</p>
            </div>
            <div className="flex items-center gap-2">
              {loadingProjects ? (
                <div className="text-xs text-zinc-600">Loading…</div>
              ) : (
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  className="h-8 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-3 focus:outline-none focus:border-blue-500 min-w-[220px]"
                >
                  {projects.length === 0 && <option value="">No projects</option>}
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectNo} — {p.description}</option>
                  ))}
                </select>
              )}
              {selectedProject && (
                <Link href={`/projects/${selectedProject}`}>
                  <button className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                    Open Project
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Project summary bar */}
          {project && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <ClipboardList className="w-5 h-5 text-zinc-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-zinc-100 font-mono">{project.projectNo}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border capitalize ${STATUS_CLR[project.status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate">{project.description}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Budget Cost</div>
                    <div className="text-sm font-bold text-zinc-200 tabular-nums font-mono">{fmt(totalBudgetCost)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Actual Cost</div>
                    <div className={`text-sm font-bold tabular-nums font-mono ${totalActualCost > totalBudgetCost ? 'text-red-400' : 'text-emerald-400'}`}>
                      {fmt(totalActualCost)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">% Complete</div>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
                      </div>
                      <span className="text-sm font-bold text-zinc-200">{overallPct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WBS table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '1000px' }}>
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Task No.', 'Description', 'Task Type', 'Start Date', 'End Date', '% Complete', 'Budget Cost', 'Actual Cost'].map(h => (
                      <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${
                        h === '% Complete' || h === 'Budget Cost' || h === 'Actual Cost' ? 'text-right' : 'text-left'
                      }`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {loadingTasks ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center">
                        <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-[13px] text-zinc-600">
                        {selectedProject ? 'No tasks for this project.' : 'Select a project to view WBS.'}
                      </td>
                    </tr>
                  ) : tasks.map(task => {
                    const isHeading = task.taskType === 'Heading'
                    const isCollapsible = isHeading
                    const isCollapsed = collapsed.has(task.id)
                    const budgetCost = task.budgetCost ?? task.budgetHours * 100
                    const actualCost = task.actualCost ?? task.actualHours * 100
                    return (
                      <tr key={task.id} className={`hover:bg-zinc-800/20 transition-colors ${isHeading ? 'bg-zinc-800/10' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {isCollapsible && (
                              <button onClick={() => toggleCollapse(task.id)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                                {isCollapsed ? <ChevronRightIcon className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}
                            <span className={`font-mono text-[12px] ${isHeading ? 'text-blue-400' : 'text-zinc-400'}`}>{task.taskNo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${TASK_TYPE_BADGE[task.taskType ?? 'Posting'] ?? 'text-zinc-300'}`}>
                            {task.description}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-zinc-500 capitalize">{task.taskType ?? 'Posting'}</span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-500">
                          {task.startDate ? new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-500">
                          {task.endDate ? new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3">{pctBar(task.percentComplete)}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] tabular-nums text-zinc-200">{fmt(budgetCost)}</td>
                        <td className={`px-4 py-3 text-right font-mono text-[12px] tabular-nums ${actualCost > budgetCost ? 'text-red-400' : 'text-zinc-300'}`}>
                          {fmt(actualCost)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {!loadingTasks && tasks.length > 0 && (
              <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
