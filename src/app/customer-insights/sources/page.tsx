'use client'
import { useEffect, useState, useCallback } from 'react'
import { Database, Plus, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataSource {
  id: string
  sourceName: string
  sourceType: string
  connectionType: string
  status: string
  lastSyncAt: string | null
  recordCount: number
  notes: string | null
  createdAt: string
}

const TYPE_TABS = ['All', 'Database', 'File', 'API', 'CRM']
const SOURCE_TYPES = ['Database', 'File', 'API', 'CRM', 'Streaming', 'Cloud']
const CONN_TYPES = ['file', 'jdbc', 'rest', 'sftp', 'oauth', 'sdk']

const BLANK = { sourceName: '', sourceType: 'File', connectionType: 'file', connectionInfo: '', notes: '' }

function statusBadge(status: string) {
  if (status === 'active') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (status === 'syncing') return 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
  return 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
}

export default function SourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [syncing, setSyncing] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/customer-insights/sources')
      .then(r => r.json())
      .then(d => { setSources(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = tab === 'All' ? sources : sources.filter(s => s.sourceType.toLowerCase() === tab.toLowerCase())

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    await fetch('/api/customer-insights/sources', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm(BLANK)
    load()
  }

  async function syncNow(id: string) {
    setSyncing(id)
    await fetch(`/api/customer-insights/sources/${id}/sync`, { method: 'POST' })
    setSyncing(null)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold">Data Sources</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Source
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TYPE_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200')}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Last Sync</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Records</th>
              <th className="text-right text-zinc-400 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">No sources found</td></tr>
            ) : filtered.map(src => (
              <tr key={src.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-100">{src.sourceName}</td>
                <td className="px-4 py-3">
                  <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded">{src.sourceType}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded border capitalize', statusBadge(src.status))}>{src.status}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {src.lastSyncAt ? new Date(src.lastSyncAt).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3 text-zinc-300">{src.recordCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => syncNow(src.id)}
                    disabled={syncing === src.id}
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 ml-auto transition-colors"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', syncing === src.id && 'animate-spin')} />
                    {syncing === src.id ? 'Syncing...' : 'Sync Now'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Source Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Data Source</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Source Name</label>
                <input value={form.sourceName} onChange={e => setF('sourceName', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="My Database Source" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Source Type</label>
                <select value={form.sourceType} onChange={e => setF('sourceType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  {SOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Connection Type</label>
                <select value={form.connectionType} onChange={e => setF('connectionType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  {CONN_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Connection Info (JSON or URL)</label>
                <textarea value={form.connectionInfo} onChange={e => setF('connectionInfo', e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" placeholder='{"host":"localhost","port":5432}' />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Notes</label>
                <input value={form.notes} onChange={e => setF('notes', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={save} disabled={!form.sourceName} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
