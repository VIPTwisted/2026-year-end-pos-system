'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Layers } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  salePrice: number
}

interface ComponentRow {
  productId: string
  quantity: string
  isOptional: boolean
}

const inputCls =
  'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

export default function NewBundlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  const [form, setForm] = useState({
    productId: '',
    bundleType: 'kit',
  })

  const [components, setComponents] = useState<ComponentRow[]>([
    { productId: '', quantity: '1', isOptional: false },
  ])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : (d.products ?? [])))
      .catch(() => setError('Failed to load products'))
      .finally(() => setProductsLoading(false))
  }, [])

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const addComponent = () =>
    setComponents(prev => [...prev, { productId: '', quantity: '1', isOptional: false }])

  const removeComponent = (idx: number) =>
    setComponents(prev => prev.filter((_, i) => i !== idx))

  const setComp = <K extends keyof ComponentRow>(idx: number, field: K, value: ComponentRow[K]) =>
    setComponents(prev => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)))

  const bundleProduct = products.find(p => p.id === form.productId)

  const componentProducts = components
    .map(c => products.find(p => p.id === c.productId))
    .filter((p): p is Product => p !== undefined)

  const componentCostSum = componentProducts.reduce((s, p, idx) => {
    const qty = parseFloat(components[idx]?.quantity ?? '1') || 1
    return s + p.salePrice * qty
  }, 0)

  const bundlePrice = bundleProduct?.salePrice ?? 0
  const savings = componentCostSum - bundlePrice
  const discountPct = componentCostSum > 0 ? ((savings / componentCostSum) * 100).toFixed(1) : '0'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.productId) {
      setError('Bundle product is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const validComps = components.filter(c => c.productId && c.productId !== form.productId)
      const res = await fetch('/api/products/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          bundleType: form.bundleType,
          components: validComps.map(c => ({
            productId: c.productId,
            quantity: parseInt(c.quantity, 10) || 1,
            isOptional: c.isOptional,
          })),
        }),
      })
      const data = await res.json() as { id?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/products/bundles/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Create Bundle" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-3xl mx-auto p-6">

          <Link
            href="/products/bundles"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Bundles
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800/50 px-6 py-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              <h2 className="text-base font-semibold text-zinc-100">New Bundle / Kit</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Bundle Product <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.productId}
                    onChange={set('productId')}
                    className={inputCls}
                    required
                    disabled={productsLoading}
                  >
                    <option value="">
                      {productsLoading ? 'Loading…' : 'Select parent product…'}
                    </option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-600 mt-1">
                    This is the product customers purchase
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Bundle Type</label>
                  <select value={form.bundleType} onChange={set('bundleType')} className={inputCls}>
                    <option value="kit">Kit — fixed component set</option>
                    <option value="bundle">Bundle — grouped products</option>
                    <option value="assortment">Assortment — mix of variants</option>
                  </select>
                </div>
              </div>

              {/* Components */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={labelCls + ' mb-0'}>Components</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addComponent}
                    className="gap-1.5 text-xs h-7"
                  >
                    <Plus className="w-3 h-3" />
                    Add Component
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-600 px-1 uppercase tracking-wide">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-center">Optional?</div>
                    <div className="col-span-1" />
                  </div>

                  {components.map((comp, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <select
                          value={comp.productId}
                          onChange={e => setComp(idx, 'productId', e.target.value)}
                          className={inputCls}
                        >
                          <option value="">Select component…</option>
                          {products
                            .filter(p => p.id !== form.productId)
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={comp.quantity}
                          onChange={e => setComp(idx, 'quantity', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div className="col-span-3 flex items-center gap-2 justify-center">
                        <input
                          type="checkbox"
                          id={`opt-${idx}`}
                          checked={comp.isOptional}
                          onChange={e => setComp(idx, 'isOptional', e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-blue-500"
                        />
                        <label htmlFor={`opt-${idx}`} className="text-xs text-zinc-500 select-none">
                          Optional
                        </label>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeComponent(idx)}
                          disabled={components.length === 1}
                          className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              {form.productId && componentProducts.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                    Price Analysis
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sum of component prices</span>
                      <span className="tabular-nums font-semibold text-zinc-200">
                        ${componentCostSum.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Bundle price</span>
                      <span className="tabular-nums font-semibold text-zinc-200">
                        ${bundlePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-zinc-800 pt-2 flex justify-between">
                      <span className={savings >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {savings >= 0 ? 'Customer savings' : 'Bundle premium'}
                      </span>
                      <span
                        className={`tabular-nums font-bold ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        ${Math.abs(savings).toFixed(2)} ({discountPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <Link href="/products/bundles">
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" size="sm" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Creating…' : 'Create Bundle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
