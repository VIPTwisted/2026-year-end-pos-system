'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Cpu, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Profile {
  id: string; profileNumber: string; profileName: string; hardwareStationType: string
  cashDrawerDevice: string | null; cashDrawerOpenBeforeTender: boolean
  barcodeDevice: string | null; barcodeKeyboardWedge: boolean
  printerDevice: string | null; printerDriver: string | null
  customerDisplayActive: boolean; customerDisplayLines: number
  scaleDevice: string | null; isActive: boolean
}

function SectionHeader({ title }: { title: string }) {
  return <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-medium border-b border-zinc-800 pb-2">{title}</p>
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn('w-8 h-4 rounded-full relative transition-colors', checked ? 'bg-blue-600' : 'bg-zinc-700')}>
      <div className={cn('absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500" />
    </div>
  )
}

export default function HardwareProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/hardware-profiles/${id}`).then(r => r.json()).then(d => { setProfile(d); setForm(d) })
  }, [id])

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/hardware-profiles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setProfile(d); setForm(d) }
    setSaving(false)
  }

  function set(key: string, value: string | boolean | number) { setForm(p => ({ ...p, [key]: value })) }

  if (!profile) return <main className="flex-1 p-6 bg-zinc-950"><div className="animate-pulse"><div className="h-6 bg-zinc-800 rounded w-48" /></div></main>

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link href="/channels/hardware-profiles" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs"><ChevronLeft className="w-3 h-3" /> Hardware Profiles</Link>
          <span className="text-zinc-700">/</span>
          <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2"><Cpu className="w-4 h-4 text-zinc-500" /> {profile.profileName}</h1>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
          <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* IDENTIFICATION */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <SectionHeader title="Identification" />
        <div className="grid grid-cols-3 gap-4">
          <Field label="Profile Number" value={form.profileNumber ?? ''} onChange={v => set('profileNumber', v)} />
          <Field label="Profile Name" value={form.profileName ?? ''} onChange={v => set('profileName', v)} />
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Station Type</label>
            <select value={form.hardwareStationType ?? 'dedicated'} onChange={e => set('hardwareStationType', e.target.value)} className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none">
              <option value="dedicated">Dedicated</option>
              <option value="shared">Shared</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
        </div>
      </section>

      {/* CASH DRAWER */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <SectionHeader title="Cash Drawer" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Device Name" value={form.cashDrawerDevice ?? ''} onChange={v => set('cashDrawerDevice', v)} />
          <div className="flex items-center gap-3 mt-5">
            <Toggle checked={form.cashDrawerOpenBeforeTender ?? true} onChange={v => set('cashDrawerOpenBeforeTender', v)} />
            <span className="text-xs text-zinc-400">Open drawer before tender</span>
          </div>
        </div>
      </section>

      {/* BARCODE SCANNER */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <SectionHeader title="Barcode Scanner" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Device Name" value={form.barcodeDevice ?? ''} onChange={v => set('barcodeDevice', v)} />
          <div className="flex items-center gap-3 mt-5">
            <Toggle checked={form.barcodeKeyboardWedge ?? true} onChange={v => set('barcodeKeyboardWedge', v)} />
            <span className="text-xs text-zinc-400">Keyboard wedge mode</span>
          </div>
        </div>
      </section>

      {/* RECEIPT PRINTER */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <SectionHeader title="Receipt Printer" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Device Name" value={form.printerDevice ?? ''} onChange={v => set('printerDevice', v)} />
          <Field label="Driver" value={form.printerDriver ?? ''} onChange={v => set('printerDriver', v)} />
        </div>
      </section>

      {/* CUSTOMER DISPLAY */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <SectionHeader title="Customer Display" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Toggle checked={form.customerDisplayActive ?? false} onChange={v => set('customerDisplayActive', v)} />
            <span className="text-xs text-zinc-400">Customer display active</span>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Display Lines</label>
            <input type="number" value={form.customerDisplayLines ?? 2} onChange={e => set('customerDisplayLines', parseInt(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500" />
          </div>
        </div>
      </section>

      {/* SCALE */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <SectionHeader title="Scale" />
        <Field label="Scale Device" value={form.scaleDevice ?? ''} onChange={v => set('scaleDevice', v)} />
      </section>
    </main>
  )
}
