'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckSquare, Square, Plus, User, Clock, ChevronDown, Building2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assignedTo: string | null
  dueDate: string | null
  completedAt: string | null
  notes: string | null
  sortOrder: number
}

interface TaskList {
  id: string
  name: string
  description: string | null
  status: string
  dueDate: string | null
  storeId: string | null
  assignedTo: string | null
  tasks: Task[]
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-zinc-400 border-zinc-700',
  normal: 'text-blue-400 border-blue-400/30',
  high: 'text-amber-400 border-amber-400/30',
  critical: 'text-red-400 border-red-400/30',
}

const STATUS_COLORS: Record<string, string> = {
  not_started: 'text-zinc-500',
  in_progress: 'text-blue-400',
  completed: 'text-emerald-400',
  skipped: 'text-zinc-600 line-through',
}

export default function TaskListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [list, setList] = useState<TaskList | null>(null)
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('normal')
  const [addingTask, setAddingTask] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [assignModal, setAssignModal] = useState(false)
  const [assignStore, setAssignStore] = useState('')
  const [assignEmployee, setAssignEmployee] = useState('')

  async function load() {
    const res = await fetch(`/api/tasks/lists/${id}`)
    if (res.ok) setList(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'completed' ? 'not_started' : 'completed'
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

  async function updateTaskStatus(taskId: string, status: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function saveNotes(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: noteText }),
    })
    setEditingNotes(null)
    load()
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return
    setAddingTask(true)
    await fetch(`/api/tasks/lists/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle.trim(), priority: newTaskPriority }),
    })
    setNewTaskTitle('')
    setAddingTask(false)
    load()
  }

  async function assignList() {
    await fetch(`/api/tasks/lists/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeId: assignStore.trim() || undefined,
        assignedTo: assignEmployee.trim() || undefined,
      }),
    })
    setAssignModal(false)
    load()
  }

  async function markListComplete() {
    await fetch(`/api/tasks/lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    router.push('/tasks')
  }

  if (loading) {
    return (
      <>
        <TopBar title="Task List" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <span className="text-zinc-500">Loading...</span>
        </main>
      </>
    )
  }

  if (!list) {
    return (
      <>
        <TopBar title="Task List" />
        <main className="flex-1 p-6"><div className="text-red-400">Task list not found</div></main>
      </>
    )
  }

  const completedTasks = list.tasks.filter(t => t.status === 'completed').length
  const totalTasks = list.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <>
      <TopBar title={list.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold text-zinc-100">{list.name}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    list.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                    list.status === 'active' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>{list.status}</span>
                </div>
                {list.description && <p className="text-sm text-zinc-400 mb-3">{list.description}</p>}

                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  {list.storeId && <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />{list.storeId}</span>}
                  {list.assignedTo && <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{list.assignedTo}</span>}
                  {list.dueDate && <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{new Date(list.dueDate).toLocaleDateString()}</span>}
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{completedTasks} of {totalTasks} tasks complete</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => setAssignModal(true)} className="gap-1.5">
                  <User className="w-3.5 h-3.5" />Assign
                </Button>
                {list.status === 'active' && (
                  <Button variant="success" size="sm" onClick={markListComplete} className="gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {assignModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-base font-semibold text-zinc-100">Assign Task List</h3>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Store ID</label>
                  <Input value={assignStore} onChange={e => setAssignStore(e.target.value)} placeholder="Store ID" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Assigned To</label>
                  <Input value={assignEmployee} onChange={e => setAssignEmployee(e.target.value)} placeholder="Employee name" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setAssignModal(false)}>Cancel</Button>
                  <Button size="sm" onClick={assignList}>Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="pt-6 space-y-1">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Tasks</h3>

            {list.tasks.length === 0 && (
              <div className="py-8 text-center text-zinc-500 text-sm">No tasks yet.</div>
            )}

            {list.tasks.map(task => (
              <div key={task.id} className={`p-3 rounded-lg border transition-colors ${
                task.status === 'completed' ? 'border-zinc-800/50 bg-zinc-900/30' : 'border-zinc-800 bg-zinc-800/20 hover:bg-zinc-800/40'
              }`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(task)} className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0">
                    {task.status === 'completed'
                      ? <CheckSquare className="w-5 h-5 text-emerald-400" />
                      : <Square className="w-5 h-5" />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${STATUS_COLORS[task.status] ?? 'text-zinc-100'}`}>{task.title}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${PRIORITY_COLORS[task.priority] ?? ''}`}>{task.priority}</span>
                      {task.assignedTo && <span className="text-xs text-zinc-500 flex items-center gap-1"><User className="w-3 h-3" />{task.assignedTo}</span>}
                      {task.dueDate && <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>

                    {editingNotes === task.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          rows={2}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Add notes..."
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNotes(task.id)}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingNotes(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingNotes(task.id); setNoteText(task.notes ?? '') }} className="mt-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                        {task.notes ? `Note: ${task.notes}` : '+ Add note'}
                      </button>
                    )}
                  </div>

                  <div className="relative shrink-0">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value)}
                      className="h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 pr-6"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="skipped">Skipped</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-3 flex items-center gap-2">
              <div className="w-5 h-5 shrink-0" />
              <Input
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Add a task and press Enter..."
                className="flex-1 h-8 text-sm"
              />
              <div className="relative shrink-0">
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value)}
                  className="h-8 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-300 appearance-none focus:outline-none pr-6"
                >
                  <option value="low">low</option>
                  <option value="normal">normal</option>
                  <option value="high">high</option>
                  <option value="critical">critical</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
              </div>
              <Button size="sm" onClick={addTask} disabled={addingTask || !newTaskTitle.trim()} className="gap-1.5 shrink-0">
                <Plus className="w-3.5 h-3.5" />Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
