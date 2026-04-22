'use client'
import { useEffect, useState } from 'react'
import { Plus, X, CheckSquare, Clock } from 'lucide-react'

interface AssocTask {
  id: string
  subject: string
  customerName: string | null
  customerId: string | null
  taskType: string
  priority: string
  status: string
  assignedTo: string
  dueDate: string | null
  description: string | null
  completedAt: string | null
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  normal: 'bg-zinc-700/50 text-zinc-300 border-zinc-600',
  low: 'bg-zinc-800/50 text-zinc-500 border-zinc-700',
}

const TASK_TYPE_COLORS: Record<string, string> = {
  clienteling: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'follow-up': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'birthday-outreach': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'lapsed-win-back': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

const STATUS_FILTERS = ['open', 'in-progress', 'completed']

export default function AssociateTasksPage() {
  const [tasks, setTasks] = useState<AssocTask[]>([])
  const [filter, setFilter] = useState('open')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    subject: '', taskType: 'clienteling', customerName: '', priority: 'normal',
    description: '', dueDate: '', assignedTo: '',
  })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('status', filter)
    const res = await fetch(`/api/clienteling/tasks?${params}`)
    setTasks(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function createTask() {
    if (!form.subject.trim() || !form.assignedTo.trim()) return
    setSaving(true)
    await fetch('/api/clienteling/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ subject: '', taskType: 'clienteling', customerName: '', priority: 'normal', description: '', dueDate: '', assignedTo: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/clienteling/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function deleteTask(id: string) {
    await fetch(`/api/clienteling/tasks/${id}`, { method: 'DELETE' })
    load()
  }

  function isOverdue(dueDate: string | null) {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Associate Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">Clienteling outreach tasks and follow-ups</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New Associate Task</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Subject *</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Task subject" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Task Type</label>
              <select value={form.taskType} onChange={e => setForm({ ...form, taskType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="clienteling">Clienteling</option>
                <option value="follow-up">Follow Up</option>
                <option value="birthday-outreach">Birthday Outreach</option>
                <option value="lapsed-win-back">Lapsed Win-Back</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Customer Name</label>
              <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Customer (optional)" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Assigned To *</label>
              <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Associate name" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Optional details" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createTask} disabled={saving || !form.subject.trim() || !form.assignedTo.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium">
              {saving ? 'Creating...' : 'Create Task'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'
            }`}>{f.replace('-', ' ')}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-500">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p>No {filter} tasks found.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Assigned To</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {tasks.map(t => (
                <tr key={t.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-zinc-100">{t.subject}</div>
                    {t.description && <div className="text-xs text-zinc-500 truncate max-w-xs">{t.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{t.customerName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${TASK_TYPE_COLORS[t.taskType] || 'bg-zinc-700/50 text-zinc-400 border-zinc-600'}`}>
                      {t.taskType.replace(/-/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.normal}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.dueDate ? (
                      <div className="flex items-center gap-1">
                        <Clock className={`w-3.5 h-3.5 ${isOverdue(t.dueDate) && t.status !== 'completed' ? 'text-red-400' : 'text-zinc-600'}`} />
                        <span className={`text-xs ${isOverdue(t.dueDate) && t.status !== 'completed' ? 'text-red-400' : 'text-zinc-400'}`}>
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : <span className="text-zinc-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{t.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      t.status === 'open' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      t.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      t.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      'bg-zinc-700/50 text-zinc-400 border-zinc-600'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {t.status === 'open' && (
                        <>
                          <button onClick={() => updateStatus(t.id, 'in-progress')}
                            className="text-xs px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-md transition-colors">Start</button>
                          <button onClick={() => updateStatus(t.id, 'completed')}
                            className="text-xs px-2 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-md transition-colors">Complete</button>
                        </>
                      )}
                      {t.status === 'in-progress' && (
                        <button onClick={() => updateStatus(t.id, 'completed')}
                          className="text-xs px-2 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-md transition-colors">Complete</button>
                      )}
                      <button onClick={() => deleteTask(t.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
