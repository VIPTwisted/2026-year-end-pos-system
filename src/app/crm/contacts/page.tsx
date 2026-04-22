'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Search, ChevronRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  firstName: string
  lastName: string
  title: string | null
  email: string | null
  phone: string | null
  ownerName: string | null
  account: { id: string; name: string } | null
}

interface Account { id: string; name: string }

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', title: '', department: '', accountId: '', ownerName: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (accountFilter) q.set('accountId', accountFilter)
    const [cRes, aRes] = await Promise.all([fetch(`/api/crm/contacts?${q}`), fetch('/api/crm/accounts')])
    const [cData, aData] = await Promise.all([cRes.json(), aRes.json()])
    setContacts(Array.isArray(cData) ? cData : [])
    setAccounts(Array.isArray(aData) ? aData : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [search, accountFilter])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const payload: Record<string, string> = { ...form }
    if (!payload.accountId) delete payload.accountId
    await fetch('/api/crm/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false); setShowModal(false)
    setForm({ firstName: '', lastName: '', email: '', phone: '', title: '', department: '', accountId: '', ownerName: '' })
    load()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-semibold text-white">Contacts</h1>
          <span className="text-zinc-500 text-sm ml-1">({contacts.length})</span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Contact
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600" />
        </div>
        <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600">
          <option value="">All Accounts</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>}
            {!loading && contacts.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No contacts found</td></tr>}
            {contacts.map((c) => (
              <tr key={c.id} onClick={() => router.push(`/crm/contacts/${c.id}`)} className="hover:bg-zinc-800/50 cursor-pointer transition-colors">
                <td className="px-4 py-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-white">{c.firstName} {c.lastName}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{c.title ?? '—'}</td>
                <td className="px-4 py-3">
                  {c.account ? (
                    <span className="text-blue-400 text-xs px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">{c.account.name}</span>
                  ) : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3 text-zinc-400">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{c.ownerName ?? '—'}</td>
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
              <h2 className="text-white font-semibold">New Contact</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Last Name *</label>
                  <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Department</label>
                  <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Account</label>
                  <select value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">No Account</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Owner</label>
                  <input value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">{saving ? 'Saving...' : 'Create Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
