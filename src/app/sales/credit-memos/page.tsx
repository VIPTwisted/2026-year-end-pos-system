'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronDown, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type SalesCreditMemo = {
  id: string
  creditMemoNo: string
  sellToCustomerName: string | null
  postingDate: string
  dueDate: string | null
  status: string
  totalAmount: number
}

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Released: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  Posted: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
}

const STATUSES = ['All', 'Open', 'Released', 'Posted']

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SalesCreditMemosPage() {
  const [memos, setMemos] = useState<SalesCreditMemo[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)

  const load = useCallback(async (st: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (st !== 'All') params.set('status', st)
      const res = await fetch(`/api/sales/credit-memos?${params}`)
      const data = await res.json()
      setMemos(Array.isArray(data) ? data : [])
    } catch {
      setMemos([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load(status) }, [status, load])

  const filtered = memos.filter(m => {
    if (!search) return true
    const s = search.toLowerCase()
    return m.creditMemoNo.toLowerCase().includes(s) || (m.sellToCustomerName ?? '').toLowerCase().includes(s)
  })

  const toggleSelect = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const allChecked = filtered.length > 0 && selected.length === filtered.length

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      {/* TopBar */}
      <div className="border-b border-zinc-800 bg-[#0f0f1a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/sales" className="hover:text-zinc-200">Sales</Link>
          <span>/</span>
          <span className="text-zinc-200">Sales Credit Memos</span>
        </div>
        <span className="text-xs text-zinc-500">{filtered.length} records</span>
      </div>

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-6 py-3">
        <h1 className="text-base font-semibold text-zinc-100 mb-3">Sales Credit Memos</h1>
        <div className="flex items-center gap-1 flex-wrap">
          <Link href="/sales/credit-memos/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium text-white transition-colors">
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
          <button disabled={selected.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] disabled:opacity-40 rounded text-xs font-medium text-zinc-200 transition-colors">
            Post
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            Print
          </button>
        </div>
      </div>

      <div className="flex">
        <div className={cn('border-r border-zinc-800 bg-[#16213e] transition-all duration-200', filterOpen ? 'w-56' : 'w-0 overflow-hidden')}>
          {filterOpen && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Status</p>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={cn('w-full text-left text-xs px-2 py-1.5 rounded transition-colors', status === s ? 'bg-blue-600/20 text-blue-300' : 'text-zinc-400 hover:text-zinc-200')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search credit memos..."
                className="w-full bg-[#16213e] border border-zinc-700 rounded pl-9 pr-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <button onClick={() => setFilterOpen(p => !p)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs transition-colors', filterOpen ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200')}>
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <div className="flex gap-1">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={cn('px-3 py-1 rounded text-xs transition-colors', status === s ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800')}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0f1829]">
                  <th className="w-10 px-4 py-2.5">
                    <input type="checkbox" checked={allChecked} onChange={() => setSelected(allChecked ? [] : filtered.map(m => m.id))} className="accent-blue-500" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">No. <ChevronDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Sell-to Customer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Posting Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Due Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Amount</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading && <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-600">Loading...</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-600">No credit memos found</td></tr>}
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggleSelect(m.id)} className="accent-blue-500" />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/sales/credit-memos/${m.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs font-medium">
                        {m.creditMemoNo.length > 12 ? m.creditMemoNo.slice(-12) : m.creditMemoNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-200">{m.sellToCustomerName ?? <span className="text-zinc-600">—</span>}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(m.postingDate)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(m.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[m.status] ?? 'bg-zinc-700/50 text-zinc-400')}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-zinc-200">{fmtCurrency(m.totalAmount)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/sales/credit-memos/${m.id}`} className="text-xs text-zinc-500 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
