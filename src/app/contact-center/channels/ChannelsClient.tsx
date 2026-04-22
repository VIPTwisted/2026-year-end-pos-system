'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { XCircle } from 'lucide-react'

type Channel = {
  id: string
  name: string
  type: string
  isActive: boolean
  config: unknown
  createdAt: string | Date
  _count: { conversations: number }
}

const CHANNEL_TYPES = ['voice', 'live_chat', 'email', 'whatsapp', 'facebook', 'sms', 'custom']

const TYPE_COLORS: Record<string, string> = {
  voice: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  live_chat: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  email: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  whatsapp: 'bg-green-500/20 text-green-400 border-green-500/30',
  facebook: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  sms: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  custom: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

export default function ChannelsClient({ channels: initChannels }: { channels: Channel[] }) {
  const [channels, setChannels] = useState(initChannels)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'voice', isActive: true })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  async function addChannel(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/contact-center/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const ch = await res.json()
      setChannels(c => [...c, { ...ch, _count: { conversations: 0 } }].sort((a, b) => a.name.localeCompare(b.name)))
      setForm({ name: '', type: 'voice', isActive: true })
      setShowAdd(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
    setAdding(false)
  }

  async function toggleChannel(ch: Channel) {
    setToggling(ch.id)
    const res = await fetch(`/api/contact-center/channels/${ch.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ch.isActive }),
    })
    if (res.ok) {
      const updated = await res.json()
      setChannels(prev => prev.map(c => c.id === ch.id ? { ...updated, _count: ch._count } : c))
    }
    setToggling(null)
  }

  return (
    <div className="p-6 space-y-5 min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Contact Channels</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Omnichannel inbound/outbound channel configuration</p>
        </div>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Channel
        </button>
      </div>

      {showAdd && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">New Channel</h2>
          <form onSubmit={addChannel} className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Name *</label>
              <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Main Chat Support"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CHANNEL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Active</label>
              <select value={form.isActive ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={adding}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {adding ? 'Adding...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Total Conversations</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {channels.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-600">No channels configured</td></tr>
            )}
            {channels.map(ch => (
              <tr key={ch.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-200">{ch.name}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', TYPE_COLORS[ch.type] ?? TYPE_COLORS.custom)}>
                    {ch.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 tabular-nums">{ch._count.conversations}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', ch.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/20 text-zinc-500')}>
                    {ch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs tabular-nums">
                  {new Date(ch.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleChannel(ch)}
                    disabled={toggling === ch.id}
                    className={cn('px-3 py-1 text-xs rounded transition-colors', ch.isActive
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                      : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400')}
                  >
                    {toggling === ch.id ? '...' : ch.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
