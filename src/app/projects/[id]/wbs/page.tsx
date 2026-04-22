'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft, ChevronDown, ChevronRight, Plus,
  ClipboardList, ChevronsDownUp, ChevronsUpDown,
} from 'lucide-react'

type Resource = { id: string; name: string; resourceNo: string }

type Task = {
  id: string
  projectId: string
  parentTaskId: string | null
  taskNo: string
  description: string
  taskType: string
  indentation: number
  sortOrder: number
  budgetHours: number
  actualHours: number
  percentComplete: number
  resourceId: string | null
  status: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  resource: Resource | null
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'in-progress': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  blocked: 'bg-red-500/20 text-red-300 border-red-500/30',
  cancelled: 'bg-zinc-700/50 text-zinc-500 border-zinc-700',
}

function buildTree(tasks: Task[]): Task[] {
  // Sort by sortOrder then taskNo
  return [...tasks].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.taskNo.localeCompare(b.taskNo)
  })
}

function getChildren(tasks: Task[], parentId: string | null): Task[] {
  return tasks.filter(t => t.parentTaskId === parentId)
}

export default function WBSPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [allExpanded, setAllExpanded] = useState(true)
  const [editingPct, setEditingPct] = useState<string | null>(null)
  const [pctValue, setPctValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resources, setResources] = useState<Resource[]>([])

  const [newTask, setNewTask] = useState({
    taskNo: '',
    description: '',
    taskType: 'task',
    parentTaskId: '',
    resourceId: '',
    startDate: '',
    endDate: '',
    budgetHours: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/wbs`)
      if (res.ok) {
        const data: Task[] = await res.json()
        setTasks(data)
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
    // also load resources for assignment
    fetch('/api/resources')
      .then(r => r.ok ? r.json() : [])
      .then((data: Resource[]) => setResources(data))
      .catch(() => {})
  }, [load])

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allExpanded) {
      const parentIds = new Set(tasks.filter(t => tasks.some(c => c.parentTaskId === t.id)).map(t => t.id))
      setCollapsed(parentIds)
      setAllExpanded(false)
    } else {
      setCollapsed(new Set())
      setAllExpanded(true)
    }
  }

  const savePct = async (taskId: string) => {
    const val = parseFloat(pctValue)
    if (isNaN(val) || val < 0 || val > 100) return
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/wbs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, percentComplete: val }),
      })
      if (res.ok) {
        const updated: Task = await res.json()
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
      }
    } finally {
      setSaving(false)
      setEditingPct(null)
    }
  }

  const addTask = async () => {
    if (!newTask.taskNo.trim() || !newTask.description.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/wbs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          parentTaskId: newTask.parentTaskId || null,
          resourceId: newTask.resourceId || null,
          budgetHours: parseFloat(newTask.budgetHours) || 0,
          indentation: newTask.parentTaskId ? 1 : 0,
          sortOrder: tasks.length,
        }),
      })
      if (res.ok) {
        await load()
        setShowAddForm(false)
        setNewTask({ taskNo: '', description: '', taskType: 'task', parentTaskId: '', resourceId: '', startDate: '', endDate: '', budgetHours: '' })
      }
    } finally {
      setSaving(false)
    }
  }

  const sorted = buildTree(tasks)

  function renderTasks(parentId: string | null, depth: number): React.ReactNode {
    const children = getChildren(sorted, parentId)
    if (children.length === 0) return null
    return children.map(task => {
      const hasChildren = sorted.some(t => t.parentTaskId === task.id)
      const isCollapsed = collapsed.has(task.id)
      const pct = Number(task.percentComplete)

      return (
        <div key={task.id}>
          <div
            className="grid grid-cols-[auto_1fr_160px_160px_120px_80px_90px] gap-2 items-center px-4 py-2.5 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group"
            style={{ paddingLeft: `${16 + depth * 20}px` }}
          >
            {/* Expand toggle + task number */}
            <div className="flex items-center gap-1.5 min-w-[80px]">
              {hasChildren ? (
                <button
                  onClick={() => toggleCollapse(task.id)}
                  className="p-0.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <span className="font-mono text-xs text-zinc-400">{task.taskNo}</span>
            </div>

            {/* Description */}
            <div>
              <span className="text-sm text-zinc-200">{task.description}</span>
              {task.taskType !== 'task' && (
                <span className="ml-2 text-xs text-zinc-600 capitalize">({task.taskType})</span>
              )}
            </div>

            {/* Resource */}
            <div className="text-xs text-zinc-400 truncate">
              {task.resource ? task.resource.name : <span className="text-zinc-700">—</span>}
            </div>

            {/* Dates */}
            <div className="text-xs text-zinc-500">
              {task.startDate || task.endDate ? (
                <span>
                  {task.startDate ? formatDate(task.startDate).split(',')[0] : '?'}
                  {' – '}
                  {task.endDate ? formatDate(task.endDate).split(',')[0] : '?'}
                </span>
              ) : (
                <span className="text-zinc-700">—</span>
              )}
            </div>

            {/* % Complete */}
            <div className="flex items-center gap-1.5">
              {editingPct === task.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pctValue}
                    onChange={e => setPctValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') savePct(task.id)
                      if (e.key === 'Escape') setEditingPct(null)
                    }}
                    className="w-14 h-6 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-100 px-1.5 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => savePct(task.id)}
                    disabled={saving}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >✓</button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 cursor-pointer group/pct"
                  onClick={() => { setEditingPct(task.id); setPctValue(String(pct)) }}
                >
                  <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 group-hover/pct:text-zinc-200 transition-colors w-8 text-right">
                    {pct}%
                  </span>
                </div>
              )}
            </div>

            {/* Budget Hours */}
            <div className="text-xs text-zinc-400 text-right">
              {Number(task.actualHours).toFixed(1)} / {Number(task.budgetHours).toFixed(1)}h
            </div>

            {/* Status */}
            <div>
              <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[task.status] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-700'}`}>
                {task.status}
              </span>
            </div>
          </div>

          {/* Render children if not collapsed */}
          {!isCollapsed && renderTasks(task.id, depth + 1)}
        </div>
      )
    })
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => Number(t.percentComplete) === 100).length
  const totalHours = tasks.reduce((s, t) => s + Number(t.budgetHours), 0)
  const earnedHours = tasks.reduce((s, t) => s + (Number(t.budgetHours) * Number(t.percentComplete)) / 100, 0)
  const overallPct = totalHours > 0 ? Math.round((earnedHours / totalHours) * 100) : 0

  return (
    <>
      <TopBar title="Work Breakdown Structure" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <div className="flex items-center justify-between">
          <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Project
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs gap-1.5">
              {allExpanded ? <ChevronsDownUp className="w-3.5 h-3.5" /> : <ChevronsUpDown className="w-3.5 h-3.5" />}
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(v => !v)} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks', value: totalTasks },
            { label: 'Completed', value: completedTasks },
            { label: 'Budget Hours', value: `${totalHours.toFixed(0)}h` },
            { label: 'Overall Progress', value: `${overallPct}%` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-xl font-bold text-zinc-100">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-400" />
                New Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Task No *</label>
                  <Input
                    value={newTask.taskNo}
                    onChange={e => setNewTask(p => ({ ...p, taskNo: e.target.value }))}
                    placeholder="1.1.1"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-500 block mb-1">Description *</label>
                  <Input
                    value={newTask.description}
                    onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                    placeholder="Task description"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Type</label>
                  <select
                    value={newTask.taskType}
                    onChange={e => setNewTask(p => ({ ...p, taskType: e.target.value }))}
                    className="w-full h-8 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-2 focus:outline-none focus:border-blue-500"
                  >
                    {['task', 'milestone', 'summary', 'deliverable'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Parent Task</label>
                  <select
                    value={newTask.parentTaskId}
                    onChange={e => setNewTask(p => ({ ...p, parentTaskId: e.target.value }))}
                    className="w-full h-8 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">— None (Root) —</option>
                    {sorted.filter(t => !t.parentTaskId).map(t => (
                      <option key={t.id} value={t.id}>{t.taskNo} — {t.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Resource</label>
                  <select
                    value={newTask.resourceId}
                    onChange={e => setNewTask(p => ({ ...p, resourceId: e.target.value }))}
                    className="w-full h-8 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">— Unassigned —</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Budget Hours</label>
                  <Input
                    type="number"
                    value={newTask.budgetHours}
                    onChange={e => setNewTask(p => ({ ...p, budgetHours: e.target.value }))}
                    placeholder="0"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={newTask.startDate}
                    onChange={e => setNewTask(p => ({ ...p, startDate: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">End Date</label>
                  <Input
                    type="date"
                    value={newTask.endDate}
                    onChange={e => setNewTask(p => ({ ...p, endDate: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={addTask} disabled={saving} className="text-xs">
                  {saving ? 'Saving…' : 'Add Task'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="text-xs">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* WBS Tree */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-zinc-400" />
              Tasks ({totalTasks})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_160px_160px_120px_80px_90px] gap-2 items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide min-w-[80px]">Task No</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Resource</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Dates</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Progress</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Actual/Budget</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</span>
            </div>

            {loading ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-600">Loading WBS…</div>
            ) : tasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-600">
                No tasks yet.{' '}
                <button onClick={() => setShowAddForm(true)} className="text-blue-400 hover:underline">Add the first task</button>
              </div>
            ) : (
              renderTasks(null, 0)
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
