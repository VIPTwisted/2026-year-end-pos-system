'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ClipboardList } from 'lucide-react'

interface Product { id: string; name: string; sku: string }
interface BOM { id: string; bomNumber: string; description: string }
interface Routing { id: string; routingNumber: string; description: string }
interface Store { id: string; name: string }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

export default function NewProductionOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [boms, setBoms] = useState<BOM[]>([])
  const [routings, setRoutings] = useState<Routing[]>([])
  const [stores, setStores] = useState<Store[]>([])

  const [form, setForm] = useState({
    productId: '',
    quantity: '',
    unitOfMeasure: 'EACH',
    bomId: '',
    routingId: '',
    storeId: '',
    dueDate: '',
    startingDate: '',
    status: 'simulated',
    notes: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/manufacturing/boms?status=certified').then(r => r.json()),
      fetch('/api/manufacturing/routings').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
    ]).then(([prods, bs, rts, sts]) => {
      setProducts(Array.isArray(prods) ? prods : prods.products ?? [])
      setBoms(bs)
      setRoutings(rts)
      setStores(Array.isArray(sts) ? sts : sts.stores ?? [])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productId || !form.quantity || !form.storeId) {
      setError('Product, quantity, and store are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        productId: form.productId,
        quantity: parseFloat(form.quantity),
        unitOfMeasure: form.unitOfMeasure,
        bomId: form.bomId || undefined,
        routingId: form.routingId || undefined,
        storeId: form.storeId,
        dueDate: form.dueDate || undefined,
        startingDate: form.startingDate || undefined,
        status: form.status,
        notes: form.notes.trim() || undefined,
      }
      const res = await fetch('/api/manufacturing/production-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  return (
    <>
      <TopBar title="New Production Order" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/manufacturing/production-orders"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Production Orders
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-zinc-400" />
                Create Production Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Output Product <span className="text-red-400">*</span></label>
                    <select value={form.productId} onChange={set('productId')} className={inputCls} required>
                      <option value="">Select product…</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
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
                      placeholder="1"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Unit of Measure</label>
                    <input type="text" value={form.unitOfMeasure} onChange={set('unitOfMeasure')} placeholder="EACH" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Bill of Material (Certified)</label>
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
                </div>

                <div>
                  <label className={labelCls}>Store <span className="text-red-400">*</span></label>
                  <select value={form.storeId} onChange={set('storeId')} className={inputCls} required>
                    <option value="">Select store…</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <input type="datetime-local" value={form.dueDate} onChange={set('dueDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Starting Date</label>
                    <input type="datetime-local" value={form.startingDate} onChange={set('startingDate')} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Initial Status</label>
                  <select value={form.status} onChange={set('status')} className={inputCls}>
                    <option value="simulated">Simulated</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    placeholder="Production notes…"
                    rows={3}
                    className={inputCls + ' resize-none'}
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/manufacturing/production-orders">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Order'}
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
