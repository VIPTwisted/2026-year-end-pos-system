'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

interface Product { id: string; sku: string; name: string; unit: string; costPrice: number }
interface Store { id: string; name: string }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700/60 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

export default function NewAdjustmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])

  const [form, setForm] = useState({
    journalTemplate: 'ITEM',
    journalBatch: 'DEFAULT',
    lineNo: '1',
    entryType: 'Positive Adjmt.',
    productId: '',
    description: '',
    locationCode: '',
    storeId: '',
    quantity: '',
    unitCost: '',
    postingDate: new Date().toISOString().split('T')[0],
    documentNo: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()).catch(() => []),
    ]).then(([prods, sts]) => {
      setProducts(Array.isArray(prods) ? prods : prods.products ?? [])
      setStores(Array.isArray(sts) ? sts : sts.stores ?? [])
    })
  }, [])

  // Auto-fill unit cost when product is selected
  const handleProductChange = (productId: string) => {
    const prod = products.find(p => p.id === productId)
    setForm(prev => ({
      ...prev,
      productId,
      description: prod?.name ?? '',
      unitCost: prod?.costPrice?.toString() ?? '',
    }))
  }

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productId || !form.quantity) { setError('Item No. and Qty. are required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalTemplate: form.journalTemplate,
          journalBatch: form.journalBatch,
          lineNo: parseInt(form.lineNo) || 1,
          entryType: form.entryType,
          productId: form.productId,
          description: form.description || undefined,
          locationCode: form.locationCode || undefined,
          storeId: form.storeId || undefined,
          quantity: parseFloat(form.quantity),
          unitCost: parseFloat(form.unitCost) || 0,
          postingDate: form.postingDate,
          documentNo: form.documentNo || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create')
      router.push('/inventory/adjustments')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Journal Line" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Header */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/inventory/adjustments" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Item Journal
            </Link>
            <span className="text-zinc-700">›</span>
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span className="font-bold text-base text-zinc-100">New Adjustment Line</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-w-3xl">

          {/* Journal Header */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Journal Batch</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Journal Template</label>
                <input type="text" value={form.journalTemplate} onChange={set('journalTemplate')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Journal Batch</label>
                <input type="text" value={form.journalBatch} onChange={set('journalBatch')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Line No.</label>
                <input type="number" min="1" value={form.lineNo} onChange={set('lineNo')} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Line Detail */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Journal Line</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Entry Type</label>
                <select value={form.entryType} onChange={set('entryType')} className={inputCls}>
                  <option>Positive Adjmt.</option>
                  <option>Negative Adjmt.</option>
                  <option>Transfer</option>
                  <option>Sale</option>
                  <option>Purchase</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Posting Date</label>
                <input type="date" value={form.postingDate} onChange={set('postingDate')} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Item No. <span className="text-red-400">*</span></label>
                <select
                  value={form.productId}
                  onChange={e => handleProductChange(e.target.value)}
                  className={inputCls}
                  required
                >
                  <option value="">— Select Item —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input type="text" value={form.description} onChange={set('description')} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Location Code</label>
                <select value={form.storeId} onChange={e => setForm(p => ({ ...p, storeId: e.target.value, locationCode: e.target.options[e.target.selectedIndex].text }))} className={inputCls}>
                  <option value="">— Select Store —</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Document No.</label>
                <input type="text" value={form.documentNo} onChange={set('documentNo')} placeholder="ADJ-001" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Qty. <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  step="0.001"
                  value={form.quantity}
                  onChange={set('quantity')}
                  placeholder="0"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Unit Cost ($)</label>
                <input type="number" min="0" step="0.01" value={form.unitCost} onChange={set('unitCost')} placeholder="0.00" className={inputCls} />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3 mt-4">
            <Link href="/inventory/adjustments">
              <button type="button" className="h-8 px-4 text-[13px] text-zinc-300 border border-zinc-700 hover:border-zinc-500 rounded transition-colors">
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="h-8 px-4 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Line'}
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
