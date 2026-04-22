'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Target, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

interface Program {
  id: string
  name: string
  description: string | null
  commissionType: string
  commissionRate: number
  cookieDays: number
  minPayout: number
  payoutCycle: string
  status: string
  _count: { affiliates: number; tiers: number }
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  inactive: 'bg-zinc-700 text-zinc-400',
  paused: 'bg-amber-500/15 text-amber-400',
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', commissionType: 'percentage', commissionRate: 0.1,
    cookieDays: 30, minPayout: 25, payoutCycle: 'monthly',
  })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/affiliate/programs')
    setPrograms(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/affiliate/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', description: '', commissionType: 'percentage', commissionRate: 0.1, cookieDays: 30, minPayout: 25, payoutCycle: 'monthly' })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this program?')) return
    await fetch(`/api/affiliate/programs/${id}`, { method: 'DELETE' })
    load()
  }

  const pct = (r: number) => `${(r * 100).toFixed(1)}%`

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-zinc-100">Affiliate Programs</h1>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Program
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">New Affiliate Program</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-500" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Program Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Commission Type</label>
              <select value={form.commissionType} onChange={e => setForm(f => ({ ...f, commissionType: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
                <option value="tiered">Tiered</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Rate (0–1)</label>
              <input type="number" step="0.01" min="0" max="1" value={form.commissionRate}
                onChange={e => setForm(f => ({ ...f, commissionRate: parseFloat(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Cookie Days</label>
              <input type="number" min="1" value={form.cookieDays}
                onChange={e => setForm(f => ({ ...f, cookieDays: parseInt(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Min Payout ($)</label>
              <input type="number" min="0" value={form.minPayout}
                onChange={e => setForm(f => ({ ...f, minPayout: parseFloat(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Payout Cycle</label>
              <select value={form.payoutCycle} onChange={e => setForm(f => ({ ...f, payoutCycle: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                Create Program
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
        ) : programs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No programs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-right">Rate</th>
                  <th className="px-5 py-3 text-right">Cookie</th>
                  <th className="px-5 py-3 text-right">Min Payout</th>
                  <th className="px-5 py-3 text-right">Tiers</th>
                  <th className="px-5 py-3 text-right">Affiliates</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {programs.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/affiliate/programs/${p.id}`} className="text-zinc-100 hover:text-blue-400 font-medium">{p.name}</Link>
                      {p.description && <div className="text-xs text-zinc-500 truncate max-w-xs">{p.description}</div>}
                    </td>
                    <td className="px-5 py-3 text-zinc-400 capitalize">{p.commissionType}</td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-medium">{pct(p.commissionRate)}</td>
                    <td className="px-5 py-3 text-right text-zinc-400">{p.cookieDays}d</td>
                    <td className="px-5 py-3 text-right text-zinc-400">${p.minPayout}</td>
                    <td className="px-5 py-3 text-right text-zinc-300">{p._count.tiers}</td>
                    <td className="px-5 py-3 text-right text-zinc-300">{p._count.affiliates}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/affiliate/programs/${p.id}`} className="text-zinc-500 hover:text-zinc-100"><Pencil className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(p.id)} className="text-zinc-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
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
