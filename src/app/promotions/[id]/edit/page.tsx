'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'
const selectCls = inputCls + ' cursor-pointer'

type PromoForm = {
  name: string
  description: string
  type: string
  scope: string
  value: string
  minOrderAmount: string
  minQuantity: string
  buyQuantity: string
  getQuantity: string
  maxDiscount: string
  targetProductId: string
  targetCategoryId: string
  isExclusive: boolean
  priority: string
  perCustomerLimit: string
  startDate: string
  endDate: string
  usageLimit: string
  allowedStoreIds: string
  isActive: boolean
}

export default function EditPromotionPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [form, setForm] = useState<PromoForm>({
    name: '', description: '', type: '', scope: 'order', value: '',
    minOrderAmount: '', minQuantity: '', buyQuantity: '', getQuantity: '',
    maxDiscount: '', targetProductId: '', targetCategoryId: '',
    isExclusive: false, priority: '0', perCustomerLimit: '',
    startDate: '', endDate: '', usageLimit: '', allowedStoreIds: '', isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/promotions/${id}`)
      .then(r => r.json())
      .then(p => {
        setForm({
          name: p.name ?? '',
          description: p.description ?? '',
          type: p.type ?? '',
          scope: p.scope ?? 'order',
          value: String(p.value ?? ''),
          minOrderAmount: p.minOrderAmount != null ? String(p.minOrderAmount) : '',
          minQuantity: p.minQuantity != null ? String(p.minQuantity) : '',
          buyQuantity: p.buyQuantity != null ? String(p.buyQuantity) : '',
          getQuantity: p.getQuantity != null ? String(p.getQuantity) : '',
          maxDiscount: p.maxDiscount != null ? String(p.maxDiscount) : '',
          targetProductId: p.targetProductId ?? '',
          targetCategoryId: p.targetCategoryId ?? '',
          isExclusive: p.isExclusive ?? false,
          priority: String(p.priority ?? 0),
          perCustomerLimit: p.perCustomerLimit != null ? String(p.perCustomerLimit) : '',
          startDate: p.startDate ? p.startDate.slice(0, 16) : '',
          endDate: p.endDate ? p.endDate.slice(0, 16) : '',
          usageLimit: p.usageLimit != null ? String(p.usageLimit) : '',
          allowedStoreIds: p.allowedStoreIds ?? '',
          isActive: p.isActive ?? true,
        })
        setFetching(false)
      })
  }, [id])

  const set = (k: keyof PromoForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError('')
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: form.type,
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
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
        allowedStoreIds: form.allowedStoreIds.trim() || null,
        isActive: form.isActive,
      }
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Update failed') }
      router.push(`/promotions/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <>
        <TopBar title="Edit Promotion" />
        <main className="flex-1 p-6"><p className="text-zinc-500 text-sm">Loading…</p></main>
      </>
    )
  }

  return (
    <>
      <TopBar title="Edit Promotion" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href={`/promotions/${id}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Pencil className="w-4 h-4 text-zinc-400" />
                Edit Promotion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={set('description')} rows={2} className={inputCls + ' resize-none'} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.type} onChange={set('type')} className={selectCls}>
                      <option value="PERCENT_OFF">Percent Off</option>
                      <option value="AMOUNT_OFF">Amount Off</option>
                      <option value="BOGO">Buy X Get Y</option>
                      <option value="FREE_ITEM">Free Item</option>
                      <option value="TIERED_SPEND">Tiered Spend</option>
                      <option value="LOYALTY_BONUS">Loyalty Bonus</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Value {form.type === 'PERCENT_OFF' ? '(%)' : '($)'}</label>
                    <input type="number" min="0" step="0.01" value={form.value} onChange={set('value')} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Scope</label>
                    <select value={form.scope} onChange={set('scope')} className={selectCls}>
                      <option value="order">Order</option>
                      <option value="line">Line item</option>
                      <option value="category">Category</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <input type="number" min="0" step="1" value={form.priority} onChange={set('priority')} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Min Order Amount ($)</label>
                    <input type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={set('minOrderAmount')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Max Discount Cap ($)</label>
                    <input type="number" min="0" step="0.01" value={form.maxDiscount} onChange={set('maxDiscount')} placeholder="None" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Min Quantity</label>
                    <input type="number" min="0" step="1" value={form.minQuantity} onChange={set('minQuantity')} placeholder="1" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Per-Customer Limit</label>
                    <input type="number" min="1" step="1" value={form.perCustomerLimit} onChange={set('perCustomerLimit')} placeholder="Unlimited" className={inputCls} />
                  </div>
                </div>

                {form.type === 'BOGO' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Buy Quantity</label>
                      <input type="number" min="1" step="1" value={form.buyQuantity} onChange={set('buyQuantity')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Get Quantity</label>
                      <input type="number" min="1" step="1" value={form.getQuantity} onChange={set('getQuantity')} className={inputCls} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input type="datetime-local" value={form.startDate} onChange={set('startDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input type="datetime-local" value={form.endDate} onChange={set('endDate')} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Usage Limit (blank = unlimited)</label>
                  <input type="number" min="1" step="1" value={form.usageLimit} onChange={set('usageLimit')} placeholder="Unlimited" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Store Restriction (JSON array, blank = all)</label>
                  <input type="text" value={form.allowedStoreIds} onChange={set('allowedStoreIds')} placeholder='["storeId1"]' className={inputCls} />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
                    <span className="text-sm text-zinc-300">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isExclusive} onChange={e => setForm(p => ({ ...p, isExclusive: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
                    <span className="text-sm text-zinc-300">Exclusive (no stacking)</span>
                  </label>
                </div>

                {error && <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</p>}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href={`/promotions/${id}`}>
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
