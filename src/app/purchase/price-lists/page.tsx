'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, RefreshCw, ChevronRight, Tag } from 'lucide-react'

interface PurchasePriceList {
  id: string
  code: string
  description: string | null
  assignToType: string
  assignTo: string | null
  currency: string
  startingDate: string | null
  endingDate: string | null
  status: string
  lineCount: number
  createdAt: string
}

const STATUS_CLS: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Draft: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
  Inactive: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function PurchasePriceListsPage() {
  const [lists, setLists] = useState<PurchasePriceList[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (statusFilter) p.set('status', statusFilter)
    fetch(`/api/purchase/price-lists?${p}`)
      .then(r => r.json())
      .then(d => setLists(Array.isArray(d) ? d : []))
      .catch(() => setLists([]))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Purchase Price Lists"
        breadcrumb={[{ label: 'Purchase', href: '/purchasing' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link href="/purchase/price-lists/new"
              className="flex items-center gap-1.5 h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />New
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', 'Draft', 'Active', 'Inactive'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`h-7 px-3 rounded text-[11px] font-medium transition-colors border ${
                statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : lists.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-600">
              <Tag className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm mb-3">No purchase price lists found</p>
              <Link href="/purchase/price-lists/new" className="text-xs text-blue-400 hover:text-blue-300">Create first price list →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Code', 'Description', 'Assign-to Type', 'Assign-to', 'Currency', 'Starting Date', 'Ending Date', 'Lines', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {lists.map(pl => (
                    <tr key={pl.id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/purchase/price-lists/${pl.id}`} className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300">
                          {pl.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-200">{pl.description || '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{pl.assignToType}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">{pl.assignTo || '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-300">{pl.currency}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{fmtDate(pl.startingDate)}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{fmtDate(pl.endingDate)}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400 tabular-nums">{Number(pl.lineCount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CLS[pl.status] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                          {pl.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/purchase/price-lists/${pl.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">{lists.length} record{lists.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  )
}
