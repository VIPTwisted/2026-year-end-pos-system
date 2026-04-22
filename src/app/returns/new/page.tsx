'use client'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Search, ArrowLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'

type Product = { id: string; name: string; sku: string; salePrice: number }
type Customer = { id: string; firstName: string; lastName: string; email: string | null; phone: string | null }
type CustomerOrderSummary = { id: string; orderNumber: string; totalAmount: number; status: string }
type ReturnLine = { productId: string; productName: string; sku: string; quantity: number; unitPrice: number; lineRefund: number; condition: 'good' | 'damaged' | 'opened'; restock: boolean }

const RETURN_REASONS = ['Defective product','Wrong item shipped','Changed mind','Damaged in shipping','Not as described','Duplicate order','Customer dissatisfied','Size / fit issue','Other']
const REFUND_METHODS = [{ value: 'original', label: 'Original Payment Method' },{ value: 'cash', label: 'Cash' },{ value: 'store_credit', label: 'Store Credit' },{ value: 'gift_card', label: 'Gift Card' },{ value: 'exchange', label: 'Exchange' }]
const CONDITIONS = [{ value: 'good', label: 'Good — resellable as-is' },{ value: 'opened', label: 'Opened — slightly used' },{ value: 'damaged', label: 'Damaged — cannot restock' }]

