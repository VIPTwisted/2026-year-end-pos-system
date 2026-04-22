'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Globe, Store, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Channel Type', 'Basic Info', 'Settings']
const CHANNEL_TYPES = [
  { value: 'online_store', label: 'Online Store', icon: Globe, desc: 'E-commerce and web storefront' },
  { value: 'retail_store', label: 'Retail Store', icon: Store, desc: 'Physical brick-and-mortar location' },
  { value: 'call_center', label: 'Call Center', icon: Phone, desc: 'Phone order and customer service' },
]

export default function NewChannelPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    channelType: '',
    retailChannelId: '',
    name: '',
    searchName: '',
    operatingUnitNumber: '',
    legalEntity: '',
    warehouse: '',
    storeTimeZone: 'America/New_York',
    currency: 'USD',
    defaultCustomerName: '',
    functionalityProfile: '',
    pricesIncludeSalesTax: false,
  })

  function set(key: string, value: string | boolean) {
    setForm(p => ({ ...p, [key]: value }))
  }

  async function submit() {
    setSaving(true)
    const res = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const ch = await res.json()
      router.push(`/channels/${ch.id}`)
    } else {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/channels" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs">
            <ChevronLeft className="w-3 h-3" /> Channels
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-300">New Channel</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors',
                i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={cn('ml-2 text-xs', i === step ? 'text-zinc-200' : 'text-zinc-600')}>{s}</span>
              {i < STEPS.length - 1 && <div className={cn('w-12 h-px mx-3', i < step ? 'bg-emerald-600' : 'bg-zinc-800')} />}
            </div>
          ))}
        </div>

        {/* Step 0: Channel Type */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">Select channel type</h2>
            {CHANNEL_TYPES.map(ct => {
              const Icon = ct.icon
              return (
                <button
                  key={ct.value}
                  onClick={() => set('channelType', ct.value)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all',
                    form.channelType === ct.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  )}
                >
                  <Icon className={cn('w-5 h-5', form.channelType === ct.value ? 'text-blue-400' : 'text-zinc-500')} />
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{ct.label}</div>
                    <div className="text-xs text-zinc-500">{ct.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">Basic information</h2>
            {[
              { label: 'Retail Channel ID', key: 'retailChannelId', placeholder: 'e.g. CH001' },
              { label: 'Channel Name', key: 'name', placeholder: 'e.g. Main Street Store' },
              { label: 'Search Name', key: 'searchName', placeholder: 'Short searchable name' },
              { label: 'Operating Unit Number', key: 'operatingUnitNumber', placeholder: 'e.g. OU001' },
              { label: 'Legal Entity', key: 'legalEntity', placeholder: 'e.g. USRT' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                <input
                  value={(form as Record<string, string | boolean>)[f.key] as string}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">Channel settings</h2>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Warehouse</label>
              <input value={form.warehouse} onChange={e => set('warehouse', e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Time Zone</label>
              <select value={form.storeTimeZone} onChange={e => set('storeTimeZone', e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500">
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-500">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
            <label className="flex items-center gap-3 mt-2 cursor-pointer">
              <input type="checkbox" checked={form.pricesIncludeSalesTax} onChange={e => set('pricesIncludeSalesTax', e.target.checked)} className="rounded border-zinc-600 bg-zinc-900" />
              <span className="text-xs text-zinc-300">Prices include sales tax</span>
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-xs text-zinc-400 disabled:opacity-30 hover:text-zinc-200 transition-colors"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !form.channelType}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={saving || !form.name || !form.retailChannelId}
              className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded transition-colors"
            >
              {saving ? 'Creating...' : 'Create Channel'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
