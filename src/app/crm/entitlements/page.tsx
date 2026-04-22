'use client'
import { useEffect, useState } from 'react'
import { ShieldCheck, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Entitlement {
  id: string
  name: string
  accountId: string | null
  accountName: string | null
  entitlementType: string
  totalTerms: number
  remainingTerms: number
  startDate: string | null
  endDate: string | null
  status: string
  description: string | null
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-500/15 border-green-500/30 text-green-400',
  inactive: 'bg-zinc-800 border-zinc-700 text-zinc-400',
  expired: 'bg-red-500/15 border-red-500/30 text-red-400',
}

export default function EntitlementsPage() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', accountName: '', entitlementType: 'cases', totalTerms: '0', remainingTerms: '0', startDate: '', endDate: '', status: 'active', description: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/crm/entitlements')
    const data = await res.json()
    setEntitlements(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const payload = {
      ...form,
      totalTerms: parseInt(form.totalTerms) || 0,
      remainingTerms: parseInt(form.remainingTerms) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    }
    await fetch('/api/crm/entitlements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false); setShowModal(false)
    setForm({ name: '', accountName: '', entitlementType: 'cases', totalTerms: '0', remainingTerms: '0', startDate: '', endDate: '', status: 'active', description: '' })
    load()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h1 className="text-xl font-semibold text-white">Entitlements</h1>
          <span className="text-zinc-500 text-sm ml-1">({entitlements.length})</span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Entitlement
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Terms Remaining</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">End Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>}
            {!loading && entitlements.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No entitlements</td></tr>}
            {entitlements.map((e) => {
              const pct = e.totalTerms > 0 ? Math.round((e.remainingTerms / e.totalTerms) * 100) : 0
              const barColor = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'
              return (
                <tr key={e.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{e.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{e.accountName ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 capitalize">{e.entitlementType}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-zinc-300 text-xs whitespace-nowrap">{e.remainingTerms}/{e.totalTerms}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{e.startDate ? new Date(e.startDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{e.endDate ? new Date(e.endDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', STATUS_BADGE[e.status] ?? 'bg-zinc-800 border-zinc-700 text-zinc-400')}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">New Entitlement</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Account Name</label>
                  <input value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Type</label>
                  <select value={form.entitlementType} onChange={e => setForm(f => ({ ...f, entitlementType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['cases', 'hours', 'incidents', 'custom'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Total Terms</label>
                  <input type="number" min="0" value={form.totalTerms} onChange={e => setForm(f => ({ ...f, totalTerms: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Remaining Terms</label>
                  <input type="number" min="0" value={form.remainingTerms} onChange={e => setForm(f => ({ ...f, remainingTerms: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['active', 'inactive', 'expired'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">{saving ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
