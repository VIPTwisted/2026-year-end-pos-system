'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, ClipboardList } from 'lucide-react'

interface Product { id: string; name: string; sku: string }
interface BOM { id: string; bomNumber: string; description: string }
interface Routing { id: string; routingNumber: string; description: string }
interface Store { id: string; name: string }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'
const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

export default function NewProductionOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'schedule' | 'lines'>('general')
  const [products, setProducts] = useState<Product[]>([])
  const [boms, setBoms] = useState<BOM[]>([])
  const [routings, setRoutings] = useState<Routing[]>([])
  const [stores, setStores] = useState<Store[]>([])

  const [form, setForm] = useState({
    productId: '',
    quantity: '1',
    unitOfMeasure: 'EACH',
    bomId: '',
    routingId: '',
    storeId: '',
    dueDate: '',
    startingDate: '',
    endingDate: '',
    status: 'planned',
    sourceType: 'item',
    notes: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/manufacturing/boms').then(r => r.json()),
      fetch('/api/manufacturing/routings').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
    ]).then(([prods, bs, rts, sts]) => {
      setProducts(Array.isArray(prods) ? prods : prods.products ?? [])
      setBoms(Array.isArray(bs) ? bs : [])
      setRoutings(Array.isArray(rts) ? rts : [])
      setStores(Array.isArray(sts) ? sts : sts.stores ?? [])
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productId || !form.quantity) {
      setError('Product and quantity are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/manufacturing/production-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          quantity: parseFloat(form.quantity),
          unitOfMeasure: form.unitOfMeasure,
          bomId: form.bomId || undefined,
          routingId: form.routingId || undefined,
          storeId: form.storeId || undefined,
          dueDate: form.dueDate || undefined,
          startingDate: form.startingDate || undefined,
          endingDate: form.endingDate || undefined,
          status: form.status,
          sourceType: form.sourceType,
          notes: form.notes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/manufacturing/production-orders/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'lines', label: 'Lines' },
  ] as const

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Production Order" />
      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-5">

          <Link
            href="/manufacturing/production-orders"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Production Orders
          </Link>

          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">New Production Order</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FastTab Navigation */}
            <div className="flex items-center gap-0 border-b border-zinc-800">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  <ClipboardList className="w-3.5 h-3.5 text-zinc-500" />
                  General
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Source Type</label>
                    <select value={form.sourceType} onChange={set('sourceType')} className={inputCls}>
                      <option value="item">Item</option>
                      <option value="sales">Sales Order</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Output Product <span className="text-red-400">*</span></label>
                    <select value={form.productId} onChange={set('productId')} className={inputCls} required>
                      <option value="">Select product…</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Quantity <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={form.quantity}
                      onChange={set('quantity')}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Unit of Measure</label>
                    <input type="text" value={form.unitOfMeasure} onChange={set('unitOfMeasure')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Bill of Material</label>
                    <select value={form.bomId} onChange={set('bomId')} className={inputCls}>
                      <option value="">None</option>
                      {boms.map(b => (
                        <option key={b.id} value={b.id}>{b.bomNumber} — {b.description}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Routing</label>
                    <select value={form.routingId} onChange={set('routingId')} className={inputCls}>
                      <option value="">None</option>
                      {routings.map(r => (
                        <option key={r.id} value={r.id}>{r.routingNumber} — {r.description}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <select value={form.storeId} onChange={set('storeId')} className={inputCls}>
                      <option value="">Select location…</option>
                      {stores.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Initial Status</label>
                    <select value={form.status} onChange={set('status')} className={inputCls}>
                      <option value="simulated">Simulated</option>
                      <option value="planned">Planned</option>
                      <option value="firm_planned">Firm Planned</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={set('notes')}
                      rows={3}
                      className={inputCls + ' resize-none'}
                      placeholder="Production notes…"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  Schedule
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <input type="date" value={form.dueDate} onChange={set('dueDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Starting Date</label>
                    <input type="date" value={form.startingDate} onChange={set('startingDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Ending Date</label>
                    <input type="date" value={form.endingDate} onChange={set('endingDate')} className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* Lines Tab */}
            {activeTab === 'lines' && (
              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  Lines
                </div>
                <div className="p-4 text-xs text-zinc-600">
                  Component lines are auto-populated from the BOM when the order is saved. You can manage them on the order card after creation.
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/manufacturing/production-orders"
                className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
              >
                {loading ? 'Creating…' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
