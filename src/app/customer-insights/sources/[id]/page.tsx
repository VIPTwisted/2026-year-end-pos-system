'use client'
import { useEffect, useState, use } from 'react'
import { Database, RefreshCw, CheckCircle, XCircle, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataSource {
  id: string
  sourceName: string
  sourceType: string
  connectionType: string
  connectionInfo: string | null
  status: string
  lastSyncAt: string | null
  recordCount: number
  entityName: string | null
  refreshMode: string
  notes: string | null
}

export default function SourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [source, setSource] = useState<DataSource | null>(null)
  const [form, setForm] = useState<Partial<DataSource>>({})
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/customer-insights/sources/${id}`)
      .then(r => r.json())
      .then(d => { setSource(d); setForm(d) })
  }, [id])

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function syncNow() {
    setSyncing(true)
    const res = await fetch(`/api/customer-insights/sources/${id}/sync`, { method: 'POST' })
    const updated = await res.json()
    setSource(updated)
    setForm(updated)
    setSyncing(false)
  }

  async function saveChanges() {
    setSaving(true)
    const res = await fetch(`/api/customer-insights/sources/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const updated = await res.json()
    setSource(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!source) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold">{source.sourceName}</h1>
          <span className={cn('text-xs px-2 py-0.5 rounded border capitalize',
            source.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            source.status === 'syncing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse' :
            'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
          )}>{source.status}</span>
        </div>
        <button
          onClick={syncNow}
          disabled={syncing}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', syncing && 'animate-spin')} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Form */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Source Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Source Name</label>
              <input value={form.sourceName ?? ''} onChange={e => setF('sourceName', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Source Type</label>
              <input value={form.sourceType ?? ''} onChange={e => setF('sourceType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Connection Type</label>
              <input value={form.connectionType ?? ''} onChange={e => setF('connectionType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Entity Name</label>
              <input value={form.entityName ?? ''} onChange={e => setF('entityName', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Refresh Mode</label>
              <select value={form.refreshMode ?? 'manual'} onChange={e => setF('refreshMode', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option value="manual">Manual</option>
                <option value="scheduled">Scheduled</option>
                <option value="realtime">Real-time</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Status</label>
              <select value={form.status ?? 'inactive'} onChange={e => setF('status', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
                <option value="syncing">Syncing</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Connection Info (JSON or URL)</label>
            <textarea value={form.connectionInfo ?? ''} onChange={e => setF('connectionInfo', e.target.value)} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Notes</label>
            <input value={form.notes ?? ''} onChange={e => setF('notes', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Connection Status Panel */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300">Connection Status</h2>
            <div className="flex items-center gap-3">
              {source.status === 'active' ? (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <XCircle className="w-8 h-8 text-zinc-500" />
              )}
              <div>
                <div className={cn('text-sm font-semibold capitalize', source.status === 'active' ? 'text-emerald-400' : 'text-zinc-400')}>{source.status}</div>
                <div className="text-xs text-zinc-500">Connection state</div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Records</span>
                <span className="text-zinc-200 font-mono">{source.recordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Last Sync</span>
                <span className="text-zinc-200">{source.lastSyncAt ? new Date(source.lastSyncAt).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Refresh Mode</span>
                <span className="text-zinc-200 capitalize">{source.refreshMode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
