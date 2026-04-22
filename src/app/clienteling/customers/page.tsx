'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Plus, X, User } from 'lucide-react'

interface CustomerProfile {
  id: string
  customerName: string
  email: string | null
  phone: string | null
  tier: string
  assignedAssociate: string | null
  lifetimeValue: number
  totalOrders: number
  avgOrderValue: number
  lastPurchaseDate: string | null
  doNotContact: boolean
}

const TIER_COLORS: Record<string, string> = {
  vip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  standard: 'bg-zinc-700/50 text-zinc-300 border-zinc-600',
}

const FILTERS = ['all', 'vip', 'premium', 'standard', 'lapsed']

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', tier: 'standard', assignedAssociate: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filter === 'vip' || filter === 'premium' || filter === 'standard') params.set('tier', filter)
    if (filter === 'lapsed') params.set('lapsed', 'true')
    const res = await fetch(`/api/clienteling/customers?${params}`)
    setCustomers(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load()
  }

  async function createCustomer() {
    if (!form.customerName.trim()) return
    setSaving(true)
    await fetch('/api/clienteling/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ customerName: '', email: '', phone: '', tier: 'standard', assignedAssociate: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  function daysSince(dateStr: string | null) {
    if (!dateStr) return null
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer 360</h1>
          <p className="text-sm text-zinc-500 mt-1">Full customer profiles and clienteling intelligence</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Customer Profile
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New Customer Profile</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="555-0100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Tier</label>
              <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Assigned Associate</label>
              <input value={form.assignedAssociate} onChange={e => setForm({ ...form, assignedAssociate: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Associate name" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createCustomer} disabled={saving || !form.customerName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium">
              {saving ? 'Creating...' : 'Create Profile'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-zinc-100 focus:outline-none flex-1 placeholder:text-zinc-600"
            placeholder="Search by name or email..." />
        </form>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-500">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <User className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p>No customer profiles found.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Tier</th>
                <th className="px-4 py-3 text-left">Associate</th>
                <th className="px-4 py-3 text-right">LTV</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Avg Order</th>
                <th className="px-4 py-3 text-left">Last Purchase</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {customers.map(c => {
                const days = daysSince(c.lastPurchaseDate)
                return (
                  <tr key={c.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-zinc-100">{c.customerName}</div>
                      <div className="text-xs text-zinc-500">{c.email || c.phone || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${TIER_COLORS[c.tier] || TIER_COLORS.standard}`}>
                        {c.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{c.assignedAssociate || '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-zinc-100">
                      ${c.lifetimeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-300">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-300">
                      ${c.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      {c.lastPurchaseDate ? (
                        <div>
                          <div className="text-xs text-zinc-400">{new Date(c.lastPurchaseDate).toLocaleDateString()}</div>
                          <div className={`text-xs ${days && days > 90 ? 'text-red-400' : 'text-zinc-600'}`}>
                            {days !== null ? `${days}d ago` : ''}
                          </div>
                        </div>
                      ) : <span className="text-zinc-600 text-xs">Never</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/clienteling/customers/${c.id}`}
                        className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
