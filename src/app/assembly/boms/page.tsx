'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, RefreshCw, Layers } from 'lucide-react'

interface AssemblyBOM {
  id: string
  parentItemNo: string | null
  description: string | null
  unitOfMeasure: string
  qty: number
  type: string
  componentNo: string | null
  componentDescription: string | null
  createdAt: string
}

export default function AssemblyBOMsPage() {
  const [boms, setBoms] = useState<AssemblyBOM[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2600)
  }

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (search) p.set('parent', search)
    fetch(`/api/assembly/boms?${p}`)
      .then(r => r.json())
      .then(d => setBoms(Array.isArray(d) ? d : []))
      .catch(() => setBoms([]))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  // Group by parentItemNo
  const grouped = boms.reduce<Record<string, AssemblyBOM[]>>((acc, b) => {
    const key = b.parentItemNo ?? '(No Item)'
    if (!acc[key]) acc[key] = []
    acc[key].push(b)
    return acc
  }, {})

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Assembly BOMs"
        breadcrumb={[{ label: 'Assembly', href: '/assembly/orders' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* Search */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Filter by parent item no.…"
            className="h-8 px-3 rounded text-[12px] bg-zinc-800/60 border border-zinc-700/60 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 w-64"
          />
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : boms.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-600">
              <Layers className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No assembly BOMs found</p>
              <p className="text-xs mt-1 text-zinc-700">BOMs are auto-generated from manufacturing. Or add via API.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Parent Item', 'Description', 'Qty', 'Type', 'Component No.', 'Component Description'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {Object.entries(grouped).map(([parent, rows]) =>
                    rows.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-zinc-800/20 transition-colors">
                        {idx === 0 ? (
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-400" rowSpan={rows.length}>{parent}</td>
                        ) : null}
                        <td className="px-4 py-3 text-sm text-zinc-200">{b.description || '—'}</td>
                        <td className="px-4 py-3 text-xs font-mono tabular-nums text-zinc-300">{b.qty} {b.unitOfMeasure}</td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{b.type}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-300">{b.componentNo || '—'}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{b.componentDescription || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">{boms.length} BOM line{boms.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  )
}
