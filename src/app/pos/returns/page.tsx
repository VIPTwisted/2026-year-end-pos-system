'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchTab = 'receipt' | 'customer' | 'manual'
type ItemCondition = 'Resalable' | 'Damaged' | 'Defective' | 'Open Box'
type ReturnMethod = 'original' | 'store_credit' | 'exchange' | 'gift_card'

type ReturnItem = {
  id: string
  name: string
  sku: string
  qtyPurchased: number
  qtyReturned: number
  qtyAvailable: number
  unitPrice: number
  nonReturnable?: boolean
  selected: boolean
  returnQty: number
  condition: ItemCondition
  restock: boolean
}

type RecentReturn = {
  returnNum: string
  date: string
  originalTxn: string
  customer: string
  items: number
  total: number
  method: string
  cashier: string
  status: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ITEMS: ReturnItem[] = [
  {
    id: '1', name: 'Artisan Coffee Blend', sku: 'SKU-1006',
    qtyPurchased: 2, qtyReturned: 0, qtyAvailable: 2,
    unitPrice: 15.99, selected: false, returnQty: 0,
    condition: 'Resalable', restock: true,
  },
  {
    id: '2', name: 'Bluetooth Headphones', sku: 'SKU-1001',
    qtyPurchased: 1, qtyReturned: 0, qtyAvailable: 1,
    unitPrice: 49.99, selected: true, returnQty: 1,
    condition: 'Resalable', restock: true,
  },
  {
    id: '3', name: 'Green Tea Premium', sku: 'SKU-1004',
    qtyPurchased: 3, qtyReturned: 0, qtyAvailable: 3,
    unitPrice: 3.49, selected: false, returnQty: 0,
    condition: 'Resalable', restock: true,
  },
  {
    id: '4', name: 'Standard Bag', sku: 'SKU-BAGS',
    qtyPurchased: 1, qtyReturned: 0, qtyAvailable: 0,
    unitPrice: 0.99, nonReturnable: true,
    selected: false, returnQty: 0,
    condition: 'Resalable', restock: false,
  },
]

const MOCK_RECENT: RecentReturn[] = [
  { returnNum: 'RTN-2026-0290', date: 'Apr 22, 2026', originalTxn: 'TXN-20260422-0038', customer: 'John Kim',       items: 2, total: 34.98,  method: 'Original Tender', cashier: 'Alice Chen',   status: 'Completed' },
  { returnNum: 'RTN-2026-0289', date: 'Apr 22, 2026', originalTxn: 'TXN-20260422-0021', customer: 'Pat Lee',        items: 1, total: 12.50,  method: 'Store Credit',    cashier: 'James Rivera', status: 'Completed' },
  { returnNum: 'RTN-2026-0288', date: 'Apr 21, 2026', originalTxn: 'TXN-20260421-0097', customer: 'Nina Torres',    items: 3, total: 87.44,  method: 'Gift Card',       cashier: 'Maria Santos', status: 'Completed' },
  { returnNum: 'RTN-2026-0287', date: 'Apr 21, 2026', originalTxn: 'TXN-20260421-0063', customer: 'Carlos Mena',    items: 1, total: 149.99, method: 'Original Tender', cashier: 'Alice Chen',   status: 'Completed' },
  { returnNum: 'RTN-2026-0286', date: 'Apr 21, 2026', originalTxn: 'TXN-20260421-0044', customer: 'Guest',          items: 1, total: 5.99,   method: 'Cash',            cashier: 'James Rivera', status: 'Voided' },
  { returnNum: 'RTN-2026-0285', date: 'Apr 20, 2026', originalTxn: 'TXN-20260420-0082', customer: 'Amy Patel',      items: 2, total: 64.00,  method: 'Exchange',        cashier: 'Tom Bradley',  status: 'Completed' },
  { returnNum: 'RTN-2026-0284', date: 'Apr 20, 2026', originalTxn: 'TXN-20260420-0059', customer: 'Lou Grant',      items: 1, total: 22.95,  method: 'Store Credit',    cashier: 'Maria Santos', status: 'Completed' },
  { returnNum: 'RTN-2026-0283', date: 'Apr 20, 2026', originalTxn: 'TXN-20260420-0042', customer: 'Sarah Martinez', items: 1, total: 54.11,  method: 'Original Tender', cashier: 'Alice Chen',   status: 'Completed' },
  { returnNum: 'RTN-2026-0282', date: 'Apr 19, 2026', originalTxn: 'TXN-20260419-0073', customer: 'Derek Walsh',    items: 4, total: 210.80, method: 'Original Tender', cashier: 'James Rivera', status: 'Completed' },
  { returnNum: 'RTN-2026-0281', date: 'Apr 19, 2026', originalTxn: 'TXN-20260419-0031', customer: 'Tara Singh',     items: 1, total: 18.49,  method: 'Gift Card',       cashier: 'Tom Bradley',  status: 'Completed' },
]

const RETURN_REASONS = [
  'Changed mind', 'Defective', 'Wrong item', 'Wrong size', 'Duplicate purchase', 'Other',
]

const CONDITIONS: ItemCondition[] = ['Resalable', 'Damaged', 'Defective', 'Open Box']

const RETURN_METHODS: { value: ReturnMethod; label: string; desc: string }[] = [
  { value: 'original',      label: 'Original Tender',  desc: 'Cash $49.99 + card $4.12' },
  { value: 'store_credit',  label: 'Store Credit',     desc: 'Issue store credit' },
  { value: 'exchange',      label: 'Exchange',         desc: 'Select replacement item' },
  { value: 'gift_card',     label: 'Gift Card',        desc: 'Issue new gift card' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const TAX_RATE = 0.0825

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReturnsPage() {
  const [searchTab, setSearchTab] = useState<SearchTab>('receipt')
  const [receiptInput, setReceiptInput] = useState('')
  const [customerInput, setCustomerInput] = useState('')

  // Transaction lookup result
  const [txnFound, setTxnFound] = useState(false)
  const [searching, setSearching] = useState(false)

  // Items state
  const [items, setItems] = useState<ReturnItem[]>(MOCK_ITEMS)
  const [returnReason, setReturnReason] = useState('Changed mind')
  const [notes, setNotes] = useState('')
  const [returnMethod, setReturnMethod] = useState<ReturnMethod>('original')
  const [managerPin, setManagerPin] = useState('')

  // Modals
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Fetch recent returns from API on mount
  const [recent] = useState<RecentReturn[]>(MOCK_RECENT)

  useEffect(() => {
    fetch('/api/pos/returns')
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
  }, [])

  // ── Derived ──────────────────────────────────────────────────────────────────

  const selectedItems = items.filter(it => it.selected && !it.nonReturnable && it.returnQty > 0)
  const returnSubtotal = selectedItems.reduce((s, it) => s + it.unitPrice * it.returnQty, 0)
  const returnTax      = returnSubtotal * TAX_RATE
  const returnTotal    = returnSubtotal + returnTax

  const requiresManager = returnTotal > 100 || searchTab === 'manual'

  // ── Item toggles ──────────────────────────────────────────────────────────────

  function toggleItem(id: string) {
    setItems(prev => prev.map(it => {
      if (it.id !== id || it.nonReturnable) return it
      const next = !it.selected
      return { ...it, selected: next, returnQty: next ? Math.max(1, it.qtyAvailable) : 0 }
    }))
  }

  function setReturnQty(id: string, qty: number) {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it
      const q = Math.max(0, Math.min(qty, it.qtyAvailable))
      return { ...it, returnQty: q, selected: q > 0 }
    }))
  }

  function setCondition(id: string, c: ItemCondition) {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it
      return { ...it, condition: c, restock: c === 'Resalable' }
    }))
  }

  function setRestock(id: string, v: boolean) {
    setItems(prev => prev.map(it => it.id !== id ? it : { ...it, restock: v }))
  }

  // ── Search handler ────────────────────────────────────────────────────────────

  function handleSearch() {
    const q = searchTab === 'receipt' ? receiptInput.trim() : customerInput.trim()
    if (!q) return
    setSearching(true)
    setTimeout(() => {
      setSearching(false)
      if (q.toUpperCase().includes('TXN') || q.toUpperCase().includes('0042') || q.toUpperCase().includes('@') || q.match(/\d{10}/)) {
        setTxnFound(true)
      }
    }, 600)
  }

  // ── Confirm return ────────────────────────────────────────────────────────────

  function handleConfirmReturn() {
    setShowConfirm(false)
    setConfirmed(true)
  }

  function handleDone() {
    setConfirmed(false)
    setTxnFound(false)
    setReceiptInput('')
    setCustomerInput('')
    setItems(MOCK_ITEMS)
    setReturnReason('Changed mind')
    setNotes('')
    setReturnMethod('original')
    setManagerPin('')
  }

  // ─── Render: Confirmed ───────────────────────────────────────────────────────

  if (confirmed) {
    return (
      <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24' }}>
        <TopBar
          title="Returns & Exchanges"
          breadcrumb={[{ label: 'POS', href: '/pos' }, { label: 'Returns', href: '/pos/returns' }]}
          actions={<>
            <button className="px-3 py-1.5 rounded text-xs font-medium text-[#94a3b8] border border-[rgba(99,102,241,0.2)] hover:text-[#e2e8f0] transition-colors">Exchange</button>
            <button className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">New Return</button>
          </>}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            className="w-full max-w-md rounded-xl border p-8 text-center space-y-4"
            style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.3)' }}
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[#e2e8f0] text-xl font-bold">Return Processed</h2>
            <p className="text-[#94a3b8] text-sm">The return has been recorded and inventory updated.</p>
            <div className="rounded-lg border p-4 text-left space-y-2" style={{ background: '#0d0e24', borderColor: 'rgba(99,102,241,0.15)' }}>
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Return #</span>
                <span className="text-indigo-400 font-mono font-semibold">RTN-2026-0291</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Total Refunded</span>
                <span className="text-emerald-400 font-bold">{fmt(returnTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#94a3b8]">Method</span>
                <span className="text-[#e2e8f0]">{RETURN_METHODS.find(m => m.value === returnMethod)?.label}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-2 rounded text-xs font-medium text-[#94a3b8] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#e2e8f0] transition-colors">
                Print Return Receipt
              </button>
              <button className="flex-1 py-2 rounded text-xs font-medium text-[#94a3b8] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#e2e8f0] transition-colors">
                Email Receipt
              </button>
              <button
                onClick={handleDone}
                className="flex-1 py-2 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render: Main ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24' }}>
      <TopBar
        title="Returns & Exchanges"
        breadcrumb={[{ label: 'POS', href: '/pos' }, { label: 'Returns', href: '/pos/returns' }]}
        actions={<>
          <button className="px-3 py-1.5 rounded text-xs font-medium text-[#94a3b8] border border-[rgba(99,102,241,0.2)] hover:text-[#e2e8f0] transition-colors">Exchange</button>
          <button className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">New Return</button>
        </>}
      />

      <div className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Search / Lookup Bar */}
        <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.2)' }}>
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
            {([
              { key: 'receipt',  label: 'By Receipt' },
              { key: 'customer', label: 'By Customer' },
              { key: 'manual',   label: 'Manual' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => { setSearchTab(tab.key); setTxnFound(false) }}
                className={[
                  'px-5 py-3 text-xs font-semibold transition-colors border-b-2',
                  searchTab === tab.key
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-[#94a3b8] hover:text-[#e2e8f0]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search inputs */}
          <div className="px-5 py-4">
            {searchTab === 'receipt' && (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none">
                    <path d="M7 8h10M7 12h7M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={receiptInput}
                    onChange={e => setReceiptInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Scan or type receipt number / TXN ID (e.g. TXN-20260420-0042)"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-sm placeholder:text-[#94a3b8]/40 focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching || !receiptInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded transition-colors flex items-center gap-2"
                >
                  {searching ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                  Search
                </button>
              </div>
            )}

            {searchTab === 'customer' && (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={customerInput}
                    onChange={e => setCustomerInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Phone number or email address"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-sm placeholder:text-[#94a3b8]/40 focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching || !customerInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded transition-colors"
                >
                  Search
                </button>
              </div>
            )}

            {searchTab === 'manual' && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-xs text-amber-300">
                  Manual returns with no original transaction require manager authorization.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Found — Lookup Result + Items Table + Options Panel */}
        {txnFound && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

            {/* Left: Transaction + Items */}
            <div className="space-y-4">

              {/* Original Transaction Card */}
              <div
                className="rounded-xl border p-4"
                style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.2)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-3">
                  Original Transaction
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#94a3b8]">TXN: </span>
                    <span className="text-indigo-400 font-mono font-semibold">TXN-20260420-0042</span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Date: </span>
                    <span className="text-[#e2e8f0]">Apr 20, 2026</span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Cashier: </span>
                    <span className="text-[#e2e8f0]">Alice Chen</span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Register: </span>
                    <span className="text-[#e2e8f0]">REG-001</span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Customer: </span>
                    <span className="text-[#e2e8f0]">Sarah Martinez</span>
                    <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      Loyalty Gold
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Original Total: </span>
                    <span className="text-[#e2e8f0] font-semibold">$124.48</span>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-[#94a3b8]">Original Tender: </span>
                    <span className="text-[#e2e8f0]">Cash $100.00 · Card $24.48</span>
                  </div>
                </div>
              </div>

              {/* Items to Return Table */}
              <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: 'rgba(99,102,241,0.15)' }}
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
                    Items to Return
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                        {['', 'Item', 'SKU', 'Purchased', 'Returned', 'Available', 'Return Qty', 'Unit Price', 'Return Amt', 'Condition', 'Restock'].map(h => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => {
                        const nonRet = item.nonReturnable
                        return (
                          <tr
                            key={item.id}
                            className="border-b transition-colors"
                            style={{
                              borderColor: 'rgba(99,102,241,0.08)',
                              opacity: nonRet ? 0.5 : 1,
                              background: item.selected ? 'rgba(99,102,241,0.06)' : 'transparent',
                            }}
                          >
                            {/* Checkbox */}
                            <td className="px-3 py-3">
                              {nonRet ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-[#94a3b8] border border-[rgba(99,102,241,0.15)]">
                                  Non-Returnable
                                </span>
                              ) : (
                                <button
                                  onClick={() => toggleItem(item.id)}
                                  className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                                  style={{
                                    background: item.selected ? '#6366f1' : '#0d0e24',
                                    borderColor: item.selected ? '#6366f1' : 'rgba(99,102,241,0.3)',
                                  }}
                                >
                                  {item.selected && (
                                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                      <path d="M1 3.5l2.5 2.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </button>
                              )}
                            </td>
                            <td className="px-3 py-3 text-[#e2e8f0] font-medium whitespace-nowrap">{item.name}</td>
                            <td className="px-3 py-3 text-[#94a3b8] font-mono">{item.sku}</td>
                            <td className="px-3 py-3 text-[#e2e8f0] text-center">{item.qtyPurchased}</td>
                            <td className="px-3 py-3 text-[#e2e8f0] text-center">{item.qtyReturned}</td>
                            <td className="px-3 py-3 text-[#e2e8f0] text-center">{item.qtyAvailable}</td>
                            <td className="px-3 py-3">
                              {nonRet ? (
                                <span className="text-[#94a3b8]">—</span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  max={item.qtyAvailable}
                                  value={item.returnQty}
                                  onChange={e => setReturnQty(item.id, parseInt(e.target.value) || 0)}
                                  className="w-14 px-2 py-1 bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] rounded text-[#e2e8f0] text-xs text-center focus:outline-none focus:border-[rgba(99,102,241,0.5)]"
                                />
                              )}
                            </td>
                            <td className="px-3 py-3 text-[#e2e8f0]">{fmt(item.unitPrice)}</td>
                            <td className={[
                              'px-3 py-3 font-semibold',
                              item.selected && item.returnQty > 0 ? 'text-emerald-400' : 'text-[#94a3b8]',
                            ].join(' ')}>
                              {item.selected && item.returnQty > 0 ? fmt(item.unitPrice * item.returnQty) : '$0.00'}
                            </td>
                            <td className="px-3 py-3">
                              {nonRet ? null : (
                                <select
                                  value={item.condition}
                                  onChange={e => setCondition(item.id, e.target.value as ItemCondition)}
                                  className="px-2 py-1 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-xs focus:outline-none"
                                >
                                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                                </select>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {nonRet ? null : (
                                <input
                                  type="checkbox"
                                  checked={item.restock}
                                  onChange={e => setRestock(item.id, e.target.checked)}
                                  className="w-4 h-4 accent-indigo-500"
                                />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Return Options Panel */}
            <div className="space-y-4">

              {/* Return Totals */}
              <div
                className="rounded-xl border p-4 space-y-2"
                style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.2)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-3">
                  Return Summary
                </p>
                {[
                  ['Subtotal', fmt(returnSubtotal)],
                  ['Tax (8.25%)', fmt(returnTax)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[#94a3b8]">{k}</span>
                    <span className="text-[#e2e8f0]">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t border-[rgba(99,102,241,0.15)]">
                  <span className="text-[#e2e8f0] font-bold">Return Total</span>
                  <span className="text-emerald-400 font-bold text-base">{fmt(returnTotal)}</span>
                </div>
              </div>

              {/* Return Method */}
              <div
                className="rounded-xl border p-4 space-y-2"
                style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-3">
                  Return Method
                </p>
                {RETURN_METHODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setReturnMethod(m.value)}
                    className={[
                      'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors',
                      returnMethod === m.value
                        ? 'border-indigo-500/50 bg-indigo-500/8'
                        : 'border-[rgba(99,102,241,0.1)] hover:border-[rgba(99,102,241,0.3)]',
                    ].join(' ')}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center shrink-0"
                      style={{
                        borderColor: returnMethod === m.value ? '#6366f1' : '#94a3b8',
                        background: returnMethod === m.value ? '#6366f1' : 'transparent',
                      }}
                    >
                      {returnMethod === m.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#e2e8f0]">{m.label}</p>
                      <p className="text-[10px] text-[#94a3b8]">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Reason & Notes */}
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}
              >
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-1.5">
                    Return Reason
                  </label>
                  <select
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-xs focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  >
                    {RETURN_REASONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-1.5">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Optional notes…"
                    className="w-full px-3 py-2 bg-[#0d0e24] border border-[rgba(99,102,241,0.15)] rounded text-[#e2e8f0] text-xs resize-none placeholder:text-[#94a3b8]/40 focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
              </div>

              {/* Manager Required Banner */}
              {requiresManager && (
                <div
                  className="rounded-xl border p-4 space-y-3"
                  style={{ background: 'rgba(234,179,8,0.05)', borderColor: 'rgba(234,179,8,0.25)' }}
                >
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p className="text-xs text-amber-300">
                      This return requires manager approval. Please enter manager PIN.
                    </p>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={managerPin}
                    onChange={e => setManagerPin(e.target.value.replace(/\D/, ''))}
                    placeholder="••••"
                    className="w-full px-3 py-2 bg-[#0d0e24] border border-amber-500/20 rounded text-[#e2e8f0] text-sm text-center tracking-[0.5em] focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              )}

              {/* Process Return Button */}
              <button
                onClick={() => selectedItems.length > 0 && setShowConfirm(true)}
                disabled={selectedItems.length === 0 || (requiresManager && managerPin.length < 4)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Process Return — {fmt(returnTotal)}
              </button>
            </div>
          </div>
        )}

        {/* Recent Returns Table — shown when no active return */}
        {!txnFound && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">
              Recent Returns
            </h2>
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: 'rgba(99,102,241,0.15)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                      {['Return #', 'Date', 'Original TXN', 'Customer', 'Items', 'Total', 'Method', 'Cashier', 'Status'].map(h => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b transition-colors hover:bg-[rgba(99,102,241,0.04)]"
                        style={{ borderColor: 'rgba(99,102,241,0.08)', background: '#16213e' }}
                      >
                        <td className="px-4 py-2.5 text-indigo-400 font-mono">{r.returnNum}</td>
                        <td className="px-4 py-2.5 text-[#94a3b8]">{r.date}</td>
                        <td className="px-4 py-2.5 text-[#94a3b8] font-mono">{r.originalTxn}</td>
                        <td className="px-4 py-2.5 text-[#e2e8f0]">{r.customer}</td>
                        <td className="px-4 py-2.5 text-[#e2e8f0] text-center">{r.items}</td>
                        <td className="px-4 py-2.5 text-emerald-400 font-semibold">{fmt(r.total)}</td>
                        <td className="px-4 py-2.5 text-[#94a3b8]">{r.method}</td>
                        <td className="px-4 py-2.5 text-[#e2e8f0]">{r.cashier}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              background: r.status === 'Completed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: r.status === 'Completed' ? '#4ade80' : '#f87171',
                              border: `1px solid ${r.status === 'Completed' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div
            className="relative w-full max-w-sm rounded-xl border p-6 space-y-4"
            style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.3)' }}
          >
            <h3 className="text-[#e2e8f0] font-bold text-base">Confirm Return</h3>
            <p className="text-[#94a3b8] text-sm">
              Returning{' '}
              <span className="text-[#e2e8f0] font-semibold">{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}</span>
              {' '}·{' '}
              <span className="text-emerald-400 font-bold">{fmt(returnTotal)}</span>
              {' '}to{' '}
              <span className="text-[#e2e8f0]">{RETURN_METHODS.find(m => m.value === returnMethod)?.label}</span>
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded text-sm text-[#94a3b8] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#e2e8f0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="flex-1 py-2 rounded text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
