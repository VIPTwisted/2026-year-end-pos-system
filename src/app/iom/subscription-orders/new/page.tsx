'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
]

export default function NewSubscriptionOrderPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    orderNo: '',
    customerId: '',
    itemId: '',
    itemName: '',
    frequency: 'monthly',
    nextOrderDate: '',
    qty: '1',
    unitPrice: '',
    notes: '',
  })

  function setField(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/iom/subscription-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          qty: parseFloat(form.qty) || 1,
          unitPrice: parseFloat(form.unitPrice) || 0,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      router.push('/iom/subscription-orders')
    } catch {
      alert('Failed to create subscription order')
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60'
  const labelCls = 'block text-[11px] uppercase tracking-wide text-zinc-500 mb-1'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Subscription Order" />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">

        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-zinc-400" />
          <h1 className="text-sm font-semibold text-zinc-200">New Subscription Order</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Order No. *</label>
                <input className={inputCls} value={form.orderNo} onChange={e => setField('orderNo', e.target.value)} placeholder="SUB-0001" required />
              </div>
              <div>
                <label className={labelCls}>Customer ID</label>
                <input className={inputCls} value={form.customerId} onChange={e => setField('customerId', e.target.value)} placeholder="Customer ID" />
              </div>
              <div>
                <label className={labelCls}>Item ID</label>
                <input className={inputCls} value={form.itemId} onChange={e => setField('itemId', e.target.value)} placeholder="Item ID" />
              </div>
              <div>
                <label className={labelCls}>Item Name</label>
                <input className={inputCls} value={form.itemName} onChange={e => setField('itemName', e.target.value)} placeholder="Item description" />
              </div>
              <div>
                <label className={labelCls}>Qty</label>
                <input type="number" step="0.001" min="0" className={inputCls} value={form.qty} onChange={e => setField('qty', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Unit Price</label>
                <input type="number" step="0.01" min="0" className={inputCls} value={form.unitPrice} onChange={e => setField('unitPrice', e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className={labelCls}>Frequency</label>
                <select className={inputCls} value={form.frequency} onChange={e => setField('frequency', e.target.value)}>
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Next Order Date</label>
                <input type="date" className={inputCls} value={form.nextOrderDate} onChange={e => setField('nextOrderDate', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Notes</label>
                <textarea className={`${inputCls} resize-none h-16`} value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Optional notes..." />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Subscription Order'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
