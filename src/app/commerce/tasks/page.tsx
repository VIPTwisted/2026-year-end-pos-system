'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { CheckSquare, Plus, RefreshCw } from 'lucide-react'

interface CommerceTask {
  id: string
  taskNo: string
  title: string
  description: string | null
  storeId: string | null
  storeName: string | null
  assignedTo: string | null
  priority: string
  status: string
  dueDate: string | null
  completedAt: string | null
  createdAt: string
}

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Normal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Low: 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40',
}

const STATUS_STYLES: Record<string, string> = {
  Open: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40',
}

function formatDate(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CommerceTasksPage() {
  const [tasks, setTasks] = useState<CommerceTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', storeName: '',
    assignedTo: '', priority: 'Normal', dueDate: '',
  })

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/commerce/tasks?${params}`)
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          storeName: form.storeName || undefined,
          assignedTo: form.assignedTo || undefined,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setShowForm(false)
      setForm({ title: '', description: '', storeName: '', assignedTo: '', priority: 'Normal', dueDate: '' })
      load()
    } finally {
      setSaving(false)
    }
  }

  const openCount = tasks.filter(t => t.status === 'Open').length

  return (
    <>
      <TopBar title="Store Tasks" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Store Tasks</h1>
            <p className="text-sm text-zinc-500">{tasks.length} task(s) · {openCount} open</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex gap-2">
          {['', 'Open', 'In Progress', 'Completed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {showForm && (
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">New Task</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-500 mb-1">Title *</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Complete end-of-day count" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required autoFocus />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-500 mb-1">Description</label>
                  <textarea rows={2}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Store</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Main Street Store" value={form.storeName}
                    onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Assigned To</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Jane Smith" value={form.assignedTo}
                    onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Priority</label>
                  <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Due Date</label>
                  <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                {error && <p className="col-span-2 text-xs text-rose-400">{error}</p>}
                <div className="col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    {saving ? 'Creating…' : 'Create Task'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card><CardContent className="flex items-center justify-center py-16 text-zinc-600">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
          </CardContent></Card>
        ) : tasks.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <CheckSquare className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">No tasks found.</p>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="px-0 py-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-3">Task No.</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Title</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Store</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Assigned To</th>
                    <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Priority</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Due</th>
                    <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{task.taskNo}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-200 max-w-xs truncate">{task.title}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{task.storeName ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{task.assignedTo ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded border ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Normal}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(task.dueDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[task.status] ?? STATUS_STYLES.Open}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
