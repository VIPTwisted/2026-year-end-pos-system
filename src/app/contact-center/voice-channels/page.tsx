'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type VoiceChannel = {
  id: string
  name: string
  phoneNumber: string
  provider: string
  status: string
  queueId?: string | null
  maxConcurrent: number
  createdAt: string
  updatedAt: string
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

const PROVIDER_LABEL: Record<string, string> = {
  azure: 'Azure Communication',
  twilio: 'Twilio',
  teams: 'Direct Routing',
}

export default function VoiceChannelsPage() {
  const [channels, setChannels] = useState<VoiceChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/contact-center/voice-channels')
      .then(r => r.json())
      .then(d => { setChannels(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = channels
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phoneNumber.includes(search))

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/contact-center" className="hover:text-white transition-colors">Contact Center</Link>
          <span>/</span>
          <span className="text-white font-medium">Voice Channels</span>
        </div>
        <div className="text-xs text-slate-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        <Link href="/contact-center/voice-channels/new">
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium">
            + New
          </button>
        </Link>
        <button
          disabled={selected.length !== 1}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Test Connection
        </button>
      </div>

      {/* Filter Pane */}
      <div className="bg-[#16213e]/60 border-b border-slate-700/30 px-6 py-3 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Connected</option>
          <option value="inactive">Disconnected</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading voice channels...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-600 bg-transparent"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id))}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Channel Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Phone Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Max Concurrent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Queue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No voice channels found. <Link href="/contact-center/voice-channels/new" className="text-blue-400 hover:underline">Add a channel.</Link>
                    </td>
                  </tr>
                ) : filtered.map(ch => (
                  <tr key={ch.id} className={`hover:bg-slate-700/20 ${selected.includes(ch.id) ? 'bg-blue-600/10' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(ch.id)} onChange={() => toggleSelect(ch.id)} className="rounded border-slate-600 bg-transparent" />
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{ch.name}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{ch.phoneNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{PROVIDER_LABEL[ch.provider] ?? ch.provider}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[ch.status] ?? STATUS_COLOR.inactive}`}>
                        {ch.status === 'active' ? 'Connected' : ch.status === 'inactive' ? 'Disconnected' : ch.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{ch.maxConcurrent}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{ch.queueId ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {channels.length} records</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
