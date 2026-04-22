'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Plus, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const RULE_TYPES = [
  { value: 'base',           label: 'Base Price' },
  { value: 'discount',       label: 'Discount' },
  { value: 'markup',         label: 'Markup' },
  { value: 'margin',         label: 'Margin' },
  { value: 'BOGO',           label: 'BOGO' },
  { value: 'BULK_DISCOUNT',  label: 'Bulk Discount' },
  { value: 'FIXED_DISCOUNT', label: 'Fixed Discount' },
  { value: 'PCT_DISCOUNT',   label: '% Discount' },
  { value: 'CUSTOMER_GROUP', label: 'Customer Group' },
]

const ALL_CHANNELS = ['Online', 'In-Store', 'Mobile', 'Call Center', 'B2B Portal', 'Kiosk']
const ALL_CUSTOMER_GROUPS = ['Retail', 'Wholesale', 'VIP', 'Employee', 'B2B Standard', 'B2B Premium', 'Loyalty Gold']

interface QtyBreak {
  qty_from: number
  price: string
  discount_pct: string
}

interface FormState {
  name: string
  ruleType: string
  priority: number
  channels: string[]
  customerGroups: string[]
  qtyBreaks: QtyBreak[]
  validFrom: string
  validTo: string
  isActive: boolean
  description: string
}

const EMPTY: FormState = {
  name: '',
  ruleType: 'discount',
  priority: 10,
  channels: [],
  customerGroups: [],
  qtyBreaks: [{ qty_from: 1, price: '', discount_pct: '' }],
  validFrom: '',
  validTo: '',
  isActive: true,
  description: '',
}

export default function NewUnifiedRulePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleChannel(ch: string) {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch],
    }))
  }

  function toggleGroup(g: string) {
    setForm(f => ({
      ...f,
      customerGroups: f.customerGroups.includes(g) ? f.customerGroups.filter(x => x !== g) : [...f.customerGroups, g],
    }))
  }

  function addBreak() {
    setForm(f => ({ ...f, qtyBreaks: [...f.qtyBreaks, { qty_from: 1, price: '', discount_pct: '' }] }))
  }

  function removeBreak(idx: number) {
    setForm(f => ({ ...f, qtyBreaks: f.qtyBreaks.filter((_, i) => i !== idx) }))
  }

  function updateBreak(idx: number, field: keyof QtyBreak, value: string | number) {
    setForm(f => {
      const breaks = [...f.qtyBreaks]
      breaks[idx] = { ...breaks[idx], [field]: value }
      return { ...f, qtyBreaks: breaks }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Rule name is required.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/pricing/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/pricing/unified-pricing')
    } catch {
      setError('Failed to create rule. Please try again.')
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
        <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">Pricing</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <Link href="/pricing/unified-pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">Unified Pricing</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <span className="text-zinc-100 font-medium">New Rule</span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">New Price Rule</h1>
          <p className="text-zinc-500 text-sm mt-1">Define a unified pricing rule across channels and customer segments</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        {/* Core Fields */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Rule Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Rule Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Summer Wholesale Discount"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Rule Type *</label>
              <select
                value={form.ruleType}
                onChange={e => setForm(f => ({ ...f, ruleType: e.target.value }))}
                className={inputCls}
              >
                {RULE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Priority</label>
              <input
                type="number"
                min={0}
                max={999}
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                className={inputCls}
              />
              <p className="text-xs text-zinc-600 mt-1">Higher number = higher priority</p>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional notes about this rule..."
                rows={2}
                className={cn(inputCls, 'resize-none')}
              />
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Applicable Channels</h2>
          <p className="text-xs text-zinc-500">Leave all unchecked to apply to all channels</p>
          <div className="flex flex-wrap gap-2">
            {ALL_CHANNELS.map(ch => {
              const active = form.channels.includes(ch)
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    active
                      ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  )}
                >
                  {active && <Check className="w-3 h-3 inline mr-1" />}
                  {ch}
                </button>
              )
            })}
          </div>
        </div>

        {/* Customer Groups */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Customer Groups</h2>
          <p className="text-xs text-zinc-500">Leave all unchecked to apply to all customers</p>
          <div className="flex flex-wrap gap-2">
            {ALL_CUSTOMER_GROUPS.map(g => {
              const active = form.customerGroups.includes(g)
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGroup(g)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    active
                      ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  )}
                >
                  {active && <Check className="w-3 h-3 inline mr-1" />}
                  {g}
                </button>
              )
            })}
          </div>
        </div>

        {/* Quantity Breaks */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Quantity Breaks</h2>
            <button
              type="button"
              onClick={addBreak}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Break
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left pb-2 text-zinc-500 text-xs font-medium">Qty From</th>
                  <th className="text-left pb-2 text-zinc-500 text-xs font-medium px-3">Price Override</th>
                  <th className="text-left pb-2 text-zinc-500 text-xs font-medium">Discount %</th>
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {form.qtyBreaks.map((brk, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={1}
                        value={brk.qty_from}
                        onChange={e => updateBreak(idx, 'qty_from', Number(e.target.value))}
                        className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        value={brk.price}
                        onChange={e => updateBreak(idx, 'price', e.target.value)}
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
                        value={brk.discount_pct}
                        onChange={e => updateBreak(idx, 'discount_pct', e.target.value)}
                        className="w-28 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </td>
                    <td className="py-2 text-right">
                      {form.qtyBreaks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBreak(idx)}
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

        {/* Date Range */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Validity Period</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input
                type="date"
                value={form.validTo}
                onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="sr-only"
              />
              <div className={cn('w-10 h-6 rounded-full transition-colors', form.isActive ? 'bg-emerald-600' : 'bg-zinc-700')} />
              <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', form.isActive ? 'left-5' : 'left-1')} />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-200">Active</div>
              <div className="text-xs text-zinc-500">Rule will be applied immediately when saved</div>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Link
            href="/pricing/unified-pricing"
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors',
              saving && 'opacity-50 cursor-not-allowed'
            )}
          >
            {saving ? 'Saving...' : 'Create Rule'}
          </button>
        </div>
      </form>
    </div>
  )
}
