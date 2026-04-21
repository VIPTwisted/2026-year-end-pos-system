'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { POSProvider, usePOS, CartLine, TAX_RATE } from '@/lib/pos/context'
import { POS_OPERATIONS, getOperationsByGroup, OperationGroup } from '@/lib/pos/operations'
import {
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  Receipt, User, X, ShoppingBag, Calculator, Tag, Percent,
  RotateCcw, Pause, Play, Gift, Star, ChevronDown, ChevronRight,
  AlertCircle, Check
} from 'lucide-react'

type Product = {
  id: string; sku: string; name: string; salePrice: number; taxable: boolean;
  category?: { name: string; color?: string }; trackStock?: boolean
}

type Customer = {
  id: string; firstName: string; lastName: string; email?: string; phone?: string; loyaltyPoints: number
}

const GROUP_COLORS: Record<OperationGroup, string> = {
  product:     'bg-blue-900 hover:bg-blue-800 border-blue-800',
  payment:     'bg-green-900 hover:bg-green-800 border-green-800',
  discount:    'bg-amber-900 hover:bg-amber-800 border-amber-800',
  transaction: 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700',
  customer:    'bg-violet-900 hover:bg-violet-800 border-violet-800',
  shift:       'bg-slate-800 hover:bg-slate-700 border-slate-700',
  inventory:   'bg-teal-900 hover:bg-teal-800 border-teal-800',
  device:      'bg-rose-900 hover:bg-rose-800 border-rose-800',
}

const GROUP_LABELS: Record<OperationGroup, string> = {
  product:     'Product',
  payment:     'Payment',
  discount:    'Discount',
  transaction: 'Transaction',
  customer:    'Customer',
  shift:       'Shift',
  inventory:   'Inventory',
  device:      'Device',
}

const PANEL_GROUPS: OperationGroup[] = ['product', 'payment', 'discount', 'transaction', 'customer', 'shift']
const QUICK_OP_IDS = [102, 104, 105, 300, 302, 500, 503, 504, 600, 603, 512, 521]

