'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckSquare, ChevronRight } from 'lucide-react'

interface BCContact { id: string; contactNo: string; name: string }

const TASK_TYPES = ['Phone Call', 'Meeting', 'E-Mail', 'Follow-Up', 'Demo', 'Other']

export default function NewTaskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<BCContact[]>([])
  const [form, setForm] = useState({
    description: '',
    taskType: 'Phone Call',
    contactId: searchParams?.get('contactId') ?? '',
    taskDate: new Date().toISOString().slice(0, 10),
    status: 'Open',
    priority: 'Normal',
    salesperson: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/crm/contacts').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : []))
  }, [])

  function set(k: keyof typeof form) { return (v: string) => setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.description.trim()) { setError('Description is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description,
          taskType: form.taskType,
          contactId: form.contactId || null,
          taskDate: form.taskDate || null,
          status: form.status,
          priority: form.priority,
          salesperson: form.salesperson || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return }
      router.push(`/crm/tasks`)
    } catch {
      setError('Network error'); setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/crm/tasks" className="hover:text-zinc-300 transition-colors">Tasks</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">New Task</span>
      </div>

      <div className="px-6 pt-2 pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-semibold text-white">New Task</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/crm/tasks"
            className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-700 rounded transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-3 px-4 py-2 bg-red-900/30 border border-red-800/50 rounded text-red-400 text-sm">{error}</div>
      )}

      <div className="px-6 py-5 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="md:col-span-2">
            <label className="text-[11px] text-zinc-400 mb-1 block">Description *</label>
            <input value={form.description} onChange={e => set('description')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Task Type</label>
            <select value={form.taskType} onChange={e => set('taskType')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
              {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Contact</label>
            <select value={form.contactId} onChange={e => set('contactId')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
              <option value="">— None —</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Date</label>
            <input type="date" value={form.taskDate} onChange={e => set('taskDate')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Priority</label>
            <select value={form.priority} onChange={e => set('priority')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
              <option>High</option>
              <option>Normal</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
              <option>Open</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Salesperson Code</label>
            <input value={form.salesperson} onChange={e => set('salesperson')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
