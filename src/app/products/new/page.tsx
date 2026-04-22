'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function NewItemPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const [form, setForm] = useState({
    sku: '', name: '', description: '', barcode: '', imageUrl: '',
    categoryId: '', supplierId: '',
    unit: 'each',
    costPrice: '0', salePrice: '0',
    taxable: true, trackStock: true, isActive: true,
    reorderPoint: '', reorderQty: '',
  })

  useEffect(() => {
    fetch('/api/products/categories').then(r => r.json()).then(setCategories).catch(() => {})
    fetch('/api/suppliers').then(r => r.json()).then(setSuppliers).catch(() => {})
  }, [])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave() {
    setError('')
    if (!form.name.trim()) { setError('Description is required'); return }
    if (!form.sku.trim()) { setError('No. (SKU) is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          sku: form.sku.trim(),
          barcode: form.barcode.trim() || null,
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          categoryId: form.categoryId || null,
          supplierId: form.supplierId || null,
          costPrice: parseFloat(form.costPrice) || 0,
          salePrice: parseFloat(form.salePrice) || 0,
          unit: form.unit,
          taxable: form.taxable,
          trackStock: form.trackStock,
          isActive: form.isActive,
          reorderPoint: form.reorderPoint ? parseInt(form.reorderPoint) : null,
          reorderQty: form.reorderQty ? parseInt(form.reorderQty) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create item'); setSaving(false); return }
      router.push(`/products/${data.id}`)
    } catch {
      setError('Network error — please try again')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Item" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Action Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/products" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Items
              </Link>
              <span className="text-zinc-700">›</span>
              <Package className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-base text-zinc-100">New Item</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/products"
                className="h-7 px-3 text-[12px] font-medium text-zinc-400 border border-zinc-700 hover:border-zinc-500 rounded transition-colors">
                Discard
              </Link>
              <button
                onClick={handleSave}
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

        <div className="p-6 max-w-4xl space-y-3">

          <FastTab title="General">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>No. (SKU) <span className="text-red-400">*</span></label>
                <input value={form.sku} onChange={set('sku')} placeholder="ITEM-001" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={set('name')} placeholder="Item description" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Description 2</label>
                <textarea rows={2} value={form.description} onChange={set('description')} placeholder="Additional notes" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Base Unit of Measure</label>
                <select value={form.unit} onChange={set('unit')} className={inputCls}>
                  {['each','box','case','kg','lb','oz','g','l','ml','m','ft','pack','dozen','pair','set'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Item Category Code</label>
                <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Barcode</label>
                <input value={form.barcode} onChange={set('barcode')} placeholder="012345678901" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." className={inputCls} />
              </div>
              <div className="col-span-2 flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!form.isActive}
                    onChange={e => setForm(p => ({ ...p, isActive: !e.target.checked }))}
                    className="w-4 h-4 accent-red-500" />
                  <span className="text-[13px] text-zinc-300">Blocked</span>
                </label>
              </div>
            </div>
          </FastTab>

          <FastTab title="Costs & Posting">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Unit Cost (Cost Price)</label>
                <input type="number" min="0" step="0.01" value={form.costPrice} onChange={set('costPrice')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Unit Price (Sale Price)</label>
                <input type="number" min="0" step="0.01" value={form.salePrice} onChange={set('salePrice')} className={inputCls} />
              </div>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.taxable}
                    onChange={e => setForm(p => ({ ...p, taxable: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-[13px] text-zinc-300">Taxable</span>
                </label>
              </div>
            </div>
          </FastTab>

          <FastTab title="Inventory" open={false}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Reorder Point</label>
                <input type="number" min="0" value={form.reorderPoint} onChange={set('reorderPoint')} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Reorder Quantity</label>
                <input type="number" min="0" value={form.reorderQty} onChange={set('reorderQty')} placeholder="0" className={inputCls} />
              </div>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.trackStock}
                    onChange={e => setForm(p => ({ ...p, trackStock: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-[13px] text-zinc-300">Track Stock</span>
                </label>
              </div>
            </div>
          </FastTab>

          <FastTab title="Replenishment" open={false}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Vendor No.</label>
                <select value={form.supplierId} onChange={set('supplierId')} className={inputCls}>
                  <option value="">— No Vendor —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </FastTab>

        </div>
      </main>
    </>
  )
}
