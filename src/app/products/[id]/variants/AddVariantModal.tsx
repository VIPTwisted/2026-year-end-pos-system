'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

interface AttributeValue { id: string; value: string }
interface Attribute { id: string; name: string; values: AttributeValue[] }

interface Props {
  productId: string
  attributes: Attribute[]
}

export function AddVariantModal({ productId, attributes }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    variantCode: '',
    description: '',
    sku: '',
    barcode: '',
    priceOffset: '0',
    costOffset: '0',
    isActive: true,
  })
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.variantCode.trim()) { setError('Variant code is required'); return }

    setLoading(true)
    setError('')
    try {
      const attributeAssignments = Object.values(selectedValues)
        .filter(Boolean)
        .map(attributeValueId => ({ attributeValueId }))

      const res = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantCode: form.variantCode.trim(),
          description: form.description || null,
          sku: form.sku || null,
          barcode: form.barcode || null,
          priceOffset: parseFloat(form.priceOffset) || 0,
          costOffset: parseFloat(form.costOffset) || 0,
          isActive: form.isActive,
          attributeAssignments: attributeAssignments.length > 0 ? attributeAssignments : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <Button size="sm" variant="outline" className="text-xs" onClick={() => setOpen(true)}>
        <Plus className="w-3 h-3 mr-1" />
        Add Variant
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-100">Add Variant</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Variant Code <span className="text-red-400">*</span></label>
                  <input type="text" value={form.variantCode} onChange={set('variantCode')} placeholder="e.g. RED-XL" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>SKU</label>
                  <input type="text" value={form.sku} onChange={set('sku')} placeholder="Unique SKU" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <input type="text" value={form.description} onChange={set('description')} placeholder="Variant description" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Barcode</label>
                <input type="text" value={form.barcode} onChange={set('barcode')} placeholder="Barcode" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Price Offset ($)</label>
                  <input type="number" step="0.01" value={form.priceOffset} onChange={set('priceOffset')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Cost Offset ($)</label>
                  <input type="number" step="0.01" value={form.costOffset} onChange={set('costOffset')} className={inputCls} />
                </div>
              </div>

              {/* Attribute value selections */}
              {attributes.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Attributes</p>
                  {attributes.map(attr => (
                    <div key={attr.id}>
                      <label className={labelCls}>{attr.name}</label>
                      <select
                        value={selectedValues[attr.id] ?? ''}
                        onChange={e => setSelectedValues(prev => ({ ...prev, [attr.id]: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="">— None —</option>
                        {attr.values.map(v => <option key={v.id} value={v.id}>{v.value}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="accent-blue-500 w-4 h-4"
                />
                Active
              </label>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? 'Creating…' : 'Add Variant'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
