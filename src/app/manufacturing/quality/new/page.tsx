'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckSquare, Plus, Trash2 } from 'lucide-react'

interface Product { id: string; name: string; sku: string }

interface Measurement {
  testName: string
  specification: string
  minValue: string
  maxValue: string
}

export default function NewQualityOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])

  const [form, setForm] = useState({
    sourceType: 'purchase_order',
    sourceId: '',
    productId: '',
    quantity: '1',
    sampleSize: '1',
    testType: 'incoming',
    assignedTo: '',
    dueDate: '',
    notes: '',
  })
  const [measurements, setMeasurements] = useState<Measurement[]>([
    { testName: '', specification: '', minValue: '', maxValue: '' },
  ])

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then((d) => setProducts(Array.isArray(d) ? d : d.products ?? [])).catch(() => setProducts([]))
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const setMeas = (i: number, k: keyof Measurement, v: string) =>
    setMeasurements(prev => prev.map((m, idx) => idx === i ? { ...m, [k]: v } : m))

  const addMeasurement = () =>
    setMeasurements(prev => [...prev, { testName: '', specification: '', minValue: '', maxValue: '' }])

  const removeMeasurement = (i: number) =>
    setMeasurements(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productId) { setError('Product is required'); return }
    if (parseFloat(form.quantity) <= 0) { setError('Quantity must be greater than 0'); return }

    setLoading(true)
    setError('')
    try {
      const validMeas = measurements.filter(m => m.testName.trim())
      const res = await fetch('/api/quality/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: form.sourceType,
          sourceId: form.sourceId || null,
          productId: form.productId,
          quantity: parseFloat(form.quantity),
          sampleSize: parseFloat(form.sampleSize) || 1,
          testType: form.testType,
          assignedTo: form.assignedTo || null,
          dueDate: form.dueDate || null,
          notes: form.notes || null,
          measurements: validMeas.length > 0 ? validMeas.map(m => ({
            testName: m.testName.trim(),
            specification: m.specification || null,
            minValue: m.minValue ? parseFloat(m.minValue) : null,
            maxValue: m.maxValue ? parseFloat(m.maxValue) : null,
          })) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/manufacturing/quality/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Quality Order" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/manufacturing/quality"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Quality Orders
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-zinc-400" />
                  Quality Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Source Type</label>
                    <select value={form.sourceType} onChange={set('sourceType')} className={inputCls}>
                      <option value="purchase_order">Purchase Order</option>
                      <option value="production_order">Production Order</option>
                      <option value="inventory">Inventory</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Source ID (optional)</label>
                    <input type="text" value={form.sourceId} onChange={set('sourceId')} placeholder="e.g. PO-2026-0001" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Product <span className="text-red-400">*</span></label>
                  <select value={form.productId} onChange={set('productId')} className={inputCls} required>
                    <option value="">— Select Product —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Quantity <span className="text-red-400">*</span></label>
                    <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={set('quantity')} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Sample Size</label>
                    <input type="number" min="1" step="1" value={form.sampleSize} onChange={set('sampleSize')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Test Type</label>
                    <select value={form.testType} onChange={set('testType')} className={inputCls}>
                      <option value="incoming">Incoming</option>
                      <option value="in_process">In-Process</option>
                      <option value="outgoing">Outgoing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Assigned To</label>
                    <input type="text" value={form.assignedTo} onChange={set('assignedTo')} placeholder="Inspector name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <input type="date" value={form.dueDate} onChange={set('dueDate')} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Internal notes…" className={inputCls + ' resize-none'} />
                </div>
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  Test Measurements
                  <Button type="button" variant="outline" size="sm" className="ml-auto text-xs" onClick={addMeasurement}>
                    <Plus className="w-3 h-3 mr-1" />Add Test
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Test Name', 'Specification', 'Min Value', 'Max Value', ''].map(h => (
                        <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-4 py-2.5">
                          <input type="text" value={m.testName} onChange={e => setMeas(i, 'testName', e.target.value)} placeholder="e.g. Weight" className={inputCls} />
                        </td>
                        <td className="px-4 py-2.5">
                          <input type="text" value={m.specification} onChange={e => setMeas(i, 'specification', e.target.value)} placeholder="e.g. 100g ± 2g" className={inputCls} />
                        </td>
                        <td className="px-4 py-2.5 w-28">
                          <input type="number" step="any" value={m.minValue} onChange={e => setMeas(i, 'minValue', e.target.value)} placeholder="Min" className={inputCls} />
                        </td>
                        <td className="px-4 py-2.5 w-28">
                          <input type="number" step="any" value={m.maxValue} onChange={e => setMeas(i, 'maxValue', e.target.value)} placeholder="Max" className={inputCls} />
                        </td>
                        <td className="px-4 py-2.5 w-10">
                          {measurements.length > 1 && (
                            <button type="button" onClick={() => removeMeasurement(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/manufacturing/quality">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Creating…' : 'Create Quality Order'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
