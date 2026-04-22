'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import {
  Search, Trash2, CreditCard, Banknote, Receipt, User, X,
  ShoppingBag, ChevronDown, ChevronUp, Tag, Percent, MessageSquare,
  RotateCcw, Pause, Play, Hash, DollarSign, Gift, Barcode,
  UserCheck, Star, AlertCircle, CheckCircle2, Plus, Minus,
  ArrowLeft, Keyboard, Settings2, RefreshCw
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DiscountType = 'percent' | 'amount'

type CartItem = {
  id: string
  sku: string
  name: string
  price: number
  qty: number
  taxable: boolean
  discount: number
  discountType: DiscountType
  comment: string
  isReturn: boolean
  salesRep: string
}

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  loyaltyPoints: number
  totalSpent: number
  visitCount: number
  creditStatus: string
}

type Product = {
  id: string
  sku: string
  barcode: string | null
  name: string
  salePrice: number
  taxable: boolean
  category?: { name: string; color?: string | null }
  trackStock?: boolean
}

type PaymentEntry = {
  id: string
  method: 'card' | 'cash' | 'gift_card'
  amount: number
  reference?: string
  label: string
}

type SuspendedTx = {
  id: string
  savedAt: string
  customer: Customer | null
  cart: CartItem[]
  label: string
}

