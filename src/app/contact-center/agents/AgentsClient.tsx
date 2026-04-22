'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { XCircle } from 'lucide-react'

type Presence = {
  id: string
  agentId: string
  agentName: string
  status: string
  statusNote: string | null
  channelCapacities: unknown
  activeConversations: number
  lastUpdated: string | Date
}

const PRESENCE_BADGE: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  busy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  away: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  do_not_disturb: 'bg-red-500/20 text-red-400 border-red-500/30',
  on_break: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  offline: 'bg-zinc-700/20 text-zinc-500 border-zinc-700/30',
}

const STATUSES = ['available', 'busy', 'away', 'do_not_disturb', 'on_break', 'offline']

export default function AgentsClient({ presences: initPresences }: { presences: Presence[] }) {
  const router = useRouter()
  const [presences, setPresences] = useState(initPresences)
  const [editing, setEditing] = useState<Presence | null>(null)
  const [form, setForm] = useState({ status: '', statusNote: '', voiceCap: '1', chatCap: '3', emailCap: '5' })
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ agentId: '', agentName: '', status: 'offline' })
  const [adding, setAdding] = useState(false)

  function openEdit(p: Presence) {
    const caps = p.channelCapacities as Record<string, number> | null
    setEditing(p)
    setForm({
      status: p.status,
      statusNote: p.statusNote ?? '',
      voiceCap: String(caps?.voice ?? 1),
      chatCap: String(caps?.chat ?? 3),
      emailCap: String(caps?.email ?? 5),
    })
  }

  async function savePresence() {
    if (!editing) return
    setSaving(true)
    const res = await fetch(`/api/contact-center/presence/${editing.agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: form.status,
        statusNote: form.statusNote || null,
        channelCapacities: { voice: Number(form.voiceCap), chat: Number(form.chatCap), email: Number(form.emailCap) },
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPresences(prev => prev.map(p => p.agentId === editing.agentId ? updated : p))
      setEditing(null)
    }
    setSaving(false)
  }

  async function addAgent() {
    setAdding(true)
    const res = await fetch('/api/contact-center/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: addForm.agentId || addForm.agentName.toLowerCase().replace(/\s/g, '_'), agentName: addForm.agentName, status: addForm.status }),
    })
    if (res.ok) {
      const p = await res.json()
      setPresences(prev => [...prev, p])
      setShowAdd(false)
      setAddForm({ agentId: '', agentName: '', status: 'offline' })
    }
    setAdding(false)
  }

  return (
    <div className="p-6 space-y-5 min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Agent Presence</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Register Agent
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Agent</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Active Convs</th>
              <th className="px-4 py-3 text-left">Channel Capacities</th>
              <th className="px-4 py-3 text-left">Last Updated</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {presences.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-600">No agents registered</td></tr>
            )}
            {presences.map(p => {
              const caps = p.channelCapacities as Record<string, number> | null
              return (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {p.agentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200">{p.agentName}</div>
                        <div className="text-xs text-zinc-600">{p.agentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', PRESENCE_BADGE[p.status] ?? PRESENCE_BADGE.offline)}>
                      {p.status.replace('_', ' ')}
                    </span>
                    {p.statusNote && <div className="text-xs text-zinc-600 mt-0.5">{p.statusNote}</div>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 tabular-nums">{p.activeConversations}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {caps ? Object.entries(caps).map(([k, v]) => `${k}: ${v}`).join(' · ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs tabular-nums">
                    {new Date(p.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100">Update: {editing.agentName}</h2>
              <button onClick={() => setEditing(null)} className="text-zinc-600 hover:text-zinc-400"><XCircle className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Status Note</label>
              <input type="text" value={form.statusNote} onChange={e => setForm(f => ({ ...f, statusNote: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[['Voice', 'voiceCap'], ['Chat', 'chatCap'], ['Email', 'emailCap']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs text-zinc-500 mb-1">{label} cap</label>
                  <input type="number" min={0} max={20} value={(form as Record<string, string>)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={savePresence} disabled={saving}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100">Register Agent</h2>
              <button onClick={() => setShowAdd(false)} className="text-zinc-600 hover:text-zinc-400"><XCircle className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Agent Name *</label>
              <input type="text" value={addForm.agentName} onChange={e => setAddForm(f => ({ ...f, agentName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Agent ID (optional)</label>
              <input type="text" value={addForm.agentId} onChange={e => setAddForm(f => ({ ...f, agentId: e.target.value }))}
                placeholder="auto-generated if blank"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Initial Status</label>
              <select value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={addAgent} disabled={adding || !addForm.agentName}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {adding ? 'Adding...' : 'Register'}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
