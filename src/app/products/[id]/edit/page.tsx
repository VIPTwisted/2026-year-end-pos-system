'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Package, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Category { id: string; name: string }
interface Supplier { id: string; name: string }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700/60 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

function FastTab({ title, open = true, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
      <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 list-none flex items-center justify-between select-none">
        <span>{title}</span>
        <span className="text-zinc-600 text-[10px]">▼</span>
      </summary>
      <div className="px-4 pb-4 pt-3 border-t border-zinc-800/40">
        {children}
      </div>
    </details>
  )
}

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', description: '', imageUrl: '',
    categoryId: '', supplierId: '',
    costPrice: '0', salePrice: '0',
    unit: 'each',
    taxable: true, trackStock: true, isActive: true,
    reorderPoint: '', reorderQty: '',
  })

  useEffect(() => {
    async function load() {
      const [prodRes, catRes, supRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch('/api/products/categories'),
        fetch('/api/suppliers').catch(() => ({ ok: false, json: async () => [] })),
      ])
      if (!prodRes.ok) { setError('Product not found'); setLoading(false); return }
      const prod = await prodRes.json()
      const cats = catRes.ok ? await catRes.json() : []
      const sups = (supRes as Response).ok ? await (supRes as Response).json() : []
      setCategories(cats)
      setSuppliers(sups)
      setForm({
        name: prod.name ?? '',
        sku: prod.sku ?? '',
        barcode: prod.barcode ?? '',
        description: prod.description ?? '',
        imageUrl: prod.imageUrl ?? '',
        categoryId: prod.categoryId ?? '',
        supplierId: prod.supplierId ?? '',
        costPrice: String(prod.costPrice ?? 0),
        salePrice: String(prod.salePrice ?? 0),
        unit: prod.unit ?? 'each',
        taxable: prod.taxable ?? true,
        trackStock: prod.trackStock ?? true,
        isActive: prod.isActive ?? true,
        reorderPoint: prod.reorderPoint != null ? String(prod.reorderPoint) : '',
        reorderQty: prod.reorderQty != null ? String(prod.reorderQty) : '',
      })
      setLoading(false)
    }
    load()
  }, [id])

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          costPrice: parseFloat(form.costPrice) || 0,
          salePrice: parseFloat(form.salePrice) || 0,
          reorderPoint: form.reorderPoint ? parseInt(form.reorderPoint) : null,
          reorderQty: form.reorderQty ? parseInt(form.reorderQty) : null,
          categoryId: form.categoryId || null,
          supplierId: form.supplierId || null,
          barcode: form.barcode || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Save failed'); setSaving(false); return }
      router.push(`/products/${id}`)
    } catch {
      setError('Network error')
      setSaving(false)
    }
  }

  if (loading) return (
    <>
      <TopBar title="Edit Item" />
      <main className="flex-1 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </main>
    </>
  )

  return (
    <>
      <TopBar title="Edit Item" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/products/${id}`} className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Link>
              <span className="text-zinc-700">›</span>
              <Package className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-base text-zinc-100">Edit: {form.name || id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/products/${id}`}
                className="h-7 px-3 text-[12px] font-medium text-zinc-400 border border-zinc-700 hover:border-zinc-500 rounded transition-colors">
                Discard
              </Link>
              <button
                form="edit-form"
                type="submit"
                disabled={saving}
                className="h-7 px-3 text-[12px] font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors inline-flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded text-[13px] text-red-400">{error}</div>
        )}

        <form id="edit-form" onSubmit={handleSave} className="p-6 max-w-4xl space-y-3">

          <FastTab title="General">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>No. (SKU) *</label>
                <input className={inputCls} value={form.sku} onChange={e => set('sku', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Description *</label>
                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Description 2</label>
                <textarea className={inputCls} rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Barcode</label>
                <input className={inputCls} value={form.barcode} onChange={e => set('barcode', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Base Unit of Measure</label>
                <select className={inputCls} value={form.unit} onChange={e => set('unit', e.target.value)}>
                  {['each','kg','lb','oz','g','l','ml','m','ft','box','case','dozen','pair','set'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Item Category Code</label>
                <select className={inputCls} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                  <option value="">— No Category —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input className={inputCls} value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!form.isActive} onChange={e => set('isActive', !e.target.checked)}
                    className="w-4 h-4 accent-red-500" />
                  <span className="text-[13px] text-zinc-300">Blocked</span>
                </label>
              </div>
            </div>
          </FastTab>

          <FastTab title="Inventory">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Reorder Point</label>
                <input type="number" min="0" className={inputCls} value={form.reorderPoint} onChange={e => set('reorderPoint', e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Reorder Quantity</label>
                <input type="number" min="0" className={inputCls} value={form.reorderQty} onChange={e => set('reorderQty', e.target.value)} placeholder="0" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.trackStock} onChange={e => set('trackStock', e.target.checked)}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-[13px] text-zinc-300">Track Stock</span>
                </label>
              </div>
            </div>
          </FastTab>

          <FastTab title="Costs & Posting">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Unit Cost (Cost Price)</label>
                <input type="number" min="0" step="0.01" className={inputCls} value={form.costPrice} onChange={e => set('costPrice', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Unit Price (Sale Price)</label>
                <input type="number" min="0" step="0.01" className={inputCls} value={form.salePrice} onChange={e => set('salePrice', e.target.value)} required />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.taxable} onChange={e => set('taxable', e.target.checked)}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-[13px] text-zinc-300">Taxable</span>
                </label>
              </div>
            </div>
          </FastTab>

          <FastTab title="Replenishment" open={false}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Vendor No.</label>
                <select className={inputCls} value={form.supplierId} onChange={e => set('supplierId', e.target.value)}>
                  <option value="">— No Vendor —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </FastTab>

        </form>
      </main>
    </>
  )
}
