'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, Plus, Trash2 } from 'lucide-react'

interface Vendor { id: string; name: string; vendorCode: string }
interface Product { id: string; name: string; sku: string }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

interface ComponentLine {
  productId: string
  quantity: string
  type: 'component' | 'output'
  unitOfMeasure: string
}

export default function NewSubcontractingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [form, setForm] = useState({
    vendorId: '',
    productionOrderId: '',
    workCenterId: '',
    operationNo: '',
    description: '',
    quantity: '',
    unitOfMeasure: 'EACH',
    unitCost: '',
    expectedDate: '',
    notes: '',
  })

  const [lines, setLines] = useState<ComponentLine[]>([
    { productId: '', quantity: '1', type: 'component', unitOfMeasure: 'EACH' },
  ])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    Promise.all([
      fetch('/api/vendors').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([vs, ps]) => {
      setVendors(Array.isArray(vs) ? vs : vs.vendors ?? [])
      setProducts(Array.isArray(ps) ? ps : ps.products ?? [])
    })
  }, [])

  const addLine = () =>
    setLines(prev => [...prev, { productId: '', quantity: '1', type: 'component', unitOfMeasure: 'EACH' }])

  const removeLine = (idx: number) =>
    setLines(prev => prev.filter((_, i) => i !== idx))

  const setLine = (idx: number, field: keyof ComponentLine, value: string) =>
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vendorId || !form.quantity || !form.description) {
      setError('Vendor, description, and quantity are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const validLines = lines.filter(l => l.productId && l.quantity)
      const res = await fetch('/api/manufacturing/subcontracting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: form.vendorId,
          productionOrderId: form.productionOrderId || undefined,
          workCenterId: form.workCenterId || undefined,
          operationNo: form.operationNo || undefined,
          description: form.description,
          quantity: parseFloat(form.quantity),
          unitOfMeasure: form.unitOfMeasure,
          unitCost: form.unitCost ? parseFloat(form.unitCost) : 0,
          expectedDate: form.expectedDate || undefined,
          notes: form.notes || undefined,
          lines: validLines.map(l => ({
            productId: l.productId,
            quantity: parseFloat(l.quantity),
            type: l.type,
            unitOfMeasure: l.unitOfMeasure,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/manufacturing/subcontracting/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Subcontracting Order" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/manufacturing/subcontracting"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Subcontracting
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-zinc-400" />
                Create Subcontracting Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Vendor + IDs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Vendor <span className="text-red-400">*</span></label>
                    <select value={form.vendorId} onChange={set('vendorId')} className={inputCls} required>
                      <option value="">Select vendor…</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Production Order ID</label>
                    <input type="text" value={form.productionOrderId} onChange={set('productionOrderId')} placeholder="PO-2026-0001" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Work Center ID</label>
                    <input type="text" value={form.workCenterId} onChange={set('workCenterId')} placeholder="WC-001" className={inputCls} />
                  </div>
                </div>

                {/* Operation + Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Operation No.</label>
                    <input type="text" value={form.operationNo} onChange={set('operationNo')} placeholder="10" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit of Measure</label>
                    <input type="text" value={form.unitOfMeasure} onChange={set('unitOfMeasure')} placeholder="EACH" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input type="text" value={form.description} onChange={set('description')} placeholder="Powder coating operation" className={inputCls} required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Quantity <span className="text-red-400">*</span></label>
                    <input type="number" min="0.001" step="any" value={form.quantity} onChange={set('quantity')} placeholder="100" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Unit Cost</label>
                    <input type="number" min="0" step="0.01" value={form.unitCost} onChange={set('unitCost')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Expected Date</label>
                    <input type="date" value={form.expectedDate} onChange={set('expectedDate')} className={inputCls} />
                  </div>
                </div>

                {/* Component Lines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelCls + ' mb-0'}>Components / Outputs</label>
                    <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1.5 text-xs">
                      <Plus className="w-3 h-3" /> Add Line
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {lines.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <select
                            value={line.productId}
                            onChange={e => setLine(idx, 'productId', e.target.value)}
                            className={inputCls}
                          >
                            <option value="">Select product…</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={line.quantity}
                            onChange={e => setLine(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className={inputCls}
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={line.type}
                            onChange={e => setLine(idx, 'type', e.target.value)}
                            className={inputCls}
                          >
                            <option value="component">Component</option>
                            <option value="output">Output</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={line.unitOfMeasure}
                            onChange={e => setLine(idx, 'unitOfMeasure', e.target.value)}
                            placeholder="UOM"
                            className={inputCls}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    rows={3}
                    placeholder="Additional notes…"
                    className={inputCls + ' resize-none'}
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/manufacturing/subcontracting">
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
