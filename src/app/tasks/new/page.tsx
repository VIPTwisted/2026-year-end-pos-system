'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react'

interface TaskDraft {
  id: string
  title: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  assignedTo: string
  dueDate: string
}

const PRIORITIES = ['low', 'normal', 'high', 'critical'] as const
const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-zinc-400',
  normal: 'text-blue-400',
  high: 'text-amber-400',
  critical: 'text-red-400',
}

export default function NewTaskListPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [storeId, setStoreId] = useState('')
  const [assignedTo, setAssignedTo] = useState('')

  const [tasks, setTasks] = useState<TaskDraft[]>([
    { id: crypto.randomUUID(), title: '', priority: 'normal', assignedTo: '', dueDate: '' },
  ])

  function addTask() {
    setTasks(prev => [
      ...prev,
      { id: crypto.randomUUID(), title: '', priority: 'normal', assignedTo: '', dueDate: '' },
    ])
  }

  function removeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function updateTask(id: string, field: keyof TaskDraft, value: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/tasks/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          storeId: storeId.trim() || undefined,
          assignedTo: assignedTo.trim() || undefined,
          tasks: tasks.filter(t => t.title.trim()).map(t => ({
            title: t.title.trim(),
            priority: t.priority,
            assignedTo: t.assignedTo.trim() || undefined,
            dueDate: t.dueDate || undefined,
          })),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      router.push(`/tasks/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task list')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Task List" />
      <main className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-base font-semibold text-zinc-100">List Details</h2>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Name *</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Store Opening Checklist"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Due Date</label>
                  <Input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Store ID</label>
                  <Input value={storeId} onChange={e => setStoreId(e.target.value)} placeholder="Store ID or code" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Assigned To</label>
                  <Input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Employee name" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-100">Tasks</h2>
                <span className="text-xs text-zinc-500">{tasks.length} tasks</span>
              </div>

              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/50">
                    <div className="mt-2 text-zinc-600 cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="text-xs text-zinc-500 mt-2.5 w-5 text-center font-mono">{idx + 1}</div>
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Input
                          value={task.title}
                          onChange={e => updateTask(task.id, 'title', e.target.value)}
                          placeholder="Task title"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <select
                            value={task.priority}
                            onChange={e => updateTask(task.id, 'priority', e.target.value)}
                            className={`w-full h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${PRIORITY_COLORS[task.priority]}`}
                          >
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={task.assignedTo}
                          onChange={e => updateTask(task.id, 'assignedTo', e.target.value)}
                          placeholder="Assignee"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="date"
                          value={task.dueDate}
                          onChange={e => updateTask(task.id, 'dueDate', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="mt-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" size="sm" onClick={addTask} className="gap-2">
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Task List'}
            </Button>
          </div>
        </form>
      </main>
    </>
  )
}
