'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Plus, X, Save } from 'lucide-react'

interface PriceGroup { id: string; code: string; name: string }
interface Product { id: string; sku: string; name: string }
interface Category { id: string; name: string }

interface DiscountLine {
  lineType: 'product' | 'category' | 'all'
  productId?: string
  categoryId?: string
  minQty?: number
  maxQty?: number
  discountPct?: number
  discountAmt?: number
}

const DISCOUNT_TYPES = [
  { value: 'simple', label: 'Simple', desc: 'Fixed % or $ off any item' },
  { value: 'quantity', label: 'Quantity', desc: 'Buy X get discount on tier' },
  { value: 'mix_match', label: 'Mix & Match', desc: 'Mix products for deal' },
  { value: 'threshold', label: 'Threshold', desc: 'Minimum purchase amount' },
]

export default function NewDiscountPage() {
  const router = useRouter()
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [discountType, setDiscountType] = useState('simple')
  const [name, setName] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountMethod, setDiscountMethod] = useState<'percent' | 'amount'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [priceGroupId, setPriceGroupId] = useState('')
  const [couponRequired, setCouponRequired] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [maxUsageCount, setMaxUsageCount] = useState('')
  const [minPurchaseAmt, setMinPurchaseAmt] = useState('')
  const [lines, setLines] = useState<DiscountLine[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/pricing/price-groups').then(r => r.json()).then(setPriceGroups)
    fetch('/api/products?active=true').then(r => r.json()).then(setProducts)
    fetch('/api/products').then(r => r.json()).then(() => {}) // categories via products
  }, [])

  function addLine() {
    setLines(prev => [...prev, { lineType: 'all' }])
  }

  function removeLine(idx: number) {
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  function updateLine(idx: number, patch: Partial<DiscountLine>) {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, ...patch } : l))
  }

  function generateCode() {
    const slug = name.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '').slice(0, 12)
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    setDiscountCode(`${slug}-${rand}`)
  }

  async function save() {
    if (!name.trim()) { setError('Name is required.'); return }
    if (!discountCode.trim()) { setError('Discount code is required.'); return }
    if (!discountValue || isNaN(parseFloat(discountValue))) { setError('Discount value is required.'); return }

    setSaving(true)
    setError('')
    try {
      const payload = {
        name,
        discountCode,
        discountType,
        discountMethod,
        discountValue: parseFloat(discountValue),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        priceGroupId: priceGroupId || null,
        couponRequired,
        couponCode: couponRequired ? couponCode : null,
        maxUsageCount: maxUsageCount ? parseInt(maxUsageCount) : null,
        minPurchaseAmt: minPurchaseAmt ? parseFloat(minPurchaseAmt) : null,
        status: 'active',
        lines,
      }
      const res = await fetch('/api/pricing/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('API error')
      const d = await res.json()
      router.push(`/pricing/discounts/${d.id}`)
    } catch {
      setError('Failed to create discount. Try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Discount" />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link href="/pricing/discounts" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Create Discount</h2>
            <p className="text-sm text-zinc-500">D365 Commerce — Discount &amp; Promotion Engine</p>
          </div>
        </div>

        {error && <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        {/* Discount Type */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm uppercase tracking-wide">Discount Type</h3>
            <div className="grid grid-cols-4 gap-3">
              {DISCOUNT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setDiscountType(t.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    discountType === t.value
                      ? 'border-blue-500 bg-blue-600/15 text-blue-300'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{t.label}</div>
                  <div className="text-xs opacity-70">{t.desc}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm uppercase tracking-wide">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Discount Name *</label>
                <Input
                  placeholder="Summer Sale 20% Off"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Discount Code *</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="SUMMER-20"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                  <Button variant="ghost" size="sm" onClick={generateCode} type="button">Auto</Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Method</label>
                <select
                  className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={discountMethod}
                  onChange={e => setDiscountMethod(e.target.value as 'percent' | 'amount')}
                >
                  <option value="percent">Percent (%)</option>
                  <option value="amount">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">
                  Value * {discountMethod === 'percent' ? '(%)' : '($)'}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={discountMethod === 'percent' ? '10' : '5.00'}
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Price Group</label>
                <select
                  className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={priceGroupId}
                  onChange={e => setPriceGroupId(e.target.value)}
                >
                  <option value="">All Customers</option>
                  {priceGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Threshold minimum */}
            {discountType === 'threshold' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Minimum Purchase Amount ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    value={minPurchaseAmt}
                    onChange={e => setMinPurchaseAmt(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Range & Limits */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm uppercase tracking-wide">Date Range &amp; Limits</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Start Date</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">End Date</label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Max Usage Count</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={maxUsageCount}
                  onChange={e => setMaxUsageCount(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coupon Code */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm uppercase tracking-wide">Coupon</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="coupon-required"
                checked={couponRequired}
                onChange={e => setCouponRequired(e.target.checked)}
                className="accent-blue-500"
              />
              <label htmlFor="coupon-required" className="text-sm text-zinc-300">Require coupon code at checkout</label>
            </div>
            {couponRequired && (
              <div className="max-w-xs">
                <label className="text-xs text-zinc-400 mb-1 block">Coupon Code</label>
                <Input
                  placeholder="SAVE20"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product / Category Lines */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 text-sm uppercase tracking-wide">
                Discount Lines
                <span className="text-zinc-500 font-normal ml-2 normal-case text-xs">(which products/categories qualify)</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={addLine}>
                <Plus className="w-4 h-4 mr-1" />Add Line
              </Button>
            </div>

            {lines.length === 0 ? (
              <p className="text-sm text-zinc-500">No lines — discount applies to all products. Add lines to restrict scope.</p>
            ) : (
              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Type</label>
                        <select
                          className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={line.lineType}
                          onChange={e => updateLine(idx, { lineType: e.target.value as DiscountLine['lineType'], productId: undefined, categoryId: undefined })}
                        >
                          <option value="all">All Products</option>
                          <option value="product">Specific Product</option>
                          <option value="category">Category</option>
                        </select>
                      </div>

                      {line.lineType === 'product' && (
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Product</label>
                          <select
                            className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={line.productId ?? ''}
                            onChange={e => updateLine(idx, { productId: e.target.value })}
                          >
                            <option value="">Select...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {discountType === 'quantity' && (
                        <>
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Min Qty</label>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="2"
                              value={line.minQty ?? ''}
                              onChange={e => updateLine(idx, { minQty: parseFloat(e.target.value) || undefined })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Max Qty</label>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Unlimited"
                              value={line.maxQty ?? ''}
                              onChange={e => updateLine(idx, { maxQty: parseFloat(e.target.value) || undefined })}
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Disc % (line override)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="Use global"
                          value={line.discountPct ?? ''}
                          onChange={e => updateLine(idx, { discountPct: parseFloat(e.target.value) || undefined })}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeLine(idx)}
                      className="mt-6 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? 'Creating...' : 'Create Discount'}
          </Button>
          <Link href="/pricing/discounts">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </main>
    </>
  )
}
