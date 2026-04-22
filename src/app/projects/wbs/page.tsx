'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'

type ProjectSummary = {
  id: string
  projectNo: string
  description: string
  status: string
  _count: { tasks: number }
}

type Task = {
  id: string
  projectId: string
  taskNo: string
  description: string
  percentComplete: number
  status: string
  budgetHours: number
  actualHours: number
  resource: { name: string } | null
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  open: 'success', planning: 'default', completed: 'secondary', cancelled: 'destructive',
}

export default function AllWBSPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(false)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.ok ? r.json() : [])
      .then((data: ProjectSummary[]) => {
        setProjects(data)
        if (data.length > 0) setSelectedProject(data[0].id)
      })
      .finally(() => setLoadingProjects(false))
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    setLoadingTasks(true)
    fetch(`/api/projects/${selectedProject}/wbs`)
      .then(r => r.ok ? r.json() : [])
      .then((data: Task[]) => setTasks(data))
      .finally(() => setLoadingTasks(false))
  }, [selectedProject])

  const project = projects.find(p => p.id === selectedProject)
  const totalHours = tasks.reduce((s, t) => s + Number(t.budgetHours), 0)
  const overallPct = totalHours > 0
    ? Math.round(tasks.reduce((s, t) => s + (Number(t.budgetHours) * Number(t.percentComplete)) / 100, 0) / totalHours * 100)
    : 0

  return (
    <>
      <TopBar title="Work Breakdown Structure" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <div className="flex items-center gap-4">
          <h2 className="text-base font-semibold text-zinc-100">WBS — All Projects</h2>
          <div className="ml-auto flex items-center gap-2">
            {loadingProjects ? (
              <span className="text-xs text-zinc-600">Loading projects…</span>
            ) : (
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="h-8 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-3 focus:outline-none focus:border-blue-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.projectNo} — {p.description}</option>
                ))}
              </select>
            )}
            {selectedProject && (
              <Link href={`/projects/${selectedProject}/wbs`}>
                <button className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                  Open Full WBS
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Project header summary */}
        {project && (
          <div className="flex items-center gap-3 p-4 bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <ClipboardList className="w-5 h-5 text-zinc-500 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100">{project.projectNo}</span>
                <Badge variant={STATUS_VARIANT[project.status] ?? 'secondary'} className="capitalize text-xs">
                  {project.status}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{project.description}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-zinc-500 mb-1">Overall Completion</p>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-zinc-200">{overallPct}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Task table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tasks ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingTasks ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-600">Loading…</div>
            ) : tasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-600">No tasks for this project.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Task No', 'Description', 'Resource', 'Progress', 'Budget / Actual', 'Status'].map(h => (
                      <th key={h} className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Task No' || h === 'Description' || h === 'Resource' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const pct = Number(task.percentComplete)
                    return (
                      <tr key={task.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{task.taskNo}</td>
                        <td className="px-4 py-2.5 text-zinc-200">{task.description}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-400">{task.resource?.name ?? '—'}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-400 w-8">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs text-zinc-400">
                          {Number(task.actualHours).toFixed(1)} / {Number(task.budgetHours).toFixed(1)}h
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Badge variant={task.status === 'completed' ? 'success' : task.status === 'blocked' ? 'destructive' : 'secondary'} className="text-xs capitalize">
                            {task.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
