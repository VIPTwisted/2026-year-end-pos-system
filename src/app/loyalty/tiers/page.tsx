'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, Crown, Pencil, Trash2, X, Check, Users } from 'lucide-react'

interface LoyaltyTier {
  id: string; name: string; minPoints: number; multiplier: number
  perksJson: string | null; colorHex: string | null; sortOrder: number
  _count?: { members: number }
}

export default function LoyaltyTiersPage() {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', minPoints: '0', multiplier: '1.0', perksJson: '', colorHex: '#6366f1', sortOrder: '0' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/loyalty/tiers')
    if (res.ok) setTiers(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setEditId(null)
    setForm({ name: '', minPoints: '0', multiplier: '1.0', perksJson: '', colorHex: '#6366f1', sortOrder: '0' })
    setShowModal(true)
  }

  function openEdit(t: LoyaltyTier) {
    setEditId(t.id)
    setForm({ name: t.name, minPoints: t.minPoints.toString(), multiplier: t.multiplier.toString(), perksJson: t.perksJson || '', colorHex: t.colorHex || '#6366f1', sortOrder: t.sortOrder.toString() })
    setShowModal(true)
  }

  async function save() {
    setSaving(true)
    const url = editId ? `/api/loyalty/tiers/${editId}` : '/api/loyalty/tiers'
    const method = editId ? 'PATCH' : 'POST'
    await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, minPoints: parseInt(form.minPoints), multiplier: parseFloat(form.multiplier), sortOrder: parseInt(form.sortOrder) }),
    })
    setShowModal(false); load(); setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete this tier?')) return
    await fetch(`/api/loyalty/tiers/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <TopBar title="Loyalty Tiers" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Tier Configuration</h2>
            <p className="text-sm text-zinc-500">{tiers.length} tiers defined</p>
          </div>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" />New Tier</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Card key={i}><CardContent className="h-40 animate-pulse bg-zinc-800 rounded" /></Card>)}
          </div>
        ) : tiers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Crown className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No tiers configured</p>
              <Button size="sm" className="mt-3" onClick={openNew}><Plus className="w-3 h-3 mr-1" />Create First Tier</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {tiers.map(t => {
              const perks = t.perksJson ? (() => { try { return JSON.parse(t.perksJson) } catch { return [] } })() : []
              return (
                <Card key={t.id}>
                  <CardContent className="pt-5 pb-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.colorHex || '#6366f1' }} />
                      <p className="font-semibold text-zinc-100">{t.name}</p>
                    </div>
                    <div className="text-xs text-zinc-400 space-y-1">
                      <p>Min points: <span className="text-zinc-200 font-mono">{t.minPoints.toLocaleString()}</span></p>
                      <p>Multiplier: <span className="text-emerald-400 font-mono">{t.multiplier}x</span></p>
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Users className="w-3 h-3" /><span>{t._count?.members ?? 0} members</span>
                      </div>
                    </div>
                    {perks.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {perks.slice(0, 3).map((perk: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{perk}</Badge>
                        ))}
                        {perks.length > 3 && <Badge variant="secondary" className="text-xs">+{perks.length - 3}</Badge>}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(t.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">{editId ? 'Edit Tier' : 'New Tier'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Tier Name *</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Gold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Min Points</label>
                  <input type="number" min="0" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.minPoints} onChange={e => setForm(f => ({ ...f, minPoints: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Multiplier</label>
                  <input type="number" min="0.1" step="0.1" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.multiplier} onChange={e => setForm(f => ({ ...f, multiplier: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Color</label>
                  <input type="color" className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded px-1 py-1 cursor-pointer"
                    value={form.colorHex} onChange={e => setForm(f => ({ ...f, colorHex: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Sort Order</label>
                  <input type="number" min="0" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Perks (JSON array)</label>
                <textarea rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
                  value={form.perksJson} onChange={e => setForm(f => ({ ...f, perksJson: e.target.value }))}
                  placeholder='["Free shipping", "Priority support"]' />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={save} disabled={saving || !form.name.trim()}>
                <Check className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save Tier'}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
