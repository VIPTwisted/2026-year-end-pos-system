'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import {
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  Receipt, User, X, ShoppingBag, Calculator
} from 'lucide-react'

type CartItem = {
  id: string; sku: string; name: string; price: number; qty: number; taxable: boolean
}

type Product = {
  id: string; sku: string; name: string; salePrice: number; taxable: boolean;
  category?: { name: string; color?: string }; trackStock?: boolean
}

const TAX_RATE = 0.0825

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')
  const [tendered, setTendered] = useState('')
  const [stage, setStage] = useState<'cart' | 'payment' | 'receipt'>('cart')
  const [lastOrder, setLastOrder] = useState<{ orderNumber: string; total: number; change: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/products?active=true').then(r => r.json()).then(setProducts).catch(() => setProducts([]))
  }, [])

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id)
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { id: p.id, sku: p.sku, name: p.name, price: p.salePrice, qty: 1, taxable: p.taxable }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0))
  }

  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.id !== id))

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const tax = cart.reduce((s, c) => s + (c.taxable ? c.price * c.qty * TAX_RATE : 0), 0)
  const total = subtotal + tax
  const change = paymentMethod === 'cash' && tendered ? parseFloat(tendered) - total : 0

  const checkout = async () => {
    if (!cart.length) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(c => ({
            productId: c.id,
            productName: c.name,
            sku: c.sku,
            quantity: c.qty,
            unitPrice: c.price,
            taxAmount: c.taxable ? c.price * c.qty * TAX_RATE : 0,
            lineTotal: c.price * c.qty,
          })),
          subtotal,
          taxAmount: tax,
          totalAmount: total,
          paymentMethod,
          amountTendered: paymentMethod === 'cash' ? parseFloat(tendered) : total,
          changeDue: Math.max(0, change),
        }),
      })
      const order = await res.json()
      setLastOrder({ orderNumber: order.orderNumber, total, change: Math.max(0, change) })
      setStage('receipt')
      setCart([])
    } finally {
      setLoading(false)
    }
  }

  const newSale = () => {
    setStage('cart')
    setSearch('')
    setTendered('')
    setCustomerName('')
    setLastOrder(null)
  }

  return (
    <>
      <TopBar title="POS Terminal" />
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left — Product Grid */}
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
                    <div className="w-full aspect-square bg-zinc-800 rounded-lg mb-2 flex items-center justify-center text-2xl">
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

        {/* Right — Cart / Payment / Receipt */}
        <div className="w-96 flex flex-col bg-zinc-950">
          {stage === 'cart' && (
            <>
              <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-100">Cart</span>
                <Badge variant="secondary" className="ml-auto">{cart.length} items</Badge>
              </div>

              {/* Customer */}
              <div className="px-4 py-3 border-b border-zinc-800">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <Input
                    className="pl-8 text-xs h-8"
                    placeholder="Customer (optional)"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                    <Calculator className="w-8 h-8 opacity-40" />
                    <p className="text-sm">Cart is empty</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-zinc-900 rounded-lg p-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-100 truncate">{item.name}</div>
                          <div className="text-xs text-zinc-500">{formatCurrency(item.price)} each</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-sm font-semibold text-zinc-100 w-16 text-right">
                          {formatCurrency(item.price * item.qty)}
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-800 p-4 space-y-2">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Tax (8.25%)</span><span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-100 pt-2 border-t border-zinc-800">
                  <span>Total</span><span className="text-emerald-400">{formatCurrency(total)}</span>
                </div>
                <Button className="w-full mt-2" onClick={() => setStage('payment')} disabled={!cart.length}>
                  Proceed to Payment
                </Button>
              </div>
            </>
          )}

          {stage === 'payment' && (
            <>
              <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <button onClick={() => setStage('cart')} className="text-zinc-500 hover:text-zinc-100">
                  &larr;
                </button>
                <span className="text-sm font-medium text-zinc-100">Payment</span>
              </div>
              <div className="p-4 space-y-4 flex-1">
                <div className="text-3xl font-bold text-emerald-400 text-center py-4">{formatCurrency(total)}</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 hover:border-zinc-600'}`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                    <div className="text-sm font-medium">Card</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 hover:border-zinc-600'}`}
                  >
                    <Banknote className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                    <div className="text-sm font-medium">Cash</div>
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
                    {parseFloat(tendered) >= total && (
                      <div className="mt-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                        <div className="text-sm text-zinc-400">Change Due</div>
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
                  disabled={loading || (paymentMethod === 'cash' && parseFloat(tendered || '0') < total)}
                >
                  {loading ? 'Processing...' : `Complete Sale ${formatCurrency(total)}`}
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
      </div>
    </>
  )
}
