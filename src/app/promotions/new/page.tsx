'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, ArrowRight, Check,
  Percent, DollarSign, ShoppingBag, Gift, BarChart2, Star,
  Tag,
} from 'lucide-react'

const TYPE_OPTIONS = [
  {
    type: 'PERCENT_OFF',
    label: 'Percent Off',
    desc: '10% off entire order',
    icon: Percent,
    color: 'border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10',
    activeColor: 'border-blue-500 bg-blue-500/15',
  },
  {
    type: 'AMOUNT_OFF',
    label: 'Amount Off',
    desc: '$5 off when you spend $50',
    icon: DollarSign,
    color: 'border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10',
    activeColor: 'border-emerald-500 bg-emerald-500/15',
  },
  {
    type: 'BOGO',
    label: 'Buy X Get Y',
    desc: 'Buy 2, Get 1 Free',
    icon: ShoppingBag,
    color: 'border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10',
    activeColor: 'border-purple-500 bg-purple-500/15',
  },
  {
    type: 'FREE_ITEM',
    label: 'Free Item',
    desc: 'Free product added to cart',
    icon: Gift,
    color: 'border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10',
    activeColor: 'border-amber-500 bg-amber-500/15',
  },
  {
    type: 'TIERED_SPEND',
    label: 'Tiered Spend',
    desc: 'Spend $100 save $10, spend $200 save $25',
    icon: BarChart2,
    color: 'border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10',
    activeColor: 'border-orange-500 bg-orange-500/15',
  },
  {
    type: 'LOYALTY_BONUS',
    label: 'Loyalty Bonus',
    desc: 'Double points this weekend',
    icon: Star,
    color: 'border-pink-500/50 bg-pink-500/5 hover:bg-pink-500/10',
    activeColor: 'border-pink-500 bg-pink-500/15',
  },
]

const STEPS = ['Type', 'Rules', 'Schedule', 'Coupons']

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'
const selectCls = inputCls + ' cursor-pointer'

