'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Save } from 'lucide-react'

type Tier = {
  id: string
  name: string
  minimumPoints: number
  earningRate: number
  rewardRate: number
  color: string | null
  description: string | null
  sortOrder: number
  _count: { cards: number }
}

const PRESET_COLORS = ['#78716c', '#cd7f32', '#c0c0c0', '#ffd700', '#b9f2ff', '#9333ea']

export function TierManager({ programId, initialTiers }: { programId: string; initialTiers: Tier[] }) {
  const router = useRouter()
  const [tiers, setTiers] = useState<Tier[]>(initialTiers)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [newTier, setNewTier] = useState({
    name: '',
    minimumPoints: 0,
    earningRate: 1.0,
    rewardRate: 0.01,
    color: '#78716c',
    description: '',
    sortOrder: initialTiers.length,
  })

  async function handleAdd() {
    if (!newTier.name) { setError('Name required'); return }
    setLoading(true)
    setError('')
    const res = await fetch(`/api/loyalty/programs/${programId}/tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTier),
    })
    setLoading(false)
    if (res.ok) {
      setShowAdd(false)
      setNewTier({ name: '', minimumPoints: 0, earningRate: 1.0, rewardRate: 0.01, color: '#78716c', description: '', sortOrder: tiers.length + 1 })
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tier? Members on this tier will be unassigned.')) return
    await fetch(`/api/loyalty/tiers/${id}`, { method: 'DELETE' })
    setTiers(t => t.filter(tier => tier.id !== id))
    router.refresh()
  }

  return (
    <div>
      {tiers.length === 0 && !showAdd ? (
        <div className="py-12 text-center text-zinc-500">
          <p className="mb-4 text-sm">No tiers defined. Add your first tier below.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <th className="text-left p-4 font-medium">Tier</th>
              <th className="text-right p-4 font-medium">Min Lifetime Points</th>
              <th className="text-right p-4 font-medium">Earn Rate</th>
              <th className="text-right p-4 font-medium">Reward Rate</th>
              <th className="text-right p-4 font-medium">Members</th>
              <th className="text-left p-4 font-medium">Description</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {tiers.map(tier => (
              <tr key={tier.id} className="hover:bg-zinc-800/30">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tier.color ?? '#71717a' }}
                    />
                    <span className="font-semibold text-zinc-100">{tier.name}</span>
                  </div>
                </td>
                <td className="p-4 text-right font-mono text-zinc-300">
                  {tier.minimumPoints.toLocaleString()} pts
                </td>
                <td className="p-4 text-right text-zinc-300">
                  {tier.earningRate}x
                </td>
                <td className="p-4 text-right text-zinc-300">
                  ${tier.rewardRate.toFixed(3)}/pt
                </td>
                <td className="p-4 text-right text-zinc-400">
                  {tier._count.cards.toLocaleString()}
                </td>
                <td className="p-4 text-zinc-500 text-xs max-w-xs truncate">
                  {tier.description ?? '—'}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(tier.id)}
                    disabled={tier._count.cards > 0}
                    title={tier._count.cards > 0 ? 'Cannot delete: has active members' : 'Delete tier'}
                    className="text-zinc-600 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAdd && (
        <div className="border-t border-zinc-800 p-4 bg-zinc-800/30 space-y-4">
          <p className="text-sm font-semibold text-zinc-300">New Tier</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Name</Label>
              <Input
                value={newTier.name}
                onChange={e => setNewTier(t => ({ ...t, name: e.target.value }))}
                placeholder="e.g. Gold"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Min Lifetime Points</Label>
              <Input
                type="number"
                value={newTier.minimumPoints}
                onChange={e => setNewTier(t => ({ ...t, minimumPoints: parseInt(e.target.value) || 0 }))}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Earn Rate (multiplier)</Label>
              <Input
                type="number"
                step="0.1"
                value={newTier.earningRate}
                onChange={e => setNewTier(t => ({ ...t, earningRate: parseFloat(e.target.value) || 1 }))}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Reward Rate ($/pt)</Label>
              <Input
                type="number"
                step="0.001"
                value={newTier.rewardRate}
                onChange={e => setNewTier(t => ({ ...t, rewardRate: parseFloat(e.target.value) || 0.01 }))}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-zinc-400 text-xs mb-2 block">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTier(t => ({ ...t, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${newTier.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={newTier.color}
                onChange={e => setNewTier(t => ({ ...t, color: e.target.value }))}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>
          <div>
            <Label className="text-zinc-400 text-xs mb-1 block">Description (optional)</Label>
            <Input
              value={newTier.description}
              onChange={e => setNewTier(t => ({ ...t, description: e.target.value }))}
              placeholder="Free shipping, early access, birthday bonus..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100 h-8 text-sm"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={loading}>
              <Save className="w-3.5 h-3.5 mr-1" />
              {loading ? 'Saving...' : 'Save Tier'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="border-zinc-700 text-zinc-300">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!showAdd && (
        <div className="p-4 border-t border-zinc-800">
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-1" /> Add Tier
          </Button>
        </div>
      )}
    </div>
  )
}
