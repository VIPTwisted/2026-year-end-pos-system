'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckSquare, Plus, Search, ChevronRight } from 'lucide-react'

interface BCCrmTask {
  id: string; taskNo: string; description: string; taskType: string
  contactId: string | null; contactName: string | null
  taskDate: string | null; status: string; priority: string; salesperson: string | null
}

const PRIORITIES = ['', 'High', 'Normal', 'Low']
const STATUSES = ['', 'Open', 'Completed']
const TASK_TYPES = ['', 'Phone Call', 'Meeting', 'E-Mail', 'Follow-Up', 'Other']

const PRIORITY_COLOR: Record<string, string> = {
  High: 'bg-red-500/20 text-red-400',
  Normal: 'bg-yellow-500/20 text-yellow-400',
  Low: 'bg-zinc-700 text-zinc-400',
}

export default function TasksClient() {
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<BCCrmTask[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [salesperson, setSalesperson] = useState('')
  const [contactId, setContactId] = useState(searchParams?.get('contactId') ?? '')

  const load = useCallback(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (status) q.set('status', status)
    if (priority) q.set('priority', priority)
    if (salesperson) q.set('salesperson', salesperson)
    if (contactId) q.set('contactId', contactId)
    fetch(`/api/crm/tasks?${q}`)
      .then(r => r.json())
      .then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, status, priority, salesperson, contactId])

  useEffect(() => { load() }, [load])

  async function toggleComplete(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'Open' ? 'Completed' : 'Open'
    await fetch('/api/crm/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'patch', id, status: newStatus }),
    })
    load()
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-5 pb-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-semibold text-white">Tasks</h1>
            <span className="text-zinc-500 text-sm">({rows.length})</span>
          </div>
          <Link href="/crm/tasks/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Task
          </Link>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-zinc-800 flex gap-3 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-52 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 pl-8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Priorities</option>
          {PRIORITIES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={salesperson} onChange={e => setSalesperson(e.target.value)}
          placeholder="Salesperson"
          className="w-32 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
        <input value={contactId} onChange={e => setContactId(e.target.value)}
          placeholder="Contact ID"
          className="w-36 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500" />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
            <tr className="text-zinc-400 text-[11px] uppercase tracking-wide">
              <th className="px-4 py-2.5 text-left w-8"></th>
              <th className="px-4 py-2.5 text-left">No.</th>
              <th className="px-4 py-2.5 text-left">Description</th>
              <th className="px-4 py-2.5 text-left">Type</th>
              <th className="px-4 py-2.5 text-left">Contact</th>
              <th className="px-4 py-2.5 text-left">Date</th>
              <th className="px-4 py-2.5 text-left">Status</th>
              <th className="px-4 py-2.5 text-left">Priority</th>
              <th className="px-4 py-2.5 text-left">Salesperson</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading && <tr><td colSpan={10} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-zinc-500">No tasks found</td></tr>}
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-zinc-900/80 transition-colors">
                <td className="px-4 py-2.5">
                  <button onClick={() => toggleComplete(row.id, row.status)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${row.status === 'Completed' ? 'bg-green-500 border-green-500' : 'border-zinc-600 hover:border-indigo-400'}`}>
                    {row.status === 'Completed' && <span className="text-white text-[10px]">✓</span>}
                  </button>
                </td>
                <td className="px-4 py-2.5 font-mono text-indigo-400">{row.taskNo}</td>
                <td className="px-4 py-2.5 text-white font-medium">{row.description}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.taskType}</td>
                <td className="px-4 py-2.5">
                  {row.contactName ? (
                    <Link href={`/crm/contacts/${row.contactId}`} className="text-indigo-400 hover:underline">{row.contactName}</Link>
                  ) : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.taskDate ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${row.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_COLOR[row.priority] ?? 'bg-zinc-700 text-zinc-400'}`}>
                    {row.priority}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{row.salesperson ?? '—'}</td>
                <td className="px-3 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-zinc-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
