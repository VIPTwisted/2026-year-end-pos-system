'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'

type Job = { id: string; jobNo: string; description: string }
type JobTask = { id: string; taskNo: string; description: string }
type PlanningLine = {
  id: string; lineType: string; entryType: string; resourceNo: string | null
  description: string | null; planningDate: string | null; quantity: number
  unitPrice: number; totalPrice: number; taskNo: string | null
}

const LINE_TYPES = ['Budget', 'Billable', 'Both Budget and Billable']
const ENTRY_TYPES = ['Resource', 'Item', 'G/L Account']

const LINE_TYPE_COLOR: Record<string, string> = {
  Budget:                  'bg-blue-500/20 text-blue-400',
  Billable:                'bg-emerald-500/20 text-emerald-400',
  'Both Budget and Billable': 'bg-amber-500/20 text-amber-400',
}

export default function PlanningLinesPage() {
  const params = useParams<{ id: string }>()
  const jobId = params.id
  const [job, setJob] = useState<Job | null>(null)
  const [tasks, setTasks] = useState<JobTask[]>([])
  const [lines, setLines] = useState<PlanningLine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    taskId: '', lineType: 'Budget', entryType: 'Resource',
    resourceNo: '', description: '', planningDate: '',
    quantity: '1', unitPrice: '0', totalPrice: '0',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [jRes, tRes, lRes] = await Promise.all([
          fetch(`/api/projects/jobs/${jobId}`),
          fetch(`/api/projects/jobs/${jobId}/tasks`),
          fetch(`/api/projects/jobs/${jobId}/planning`),
        ])
        if (jRes.ok) setJob(await jRes.json())
        if (tRes.ok) setTasks(await tRes.json())
        if (lRes.ok) setLines(await lRes.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [jobId])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.value
      setForm(prev => {
        const next = { ...prev, [k]: val }
        if (k === 'quantity' || k === 'unitPrice') {
          const qty = parseFloat(k === 'quantity' ? val : prev.quantity) || 0
          const up = parseFloat(k === 'unitPrice' ? val : prev.unitPrice) || 0
          next.totalPrice = (qty * up).toFixed(2)
        }
        return next
      })
    }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`/api/projects/jobs/${jobId}/planning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: form.taskId || undefined,
          lineType: form.lineType,
          entryType: form.entryType,
          resourceNo: form.resourceNo || undefined,
          description: form.description || undefined,
          planningDate: form.planningDate || undefined,
          quantity: parseFloat(form.quantity) || 1,
          unitPrice: parseFloat(form.unitPrice) || 0,
          totalPrice: parseFloat(form.totalPrice) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setLines(prev => [...prev, data])
      setForm({ taskId: '', lineType: 'Budget', entryType: 'Resource', resourceNo: '', description: '', planningDate: '', quantity: '1', unitPrice: '0', totalPrice: '0' })
      setShowForm(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const totalBudget = lines.filter(l => l.lineType === 'Budget' || l.lineType === 'Both Budget and Billable').reduce((s, l) => s + Number(l.totalPrice), 0)
  const totalBillable = lines.filter(l => l.lineType === 'Billable' || l.lineType === 'Both Budget and Billable').reduce((s, l) => s + Number(l.totalPrice), 0)

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50'
  const labelCls = 'block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

  return (
    <>
      <TopBar title="Planning Lines" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] space-y-4">
        <Link href={`/projects/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {job ? `Back to ${job.jobNo}` : 'Back to Job'}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-zinc-100 flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-zinc-400" /> Planning Lines
            </h2>
            {job && <p className="text-[11px] text-zinc-500 mt-0.5">{job.jobNo} — {job.description}</p>}
          </div>
          <Button size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5 bg-blue-600 hover:bg-blue-500">
            <Plus className="w-3.5 h-3.5" /> Add Line
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Lines', value: lines.length.toString(), color: 'text-zinc-200' },
            { label: 'Budget Total', value: formatCurrency(totalBudget), color: 'text-blue-400' },
            { label: 'Billable Total', value: formatCurrency(totalBillable), color: 'text-emerald-400' },
            { label: 'Combined', value: formatCurrency(totalBudget + totalBillable), color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
              <p className={`text-[18px] font-bold tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-[13px] font-semibold text-zinc-200 mb-4">New Planning Line</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Type</label>
                <select value={form.entryType} onChange={set('entryType')} className={inputCls}>
                  {ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>No.</label>
                <input type="text" value={form.resourceNo} onChange={set('resourceNo')} placeholder="Resource/Item No." className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <input type="text" value={form.description} onChange={set('description')} placeholder="Description…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Planning Date</label>
                <input type="date" value={form.planningDate} onChange={set('planningDate')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Job Task</label>
                <select value={form.taskId} onChange={set('taskId')} className={inputCls}>
                  <option value="">— No task —</option>
                  {tasks.map(t => <option key={t.id} value={t.id}>{t.taskNo} — {t.description}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Line Type</label>
                <select value={form.lineType} onChange={set('lineType')} className={inputCls}>
                  {LINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Quantity</label>
                <input type="number" min="0" step="0.01" value={form.quantity} onChange={set('quantity')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Unit Price</label>
                <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={set('unitPrice')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Total Price</label>
                <input type="number" min="0" step="0.01" value={form.totalPrice} onChange={set('totalPrice')} className={inputCls} />
              </div>
              {error && <div className="col-span-full text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>}
              <div className="col-span-full flex items-center gap-3 pt-1">
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-500">
                  {submitting ? 'Adding…' : 'Add Line'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-zinc-600 text-sm">Loading…</div>
          ) : lines.length === 0 ? (
            <div className="py-10 text-center text-zinc-600 text-sm">No planning lines yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Type', 'No.', 'Description', 'Planning Date', 'Qty', 'Unit Price', 'Total Price', 'Line Type'].map(h => (
                      <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${['Type', 'No.', 'Description'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {lines.map(line => (
                    <tr key={line.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 text-[11px] text-zinc-400">{line.entryType}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{line.resourceNo || '—'}</td>
                      <td className="px-4 py-3 text-[12px] text-zinc-100 max-w-[180px] truncate">{line.description || '—'}</td>
                      <td className="px-4 py-3 text-right text-[11px] text-zinc-500">{line.planningDate || '—'}</td>
                      <td className="px-4 py-3 text-right text-[12px] text-zinc-300 tabular-nums">{Number(line.quantity)}</td>
                      <td className="px-4 py-3 text-right text-[12px] text-zinc-400 tabular-nums">{formatCurrency(Number(line.unitPrice))}</td>
                      <td className="px-4 py-3 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">{formatCurrency(Number(line.totalPrice))}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-medium ${LINE_TYPE_COLOR[line.lineType] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                          {line.lineType}
                        </span>
                      </td>
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
