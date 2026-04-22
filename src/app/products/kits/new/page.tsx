'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Plus, Trash2 } from 'lucide-react'

interface Product { id: string; name: string; sku: string; salePrice: number }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

interface ComponentRow {
  componentId: string
  quantity: string
  isOptional: boolean
  chargeType: 'included' | 'add_price' | 'subtract_price'
  priceOffset: string
}

export default function NewKitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])

  const [form, setForm] = useState({
    productId: '',
    kitType: 'fixed',
    description: '',
  })

  const [components, setComponents] = useState<ComponentRow[]>([
    { componentId: '', quantity: '1', isOptional: false, chargeType: 'included', priceOffset: '0' },
  ])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      setProducts(Array.isArray(d) ? d : d.products ?? [])
    })
  }, [])

  const addComponent = () =>
    setComponents(prev => [...prev, { componentId: '', quantity: '1', isOptional: false, chargeType: 'included', priceOffset: '0' }])

  const removeComponent = (idx: number) =>
    setComponents(prev => prev.filter((_, i) => i !== idx))

  const setComp = <K extends keyof ComponentRow>(idx: number, field: K, value: ComponentRow[K]) =>
    setComponents(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productId) {
      setError('Kit product is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const validComps = components.filter(c => c.componentId)
      const res = await fetch('/api/products/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          kitType: form.kitType,
          description: form.description || undefined,
          components: validComps.map((c, idx) => ({
            componentId: c.componentId,
            quantity: parseFloat(c.quantity) || 1,
            isOptional: c.isOptional,
            chargeType: c.chargeType,
            priceOffset: parseFloat(c.priceOffset) || 0,
            sortOrder: idx,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/products/kits/${data.productId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Create Kit / Bundle" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/products/kits"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Kits & Bundles
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400" />
                New Kit / Bundle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Kit / Bundle Product <span className="text-red-400">*</span></label>
                  <select value={form.productId} onChange={set('productId')} className={inputCls} required>
                    <option value="">Select the parent product…</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Kit Type</label>
                    <select value={form.kitType} onChange={set('kitType')} className={inputCls}>
                      <option value="fixed">Fixed — always same components</option>
                      <option value="configurable">Configurable — optional components</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <input type="text" value={form.description} onChange={set('description')} placeholder="Bundle description…" className={inputCls} />
                  </div>
                </div>

                {/* Components */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelCls + ' mb-0'}>Components</label>
                    <Button type="button" variant="outline" size="sm" onClick={addComponent} className="gap-1.5 text-xs">
                      <Plus className="w-3 h-3" /> Add Component
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-xs text-zinc-600 px-1">
                      <div className="col-span-4">Product</div>
                      <div className="col-span-1">Qty</div>
                      <div className="col-span-2">Charge</div>
                      <div className="col-span-2">Offset $</div>
                      <div className="col-span-2">Optional?</div>
                      <div className="col-span-1" />
                    </div>
                    {components.map((comp, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <select
                            value={comp.componentId}
                            onChange={e => setComp(idx, 'componentId', e.target.value)}
                            className={inputCls}
                          >
                            <option value="">Select…</option>
                            {products
                              .filter(p => p.id !== form.productId)
                              .map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={comp.quantity}
                            onChange={e => setComp(idx, 'quantity', e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={comp.chargeType}
                            onChange={e => setComp(idx, 'chargeType', e.target.value as ComponentRow['chargeType'])}
                            className={inputCls}
                          >
                            <option value="included">Included</option>
                            <option value="add_price">Add Price</option>
                            <option value="subtract_price">Subtract</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            value={comp.priceOffset}
                            onChange={e => setComp(idx, 'priceOffset', e.target.value)}
                            className={inputCls}
                            disabled={comp.chargeType === 'included'}
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-2 pl-2">
                          <input
                            type="checkbox"
                            checked={comp.isOptional}
                            onChange={e => setComp(idx, 'isOptional', e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-blue-500"
                          />
                          <span className="text-xs text-zinc-500">Optional</span>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeComponent(idx)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/products/kits">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Kit'}
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