export default function NewReturnPage() {
  const router = useRouter()
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderResults, setOrderResults] = useState<CustomerOrderSummary[]>([])
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderSummary | null>(null)
  const [searchingOrder, setSearchingOrder] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [refundMethod, setRefundMethod] = useState('original')
  const [restockFeePercent, setRestockFeePercent] = useState(0)
  const [notes, setNotes] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState<Product[]>([])
  const [searchingProduct, setSearchingProduct] = useState(false)
  const [lines, setLines] = useState<ReturnLine[]>([])
  const [submitting, setSubmitting] = useState(false)

  async function searchCustomers() {
    if (!customerSearch.trim()) return
    setSearchingCustomer(true)
    const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`)
    setCustomerResults(await res.json())
    setSearchingCustomer(false)
  }

  async function searchOrders() {
    if (!orderSearch.trim()) return
    setSearchingOrder(true)
    const res = await fetch(`/api/customer-orders?search=${encodeURIComponent(orderSearch)}`)
    const data = await res.json()
    setOrderResults(data.slice(0, 10))
    setSearchingOrder(false)
  }

  async function searchProducts() {
    if (!productSearch.trim()) return
    setSearchingProduct(true)
    const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}`)
    setProductResults(await res.json())
    setSearchingProduct(false)
  }

  function addProduct(p: Product) {
    setLines((prev) => {
      if (prev.some((l) => l.productId === p.id)) return prev
      return [...prev, { productId: p.id, productName: p.name, sku: p.sku, quantity: 1, unitPrice: p.salePrice, lineRefund: p.salePrice, condition: 'good', restock: true }]
    })
    setProductSearch('')
    setProductResults([])
  }

  function updateLine<K extends keyof ReturnLine>(idx: number, field: K, value: ReturnLine[K]) {
    setLines((prev) => {
      const updated = [...prev]
      const l = { ...updated[idx], [field]: value }
      if (field === 'quantity' || field === 'unitPrice') l.lineRefund = Number(l.quantity) * Number(l.unitPrice)
      updated[idx] = l
      return updated
    })
  }

  const subtotalRefund = lines.reduce((s, l) => s + l.lineRefund, 0)
  const restockFeeAmt = subtotalRefund * (restockFeePercent / 100)
  const totalRefund = Math.max(0, subtotalRefund - restockFeeAmt)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (lines.length === 0) return alert('Add at least one return line')
    setSubmitting(true)
    const res = await fetch('/api/return-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer?.id ?? null,
        originalOrderId: selectedOrder?.id ?? null,
        returnReason: returnReason || null, refundMethod,
        totalRefund, restockFee: restockFeeAmt, notes: notes || null,
        lines: lines.map((l) => ({ productId: l.productId, productName: l.productName, sku: l.sku, quantity: l.quantity, unitPrice: l.unitPrice, lineRefund: l.lineRefund, condition: l.condition, restock: l.restock })),
      }),
    })
    if (res.ok) { const ret = await res.json(); router.push(`/returns/${ret.id}`) }
    else { alert('Failed to create return'); setSubmitting(false) }
  }

  return (
    <>
      <TopBar title="New Return" />
      <main className="flex-1 p-6 overflow-auto">
        <Link href="/returns" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Returns
        </Link>
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* Original Order */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800"><h3 className="text-sm font-semibold text-zinc-100">Original Order <span className="text-zinc-500 font-normal text-xs">(optional)</span></h3></div>
            <CardContent className="p-5">
              {selectedOrder ? (
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-mono text-zinc-100">{selectedOrder.orderNumber}</div><div className="text-xs text-zinc-500">Total: {formatCurrency(selectedOrder.totalAmount)} · Status: {selectedOrder.status}</div></div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>Clear</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchOrders())} placeholder="Search order number..." className="flex-1" />
                    <Button type="button" variant="secondary" onClick={searchOrders} disabled={searchingOrder}><Search className="w-4 h-4" /></Button>
                  </div>
                  {orderResults.length > 0 && (
                    <div className="border border-zinc-700 rounded-md divide-y divide-zinc-800 overflow-hidden">
                      {orderResults.map((o) => (
                        <button key={o.id} type="button" onClick={() => { setSelectedOrder(o); setOrderResults([]) }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition-colors flex items-center justify-between">
                          <span className="font-mono text-sm text-zinc-100">{o.orderNumber}</span>
                          <span className="text-xs text-zinc-500">{formatCurrency(o.totalAmount)} · {o.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800"><h3 className="text-sm font-semibold text-zinc-100">Customer <span className="text-zinc-500 font-normal text-xs">(optional)</span></h3></div>
            <CardContent className="p-5">
              {selectedCustomer ? (
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium text-zinc-100">{selectedCustomer.firstName} {selectedCustomer.lastName}</div><div className="text-xs text-zinc-500">{selectedCustomer.email} · {selectedCustomer.phone}</div></div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>Change</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchCustomers())} placeholder="Search by name, email or phone..." className="flex-1" />
                    <Button type="button" variant="secondary" onClick={searchCustomers} disabled={searchingCustomer}><Search className="w-4 h-4" /></Button>
                  </div>
                  {customerResults.length > 0 && (
                    <div className="border border-zinc-700 rounded-md divide-y divide-zinc-800 overflow-hidden">
                      {customerResults.map((c) => (
                        <button key={c.id} type="button" onClick={() => { setSelectedCustomer(c); setCustomerResults([]) }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition-colors">
                          <div className="text-sm text-zinc-100">{c.firstName} {c.lastName}</div>
                          <div className="text-xs text-zinc-500">{c.email} · {c.phone}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return Details */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800"><h3 className="text-sm font-semibold text-zinc-100">Return Details</h3></div>
            <CardContent className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Return Reason</label>
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-md px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select reason...</option>
                  {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Refund Method</label>
                <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-md px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {REFUND_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Restock Fee (%)</label>
                <Input type="number" min="0" max="100" step="1" value={restockFeePercent} onChange={(e) => setRestockFeePercent(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Notes</label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." />
              </div>
            </CardContent>
          </Card>

          {/* Return Lines */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800"><h3 className="text-sm font-semibold text-zinc-100">Return Items</h3></div>
            <CardContent className="p-5 space-y-4">
              <div className="flex gap-2">
                <Input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchProducts())} placeholder="Search products to return..." className="flex-1" />
                <Button type="button" variant="secondary" onClick={searchProducts} disabled={searchingProduct}><Search className="w-4 h-4" /></Button>
              </div>
              {productResults.length > 0 && (
                <div className="border border-zinc-700 rounded-md divide-y divide-zinc-800 overflow-hidden">
                  {productResults.map((p) => (
                    <button key={p.id} type="button" onClick={() => addProduct(p)} className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition-colors flex items-center justify-between">
                      <div><div className="text-sm text-zinc-100">{p.name}</div><div className="text-xs text-zinc-500 font-mono">{p.sku}</div></div>
                      <div className="text-sm font-semibold text-emerald-400">{formatCurrency(p.salePrice)}</div>
                    </button>
                  ))}
                </div>
              )}
              {lines.length > 0 ? (
                <div className="space-y-3">
                  {lines.map((l, i) => (
                    <div key={i} className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div><div className="text-sm font-medium text-zinc-100">{l.productName}</div><div className="text-xs text-zinc-500 font-mono">{l.sku}</div></div>
                        <button type="button" onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))} className="text-zinc-600 hover:text-red-400 transition-colors mt-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">Qty</label>
                          <Input type="number" min="1" step="1" value={l.quantity} onChange={(e) => updateLine(i, 'quantity', parseFloat(e.target.value) || 1)} className="h-8 text-xs text-right" />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">Unit Price</label>
                          <Input type="number" min="0" step="0.01" value={l.unitPrice} onChange={(e) => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right" />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">Condition</label>
                          <select value={l.condition} onChange={(e) => updateLine(i, 'condition', e.target.value as ReturnLine['condition'])} className="w-full h-8 bg-zinc-800 border border-zinc-700 rounded-md px-2 text-xs text-zinc-100 focus:outline-none">
                            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] text-zinc-500 block mb-1">Restock?</label>
                          <button type="button" onClick={() => updateLine(i, 'restock', !l.restock)} className={`h-8 px-3 rounded-md text-xs font-medium border transition-colors ${l.restock ? 'border-emerald-600 bg-emerald-600/20 text-emerald-400' : 'border-zinc-700 text-zinc-500'}`}>
                            {l.restock ? 'Yes' : 'No'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-right text-xs text-emerald-400 font-semibold">Refund: {formatCurrency(l.lineRefund)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-600 text-sm"><RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-30" />Search and add return items above</div>
              )}
            </CardContent>
          </Card>

          {lines.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-5">
                <div className="space-y-1.5 text-sm max-w-xs ml-auto">
                  <div className="flex justify-between text-zinc-400"><span>Subtotal Refund</span><span>{formatCurrency(subtotalRefund)}</span></div>
                  {restockFeePercent > 0 && <div className="flex justify-between text-red-400"><span>Restock Fee ({restockFeePercent}%)</span><span>-{formatCurrency(restockFeeAmt)}</span></div>}
                  <div className="flex justify-between font-bold text-emerald-400 border-t border-zinc-800 pt-2"><span>Total Refund</span><span>{formatCurrency(totalRefund)}</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="px-8">{submitting ? 'Creating Return...' : 'Create Return'}</Button>
            <Link href="/returns"><Button type="button" variant="outline">Cancel</Button></Link>
          </div>
        </form>
      </main>
    </>
  )
}
