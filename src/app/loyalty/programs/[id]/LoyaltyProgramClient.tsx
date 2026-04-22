'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Check, X } from 'lucide-react'

type Tier = {
  id: string
  name: string
  minimumPoints: number
  earningRate: number
  rewardRate: number
  description: string | null
  color: string | null
  sortOrder: number
}

type Program = {
  id: string
  name: string
  description: string | null
  status: string
  startDate: Date | null
  endDate: Date | null
}

interface Props {
  program: Program
  tiers: Tier[]
  memberCount: number
  pointsOutstanding: number
  lifetimePoints: number
}

const PRESET_COLORS = ['#cd7f32', '#a8a9ad', '#ffd700', '#e5e4e2'] // bronze, silver, gold, platinum

export function LoyaltyProgramClient({ program, tiers: initialTiers, memberCount, pointsOutstanding, lifetimePoints }: Props) {
  const router = useRouter()
  const [tiers, setTiers] = useState<Tier[]>(initialTiers)
  const [editingInfo, setEditingInfo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addingTier, setAddingTier] = useState(false)
  const [tierSaving, setTierSaving] = useState(false)
  const [error, setError] = useState('')

  const [infoForm, setInfoForm] = useState({
    name: program.name,
    description: program.description ?? '',
    status: program.status,
    startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : '',
    endDate: program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : '',
  })

  const [tierForm, setTierForm] = useState({
    name: '',
    minimumPoints: '0',
    earningRate: '1.0',
    rewardRate: '0.01',
    description: '',
    color: PRESET_COLORS[tiers.length % PRESET_COLORS.length],
  })

  async function saveInfo() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/loyalty/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: infoForm.name,
          description: infoForm.description || null,
          status: infoForm.status,
          startDate: infoForm.startDate || null,
          endDate: infoForm.endDate || null,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setEditingInfo(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function addTier() {
    if (!tierForm.name.trim()) return
    setTierSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/loyalty/programs/${program.id}/tiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tierForm.name.trim(),
          minimumPoints: parseInt(tierForm.minimumPoints) || 0,
          earningRate: parseFloat(tierForm.earningRate) || 1.0,
          rewardRate: parseFloat(tierForm.rewardRate) || 0.01,
          description: tierForm.description || null,
          color: tierForm.color,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const newTier = await res.json()
      setTiers(prev => [...prev, newTier])
      setTierForm({ name: '', minimumPoints: '0', earningRate: '1.0', rewardRate: '0.01', description: '', color: PRESET_COLORS[(tiers.length + 1) % PRESET_COLORS.length] })
      setAddingTier(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add tier')
    } finally {
      setTierSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-[13px] text-red-400">{error}</div>
      )}

      {/* Program Info Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">{program.name}</h2>
            <p className="text-[13px] text-zinc-500 mt-0.5">Program Details</p>
          </div>
          {!editingInfo && (
            <button
              onClick={() => setEditingInfo(true)}
              className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Members', value: memberCount.toLocaleString() },
            { label: 'Points Outstanding', value: pointsOutstanding.toLocaleString() },
            { label: 'Lifetime Points', value: lifetimePoints.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="bg-zinc-800/60 rounded-lg px-4 py-3">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-xl font-bold text-zinc-100 tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        {editingInfo ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Name *</label>
              <input
                value={infoForm.name}
                onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Description</label>
              <textarea
                value={infoForm.description}
                onChange={e => setInfoForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  value={infoForm.status}
                  onChange={e => setInfoForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Start Date</label>
                <input type="date" value={infoForm.startDate} onChange={e => setInfoForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">End Date</label>
                <input type="date" value={infoForm.endDate} onChange={e => setInfoForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveInfo} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] rounded transition-colors">
                <Check className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditingInfo(false); setError('') }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[13px] rounded transition-colors">
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">Status</span>
              <span className={`font-medium ${program.status === 'active' ? 'text-emerald-400' : 'text-zinc-500'}`}>{program.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Description</span>
              <span className="text-zinc-300">{program.description ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Start Date</span>
              <span className="text-zinc-300">{program.startDate ? new Date(program.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">End Date</span>
              <span className="text-zinc-300">{program.endDate ? new Date(program.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tiers Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
          <div>
            <h3 className="text-[13px] font-semibold text-zinc-100">Loyalty Tiers</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">{tiers.length} tier{tiers.length !== 1 ? 's' : ''} configured</p>
          </div>
          <button
            onClick={() => setAddingTier(v => !v)}
            className="flex items-center gap-1.5 text-[12px] text-zinc-300 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tier
          </button>
        </div>

        {/* Add Tier Inline Form */}
        {addingTier && (
          <div className="px-5 py-4 bg-zinc-800/40 border-b border-zinc-800">
            <p className="text-[11px] text-zinc-400 uppercase tracking-wide mb-3">New Tier</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Tier Name *</label>
                <input value={tierForm.name} onChange={e => setTierForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Bronze" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Min Points</label>
                <input type="number" value={tierForm.minimumPoints} onChange={e => setTierForm(f => ({ ...f, minimumPoints: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Earning Rate (pts/$1)</label>
                <input type="number" step="0.1" value={tierForm.earningRate} onChange={e => setTierForm(f => ({ ...f, earningRate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Reward Rate ($/pt)</label>
                <input type="number" step="0.001" value={tierForm.rewardRate} onChange={e => setTierForm(f => ({ ...f, rewardRate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={tierForm.color} onChange={e => setTierForm(f => ({ ...f, color: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border border-zinc-700" />
                  <div className="flex gap-1">
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => setTierForm(f => ({ ...f, color: c }))}
                        className="w-5 h-5 rounded-full border-2 transition-all"
                        style={{ backgroundColor: c, borderColor: tierForm.color === c ? 'white' : 'transparent' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Description</label>
                <input value={tierForm.description} onChange={e => setTierForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addTier} disabled={tierSaving || !tierForm.name.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] rounded transition-colors">
                <Check className="w-3.5 h-3.5" />
                {tierSaving ? 'Adding...' : 'Add Tier'}
              </button>
              <button onClick={() => { setAddingTier(false); setError('') }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[13px] rounded transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {tiers.length === 0 ? (
          <div className="px-5 py-10 text-center text-zinc-600">
            <p className="text-[13px] text-zinc-400 mb-1">No tiers configured</p>
            <p className="text-[12px]">Add tiers to define earning rates for different member levels</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/60 text-zinc-500 text-[11px] uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5 font-medium">Tier</th>
                  <th className="text-right py-2.5 font-medium">Min Points</th>
                  <th className="text-right py-2.5 font-medium">Earning Rate</th>
                  <th className="text-right py-2.5 font-medium">Reward Rate</th>
                  <th className="text-left py-2.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, idx) => (
                  <tr key={tier.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== tiers.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tier.color ?? '#71717a' }} />
                        <span className="font-medium text-zinc-200">{tier.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums font-mono">
                      {tier.minimumPoints.toLocaleString()} pts
                    </td>
                    <td className="py-3 pr-4 text-right text-emerald-400 tabular-nums font-mono">
                      {tier.earningRate}x
                    </td>
                    <td className="py-3 pr-4 text-right text-amber-400 tabular-nums font-mono">
                      ${tier.rewardRate.toFixed(3)}/pt
                    </td>
                    <td className="py-3 pr-5 text-zinc-500 text-[12px]">
                      {tier.description ?? '—'}
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
