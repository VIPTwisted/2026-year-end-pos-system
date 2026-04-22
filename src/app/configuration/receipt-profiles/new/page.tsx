'use client'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FormState {
  name: string
  headerLine1: string
  headerLine2: string
  headerLine3: string
  footerLine1: string
  footerLine2: string
  footerLine3: string
  showLogo: boolean
  logoUrl: string
  showStoreName: boolean
  showStoreAddress: boolean
  showStorePhone: boolean
  showCashier: boolean
  showOrderNumber: boolean
  showDateTime: boolean
  showBarcode: boolean
  showQrCode: boolean
  showTaxDetail: boolean
  showLoyaltyBalance: boolean
  showReturnPolicy: boolean
  returnPolicyText: string
  paperWidth: string
  fontSize: string
  isDefault: boolean
}

export default function NewReceiptProfilePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({
    name: '',
    headerLine1: '',
    headerLine2: '',
    headerLine3: '',
    footerLine1: 'Thank you for shopping with us!',
    footerLine2: '',
    footerLine3: '',
    showLogo: false,
    logoUrl: '',
    showStoreName: true,
    showStoreAddress: true,
    showStorePhone: true,
    showCashier: true,
    showOrderNumber: true,
    showDateTime: true,
    showBarcode: false,
    showQrCode: false,
    showTaxDetail: true,
    showLoyaltyBalance: true,
    showReturnPolicy: true,
    returnPolicyText: '',
    paperWidth: '80',
    fontSize: 'normal',
    isDefault: false,
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/configuration/receipt-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          paperWidth: parseInt(form.paperWidth) || 80,
          headerLine1: form.headerLine1 || undefined,
          headerLine2: form.headerLine2 || undefined,
          headerLine3: form.headerLine3 || undefined,
          footerLine2: form.footerLine2 || undefined,
          footerLine3: form.footerLine3 || undefined,
          logoUrl: form.logoUrl || undefined,
          returnPolicyText: form.returnPolicyText || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create profile')
        return
      }
      router.push('/configuration/receipt-profiles')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'
  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none transition-colors'
  const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4'

  function Toggle({ label, fieldKey }: { label: string; fieldKey: keyof FormState }) {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form[fieldKey] as boolean}
          onChange={e => set(fieldKey, e.target.checked as FormState[typeof fieldKey])}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
        />
        <span className="text-[13px] text-zinc-300">{label}</span>
      </label>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Receipt Profile" />
      <div className="p-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">General</h2>
            <div>
              <label className={labelCls}>Profile Name *</label>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Standard Receipt" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Paper Width (mm)</label>
                <select className={inputCls} value={form.paperWidth} onChange={e => set('paperWidth', e.target.value)}>
                  <option value="58">58mm</option>
                  <option value="72">72mm</option>
                  <option value="80">80mm</option>
                  <option value="112">112mm</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Font Size</label>
                <select className={inputCls} value={form.fontSize} onChange={e => set('fontSize', e.target.value)}>
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Header Text</h2>
            {(['headerLine1', 'headerLine2', 'headerLine3'] as const).map((field, i) => (
              <div key={field}>
                <label className={labelCls}>Header Line {i + 1}</label>
                <input className={inputCls} value={form[field]} onChange={e => set(field, e.target.value)} placeholder={`Header line ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Footer Text</h2>
            {(['footerLine1', 'footerLine2', 'footerLine3'] as const).map((field, i) => (
              <div key={field}>
                <label className={labelCls}>Footer Line {i + 1}</label>
                <input className={inputCls} value={form[field]} onChange={e => set(field, e.target.value)} placeholder={i === 0 ? 'Thank you for shopping with us!' : `Footer line ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Display Options</h2>
            <div className="grid grid-cols-2 gap-3">
              <Toggle label="Store Name" fieldKey="showStoreName" />
              <Toggle label="Store Address" fieldKey="showStoreAddress" />
              <Toggle label="Store Phone" fieldKey="showStorePhone" />
              <Toggle label="Cashier Name" fieldKey="showCashier" />
              <Toggle label="Order Number" fieldKey="showOrderNumber" />
              <Toggle label="Date & Time" fieldKey="showDateTime" />
              <Toggle label="Tax Detail" fieldKey="showTaxDetail" />
              <Toggle label="Loyalty Balance" fieldKey="showLoyaltyBalance" />
              <Toggle label="Return Policy" fieldKey="showReturnPolicy" />
              <Toggle label="Logo" fieldKey="showLogo" />
              <Toggle label="Barcode" fieldKey="showBarcode" />
              <Toggle label="QR Code" fieldKey="showQrCode" />
            </div>
            {form.showLogo && (
              <div>
                <label className={labelCls}>Logo URL</label>
                <input className={inputCls} value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." />
              </div>
            )}
            {form.showReturnPolicy && (
              <div>
                <label className={labelCls}>Return Policy Text</label>
                <textarea
                  className={inputCls + ' resize-none'}
                  rows={2}
                  value={form.returnPolicyText}
                  onChange={e => set('returnPolicyText', e.target.value)}
                  placeholder="Returns accepted within 30 days with receipt."
                />
              </div>
            )}
          </div>

          <div className={sectionCls}>
            <Toggle label="Set as Default Receipt Profile" fieldKey="isDefault" />
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-800/50 rounded px-4 py-3 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors">
              {saving ? 'Saving...' : 'Create Profile'}
            </button>
            <Link href="/configuration/receipt-profiles" className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
