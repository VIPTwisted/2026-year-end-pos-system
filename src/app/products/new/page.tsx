'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'

interface Category { id: string; name: string }

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', description: '',
    categoryId: '', costPrice: '', salePrice: '',
    unit: 'each', reorderPoint: '', reorderQty: '',
    taxable: true, trackStock: true, isActive: true,
  })

  useEffect(() => {
    fetch('/api/products/categories').then(r => r.json()).then(setCategories).catch(() => setCategories([]))
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const setCheck = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.checked }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.sku.trim()) { setError('Name and SKU are required'); return }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        barcode: form.barcode.trim() || undefined,
        description: form.description.trim() || undefined,
        categoryId: form.categoryId || undefined,
        costPrice: parseFloat(form.costPrice) || 0,
        salePrice: parseFloat(form.salePrice) || 0,
        unit: form.unit,
        taxable: form.taxable,
        trackStock: form.trackStock,
        isActive: form.isActive,
        reorderPoint: form.reorderPoint ? parseInt(form.reorderPoint) : undefined,
        reorderQty: form.reorderQty ? parseInt(form.reorderQty) : undefined,
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/products/${data.id}`)
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
      <TopBar title="New Product" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400" />
                Add Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Premium Widget 500ml" className={inputCls} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>SKU <span className="text-red-400">*</span></label>
                    <input type="text" value={form.sku} onChange={set('sku')} placeholder="PROD-001" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Barcode</label>
                    <input type="text" value={form.barcode} onChange={set('barcode')} placeholder="012345678901" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={set('description')} placeholder="Product description…" rows={3} className={inputCls + ' resize-none'} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
                      <option value="">— Uncategorized —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Unit of Measure</label>
                    <select value={form.unit} onChange={set('unit')} className={inputCls}>
                      {['each','case','lb','oz','kg','g','liter','ml','ft','m','box','pack'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Cost Price ($)</label>
                    <input type="number" min="0" step="0.01" value={form.costPrice} onChange={set('costPrice')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Sale Price ($)</label>
                    <input type="number" min="0" step="0.01" value={form.salePrice} onChange={set('salePrice')} placeholder="0.00" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Reorder Point</label>
                    <input type="number" min="0" value={form.reorderPoint} onChange={set('reorderPoint')} placeholder="e.g. 10" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Reorder Qty</label>
                    <input type="number" min="0" value={form.reorderQty} onChange={set('reorderQty')} placeholder="e.g. 50" className={inputCls} />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6 pt-1">
                  {([
                    { key: 'taxable', label: 'Taxable' },
                    { key: 'trackStock', label: 'Track Stock' },
                    { key: 'isActive', label: 'Active' },
                  ] as const).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[key] as boolean}
                        onChange={setCheck(key)}
                        className="accent-blue-500 w-4 h-4"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/products">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Add Product'}
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
