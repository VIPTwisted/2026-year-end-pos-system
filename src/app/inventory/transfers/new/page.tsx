'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Store {
  id: string
  name: string
  city: string | null
  state: string | null
}

interface Product {
  id: string
  name: string
  sku: string
  unit: string
}

interface LineItem {
  productId: string
  quantity: number
  unitOfMeasure: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

export default function NewTransferPage() {
  const router = useRouter()

  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const [fromStoreId, setFromStoreId] = useState('')
  const [toStoreId, setToStoreId] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineItem[]>([
    { productId: '', quantity: 1, unitOfMeasure: 'EACH' },
  ])
  const [productSearch, setProductSearch] = useState<string[]>([''])

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/stores').then(r => r.json()),
      fetch('/api/products?limit=200').then(r => r.json()),
    ])
      .then(([s, p]) => {
        setStores(Array.isArray(s) ? s : s.stores ?? [])
        const raw = Array.isArray(p) ? p : p.products ?? p.items ?? []
        setProducts(raw)
      })
      .catch(() => notify('Failed to load data', 'err'))
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = (search: string) => {
    const q = search.toLowerCase()
    if (!q) return products.slice(0, 20)
    return products
      .filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 20)
  }

  const addLine = () => {
    setLines(prev => [...prev, { productId: '', quantity: 1, unitOfMeasure: 'EACH' }])
    setProductSearch(prev => [...prev, ''])
  }

  const removeLine = (i: number) => {
    setLines(prev => prev.filter((_, idx) => idx !== i))
    setProductSearch(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateLine = (i: number, key: keyof LineItem, value: string | number) => {
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)))
  }

  const updateSearch = (i: number, value: string) => {
    setProductSearch(prev => prev.map((s, idx) => (idx === i ? value : s)))
    // Clear productId when search changes manually
    setLines(prev =>
      prev.map((l, idx) => (idx === i ? { ...l, productId: '' } : l)),
    )
  }

  const selectProduct = (i: number, product: Product) => {
    setLines(prev =>
      prev.map((l, idx) =>
        idx === i ? { ...l, productId: product.id, unitOfMeasure: product.unit.toUpperCase() } : l,
      ),
    )
    setProductSearch(prev => prev.map((s, idx) => (idx === i ? `${product.name} (${product.sku})` : s)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fromStoreId) { notify('Select a source store', 'err'); return }
    if (!toStoreId) { notify('Select a destination store', 'err'); return }
    if (fromStoreId === toStoreId) { notify('Source and destination must differ', 'err'); return }

    const validLines = lines.filter(l => l.productId && l.quantity > 0)
    if (validLines.length === 0) { notify('Add at least one product line', 'err'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/inventory/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromStoreId, toStoreId, notes: notes || undefined, lines: validLines }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        notify(data.error ?? 'Failed to create transfer', 'err')
        return
      }
      const transfer = await res.json() as { id: string }
      router.push(`/inventory/transfers/${transfer.id}`)
    } catch {
      notify('Network error — please retry', 'err')
    } finally {
      setSubmitting(false)
    }
  }

  const toStoreOptions = stores.filter(s => s.id !== fromStoreId)

  return (
    <>
      <TopBar title="New Inventory Transfer" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-lg transition-all ${
              toast.type === 'ok'
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}
          >
            {toast.msg}
          </div>
        )}

        <div className="max-w-3xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/inventory/transfers"
              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-[15px] font-semibold text-zinc-100">New Transfer Order</h1>
              <p className="text-[12px] text-zinc-500 mt-0.5">Move stock between store locations</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Store Selection */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Transfer Route
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                      From Store
                    </label>
                    <select
                      value={fromStoreId}
                      onChange={e => {
                        setFromStoreId(e.target.value)
                        if (toStoreId === e.target.value) setToStoreId('')
                      }}
                      className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Select source store…</option>
                      {stores.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.city ? ` — ${s.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                      To Store
                    </label>
                    <select
                      value={toStoreId}
                      onChange={e => setToStoreId(e.target.value)}
                      className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      required
                      disabled={!fromStoreId}
                    >
                      <option value="">Select destination store…</option>
                      {toStoreOptions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.city ? ` — ${s.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Lines */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/40">
                  <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Products to Transfer
                  </h2>
                  <button
                    type="button"
                    onClick={addLine}
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Row
                  </button>
                </div>

                <div className="divide-y divide-zinc-800/40">
                  {lines.map((line, i) => {
                    const results = filteredProducts(productSearch[i] ?? '')

                    return (
                      <div key={i} className="flex items-start gap-3 p-4">
                        {/* Product search */}
                        <div className="flex-1 relative">
                          <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
                            Product
                          </label>
                          <input
                            type="text"
                            placeholder="Search by name or SKU…"
                            value={productSearch[i] ?? ''}
                            onChange={e => updateSearch(i, e.target.value)}
                            data-lineindex={i}
                            className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
                          />
                          {!line.productId && (productSearch[i] ?? '').length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                              {results.length === 0 ? (
                                <div className="px-3 py-2 text-[12px] text-zinc-500">
                                  No products found
                                </div>
                              ) : (
                                results.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => selectProduct(i, p)}
                                    className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors"
                                  >
                                    <span className="text-[13px] text-zinc-100 block">{p.name}</span>
                                    <span className="text-[11px] text-zinc-500 font-mono">{p.sku}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                          {line.productId && (
                            <div className="mt-1">
                              <span className="text-[11px] text-emerald-400">Selected</span>
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="w-24">
                          <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={e => updateLine(i, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none tabular-nums"
                          />
                        </div>

                        {/* UOM */}
                        <div className="w-24">
                          <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
                            UOM
                          </label>
                          <input
                            type="text"
                            value={line.unitOfMeasure}
                            onChange={e => updateLine(i, 'unitOfMeasure', e.target.value.toUpperCase())}
                            className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none uppercase"
                          />
                        </div>

                        {/* Remove */}
                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={() => removeLine(i)}
                            disabled={lines.length === 1}
                            className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes for this transfer…"
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Link
                  href="/inventory/transfers"
                  className="h-9 px-4 rounded border border-zinc-700 text-zinc-300 text-[13px] font-medium hover:bg-zinc-800 transition-colors inline-flex items-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating…' : 'Create Transfer'}
                </button>
              </div>

            </form>
          )}
        </div>
      </main>
    </>
  )
}
