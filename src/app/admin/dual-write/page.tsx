'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Repeat, Plus, Play, Pause, Square, ArrowLeftRight, ArrowRight } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

interface DualWriteMapping {
  id: string
  mappingName: string
  sourceEntity: string
  targetEntity: string
  syncDirection: string
  status: string
  lastSyncAt: string | null
  errorCount: number
  recordsSynced: number
}

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  running: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  stopped: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

export default function DualWritePage() {
  const [mappings, setMappings] = useState<DualWriteMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/dual-write')
      .then(r => r.json())
      .then(d => { setMappings(d); setLoading(false) })
  }, [])

  async function action(id: string, act: 'start' | 'pause' | 'stop') {
    setActing(id)
    const res = await fetch(`/api/admin/dual-write/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: act }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMappings(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m))
    }
    setActing(null)
  }

  const running = mappings.filter(m => m.status === 'running').length
  const paused = mappings.filter(m => m.status === 'paused').length
  const errors = mappings.filter(m => m.status === 'error').length
  const syncedToday = mappings.reduce((s, m) => s + m.recordsSynced, 0)

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="Dual-Write"
        breadcrumb={[{ label: 'Admin', href: '/admin/users' }]}
        actions={
          <Link href="/admin/dual-write/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Plus className="w-3 h-3" /> New Mapping
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Running', value: running, color: 'text-emerald-400' },
            { label: 'Paused', value: paused, color: 'text-amber-400' },
            { label: 'Errors', value: errors, color: 'text-red-400' },
            { label: 'Records Synced', value: syncedToday.toLocaleString(), color: 'text-blue-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Repeat className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-500">{k.label}</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Mapping</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Source → Target</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Direction</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Last Sync</th>
                  <th className="text-right px-4 py-3 font-medium uppercase tracking-widest">Errors</th>
                  <th className="text-right px-4 py-3 font-medium uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center text-zinc-600">Loading...</td></tr>
                ) : mappings.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-zinc-600">
                    <Repeat className="w-8 h-8 mx-auto mb-2 opacity-30" />No mappings configured
                  </td></tr>
                ) : mappings.map(m => (
                  <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/dual-write/${m.id}`} className="font-medium text-zinc-200 hover:text-blue-400 transition-colors">
                        {m.mappingName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-300">{m.sourceEntity}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                        <span className="text-zinc-300">{m.targetEntity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      <div className="flex items-center gap-1">
                        <ArrowLeftRight className="w-3 h-3" />
                        <span className="capitalize">{m.syncDirection.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border capitalize', STATUS_STYLES[m.status] ?? STATUS_STYLES.stopped)}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {m.lastSyncAt ? new Date(m.lastSyncAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.errorCount > 0
                        ? <span className="text-red-400 font-medium">{m.errorCount}</span>
                        : <span className="text-zinc-600">0</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        {m.status !== 'running' && (
                          <button onClick={() => action(m.id, 'start')} disabled={acting === m.id}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded transition-colors" title="Start">
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                        {m.status === 'running' && (
                          <button onClick={() => action(m.id, 'pause')} disabled={acting === m.id}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded transition-colors" title="Pause">
                            <Pause className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => action(m.id, 'stop')} disabled={acting === m.id}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors" title="Stop">
                          <Square className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
