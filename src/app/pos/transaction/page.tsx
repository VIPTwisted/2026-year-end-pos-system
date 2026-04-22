'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Home, Package, ShoppingCart, Tag, Hash, User, Receipt,
  ShoppingBag, CreditCard, Banknote, Star, X, Search,
  ChevronRight, Check, RotateCcw, AlertCircle
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type CartItem = {
  id: string
  name: string
  sku: string
  qty: number
  price: number
  image: string
}

type Customer = {
  name: string
  email: string
  initials: string
  loyaltyPts: number
} | null

type ActiveTab = 'lines' | 'payments'
type RightTab = 'ACTIONS' | 'ORDERS' | 'DISCOUNTS' | 'PRODUCTS'
type PayState = 'idle' | 'cash' | 'card' | 'complete'

// ─── Constants ─────────────────────────────────────────────────────────────────

const TAX_RATE = 0.0825
const TXN_ID = 'TXN-MO8YQHJP'

const RECOMMENDED_PRODUCTS = [
  { id: 'p1', name: 'Artisan Coffee',      price: 5.99,  sku: 'BEV-001', image: '' },
  { id: 'p2', name: 'Bluetooth Speaker',   price: 49.99, sku: 'ELEC-204', image: '' },
  { id: 'p3', name: 'Cold Brew',           price: 5.49,  sku: 'BEV-012', image: '' },
  { id: 'p4', name: 'Green Tea',           price: 3.49,  sku: 'BEV-033', image: '' },
]

const SEARCH_CATALOG = [
  { id: 'p1', name: 'Artisan Coffee',      price: 5.99,  sku: 'BEV-001' },
  { id: 'p2', name: 'Bluetooth Speaker',   price: 49.99, sku: 'ELEC-204' },
  { id: 'p3', name: 'Cold Brew',           price: 5.49,  sku: 'BEV-012' },
  { id: 'p4', name: 'Green Tea',           price: 3.49,  sku: 'BEV-033' },
  { id: 'p5', name: 'Water Bottle',        price: 12.99, sku: 'ACC-101' },
  { id: 'p6', name: 'Protein Bar',         price: 2.99,  sku: 'FOOD-044' },
  { id: 'p7', name: 'USB-C Cable',         price: 9.99,  sku: 'ELEC-311' },
  { id: 'p8', name: 'Hand Sanitizer',      price: 4.49,  sku: 'HYG-007' },
]

const ACTION_BUTTONS = [
  ['Set quantity',   'Scan loyalty'],
  ['Change unit',    'Issue loyalty'],
  ['Line comment',   'Return line'],
  ['Gift cards',     'Trans. options'],
  ['Voids',          'Tax overrides'],
]

