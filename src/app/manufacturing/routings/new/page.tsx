'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, GitBranch, Plus, Trash2 } from 'lucide-react'

interface WorkCenter { id: string; code: string; name: string }

interface RoutingLine {
  operationNo: string
  description: string
  workCenterId: string
  machineCenterId: string
  setupTime: string
  runTime: string
  waitTime: string
  moveTime: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'
const cellInputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500'
const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

const emptyLine = (idx: number): RoutingLine => ({
  operationNo: String((idx + 1) * 10).padStart(3, '0'),
  description: '',
  workCenterId: '',
  machineCenterId: '',
  setupTime: '0',
  runTime: '1',
  waitTime: '0',
  moveTime: '0',
})

export default function NewRoutingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [form, setForm] = useState({ description: '', type: 'serial' })
  const [lines, setLines] = useState<RoutingLine[]>([emptyLine(0)])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    fetch('/api/manufacturing/work-centers').then(r => r.json()).then(data => {
      setWorkCenters(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [])

  const setLine = (idx: number, k: keyof RoutingLine, value: string) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [k]: value } : l))
  }

  const addLine = () => setLines(prev => [...prev, emptyLine(prev.length)])
  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }
    const validLines = lines.filter(l => l.operationNo && l.workCenterId)
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/manufacturing/routings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          type: form.type,
          lines: validLines.map(l => ({
            operationNo: l.operationNo,
            description: l.description,
            workCenterId: l.workCenterId,
            setupTime: parseFloat(l.setupTime) || 0,
            runTime: parseFloat(l.runTime) || 0,
            waitTime: parseFloat(l.waitTime) || 0,
            moveTime: parseFloat(l.moveTime) || 0,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/manufacturing/routings/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Routing" />
      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-5">

          <Link
            href="/manufacturing/routings"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Routings
          </Link>

          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">New Routing</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className={sectionCls}>
              <div className={tabHeaderCls}>
                <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                Header
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Widget Assembly Routing"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.type} onChange={set('type')} className={inputCls}>
                    <option value="serial">Serial</option>
                    <option value="parallel">Parallel</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Operations Lines */}
            <div className={sectionCls}>
              <div className={tabHeaderCls}>
                <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                Lines
                <button
                  type="button"
                  onClick={addLine}
                  className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Operation
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      {['Operation No.', 'Work Center', 'Machine Center', 'Setup Time', 'Run Time', 'Wait Time', ''].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] uppercase text-zinc-600 font-medium tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => (
                      <tr key={idx} className="border-b border-zinc-800/30 last:border-0">
                        <td className="px-3 py-2 w-28">
                          <input
                            type="text"
                            value={line.operationNo}
                            onChange={e => setLine(idx, 'operationNo', e.target.value)}
                            placeholder="010"
                            className={cellInputCls}
                          />
                        </td>
                        <td className="px-3 py-2 min-w-[160px]">
                          <select
                            value={line.workCenterId}
                            onChange={e => setLine(idx, 'workCenterId', e.target.value)}
                            className={cellInputCls}
                          >
                            <option value="">Select…</option>
                            {workCenters.map(wc => (
                              <option key={wc.id} value={wc.id}>{wc.code} — {wc.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 min-w-[140px]">
                          <input
                            type="text"
                            value={line.machineCenterId}
                            onChange={e => setLine(idx, 'machineCenterId', e.target.value)}
                            placeholder="MC-001"
                            className={cellInputCls}
                          />
                        </td>
                        {(['setupTime', 'runTime', 'waitTime'] as const).map(field => (
                          <td key={field} className="px-3 py-2 w-24">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line[field]}
                              onChange={e => setLine(idx, field, e.target.value)}
                              className={cellInputCls}
                            />
                          </td>
                        ))}
                        <td className="px-3 py-2 w-10">
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t border-zinc-800/30">
                <button
                  type="button"
                  onClick={addLine}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add operation
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/manufacturing/routings"
                className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
              >
                {loading ? 'Creating…' : 'Create Routing'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