export default function NewPromotionPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [selectedType, setSelectedType] = useState('')

  // Step 2
  const [form, setForm] = useState({
    name: '',
    description: '',
    value: '',
    minOrderAmount: '',
    minQuantity: '',
    buyQuantity: '',
    getQuantity: '',
    maxDiscount: '',
    scope: 'order',
    targetProductId: '',
    targetCategoryId: '',
    isExclusive: false,
    priority: '0',
    perCustomerLimit: '',
  })

  // Step 3
  const [schedule, setSchedule] = useState({
    startDate: '',
    endDate: '',
    usageLimit: '',
    allowedStoreIds: '',
    isActive: true,
    autoApply: false,
    isStackable: false,
  })

  // Step 4
  const [couponMode, setCouponMode] = useState<'none' | 'single' | 'bulk'>('none')
  const [couponCode, setCouponCode] = useState('')
  const [couponCount, setCouponCount] = useState('10')
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const setScheduleField = (k: keyof typeof schedule) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSchedule(prev => ({ ...prev, [k]: e.target.value }))

  function previewCodes(n: number): string[] {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const codes: string[] = []
    while (codes.length < n) {
      let code = 'PROMO-'
      for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
      if (!codes.includes(code)) codes.push(code)
    }
    return codes
  }

  const handleNext = () => {
    if (step === 0 && !selectedType) { setError('Please select a promotion type'); return }
    if (step === 1 && !form.name.trim()) { setError('Name is required'); return }
    if (step === 1 && !form.value) { setError('Value is required'); return }
    setError('')
    if (step === 2 && couponMode === 'bulk') {
      setGeneratedCodes(previewCodes(parseInt(couponCount || '10', 10)))
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const promoBody = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        type: selectedType,
        scope: form.scope,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        minQuantity: form.minQuantity ? parseInt(form.minQuantity, 10) : null,
        buyQuantity: form.buyQuantity ? parseInt(form.buyQuantity, 10) : null,
        getQuantity: form.getQuantity ? parseInt(form.getQuantity, 10) : null,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
        targetProductId: form.targetProductId.trim() || null,
        targetCategoryId: form.targetCategoryId.trim() || null,
        isExclusive: form.isExclusive,
        priority: parseInt(form.priority || '0', 10),
        perCustomerLimit: form.perCustomerLimit ? parseInt(form.perCustomerLimit, 10) : null,
        startDate: schedule.startDate || null,
        endDate: schedule.endDate || null,
        usageLimit: schedule.usageLimit ? parseInt(schedule.usageLimit, 10) : null,
        allowedStoreIds: schedule.allowedStoreIds.trim() || null,
        isActive: schedule.isActive,
        autoApply: schedule.autoApply,
        isStackable: schedule.isStackable,
      }

      const promoRes = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoBody),
      })
      const promo = await promoRes.json()
      if (!promoRes.ok) throw new Error(promo.error ?? 'Create failed')

      // Create coupons
      if (couponMode !== 'none') {
        const couponBody =
          couponMode === 'single'
            ? { code: couponCode, count: 1 }
            : { count: parseInt(couponCount || '10', 10) }

        await fetch(`/api/promotions/${promo.id}/coupons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponBody),
        })
      }

      router.push(`/promotions/${promo.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const selectedTypeObj = TYPE_OPTIONS.find(t => t.type === selectedType)

  return (
    <>
      <TopBar title="New Promotion" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link href="/promotions" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Promotions
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 flex items-center justify-center font-bold">{i + 1}</span>}
                  {s}
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-zinc-600' : 'bg-zinc-800'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1 — Type */}
          {step === 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-zinc-400" />
                  Select Promotion Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TYPE_OPTIONS.map(({ type, label, desc, icon: Icon, color, activeColor }) => (
                    <button
                      key={type}
                      onClick={() => { setSelectedType(type); setError('') }}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedType === type ? activeColor : color
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${selectedType === type ? 'text-current' : 'text-zinc-500'}`} />
                      <div className="text-sm font-semibold text-zinc-100">{label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
                {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
              </CardContent>
            </Card>
          )}

          {/* Step 2 — Rules */}
          {step === 1 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  {selectedTypeObj && <selectedTypeObj.icon className="w-4 h-4 text-zinc-400" />}
                  Promotion Rules — {selectedTypeObj?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Summer Sale 10% Off" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={set('description')} placeholder="Internal notes about this promotion" rows={2} className={inputCls + ' resize-none'} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      Value {selectedType === 'PERCENT_OFF' ? '(%)' : '($)'} <span className="text-red-400">*</span>
                    </label>
                    <input type="number" min="0" step="0.01" value={form.value} onChange={set('value')} placeholder={selectedType === 'PERCENT_OFF' ? '10' : '5.00'} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Max Discount Cap ($)</label>
                    <input type="number" min="0" step="0.01" value={form.maxDiscount} onChange={set('maxDiscount')} placeholder="50.00" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Min Order Amount ($)</label>
                    <input type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={set('minOrderAmount')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Min Quantity</label>
                    <input type="number" min="0" step="1" value={form.minQuantity} onChange={set('minQuantity')} placeholder="1" className={inputCls} />
                  </div>
                </div>

                {selectedType === 'BOGO' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Buy Quantity</label>
                      <input type="number" min="1" step="1" value={form.buyQuantity} onChange={set('buyQuantity')} placeholder="2" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Get Quantity (Free)</label>
                      <input type="number" min="1" step="1" value={form.getQuantity} onChange={set('getQuantity')} placeholder="1" className={inputCls} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Scope</label>
                    <select value={form.scope} onChange={set('scope')} className={selectCls}>
                      <option value="order">Order (entire cart)</option>
                      <option value="line">Line item</option>
                      <option value="category">Category</option>
                      <option value="product">Specific product</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority (higher = first)</label>
                    <input type="number" min="0" step="1" value={form.priority} onChange={set('priority')} placeholder="0" className={inputCls} />
                  </div>
                </div>

                {form.scope === 'product' && (
                  <div>
                    <label className={labelCls}>Target Product ID</label>
                    <input type="text" value={form.targetProductId} onChange={set('targetProductId')} placeholder="Product cuid..." className={inputCls} />
                  </div>
                )}
                {form.scope === 'category' && (
                  <div>
                    <label className={labelCls}>Target Category ID</label>
                    <input type="text" value={form.targetCategoryId} onChange={set('targetCategoryId')} placeholder="Category cuid..." className={inputCls} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Per-Customer Limit</label>
                    <input type="number" min="1" step="1" value={form.perCustomerLimit} onChange={set('perCustomerLimit')} placeholder="Unlimited" className={inputCls} />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isExclusive}
                        onChange={e => setForm(prev => ({ ...prev, isExclusive: e.target.checked }))}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                      />
                      <span className="text-sm text-zinc-300">Exclusive (no stacking)</span>
                    </label>
                  </div>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}
              </CardContent>
            </Card>
          )}

          {/* Step 3 — Schedule */}
          {step === 2 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Schedule & Restrictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input type="datetime-local" value={schedule.startDate} onChange={setScheduleField('startDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input type="datetime-local" value={schedule.endDate} onChange={setScheduleField('endDate')} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Global Usage Limit (blank = unlimited)</label>
                  <input type="number" min="1" step="1" value={schedule.usageLimit} onChange={setScheduleField('usageLimit')} placeholder="Unlimited" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Store Restriction (JSON array of store IDs, blank = all stores)</label>
                  <input type="text" value={schedule.allowedStoreIds} onChange={setScheduleField('allowedStoreIds')} placeholder='["storeId1","storeId2"]' className={inputCls} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.isActive}
                    onChange={e => setSchedule(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300">Active immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.autoApply}
                    onChange={e => setSchedule(prev => ({ ...prev, autoApply: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300">
                    Auto-apply at checkout{' '}
                    <span className="text-[11px] text-zinc-500">(no coupon code needed)</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.isStackable}
                    onChange={e => setSchedule(prev => ({ ...prev, isStackable: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300">
                    Stackable{' '}
                    <span className="text-[11px] text-zinc-500">(combines with other auto-apply promos)</span>
                  </span>
                </label>
              </CardContent>
            </Card>
          )}

          {/* Step 4 — Coupons */}
          {step === 3 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="w-4 h-4 text-zinc-400" />
                  Coupon Codes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { mode: 'none' as const, label: 'No Coupon Needed', desc: 'Promotion auto-applies at checkout' },
                    { mode: 'single' as const, label: 'Single Code', desc: 'Enter a specific coupon code' },
                    { mode: 'bulk' as const, label: 'Bulk Generate', desc: 'Auto-generate N unique codes' },
                  ].map(({ mode, label, desc }) => (
                    <button
                      key={mode}
                      onClick={() => setCouponMode(mode)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        couponMode === mode
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                      }`}
                    >
                      <div className="text-sm font-semibold text-zinc-100">{label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>

                {couponMode === 'single' && (
                  <div>
                    <label className={labelCls}>Coupon Code</label>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="SUMMER2026"
                      className={inputCls + ' font-mono tracking-widest'}
                    />
                  </div>
                )}

                {couponMode === 'bulk' && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Number of Codes to Generate</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={couponCount}
                        onChange={e => {
                          setCouponCount(e.target.value)
                          setGeneratedCodes(previewCodes(parseInt(e.target.value || '10', 10)))
                        }}
                        className={inputCls}
                      />
                    </div>
                    {generatedCodes.length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Preview (first {Math.min(generatedCodes.length, 8)})</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {generatedCodes.slice(0, 8).map(c => (
                            <div key={c} className="font-mono text-xs text-zinc-300 bg-zinc-800 px-2 py-1.5 rounded border border-zinc-700">{c}</div>
                          ))}
                        </div>
                        {generatedCodes.length > 8 && (
                          <p className="text-xs text-zinc-600 mt-2">+{generatedCodes.length - 8} more…</p>
                        )}
                      </div>
                    )}
                    {generatedCodes.length === 0 && (
                      <Button variant="outline" size="sm" onClick={() => setGeneratedCodes(previewCodes(parseInt(couponCount || '10', 10)))}>
                        Preview Codes
                      </Button>
                    )}
                  </div>
                )}

                {error && <p className="text-xs text-red-400">{error}</p>}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setError(''); setStep(s => s - 1) }}
              disabled={step === 0}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="sm" onClick={handleNext}>
                Next
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating…' : 'Create Promotion'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