function fmt(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  const icons = [
    { icon: <Home className="w-5 h-5" />, label: 'Home' },
    { icon: <Package className="w-5 h-5" />, label: 'Inventory' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Cart' },
    { icon: <Tag className="w-5 h-5" />, label: 'Promotions' },
    { icon: <Hash className="w-5 h-5" />, label: 'Numpad' },
  ]
  return (
    <div
      className="flex flex-col items-center py-3 gap-1 shrink-0"
      style={{ width: 56, background: '#111327', borderRight: '1px solid rgba(255,255,255,0.07)' }}
    >
      {icons.map((item, i) => (
        <button
          key={i}
          title={item.label}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-all"
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}

// ─── Product Image Placeholder ─────────────────────────────────────────────────

function ProductThumb({ name, size = 48 }: { name: string; size?: number }) {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
  const idx = name.charCodeAt(0) % colors.length
  const letter = name[0]?.toUpperCase() ?? '?'
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 8,
        background: colors[idx] + '22',
        border: `1px solid ${colors[idx]}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.35,
        fontWeight: 700,
        color: colors[idx],
      }}
    >
      {letter}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function POSTransactionPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('lines')
  const [rightTab, setRightTab] = useState<RightTab>('ACTIONS')
  const [numBuffer, setNumBuffer] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [payState, setPayState] = useState<PayState>('idle')
  const [tendered, setTendered] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const tax      = subtotal * TAX_RATE
  const total    = subtotal + tax
  const discounts = 0
  const payments  = 0

  // ── Search ─────────────────────────────────────────────────────────────────
  const searchResults = searchQuery.length >= 1
    ? SEARCH_CATALOG.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const addToCart = useCallback((p: { id: string; name: string; sku: string; price: number; image?: string }) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id)
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id: p.id, name: p.name, sku: p.sku, qty: 1, price: p.price, image: p.image ?? '' }]
    })
    setSearchQuery('')
    setSearchOpen(false)
  }, [])

  // ── Numpad ──────────────────────────────────────────────────────────────────
  const pressNum = useCallback((k: string) => {
    if (k === '⌫') { setNumBuffer(p => p.slice(0, -1)); return }
    if (k === '±') { setNumBuffer(p => p.startsWith('-') ? p.slice(1) : '-' + p); return }
    if (k === '*') { setNumBuffer(''); return }
    if (k === '.') { if (!numBuffer.includes('.')) setNumBuffer(p => p + k); return }
    if (k === 'abc') { setNumBuffer(''); return }
    setNumBuffer(p => p + k)
  }, [numBuffer])

  const applyNumBuffer = useCallback(() => {
    if (!selectedId || !numBuffer) return
    const val = parseFloat(numBuffer)
    if (!isNaN(val) && val > 0) {
      setCart(prev => prev.map(i => i.id === selectedId ? { ...i, qty: Math.round(val) } : i))
    }
    setNumBuffer('')
  }, [selectedId, numBuffer])

  // ── Cart ops ───────────────────────────────────────────────────────────────
  const removeItem = (id: string) => {
    setCart(p => p.filter(i => i.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const updateQty = (id: string, delta: number) => {
    setCart(p => p.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }

  const addCustomer = () => {
    setCustomer({ name: 'Karen Berg', email: 'karen.berg@email.com', initials: 'KB', loyaltyPts: 2450 })
  }

  // ── Payment ────────────────────────────────────────────────────────────────
  const handlePay = (method: 'cash' | 'card') => {
    if (!cart.length) return
    setPayState(method)
    setTendered(total.toFixed(2))
  }

  const confirmPayment = () => {
    setPayState('complete')
    setTimeout(() => {
      setCart([])
      setSelectedId(null)
      setCustomer(null)
      setNumBuffer('')
      setPayState('idle')
    }, 2500)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100dvh',
        background: '#0d0e24',
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* ── Left Sidebar (icon-only) ── */}
      <Sidebar />

      {/* ── Main Transaction Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
            height: 52, background: '#111327', borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          {/* Title + search */}
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e4e4f0', whiteSpace: 'nowrap' }}>
            Transaction
          </span>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search
              style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                width: 14, height: 14, color: '#52527a',
              }}
            />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              placeholder="Search products..."
              style={{
                width: '100%', height: 32, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                paddingLeft: 32, paddingRight: 12, color: '#e4e4f0', fontSize: 13,
                outline: 'none',
              }}
            />
            {/* Search dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: '#1a1b3a', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 8, marginTop: 4, overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onMouseDown={() => addToCart(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '8px 12px', background: 'transparent', border: 'none',
                      cursor: 'pointer', textAlign: 'left', color: '#e4e4f0',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ProductThumb name={p.name} size={28} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#6b6b8f' }}>{p.sku} · {fmt(p.price)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2 }}>
            {(['lines', 'payments'] as ActiveTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '4px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: activeTab === tab ? '#3b5bdb' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#6b6b8f',
                  textTransform: 'capitalize',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Right: TXN ID + icons */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#4a4a6a', fontFamily: 'monospace' }}>{TXN_ID}</span>
            <button title="Customer" style={{ color: '#52527a', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <User style={{ width: 18, height: 18 }} />
            </button>
            <button title="Receipt" style={{ color: '#52527a', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Receipt style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Transaction body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {activeTab === 'lines' ? (
            <>
              {/* Customer bar */}
              {!customer ? (
                <button
                  onClick={addCustomer}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                    background: 'rgba(59,91,219,0.12)', border: 'none', borderBottom: '1px solid rgba(59,91,219,0.2)',
                    color: '#7b9cff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    flexShrink: 0,
                  }}
                >
                  <User style={{ width: 16, height: 16 }} />
                  Add customer (optional)
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
                    background: 'rgba(59,91,219,0.08)', borderBottom: '1px solid rgba(255,255,255,0.07)',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#3b5bdb,#7b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                    }}
                  >
                    {customer.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4f0' }}>{customer.name}</div>
                    <div style={{ fontSize: 11, color: '#52527a' }}>{customer.email}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star style={{ width: 12, height: 12, color: '#f59e0b' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>{customer.loyaltyPts.toLocaleString()} pts</span>
                  </div>
                  <button
                    onClick={() => setCustomer(null)}
                    style={{ color: '#4a4a6a', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              )}

              {/* Table header */}
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 80px 80px 80px 32px',
                  padding: '6px 16px', background: '#0e0f25', flexShrink: 0,
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {['', 'ITEM', 'QTY', 'REP', 'TOTAL', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#3a3a5c', letterSpacing: '0.08em', textAlign: i >= 2 ? 'center' : 'left' }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Line items */}
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {cart.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
                    <ShoppingCart style={{ width: 40, height: 40, color: '#2a2a3a', opacity: 0.5 }} />
                    <span style={{ fontSize: 13, color: '#3a3a5a' }}>No items — scan or search a product</span>
                  </div>
                ) : (
                  cart.map(item => {
                    const lineTotal = item.price * item.qty
                    const isSelected = selectedId === item.id
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedId(isSelected ? null : item.id)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '32px 1fr 80px 80px 80px 32px',
                          alignItems: 'center',
                          padding: '8px 16px',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: isSelected ? 'rgba(59,91,219,0.1)' : 'transparent',
                          borderLeft: `2px solid ${isSelected ? '#3b5bdb' : 'transparent'}`,
                          cursor: 'pointer',
                          transition: 'background 0.1s',
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          style={{
                            width: 16, height: 16, borderRadius: 4,
                            border: `1.5px solid ${isSelected ? '#3b5bdb' : '#3a3a5a'}`,
                            background: isSelected ? '#3b5bdb' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {isSelected && <Check style={{ width: 10, height: 10, color: '#fff' }} />}
                        </div>

                        {/* Item info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <ProductThumb name={item.name} size={36} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#3a3a5a' }}>{item.sku} · {fmt(item.price)}</div>
                          </div>
                        </div>

                        {/* Qty */}
                        <div style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={e => {
                              const v = parseInt(e.target.value)
                              if (!isNaN(v) && v > 0) setCart(p => p.map(i => i.id === item.id ? { ...i, qty: v } : i))
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: 48, height: 28, textAlign: 'center', background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                              color: '#e4e4f0', fontSize: 13, fontWeight: 600,
                            }}
                          />
                        </div>

                        {/* Unit price */}
                        <div style={{ textAlign: 'center', fontSize: 13, color: '#9494b8' }}>
                          {fmt(item.price)}
                        </div>

                        {/* Total */}
                        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#e4e4f0' }}>
                          {fmt(lineTotal)}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={e => { e.stopPropagation(); removeItem(item.id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a3a5a', padding: 4 }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#3a3a5a')}
                        >
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Recommended products section */}
              <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0e0f25' }}>
                <div style={{ padding: '8px 16px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#3a3a5c', letterSpacing: '0.1em' }}>RECOMMENDED PRODUCTS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '0 12px 12px' }}>
                  {RECOMMENDED_PRODUCTS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      style={{
                        background: '#13143a', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10, padding: '10px 8px', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#1a1b45'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,91,219,0.4)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '#13143a'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                      }}
                    >
                      <div style={{
                        width: '100%', height: 56, borderRadius: 6, marginBottom: 8,
                        background: 'rgba(59,91,219,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ProductThumb name={p.name} size={36} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#c4c4e4', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{fmt(p.price)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer totals bar */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0,
                  background: '#0a0b1e', borderTop: '1px solid rgba(255,255,255,0.07)',
                  padding: '8px 12px', flexWrap: 'wrap', rowGap: 4,
                }}
              >
                {[
                  ['LINES', String(cart.length)],
                  ['DISCOUNTS', fmt(discounts)],
                  ['SUBTOTAL', fmt(subtotal)],
                  [`TAX (8.25%)`, fmt(tax)],
                  ['PAYMENTS', fmt(payments)],
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 16 }}>
                    <span style={{ fontSize: 10, color: '#3a3a5c', fontWeight: 700, letterSpacing: '0.06em' }}>{label}:</span>
                    <span style={{ fontSize: 12, color: '#9494b8', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#3a3a5c', fontWeight: 700, letterSpacing: '0.06em' }}>AMOUNT DUE:</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#3b82f6', letterSpacing: '-0.02em' }}>{fmt(total)}</span>
                </div>
              </div>
            </>
          ) : (
            /* Payments tab */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <CreditCard style={{ width: 48, height: 48, color: '#2a2a4a' }} />
              <div style={{ fontSize: 14, color: '#3a3a5a' }}>No payments recorded yet</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#3b82f6' }}>Amount Due: {fmt(total)}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Numpad Panel (center-right) ── */}
      <div
        style={{
          width: 240, background: '#111327', borderLeft: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}
      >
        {/* Input display */}
        <div style={{ padding: '12px 12px 8px' }}>
          <input
            value={numBuffer}
            readOnly
            placeholder="Search or enter quantity"
            style={{
              width: '100%', height: 36, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              padding: '0 10px', color: '#e4e4f0', fontSize: 14, fontWeight: 700,
              textAlign: 'right', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Numpad grid 4×3 */}
        <div style={{ padding: '0 12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {[
            '7','8','9','⌫',
            '4','5','6','±',
            '1','2','3','*',
            '0','.','abc','',
          ].map((k, i) => {
            if (k === '') return <div key={i} />
            const isSpecial = ['⌫','±','*','abc'].includes(k)
            const isBack = k === '⌫'
            return (
              <button
                key={i}
                onClick={() => pressNum(k)}
                style={{
                  height: 44, borderRadius: 8, fontSize: isSpecial ? 12 : 16, fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: isBack ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                  color: isBack ? '#ef4444' : isSpecial ? '#9494b8' : '#e4e4f0',
                  cursor: 'pointer', transition: 'all 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isBack ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = isBack ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)')}
              >
                {k}
              </button>
            )
          })}
        </div>

        {/* Enter button */}
        <div style={{ padding: '8px 12px' }}>
          <button
            onClick={applyNumBuffer}
            style={{
              width: '100%', height: 40, borderRadius: 8, background: '#3b5bdb',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4c6ef5')}
            onMouseLeave={e => (e.currentTarget.style.background = '#3b5bdb')}
          >
            Enter
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Pay buttons */}
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => handlePay('cash')}
            disabled={!cart.length}
            style={{
              height: 44, borderRadius: 8, background: cart.length ? '#16a34a' : '#1a2a1a',
              border: 'none', color: cart.length ? '#fff' : '#2a3a2a',
              fontSize: 13, fontWeight: 700, cursor: cart.length ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (cart.length) (e.currentTarget.style.background = '#22c55e') }}
            onMouseLeave={e => { if (cart.length) (e.currentTarget.style.background = '#16a34a') }}
          >
            <Banknote style={{ width: 16, height: 16 }} />
            Pay cash
          </button>
          <button
            onClick={() => handlePay('card')}
            disabled={!cart.length}
            style={{
              height: 44, borderRadius: 8, background: cart.length ? '#16a34a' : '#1a2a1a',
              border: 'none', color: cart.length ? '#fff' : '#2a3a2a',
              fontSize: 13, fontWeight: 700, cursor: cart.length ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (cart.length) (e.currentTarget.style.background = '#22c55e') }}
            onMouseLeave={e => { if (cart.length) (e.currentTarget.style.background = '#16a34a') }}
          >
            <CreditCard style={{ width: 16, height: 16 }} />
            Pay card
          </button>
        </div>
      </div>

      {/* ── Right Action Panel ── */}
      <div
        style={{
          display: 'flex', flexShrink: 0,
        }}
      >
        {/* Action buttons column */}
        <div
          style={{
            width: 156, background: '#0e0f25', borderLeft: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column', padding: '8px 8px', gap: 6, overflowY: 'auto',
          }}
        >
          {ACTION_BUTTONS.map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {row.map((label, ci) => (
                <button
                  key={ci}
                  style={{
                    height: 48, borderRadius: 8, background: '#1a1b35',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: '#7474a0', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    padding: '4px 6px', lineHeight: 1.3, transition: 'all 0.15s',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget.style.background = '#252645')
                    ;(e.currentTarget.style.color = '#c4c4e4')
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget.style.background = '#1a1b35')
                    ;(e.currentTarget.style.color = '#7474a0')
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Vertical tabs */}
        <div
          style={{
            width: 32, background: '#0a0b1e', borderLeft: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 4,
          }}
        >
          {(['ACTIONS', 'ORDERS', 'DISCOUNTS', 'PRODUCTS'] as RightTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              style={{
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                height: 80, width: 28, background: rightTab === tab ? '#3b5bdb' : 'transparent',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                color: rightTab === tab ? '#fff' : '#3a3a5c',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (rightTab !== tab) (e.currentTarget.style.color = '#9494b8') }}
              onMouseLeave={e => { if (rightTab !== tab) (e.currentTarget.style.color = '#3a3a5c') }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {payState !== 'idle' && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget && payState === 'complete') setPayState('idle') }}
        >
          <div
            style={{
              width: 400, background: '#13143a', border: '1px solid rgba(59,91,219,0.3)',
              borderRadius: 16, padding: '28px 28px', boxShadow: '0 0 60px rgba(59,91,219,0.2)',
            }}
          >
            {payState === 'complete' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'rgba(22,163,74,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <Check style={{ width: 32, height: 32, color: '#22c55e' }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#e4e4f0', marginBottom: 8 }}>Payment complete</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e', marginBottom: 8 }}>{fmt(total)}</div>
                <div style={{ fontSize: 13, color: '#52527a', marginBottom: 20 }}>
                  via {payState === 'card' ? 'Card' : 'Cash'}
                </div>
                <div style={{ fontSize: 13, color: '#52527a' }}>Clearing transaction...</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e4e4f0', marginBottom: 20 }}>
                  {payState === 'cash' ? 'Cash Payment' : 'Card Payment'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#52527a' }}>Amount due</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{fmt(total)}</span>
                </div>
                {payState === 'cash' && (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#52527a', display: 'block', marginBottom: 6 }}>Tendered</label>
                      <input
                        type="number"
                        value={tendered}
                        onChange={e => setTendered(e.target.value)}
                        style={{
                          width: '100%', height: 40, background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                          padding: '0 12px', color: '#e4e4f0', fontSize: 16, fontWeight: 700,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ fontSize: 13, color: '#52527a' }}>Change</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>
                        {fmt(Math.max(0, parseFloat(tendered || '0') - total))}
                      </span>
                    </div>
                  </>
                )}
                {payState === 'card' && (
                  <div style={{ padding: '16px 0 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#52527a', marginBottom: 8 }}>Please tap or insert card on terminal</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#e4e4f0' }}>{fmt(total)}</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setPayState('idle')}
                    style={{
                      flex: 1, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#9494b8',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPayment}
                    style={{
                      flex: 2, height: 40, borderRadius: 8, background: '#16a34a',
                      border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#22c55e')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#16a34a')}
                  >
                    Confirm payment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
