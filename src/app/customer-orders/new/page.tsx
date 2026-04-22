'use client'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Search, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  sku: string
  salePrice: number
}

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

type LineItem = {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  taxAmount: number
  lineTotal: number
}

const DELIVERY_MODES = [
  'Standard Ground', 'Express 2-Day', 'Overnight',
  'Will Call', 'Local Delivery', 'Curbside Pickup',
]

const TAX_RATE = 0.0825

export default function NewCustomerOrderPage() {
  const router = useRouter()
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [orderType, setOrderType] = useState<'pickup' | 'ship' | 'carry_out'>('pickup')
  const [shipAddress, setShipAddress] = useState('')
  const [shipCity, setShipCity] = useState('')
  const [shipState, setShipState] = useState('')
  const [shipZip, setShipZip] = useState('')
  const [deliveryMode, setDeliveryMode] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [depositPaid, setDepositPaid] = useState(0)
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState<Product[]>([])
  const [searchingProduct, setSearchingProduct] = useState(false)
  const [lines, setLines] = useState<LineItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  async function searchCustomers() {
    if (!customerSearch.trim()) return
    setSearchingCustomer(true)
    const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`)
    setCustomerResults(await res.json())
    setSearchingCustomer(false)
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
      const existing = prev.findIndex((l) => l.productId === p.id)
      if (existing >= 0) {
        const updated = [...prev]
        const l = { ...updated[existing] }
        l.quantity += 1
        l.lineTotal = l.quantity * l.unitPrice * (1 - l.discount / 100)
        l.taxAmount = l.lineTotal * TAX_RATE
        updated[existing] = l
        return updated
      }
      const lineTotal = p.salePrice
      return [...prev, {
        productId: p.id, productName: p.name, sku: p.sku,
        quantity: 1, unitPrice: p.salePrice, discount: 0,
        taxAmount: lineTotal * TAX_RATE, lineTotal,
      }]
    })
    setProductSearch('')
    setProductResults([])
  }

  function updateLine(idx: number, field: keyof LineItem, value: number | string) {
    setLines((prev) => {
      const updated = [...prev]
      const l = { ...updated[idx], [field]: value }
      if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
        l.lineTotal = Number(l.quantity) * Number(l.unitPrice) * (1 - Number(l.discount) / 100)
        l.taxAmount = l.lineTotal * TAX_RATE
      }
      updated[idx] = l
      return updated
    })
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx))
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const taxAmount = lines.reduce((s, l) => s + l.taxAmount, 0)
  const shippingCost = orderType === 'ship' ? 9.99 : 0
  const totalAmount = subtotal + taxAmount + shippingCost
  const balanceDue = totalAmount - depositPaid

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomer) return alert('Please select a customer')
    if (lines.length === 0) return alert('Please add at least one product')
    setSubmitting(true)
    const res = await fetch('/api/customer-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer.id,
        orderType,
        shippingAddress: orderType === 'ship' ? shipAddress : null,
        shippingCity: orderType === 'ship' ? shipCity : null,
        shippingState: orderType === 'ship' ? shipState : null,
        shippingZip: orderType === 'ship' ? shipZip : null,
        deliveryMode: deliveryMode || null,
        requestedDate: requestedDate ? new Date(requestedDate).toISOString() : null,
        subtotal, taxAmount, shippingCost, totalAmount, depositPaid,
        balanceDue: Math.max(0, balanceDue), notes: notes || null,
        lines: lines.map((l) => ({
          productId: l.productId, productName: l.productName, sku: l.sku,
          quantity: l.quantity, unitPrice: l.unitPrice, discount: l.discount,
          taxAmount: l.taxAmount, lineTotal: l.lineTotal,
        })),
      }),
    })
    if (res.ok) {
      const order = await res.json()
      router.push(`/customer-orders/${order.id}`)
    } else {
      alert('Failed to create order')
      setSubmitting(false)
    }
  }

  return (
    <>
      <TopBar title="New Customer Order" />
      <main className="flex-1 p-6 overflow-auto">
        <Link href="/customer-orders" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Customer Orders
        </Link>
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* Customer */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100">Customer</h3>
            </div>
            <CardContent className="p-5">
              {selectedCustomer ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                    <div className="text-xs text-zinc-500">{selectedCustomer.email} · {selectedCustomer.phone}</div>
                  </div>
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

          {/* Order Type */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800"><h3 className="text-sm font-semibold text-zinc-100">Order Type</h3></div>
            <CardContent className="p-5 space-y-4">
              <div className="flex gap-3">
                {(['pickup', 'ship', 'carry_out'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setOrderType(t)}
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${orderType === t ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>
                    {t === 'carry_out' ? 'Carry Out' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {orderType === 'ship' && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 block mb-1.5">Street Address</label>
                    <Input value={shipAddress} onChange={(e) => setShipAddress(e.target.value)} placeholder="123 Main St" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5">City</label>
                    <Input value={shipCity} onChange={(e) => setShipCity(e.target.value)} placeholder="City" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">State</label>
                      <Input value={shipState} onChange={(e) => setShipState(e.target.value)} placeholder="TX" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">ZIP</label>
                      <Input value={shipZip} onChange={(e) => setShipZip(e.target.value)} placeholder="75001" />
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Delivery Mode</label>
                  <select value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)}
                    className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-md px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select mode...</option>
                    {DELIVERY_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Requested Date / Time</label>
                  <Input type="datetime-local" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800"><h3 className="text-sm font-semibold text-zinc-100">Products</h3></div>
            <CardContent className="p-5 space-y-4">
              <div className="flex gap-2">
                <Input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchProducts())} placeholder="Search products by name or SKU..." className="flex-1" />
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-right pb-2 font-medium w-20">Qty</th>
                      <th className="text-right pb-2 font-medium w-24">Price</th>
                      <th className="text-right pb-2 font-medium w-20">Disc%</th>
                      <th className="text-right pb-2 font-medium w-24">Total</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-3"><div className="text-zinc-100">{l.productName}</div><div className="text-xs text-zinc-500 font-mono">{l.sku}</div></td>
                        <td className="py-2 pr-3"><Input type="number" min="0.01" step="0.01" value={l.quantity} onChange={(e) => updateLine(i, 'quantity', parseFloat(e.target.value) || 1)} className="w-16 text-right text-xs h-7" /></td>
                        <td className="py-2 pr-3"><Input type="number" min="0" step="0.01" value={l.unitPrice} onChange={(e) => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-20 text-right text-xs h-7" /></td>
                        <td className="py-2 pr-3"><Input type="number" min="0" max="100" step="0.5" value={l.discount} onChange={(e) => updateLine(i, 'discount', parseFloat(e.target.value) || 0)} className="w-16 text-right text-xs h-7" /></td>
                        <td className="py-2 pr-3 text-right text-emerald-400 font-semibold text-xs">{formatCurrency(l.lineTotal)}</td>
                        <td className="py-2"><button type="button" onClick={() => removeLine(i)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-6 text-zinc-600 text-sm"><Package className="w-8 h-8 mx-auto mb-2 opacity-30" />Search and add products above</div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800"><h3 className="text-sm font-semibold text-zinc-100">Order Summary</h3></div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5">Deposit Paid ($)</label>
                    <Input type="number" min="0" step="0.01" value={depositPaid} onChange={(e) => setDepositPaid(parseFloat(e.target.value) || 0)} className="w-40" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5">Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Order notes..." />
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Tax (8.25%)</span><span>{formatCurrency(taxAmount)}</span></div>
                  {orderType === 'ship' && <div className="flex justify-between text-zinc-400"><span>Shipping</span><span>{formatCurrency(shippingCost)}</span></div>}
                  <div className="flex justify-between text-zinc-100 font-semibold border-t border-zinc-800 pt-2 mt-2"><span>Total</span><span className="text-emerald-400">{formatCurrency(totalAmount)}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Deposit Paid</span><span className="text-blue-400">-{formatCurrency(depositPaid)}</span></div>
                  <div className="flex justify-between text-zinc-100 font-bold border-t border-zinc-800 pt-2"><span>Balance Due</span><span className={balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}>{formatCurrency(Math.max(0, balanceDue))}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="px-8">{submitting ? 'Creating...' : 'Create Order'}</Button>
            <Link href="/customer-orders"><Button type="button" variant="outline">Cancel</Button></Link>
          </div>
        </form>
      </main>
    </>
  )
}
