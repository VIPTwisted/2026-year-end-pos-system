'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Globe, Plus, Monitor, Wifi, Phone, RefreshCw } from 'lucide-react'

interface Channel {
  id: string
  channelCode: string
  name: string
  channelType: string
  currency: string
  timeZone: string
  isActive: boolean
  createdAt: string
  _count: { registers: number }
}

const TYPE_LABELS: Record<string, { label: string; color: string; icon: typeof Globe }> = {
  retail: { label: 'Retail', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Monitor },
  online: { label: 'Online', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Wifi },
  call_center: { label: 'Call Center', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: Phone },
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    channelCode: '',
    name: '',
    channelType: 'retail',
    currency: 'USD',
    timeZone: 'America/New_York',
    storeId: '',
    defaultWarehouse: '',
  })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/channels')
      const data = await res.json()
      setChannels(data)
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
      const res = await fetch('/api/commerce/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create channel'); return }
      setShowForm(false)
      setForm({ channelCode: '', name: '', channelType: 'retail', currency: 'USD', timeZone: 'America/New_York', storeId: '', defaultWarehouse: '' })
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Channels" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Channel Management</h1>
            <p className="text-sm text-zinc-500">{channels.length} channel(s) configured</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> New Channel
            </button>
          </div>
        </div>

        {showForm && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Create Channel</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Channel Code *</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="STORE001"
                    value={form.channelCode}
                    onChange={e => setForm(f => ({ ...f, channelCode: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="Main Street Retail"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Channel Type *</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.channelType}
                    onChange={e => setForm(f => ({ ...f, channelType: e.target.value }))}
                  >
                    <option value="retail">Retail</option>
                    <option value="online">Online</option>
                    <option value="call_center">Call Center</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Currency</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  >
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Time Zone</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.timeZone}
                    onChange={e => setForm(f => ({ ...f, timeZone: e.target.value }))}
                  >
                    <option value="America/New_York">Eastern (ET)</option>
                    <option value="America/Chicago">Central (CT)</option>
                    <option value="America/Denver">Mountain (MT)</option>
                    <option value="America/Los_Angeles">Pacific (PT)</option>
                    <option value="America/Anchorage">Alaska (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii (HST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Default Warehouse (optional)</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="MAIN-WH"
                    value={form.defaultWarehouse}
                    onChange={e => setForm(f => ({ ...f, defaultWarehouse: e.target.value }))}
                  />
                </div>
                {error && <p className="col-span-2 text-xs text-rose-400">{error}</p>}
                <div className="col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    {saving ? 'Creating…' : 'Create Channel'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16 text-zinc-600">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading channels…
            </CardContent>
          </Card>
        ) : channels.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Globe className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No channels configured yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            {channels.map(channel => {
              const typeInfo = TYPE_LABELS[channel.channelType] ?? TYPE_LABELS.retail
              const TypeIcon = typeInfo.icon
              return (
                <Card key={channel.id} className="hover:border-zinc-700 transition-colors">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${typeInfo.color}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <Link href={`/commerce/channels/${channel.id}`} className="text-zinc-100 font-semibold hover:text-blue-400 transition-colors">
                            {channel.name}
                          </Link>
                          <p className="text-xs text-zinc-500 font-mono">{channel.channelCode}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <Badge variant={channel.isActive ? 'success' : 'destructive'}>
                          {channel.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800 text-center">
                      <div>
                        <p className="text-xs text-zinc-600 uppercase tracking-wide">Registers</p>
                        <p className="text-sm font-bold text-zinc-100">{channel._count.registers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600 uppercase tracking-wide">Currency</p>
                        <p className="text-sm font-bold text-zinc-300">{channel.currency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600 uppercase tracking-wide">Time Zone</p>
                        <p className="text-xs font-medium text-zinc-400">{channel.timeZone.split('/')[1] ?? channel.timeZone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
