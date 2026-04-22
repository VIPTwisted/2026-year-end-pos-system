'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Plus, RefreshCw } from 'lucide-react'

interface Channel {
  id: string
  channelCode: string
  name: string
  channelType: string
}

interface Register {
  id: string
  registerId: string
  name: string
  channelId: string
  hardwareProfileId: string | null
  isActive: boolean
  createdAt: string
  channel: Channel
  _count: { shifts: number }
}

const TYPE_COLORS: Record<string, string> = {
  retail: 'text-emerald-400',
  online: 'text-blue-400',
  call_center: 'text-violet-400',
}

export default function RegistersPage() {
  const [registers, setRegisters] = useState<Register[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    registerId: '',
    name: '',
    channelId: '',
    hardwareProfileId: '',
  })

  async function load() {
    setLoading(true)
    try {
      const [regsRes, chRes] = await Promise.all([
        fetch('/api/commerce/registers'),
        fetch('/api/commerce/channels'),
      ])
      setRegisters(await regsRes.json())
      setChannels(await chRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/registers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hardwareProfileId: form.hardwareProfileId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create register'); return }
      setShowForm(false)
      setForm({ registerId: '', name: '', channelId: '', hardwareProfileId: '' })
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Registers" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Registers</h1>
            <p className="text-sm text-zinc-500">{registers.length} register(s) configured</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> New Register
            </button>
          </div>
        </div>

        {showForm && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Create Register</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Register ID *</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="POS-001"
                    value={form.registerId}
                    onChange={e => setForm(f => ({ ...f, registerId: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="Register 1 — Main Floor"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Channel *</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.channelId}
                    onChange={e => setForm(f => ({ ...f, channelId: e.target.value }))}
                    required
                  >
                    <option value="">— Select channel —</option>
                    {channels.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.name} ({ch.channelCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Hardware Profile ID (optional)</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="HW-PROFILE-001"
                    value={form.hardwareProfileId}
                    onChange={e => setForm(f => ({ ...f, hardwareProfileId: e.target.value }))}
                  />
                </div>
                {error && <p className="col-span-2 text-xs text-rose-400">{error}</p>}
                <div className="col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    {saving ? 'Creating…' : 'Create Register'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16 text-zinc-600">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
            </CardContent>
          </Card>
        ) : registers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Monitor className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No registers configured yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 pb-2 px-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-2">Register ID</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Name</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Channel</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Type</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Shifts</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registers.map(reg => (
                      <tr key={reg.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-zinc-300">{reg.registerId}</td>
                        <td className="px-4 py-3 font-medium text-zinc-200">{reg.name}</td>
                        <td className="px-4 py-3 text-zinc-400">{reg.channel.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium capitalize ${TYPE_COLORS[reg.channel.channelType] ?? 'text-zinc-400'}`}>
                            {reg.channel.channelType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{reg._count.shifts}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={reg.isActive ? 'success' : 'destructive'}>
                            {reg.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
