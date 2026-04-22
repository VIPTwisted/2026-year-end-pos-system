'use client'

import { useEffect, useState } from 'react'
import { Building2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanyData {
  name?: string
  address?: string
  city?: string
  postCode?: string
  country?: string
  phone?: string
  email?: string
  vatNo?: string
  taxRegNo?: string
  iban?: string
  swift?: string
  bankAccountNo?: string
  giroNo?: string
  logoUrl?: string
}

const TABS = ['General', 'Communication', 'Payments', 'Shipping', 'Administration'] as const
type Tab = typeof TABS[number]

function FastTab({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded mb-0.5 transition-colors"
      style={open
        ? { background: 'rgba(79,70,229,0.2)', color: '#a5b4fc' }
        : { background: 'rgba(255,255,255,0.03)', color: 'rgba(165,180,252,0.5)' }}
    >
      {label}
      {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
    </button>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center py-2 border-b border-zinc-800/60">
      <label className="text-xs text-zinc-400 font-medium">{label}</label>
      <div className="col-span-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>
  )
}

export default function CompanyPage() {
  const [data, setData] = useState<CompanyData>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [openTabs, setOpenTabs] = useState<Set<Tab>>(new Set(['General', 'Communication', 'Payments']))

  useEffect(() => {
    fetch('/api/admin/company').then(r => r.json()).then(d => setData(d ?? {}))
  }, [])

  function toggle(tab: Tab) {
    setOpenTabs(prev => {
      const next = new Set(prev)
      next.has(tab) ? next.delete(tab) : next.add(tab)
      return next
    })
  }

  function set(key: keyof CompanyData, val: string) {
    setData(prev => ({ ...prev, [key]: val }))
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/admin/company', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">Company Information</h1>
            <p className="text-[11px] text-zinc-500">General company setup and legal details</p>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded transition-all',
            saved
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white',
            saving && 'opacity-60 cursor-not-allowed'
          )}
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="max-w-3xl space-y-1">
        {/* General */}
        <FastTab label="General" open={openTabs.has('General')} onToggle={() => toggle('General')} />
        {openTabs.has('General') && (
          <div className="px-4 py-3 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <Field label="Name" value={data.name ?? ''} onChange={v => set('name', v)} placeholder="Company legal name" />
            <Field label="Address" value={data.address ?? ''} onChange={v => set('address', v)} placeholder="Street address" />
            <Field label="City" value={data.city ?? ''} onChange={v => set('city', v)} />
            <Field label="Post Code" value={data.postCode ?? ''} onChange={v => set('postCode', v)} />
            <Field label="Country" value={data.country ?? ''} onChange={v => set('country', v)} placeholder="US" />
          </div>
        )}

        {/* Communication */}
        <FastTab label="Communication" open={openTabs.has('Communication')} onToggle={() => toggle('Communication')} />
        {openTabs.has('Communication') && (
          <div className="px-4 py-3 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <Field label="Phone No." value={data.phone ?? ''} onChange={v => set('phone', v)} type="tel" />
            <Field label="E-Mail" value={data.email ?? ''} onChange={v => set('email', v)} type="email" />
            <Field label="Logo URL" value={data.logoUrl ?? ''} onChange={v => set('logoUrl', v)} placeholder="https://…" />
          </div>
        )}

        {/* Payments */}
        <FastTab label="Payments" open={openTabs.has('Payments')} onToggle={() => toggle('Payments')} />
        {openTabs.has('Payments') && (
          <div className="px-4 py-3 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <Field label="IBAN" value={data.iban ?? ''} onChange={v => set('iban', v)} />
            <Field label="SWIFT Code" value={data.swift ?? ''} onChange={v => set('swift', v)} />
            <Field label="Bank Account No." value={data.bankAccountNo ?? ''} onChange={v => set('bankAccountNo', v)} />
            <Field label="Giro No." value={data.giroNo ?? ''} onChange={v => set('giroNo', v)} />
          </div>
        )}

        {/* Shipping */}
        <FastTab label="Shipping" open={openTabs.has('Shipping')} onToggle={() => toggle('Shipping')} />
        {openTabs.has('Shipping') && (
          <div className="px-4 py-3 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <p className="text-xs text-zinc-600 py-2">Shipping configuration — no additional fields at this level.</p>
          </div>
        )}

        {/* Administration */}
        <FastTab label="Administration" open={openTabs.has('Administration')} onToggle={() => toggle('Administration')} />
        {openTabs.has('Administration') && (
          <div className="px-4 py-3 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <Field label="VAT Registration No." value={data.vatNo ?? ''} onChange={v => set('vatNo', v)} />
            <Field label="Tax Registration No." value={data.taxRegNo ?? ''} onChange={v => set('taxRegNo', v)} />
          </div>
        )}
      </div>
    </main>
  )
}
