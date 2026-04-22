'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users2, Plus, X, TrendingUp, DollarSign, Award } from 'lucide-react'

interface Creator {
  id: string
  name: string
  handle: string
  email: string | null
  phone: string | null
  platforms: string
  tier: string
  commissionRate: number
  totalSales: number
  totalCommission: number
  status: string
  _count: { payouts: number }
}

interface CreatorPayout {
  id: string
  status: string
  netPayout: number
}

const TIER_COLORS: Record<string, string> = {
  standard: 'bg-zinc-700 text-zinc-300 border-zinc-600',
  silver: 'bg-zinc-600/30 text-zinc-200 border-zinc-500/50',
  gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  platinum: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function getPlatforms(raw: string): { platform: string; handle: string; followers: number }[] {
  try { return JSON.parse(raw) } catch { return [] }
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [allPayouts, setAllPayouts] = useState<CreatorPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', handle: '', email: '', phone: '', tier: 'standard', commissionRate: '0.10' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await fetch('/api/live/creators').then(r => r.json())
    setCreators(data)
    setLoading(false)
    const payoutResults = await Promise.all(data.map((c: Creator) => fetch(`/api/live/creators/${c.id}/payouts`).then(r => r.json())))
    setAllPayouts(payoutResults.flat())
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/live/creators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, commissionRate: parseFloat(form.commissionRate) }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', handle: '', email: '', phone: '', tier: 'standard', commissionRate: '0.10' })
    load()
  }

  const active = creators.filter(c => c.status === 'active').length
  const totalSales = creators.reduce((s, c) => s + c.totalSales, 0)
  const pendingPayouts = allPayouts.filter(p => p.status === 'pending').length
  const avgCommission = creators.length > 0 ? creators.reduce((s, c) => s + c.commissionRate, 0) / creators.length : 0

  const kpis = [
    { label: 'Active Creators', value: active.toString(), icon: Users2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Sales This Month', value: fmt(totalSales), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending Payouts', value: pendingPayouts.toString(), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Avg Commission %', value: `${(avgCommission * 100).toFixed(1)}%`, icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Creator Management</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage creators, commissions, and payouts</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Creator
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="font-semibold text-zinc-100">New Creator</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Handle *</label>
                  <input required value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))}
                    placeholder="@handle" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Tier</label>
                  <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500">
                    {['standard', 'silver', 'gold', 'platinum'].map(t => (
                      <option key={t} value={t} className="bg-zinc-800 capitalize">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Commission Rate</label>
                  <input type="number" step="0.01" min="0" max="1" value={form.commissionRate}
                    onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))}
                    placeholder="0.10 = 10%" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-400 text-sm rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Creator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} border border-zinc-800 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs text-zinc-500">{kpi.label}</span>
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Handle</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Tier</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Platforms</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Commission %</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Total Sales</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Total Commission</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12 text-zinc-600 text-sm">Loading...</td></tr>
            ) : creators.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-zinc-600 text-sm">No creators yet</td></tr>
            ) : creators.map(creator => {
              const platforms = getPlatforms(creator.platforms)
              return (
                <tr key={creator.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{creator.handle}</td>
                  <td className="px-4 py-3 font-medium text-zinc-100">{creator.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded border text-xs capitalize ${TIER_COLORS[creator.tier] ?? TIER_COLORS.standard}`}>{creator.tier}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {platforms.length === 0 ? <span className="text-zinc-600 text-xs">—</span> : platforms.map((p, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded capitalize">{p.platform}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300">{(creator.commissionRate * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{fmt(creator.totalSales)}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-medium">{fmt(creator.totalCommission)}</td>
                  <td className="px-4 py-3">
                    {creator.status === 'active'
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                      : creator.status === 'paused'
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">Paused</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">Suspended</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/live/creators/${creator.id}`}
                      className="px-3 py-1 text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors">
                      View / Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
