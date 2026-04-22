'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Server, Plus, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSU {
  id: string; csuName: string; csuType: string; region: string | null; endpointUrl: string | null
  status: string; version: string | null
  channelAssignments: Array<{ id: string; channelName: string | null; channelType: string | null; status: string; initializedAt: string | null }>
}

export default function CSUDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [csu, setCsu] = useState<CSU | null>(null)
  const [showInit, setShowInit] = useState(false)
  const [initForm, setInitForm] = useState({ channelName: '', channelType: 'online_store' })
  const [initializing, setInitializing] = useState(false)

  useEffect(() => { fetch(`/api/csu/${id}`).then(r => r.json()).then(setCsu) }, [id])

  async function initChannel() {
    setInitializing(true)
    const res = await fetch(`/api/csu/${id}/initialize`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(initForm) })
    if (res.ok) {
      const a = await res.json()
      setCsu(prev => prev ? { ...prev, channelAssignments: [...prev.channelAssignments, a] } : prev)
      setShowInit(false)
    }
    setInitializing(false)
  }

  if (!csu) return <main className="flex-1 p-6 bg-zinc-950"><div className="animate-pulse space-y-4"><div className="h-6 bg-zinc-800 rounded w-48" /></div></main>

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/channels/csu" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs"><ChevronLeft className="w-3 h-3" /> Scale Units</Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-zinc-500" /> {csu.csuName}
        </h1>
      </div>

      {/* Config */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Configuration</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          {[
            { label: 'Status', value: csu.status },
            { label: 'Type', value: csu.csuType },
            { label: 'Region', value: csu.region ?? '—' },
            { label: 'Version', value: csu.version ?? '—' },
            { label: 'Endpoint URL', value: csu.endpointUrl ?? '—' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-xs text-zinc-500 mb-1">{item.label}</div>
              <div className="text-xs text-zinc-200 font-mono">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Channel assignments */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Assigned Channels</p>
          <button onClick={() => setShowInit(true)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
            <Zap className="w-3 h-3" /> Initialize Channel
          </button>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Channel</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Type</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Initialized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {csu.channelAssignments.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No channels assigned</td></tr>
              ) : csu.channelAssignments.map(a => (
                <tr key={a.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-300">{a.channelName ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400 capitalize">{a.channelType?.replace('_', ' ') ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('px-1.5 py-0.5 rounded text-xs', a.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400')}>{a.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">{a.initializedAt ? new Date(a.initializedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showInit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Initialize Channel</h3>
              <button onClick={() => setShowInit(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Channel Name</label>
                <input value={initForm.channelName} onChange={e => setInitForm(p => ({ ...p, channelName: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Channel Type</label>
                <select value={initForm.channelType} onChange={e => setInitForm(p => ({ ...p, channelType: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none">
                  <option value="online_store">Online Store</option>
                  <option value="retail_store">Retail Store</option>
                  <option value="call_center">Call Center</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowInit(false)} className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 rounded">Cancel</button>
              <button onClick={initChannel} disabled={initializing || !initForm.channelName} className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded">
                {initializing ? 'Initializing...' : 'Initialize'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
