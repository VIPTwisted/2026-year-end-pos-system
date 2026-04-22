'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, RefreshCw, Layers, ChevronRight, Filter } from 'lucide-react'

interface AssemblyBOM {
  id: string
  bomNo: string
  description: string | null
  itemNo: string | null
  unitOfMeasure: string
  versionCode: string
  status: string
  isActive: boolean
  createdAt: string
  _count?: { lines: number; orders: number }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Certified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Under Development': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Closed: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30'}`}>
      {status}
    </span>
  )
}

export default function AssemblyBOMPage() {
  const [boms, setBoms] = useState<AssemblyBOM[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (statusFilter) p.set('status', statusFilter)
    fetch(`/api/assembly/bom?${p}`)
      .then(r => r.json())
      .then((d: AssemblyBOM[]) => setBoms(Array.isArray(d) ? d : []))
      .catch(() => setBoms([]))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? boms.filter(b =>
        b.bomNo.toLowerCase().includes(search.toLowerCase()) ||
        (b.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (b.itemNo ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : boms

  return (
    <>
      <TopBar title="Assembly BOMs" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Assembly Management</p>
              <h2 className="text-xl font-bold text-zinc-100">Assembly BOMs</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Bills of material defining component structure for assembled items</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <Link href="/assembly/bom/new">
                <button className="h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />New BOM
                </button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search BOM no., item…"
              className="h-8 px-3 rounded text-[12px] bg-zinc-800/60 border border-zinc-700/60 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 w-52"
            />
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              {['', 'Certified', 'Under Development', 'Closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-7 px-3 rounded text-[11px] font-medium transition-colors border ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                  }`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
              <Layers className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No Assembly BOMs found.</p>
              <Link href="/assembly/bom/new">
                <button className="mt-3 h-8 px-4 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  Create First BOM
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['No.', 'Description', 'Item No.', 'Unit of Measure', 'Version Code', 'Lines', 'Status', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap ${h === 'Lines' ? 'text-center' : h === '' ? 'w-10' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {filtered.map(b => (
                      <tr key={b.id} className="hover:bg-zinc-800/20 transition-colors group">
                        <td className="px-4 py-3">
                          <Link href={`/assembly/bom/${b.id}`} className="font-mono text-[13px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                            {b.bomNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-200 max-w-[200px] truncate">{b.description ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[12px] text-zinc-300">{b.itemNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{b.unitOfMeasure}</td>
                        <td className="px-4 py-3 font-mono text-[12px] text-zinc-400">{b.versionCode}</td>
                        <td className="px-4 py-3 text-center text-[12px] tabular-nums text-zinc-400">{b._count?.lines ?? 0}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/assembly/bom/${b.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-600">
                {filtered.length} BOM{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
