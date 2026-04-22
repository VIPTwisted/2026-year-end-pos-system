'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Video, Plus, X, Radio, Play, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LiveShow {
  id: string
  title: string
  description: string | null
  hostName: string | null
  channelName: string | null
  platform: string
  streamUrl: string | null
  status: string
  scheduledAt: string | null
  startedAt: string | null
  totalOrders: number
  totalRevenue: number
  products: { id: string }[]
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  tiktok: 'bg-zinc-700 text-zinc-200 border-zinc-600',
  facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  custom: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      Live
    </span>
  )
  if (status === 'scheduled') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">Scheduled</span>
  if (status === 'ended') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">Ended</span>
  if (status === 'cancelled') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-600 border border-zinc-700">Cancelled</span>
  return <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-500 border border-zinc-700">{status}</span>
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function ShowsPage() {
  const router = useRouter()
  const [shows, setShows] = useState<LiveShow[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', hostName: '', channelName: '', platform: 'instagram', streamUrl: '', scheduledAt: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (platformFilter !== 'all') params.set('platform', platformFilter)
    const data = await fetch(`/api/live/shows?${params}`).then(r => r.json())
    setShows(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter, platformFilter])

  async function handleGoLive(id: string) {
    await fetch(`/api/live/shows/${id}/start`, { method: 'POST' })
    load()
  }

  async function handleEndShow(id: string) {
    await fetch(`/api/live/shows/${id}/end`, { method: 'POST' })
    load()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/live/shows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form }),
    })
    const data = await res.json()
    setSaving(false)
    setShowForm(false)
    setForm({ title: '', description: '', hostName: '', channelName: '', platform: 'instagram', streamUrl: '', scheduledAt: '' })
    router.push(`/live/shows/${data.id}`)
  }

  const STATUS_TABS = ['all', 'scheduled', 'live', 'ended', 'cancelled']
  const PLATFORMS = ['all', 'instagram', 'tiktok', 'facebook', 'youtube', 'custom']

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Live Shows</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Schedule and manage live shopping events</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Show
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="font-semibold text-zinc-100">New Live Show</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Host Name</label>
                  <input value={form.hostName} onChange={e => setForm(f => ({ ...f, hostName: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Channel Name</label>
                  <input value={form.channelName} onChange={e => setForm(f => ({ ...f, channelName: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Platform</label>
                  <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    {['instagram', 'tiktok', 'facebook', 'youtube', 'custom'].map(p => (
                      <option key={p} value={p} className="bg-zinc-800 capitalize">{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Scheduled At</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Stream URL</label>
                <input value={form.streamUrl} onChange={e => setForm(f => ({ ...f, streamUrl: e.target.value }))}
                  placeholder="https://..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-400 text-sm rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${statusFilter === tab ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${platformFilter === p ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Title</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Host</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Platform</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Scheduled / Started</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Products</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Orders</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Revenue</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12 text-zinc-600 text-sm">Loading...</td></tr>
            ) : shows.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-zinc-600 text-sm">No shows found</td></tr>
            ) : shows.map(show => (
              <tr key={show.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/live/shows/${show.id}`} className="text-zinc-100 hover:text-white font-medium">{show.title}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">{show.hostName ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded border text-xs capitalize ${PLATFORM_COLORS[show.platform] ?? PLATFORM_COLORS.custom}`}>{show.platform}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={show.status} /></td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{fmtDate(show.startedAt ?? show.scheduledAt)}</td>
                <td className="px-4 py-3 text-right text-zinc-400">{show.products.length}</td>
                <td className="px-4 py-3 text-right text-zinc-400">{show.totalOrders}</td>
                <td className="px-4 py-3 text-right text-emerald-400 font-medium">{fmt(show.totalRevenue)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {show.status === 'scheduled' && (
                      <button onClick={() => handleGoLive(show.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/30 transition-colors">
                        <Play className="w-3 h-3" /> Go Live
                      </button>
                    )}
                    {show.status === 'live' && (
                      <button onClick={() => handleEndShow(show.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md hover:bg-zinc-600 transition-colors">
                        <Square className="w-3 h-3" /> End
                      </button>
                    )}
                    <Link href={`/live/shows/${show.id}`}
                      className="px-2 py-1 text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors">
                      {show.status === 'live' ? 'Control Room' : 'View'}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
