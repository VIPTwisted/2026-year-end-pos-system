'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, Layers, Pencil, Trash2, X, Check } from 'lucide-react'

interface GiftCardProgram {
  id: string
  name: string
  prefix: string
  initialValue: number | null
  isReloadable: boolean
  expiryMonths: number | null
  isActive: boolean
  _count?: { cards: number }
  createdAt: string
}

export default function GiftCardProgramsPage() {
  const [programs, setPrograms] = useState<GiftCardProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', prefix: 'GC', initialValue: '', isReloadable: true, expiryMonths: '', isActive: true,
  })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/gift-cards/programs')
    if (res.ok) setPrograms(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditId(null)
    setForm({ name: '', prefix: 'GC', initialValue: '', isReloadable: true, expiryMonths: '', isActive: true })
    setShowModal(true)
  }

  function openEdit(p: GiftCardProgram) {
    setEditId(p.id)
    setForm({
      name: p.name, prefix: p.prefix,
      initialValue: p.initialValue?.toString() || '',
      isReloadable: p.isReloadable,
      expiryMonths: p.expiryMonths?.toString() || '',
      isActive: p.isActive,
    })
    setShowModal(true)
  }

  async function save() {
    setSaving(true)
    const url = editId ? `/api/gift-cards/programs/${editId}` : '/api/gift-cards/programs'
    const method = editId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        initialValue: form.initialValue ? parseFloat(form.initialValue) : null,
        expiryMonths: form.expiryMonths ? parseInt(form.expiryMonths) : null,
      }),
    })
    if (res.ok) { setShowModal(false); load() }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete this program?')) return
    await fetch(`/api/gift-cards/programs/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <TopBar title="Gift Card Programs" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Programs</h2>
            <p className="text-sm text-zinc-500">{programs.length} configured</p>
          </div>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" />New Program</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}><CardContent className="h-32 animate-pulse bg-zinc-800 rounded" /></Card>
            ))}
          </div>
        ) : programs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Layers className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No programs yet</p>
              <Button size="sm" className="mt-3" onClick={openNew}><Plus className="w-3 h-3 mr-1" />Create First Program</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {programs.map(p => (
              <Card key={p.id} className={cn(!p.isActive && 'opacity-60')}>
                <CardContent className="pt-5 pb-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-zinc-100">{p.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">Prefix: {p.prefix}</p>
                    </div>
                    <Badge variant={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    {p.initialValue && <p>Default value: ${p.initialValue.toFixed(2)}</p>}
                    <p>{p.isReloadable ? 'Reloadable' : 'Single-use'}</p>
                    {p.expiryMonths ? <p>Expires: {p.expiryMonths} months</p> : <p>No expiry</p>}
                    <p className="text-zinc-500">{p._count?.cards ?? 0} cards issued</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      <Pencil className="w-3 h-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
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
              <h3 className="font-semibold text-zinc-100">{editId ? 'Edit Program' : 'New Program'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Program Name *</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Standard Gift Card"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Card Prefix</label>
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.prefix} onChange={e => setForm(f => ({ ...f, prefix: e.target.value }))} placeholder="GC" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Default Value ($)</label>
                  <input type="number" min="0" step="0.01"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.initialValue} onChange={e => setForm(f => ({ ...f, initialValue: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Expiry (months, blank = never)</label>
                <input type="number" min="1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={form.expiryMonths} onChange={e => setForm(f => ({ ...f, expiryMonths: e.target.value }))} placeholder="e.g. 24" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" checked={form.isReloadable} onChange={e => setForm(f => ({ ...f, isReloadable: e.target.checked }))} />
                  Reloadable
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  Active
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={save} disabled={saving || !form.name.trim()}>
                <Check className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save Program'}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
