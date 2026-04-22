'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Loader2, Save, ChevronRight } from 'lucide-react'

interface Tier {
  id: string
  name: string
  minSales: number
  commissionRate: number
  bonusFlat: number
  perks: string | null
  position: number
}

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
  tiers: Tier[]
  _count: { affiliates: number }
}

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addingTier, setAddingTier] = useState(false)
  const [tierForm, setTierForm] = useState({ name: '', minSales: 0, commissionRate: 0.1, bonusFlat: 0, perks: '' })
  const [savingTier, setSavingTier] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/affiliate/programs/${id}`)
    setProgram(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  async function handleSaveProgram(e: React.FormEvent) {
    e.preventDefault()
    if (!program) return
    setSaving(true)
    await fetch(`/api/affiliate/programs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: program.name, description: program.description,
        commissionType: program.commissionType, commissionRate: program.commissionRate,
        cookieDays: program.cookieDays, minPayout: program.minPayout,
        payoutCycle: program.payoutCycle, status: program.status,
      }),
    })
    setSaving(false)
  }

  async function handleAddTier(e: React.FormEvent) {
    e.preventDefault()
    setSavingTier(true)
    await fetch(`/api/affiliate/programs/${id}/tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tierForm),
    })
    setSavingTier(false)
    setAddingTier(false)
    setTierForm({ name: '', minSales: 0, commissionRate: 0.1, bonusFlat: 0, perks: '' })
    load()
  }

  async function handleDeleteTier(tid: string) {
    if (!confirm('Delete this tier?')) return
    await fetch(`/api/affiliate/programs/${id}/tiers?tid=${tid}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div className="p-8 text-zinc-500 text-sm">Loading...</div>
  if (!program) return <div className="p-8 text-rose-400 text-sm">Program not found</div>

  const pct = (r: number) => `${(r * 100).toFixed(1)}%`

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/affiliate/programs" className="text-zinc-500 hover:text-zinc-100"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-zinc-100">{program.name}</h1>
        <span className="text-xs text-zinc-500">{program._count.affiliates} affiliates</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-100 mb-4">Program Settings</h2>
        <form onSubmit={handleSaveProgram} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-zinc-400 mb-1">Name</label>
            <input value={program.name} onChange={e => setProgram(p => p ? { ...p, name: e.target.value } : p)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-zinc-400 mb-1">Description</label>
            <input value={program.description ?? ''} onChange={e => setProgram(p => p ? { ...p, description: e.target.value } : p)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Commission Type</label>
            <select value={program.commissionType} onChange={e => setProgram(p => p ? { ...p, commissionType: e.target.value } : p)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
              <option value="tiered">Tiered</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Base Rate (0–1)</label>
            <input type="number" step="0.01" min="0" max="1" value={program.commissionRate}
              onChange={e => setProgram(p => p ? { ...p, commissionRate: parseFloat(e.target.value) } : p)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Cookie Days</label>
            <input type="number" value={program.cookieDays}
              onChange={e => setProgram(p => p ? { ...p, cookieDays: parseInt(e.target.value) } : p)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Min Payout ($)</label>
            <input type="number" value={program.minPayout}
              onChange={e => setProgram(p => p ? { ...p, minPayout: parseFloat(e.target.value) } : p)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Payout Cycle</label>
            <select value={program.payoutCycle} onChange={e => setProgram(p => p ? { ...p, payoutCycle: e.target.value } : p)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Status</label>
            <select value={program.status} onChange={e => setProgram(p => p ? { ...p, status: e.target.value } : p)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Commission Tiers</h2>
          <button onClick={() => setAddingTier(true)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
            <Plus className="w-3 h-3" /> Add Tier
          </button>
        </div>

        {addingTier && (
          <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/40">
            <form onSubmit={handleAddTier} className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Tier Name</label>
                <input required value={tierForm.name} onChange={e => setTierForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Silver"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Min Sales ($)</label>
                <input type="number" min="0" value={tierForm.minSales}
                  onChange={e => setTierForm(f => ({ ...f, minSales: parseFloat(e.target.value) }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Rate (0–1)</label>
                <input type="number" step="0.01" min="0" max="1" value={tierForm.commissionRate}
                  onChange={e => setTierForm(f => ({ ...f, commissionRate: parseFloat(e.target.value) }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Bonus ($)</label>
                <input type="number" min="0" value={tierForm.bonusFlat}
                  onChange={e => setTierForm(f => ({ ...f, bonusFlat: parseFloat(e.target.value) }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Perks</label>
                <input value={tierForm.perks} onChange={e => setTierForm(f => ({ ...f, perks: e.target.value }))}
                  placeholder="e.g. Priority support"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <button type="button" onClick={() => setAddingTier(false)} className="text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1.5">Cancel</button>
                <button type="submit" disabled={savingTier}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium disabled:opacity-50">
                  {savingTier && <Loader2 className="w-3 h-3 animate-spin" />} Add Tier
                </button>
              </div>
            </form>
          </div>
        )}

        {program.tiers.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 text-sm">No tiers yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                  <th className="px-5 py-3 text-left">Level</th>
                  <th className="px-5 py-3 text-left">Tier Name</th>
                  <th className="px-5 py-3 text-right">Min Sales</th>
                  <th className="px-5 py-3 text-right">Rate</th>
                  <th className="px-5 py-3 text-right">Bonus</th>
                  <th className="px-5 py-3 text-left">Perks</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {program.tiers.map((tier, idx) => (
                  <tr key={tier.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: idx + 1 }).map((_, i) => (
                          <ChevronRight key={i} className="w-3 h-3 text-blue-400" />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-zinc-100">{tier.name}</td>
                    <td className="px-5 py-3 text-right text-zinc-400">${tier.minSales.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-medium">{pct(tier.commissionRate)}</td>
                    <td className="px-5 py-3 text-right text-amber-400">{tier.bonusFlat > 0 ? `$${tier.bonusFlat}` : '—'}</td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{tier.perks ?? '—'}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDeleteTier(tier.id)} className="text-zinc-500 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Affiliates in Program</h2>
          <Link href={`/affiliate/affiliates?programId=${id}`} className="text-xs text-blue-400 hover:underline">
            View All ({program._count.affiliates})
          </Link>
        </div>
        <p className="text-sm text-zinc-500 mt-2">
          {program._count.affiliates === 0 ? 'No affiliates enrolled yet.' : `${program._count.affiliates} affiliates enrolled.`}
        </p>
      </div>
    </div>
  )
}
