'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, ListChecks, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'

type Job = { id: string; jobNo: string; description: string }
type JobTask = {
  id: string; jobId: string; taskNo: string; description: string; taskType: string
  percentComplete: number; scheduleTotalCost: number; usageTotalCost: number
}

const TASK_TYPES = ['Posting', 'Heading', 'Total', 'Begin-Total', 'End-Total']
const TASK_TYPE_COLOR: Record<string, string> = {
  Posting:     'bg-blue-500/20 text-blue-400',
  Heading:     'bg-purple-500/20 text-purple-400',
  Total:       'bg-amber-500/20 text-amber-400',
  'Begin-Total': 'bg-zinc-700/40 text-zinc-400',
  'End-Total': 'bg-zinc-700/40 text-zinc-400',
}

export default function JobTasksPage() {
  const params = useParams<{ id: string }>()
  const jobId = params.id
  const [job, setJob] = useState<Job | null>(null)
  const [tasks, setTasks] = useState<JobTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    taskNo: '', description: '', taskType: 'Posting',
    percentComplete: '0', scheduleTotalCost: '0', usageTotalCost: '0',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [jRes, tRes] = await Promise.all([
          fetch(`/api/projects/jobs/${jobId}`),
          fetch(`/api/projects/jobs/${jobId}/tasks`),
        ])
        if (jRes.ok) setJob(await jRes.json())
        if (tRes.ok) setTasks(await tRes.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [jobId])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.taskNo.trim() || !form.description.trim()) { setError('Task No and Description are required'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`/api/projects/jobs/${jobId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskNo: form.taskNo.trim(),
          description: form.description.trim(),
          taskType: form.taskType,
          percentComplete: parseFloat(form.percentComplete) || 0,
          scheduleTotalCost: parseFloat(form.scheduleTotalCost) || 0,
          usageTotalCost: parseFloat(form.usageTotalCost) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setTasks(prev => [...prev, data])
      setForm({ taskNo: '', description: '', taskType: 'Posting', percentComplete: '0', scheduleTotalCost: '0', usageTotalCost: '0' })
      setShowForm(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50'
  const labelCls = 'block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

  return (
    <>
      <TopBar title="Job Tasks" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] space-y-4">
        <Link href={`/projects/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {job ? `Back to ${job.jobNo}` : 'Back to Job'}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-zinc-100 flex items-center gap-2">
              <ListChecks className="w-4.5 h-4.5 text-zinc-400" /> Job Tasks
            </h2>
            {job && <p className="text-[11px] text-zinc-500 mt-0.5">{job.jobNo} — {job.description}</p>}
          </div>
          <Button size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5 bg-blue-600 hover:bg-blue-500">
            <Plus className="w-3.5 h-3.5" /> Add Task
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        {showForm && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-[13px] font-semibold text-zinc-200 mb-4">New Job Task</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Task No. *</label>
                <input type="text" value={form.taskNo} onChange={set('taskNo')} placeholder="e.g. 1000" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description *</label>
                <input type="text" value={form.description} onChange={set('description')} placeholder="Task description…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Job Task Type</label>
                <select value={form.taskType} onChange={set('taskType')} className={inputCls}>
                  {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>% Complete</label>
                <input type="number" min="0" max="100" step="0.1" value={form.percentComplete} onChange={set('percentComplete')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Schedule Total Cost</label>
                <input type="number" min="0" step="0.01" value={form.scheduleTotalCost} onChange={set('scheduleTotalCost')} className={inputCls} />
              </div>
              {error && <div className="col-span-full text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>}
              <div className="col-span-full flex items-center gap-3 pt-1">
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-500">
                  {submitting ? 'Adding…' : 'Add Task'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-zinc-600 text-sm">Loading…</div>
          ) : tasks.length === 0 ? (
            <div className="py-10 text-center text-zinc-600 text-sm">No tasks yet. Click "Add Task" to begin.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Job Task No.', 'Description', 'Job Task Type', '% Complete', 'Schedule Total Cost', 'Usage Total Cost'].map(h => (
                      <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${['Job Task No.', 'Description'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{task.taskNo}</td>
                      <td className="px-4 py-3 text-[13px] text-zinc-100 max-w-[220px] truncate">{task.description}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${TASK_TYPE_COLOR[task.taskType] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                          {task.taskType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] text-zinc-300 tabular-nums">{Number(task.percentComplete).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right text-[12px] text-zinc-400 tabular-nums">{formatCurrency(Number(task.scheduleTotalCost))}</td>
                      <td className="px-4 py-3 text-right text-[12px] text-emerald-400 tabular-nums">{formatCurrency(Number(task.usageTotalCost))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
