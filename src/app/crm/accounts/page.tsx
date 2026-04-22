'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Search, Star, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Account {
  id: string
  accountNumber: string
  name: string
  industry: string | null
  revenue: number | null
  employees: number | null
  accountType: string
  rating: string | null
  ownerName: string | null
  _count: { contacts: number; activities: number }
}

const TYPES = ['all', 'prospect', 'customer', 'partner', 'competitor']

const TYPE_BADGE: Record<string, string> = {
  prospect: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  customer: 'bg-green-500/15 text-green-400 border-green-500/30',
  partner: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  competitor: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const RATING_STARS: Record<string, number> = { hot: 3, warm: 2, cold: 1 }

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', industry: '', accountType: 'prospect', website: '', phone: '', email: '', ownerName: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const q = new URLSearchParams()
    if (tab !== 'all') q.set('accountType', tab)
    if (search) q.set('search', search)
    const res = await fetch(`/api/crm/accounts?${q}`)
    const data = await res.json()
    setAccounts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [tab, search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/crm/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setShowModal(false)
    setForm({ name: '', industry: '', accountType: 'prospect', website: '', phone: '', email: '', ownerName: '' })
    load()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-semibold text-white">Accounts</h1>
          <span className="text-zinc-500 text-sm ml-1">({accounts.length})</span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Account
        </button>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1 text-sm rounded-md capitalize transition-colors', tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white')}>
            {t}
          </button>
        ))}
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search accounts..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Account #</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Industry</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Employees</th>
              <th className="px-4 py-3 text-right">Contacts</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
            )}
            {!loading && accounts.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-500">No accounts found</td></tr>
            )}
            {accounts.map((a) => (
              <tr key={a.id} onClick={() => router.push(`/crm/accounts/${a.id}`)} className="hover:bg-zinc-800/50 cursor-pointer transition-colors">
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{a.accountNumber.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-blue-400 font-semibold">{a.name[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{a.name}</p>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded border capitalize', TYPE_BADGE[a.accountType] ?? 'bg-zinc-800 border-zinc-700 text-zinc-400')}>
                        {a.accountType}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400">{a.industry ?? '—'}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{a.revenue != null ? `$${(a.revenue / 1000).toFixed(0)}K` : '—'}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{a.employees ?? '—'}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{a._count.contacts}</td>
                <td className="px-4 py-3">
                  {a.rating ? (
                    <div className="flex gap-0.5">
                      {Array.from({ length: RATING_STARS[a.rating] ?? 1 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  ) : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3 text-zinc-400">{a.ownerName ?? '—'}</td>
                <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-zinc-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">New Account</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Account Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Type</label>
                  <select value={form.accountType} onChange={e => setForm(f => ({ ...f, accountType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {TYPES.filter(t => t !== 'all').map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Industry</label>
                  <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Website</label>
                  <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Owner</label>
                  <input value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                  {saving ? 'Saving...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
