'use client'
import { useEffect, useState } from 'react'
import { Building, Plus, Search, Eye, X, Check } from 'lucide-react'

interface Org {
  id: string
  name: string
  accountNumber: string
  creditLimit: number
  creditUsed: number
  creditAvailable: number
  paymentTerms: string
  priceGroupId: string | null
  status: string
  _count: { quotes: number; requisitions: number; contacts: number }
  createdAt: string
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-900/60 text-green-300',
  'on-hold': 'bg-yellow-900/60 text-yellow-300',
  suspended: 'bg-red-900/60 text-red-300',
}

const defaultForm = { name: '', creditLimit: '', paymentTerms: 'NET30', priceGroupId: '' }

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch('/api/b2b/organizations?' + params.toString())
      setOrgs(await res.json())
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, statusFilter]) // eslint-disable-line

  async function handleCreate() {
    if (!form.name) { setError('Name required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/b2b/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, creditLimit: parseFloat(form.creditLimit) || 0, paymentTerms: form.paymentTerms, priceGroupId: form.priceGroupId || null }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      setForm(defaultForm); setShowForm(false); load()
    } catch { setError('Failed to create') } finally { setSaving(false) }
  }

  const filtered = orgs.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.accountNumber.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-zinc-100">B2B Organizations</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Organization
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or account#..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200">New Organization</span>
            <button onClick={() => { setShowForm(false); setError('') }} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Company Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Credit Limit ($)</label>
              <input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: e.target.value })} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Payment Terms</label>
              <select value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none">
                <option value="NET30">NET30</option><option value="NET15">NET15</option><option value="NET60">NET60</option><option value="COD">COD</option><option value="PREPAID">PREPAID</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Price Group ID</label>
              <input value={form.priceGroupId} onChange={e => setForm({ ...form, priceGroupId: e.target.value })} placeholder="Optional" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
              <Check className="w-4 h-4" />{saving ? 'Creating...' : 'Create Organization'}
            </button>
            <button onClick={() => { setShowForm(false); setError('') }} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Account #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Credit Limit</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Credit Used</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Available</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Terms</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-500">No organizations found</td></tr>
              ) : filtered.map(org => (
                <tr key={org.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{org.accountNumber}</td>
                  <td className="px-4 py-3 font-medium text-zinc-100">{org.name}</td>
                  <td className="px-4 py-3 text-right text-zinc-300 font-mono text-xs">${org.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3 text-right text-zinc-300 font-mono text-xs">${org.creditUsed.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td className={`px-4 py-3 text-right font-mono text-xs font-semibold ${org.creditAvailable <= 0 ? 'text-red-400' : 'text-green-400'}`}>${org.creditAvailable.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{org.paymentTerms}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_BADGE[org.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{org.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/b2b/organizations/${org.id}`} className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-900/20 rounded transition-colors inline-flex">
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
