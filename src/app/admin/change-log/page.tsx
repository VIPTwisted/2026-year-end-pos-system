'use client'

import { useEffect, useState } from 'react'
import { History, Search, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChangeEntry {
  id: string
  tableCaption: string
  fieldName: string
  oldValue?: string | null
  newValue?: string | null
  documentNo?: string | null
  userId?: string | null
  userName?: string | null
  createdAt: string
}

export default function ChangeLogPage() {
  const [entries, setEntries] = useState<ChangeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ table: '', field: '', user: '', from: '', to: '' })

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.table) params.set('table', filters.table)
    if (filters.field) params.set('field', filters.field)
    if (filters.user)  params.set('user',  filters.user)
    if (filters.from)  params.set('from',  filters.from)
    if (filters.to)    params.set('to',    filters.to)
    const data = await fetch(`/api/admin/change-log?${params}`).then(r => r.json())
    setEntries(data)
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  function setF(k: string, v: string) { setFilters(p => ({ ...p, [k]: v })) }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <History className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">Change Log Entries</h1>
            <p className="text-[11px] text-zinc-500">Read-only audit trail of field-level changes</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-5 p-3 rounded-lg" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
        {[
          { label: 'Table', key: 'table', placeholder: 'Filter by table…' },
          { label: 'Field', key: 'field', placeholder: 'Filter by field…' },
          { label: 'User', key: 'user',  placeholder: 'Filter by user…' },
        ].map(f => (
          <div key={f.key} className="flex items-center gap-1.5">
            <label className="text-[11px] text-zinc-500 whitespace-nowrap">{f.label}:</label>
            <input value={(filters as any)[f.key]} onChange={e => setF(f.key, e.target.value)} placeholder={f.placeholder}
              className="bg-zinc-800/60 border border-zinc-700/60 rounded px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 w-44" />
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-zinc-500">From:</label>
          <input type="date" value={filters.from} onChange={e => setF('from', e.target.value)}
            className="bg-zinc-800/60 border border-zinc-700/60 rounded px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-zinc-500">To:</label>
          <input type="date" value={filters.to} onChange={e => setF('to', e.target.value)}
            className="bg-zinc-800/60 border border-zinc-700/60 rounded px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
          <Search className="w-3 h-3" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              {['Date & Time','User','Table','Field','Old Value','New Value','Document No.'].map((h, i) => (
                <th key={i} className="pb-2 font-medium uppercase tracking-widest text-left pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading && (
              <tr><td colSpan={7} className="py-6 text-center text-zinc-600 animate-pulse">Loading…</td></tr>
            )}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-600">
                  No change log entries found.
                  {Object.values(filters).some(Boolean) && ' Try clearing the filters.'}
                </td>
              </tr>
            )}
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="py-2 pr-4 text-zinc-400 whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' })}
                </td>
                <td className="py-2 pr-4 text-zinc-300">{e.userName ?? e.userId ?? '—'}</td>
                <td className="py-2 pr-4 text-zinc-300">{e.tableCaption}</td>
                <td className="py-2 pr-4 text-zinc-400">{e.fieldName}</td>
                <td className="py-2 pr-4 text-red-400/80 max-w-[120px] truncate" title={e.oldValue ?? undefined}>{e.oldValue ?? '—'}</td>
                <td className="py-2 pr-4 text-emerald-400/80 max-w-[120px] truncate" title={e.newValue ?? undefined}>{e.newValue ?? '—'}</td>
                <td className="py-2 pr-4 font-mono text-zinc-500">{e.documentNo ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length === 500 && (
        <p className="mt-3 text-[11px] text-zinc-600">Showing max 500 entries. Refine filters to narrow results.</p>
      )}
    </main>
  )
}
