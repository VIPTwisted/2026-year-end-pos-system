'use client'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const BIN_TYPES = ['RECEIVE', 'SHIP', 'PUTAWAY', 'PICK', 'PUTPICK', 'QC', 'FIXED']

type Store = { id: string; name: string }
type Zone = { id: string; code: string; description: string }

export default function NewBinPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    storeId: '',
    zoneId: '',
    code: '',
    description: '',
    binType: 'PUTPICK',
    rankNo: 0,
    maxQty: '',
    maxCubage: '',
    isDedicated: false,
    isFixed: false,
    isBlocked: false,
  })

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(setStores)
  }, [])

  useEffect(() => {
    if (!form.storeId) { setZones([]); return }
    fetch(`/api/warehouse/zones?storeId=${form.storeId}`).then(r => r.json()).then(setZones)
  }, [form.storeId])

  const set = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/warehouse/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          zoneId: form.zoneId || null,
          maxQty: form.maxQty ? Number(form.maxQty) : null,
          maxCubage: form.maxCubage ? Number(form.maxCubage) : null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const bin = await res.json()
      router.push(`/warehouse/bins/${bin.id}`)
    } catch {
      alert('Error creating bin')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="New Bin" />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Bin Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Store *</Label>
                <select
                  required
                  value={form.storeId}
                  onChange={e => set('storeId', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select store…</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Zone</Label>
                <select
                  value={form.zoneId}
                  onChange={e => set('zoneId', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">No zone</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.code} — {z.description}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Bin Code *</Label>
                <Input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. A-01-01" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Bin Type</Label>
                <select
                  value={form.binType}
                  onChange={e => set('binType', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {BIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Description</Label>
              <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Rank No</Label>
                <Input type="number" value={form.rankNo} onChange={e => set('rankNo', Number(e.target.value))} min={0} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Max Qty</Label>
                <Input type="number" value={form.maxQty} onChange={e => set('maxQty', e.target.value)} placeholder="Unlimited" min={0} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Max Cubage</Label>
                <Input type="number" value={form.maxCubage} onChange={e => set('maxCubage', e.target.value)} placeholder="Unlimited" min={0} />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              {[
                { key: 'isDedicated', label: 'Dedicated' },
                { key: 'isFixed', label: 'Fixed' },
                { key: 'isBlocked', label: 'Blocked' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={e => set(key, e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
              {saving ? 'Creating…' : 'Create Bin'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
