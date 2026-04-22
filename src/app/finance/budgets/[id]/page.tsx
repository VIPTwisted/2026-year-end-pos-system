'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, RefreshCw } from 'lucide-react'

interface GridRow { accountId: string; accountNo: string; accountName: string; type: string; months: number[]; annual: number }

interface Budget { id: string; code: string; name: string; fiscalYear: string; status: string; description: string | null }

interface GridResponse { budget: Budget; grid: GridRow[] }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmt(n: number): string {
  if (n === 0) return ''
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function parse(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}

export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data,    setData]    = useState<GridResponse | null>(null)
  const [grid,    setGrid]    = useState<GridRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [dirty,   setDirty]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/finance/budgets/${id}`)
      const json: GridResponse = await res.json()
      setData(json); setGrid(json.grid.map(r => ({ ...r, months: [...r.months] }))); setDirty(false)
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const updateCell = (rowIdx: number, monthIdx: number, value: string) => {
    setGrid(prev => {
      const next = prev.map((r, i) => {
        if (i !== rowIdx) return r
        const months = [...r.months]
        months[monthIdx] = parse(value)
        return { ...r, months, annual: months.reduce((s, v) => s + v, 0) }
      })
      return next
    })
    setDirty(true)
  }

  const save = async () => {
    setSaving(true)
    const entries: { accountId: string; periodNumber: number; budgetAmount: number }[] = []
    for (const row of grid) {
      for (let m = 0; m < 12; m++) {
        if (row.months[m] !== 0) entries.push({ accountId: row.accountId, periodNumber: m + 1, budgetAmount: row.months[m] })
      }
    }
    await fetch(`/api/finance/budgets/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    })
    setSaving(false); setDirty(false)
  }

  const STATUS_BADGE: Record<string, string> = {
    draft: 'bg-zinc-700 text-zinc-400', active: 'bg-emerald-500/10 text-emerald-400', closed: 'bg-red-500/10 text-red-400',
  }

  const monthTotals = MONTHS.map((_, mi) => grid.reduce((s, r) => s + r.months[mi], 0))
  const grandTotal  = monthTotals.reduce((s, v) => s + v, 0)

  const actions = (
    <div className="flex items-center gap-2">
      <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded transition-colors" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
      </button>
      <button onClick={save} disabled={saving || !dirty} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium rounded transition-colors disabled:opacity-40">
        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )

  return (
    <>
      <TopBar title={data?.budget.name ?? 'Budget Detail'} breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Budgets', href: '/finance/budgets' }]} actions={actions} />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
        {loading && <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center"><RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" /></div>}

        {!loading && data && (
          <>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Budget Code</p>
                  <p className="text-[14px] font-semibold text-zinc-100">{data.budget.code}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Fiscal Year</p>
                  <p className="text-[13px] text-zinc-300">{data.budget.fiscalYear}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[data.budget.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{data.budget.status}</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Total Budget</p>
                  <p className="text-[14px] font-bold text-indigo-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(grandTotal)}
                  </p>
                </div>
              </div>
              {dirty && (
                <div className="mt-3 flex items-center gap-2 text-[12px] text-amber-400 border-t border-zinc-800/50 pt-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block"></span>
                  Unsaved changes — click <strong>Save Changes</strong> to persist.
                </div>
              )}
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60">
                <span className="text-[13px] font-semibold text-zinc-200">Month-by-Month Budget Grid</span>
                <span className="ml-2 text-[11px] text-zinc-600">{grid.length} accounts · click any cell to edit</span>
              </div>
              <div className="overflow-x-auto">
                <table className="text-[12px] min-w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                      <th className="sticky left-0 z-10 bg-zinc-900/90 text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 min-w-[200px]">Account</th>
                      {MONTHS.map(m => <th key={m} className="px-2 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right min-w-[90px]">{m}</th>)}
                      <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-right min-w-[100px]">Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grid.map((row, ri) => (
                      <tr key={row.accountId} className="border-b border-zinc-800/20"
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="sticky left-0 z-10 px-4 py-1 bg-[#16213e]">
                          <div className="font-mono text-[10px] text-indigo-400/60">{row.accountNo}</div>
                          <div className="text-zinc-300 text-[12px] truncate max-w-[180px]">{row.accountName}</div>
                        </td>
                        {row.months.map((val, mi) => (
                          <td key={mi} className="px-1 py-1">
                            <input type="text" defaultValue={fmt(val)} onBlur={e => updateCell(ri, mi, e.target.value)}
                              className="w-full text-right bg-transparent border border-transparent rounded px-1.5 py-0.5 text-[12px] text-zinc-300 focus:outline-none focus:border-indigo-500 focus:bg-zinc-900 tabular-nums" placeholder="0" />
                          </td>
                        ))}
                        <td className="px-3 py-1 text-right tabular-nums font-semibold text-zinc-200">{fmt(row.annual)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(99,102,241,0.08)' }} className="border-t-2 border-indigo-500/30">
                      <td className="sticky left-0 z-10 px-4 py-2.5 font-semibold text-[12px] text-zinc-200" style={{ background: 'rgba(99,102,241,0.08)' }}>Total</td>
                      {monthTotals.map((t, mi) => <td key={mi} className="px-2 py-2.5 text-right tabular-nums font-semibold text-zinc-100">{fmt(t)}</td>)}
                      <td className="px-3 py-2.5 text-right tabular-nums font-bold text-indigo-300">{fmt(grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
