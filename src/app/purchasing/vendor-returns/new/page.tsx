'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'

type Supplier = { id: string; name: string; contactName: string | null }
type Product  = { id: string; name: string; sku: string; costPrice: number }

type LineItem = {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitCost: number
}

const REASONS = [
  { value: 'defective',  label: 'Defective' },
  { value: 'overstock',  label: 'Overstock' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'damaged',    label: 'Damaged' },
]

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-[13px] font-medium shadow-xl border
      ${type === 'ok'
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
      {msg}
    </div>
  )
}

export default function NewVendorReturnPage() {
  const router = useRouter()
  const [step, setStep]             = useState(1)
  const [suppliers, setSuppliers]   = useState<Supplier[]>([])
  const [products, setProducts]     = useState<Product[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [reason, setReason]         = useState('')
  const [lines, setLines]           = useState<LineItem[]>([])
  const [notes, setNotes]           = useState('')
  const [search, setSearch]         = useState('')
  const [toast, setToast]           = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch('/api/purchasing/suppliers')
      .then(r => r.json())
      .then((data: unknown) => {
        const arr = Array.isArray(data) ? data : (data as { suppliers?: Supplier[] }).suppliers ?? []
        setSuppliers(arr as Supplier[])
      })
      .catch(() => notify('Failed to load suppliers', 'err'))
  }, [notify])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((data: unknown) => {
        const arr = Array.isArray(data) ? data : (data as { products?: Product[] }).products ?? []
        setProducts(arr as Product[])
      })
      .catch(() => notify('Failed to load products', 'err'))
  }, [notify])

  const selectedSupplier = suppliers.find(s => s.id === supplierId)

  const filteredProducts = products.filter(p =>
    search.length < 2 ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  function addLine(product: Product) {
    if (lines.find(l => l.productId === product.id)) {
      notify('Product already added', 'err')
      return
    }
    setLines(prev => [...prev, {
      productId:   product.id,
      productName: product.name,
      sku:         product.sku,
      quantity:    1,
      unitCost:    product.costPrice,
    }])
    setSearch('')
  }

  function updateLine(idx: number, field: keyof LineItem, val: string) {
    setLines(prev => prev.map((l, i) =>
      i === idx ? { ...l, [field]: field === 'quantity' || field === 'unitCost' ? Number(val) : val } : l
    ))
  }

  function removeLine(idx: number) {
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  const totalAmount = lines.reduce((s, l) => s + l.quantity * l.unitCost, 0)

  async function handleSubmit() {
    if (!supplierId || !reason || lines.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/purchasing/vendor-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          reason,
          notes: notes || undefined,
          items: lines.map(l => ({
            productId: l.productId,
            quantity:  l.quantity,
            unitCost:  l.unitCost,
          })),
        }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? 'Failed to create return')
      }
      const data = await res.json() as { id: string }
      router.push(`/purchasing/vendor-returns/${data.id}`)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to create return', 'err')
      setSubmitting(false)
    }
  }

  return (
    <>
      <TopBar title="New Vendor Return" />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border
                  ${step === s
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : step > s
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`h-px w-10 ${step > s ? 'bg-emerald-500/40' : 'bg-zinc-800'}`} />}
              </div>
            ))}
            <span className="ml-3 text-[13px] text-zinc-500">
              {step === 1 ? 'Select Supplier' : step === 2 ? 'Add Items & Reason' : 'Review & Submit'}
            </span>
          </div>

          {/* Step 1 — Supplier */}
          {step === 1 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Select Supplier</h2>
              <div className="grid gap-2">
                {suppliers.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSupplierId(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors
                      ${supplierId === s.id
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-zinc-600'}`}
                  >
                    <p className="text-[13px] font-medium">{s.name}</p>
                    {s.contactName && <p className="text-[11px] text-zinc-500 mt-0.5">{s.contactName}</p>}
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!supplierId}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-4 rounded disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Items + Reason */}
          {step === 2 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Items &amp; Reason</h2>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Return Reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {REASONS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setReason(r.value)}
                      className={`px-3 py-2 rounded-lg border text-[13px] text-left transition-colors
                        ${reason === r.value
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-600'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product search */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Add Products</label>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or SKU…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
                />
                {search.length >= 2 && (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-h-48 overflow-y-auto">
                    {filteredProducts.slice(0, 20).map(p => (
                      <button
                        key={p.id}
                        onClick={() => addLine(p)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800/50 last:border-0"
                      >
                        <div>
                          <p className="text-[13px] text-zinc-200">{p.name}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{p.sku}</p>
                        </div>
                        <Plus className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="text-[13px] text-zinc-600 px-3 py-3">No products found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Lines table */}
              {lines.length > 0 && (
                <div className="rounded-lg border border-zinc-700 overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-zinc-900 text-zinc-500 text-[11px] uppercase tracking-wide border-b border-zinc-700">
                        <th className="text-left px-3 py-2 font-medium">Product</th>
                        <th className="text-center px-3 py-2 font-medium w-20">Qty</th>
                        <th className="text-right px-3 py-2 font-medium w-28">Unit Cost</th>
                        <th className="text-right px-3 py-2 font-medium w-28">Total</th>
                        <th className="px-2 py-2 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => (
                        <tr key={l.productId} className="border-b border-zinc-800/50 last:border-0">
                          <td className="px-3 py-2">
                            <p className="text-zinc-200">{l.productName}</p>
                            <p className="text-[11px] text-zinc-500 font-mono">{l.sku}</p>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={1}
                              value={l.quantity}
                              onChange={e => updateLine(i, 'quantity', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-center text-[13px] text-zinc-200 focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={l.unitCost}
                              onChange={e => updateLine(i, 'unitCost', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-right text-[13px] text-zinc-200 focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-zinc-200 tabular-nums">
                            ${(l.quantity * l.unitCost).toFixed(2)}
                          </td>
                          <td className="px-2 py-2">
                            <button onClick={() => removeLine(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-zinc-900/50 border-t border-zinc-700">
                        <td colSpan={3} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Total</td>
                        <td className="px-3 py-2 text-right font-bold text-zinc-100 tabular-nums">
                          ${totalAmount.toFixed(2)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button onClick={() => setStep(1)} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] h-8 px-4 rounded bg-transparent">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!reason || lines.length === 0}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-4 rounded disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Review &amp; Submit</h2>

              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Supplier</p>
                  <p className="text-zinc-100 font-medium">{selectedSupplier?.name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Reason</p>
                  <p className="text-zinc-100 font-medium capitalize">{reason.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Items</p>
                  <p className="text-zinc-100 font-medium">{lines.length} line{lines.length !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Total Amount</p>
                  <p className="text-emerald-400 font-semibold tabular-nums">${totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-700 overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-zinc-900 text-zinc-500 text-[11px] uppercase tracking-wide border-b border-zinc-700">
                      <th className="text-left px-3 py-2 font-medium">Product</th>
                      <th className="text-center px-3 py-2 font-medium">Qty</th>
                      <th className="text-right px-3 py-2 font-medium">Unit Cost</th>
                      <th className="text-right px-3 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map(l => (
                      <tr key={l.productId} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-3 py-2 text-zinc-200">{l.productName}</td>
                        <td className="px-3 py-2 text-center text-zinc-400">{l.quantity}</td>
                        <td className="px-3 py-2 text-right text-zinc-400 tabular-nums">${l.unitCost.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-zinc-200 tabular-nums">${(l.quantity * l.unitCost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any notes about this return…"
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button onClick={() => setStep(2)} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] h-8 px-4 rounded bg-transparent">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-5 rounded disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Create Return'}
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  )
}
