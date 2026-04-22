'use client'
import { useState, useEffect, use } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Save, Monitor, RefreshCw } from 'lucide-react'

interface Register {
  id: string
  registerId: string
  name: string
  isActive: boolean
  _count: { shifts: number }
}

interface Channel {
  id: string
  channelCode: string
  name: string
  channelType: string
  storeId: string | null
  defaultWarehouse: string | null
  currency: string
  timeZone: string
  isActive: boolean
  registers: Register[]
}

export default function ChannelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    channelType: 'retail',
    currency: 'USD',
    timeZone: 'America/New_York',
    defaultWarehouse: '',
    isActive: true,
  })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/commerce/channels/${id}`)
      if (!res.ok) return
      const data: Channel = await res.json()
      setChannel(data)
      setForm({
        name: data.name,
        channelType: data.channelType,
        currency: data.currency,
        timeZone: data.timeZone,
        defaultWarehouse: data.defaultWarehouse ?? '',
        isActive: data.isActive,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch(`/api/commerce/channels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to update'); return }
      setChannel(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Channel Detail" />
        <main className="flex-1 p-6 flex items-center justify-center text-zinc-500">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
        </main>
      </>
    )
  }

  if (!channel) {
    return (
      <>
        <TopBar title="Channel Not Found" />
        <main className="flex-1 p-6">
          <p className="text-zinc-500">Channel not found.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar title={channel.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/commerce/channels" className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{channel.name}</h1>
            <p className="text-xs text-zinc-500 font-mono">{channel.channelCode}</p>
          </div>
          <Badge variant={channel.isActive ? 'success' : 'destructive'} className="ml-auto">
            {channel.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Channel Settings</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Channel Type</label>
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
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Default Warehouse</label>
                  <input
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="MAIN-WH"
                    value={form.defaultWarehouse}
                    onChange={e => setForm(f => ({ ...f, defaultWarehouse: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-zinc-300">Active</label>
                </div>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                {success && <p className="text-xs text-emerald-400">Saved successfully.</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-100">Linked Registers</h3>
                <Link href="/commerce/registers" className="text-xs text-blue-400 hover:text-blue-300">
                  Manage →
                </Link>
              </div>
              {channel.registers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                  <Monitor className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No registers assigned.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {channel.registers.map(reg => (
                    <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{reg.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{reg.registerId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">{reg._count.shifts} shifts</span>
                        <Badge variant={reg.isActive ? 'success' : 'destructive'}>
                          {reg.isActive ? 'Active' : 'Off'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
