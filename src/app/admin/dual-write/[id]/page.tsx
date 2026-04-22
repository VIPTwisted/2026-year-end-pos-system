'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Play, Pause, Square, RefreshCw, ArrowLeftRight } from 'lucide-react'

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
  createdAt: string
  updatedAt: string
}

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  running: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  paused: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
  stopped: 'text-zinc-400 bg-zinc-700/50 border-zinc-700',
}

export default function DualWriteMappingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [mapping, setMapping] = useState<DualWriteMapping | null>(null)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/dual-write/${id}`)
      .then(r => r.json())
      .then(setMapping)
  }, [id])

  async function act(action: string) {
    setActing(action)
    const res = await fetch(`/api/admin/dual-write/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: action }),
    })
    if (res.ok) { const d = await res.json(); setMapping(d) }
    setActing(null)
  }

  if (!mapping) return <main className="flex-1 bg-[#0f0f1a] p-6 text-zinc-500 text-xs">Loading...</main>

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title={mapping.mappingName}
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Dual-Write', href: '/admin/dual-write' },
        ]}
        actions={
          <div className="flex gap-2">
            {mapping.status !== 'running' && (
              <button onClick={() => act('start')} disabled={!!acting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 rounded transition-colors">
                <Play className="w-3 h-3" /> {acting === 'start' ? 'Starting...' : 'Start'}
              </button>
            )}
            {mapping.status === 'running' && (
              <button onClick={() => act('pause')} disabled={!!acting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-600/30 rounded transition-colors">
                <Pause className="w-3 h-3" /> {acting === 'pause' ? 'Pausing...' : 'Pause'}
              </button>
            )}
            <button onClick={() => act('stop')} disabled={!!acting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded transition-colors">
              <Square className="w-3 h-3" /> {acting === 'stop' ? 'Stopping...' : 'Stop'}
            </button>
            <button onClick={() => act('start')} disabled={!!acting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:bg-zinc-800 rounded transition-colors">
              <RefreshCw className="w-3 h-3" /> Resync
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 border flex items-center gap-3 text-sm font-medium ${STATUS_COLORS[mapping.status] ?? STATUS_COLORS.stopped}`}>
          <ArrowLeftRight className="w-4 h-4" />
          <span className="capitalize">{mapping.status}</span>
          {mapping.lastSyncAt && <span className="ml-auto text-xs opacity-70">Last sync: {new Date(mapping.lastSyncAt).toLocaleString()}</span>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Records Synced', value: mapping.recordsSynced.toLocaleString(), color: 'text-blue-400' },
            { label: 'Error Count', value: mapping.errorCount, color: mapping.errorCount > 0 ? 'text-red-400' : 'text-zinc-400' },
            { label: 'Direction', value: mapping.syncDirection.replace(/_/g, ' '), color: 'text-violet-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-2">{k.label}</div>
              <div className={`text-lg font-bold capitalize ${k.color}`}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Field Map */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Entity Mapping</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex-1 bg-zinc-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-zinc-500 mb-1">Source</div>
              <div className="font-medium text-zinc-200">{mapping.sourceEntity}</div>
            </div>
            <ArrowLeftRight className="w-5 h-5 text-zinc-500 shrink-0" />
            <div className="flex-1 bg-zinc-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-zinc-500 mb-1">Target</div>
              <div className="font-medium text-zinc-200">{mapping.targetEntity}</div>
            </div>
          </div>
        </div>

        {/* Error Log */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Error Log</h3>
          {mapping.errorCount === 0 ? (
            <p className="text-xs text-zinc-600">No errors recorded.</p>
          ) : (
            <div className="text-xs text-red-400 bg-red-900/10 border border-red-800/30 rounded-lg p-3">
              {mapping.errorCount} error{mapping.errorCount !== 1 ? 's' : ''} detected. Review and resync to clear.
            </div>
          )}
        </div>

        <div className="text-[10px] text-zinc-700">
          Created {new Date(mapping.createdAt).toLocaleString()} &middot; Updated {new Date(mapping.updatedAt).toLocaleString()}
        </div>
      </div>
    </main>
  )
}
