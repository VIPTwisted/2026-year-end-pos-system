'use client'
import { useEffect, useState, useCallback } from 'react'
import { Download, Plus, X, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CIExport {
  id: string
  exportName: string
  destination: string
  destinationType: string
  segmentName: string | null
  lastExportAt: string | null
  recordsExported: number
  status: string
}

const DEST_TYPES = ['csv', 'json', 'parquet', 'sftp', 's3', 'azure-blob', 'webhook']
const BLANK = { exportName: '', destination: '', destinationType: 'csv', segmentName: '' }

function statusBadge(s: string) {
  if (s === 'active') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (s === 'running') return 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
  if (s === 'error') return 'bg-red-500/20 text-red-400 border-red-500/30'
  return 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
}

export default function ExportsPage() {
  const [exports, setExports] = useState<CIExport[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [running, setRunning] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/customer-insights/exports')
      .then(r => r.json())
      .then(d => { setExports(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    await fetch('/api/customer-insights/exports', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm(BLANK)
    load()
  }

  async function runExport(id: string) {
    setRunning(id)
    await fetch(`/api/customer-insights/exports/${id}/run`, { method: 'POST' })
    setRunning(null)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-orange-400" />
          <h1 className="text-xl font-bold">Exports</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Destination</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Segment</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Last Export</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Records</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
              <th className="text-right text-zinc-400 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
            ) : exports.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-500">No exports configured</td></tr>
            ) : exports.map(exp => (
              <tr key={exp.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-100">{exp.exportName}</td>
                <td className="px-4 py-3">
                  <div className="text-zinc-300 text-xs truncate max-w-[140px]">{exp.destination || '—'}</div>
                  <div className="text-zinc-500 text-xs">{exp.destinationType}</div>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{exp.segmentName ?? 'All profiles'}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {exp.lastExportAt ? new Date(exp.lastExportAt).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-zinc-300">{exp.recordsExported.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded border capitalize', statusBadge(exp.status))}>{exp.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => runExport(exp.id)}
                    disabled={running === exp.id || exp.status === 'running'}
                    className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 disabled:opacity-50 ml-auto transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {running === exp.id ? 'Starting...' : 'Run'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Export</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Export Name</label>
                <input value={form.exportName} onChange={e => setF('exportName', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Destination</label>
                <input value={form.destination} onChange={e => setF('destination', e.target.value)} placeholder="s3://bucket/path or /exports/file.csv" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Destination Type</label>
                <select value={form.destinationType} onChange={e => setF('destinationType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
                  {DEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Segment Name (optional)</label>
                <input value={form.segmentName} onChange={e => setF('segmentName', e.target.value)} placeholder="Leave blank for all profiles" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={save} disabled={!form.exportName} className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
