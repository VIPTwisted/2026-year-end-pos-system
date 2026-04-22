'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Gift, Plus, Pencil, Trash2, X, Check, Star } from 'lucide-react'

interface Reward {
  id: string; name: string; description: string | null; pointsCost: number
  rewardType: string; rewardValue: number; isActive: boolean; timesRedeemed: number
}

const REWARD_TYPES = ['discount', 'free_item', 'gift_card', 'shipping', 'other']

export default function LoyaltyRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', pointsCost: '', rewardType: 'discount', rewardValue: '', isActive: true })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/loyalty/rewards')
    if (res.ok) setRewards(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setEditId(null)
    setForm({ name: '', description: '', pointsCost: '', rewardType: 'discount', rewardValue: '', isActive: true })
    setShowModal(true)
  }

  function openEdit(r: Reward) {
    setEditId(r.id)
    setForm({ name: r.name, description: r.description || '', pointsCost: r.pointsCost.toString(), rewardType: r.rewardType, rewardValue: r.rewardValue.toString(), isActive: r.isActive })
    setShowModal(true)
  }

  async function save() {
    setSaving(true)
    const url = editId ? `/api/loyalty/rewards/${editId}` : '/api/loyalty/rewards'
    const method = editId ? 'PATCH' : 'POST'
    await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, pointsCost: parseInt(form.pointsCost), rewardValue: parseFloat(form.rewardValue || '0') }),
    })
    setShowModal(false); load(); setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete reward?')) return
    await fetch(`/api/loyalty/rewards/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <TopBar title="Loyalty Rewards" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Reward Catalog</h2>
            <p className="text-sm text-zinc-500">{rewards.length} rewards</p>
          </div>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" />New Reward</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Card key={i}><CardContent className="h-36 animate-pulse bg-zinc-800 rounded" /></Card>)}</div>
        ) : rewards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Gift className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No rewards configured</p>
              <Button size="sm" className="mt-3" onClick={openNew}><Plus className="w-3 h-3 mr-1" />Add First Reward</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {rewards.map(r => (
              <Card key={r.id} className={cn(!r.isActive && 'opacity-60')}>
                <CardContent className="pt-5 pb-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-zinc-100">{r.name}</p>
                    <Badge variant={r.isActive ? 'success' : 'secondary'}>{r.isActive ? 'Active' : 'Off'}</Badge>
                  </div>
                  {r.description && <p className="text-xs text-zinc-500">{r.description}</p>}
                  <div className="text-xs text-zinc-400 space-y-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="font-mono text-amber-400">{r.pointsCost.toLocaleString()}</span>
                      <span className="text-zinc-500">pts</span>
                    </div>
                    <p>Type: {r.rewardType.replace('_', ' ')}</p>
                    <p>Value: ${r.rewardValue.toFixed(2)}</p>
                    <p className="text-zinc-600">{r.timesRedeemed} redeemed</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(r.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">{editId ? 'Edit Reward' : 'New Reward'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Reward Name *</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. $10 Off Next Purchase" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Points Cost *</label>
                  <input type="number" min="1" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.pointsCost} onChange={e => setForm(f => ({ ...f, pointsCost: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Reward Value ($)</label>
                  <input type="number" min="0" step="0.01" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.rewardValue} onChange={e => setForm(f => ({ ...f, rewardValue: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Reward Type</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                  value={form.rewardType} onChange={e => setForm(f => ({ ...f, rewardType: e.target.value }))}>
                  {REWARD_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={save} disabled={saving || !form.name.trim() || !form.pointsCost}>
                <Check className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save Reward'}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
