'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Users, Plus, X, Loader2, Search, TreePine } from 'lucide-react'

interface Program { id: string; name: string; commissionRate: number }
interface Affiliate {
  id: string
  affiliateCode: string
  firstName: string
  lastName: string
  email: string
  tierName: string | null
  sponsorId: string | null
  totalSales: number
  totalCommission: number
  teamSize: number
  status: string
  program: { name: string }
  _count: { referrals: number }
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  paused: 'bg-amber-500/15 text-amber-400',
  suspended: 'bg-rose-500/15 text-rose-400',
  pending: 'bg-zinc-700 text-zinc-400',
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [treeMode, setTreeMode] = useState(false)
  const [filters, setFilters] = useState({ status: '', search: '', programId: '' })
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', programId: '', sponsorId: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)
    if (filters.programId) params.set('programId', filters.programId)
    const res = await fetch(`/api/affiliate/affiliates?${params}`)
    setAffiliates(await res.json())
    setLoading(false)
  }, [filters])

  useEffect(() => { load() }, [load])
  useEffect(() => { fetch('/api/affiliate/programs').then(r => r.json()).then(setPrograms) }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/affiliate/affiliates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sponsorId: form.sponsorId || null, phone: form.phone || null }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ firstName: '', lastName: '', email: '', phone: '', programId: '', sponsorId: '' })
    load()
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  function renderTree(items: Affiliate[], parentId: string | null = null, depth = 0): React.ReactNode {
    return items
      .filter(a => (a.sponsorId ?? null) === parentId)
      .map(a => (
        <div key={a.id}>
          <div className="flex items-center gap-2 py-1.5 hover:bg-zinc-800/30 rounded px-2" style={{ paddingLeft: `${12 + depth * 20}px` }}>
            {depth > 0 && <span className="text-zinc-700 text-xs">└</span>}
            <Link href={`/affiliate/affiliates/${a.id}`} className="text-zinc-100 hover:text-blue-400 text-sm font-medium">
              {a.firstName} {a.lastName}
            </Link>
            <span className="font-mono text-xs text-zinc-500">{a.affiliateCode}</span>
            {a.tierName && <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs">{a.tierName}</span>}
            <span className={`px-1.5 py-0.5 rounded text-xs ${STATUS_COLORS[a.status] ?? ''}`}>{a.status}</span>
            <span className="ml-auto text-xs text-emerald-400">{fmt(a.totalSales)}</span>
          </div>
          {renderTree(items, a.id, depth + 1)}
        </div>
      ))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold text-zinc-100">Affiliates Directory</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTreeMode(t => !t)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${treeMode ? 'bg-violet-600/20 border-violet-600 text-violet-400' : 'border-zinc-700 text-zinc-400 hover:text-zinc-100'}`}>
            <TreePine className="w-4 h-4" /> MLM Tree
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> New Affiliate
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search name, code, email..."
            className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500 w-64" />
        </div>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
        <select value={filters.programId} onChange={e => setFilters(f => ({ ...f, programId: e.target.value }))}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
          <option value="">All Programs</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">New Affiliate</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-500" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">First Name *</label>
              <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Last Name *</label>
              <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Program *</label>
              <select required value={form.programId} onChange={e => setForm(f => ({ ...f, programId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="">Select program...</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Sponsor ID (Upline)</label>
              <input value={form.sponsorId} onChange={e => setForm(f => ({ ...f, sponsorId: e.target.value }))}
                placeholder="Sponsor affiliate ID (optional)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />} Add Affiliate
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
        ) : affiliates.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No affiliates found.</div>
        ) : treeMode ? (
          <div className="p-4">{renderTree(affiliates)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Tier</th>
                  <th className="px-5 py-3 text-right">Total Sales</th>
                  <th className="px-5 py-3 text-right">Commission</th>
                  <th className="px-5 py-3 text-right">Team</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {affiliates.map(a => (
                  <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-zinc-400">{a.affiliateCode}</td>
                    <td className="px-5 py-3">
                      <Link href={`/affiliate/affiliates/${a.id}`} className="text-zinc-100 hover:text-blue-400 font-medium">
                        {a.firstName} {a.lastName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-400 text-xs">{a.email}</td>
                    <td className="px-5 py-3">
                      {a.tierName ? (
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs">{a.tierName}</span>
                      ) : <span className="text-zinc-600 text-xs">Base</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-medium">{fmt(a.totalSales)}</td>
                    <td className="px-5 py-3 text-right text-amber-400">{fmt(a.totalCommission)}</td>
                    <td className="px-5 py-3 text-right text-zinc-400">{a.teamSize}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[a.status] ?? ''}`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/affiliate/affiliates/${a.id}`} className="text-xs text-blue-400 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
