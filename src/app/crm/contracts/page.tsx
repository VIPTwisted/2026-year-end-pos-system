'use client'
import { useEffect, useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contract {
  id: string
  contractNumber: string
  accountId: string | null
  accountName: string | null
  contractType: string
  startDate: string | null
  endDate: string | null
  value: number
  status: string
  terms: string | null
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-500/15 border-green-500/30 text-green-400',
  expired: 'bg-red-500/15 border-red-500/30 text-red-400',
  pending: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  cancelled: 'bg-zinc-800 border-zinc-700 text-zinc-500',
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ accountName: '', contractType: 'support', startDate: '', endDate: '', value: '0', status: 'active', terms: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/crm/contracts')
    const data = await res.json()
    setContracts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const payload = {
      ...form,
      value: parseFloat(form.value) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      terms: form.terms || null,
    }
    await fetch('/api/crm/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false); setShowModal(false)
    setForm({ accountName: '', contractType: 'support', startDate: '', endDate: '', value: '0', status: 'active', terms: '' })
    load()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-400" />
          <h1 className="text-xl font-semibold text-white">Service Contracts</h1>
          <span className="text-zinc-500 text-sm ml-1">({contracts.length})</span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Contract
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Contract #</th>
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">End Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>}
            {!loading && contracts.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No contracts</td></tr>}
            {contracts.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{c.contractNumber.slice(0, 12)}</td>
                <td className="px-4 py-3 text-zinc-300">{c.accountName ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400 capitalize">{c.contractType}</td>
                <td className="px-4 py-3 text-right text-white font-medium">${c.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-zinc-400">{c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', STATUS_BADGE[c.status] ?? 'bg-zinc-800 border-zinc-700 text-zinc-400')}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">New Service Contract</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Account Name</label>
                  <input value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Type</label>
                  <select value={form.contractType} onChange={e => setForm(f => ({ ...f, contractType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['support', 'maintenance', 'warranty', 'service', 'subscription'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Value ($)</label>
                  <input type="number" min="0" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['active', 'pending', 'expired', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Terms</label>
                  <textarea rows={2} value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">{saving ? 'Saving...' : 'Create Contract'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