function POSInner() {
  const { state, dispatch } = usePOS()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')
  const [tendered, setTendered] = useState('')
  const [stage, setStage] = useState<'cart' | 'payment' | 'receipt'>('cart')
  const [lastOrder, setLastOrder] = useState<{ orderNumber: string; total: number; change: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeGroup, setActiveGroup] = useState<OperationGroup>('transaction')
  const [opsOpen, setOpsOpen] = useState(true)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/products?active=true').then(r => r.json()).then(setProducts).catch(() => setProducts([]))
  }, [])

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (p: Product) => {
    const line: CartLine = {
      id: `${p.id}-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      quantity: 1,
      unitPrice: p.salePrice,
      originalPrice: p.salePrice,
      discount: 0,
      taxable: p.taxable,
      taxAmount: p.taxable ? p.salePrice * TAX_RATE : 0,
      lineTotal: p.salePrice,
    }
    dispatch({ type: 'ADD_LINE', payload: line })
  }

  const updateQty = (id: string, delta: number) => {
    const line = state.cartLines.find(l => l.id === id)
    if (!line) return
    const newQty = line.quantity + delta
    dispatch({ type: 'UPDATE_QUANTITY', lineId: id, quantity: Math.max(0, newQty) })
  }

  const removeItem = (id: string) => dispatch({ type: 'REMOVE_LINE', lineId: id })

  const selectLine = (id: string) => {
    dispatch({ type: 'SET_SELECTED_LINE', lineId: state.selectedLineId === id ? null : id })
  }

  const change = paymentMethod === 'cash' && tendered ? parseFloat(tendered) - state.total : 0

  const checkout = async () => {
    if (!state.cartLines.length) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: state.customerId,
          items: state.cartLines.map(c => ({
            productId: c.productId,
            productName: c.productName,
            sku: c.sku,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            discount: c.discount,
            taxAmount: c.taxAmount,
            lineTotal: c.lineTotal,
          })),
          subtotal: state.subtotal,
          taxAmount: state.taxAmount,
          discountAmount: state.discountAmount,
          totalAmount: state.total,
          paymentMethod,
          amountTendered: paymentMethod === 'cash' ? parseFloat(tendered) : state.total,
          changeDue: Math.max(0, change),
          notes: state.transactionComment,
        }),
      })
      const order = await res.json()
      setLastOrder({ orderNumber: order.orderNumber, total: state.total, change: Math.max(0, change) })
      setStage('receipt')
      dispatch({ type: 'VOID_TRANSACTION' })
    } finally {
      setLoading(false)
    }
  }

  const newSale = () => {
    setStage('cart')
    setSearch('')
    setTendered('')
    setLastOrder(null)
    setLoyaltyBalance(null)
  }

  // ─── Operation Handlers ────────────────────────────────────────────────────

  const handleOp = useCallback(async (opId: number) => {
    const op = POS_OPERATIONS[opId]
    if (!op) return

    switch (opId) {
      // Op 102 — Void selected line
      case 102: {
        if (!state.selectedLineId) {
          notify('Select a line item first', 'err')
          return
        }
        dispatch({ type: 'REMOVE_LINE', lineId: state.selectedLineId })
        notify('Line voided')
        break
      }

      // Op 104 — Price override
      case 104: {
        if (!state.selectedLineId) {
          notify('Select a line item first', 'err')
          return
        }
        const line = state.cartLines.find(l => l.id === state.selectedLineId)
        if (!line) return
        const raw = window.prompt(`Price Override\nCurrent: ${formatCurrency(line.unitPrice)}\n\nEnter new price:`)
        if (raw === null) return
        const newPrice = parseFloat(raw)
        if (isNaN(newPrice) || newPrice < 0) {
          notify('Invalid price', 'err')
          return
        }
        dispatch({ type: 'PRICE_OVERRIDE', lineId: state.selectedLineId, newPrice })
        notify(`Price set to ${formatCurrency(newPrice)}`)
        break
      }

      // Op 105 — Set quantity
      case 105: {
        if (!state.selectedLineId) {
          notify('Select a line item first', 'err')
          return
        }
        const line = state.cartLines.find(l => l.id === state.selectedLineId)
        if (!line) return
        const raw = window.prompt(`Set Quantity\nCurrent: ${line.quantity}\n\nEnter new quantity:`)
        if (raw === null) return
        const qty = parseInt(raw, 10)
        if (isNaN(qty) || qty < 0) {
          notify('Invalid quantity', 'err')
          return
        }
        dispatch({ type: 'UPDATE_QUANTITY', lineId: state.selectedLineId, quantity: qty })
        notify(`Quantity set to ${qty}`)
        break
      }

      // Op 300 — Line discount %
      case 300: {
        if (!state.selectedLineId) {
          notify('Select a line item first', 'err')
          return
        }
        const line = state.cartLines.find(l => l.id === state.selectedLineId)
        if (!line) return
        const raw = window.prompt(`Line Discount %\nCurrent discount: ${line.discount}%\n\nEnter discount percentage (0–100):`)
        if (raw === null) return
        const pct = parseFloat(raw)
        if (isNaN(pct) || pct < 0 || pct > 100) {
          notify('Invalid percentage (0–100)', 'err')
          return
        }
        dispatch({ type: 'APPLY_LINE_DISCOUNT', lineId: state.selectedLineId, discountPct: pct })
        notify(`${pct}% discount applied to line`)
        break
      }

      // Op 302 — Total discount %
      case 302: {
        const raw = window.prompt(`Total Discount %\nCurrent: ${state.totalDiscount ?? 0}%\n\nEnter discount percentage (0–100):`)
        if (raw === null) return
        const pct = parseFloat(raw)
        if (isNaN(pct) || pct < 0 || pct > 100) {
          notify('Invalid percentage (0–100)', 'err')
          return
        }
        if (pct === 0) {
          dispatch({ type: 'CLEAR_TOTAL_DISCOUNT' })
        } else {
          dispatch({ type: 'SET_TOTAL_DISCOUNT', discountPct: pct })
        }
        notify(`${pct}% total discount applied`)
        break
      }

      // Op 500 — Void transaction
      case 500: {
        if (!state.cartLines.length) return
        const ok = window.confirm('Void this entire transaction?')
        if (!ok) return
        dispatch({ type: 'VOID_TRANSACTION' })
        setTendered('')
        setStage('cart')
        notify('Transaction voided')
        break
      }

      // Op 503 — Suspend transaction
      case 503: {
        if (!state.cartLines.length) {
          notify('Cart is empty', 'err')
          return
        }
        const suspended = {
          cartLines: state.cartLines,
          customerId: state.customerId,
          customerName: state.customerName,
          loyaltyCardNumber: state.loyaltyCardNumber,
          totalDiscount: state.totalDiscount,
          transactionComment: state.transactionComment,
          suspendedAt: new Date().toISOString(),
        }
        const existing: object[] = JSON.parse(localStorage.getItem('pos_suspended') || '[]')
        existing.push(suspended)
        localStorage.setItem('pos_suspended', JSON.stringify(existing))
        dispatch({ type: 'VOID_TRANSACTION' })
        setTendered('')
        notify(`Transaction suspended (${existing.length} in queue)`)
        break
      }

      // Op 504 — Recall suspended transaction
      case 504: {
        const raw = localStorage.getItem('pos_suspended')
        if (!raw) {
          notify('No suspended transactions', 'err')
          return
        }
        const list: Array<{
          cartLines: CartLine[]
          customerId: string | null
          customerName: string | null
          loyaltyCardNumber: string | null
          totalDiscount: number
          transactionComment: string | null
          suspendedAt: string
        }> = JSON.parse(raw)
        if (!list.length) {
          notify('No suspended transactions', 'err')
          return
        }
        if (state.cartLines.length) {
          const ok = window.confirm('Discard current cart and recall suspended transaction?')
          if (!ok) return
        }
        const last = list.pop()!
        localStorage.setItem('pos_suspended', JSON.stringify(list))
        dispatch({
          type: 'RESTORE_TRANSACTION',
          state: {
            cartLines: last.cartLines,
            customerId: last.customerId,
            customerName: last.customerName,
            loyaltyCardNumber: last.loyaltyCardNumber,
            totalDiscount: last.totalDiscount,
            transactionComment: last.transactionComment,
          },
        })
        dispatch({ type: 'RECALCULATE' })
        notify('Transaction recalled')
        break
      }

      // Op 600 — Customer attach
      case 600: {
        setShowCustomerSearch(true)
        break
      }

      // Op 603 — Customer clear
      case 603: {
        dispatch({ type: 'CLEAR_CUSTOMER' })
        setLoyaltyBalance(null)
        notify('Customer removed')
        break
      }

      // Op 512 — Issue gift card
      case 512: {
        const amtRaw = window.prompt('Issue Gift Card\n\nEnter amount:')
        if (amtRaw === null) return
        const amount = parseFloat(amtRaw)
        if (isNaN(amount) || amount <= 0) {
          notify('Invalid amount', 'err')
          return
        }
        try {
          const res = await fetch('/api/gift-cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, customerId: state.customerId }),
          })
          if (res.ok) {
            const gc = await res.json()
            notify(`Gift card issued: ${gc.code ?? 'OK'} — ${formatCurrency(amount)}`)
          } else {
            notify('Gift card API error', 'err')
          }
        } catch {
          notify('Gift card API unavailable', 'err')
        }
        break
      }

      // Op 521 — Loyalty points balance
      case 521: {
        if (!state.customerId) {
          notify('Attach a customer first', 'err')
          return
        }
        try {
          const res = await fetch(`/api/loyalty/balance?customerId=${state.customerId}`)
          if (res.ok) {
            const data = await res.json()
            setLoyaltyBalance(data.points ?? 0)
            notify(`Loyalty balance: ${data.points ?? 0} pts`)
          } else {
            notify('Could not fetch loyalty balance', 'err')
          }
        } catch {
          // Fall back to Customer model loyaltyPoints if API not yet wired
          notify('Loyalty API unavailable', 'err')
        }
        break
      }

      default:
        notify(`Op ${opId}: ${op.name} — not yet wired`)
    }
  }, [state, dispatch])

  const searchCustomers = async (q: string) => {
    if (!q.trim()) {
      setCustomerResults([])
      return
    }
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=6`)
      if (res.ok) {
        const data = await res.json()
        setCustomerResults(data.customers ?? data ?? [])
      }
    } catch {
      setCustomerResults([])
    }
  }

  const attachCustomer = (c: Customer) => {
    dispatch({ type: 'SET_CUSTOMER', customerId: c.id, customerName: `${c.firstName} ${c.lastName}` })
    setShowCustomerSearch(false)
    setCustomerSearch('')
    setCustomerResults([])
    notify(`Customer: ${c.firstName} ${c.lastName}`)
  }

  const suspendedCount = (() => {
    try {
      const raw = localStorage.getItem('pos_suspended')
      return raw ? (JSON.parse(raw) as unknown[]).length : 0
    } catch { return 0 }
  })()

  return (
    <>
      <TopBar title="POS Terminal" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-xl transition-all
          ${toast.type === 'ok' ? 'bg-emerald-900 border border-emerald-700 text-emerald-100' : 'bg-red-900 border border-red-700 text-red-100'}`}>
          {toast.type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {toast.msg}
        </div>
      )}

      {/* Customer search overlay */}
      {showCustomerSearch && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-24">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-zinc-100">Attach Customer</span>
              <button onClick={() => { setShowCustomerSearch(false); setCustomerSearch(''); setCustomerResults([]) }}
                className="text-zinc-500 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Input
              autoFocus
              placeholder="Search by name, email, or phone..."
              value={customerSearch}
              onChange={e => { setCustomerSearch(e.target.value); searchCustomers(e.target.value) }}
              className="mb-3"
            />
            {customerResults.length > 0 && (
              <div className="space-y-1">
                {customerResults.map(c => (
                  <button key={c.id} onClick={() => attachCustomer(c)}
                    className="w-full text-left px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    <div className="text-sm font-medium text-zinc-100">{c.firstName} {c.lastName}</div>
                    <div className="text-xs text-zinc-500">{c.email} · {c.loyaltyPoints} pts</div>
                  </button>
                ))}
              </div>
            )}
            {customerSearch && customerResults.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-2">No results — try a different query</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── Left — Product Grid ── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-800">
          <div className="p-4 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                className="pl-9"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                <ShoppingBag className="w-12 h-12 opacity-30" />
                <p className="text-sm">No products yet. Add products in the Products module.</p>
                <a href="/products" className="text-blue-400 text-sm hover:underline">Go to Products</a>
              </div>
            ) : (
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-left hover:border-blue-500 hover:bg-zinc-800 transition-all active:scale-95"
                  >
                    <div className="w-full aspect-square bg-zinc-800 rounded-lg mb-2 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-zinc-600" />
                    </div>
                    <div className="text-xs font-medium text-zinc-100 truncate">{p.name}</div>
                    <div className="text-xs text-zinc-500 mb-1">{p.sku}</div>
                    <div className="text-sm font-bold text-emerald-400">{formatCurrency(p.salePrice)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Middle — Cart / Payment / Receipt ── */}
        <div className="w-80 flex flex-col bg-zinc-950 border-r border-zinc-800">
          {stage === 'cart' && (
            <>
              {/* Cart header */}
              <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-100">Cart</span>
                <Badge variant="secondary" className="ml-auto text-xs">{state.cartLines.length}</Badge>
                {suspendedCount > 0 && (
                  <button onClick={() => handleOp(504)}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-900/30 px-2 py-1 rounded">
                    <Pause className="w-3 h-3" />
                    {suspendedCount}
                  </button>
                )}
              </div>

              {/* Customer row */}
              <div className="px-3 py-2 border-b border-zinc-800">
                {state.customerId ? (
                  <div className="flex items-center gap-2 bg-violet-900/30 border border-violet-800/50 rounded-lg px-3 py-1.5">
                    <User className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-violet-200 flex-1 truncate">{state.customerName}</span>
                    {loyaltyBalance !== null && (
                      <span className="text-xs text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3" />{loyaltyBalance}
                      </span>
                    )}
                    <button onClick={() => handleOp(603)} className="text-zinc-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleOp(600)}
                    className="w-full flex items-center gap-2 text-left text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg px-3 py-2 transition-colors">
                    <User className="w-3.5 h-3.5" />
                    Add customer (optional)
                  </button>
                )}
              </div>

              {/* Cart lines */}
              <div className="flex-1 overflow-y-auto">
                {state.cartLines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                    <Calculator className="w-8 h-8 opacity-40" />
                    <p className="text-sm">Cart is empty</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1.5">
                    {state.cartLines.map(item => (
                      <div
                        key={item.id}
                        onClick={() => selectLine(item.id)}
                        className={`flex items-center gap-2 rounded-lg p-2.5 cursor-pointer transition-all
                          ${state.selectedLineId === item.id
                            ? 'bg-blue-900/40 border border-blue-700/60'
                            : 'bg-zinc-900 border border-transparent hover:border-zinc-700'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-zinc-100 truncate">{item.productName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-zinc-500">{formatCurrency(item.unitPrice)}</span>
                            {item.discount > 0 && (
                              <Badge className="text-[10px] px-1 py-0 bg-amber-900/50 text-amber-300 border-amber-800/50">
                                -{item.discount}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); updateQty(item.id, -1) }}
                            className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700 text-zinc-400"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-zinc-100">{item.quantity}</span>
                          <button
                            onClick={e => { e.stopPropagation(); updateQty(item.id, 1) }}
                            className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700 text-zinc-400"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-zinc-100 w-14 text-right">
                          {formatCurrency(item.lineTotal)}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); removeItem(item.id) }}
                          className="text-zinc-600 hover:text-red-400 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-800 p-3 space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Subtotal</span><span>{formatCurrency(state.subtotal)}</span>
                </div>
                {state.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-amber-400">
                    <span>Discount</span><span>-{formatCurrency(state.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Tax (8.25%)</span><span>{formatCurrency(state.taxAmount)}</span>
                </div>
                {state.transactionComment && (
                  <div className="text-[10px] text-zinc-500 truncate">Note: {state.transactionComment}</div>
                )}
                <div className="flex justify-between text-sm font-bold text-zinc-100 pt-1.5 border-t border-zinc-800">
                  <span>Total</span><span className="text-emerald-400">{formatCurrency(state.total)}</span>
                </div>
                <Button className="w-full mt-1 h-9 text-sm" onClick={() => setStage('payment')} disabled={!state.cartLines.length}>
                  Proceed to Payment
                </Button>
              </div>
            </>
          )}

          {stage === 'payment' && (
            <>
              <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <button onClick={() => setStage('cart')} className="text-zinc-500 hover:text-zinc-100 text-lg leading-none">&larr;</button>
                <span className="text-sm font-medium text-zinc-100">Payment</span>
              </div>
              <div className="p-4 space-y-4 flex-1">
                <div className="text-3xl font-bold text-emerald-400 text-center py-4">{formatCurrency(state.total)}</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 hover:border-zinc-600'}`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <div className="text-xs font-medium">Card</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 hover:border-zinc-600'}`}
                  >
                    <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                    <div className="text-xs font-medium">Cash</div>
                  </button>
                </div>
                {paymentMethod === 'cash' && (
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Amount Tendered</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={tendered}
                      onChange={e => setTendered(e.target.value)}
                      className="text-lg font-bold"
                    />
                    {parseFloat(tendered) >= state.total && (
                      <div className="mt-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                        <div className="text-xs text-zinc-400">Change Due</div>
                        <div className="text-xl font-bold text-emerald-400">{formatCurrency(change)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-zinc-800">
                <Button
                  className="w-full"
                  size="lg"
                  variant="success"
                  onClick={checkout}
                  disabled={loading || (paymentMethod === 'cash' && parseFloat(tendered || '0') < state.total)}
                >
                  {loading ? 'Processing...' : `Complete Sale ${formatCurrency(state.total)}`}
                </Button>
              </div>
            </>
          )}

          {stage === 'receipt' && lastOrder && (
            <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100 mb-1">Sale Complete!</h2>
              <p className="text-sm text-zinc-400 mb-2">{lastOrder.orderNumber}</p>
              <p className="text-2xl font-bold text-emerald-400 mb-2">{formatCurrency(lastOrder.total)}</p>
              {lastOrder.change > 0 && (
                <p className="text-sm text-zinc-400 mb-4">
                  Change: <span className="text-emerald-400 font-bold">{formatCurrency(lastOrder.change)}</span>
                </p>
              )}
              <Button className="w-full" onClick={newSale}>New Sale</Button>
            </div>
          )}
        </div>

        {/* ── Right — Operations Panel ── */}
        <div className="w-56 flex flex-col bg-zinc-950 overflow-hidden">
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800 cursor-pointer hover:bg-zinc-900"
            onClick={() => setOpsOpen(o => !o)}
          >
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Operations</span>
            {opsOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
          </div>

          {opsOpen && (
            <>
              {/* Group tabs */}
              <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-800">
                {PANEL_GROUPS.map(g => (
                  <button
                    key={g}
                    onClick={() => setActiveGroup(g)}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors
                      ${activeGroup === g
                        ? 'bg-zinc-600 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {GROUP_LABELS[g]}
                  </button>
                ))}
              </div>

              {/* Operation buttons */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {getOperationsByGroup(activeGroup).map(op => (
                    <button
                      key={op.id}
                      onClick={() => handleOp(op.id)}
                      title={op.description}
                      className={`text-left p-2 rounded-lg border text-[10px] leading-tight transition-all active:scale-95
                        ${GROUP_COLORS[op.group]} text-zinc-200`}
                    >
                      <div className="font-semibold mb-0.5 leading-tight">{op.name}</div>
                      <div className="text-[9px] opacity-50">#{op.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick ops footer */}
              <div className="border-t border-zinc-800 p-2">
                <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">Quick Access</div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 500, label: 'Void Tx', icon: <Trash2 className="w-3 h-3" /> },
                    { id: 503, label: 'Suspend', icon: <Pause className="w-3 h-3" /> },
                    { id: 504, label: 'Recall', icon: <Play className="w-3 h-3" /> },
                    { id: 302, label: 'Disc%', icon: <Percent className="w-3 h-3" /> },
                    { id: 600, label: 'Cust.', icon: <User className="w-3 h-3" /> },
                    { id: 512, label: 'Gift', icon: <Gift className="w-3 h-3" /> },
                  ].map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleOp(q.id)}
                      className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {q.icon}
                      <span className="text-[9px]">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}

export default function POSPage() {
  return (
    <POSProvider>
      <POSInner />
    </POSProvider>
  )
}
