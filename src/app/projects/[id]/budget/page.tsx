'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, Plus, DollarSign } from 'lucide-react'

type BudgetLine = {
  id:           string
  projectId:    string
  taskId:       string | null
  lineType:     string
  description:  string
  quantity:     number
  unitAmount:   number
  budgetAmount: number
  period:       string | null
  createdAt:    string
}

type LedgerEntry = {
  id:         string
  totalCost:  number
  totalPrice: number
  entryType:  string
}

type Project = {
  id:             string
  projectNo:      string
  description:    string
  budgetAmount:   number
  contractAmount: number
  ledgerEntries:  LedgerEntry[]
}

const LINE_TYPE_LABEL: Record<string, string> = {
  time:     'Time',
  expense:  'Expense',
  material: 'Material',
  other:    'Other',
}

const LINE_TYPE_COLOR: Record<string, string> = {
  time:     'bg-blue-500/20 text-blue-400',
  expense:  'bg-amber-500/20 text-amber-400',
  material: 'bg-emerald-500/20 text-emerald-400',
  other:    'bg-zinc-700/40 text-zinc-400',
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item)
    ;(acc[k] = acc[k] ?? []).push(item)
    return acc
  }, {} as Record<string, T[]>)
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wide'

export default function ProjectBudgetPage() {
  const { id } = useParams<{ id: string }>()

  const [project, setProject]     = useState<Project | null>(null)
  const [lines, setLines]         = useState<BudgetLine[]>([])
  const [loadingPage, setLoadingPage] = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [showForm, setShowForm]   = useState(false)

  const [form, setForm] = useState({
    description: '',
    lineType:    'time',
    quantity:    '',
    unitAmount:  '',
    period:      '',
  })

  const loadData = useCallback(async () => {
    try {
      const [projRes, budgetRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/budget`),
      ])
      const projData   = await projRes.json()
      const budgetData = await budgetRes.json()
      setProject(projData)
      setLines(budgetData)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoadingPage(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { setError('Description is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/projects/${id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          lineType:    form.lineType,
          quantity:    parseFloat(form.quantity)   || 0,
          unitAmount:  parseFloat(form.unitAmount) || 0,
          period:      form.period.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      setLines(prev => [...prev, data])
      setForm({ description: '', lineType: 'time', quantity: '', unitAmount: '', period: '' })
      setShowForm(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  if (loadingPage) {
    return (
      <>
        <TopBar title="Project Budget" />
        <main className="flex-1 p-6 overflow-auto">
          <p className="text-sm text-zinc-500">Loading…</p>
        </main>
      </>
    )
  }

  if (!project) {
    return (
      <>
        <TopBar title="Project Budget" />
        <main className="flex-1 p-6 overflow-auto">
          <p className="text-sm text-red-400">Project not found.</p>
        </main>
      </>
    )
  }

  const totalBudget    = lines.reduce((s, l) => s + Number(l.budgetAmount), 0)
  const totalActual    = (project.ledgerEntries ?? []).reduce((s, e) => s + Number(e.totalCost), 0)
  const variance       = totalBudget - totalActual
  const grouped        = groupBy(lines, l => l.lineType)
  const lineTypes      = ['time', 'expense', 'material', 'other'].filter(t => grouped[t]?.length > 0 || true)
  const existingTypes  = Object.keys(grouped)

  return (
    <>
      <TopBar title={`Budget — ${project.projectNo}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link href="/projects" className="hover:text-zinc-300 transition-colors">Projects</Link>
            <span>/</span>
            <Link href={`/projects/${id}`} className="text-blue-400 hover:underline">{project.projectNo}</Link>
            <span>/</span>
            <span className="text-zinc-300">Budget</span>
          </div>

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Project Operations</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Project Budget</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/projects/${id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <ArrowLeft className="w-3 h-3" />
                  Back to Project
                </Button>
              </Link>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5" onClick={() => setShowForm(v => !v)}>
                <Plus className="w-3.5 h-3.5" />
                Add Line
              </Button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Budget',  value: formatCurrency(totalBudget),                                  color: 'text-zinc-100' },
              { label: 'Actual Spend',  value: formatCurrency(totalActual),                                   color: 'text-amber-400' },
              { label: 'Variance',      value: formatCurrency(variance),                                      color: variance >= 0 ? 'text-emerald-400' : 'text-red-400' },
              { label: 'Budget Lines',  value: lines.length.toString(),                                       color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[20px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Add budget line form */}
          {showForm && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs font-medium text-zinc-300 uppercase tracking-wide mb-4">Add Budget Line</p>
              <form onSubmit={handleAddLine}>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                    <input type="text" value={form.description} onChange={set('description')} placeholder="e.g. Developer hours" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.lineType} onChange={set('lineType')} className={inputCls}>
                      <option value="time">Time</option>
                      <option value="expense">Expense</option>
                      <option value="material">Material</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Quantity</label>
                    <input type="number" value={form.quantity} onChange={set('quantity')} placeholder="0" min="0" step="any" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit Amount</label>
                    <input type="number" value={form.unitAmount} onChange={set('unitAmount')} placeholder="0.00" min="0" step="0.01" className={inputCls} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Period (optional)</label>
                    <input type="text" value={form.period} onChange={set('period')} placeholder="e.g. Q1 2026" className={inputCls} />
                  </div>
                  <div className="sm:col-span-3 flex items-end justify-end gap-2 pb-0">
                    {error && <span className="text-xs text-red-400">{error}</span>}
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); setError('') }}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={saving} className="bg-blue-600 hover:bg-blue-500">
                      {saving ? 'Adding…' : 'Add Line'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Budget lines grouped by type */}
          {lines.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12 text-zinc-600">
              <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-[13px] text-zinc-500 mb-4">No budget lines yet.</p>
              <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500" onClick={() => setShowForm(true)}>
                <Plus className="w-3.5 h-3.5" /> Add Budget Line
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {existingTypes.map(type => {
                const typeLines = grouped[type] ?? []
                const typeTotal = typeLines.reduce((s, l) => s + Number(l.budgetAmount), 0)
                return (
                  <div key={type} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                    {/* Group header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${LINE_TYPE_COLOR[type] ?? 'bg-zinc-700/40 text-zinc-400'}`}>
                          {LINE_TYPE_LABEL[type] ?? type}
                        </span>
                        <span className="text-[10px] text-zinc-600">({typeLines.length} {typeLines.length === 1 ? 'line' : 'lines'})</span>
                      </div>
                      <span className="text-sm font-semibold text-zinc-300 tabular-nums">{formatCurrency(typeTotal)}</span>
                    </div>
                    {/* Lines */}
                    <table className="w-full">
                      <thead className="bg-zinc-900/30">
                        <tr>
                          {['Description', 'Quantity', 'Unit Amount', 'Budget', 'Period'].map(h => (
                            <th key={h} className={`px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${h === 'Description' ? 'text-left' : 'text-right'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40">
                        {typeLines.map(line => (
                          <tr key={line.id} className="hover:bg-zinc-800/20 transition-colors">
                            <td className="px-4 py-2.5 text-[13px] text-zinc-200">{line.description}</td>
                            <td className="px-4 py-2.5 text-right text-xs text-zinc-400 tabular-nums">{Number(line.quantity)}</td>
                            <td className="px-4 py-2.5 text-right text-xs text-zinc-400 tabular-nums">{formatCurrency(Number(line.unitAmount))}</td>
                            <td className="px-4 py-2.5 text-right text-sm font-semibold text-emerald-400 tabular-nums">{formatCurrency(Number(line.budgetAmount))}</td>
                            <td className="px-4 py-2.5 text-right text-xs text-zinc-500">{line.period ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })}

              {/* Grand total */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
                <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">Budget Summary</span>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    { label: 'Total Budget',  value: totalBudget,  color: 'text-zinc-100' },
                    { label: 'Actual Spend',  value: totalActual,  color: 'text-amber-400' },
                    { label: 'Variance',      value: variance,     color: variance >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}</span>
                      <span className={`font-bold tabular-nums ${color}`}>{formatCurrency(value)}</span>
                    </div>
                  ))}
                  {totalBudget > 0 && (
                    <div className="pt-2 border-t border-zinc-800/60">
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                        <span>Budget consumed</span>
                        <span>{Math.min(100, Math.round((totalActual / totalBudget) * 100))}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            totalActual > totalBudget ? 'bg-red-500' : totalActual / totalBudget > 0.8 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, (totalActual / totalBudget) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
