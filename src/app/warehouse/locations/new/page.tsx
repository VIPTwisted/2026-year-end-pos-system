'use client'

import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type BoolFieldKey =
  | 'binMandatory'
  | 'requireReceive'
  | 'requireShipment'
  | 'requirePick'
  | 'requirePutaway'
  | 'isCrossDock'

export default function NewLocationPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    locationCode: '',
    name: '',
    address: '',
    city: '',
    state: '',
    binMandatory: true,
    requireReceive: false,
    requireShipment: false,
    requirePick: false,
    requirePutaway: false,
    isCrossDock: false,
  })

  const setField = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/warehouse/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to create location')
      }
      router.push('/warehouse/locations')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating location')
    } finally {
      setSaving(false)
    }
  }

  function BoolToggle({ field, label }: { field: BoolFieldKey; label: string }) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-zinc-800/30 last:border-0">
        <Label className="text-xs text-zinc-400">{label}</Label>
        <button
          type="button"
          onClick={() => setField(field, !form[field])}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${form[field] ? 'bg-blue-600' : 'bg-zinc-700'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form[field] ? 'translate-x-[18px]' : 'translate-x-1'}`} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Location" />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* General FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <div className="px-4 py-3 border-b border-zinc-800/40">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">General</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Location Code *</Label>
                <Input
                  required
                  maxLength={10}
                  value={form.locationCode}
                  onChange={e => setField('locationCode', e.target.value.toUpperCase())}
                  placeholder="e.g. EAST-WH"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="Location name…"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Address</Label>
                <Input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Street address…" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">City</Label>
                <Input value={form.city} onChange={e => setField('city', e.target.value)} placeholder="City…" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">State</Label>
                <Input value={form.state} onChange={e => setField('state', e.target.value)} placeholder="State…" />
              </div>
            </div>
          </div>

          {/* Policies FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <div className="px-4 py-3 border-b border-zinc-800/40">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Warehouse Policies</h3>
            </div>
            <div className="p-5 space-y-0">
              <BoolToggle field="binMandatory"    label="Bin Mandatory" />
              <BoolToggle field="requireReceive"  label="Require Receive" />
              <BoolToggle field="requireShipment" label="Require Shipment" />
              <BoolToggle field="requirePick"     label="Require Pick" />
              <BoolToggle field="requirePutaway"  label="Require Put-Away" />
              <BoolToggle field="isCrossDock"     label="Cross-Dock" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
              {saving ? 'Creating…' : 'Create Location'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