type PastOrder = {
  id: string
  orderNumber: string
  createdAt: string
  totalAmount: number
  customer: Customer | null
  items: Array<{
    id: string
    productId: string
    productName: string
    sku: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}

type ActiveModal =
  | 'none'
  | 'set_quantity'
  | 'price_override'
  | 'discount_pct'
  | 'discount_amt'
  | 'line_comment'
  | 'return_search'
  | 'void_confirm'
  | 'suspend_label'
  | 'recall_list'
  | 'tx_discount'
  | 'customer_search'
  | 'gift_card_input'
  | 'split_payment'

const TAX_RATE = 0.0825

function nanToZero(n: number) {
  return isNaN(n) ? 0 : n
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function POSPage() {
  // Core cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
  const [isReturnMode, setIsReturnMode] = useState(false)

  // Customer
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [customerLoading, setCustomerLoading] = useState(false)

  // Barcode
  const [barcodeInput, setBarcodeInput] = useState('')
  const barcodeRef = useRef<HTMLInputElement>(null)

  // Order-level discount
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [orderDiscountType, setOrderDiscountType] = useState<DiscountType>('percent')

  // Payment
  const [stage, setStage] = useState<'cart' | 'payment' | 'receipt'>('cart')
  const [payments, setPayments] = useState<PaymentEntry[]>([])
  const [cashInput, setCashInput] = useState('')
  const [giftCardNumber, setGiftCardNumber] = useState('')
  const [giftCardAmount, setGiftCardAmount] = useState('')
  const [lastOrder, setLastOrder] = useState<{ orderNumber: string; total: number; change: number } | null>(null)
  const [loading, setLoading] = useState(false)

  // Suspended transactions
  const [suspended, setSuspended] = useState<SuspendedTx[]>([])
  const [suspendLabel, setSuspendLabel] = useState('')

  // Return / refund
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([])
  const [orderSearch, setOrderSearch] = useState('')
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Modal system
  const [activeModal, setActiveModal] = useState<ActiveModal>('none')
  const [modalValue, setModalValue] = useState('')
  const [modalValue2, setModalValue2] = useState<DiscountType>('percent')

  // Numpad target
  const [numpadTarget, setNumpadTarget] = useState<'qty' | 'price' | 'discount' | 'cash' | 'gift_amount'>('qty')

  // ─── Computed totals ────────────────────────────────────────────────────────

  const lineNet = (item: CartItem) => {
    const gross = item.price * Math.abs(item.qty)
    const disc = item.discountType === 'percent'
      ? gross * (item.discount / 100)
      : Math.min(item.discount, gross)
    const net = gross - disc
    return item.isReturn ? -net : net
  }

  const subtotal = cart.reduce((s, c) => s + lineNet(c), 0)

  const orderDiscountAmt = orderDiscountType === 'percent'
    ? Math.abs(subtotal) * (orderDiscount / 100)
    : Math.min(orderDiscount, Math.abs(subtotal))

  const taxableBase = cart
    .filter(c => c.taxable)
    .reduce((s, c) => s + lineNet(c), 0)

  const tax = (taxableBase - (orderDiscountType === 'percent'
    ? Math.abs(taxableBase) * (orderDiscount / 100)
    : Math.min(orderDiscount * (Math.abs(taxableBase) / Math.max(Math.abs(subtotal), 0.01)), Math.abs(taxableBase))
  )) * TAX_RATE

  const total = subtotal - (subtotal < 0 ? -orderDiscountAmt : orderDiscountAmt) + tax
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const amountDue = total - totalPaid
  const changeDue = Math.max(0, -amountDue)

  // ─── Load products ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/products?active=true')
      .then(r => r.json())
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  // ─── Customer search ────────────────────────────────────────────────────────

  const searchCustomers = useCallback(async (q: string) => {
    if (q.length < 2) { setCustomerResults([]); return }
    setCustomerLoading(true)
    try {
      const r = await fetch(`/api/customers?search=${encodeURIComponent(q)}`)
      const data = await r.json()
      setCustomerResults(Array.isArray(data) ? data.slice(0, 8) : [])
    } catch {
      setCustomerResults([])
    } finally {
      setCustomerLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchCustomers(customerSearch), 300)
    return () => clearTimeout(t)
  }, [customerSearch, searchCustomers])

  // ─── Barcode lookup ─────────────────────────────────────────────────────────

  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const val = barcodeInput.trim()
    if (!val) return
    const found = products.find(
      p => p.barcode === val || p.sku.toLowerCase() === val.toLowerCase()
    )
    if (found) {
      addToCart(found)
      setBarcodeInput('')
    }
  }

  // ─── Cart operations ────────────────────────────────────────────────────────

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id && !c.isReturn)
      if (ex) return prev.map(c =>
        c.id === p.id && !c.isReturn ? { ...c, qty: c.qty + 1 } : c
      )
      const newItem: CartItem = {
        id: p.id,
        sku: p.sku,
        name: p.name,
        price: p.salePrice,
        qty: 1,
        taxable: p.taxable,
        discount: 0,
        discountType: 'percent',
        comment: '',
        isReturn: isReturnMode,
        salesRep: '',
      }
      return [...prev, newItem]
    })
  }

  const addReturnItem = (productId: string, productName: string, sku: string, price: number, maxQty: number) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === productId && c.isReturn)
      if (ex) {
        return prev.map(c =>
          c.id === productId && c.isReturn
            ? { ...c, qty: Math.min(c.qty + 1, maxQty) }
            : c
        )
      }
      return [...prev, {
        id: productId,
        sku,
        name: productName + ' [RETURN]',
        price,
        qty: 1,
        taxable: true,
        discount: 0,
        discountType: 'percent',
        comment: '',
        isReturn: true,
        salesRep: '',
      }]
    })
    setActiveModal('none')
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
    )
  }

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) { removeItem(id); return }
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c))
  }

  const setPrice = (id: string, price: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, price: Math.max(0, price) } : c))
  }

  const setLineDiscount = (id: string, discount: number, type: DiscountType) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, discount, discountType: type } : c))
  }

  const setLineComment = (id: string, comment: string) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, comment } : c))
  }

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id))
    if (selectedLineId === id) setSelectedLineId(null)
  }

  const selectedLine = cart.find(c => c.id === selectedLineId) ?? null

  // ─── Numpad press ───────────────────────────────────────────────────────────

  const handleNumpad = (key: string) => {
    const setVal = (prev: string) => {
      if (key === 'backspace') return prev.slice(0, -1)
      if (key === 'clear') return ''
      if (key === '.' && prev.includes('.')) return prev
      return prev + key
    }

    if (activeModal === 'set_quantity') {
      setModalValue(prev => setVal(prev))
      return
    }
    if (activeModal === 'price_override') {
      setModalValue(prev => setVal(prev))
      return
    }
    if (activeModal === 'discount_pct' || activeModal === 'discount_amt') {
      setModalValue(prev => setVal(prev))
      return
    }
    if (activeModal === 'tx_discount') {
      setModalValue(prev => setVal(prev))
      return
    }
    if (activeModal === 'gift_card_input') {
      setGiftCardAmount(prev => setVal(prev))
      return
    }

    // No modal open — apply to cash tender if in payment stage
    if (stage === 'payment') {
      setCashInput(prev => setVal(prev))
      return
    }

    // Default: set qty on selected line
    if (selectedLineId) {
      setModalValue(prev => setVal(prev))
    }
  }

  // ─── Modal confirmations ────────────────────────────────────────────────────

  const confirmModal = () => {
    const val = parseFloat(modalValue)
    if (!selectedLineId) { setActiveModal('none'); return }

    if (activeModal === 'set_quantity') {
      if (!isNaN(val) && val > 0) setQty(selectedLineId, Math.round(val))
    } else if (activeModal === 'price_override') {
      if (!isNaN(val) && val >= 0) setPrice(selectedLineId, val)
    } else if (activeModal === 'discount_pct') {
      if (!isNaN(val) && val >= 0 && val <= 100) setLineDiscount(selectedLineId, val, 'percent')
    } else if (activeModal === 'discount_amt') {
      if (!isNaN(val) && val >= 0) setLineDiscount(selectedLineId, val, 'amount')
    } else if (activeModal === 'tx_discount') {
      if (!isNaN(val) && val >= 0) {
        setOrderDiscount(val)
        setOrderDiscountType(modalValue2 as DiscountType)
      }
    } else if (activeModal === 'line_comment') {
      setLineComment(selectedLineId, modalValue)
    }
    setModalValue('')
    setActiveModal('none')
  }

  // ─── Suspend / Recall ───────────────────────────────────────────────────────

  const suspendTransaction = () => {
    if (!cart.length) return
    const tx: SuspendedTx = {
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      customer,
      cart: [...cart],
      label: suspendLabel || `Transaction #${suspended.length + 1}`,
    }
    setSuspended(prev => [...prev, tx])
    setCart([])
    setCustomer(null)
    setOrderDiscount(0)
    setPayments([])
    setSuspendLabel('')
    setActiveModal('none')
  }

  const recallTransaction = (tx: SuspendedTx) => {
    if (cart.length > 0) {
      if (!confirm('Current cart will be cleared. Recall suspended transaction?')) return
    }
    setCart(tx.cart)
    setCustomer(tx.customer)
    setSuspended(prev => prev.filter(s => s.id !== tx.id))
    setActiveModal('none')
  }

  // ─── Load past orders for return ─────────────────────────────────────────────

  const loadPastOrders = async (q: string) => {
    setOrdersLoading(true)
    try {
      const r = await fetch(`/api/orders?search=${encodeURIComponent(q)}&limit=20`)
      const data = await r.json()
      setPastOrders(Array.isArray(data) ? data : [])
    } catch {
      setPastOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (activeModal === 'return_search') {
      const t = setTimeout(() => loadPastOrders(orderSearch), 400)
      return () => clearTimeout(t)
    }
  }, [orderSearch, activeModal])

  // ─── Add payment ────────────────────────────────────────────────────────────

  const addPayment = (method: PaymentEntry['method'], amount: number, reference?: string) => {
    const capped = Math.min(amount, Math.max(0, amountDue))
    if (capped <= 0 && method !== 'cash') return
    const label = method === 'card' ? 'Credit/Debit Card'
      : method === 'cash' ? 'Cash'
      : `Gift Card ${reference ?? ''}`
    setPayments(prev => [...prev, {
      id: Date.now().toString(),
      method,
      amount: method === 'cash' ? amount : capped,
      reference,
      label,
    }])
    setCashInput('')
    setGiftCardAmount('')
    setGiftCardNumber('')
  }

  const removePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  // ─── Checkout ───────────────────────────────────────────────────────────────

  const checkout = async () => {
    if (!cart.length) return
    if (amountDue > 0.01) return
    setLoading(true)
    try {
      const body = {
        customerId: customer?.id ?? undefined,
        items: cart.map(c => ({
          productId: c.id,
          productName: c.name,
          sku: c.sku,
          quantity: c.isReturn ? -Math.abs(c.qty) : c.qty,
          unitPrice: c.price,
          discount: lineNet(c) < 0
            ? 0
            : (c.discountType === 'percent'
              ? c.price * c.qty * (c.discount / 100)
              : Math.min(c.discount, c.price * c.qty)),
          taxAmount: c.taxable ? Math.abs(lineNet(c)) * TAX_RATE : 0,
          lineTotal: lineNet(c),
        })),
        subtotal,
        taxAmount: tax,
        discountAmount: orderDiscountAmt,
        totalAmount: total,
        paymentMethod: payments.length === 1 ? payments[0].method : 'split',
        amountTendered: totalPaid,
        changeDue: Math.max(0, changeDue),
        payments: payments.map(p => ({
          method: p.method,
          amount: p.amount,
          reference: p.reference,
        })),
        isReturn: isReturnMode,
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const order = await res.json()
      setLastOrder({
        orderNumber: order.orderNumber,
        total,
        change: Math.max(0, changeDue),
      })
      setStage('receipt')
      setCart([])
      setPayments([])
      setOrderDiscount(0)
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  const newSale = () => {
    setStage('cart')
    setProductSearch('')
    setCashInput('')
    setCustomerSearch('')
    setCustomerResults([])
    setLastOrder(null)
    setIsReturnMode(false)
    setSelectedLineId(null)
    setPayments([])
    setOrderDiscount(0)
  }

  // ─── Filtered products ──────────────────────────────────────────────────────

  const filtered = products.filter(p =>
    !productSearch ||
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  )

  // ─── Action grid buttons ────────────────────────────────────────────────────

  const actionButtons = [
    {
      label: 'Set Qty', icon: <Hash className="w-4 h-4" />, color: 'text-blue-400',
      action: () => { if (!selectedLineId) return; setModalValue(String(selectedLine?.qty ?? 1)); setActiveModal('set_quantity') }
    },
    {
      label: 'Price Override', icon: <DollarSign className="w-4 h-4" />, color: 'text-amber-400',
      action: () => { if (!selectedLineId) return; setModalValue(String(selectedLine?.price ?? '')); setActiveModal('price_override') }
    },
    {
      label: 'Discount %', icon: <Percent className="w-4 h-4" />, color: 'text-purple-400',
      action: () => { if (!selectedLineId) return; setModalValue2('percent'); setModalValue(String(selectedLine?.discount ?? 0)); setActiveModal('discount_pct') }
    },
    {
      label: 'Discount $', icon: <Tag className="w-4 h-4" />, color: 'text-purple-400',
      action: () => { if (!selectedLineId) return; setModalValue2('amount'); setModalValue(String(selectedLine?.discount ?? 0)); setActiveModal('discount_amt') }
    },
    {
      label: 'Line Comment', icon: <MessageSquare className="w-4 h-4" />, color: 'text-zinc-400',
      action: () => { if (!selectedLineId) return; setModalValue(selectedLine?.comment ?? ''); setActiveModal('line_comment') }
    },
    {
      label: 'Return Line', icon: <RotateCcw className="w-4 h-4" />, color: 'text-orange-400',
      action: () => setActiveModal('return_search')
    },
    {
      label: 'Void Item', icon: <Trash2 className="w-4 h-4" />, color: 'text-red-400',
      action: () => { if (!selectedLineId) return; setActiveModal('void_confirm') }
    },
    {
      label: 'Suspend', icon: <Pause className="w-4 h-4" />, color: 'text-zinc-400',
      action: () => { if (!cart.length) return; setSuspendLabel(''); setActiveModal('suspend_label') }
    },
    {
      label: 'Recall Tx', icon: <Play className="w-4 h-4" />, color: 'text-emerald-400',
      action: () => setActiveModal('recall_list')
    },
    {
      label: 'Tx Discount', icon: <Percent className="w-4 h-4" />, color: 'text-indigo-400',
      action: () => { setModalValue(String(orderDiscount)); setModalValue2(orderDiscountType); setActiveModal('tx_discount') }
    },
  ]

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <TopBar title={isReturnMode ? 'POS Terminal — RETURN MODE' : 'POS Terminal'} />

      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── Left: Product Grid ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-800 min-w-0">

          {/* Barcode / SKU quick-add bar */}
          <div className="px-4 pt-3 pb-2 border-b border-zinc-800 bg-zinc-950">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                ref={barcodeRef}
                className="w-full pl-9 pr-4 h-10 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Scan barcode or enter SKU — press Enter to add"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeEnter}
                autoFocus
              />
            </div>
          </div>

          {/* Product search */}
          <div className="px-4 py-2 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                className="pl-9 h-9"
                placeholder="Search products…"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Return mode banner */}
          {isReturnMode && (
            <div className="mx-4 my-2 px-3 py-2 bg-orange-500/15 border border-orange-500/40 rounded-lg flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-xs text-orange-300 font-medium">Return Mode Active — tap items to add as returns</span>
              <button
                onClick={() => setIsReturnMode(false)}
                className="ml-auto text-orange-400 hover:text-orange-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Product tiles */}
          <div className="flex-1 overflow-y-auto p-4">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                <ShoppingBag className="w-12 h-12 opacity-30" />
                <p className="text-sm">No products found.</p>
                <a href="/products" className="text-blue-400 text-sm hover:underline">Go to Products</a>
              </div>
            ) : (
              <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`bg-zinc-900 border rounded-xl p-3 text-left hover:bg-zinc-800 transition-all active:scale-95 ${
                      isReturnMode
                        ? 'border-orange-600/40 hover:border-orange-400'
                        : 'border-zinc-800 hover:border-blue-500'
                    }`}
                  >
                    <div className="w-full aspect-square bg-zinc-800 rounded-lg mb-2 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div className="text-xs font-medium text-zinc-100 truncate">{p.name}</div>
                    <div className="text-[10px] text-zinc-500 mb-0.5">{p.sku}</div>
                    <div className="text-sm font-bold text-emerald-400">{formatCurrency(p.salePrice)}</div>
                    {p.category && (
                      <div className="text-[10px] text-zinc-600 truncate">{p.category.name}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Transaction Lines ─────────────────────────────────────── */}
        <div className="w-[420px] flex flex-col border-r border-zinc-800 bg-zinc-950 shrink-0">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_52px_80px_28px] gap-1 px-3 py-2 border-b border-zinc-800 bg-zinc-900">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Item</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest text-center">Qty</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest text-right">Total</span>
            <span />
          </div>

          {/* Cart lines */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-700 gap-2">
                <ShoppingBag className="w-10 h-10 opacity-30" />
                <p className="text-sm">No items in transaction</p>
              </div>
            ) : (
              <div className="py-1">
                {cart.map(item => {
                  const net = lineNet(item)
                  const gross = item.price * item.qty
                  const hasDiscount = item.discount > 0
                  const isSelected = selectedLineId === item.id
                  return (
                    <div key={item.id}>
                      <div
                        onClick={() => setSelectedLineId(isSelected ? null : item.id)}
                        className={`grid grid-cols-[1fr_52px_80px_28px] gap-1 px-3 py-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-600/20 border-l-2 border-l-blue-500'
                            : item.isReturn
                            ? 'bg-orange-500/5 border-l-2 border-l-orange-500 hover:bg-orange-500/10'
                            : 'hover:bg-zinc-900 border-l-2 border-l-transparent'
                        }`}
                      >
                        {/* Item info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {item.isReturn && (
                              <RotateCcw className="w-3 h-3 text-orange-400 shrink-0" />
                            )}
                            <span className="text-sm text-zinc-100 truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-zinc-500">{item.sku}</span>
                            <span className="text-[10px] text-zinc-500">
                              {formatCurrency(item.price)} ea
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-purple-400">
                                -{item.discountType === 'percent'
                                  ? `${item.discount}%`
                                  : formatCurrency(item.discount)}
                              </span>
                            )}
                          </div>
                          {item.comment && (
                            <div className="text-[10px] text-zinc-500 italic mt-0.5">{item.comment}</div>
                          )}
                          {hasDiscount && (
                            <div className="text-[10px] text-zinc-600 line-through">
                              {formatCurrency(gross)}
                            </div>
                          )}
                        </div>

                        {/* Qty controls */}
                        <div className="flex flex-col items-center justify-center gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); updateQty(item.id, 1) }}
                            className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700 text-zinc-400"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold text-zinc-100 leading-none">{item.qty}</span>
                          <button
                            onClick={e => { e.stopPropagation(); updateQty(item.id, -1) }}
                            className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700 text-zinc-400"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-end">
                          <span className={`text-sm font-semibold ${item.isReturn ? 'text-orange-400' : 'text-zinc-100'}`}>
                            {item.isReturn && '−'}{formatCurrency(Math.abs(net))}
                          </span>
                        </div>

                        {/* Remove */}
                        <div className="flex items-center justify-center">
                          <button
                            onClick={e => { e.stopPropagation(); removeItem(item.id) }}
                            className="w-5 h-5 flex items-center justify-center text-zinc-700 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Bottom status bar */}
          <div className="border-t border-zinc-800 bg-zinc-900">
            <div className="grid grid-cols-4 divide-x divide-zinc-800">
              <div className="px-2 py-2 text-center">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Lines</div>
                <div className="text-sm font-bold text-zinc-100">{cart.length}</div>
              </div>
              <div className="px-2 py-2 text-center">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Subtotal</div>
                <div className="text-sm font-bold text-zinc-100">{formatCurrency(subtotal)}</div>
              </div>
              <div className="px-2 py-2 text-center">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Tax</div>
                <div className="text-sm font-bold text-zinc-100">{formatCurrency(tax)}</div>
              </div>
              <div className="px-2 py-2 text-center">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Amount Due</div>
                <div className={`text-sm font-bold ${total < 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {formatCurrency(Math.abs(total))}
                </div>
              </div>
            </div>

            {/* Payment / Checkout bar */}
            {stage === 'cart' && (
              <div className="px-3 py-2 flex gap-2 border-t border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setIsReturnMode(m => !m)}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  {isReturnMode ? 'Sale Mode' : 'Return Mode'}
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  className="flex-1 text-xs font-semibold"
                  onClick={() => { if (cart.length) setStage('payment') }}
                  disabled={!cart.length}
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1" />
                  Pay {formatCurrency(Math.abs(total))}
                </Button>
              </div>
            )}

            {stage === 'payment' && (
              <div className="px-3 py-2 flex gap-2 border-t border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setStage('cart')}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  className="flex-1 text-xs font-semibold"
                  onClick={checkout}
                  disabled={loading || amountDue > 0.01}
                >
                  {loading ? 'Processing…' : amountDue > 0.01 ? `Due ${formatCurrency(amountDue)}` : 'Complete Sale'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Customer + Numpad + Actions ───────────────────────────── */}
        <div className="w-72 flex flex-col bg-zinc-950 shrink-0 overflow-hidden">

          {/* ── Customer Panel ── */}
          <div className="border-b border-zinc-800 px-3 py-2.5">
            {customer ? (
              <div className="bg-zinc-900 rounded-lg p-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-100 leading-tight">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {customer.email ?? customer.phone ?? 'No contact'}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setCustomer(null)} className="text-zinc-600 hover:text-red-400 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 bg-zinc-800 rounded px-2 py-1 text-center">
                    <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Points</div>
                    <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3" />
                      {customer.loyaltyPoints.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-1 bg-zinc-800 rounded px-2 py-1 text-center">
                    <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Spent</div>
                    <div className="text-sm font-bold text-zinc-100">{formatCurrency(customer.totalSpent)}</div>
                  </div>
                  <div className="flex-1 bg-zinc-800 rounded px-2 py-1 text-center">
                    <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Visits</div>
                    <div className="text-sm font-bold text-zinc-100">{customer.visitCount}</div>
                  </div>
                </div>
                {customer.creditStatus !== 'good' && (
                  <div className="mt-1.5 flex items-center gap-1 text-amber-400">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[10px] capitalize">Credit: {customer.creditStatus}</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveModal('customer_search')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
              >
                <User className="w-4 h-4" />
                <span className="text-xs">Add Customer</span>
                <Search className="w-3.5 h-3.5 ml-auto" />
              </button>
            )}
          </div>

          {/* ── Payment panel (when in payment stage) ── */}
          {stage === 'payment' && (
            <div className="border-b border-zinc-800 px-3 py-2.5 space-y-2">
              <div className="text-center">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Amount Due</div>
                <div className={`text-2xl font-bold ${amountDue <= 0.01 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                  {amountDue > 0.01 ? formatCurrency(amountDue) : formatCurrency(0)}
                </div>
                {changeDue > 0 && (
                  <div className="text-sm text-emerald-400 mt-0.5">Change: {formatCurrency(changeDue)}</div>
                )}
              </div>

              {/* Payment entries */}
              {payments.length > 0 && (
                <div className="space-y-1">
                  {payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-zinc-900 rounded px-2 py-1">
                      <div className="flex items-center gap-1.5">
                        {p.method === 'card' && <CreditCard className="w-3 h-3 text-blue-400" />}
                        {p.method === 'cash' && <Banknote className="w-3 h-3 text-emerald-400" />}
                        {p.method === 'gift_card' && <Gift className="w-3 h-3 text-purple-400" />}
                        <span className="text-[11px] text-zinc-300">{p.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-zinc-100">{formatCurrency(p.amount)}</span>
                        <button onClick={() => removePayment(p.id)} className="text-zinc-600 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment buttons */}
              {amountDue > 0.01 && (
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => addPayment('card', amountDue)}
                    className="flex flex-col items-center gap-1 py-2 bg-zinc-900 hover:bg-blue-600/20 border border-zinc-800 hover:border-blue-500/50 rounded-lg transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] text-zinc-300">Card</span>
                  </button>
                  <button
                    onClick={() => {
                      const amt = parseFloat(cashInput)
                      addPayment('cash', isNaN(amt) ? amountDue : amt)
                    }}
                    className="flex flex-col items-center gap-1 py-2 bg-zinc-900 hover:bg-emerald-600/20 border border-zinc-800 hover:border-emerald-500/50 rounded-lg transition-colors"
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] text-zinc-300">Cash</span>
                  </button>
                  <button
                    onClick={() => setActiveModal('gift_card_input')}
                    className="flex flex-col items-center gap-1 py-2 bg-zinc-900 hover:bg-purple-600/20 border border-zinc-800 hover:border-purple-500/50 rounded-lg transition-colors"
                  >
                    <Gift className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] text-zinc-300">Gift</span>
                  </button>
                </div>
              )}

              {/* Cash input via numpad */}
              {amountDue > 0.01 && (
                <div className="relative">
                  <Banknote className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    className="w-full pl-8 pr-3 h-8 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-100 text-right placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Cash amount"
                    value={cashInput}
                    onChange={e => setCashInput(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Order-level discount display ── */}
          {stage === 'cart' && orderDiscount > 0 && (
            <div className="px-3 py-1.5 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-purple-400">Order Discount</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-purple-400">
                  -{orderDiscountType === 'percent'
                    ? `${orderDiscount}%`
                    : formatCurrency(orderDiscount)}
                </span>
                <button
                  onClick={() => setOrderDiscount(0)}
                  className="text-zinc-600 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* ── Action Grid ── */}
          <div className="flex-1 overflow-y-auto px-3 py-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              {actionButtons.map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors text-left"
                >
                  <span className={btn.color}>{btn.icon}</span>
                  <span className="text-[11px] font-medium text-zinc-300 leading-tight">{btn.label}</span>
                </button>
              ))}
            </div>

            {/* Suspended count badge */}
            {suspended.length > 0 && (
              <div className="mt-2 px-2 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                <Pause className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] text-amber-300">
                  {suspended.length} suspended transaction{suspended.length > 1 ? 's' : ''}
                </span>
                <button
                  className="ml-auto text-amber-400 hover:text-amber-200 text-[10px] font-medium"
                  onClick={() => setActiveModal('recall_list')}
                >
                  Recall
                </button>
              </div>
            )}
          </div>

          {/* ── Numpad ── */}
          <div className="px-3 py-2.5 border-t border-zinc-800 shrink-0">
            <div className="grid grid-cols-3 gap-1.5">
              {['7','8','9','4','5','6','1','2','3','0','.','⌫'].map(k => (
                <button
                  key={k}
                  onClick={() => handleNumpad(k === '⌫' ? 'backspace' : k)}
                  className="h-11 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg text-base font-semibold text-zinc-100 transition-colors select-none"
                >
                  {k}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleNumpad('clear')}
              className="mt-1.5 w-full h-8 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-xs text-zinc-400 font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Receipt overlay ─────────────────────────────────────────────────── */}
      {stage === 'receipt' && lastOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">
              {isReturnMode ? 'Return Processed' : 'Sale Complete'}
            </h2>
            <p className="text-sm text-zinc-400">{lastOrder.orderNumber}</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(Math.abs(lastOrder.total))}</p>
            {lastOrder.change > 0 && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="text-xs text-zinc-400">Change Due</div>
                <div className="text-xl font-bold text-emerald-400">{formatCurrency(lastOrder.change)}</div>
              </div>
            )}
            <Button className="w-full" size="lg" variant="success" onClick={newSale}>
              New Sale
            </Button>
          </div>
        </div>
      )}

      {/* ── Modal: Customer Search ─────────────────────────────────────────── */}
      {activeModal === 'customer_search' && (
        <ModalWrapper title="Customer Lookup" onClose={() => setActiveModal('none')}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              className="pl-9"
              placeholder="Search by name, email, or phone…"
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
              autoFocus
            />
          </div>
          {customerLoading && <p className="text-xs text-zinc-500 text-center py-4">Searching…</p>}
          {!customerLoading && customerSearch.length >= 2 && customerResults.length === 0 && (
            <p className="text-xs text-zinc-500 text-center py-4">No customers found.</p>
          )}
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {customerResults.map(c => (
              <button
                key={c.id}
                onClick={() => { setCustomer(c); setCustomerSearch(''); setActiveModal('none') }}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-100">{c.firstName} {c.lastName}</div>
                  <div className="text-xs text-zinc-500 truncate">{c.email ?? c.phone ?? 'No contact'}</div>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="w-3 h-3" />
                    {c.loyaltyPoints.toLocaleString()} pts
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Set Quantity ─────────────────────────────────────────────── */}
      {activeModal === 'set_quantity' && (
        <ModalWrapper title="Set Quantity" onClose={() => setActiveModal('none')}>
          <p className="text-xs text-zinc-400 mb-3">{selectedLine?.name}</p>
          <Input
            className="text-xl font-bold text-center h-14 mb-4"
            value={modalValue}
            onChange={e => setModalValue(e.target.value)}
            autoFocus
            type="number"
            min="1"
          />
          <NumpadInline value={modalValue} onChange={setModalValue} />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button className="flex-1" onClick={confirmModal}>Apply</Button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Price Override ───────────────────────────────────────────── */}
      {activeModal === 'price_override' && (
        <ModalWrapper title="Price Override" onClose={() => setActiveModal('none')}>
          <p className="text-xs text-zinc-400 mb-3">{selectedLine?.name}</p>
          <Input
            className="text-xl font-bold text-center h-14 mb-4"
            value={modalValue}
            onChange={e => setModalValue(e.target.value)}
            autoFocus
            type="number"
            min="0"
            step="0.01"
          />
          <NumpadInline value={modalValue} onChange={setModalValue} />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button className="flex-1" onClick={confirmModal}>Apply</Button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Discount % ───────────────────────────────────────────────── */}
      {activeModal === 'discount_pct' && (
        <ModalWrapper title="Line Discount %" onClose={() => setActiveModal('none')}>
          <p className="text-xs text-zinc-400 mb-3">{selectedLine?.name}</p>
          <div className="flex items-center gap-2 mb-4">
            <Input
              className="text-xl font-bold text-center h-14 flex-1"
              value={modalValue}
              onChange={e => setModalValue(e.target.value)}
              autoFocus
              type="number"
              min="0"
              max="100"
            />
            <span className="text-2xl text-zinc-400">%</span>
          </div>
          <NumpadInline value={modalValue} onChange={setModalValue} />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button className="flex-1" onClick={confirmModal}>Apply</Button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Discount $ ───────────────────────────────────────────────── */}
      {activeModal === 'discount_amt' && (
        <ModalWrapper title="Line Discount Amount" onClose={() => setActiveModal('none')}>
          <p className="text-xs text-zinc-400 mb-3">{selectedLine?.name}</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl text-zinc-400">$</span>
            <Input
              className="text-xl font-bold text-center h-14 flex-1"
              value={modalValue}
              onChange={e => setModalValue(e.target.value)}
              autoFocus
              type="number"
              min="0"
              step="0.01"
            />
          </div>
          <NumpadInline value={modalValue} onChange={setModalValue} />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button className="flex-1" onClick={confirmModal}>Apply</Button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Line Comment ─────────────────────────────────────────────── */}
      {activeModal === 'line_comment' && (
        <ModalWrapper title="Line Comment" onClose={() => setActiveModal('none')}>
          <p className="text-xs text-zinc-400 mb-3">{selectedLine?.name}</p>
          <textarea
            className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a comment for this line…"
            value={modalValue}
            onChange={e => setModalValue(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button className="flex-1" onClick={confirmModal}>Apply</Button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Void Confirm ─────────────────────────────────────────────── */}
      {activeModal === 'void_confirm' && (
        <ModalWrapper title="Void Item" onClose={() => setActiveModal('none')}>
          <p className="text-sm text-zinc-300 mb-1">Remove this item from the transaction?</p>
          <p className="text-base font-semibold text-zinc-100 mb-6">{selectedLine?.name}</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => {
              if (selectedLineId) removeItem(selectedLineId)
              setActiveModal('none')
            }}>
              Void Item
            </Button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Transaction Discount ─────────────────────────────────────── */}
      {activeModal === 'tx_discount' && (
        <ModalWrapper title="Transaction Discount" onClose={() => setActiveModal('none')}>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setModalValue2('percent')}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                modalValue2 === 'percent'
                  ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              Percent %
            </button>
            <button
              onClick={() => setModalValue2('amount')}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                modalValue2 === 'amount'
                  ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              Amount $
            </button>
          </div>
          <Input
            className="text-xl font-bold text-center h-14 mb-4"
            value={modalValue}
            onChange={e => setModalValue(e.target.value)}
            autoFocus
            type="number"
            min="0"
          />
          <NumpadInline value={modalValue} onChange={setModalValue} />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button className="flex-1" onClick={confirmModal}>Apply</Button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Suspend Label ─────────────────────────────────────────────── */}
      {activeModal === 'suspend_label' && (
        <ModalWrapper title="Suspend Transaction" onClose={() => setActiveModal('none')}>
          <p className="text-xs text-zinc-400 mb-3">Optionally label this transaction for easy recall.</p>
          <Input
            className="mb-4"
            placeholder={`Transaction #${suspended.length + 1}`}
            value={suspendLabel}
            onChange={e => setSuspendLabel(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') suspendTransaction() }}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button className="flex-1" onClick={suspendTransaction}>
              <Pause className="w-3.5 h-3.5 mr-1" />
              Suspend
            </Button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Recall List ───────────────────────────────────────────────── */}
      {activeModal === 'recall_list' && (
        <ModalWrapper title="Recall Transaction" onClose={() => setActiveModal('none')}>
          {suspended.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No suspended transactions.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {suspended.map(tx => (
                <button
                  key={tx.id}
                  onClick={() => recallTransaction(tx)}
                  className="w-full flex items-start gap-3 px-3 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left transition-colors"
                >
                  <Play className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-100">{tx.label}</div>
                    {tx.customer && (
                      <div className="text-xs text-zinc-500">{tx.customer.firstName} {tx.customer.lastName}</div>
                    )}
                    <div className="text-xs text-zinc-600">
                      {tx.cart.length} items · {new Date(tx.savedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="ml-auto text-sm font-semibold text-zinc-100 shrink-0">
                    {formatCurrency(tx.cart.reduce((s, c) => s + c.price * c.qty, 0))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ModalWrapper>
      )}

      {/* ── Modal: Return Order Search ───────────────────────────────────────── */}
      {activeModal === 'return_search' && (
        <ModalWrapper title="Return / Refund — Search Orders" onClose={() => setActiveModal('none')} wide>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              className="pl-9"
              placeholder="Search by order number, customer name…"
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              autoFocus
            />
          </div>
          {ordersLoading && <p className="text-xs text-zinc-500 text-center py-4">Loading orders…</p>}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pastOrders.map(order => (
              <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-zinc-100">{order.orderNumber}</span>
                    {order.customer && (
                      <span className="ml-2 text-xs text-zinc-400">
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-100">{formatCurrency(order.totalAmount)}</div>
                    <div className="text-[10px] text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1 border-t border-zinc-800">
                      <div className="min-w-0">
                        <div className="text-xs text-zinc-300 truncate">{item.productName}</div>
                        <div className="text-[10px] text-zinc-500">
                          {item.sku} · Qty: {item.quantity} · {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <button
                        onClick={() => addReturnItem(
                          item.productId,
                          item.productName,
                          item.sku,
                          item.unitPrice,
                          Math.abs(item.quantity)
                        )}
                        className="ml-3 px-2 py-1 text-[10px] font-medium bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 border border-orange-600/30 rounded transition-colors shrink-0"
                      >
                        Return
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!ordersLoading && pastOrders.length === 0 && orderSearch.length >= 2 && (
              <p className="text-xs text-zinc-500 text-center py-4">No orders found.</p>
            )}
            {!orderSearch && pastOrders.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">Enter a search term to find orders.</p>
            )}
          </div>
        </ModalWrapper>
      )}

      {/* ── Modal: Gift Card Input ───────────────────────────────────────────── */}
      {activeModal === 'gift_card_input' && (
        <ModalWrapper title="Gift Card Payment" onClose={() => setActiveModal('none')}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Gift Card Number</label>
              <Input
                placeholder="Scan or enter gift card number"
                value={giftCardNumber}
                onChange={e => setGiftCardNumber(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Amount to Apply</label>
              <Input
                type="number"
                placeholder={formatCurrency(Math.max(0, amountDue))}
                value={giftCardAmount}
                onChange={e => setGiftCardAmount(e.target.value)}
              />
            </div>
            <NumpadInline
              value={giftCardAmount}
              onChange={setGiftCardAmount}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setActiveModal('none')}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={() => {
                const amt = parseFloat(giftCardAmount)
                if (!giftCardNumber || isNaN(amt) || amt <= 0) return
                addPayment('gift_card', amt, giftCardNumber)
                setActiveModal('none')
              }}
            >
              Apply Gift Card
            </Button>
          </div>
        </ModalWrapper>
      )}
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModalWrapper({
  title, onClose, children, wide
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div
        className={`bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full shadow-2xl ${wide ? 'max-w-xl' : 'max-w-sm'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function NumpadInline({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const press = (k: string) => {
    if (k === '⌫') { onChange(value.slice(0, -1)); return }
    if (k === 'C') { onChange(''); return }
    if (k === '.' && value.includes('.')) return
    onChange(value + k)
  }
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {['7','8','9','4','5','6','1','2','3','0','.','⌫'].map(k => (
        <button
          key={k}
          type="button"
          onClick={() => press(k)}
          className="h-10 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg text-sm font-semibold text-zinc-100 transition-colors select-none"
        >
          {k}
        </button>
      ))}
    </div>
  )
}
