'use client'

// TODO: Add RebateAgreement model to Prisma schema when ready.
// This form will POST to /api/rebates when the model exists.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Plus, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const PARTY_TYPES = ['vendor', 'customer'] as const
const REBATE_TYPES = [
  { value: 'vendor-funded',   label: 'Vendor-Funded' },
  { value: 'customer-earned', label: 'Customer-Earned' },
]
const CALC_METHODS = [
  { value: 'pct_of_spend',    label: '% of Spend' },
  { value: 'fixed_per_unit',  label: 'Fixed per Unit' },
  { value: 'tiered_pct',      label: 'Tiered %' },
  { value: 'flat_amount',     label: 'Flat Amount' },
]

// Mock party lists — replace with API fetch when model exists
const MOCK_VENDORS   = ['Apex Electronics Inc.', 'FlexSupply Co.', 'NorthStar Distributors', 'GreenLeaf Manufacturing']
const MOCK_CUSTOMERS = ['MegaRetail Corp', 'Prestige Wholesale Ltd.', 'SunBridge Retail', 'GlobalMart Partners']

interface Threshold {
  qty: string
  amount: string
  rebatePct: string
}

interface FormState {
  name: string
  partyType: 'vendor' | 'customer'
  party: string
  rebateType: string
  calcMethod: string
  thresholds: Threshold[]
  validFrom: string
  validTo: string
  description: string
}

const EMPTY: FormState = {
  name: '',
  partyType: 'vendor',
  party: '',
  rebateType: 'vendor-funded',
  calcMethod: 'pct_of_spend',
  thresholds: [{ qty: '', amount: '', rebatePct: '' }],
  validFrom: '',
  validTo: '',
  description: '',
}

export default function NewRebatePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const partyList = form.partyType === 'vendor' ? MOCK_VENDORS : MOCK_CUSTOMERS

  function addThreshold() {
    setForm(f => ({ ...f, thresholds: [...f.thresholds, { qty: '', amount: '', rebatePct: '' }] }))
  }

  function removeThreshold(idx: number) {
    setForm(f => ({ ...f, thresholds: f.thresholds.filter((_, i) => i !== idx) }))
  }

  function updateThreshold(idx: number, field: keyof Threshold, value: string) {
    setForm(f => {
      const t = [...f.thresholds]
      t[idx] = { ...t[idx], [field]: value }
      return { ...f, thresholds: t }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Agreement name is required.'); return }
    if (!form.party.trim()) { setError('Please select a party.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/rebates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/rebates')
    } catch {
      setError('Failed to create agreement. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500 transition-colors'
  const labelCls = 'block text-xs text-zinc-400 mb-1.5 font-medium'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/rebates" className="text-zinc-500 hover:text-zinc-300 transition-colors">Rebates</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <span className="text-zinc-100 font-medium">New Agreement</span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">New Rebate Agreement</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure a vendor-funded or customer-earned rebate contract</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        {/* Core Details */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Agreement Details</h2>

          <div>
            <label className={labelCls}>Agreement Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Q3 Vendor Volume Rebate"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional notes..."
              rows={2}
              className={cn(inputCls, 'resize-none')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Rebate Type *</label>
              <select
                value={form.rebateType}
                onChange={e => setForm(f => ({ ...f, rebateType: e.target.value }))}
                className={inputCls}
              >
                {REBATE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Calculation Method *</label>
              <select
                value={form.calcMethod}
                onChange={e => setForm(f => ({ ...f, calcMethod: e.target.value }))}
                className={inputCls}
              >
                {CALC_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Party */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Party</h2>

          <div>
            <label className={labelCls}>Party Type *</label>
            <div className="flex gap-2">
              {PARTY_TYPES.map(pt => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, partyType: pt, party: '' }))}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm border font-medium transition-colors capitalize',
                    form.partyType === pt
                      ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  )}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>{form.partyType === 'vendor' ? 'Vendor' : 'Customer'} *</label>
            <select
              value={form.party}
              onChange={e => setForm(f => ({ ...f, party: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select {form.partyType}...</option>
              {partyList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Thresholds */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Thresholds</h2>
            <button
              type="button"
              onClick={addThreshold}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tier
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left pb-2 text-zinc-500 text-xs font-medium">Min Qty</th>
                  <th className="text-left pb-2 text-zinc-500 text-xs font-medium px-3">Min Amount ($)</th>
                  <th className="text-left pb-2 text-zinc-500 text-xs font-medium">Rebate %</th>
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {form.thresholds.map((t, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={t.qty}
                        onChange={e => updateThreshold(idx, 'qty', e.target.value)}
                        className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        value={t.amount}
                        onChange={e => updateThreshold(idx, 'amount', e.target.value)}
                        className="w-32 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        placeholder="0.00"
                        value={t.rebatePct}
                        onChange={e => updateThreshold(idx, 'rebatePct', e.target.value)}
                        className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </td>
                    <td className="py-2 text-right">
                      {form.thresholds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeThreshold(idx)}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Validity Dates */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Validity Period</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date *</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>End Date *</label>
              <input
                type="date"
                value={form.validTo}
                onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Link
            href="/rebates"
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              saving && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Check className="w-4 h-4" />
            {saving ? 'Creating...' : 'Create Agreement'}
          </button>
        </div>
      </form>
    </div>
  )
}
