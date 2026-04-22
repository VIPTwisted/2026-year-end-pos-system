'use client'
import { useEffect, useState } from 'react'
import { ShieldAlert, Plus, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ManagerOverride {
  id: string; overrideType: string; requestedBy?: string; approvedBy?: string; storeId?: string
  registerId?: string; originalValue?: string; overrideValue?: string; reason?: string; status: string; createdAt: string
}
const OVERRIDE_TYPES = ['price', 'discount', 'void', 'return', 'age-verify', 'refund-exceed', 'open-drawer', 'reprint', 'lock-override']
const TYPE_BADGE: Record<string, string> = { price: 'bg-yellow-500/20 text-yellow-400', discount: 'bg-orange-500/20 text-orange-400', void: 'bg-red-500/20 text-red-400', return: 'bg-blue-500/20 text-blue-400', 'age-verify': 'bg-purple-500/20 text-purple-400', 'refund-exceed': 'bg-pink-500/20 text-pink-400', 'open-drawer': 'bg-cyan-500/20 text-cyan-400', reprint: 'bg-zinc-600 text-zinc-300', 'lock-override': 'bg-red-700/30 text-red-300' }
function emptyForm() { return { overrideType: 'price', requestedBy: '', approvedBy: '', storeId: '', registerId: '', originalValue: '', overrideValue: '', reason: '', status: 'approved' } }

export default function OverridesPage() {
  const [overrides, setOverrides] = useState<ManagerOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true); const params = new URLSearchParams(); if (filterType) params.set('overrideType', filterType)
    const data = await fetch(`/api/store-ops/overrides?${params}`).then(r => r.json()); setOverrides(Array.isArray(data) ? data : []); setLoading(false)
  }
  useEffect(() => { load() }, [filterType])

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    await fetch('/api/store-ops/overrides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false); setForm(emptyForm()); setSubmitting(false); load()
  }

  const today = new Date().toDateString()
  const todayOverrides = overrides.filter(o => new Date(o.createdAt).toDateString() === today)
  const deniedOverrides = overrides.filter(o => o.status === 'denied').length
  const highestValue = overrides.reduce((max, o) => { const val = parseFloat(o.overrideValue?.replace(/[^0-9.]/g, '') || '0'); return val > max ? val : max }, 0)
  const oneHourAgo = new Date(Date.now() - 3600000)
  const recentCount = overrides.filter(o => new Date(o.createdAt) > oneHourAgo).length
  const velocityAlert = recentCount > 10

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      {velocityAlert && <div className="mb-6 bg-orange-500/10 border border-orange-500/40 rounded-xl p-4 flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" /><span className="text-orange-400 font-semibold">Override velocity alert: {recentCount} overrides in the last hour. Investigate potential abuse.</span></div>}
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-orange-400" /> Manager Overrides</h1><p className="text-zinc-500 text-sm mt-1">Audit log of all POS override events</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> Log Override</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: "Overrides Today", value: todayOverrides.length, color: 'text-orange-400' }, { label: "Highest Value Override", value: `$${highestValue.toFixed(2)}`, color: 'text-yellow-400' }, { label: "Denied Overrides", value: deniedOverrides, color: 'text-red-400' }].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><div className="text-zinc-500 text-sm mb-2">{label}</div><div className={cn('text-3xl font-bold', color)}>{value}</div></div>
        ))}
      </div>
      <div className="flex gap-3 mb-6">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500">
          <option value="">All Override Types</option>{OVERRIDE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {filterType && <button onClick={() => setFilterType('')} className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded-lg px-3 py-2">Clear</button>}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800">{['Type', 'Store', 'Register', 'Requested By', 'Approved By', 'Original', 'Override', 'Reason', 'Status', 'Date'].map(h => <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && <tr><td colSpan={10} className="text-center py-8 text-zinc-500">Loading…</td></tr>}
            {!loading && overrides.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-zinc-500">No overrides</td></tr>}
            {overrides.map(o => (
              <tr key={o.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_BADGE[o.overrideType] ?? 'bg-zinc-700 text-zinc-400')}>{o.overrideType}</span></td>
                <td className="px-4 py-3 text-zinc-400">{o.storeId || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{o.registerId || '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{o.requestedBy || '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{o.approvedBy || '—'}</td>
                <td className="px-4 py-3 font-mono text-zinc-400 text-xs">{o.originalValue || '—'}</td>
                <td className="px-4 py-3 font-mono text-yellow-400 text-xs">{o.overrideValue || '—'}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs max-w-[120px] truncate">{o.reason || '—'}</td>
                <td className="px-4 py-3"><span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', o.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>{o.status}</span></td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-zinc-100">Log Manager Override</h2><button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button></div>
            <form onSubmit={create} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-zinc-400 block mb-1">Override Type *</label><select required value={form.overrideType} onChange={e => setForm(p => ({ ...p, overrideType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500">{OVERRIDE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Status</label><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"><option value="approved">Approved</option><option value="denied">Denied</option></select></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Requested By</label><input value={form.requestedBy} onChange={e => setForm(p => ({ ...p, requestedBy: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Cashier name" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Approved By</label><input value={form.approvedBy} onChange={e => setForm(p => ({ ...p, approvedBy: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Manager name" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Store ID</label><input value={form.storeId} onChange={e => setForm(p => ({ ...p, storeId: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Register ID</label><input value={form.registerId} onChange={e => setForm(p => ({ ...p, registerId: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Original Value</label><input value={form.originalValue} onChange={e => setForm(p => ({ ...p, originalValue: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="$29.99" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Override Value</label><input value={form.overrideValue} onChange={e => setForm(p => ({ ...p, overrideValue: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="$19.99" /></div>
              </div>
              <div><label className="text-xs text-zinc-400 block mb-1">Reason</label><input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Reason for override…" /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button><button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">{submitting ? 'Saving…' : 'Log Override'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
