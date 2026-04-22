'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Plus, X, Save, CheckCircle, PauseCircle, Clock } from 'lucide-react'

interface PriceGroup { id: string; code: string; name: string }
interface Product { id: string; sku: string; name: string }

interface DiscountLine {
  id?: string
  lineType: 'product' | 'category' | 'all'
  productId?: string | null
  categoryId?: string | null
  minQty?: number | null
  maxQty?: number | null
  discountPct?: number | null
  discountAmt?: number | null
}

interface DiscountUsage {
  id: string
  orderId: string
  discountAmt: number
  usedAt: string
}

interface Discount {
  id: string
  name: string
  discountCode: string
  discountType: string
  status: string
  priceGroupId: string | null
  couponRequired: boolean
  couponCode: string | null
  discountMethod: string
  discountValue: number
  startDate: string | null
  endDate: string | null
  maxUsageCount: number | null
  usageCount: number
  minPurchaseAmt: number | null
  priceGroup: PriceGroup | null
  lines: DiscountLine[]
  usages: DiscountUsage[]
}

const TYPE_LABELS: Record<string, string> = {
  simple: 'Simple',
  quantity: 'Quantity',
  mix_match: 'Mix & Match',
  threshold: 'Threshold',
}

function fmtDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

function fmtDateDisplay(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusVariant(status: string): 'success' | 'secondary' | 'destructive' {
  if (status === 'active') return 'success'
  if (status === 'expired') return 'destructive'
  return 'secondary'
}

export default function DiscountDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [discount, setDiscount] = useState<Discount | null>(null)
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [discountMethod, setDiscountMethod] = useState('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [priceGroupId, setPriceGroupId] = useState('')
  const [couponRequired, setCouponRequired] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [maxUsageCount, setMaxUsageCount] = useState('')
  const [minPurchaseAmt, setMinPurchaseAmt] = useState('')
  const [lines, setLines] = useState<DiscountLine[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const [dRes, gRes, pRes] = await Promise.all([
      fetch(`/api/pricing/discounts/${id}`),
      fetch('/api/pricing/price-groups'),
      fetch('/api/products?active=true'),
    ])
    const d: Discount = await dRes.json()
    const g = await gRes.json()
    const p = await pRes.json()
    setDiscount(d)
    setPriceGroups(g)
    setProducts(p)
    // Populate form
    setName(d.name)
    setDiscountMethod(d.discountMethod)
    setDiscountValue(String(d.discountValue))
    setStartDate(fmtDate(d.startDate))
    setEndDate(fmtDate(d.endDate))
    setPriceGroupId(d.priceGroupId ?? '')
    setCouponRequired(d.couponRequired)
    setCouponCode(d.couponCode ?? '')
    setMaxUsageCount(d.maxUsageCount !== null ? String(d.maxUsageCount) : '')
    setMinPurchaseAmt(d.minPurchaseAmt !== null ? String(d.minPurchaseAmt) : '')
    setLines(d.lines)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  function addLine() {
    setLines(prev => [...prev, { lineType: 'all' }])
  }

  function removeLine(idx: number) {
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  function updateLine(idx: number, patch: Partial<DiscountLine>) {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, ...patch } : l))
  }

  async function save() {
    if (!name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        name,
        discountMethod,
        discountValue: parseFloat(discountValue),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        priceGroupId: priceGroupId || null,
        couponRequired,
        couponCode: couponRequired ? couponCode : null,
        maxUsageCount: maxUsageCount ? parseInt(maxUsageCount) : null,
        minPurchaseAmt: minPurchaseAmt ? parseFloat(minPurchaseAmt) : null,
        lines: lines.map(({ id: _id, ...l }) => l),
      }
      await fetch(`/api/pricing/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      await load()
    } catch {
      setError('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function toggle() {
    if (!discount) return
    setToggling(true)
    const action = discount.status === 'active' ? 'deactivate' : 'activate'
    await fetch(`/api/pricing/discounts/${id}/${action}`, { method: 'POST' })
    await load()
    setToggling(false)
  }

  if (loading) return (
    <>
      <TopBar title="Discount" />
      <main className="flex-1 p-6"><p className="text-zinc-500 text-sm">Loading...</p></main>
    </>
  )

  if (!discount) return (
    <>
      <TopBar title="Not Found" />
      <main className="flex-1 p-6"><p className="text-zinc-500">Discount not found.</p></main>
    </>
  )

  return (
    <>
      <TopBar title={discount.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/pricing/discounts" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-100">{discount.name}</h2>
                <Badge variant={statusVariant(discount.status)}>{discount.status}</Badge>
                <Badge variant="outline">{TYPE_LABELS[discount.discountType] ?? discount.discountType}</Badge>
              </div>
              <p className="text-sm text-zinc-500 font-mono">{discount.discountCode}</p>
            </div>
          </div>
          <Button
            variant={discount.status === 'active' ? 'ghost' : 'default'}
            onClick={toggle}
            disabled={toggling}
          >
            {discount.status === 'active'
              ? <><PauseCircle className="w-4 h-4 mr-1" />Deactivate</>
              : <><CheckCircle className="w-4 h-4 mr-1" />Activate</>
            }
          </Button>
        </div>

        {error && <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}
        {saved && <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg px-4 py-3 text-sm text-emerald-400">Saved successfully.</div>}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Uses</p>
              <p className="text-2xl font-bold text-blue-400">{discount.usageCount}</p>
              {discount.maxUsageCount && <p className="text-xs text-zinc-600">of {discount.maxUsageCount} max</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Value</p>
              <p className="text-2xl font-bold text-emerald-400">
                {discount.discountMethod === 'percent' ? `${discount.discountValue}%` : `$${discount.discountValue.toFixed(2)}`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Start</p>
              <p className="text-sm font-semibold text-zinc-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                {fmtDateDisplay(discount.startDate)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">End</p>
              <p className="text-sm font-semibold text-zinc-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                {fmtDateDisplay(discount.endDate)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm uppercase tracking-wide">Edit Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Discount Name *</label>
                <Input value={name} onChange={e => setName(e.target.value)} />
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Method</label>
                <select
                  className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={discountMethod}
                  onChange={e => setDiscountMethod(e.target.value)}
                >
                  <option value="percent">Percent (%)</option>
                  <option value="amount">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Value</label>
                <Input type="number" min="0" step="0.01" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Max Usage Count</label>
                <Input type="number" min="1" placeholder="Unlimited" value={maxUsageCount} onChange={e => setMaxUsageCount(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Start Date</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">End Date</label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              {discount.discountType === 'threshold' && (
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Min Purchase ($)</label>
                  <Input type="number" min="0" step="0.01" placeholder="50.00" value={minPurchaseAmt} onChange={e => setMinPurchaseAmt(e.target.value)} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="edit-coupon"
                checked={couponRequired}
                onChange={e => setCouponRequired(e.target.checked)}
                className="accent-blue-500"
              />
              <label htmlFor="edit-coupon" className="text-sm text-zinc-300">Require coupon code</label>
              {couponRequired && (
                <Input
                  className="max-w-xs font-mono"
                  placeholder="SAVE20"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lines */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 text-sm uppercase tracking-wide">Discount Lines</h3>
              <Button variant="ghost" size="sm" onClick={addLine}>
                <Plus className="w-4 h-4 mr-1" />Add Line
              </Button>
            </div>
            {lines.length === 0 ? (
              <p className="text-sm text-zinc-500">No lines — applies to all products.</p>
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
                          onChange={e => updateLine(idx, { lineType: e.target.value as DiscountLine['lineType'], productId: null, categoryId: null })}
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
                      {discount.discountType === 'quantity' && (
                        <>
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Min Qty</label>
                            <Input type="number" min="0" value={line.minQty ?? ''} onChange={e => updateLine(idx, { minQty: parseFloat(e.target.value) || null })} />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Max Qty</label>
                            <Input type="number" min="0" value={line.maxQty ?? ''} onChange={e => updateLine(idx, { maxQty: parseFloat(e.target.value) || null })} />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Disc % (override)</label>
                        <Input type="number" min="0" max="100" step="0.01" value={line.discountPct ?? ''} onChange={e => updateLine(idx, { discountPct: parseFloat(e.target.value) || null })} />
                      </div>
                    </div>
                    <button onClick={() => removeLine(idx)} className="mt-6 text-zinc-600 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex gap-3">
          <Button onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Link href="/pricing/discounts">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>

        {/* Usage History */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm uppercase tracking-wide">Usage History</h3>
            {discount.usages.length === 0 ? (
              <p className="text-sm text-zinc-500">No usages recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 font-medium">Order ID</th>
                      <th className="text-left pb-3 font-medium">Date</th>
                      <th className="text-right pb-3 font-medium">Discount Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {discount.usages.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-900/50">
                        <td className="py-2.5 pr-4 font-mono text-xs text-zinc-400">{u.orderId}</td>
                        <td className="py-2.5 pr-4 text-zinc-500 text-xs">
                          {new Date(u.usedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-emerald-400">
                          -${u.discountAmt.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
