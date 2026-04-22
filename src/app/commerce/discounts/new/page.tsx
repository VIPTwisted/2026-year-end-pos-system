'use client'
import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

type Tab = 'general' | 'lines' | 'channels' | 'loyalty'

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'lines', label: 'Lines' },
  { id: 'channels', label: 'Channels' },
  { id: 'loyalty', label: 'Loyalty Tiers' },
]

export default function NewDiscountPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    discountCode: '',
    discountType: 'simple',
    status: 'active',
    discountMethod: 'percent',
    discountValue: '',
    startDate: '',
    endDate: '',
    couponRequired: false,
    couponCode: '',
    minPurchaseAmt: '',
    maxUsageCount: '',
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          discountCode: form.discountCode,
          discountType: form.discountType,
          status: form.status,
          discountMethod: form.discountMethod,
          discountValue: parseFloat(form.discountValue) || 0,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          couponRequired: form.couponRequired,
          couponCode: form.couponCode || undefined,
          minPurchaseAmt: form.minPurchaseAmt ? parseFloat(form.minPurchaseAmt) : undefined,
          maxUsageCount: form.maxUsageCount ? parseInt(form.maxUsageCount) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create discount'); return }
      router.push('/commerce/discounts')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Discount" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <span className="hover:text-zinc-300 cursor-pointer" onClick={() => router.push('/commerce/discounts')}>Discounts</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">New</span>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-zinc-100">New Discount</h1>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push('/commerce/discounts')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}

          {/* FastTabs */}
          <div className="flex gap-0 border-b border-zinc-800">
            {TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Discount Code *</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
                      placeholder="SUMMER20" value={form.discountCode}
                      onChange={e => set('discountCode', e.target.value.toUpperCase())} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Discount Name *</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="Summer Sale 20%" value={form.name}
                      onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Discount Type</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                      <option value="simple">Simple</option>
                      <option value="quantity">Quantity</option>
                      <option value="mix_match">Mix &amp; Match</option>
                      <option value="threshold">Threshold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Status</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Discount Method</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.discountMethod} onChange={e => set('discountMethod', e.target.value)}>
                      <option value="percent">Percentage</option>
                      <option value="amount">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">
                      {form.discountMethod === 'percent' ? 'Discount %' : 'Discount Amount ($)'} *
                    </label>
                    <input type="number" step="0.01" min={0}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="20" value={form.discountValue}
                      onChange={e => set('discountValue', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Start Date</label>
                    <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">End Date</label>
                    <input type="date" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Min. Purchase Amount</label>
                    <input type="number" step="0.01" min={0}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="0.00" value={form.minPurchaseAmt}
                      onChange={e => set('minPurchaseAmt', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Max Usage Count</label>
                    <input type="number" min={0}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="Unlimited" value={form.maxUsageCount}
                      onChange={e => set('maxUsageCount', e.target.value)} />
                  </div>

                  {/* Coupon toggle */}
                  <div className="col-span-2 flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Require Coupon Code</p>
                      <p className="text-xs text-zinc-500">Customer must enter coupon code at checkout</p>
                    </div>
                    <button type="button" onClick={() => set('couponRequired', !form.couponRequired)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${form.couponRequired ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.couponRequired ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  {form.couponRequired && (
                    <div className="col-span-2">
                      <label className="block text-xs text-zinc-500 mb-1">Coupon Code</label>
                      <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
                        placeholder="COUPON2026" value={form.couponCode}
                        onChange={e => set('couponCode', e.target.value.toUpperCase())} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'lines' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Discount Lines</h3>
                <p className="text-sm text-zinc-500">Discount lines define which products, categories, or all items the discount applies to. Save the discount first, then add lines.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'channels' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Channel Assignment</h3>
                <p className="text-sm text-zinc-500">Assign this discount to specific channels (online store, retail POS, call center). Applies to all channels by default.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'loyalty' && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Loyalty Tier Restrictions</h3>
                <p className="text-sm text-zinc-500">Restrict this discount to specific loyalty program tiers (e.g., Gold, Platinum only). Leave empty to apply to all customers.</p>
              </CardContent>
            </Card>
          )}
        </form>
      </main>
    </>
  )
}
