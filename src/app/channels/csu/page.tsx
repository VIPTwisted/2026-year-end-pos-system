'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, X, Server, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSU { id: string; csuName: string; csuType: string; region: string | null; endpointUrl: string | null; status: string; version: string | null; channelAssignments: Array<{ id: string; channelName: string | null }> }

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  initializing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  degraded: 'bg-red-500/10 text-red-400 border-red-500/20',
  offline: 'bg-zinc-700/50 text-zinc-500 border-zinc-700',
}

export default function CSUPage() {
  const [csus, setCsus] = useState<CSU[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ csuName: '', csuType: 'cloud', region: '', endpointUrl: '', version: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/csu').then(r => r.json()).then(setCsus) }, [])

  async function create() {
    setSaving(true)
    const res = await fetch('/api/csu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const c = await res.json(); setCsus(prev => [{ ...c, channelAssignments: [] }, ...prev]); setShowModal(false) }
    setSaving(false)
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Commerce Scale Units</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{csus.length} scale units</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
          <Plus className="w-3 h-3" /> Initialize CSU
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {csus.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-zinc-600">
            <Server className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No scale units configured</p>
          </div>
        ) : csus.map(csu => (
          <Link key={csu.id} href={`/channels/csu/${csu.id}`} className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-semibold text-zinc-100">{csu.csuName}</span>
              </div>
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', STATUS_STYLES[csu.status] ?? STATUS_STYLES.offline, csu.status === 'initializing' && 'animate-pulse')}>
                {csu.status}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600">Type</span>
                <span className="text-zinc-400 capitalize">{csu.csuType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Region</span>
                <span className="text-zinc-400">{csu.region ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Version</span>
                <span className="text-zinc-400 font-mono">{csu.version ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Channels</span>
                <span className="text-zinc-400">{csu.channelAssignments.length}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[440px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Initialize Commerce Scale Unit</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="space-y-3">
              {[{ label: 'CSU Name', key: 'csuName', placeholder: 'e.g. US-CLOUD-01' }, { label: 'Region', key: 'region', placeholder: 'e.g. East US' }, { label: 'Endpoint URL', key: 'endpointUrl', placeholder: 'https://...' }, { label: 'Version', key: 'version', placeholder: 'e.g. 10.0.39' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Type</label>
                <select value={form.csuType} onChange={e => setForm(p => ({ ...p, csuType: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none">
                  <option value="cloud">Cloud</option>
                  <option value="self_hosted">Self-hosted (RSSU)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">Cancel</button>
              <button onClick={create} disabled={saving || !form.csuName} className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors">
                {saving ? 'Initializing...' : 'Initialize'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
