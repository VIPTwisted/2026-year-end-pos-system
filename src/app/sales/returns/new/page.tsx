'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, RotateCcw } from 'lucide-react'

interface Customer { id: string; firstName: string; lastName: string; email: string | null }
interface Store { id: string; name: string }
interface Product { id: string; name: string; sku: string; salePrice: number }

interface ReturnLine {
  productId: string
  quantity: number
  unitPrice: number
  condition: string
  restockable: boolean
}

const REASONS = ['Defective', 'Wrong item', 'Changed mind', 'Damaged shipping', 'Other']
const METHODS = [
  { value: 'original', label: 'Original Payment' },
  { value: 'store_credit', label: 'Store Credit' },
  { value: 'cash', label: 'Cash' },
  { value: 'gift_card', label: 'Gift Card' },
]
const CONDITIONS = ['good', 'damaged', 'opened']

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function NewReturnPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [originalOrderId, setOriginalOrderId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [storeId, setStoreId] = useState('')
  const [returnReason, setReturnReason] = useState('Defective')
  const [refundMethod, setRefundMethod] = useState('original')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<ReturnLine[]>([
    { productId: '', quantity: 1, unitPrice: 0, condition: 'good', restockable: true },
  ])

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([c, s, p]) => {
      setCustomers(c)
      setStores(s)
      setProducts(p)
      if (s.length > 0) setStoreId(s[0].id)
    })
  }, [])

  // Auto-fill customer from order
  const lookupOrder = useCallback(async () => {
    if (!originalOrderId.trim()) return
    try {
      const res = await fetch(`/api/orders/${originalOrderId.trim()}`)
      if (res.ok) {
        const o = await res.json()
        if (o.customerId) setCustomerId(o.customerId)
        if (o.storeId) setStoreId(o.storeId)
      }
    } catch { /* ignore */ }
  }, [originalOrderId])

  const updateLine = useCallback((idx: number, field: keyof ReturnLine, value: string | number | boolean) => {
    setLines(prev => {
      const next = [...prev]
      if (field === 'productId') {
        const prod = products.find(p => p.id === value)
        next[idx] = { ...next[idx], productId: value as string, unitPrice: prod?.salePrice ?? 0 }
      } else {
        next[idx] = { ...next[idx], [field]: value }
      }
      return next
    })
  }, [products])

  const addLine = () => setLines(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, condition: 'good', restockable: true }])
  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
  const taxRefund = subtotal * 0.1
  const total = subtotal + taxRefund

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId || !storeId) { setError('Customer and store are required'); return }
    if (lines.some(l => !l.productId)) { setError('All lines need a product selected'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          storeId,
          originalOrderId: originalOrderId || null,
          returnReason,
          refundMethod,
          notes,
          lines,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to create return')
      }
      const ret = await res.json()
      router.push(`/sales/returns/${ret.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Sales Return" />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-5xl">
        <Link href="/sales/returns" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Returns
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-xs text-red-300">{error}</div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-zinc-400" />
                Return Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Original Order ID (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={originalOrderId}
                    onChange={e => setOriginalOrderId(e.target.value)}
                    placeholder="Order ID..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={lookupOrder}
                    className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-xs text-zinc-200 rounded-lg transition-colors"
                  >
                    Look up
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Customer *</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Store *</label>
                <select
                  value={storeId}
                  onChange={e => setStoreId(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select store...</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Return Items</CardTitle>
              <button type="button" onClick={addLine} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Product', 'Qty', 'Unit Price', 'Condition', 'Restockable', 'Total', ''].map(h => (
                      <th key={h} className={`px-4 pb-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Product' ? 'text-left' : h === '' ? '' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => {
                    const lineTotal = line.quantity * line.unitPrice
                    return (
                      <tr key={idx} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-4 py-2">
                          <select
                            value={line.productId}
                            onChange={e => updateLine(idx, 'productId', e.target.value)}
                            className="w-48 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="number" min="0.01" step="0.01" value={line.quantity}
                            onChange={e => updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="number" min="0" step="0.01" value={line.unitPrice}
                            onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <select value={line.condition}
                            onChange={e => updateLine(idx, 'condition', e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 capitalize"
                          >
                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="checkbox" checked={line.restockable}
                            onChange={e => updateLine(idx, 'restockable', e.target.checked)}
                            className="w-4 h-4 accent-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-xs font-semibold text-emerald-400">{fmt(lineTotal)}</td>
                        <td className="px-4 py-2">
                          {lines.length > 1 && (
                            <button type="button" onClick={() => removeLine(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Totals + Submit */}
          <div className="flex justify-end">
            <Card className="w-72">
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Subtotal</span><span className="text-zinc-300">{fmt(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Tax Refund (10%)</span><span className="text-zinc-300">{fmt(taxRefund)}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t border-zinc-700">
                  <span className="text-zinc-100">Total Refund</span>
                  <span className="text-emerald-400">{fmt(total)}</span>
                </div>
                <div className="pt-3">
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Return'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </>
  )
}
