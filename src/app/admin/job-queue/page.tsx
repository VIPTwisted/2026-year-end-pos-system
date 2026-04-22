'use client'

import { useEffect, useState } from 'react'
import { Clock, Plus, RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobEntry {
  id: string
  jobCode: string
  description: string
  objectType: string
  objectId?: string | null
  status: string
  nextRunAt?: string | null
  lastRunAt?: string | null
  recurringJob: boolean
  recurrenceType?: string | null
  recurrenceValue?: number | null
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  ready:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  running:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse',
  on_hold:   'bg-zinc-700/30 text-zinc-500 border-zinc-700/40',
  error:     'bg-red-500/10 text-red-400 border-red-500/20',
  finished:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  ready: 'Ready', running: 'In Process', on_hold: 'On Hold', error: 'Error', finished: 'Finished',
}

export default function JobQueuePage() {
  const [jobs, setJobs] = useState<JobEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)
  const [newForm, setNewForm] = useState({ jobCode: '', description: '', objectType: 'Codeunit', objectId: '', status: 'on_hold' })

  async function load() {
    setLoading(true)
    const data = await fetch('/api/admin/job-queue').then(r => r.json())
    setJobs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createJob() {
    const res = await fetch('/api/admin/job-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    if (res.ok) { setShowNew(false); setNewForm({ jobCode: '', description: '', objectType: 'Codeunit', objectId: '', status: 'on_hold' }); load() }
  }

  async function setStatus(id: string, status: string) {
    await fetch('/api/admin/job-queue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
    setStatusDropdown(null)
  }

  async function runNow(id: string) {
    await fetch('/api/admin/job-queue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'running', lastRunAt: new Date().toISOString() }),
    })
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'running' } : j))
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]" onClick={() => setStatusDropdown(null)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">Job Queue Entries</h1>
            <p className="text-[11px] text-zinc-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
            <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </div>

      {/* New Job Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={e => e.stopPropagation()}>
          <div className="w-full max-w-md rounded-xl p-6" style={{ background: '#0f1230', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">New Job Queue Entry</h2>
            {[
              { label: 'Job Code *', key: 'jobCode', placeholder: 'SEND-EMAIL' },
              { label: 'Description *', key: 'description', placeholder: 'Send pending emails' },
              { label: 'Object ID', key: 'objectId', placeholder: '50001' },
            ].map(f => (
              <div key={f.key} className="mb-3">
                <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                <input value={(newForm as any)[f.key]} onChange={e => setNewForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-1">Object Type</label>
              <select value={newForm.objectType} onChange={e => setNewForm(p => ({ ...p, objectType: e.target.value }))}
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                {['Codeunit','Report','XMLport'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded">Cancel</button>
              <button onClick={createJob} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              {['Object Type','Object ID','Description','Status','Next Run','Recurrence','Last Run','Actions'].map((h, i) => (
                <th key={i} className={`pb-2 font-medium uppercase tracking-widest ${i === 7 ? 'text-right' : 'text-left'} pr-4`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading && (
              <tr><td colSpan={8} className="py-6 text-center text-zinc-600 text-xs animate-pulse">Loading…</td></tr>
            )}
            {!loading && jobs.length === 0 && (
              <tr><td colSpan={8} className="py-6 text-center text-zinc-600">No job queue entries.</td></tr>
            )}
            {jobs.map(j => (
              <tr key={j.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="py-2.5 pr-4 text-zinc-400">{j.objectType}</td>
                <td className="py-2.5 pr-4 font-mono text-zinc-400">{j.objectId ?? '—'}</td>
                <td className="py-2.5 pr-4 text-zinc-200 max-w-[200px] truncate">{j.description}</td>
                <td className="py-2.5 pr-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${STATUS_STYLES[j.status] ?? STATUS_STYLES.on_hold}`}>
                    {STATUS_LABELS[j.status] ?? j.status}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-zinc-400">
                  {j.nextRunAt ? new Date(j.nextRunAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </td>
                <td className="py-2.5 pr-4 text-zinc-400">
                  {j.recurringJob && j.recurrenceType ? `${j.recurrenceValue} ${j.recurrenceType}` : '—'}
                </td>
                <td className="py-2.5 pr-4 text-zinc-400">
                  {j.lastRunAt ? new Date(j.lastRunAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </td>
                <td className="py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    {/* Set Status dropdown */}
                    <div className="relative">
                      <button onClick={() => setStatusDropdown(statusDropdown === j.id ? null : j.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
                        Status <ChevronDown className="w-3 h-3" />
                      </button>
                      {statusDropdown === j.id && (
                        <div className="absolute right-0 top-7 z-20 w-32 rounded-lg overflow-hidden shadow-xl" style={{ background: '#0f1230', border: '1px solid rgba(99,102,241,0.2)' }}>
                          {[['ready','Ready'],['on_hold','On Hold']].map(([v, l]) => (
                            <button key={v} onClick={() => setStatus(j.id, v)}
                              className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">{l}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => runNow(j.id)}
                      className="px-2 py-1 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
                      Run
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
