'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Search, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CustomerResult {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

interface ProductResult {
  id: string
  name: string
  sku: string
  price: number
}

interface CartItem {
  productId: string
  productName: string
  sku: string
  price: number
  qty: number
}

type DepositMethod = 'cash' | 'visa' | 'mastercard' | 'debit'

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewLayawayPage() {
  const router = useRouter()

  // Customer search
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([])
  const [customerLoading, setCustomerLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  // Product search
  const [productQuery, setProductQuery] = useState('')
  const [productResults, setProductResults] = useState<ProductResult[]>([])
  const [productLoading, setProductLoading] = useState(false)
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Deposit
  const [depositAmount, setDepositAmount] = useState('')
  const [depositMethod, setDepositMethod] = useState<DepositMethod>('cash')

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── Customer search ──────────────────────────────────────────────────────

  const searchCustomers = useCallback(async (q: string) => {
    if (!q.trim()) { setCustomerResults([]); return }
    setCustomerLoading(true)
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=8`)
      if (!res.ok) throw new Error('Failed to search customers')
      const data = await res.json() as { customers: CustomerResult[] }
      setCustomerResults(data.customers ?? [])
    } catch {
      setCustomerResults([])
    } finally {
      setCustomerLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchCustomers(customerQuery), 280)
    return () => clearTimeout(t)
  }, [customerQuery, searchCustomers])

  // ─── Product search ───────────────────────────────────────────────────────

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) { setProductResults([]); return }
    setProductLoading(true)
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=8&active=true`)
      if (!res.ok) throw new Error('Failed to search products')
      const data = await res.json() as ProductResult[]
      setProductResults(Array.isArray(data) ? data : [])
    } catch {
      setProductResults([])
    } finally {
      setProductLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchProducts(productQuery), 280)
    return () => clearTimeout(t)
  }, [productQuery, searchProducts])

  // ─── Cart helpers ─────────────────────────────────────────────────────────

  function addProduct(p: ProductResult) {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === p.id)
      if (existing) {
        return prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { productId: p.id, productName: p.name, sku: p.sku, price: p.price, qty: 1 }]
    })
    setProductQuery('')
    setProductResults([])
    setShowProductDropdown(false)
  }

  function updateQty(productId: string, qty: number) {
    if (qty < 1) return
    setCartItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i))
  }

  function removeItem(productId: string) {
    setCartItems(prev => prev.filter(i => i.productId !== productId))
  }

  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
  const depositNum = parseFloat(depositAmount) || 0
  const balanceDue = cartTotal - depositNum

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedCustomer) { setError('Please select a customer.'); return }
    if (cartItems.length === 0) { setError('Please add at least one item.'); return }
    if (depositNum < 0) { setError('Deposit amount cannot be negative.'); return }

    setSubmitting(true)
    try {
      const payload = {
        customerId: selectedCustomer.id,
        items: cartItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          quantity: i.qty,
          unitPrice: i.price,
          taxAmount: 0,
          lineTotal: parseFloat((i.price * i.qty).toFixed(2)),
        })),
        totalAmount: parseFloat(cartTotal.toFixed(2)),
        depositAmount: depositNum,
        depositMethod,
      }

      const res = await fetch('/api/pos/layaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json() as { id?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to create layaway')

      router.push(`/layaway/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSubmitting(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <TopBar
        title="New Layaway"
        breadcrumb={[{ label: 'Layaway Orders', href: '/layaway' }]}
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4">
          <Link
            href="/layaway"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">Create Layaway Order</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-10 max-w-3xl space-y-5">

          {/* Error banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* ── Customer ─────────────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer *</div>

            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-zinc-100">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {[selectedCustomer.email, selectedCustomer.phone].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
                  <input
                    type="text"
                    value={customerQuery}
                    onChange={e => { setCustomerQuery(e.target.value); setShowCustomerDropdown(true) }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Search by name, email, or phone…"
                    className="w-full h-9 pl-9 pr-3 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                  {customerLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 animate-spin" />
                  )}
                </div>
                {showCustomerDropdown && customerResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-[#16213e] border border-zinc-700/60 rounded-lg shadow-xl overflow-hidden">
                    {customerResults.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerQuery('') }}
                        className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/50 transition-colors"
                      >
                        <p className="text-[13px] text-zinc-100">{c.firstName} {c.lastName}</p>
                        <p className="text-[11px] text-zinc-500">
                          {[c.email, c.phone].filter(Boolean).join(' · ')}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Items ────────────────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Items *</div>

            {/* Product search */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
                <input
                  type="text"
                  value={productQuery}
                  onChange={e => { setProductQuery(e.target.value); setShowProductDropdown(true) }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search products to add…"
                  className="w-full h-9 pl-9 pr-3 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
                {productLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 animate-spin" />
                )}
              </div>
              {showProductDropdown && productResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-[#16213e] border border-zinc-700/60 rounded-lg shadow-xl overflow-hidden">
                  {productResults.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] text-zinc-100 truncate">{p.name}</p>
                        <p className="text-[11px] text-zinc-500 font-mono">{p.sku}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[13px] font-semibold text-emerald-400 tabular-nums">{formatCurrency(p.price)}</span>
                        <Plus className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            {cartItems.length > 0 ? (
              <div className="rounded-lg border border-zinc-800/40 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40 bg-zinc-900/40">
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 py-2 px-3 font-medium">Product</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 py-2 px-3 font-medium">Price</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 py-2 px-3 font-medium">Qty</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 py-2 px-3 font-medium">Total</th>
                      <th className="w-8 py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.productId} className="border-b border-zinc-800/40 last:border-0">
                        <td className="py-2.5 px-3">
                          <p className="text-[13px] text-zinc-100">{item.productName}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{item.sku}</p>
                        </td>
                        <td className="py-2.5 px-3 text-[13px] text-right text-zinc-300 tabular-nums">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={e => updateQty(item.productId, parseInt(e.target.value, 10) || 1)}
                            className="w-16 h-7 text-center text-[13px] bg-zinc-900 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-blue-500 tabular-nums"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-[13px] text-right font-semibold text-zinc-100 tabular-nums">
                          {formatCurrency(item.price * item.qty)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-zinc-800/40 px-3 py-2.5 flex justify-end">
                  <div className="text-[13px] font-bold text-zinc-100 tabular-nums">
                    Cart Total: {formatCurrency(cartTotal)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-zinc-500 italic py-2">No items added yet. Search for a product above.</p>
            )}
          </div>

          {/* ── Deposit ──────────────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Deposit</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-500 uppercase tracking-wide">Deposit Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[13px]">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 pl-7 pr-3 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-500 uppercase tracking-wide">Payment Method</label>
                <select
                  value={depositMethod}
                  onChange={e => setDepositMethod(e.target.value as DepositMethod)}
                  className="w-full h-9 px-3 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-zinc-800/40 pt-3 space-y-1 text-[13px] max-w-xs ml-auto">
                <div className="flex justify-between text-zinc-400">
                  <span>Cart Total</span>
                  <span className="tabular-nums">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Deposit</span>
                  <span className="tabular-nums">— {formatCurrency(depositNum)}</span>
                </div>
                <div className={`flex justify-between font-bold border-t border-zinc-800/40 pt-1.5 ${balanceDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  <span>Balance Due</span>
                  <span className="tabular-nums">{formatCurrency(Math.max(0, balanceDue))}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              disabled={submitting || !selectedCustomer || cartItems.length === 0}
              className="h-9 px-6 bg-blue-600 hover:bg-blue-500 text-white border-0 text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Layaway'
              )}
            </Button>
            <Link href="/layaway">
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-4 text-[13px] text-zinc-400 hover:text-zinc-100"
              >
                Cancel
              </Button>
            </Link>
          </div>

        </form>
      </main>
    </>
  )
}
