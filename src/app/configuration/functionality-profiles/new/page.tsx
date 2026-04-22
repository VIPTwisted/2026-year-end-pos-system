'use client'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FormState {
  name: string
  description: string
  country: string
  currency: string
  taxIncludedInPrice: boolean
  priceCheckAllowed: boolean
  priceOverrideAllowed: boolean
  maxPriceOverridePct: string
  manualDiscountAllowed: boolean
  maxManualDiscountPct: string
  voidRequiresManager: boolean
  refundAllowed: boolean
  maxRefundAmount: string
  offlineModeAllowed: boolean
  offlineMaxDays: string
  itemSearchAllowed: boolean
  customerSearchAllowed: boolean
  inventoryLookupAllowed: boolean
  loyaltyAllowed: boolean
  giftCardAllowed: boolean
  splitTenderAllowed: boolean
  maxTendersPerTx: string
  ageVerificationRequired: boolean
  defaultAge: string
  taxExemptAllowed: boolean
  requireCustomerForReturn: boolean
  isActive: boolean
}

export default function NewFunctionalityProfilePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    country: 'US',
    currency: 'USD',
    taxIncludedInPrice: false,
    priceCheckAllowed: true,
    priceOverrideAllowed: true,
    maxPriceOverridePct: '100',
    manualDiscountAllowed: true,
    maxManualDiscountPct: '100',
    voidRequiresManager: true,
    refundAllowed: true,
    maxRefundAmount: '',
    offlineModeAllowed: true,
    offlineMaxDays: '3',
    itemSearchAllowed: true,
    customerSearchAllowed: true,
    inventoryLookupAllowed: true,
    loyaltyAllowed: true,
    giftCardAllowed: true,
    splitTenderAllowed: true,
    maxTendersPerTx: '10',
    ageVerificationRequired: false,
    defaultAge: '21',
    taxExemptAllowed: false,
    requireCustomerForReturn: true,
    isActive: true,
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/configuration/functionality-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          maxPriceOverridePct: parseFloat(form.maxPriceOverridePct) || 100,
          maxManualDiscountPct: parseFloat(form.maxManualDiscountPct) || 100,
          maxRefundAmount: form.maxRefundAmount ? parseFloat(form.maxRefundAmount) : undefined,
          offlineMaxDays: parseInt(form.offlineMaxDays) || 3,
          maxTendersPerTx: parseInt(form.maxTendersPerTx) || 10,
          defaultAge: parseInt(form.defaultAge) || 21,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create profile')
        return
      }
      router.push('/configuration/functionality-profiles')
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

  function Toggle({ label, fieldKey, description }: { label: string; fieldKey: keyof FormState; description?: string }) {
    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form[fieldKey] as boolean}
          onChange={e => set(fieldKey, e.target.checked as FormState[typeof fieldKey])}
          className="mt-0.5 w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
        />
        <div>
          <div className="text-[13px] text-zinc-200 font-medium">{label}</div>
          {description && <div className="text-[11px] text-zinc-500 mt-0.5">{description}</div>}
        </div>
      </label>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Functionality Profile" />
      <div className="p-6 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">General</h2>
            <div>
              <label className={labelCls}>Profile Name *</label>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Standard Store" required />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Country</label>
                <input className={inputCls} value={form.country} onChange={e => set('country', e.target.value)} placeholder="US" />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <input className={inputCls} value={form.currency} onChange={e => set('currency', e.target.value)} placeholder="USD" />
              </div>
            </div>
          </div>

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Pricing & Discounts</h2>
            <div className="space-y-3">
              <Toggle label="Tax Included in Price" fieldKey="taxIncludedInPrice" />
              <Toggle label="Allow Price Check" fieldKey="priceCheckAllowed" />
              <Toggle label="Allow Price Override" fieldKey="priceOverrideAllowed" />
              {form.priceOverrideAllowed && (
                <div>
                  <label className={labelCls}>Max Price Override %</label>
                  <input className={inputCls} type="number" value={form.maxPriceOverridePct} onChange={e => set('maxPriceOverridePct', e.target.value)} min={0} max={100} />
                </div>
              )}
              <Toggle label="Allow Manual Discount" fieldKey="manualDiscountAllowed" />
              {form.manualDiscountAllowed && (
                <div>
                  <label className={labelCls}>Max Manual Discount %</label>
                  <input className={inputCls} type="number" value={form.maxManualDiscountPct} onChange={e => set('maxManualDiscountPct', e.target.value)} min={0} max={100} />
                </div>
              )}
            </div>
          </div>

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Transaction Controls</h2>
            <div className="space-y-3">
              <Toggle label="Void Requires Manager Approval" fieldKey="voidRequiresManager" />
              <Toggle label="Allow Refunds" fieldKey="refundAllowed" />
              {form.refundAllowed && (
                <div>
                  <label className={labelCls}>Max Refund Amount (leave blank for unlimited)</label>
                  <input className={inputCls} type="number" value={form.maxRefundAmount} onChange={e => set('maxRefundAmount', e.target.value)} placeholder="e.g. 500.00" />
                </div>
              )}
              <Toggle label="Require Customer for Return" fieldKey="requireCustomerForReturn" />
              <Toggle label="Allow Tax Exempt" fieldKey="taxExemptAllowed" />
              <Toggle label="Allow Split Tender" fieldKey="splitTenderAllowed" />
              {form.splitTenderAllowed && (
                <div>
                  <label className={labelCls}>Max Tenders per Transaction</label>
                  <input className={inputCls} type="number" value={form.maxTendersPerTx} onChange={e => set('maxTendersPerTx', e.target.value)} min={1} max={20} />
                </div>
              )}
            </div>
          </div>

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Features</h2>
            <div className="space-y-3">
              <Toggle label="Item Search" fieldKey="itemSearchAllowed" />
              <Toggle label="Customer Search" fieldKey="customerSearchAllowed" />
              <Toggle label="Inventory Lookup" fieldKey="inventoryLookupAllowed" />
              <Toggle label="Loyalty Program" fieldKey="loyaltyAllowed" />
              <Toggle label="Gift Cards" fieldKey="giftCardAllowed" />
            </div>
          </div>

          <div className={sectionCls}>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Offline & Compliance</h2>
            <div className="space-y-3">
              <Toggle label="Allow Offline Mode" fieldKey="offlineModeAllowed" />
              {form.offlineModeAllowed && (
                <div>
                  <label className={labelCls}>Max Offline Days</label>
                  <input className={inputCls} type="number" value={form.offlineMaxDays} onChange={e => set('offlineMaxDays', e.target.value)} min={1} max={30} />
                </div>
              )}
              <Toggle label="Age Verification Required" fieldKey="ageVerificationRequired" />
              {form.ageVerificationRequired && (
                <div>
                  <label className={labelCls}>Minimum Age</label>
                  <input className={inputCls} type="number" value={form.defaultAge} onChange={e => set('defaultAge', e.target.value)} min={0} max={99} />
                </div>
              )}
              <Toggle label="Active" fieldKey="isActive" />
            </div>
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
            <Link href="/configuration/functionality-profiles" className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
