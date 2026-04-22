'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BIN_TYPES = ['PUTPICK', 'RECEIVE', 'SHIP', 'PUTAWAY', 'PICK', 'QC', 'FIXED']

type Store = { id: string; name: string }

export function NewZoneForm({ stores }: { stores: Store[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    storeId: '',
    code: '',
    description: '',
    binTypeCode: 'PUTPICK',
    rankNo: 0,
  })

  const set = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/warehouse/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
      setForm({ storeId: '', code: '', description: '', binTypeCode: 'PUTPICK', rankNo: 0 })
    } catch {
      alert('Error creating zone')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
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
        <Label className="text-xs text-zinc-400">Zone Code *</Label>
        <Input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. ZONE-A" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-400">Description *</Label>
        <Input required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Zone description" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Bin Type Code</Label>
          <select
            value={form.binTypeCode}
            onChange={e => set('binTypeCode', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          >
            {BIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-400">Rank</Label>
          <Input type="number" value={form.rankNo} onChange={e => set('rankNo', Number(e.target.value))} min={0} />
        </div>
      </div>
      <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
        {saving ? 'Creating…' : 'Create Zone'}
      </Button>
    </form>
  )
}
