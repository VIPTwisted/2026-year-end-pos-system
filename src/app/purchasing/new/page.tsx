'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save } from 'lucide-react'

interface Supplier {
  id: string
  name: string
  contactName: string | null
  paymentTerms: string | null
}

interface StoreOption {
  id: string
  name: string
}

interface ProductOption {
  id: string
  name: string
  sku: string
  costPrice: number
}

interface LineItem {
  _key: string
  productId: string
  productName: string
  sku: string
  orderedQty: string
  unitCost: string
}

function newLine(): LineItem {
  return {
    _key: Math.random().toString(36).slice(2),
    productId: '',
    productName: '',
    sku: '',
    orderedQty: '1',
    unitCost: '0.00',
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [stores, setStores] = useState<StoreOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])

  const [supplierId, setSupplierId] = useState('')
  const [storeId, setStoreId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [shippingCost, setShippingCost] = useState('0.00')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineItem[]>([newLine()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/suppliers')
      .then(r => r.json())
      .then(data => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setSuppliers([]))

    fetch('/api/stores')
      .then(r => r.json())
      .then(data => setStores(Array.isArray(data) ? data : data.stores ?? []))
      .catch(() => setStores([]))

    fetch('/api/products?active=true')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
  }, [])

  const updateLine = useCallback((key: string, field: keyof LineItem, value: string) => {
    setLines(prev =>
      prev.map(l => (l._key === key ? { ...l, [field]: value } : l))
    )
  }, [])

  const selectProduct = useCallback((key: string, productId: string) => {
    const p = products.find(x => x.id === productId)
    if (!p) return
    setLines(prev =>
      prev.map(l =>
        l._key === key
          ? { ...l, productId: p.id, productName: p.name, sku: p.sku, unitCost: p.costPrice.toFixed(2) }
          : l
      )
    )
  }, [products])

  const removeLine = useCallback((key: string) => {
    setLines(prev => (prev.length > 1 ? prev.filter(l => l._key !== key) : prev))
  }, [])

  const lineTotal = (l: LineItem) =>
    (parseFloat(l.orderedQty) || 0) * (parseFloat(l.unitCost) || 0)

  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0)
  const shipping = parseFloat(shippingCost) || 0
  const total = subtotal + shipping

  async function submit() {
    if (!supplierId) { setError('Select a supplier.'); return }
    if (!storeId) { setError('Select a store.'); return }
    const validLines = lines.filter(l => l.productId && (parseFloat(l.orderedQty) || 0) > 0)
    if (validLines.length === 0) { setError('Add at least one line item with a product and quantity.'); return }
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/purchasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          storeId,
          expectedDate: expectedDate || undefined,
          shippingCost: shipping,
          notes: notes.trim() || undefined,
          lines: validLines.map(l => ({
            productId: l.productId,
            productName: l.productName,
            sku: l.sku,
            orderedQty: parseFloat(l.orderedQty) || 1,
            unitCost: parseFloat(l.unitCost) || 0,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create purchase order.')
        setSaving(false)
        return
      }

      router.push('/purchasing')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Purchase Order" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Create Purchase Order</h2>
            <p className="text-sm text-zinc-500">Select supplier, store, add line items</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/purchasing')} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Saving…' : 'Save PO'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Header Fields */}
        <Card>
          <CardContent className="pt-5 pb-5 grid grid-cols-2 gap-6">

            {/* Supplier */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Supplier *</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— Select Supplier —</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.paymentTerms ? ` · ${s.paymentTerms}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Store */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Store / Location *</label>
              <select
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— Select Store —</option>
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Expected Date */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Shipping Cost */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Shipping Cost</label>
              <input
                type="number"
                value={shippingCost}
                onChange={e => setShippingCost(e.target.value)}
                min="0"
                step="0.01"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes for this purchase order..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Line Items</h3>
              <Button variant="outline" size="sm" onClick={() => setLines(p => [...p, newLine()])}>
                <Plus className="w-3 h-3 mr-1" />Add Line
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium w-[35%]">Product</th>
                    <th className="text-left pb-3 font-medium w-[15%]">SKU</th>
                    <th className="text-right pb-3 font-medium w-[12%]">Qty</th>
                    <th className="text-right pb-3 font-medium w-[18%]">Unit Cost</th>
                    <th className="text-right pb-3 font-medium w-[15%]">Line Total</th>
                    <th className="text-right pb-3 font-medium w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {lines.map(line => (
                    <tr key={line._key}>
                      <td className="py-2 pr-3">
                        <select
                          value={line.productId}
                          onChange={e => selectProduct(line._key, e.target.value)}
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">— Select Product —</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="text"
                          value={line.sku}
                          onChange={e => updateLine(line._key, 'sku', e.target.value)}
                          placeholder="SKU"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          value={line.orderedQty}
                          onChange={e => updateLine(line._key, 'orderedQty', e.target.value)}
                          min="0"
                          step="1"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          value={line.unitCost}
                          onChange={e => updateLine(line._key, 'unitCost', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-3 text-right text-emerald-400 font-semibold font-mono text-xs">
                        {fmt(lineTotal(line))}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => removeLine(line._key)}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2 border-t border-zinc-800 pt-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Shipping</span>
                  <span className="font-mono">{fmt(shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-100 border-t border-zinc-700 pt-2 mt-2">
                  <span>Total</span>
                  <span className="font-mono text-emerald-400">{fmt(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pb-4">
          <Button variant="outline" onClick={() => router.push('/purchasing')} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Saving…' : 'Save Purchase Order'}
          </Button>
        </div>

      </main>
    </>
  )
}
