'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, GitBranch, Plus, Trash2 } from 'lucide-react'

interface WorkCenter { id: string; code: string; name: string }

interface RoutingLine {
  operationNo: string
  description: string
  workCenterId: string
  setupTime: string
  runTime: string
  waitTime: string
  moveTime: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'
const cellInputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500'

const emptyLine = (idx: number): RoutingLine => ({
  operationNo: String((idx + 1) * 10).padStart(3, '0'),
  description: '',
  workCenterId: '',
  setupTime: '0',
  runTime: '0',
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
    fetch('/api/manufacturing/work-centers').then(r => r.json()).then(setWorkCenters)
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
    const validLines = lines.filter(l => l.operationNo && l.description && l.workCenterId)
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
    <>
      <TopBar title="New Routing" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/manufacturing/routings"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Routings
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-zinc-400" />
                  Routing Header
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                    <input type="text" value={form.description} onChange={set('description')} placeholder="Widget Assembly Routing" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.type} onChange={set('type')} className={inputCls}>
                      <option value="serial">Serial</option>
                      <option value="parallel">Parallel</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operations Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-zinc-400" />
                  Operations
                  <button
                    type="button"
                    onClick={addLine}
                    className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Operation
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Op #', 'Description', 'Work Center', 'Setup (h)', 'Run (h)', 'Wait (h)', 'Move (h)', ''].map(h => (
                          <th key={h} className="text-left px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr key={idx} className="border-b border-zinc-800/50 last:border-0">
                          <td className="px-3 py-2 w-20">
                            <input type="text" value={line.operationNo} onChange={e => setLine(idx, 'operationNo', e.target.value)} className={cellInputCls} placeholder="010" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="text" value={line.description} onChange={e => setLine(idx, 'description', e.target.value)} className={cellInputCls} placeholder="Weld frame…" />
                          </td>
                          <td className="px-3 py-2 w-48">
                            <select value={line.workCenterId} onChange={e => setLine(idx, 'workCenterId', e.target.value)} className={cellInputCls}>
                              <option value="">Select…</option>
                              {workCenters.map(wc => (
                                <option key={wc.id} value={wc.id}>{wc.code} — {wc.name}</option>
                              ))}
                            </select>
                          </td>
                          {(['setupTime', 'runTime', 'waitTime', 'moveTime'] as const).map(field => (
                            <td key={field} className="px-3 py-2 w-20">
                              <input type="number" min="0" step="0.01" value={line[field]} onChange={e => setLine(idx, field, e.target.value)} className={cellInputCls} />
                            </td>
                          ))}
                          <td className="px-3 py-2 w-10">
                            {lines.length > 1 && (
                              <button type="button" onClick={() => removeLine(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-2">
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add operation
                  </button>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/manufacturing/routings">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Creating…' : 'Create Routing'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
