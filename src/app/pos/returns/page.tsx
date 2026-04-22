'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, Search, RotateCcw, CheckCircle2, ChevronRight,
  AlertCircle, Loader2, Package, User, Hash,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {
  id: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  taxAmount: number
  lineTotal: number
  productId: string
}

type Order = {
  id: string
  orderNumber: string
  createdAt: string
  totalAmount: number
  items: OrderItem[]
  customer: { id: string; firstName: string; lastName: string } | null
}

type ReturnSelection = {
  orderItemId: string
  quantity: number
  reason: string
  productName: string
  unitPrice: number
  taxAmount: number
  maxQuantity: number
}

const REFUND_METHODS = [
  { value: 'cash',        label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'store_credit', label: 'Store Credit' },
  { value: 'gift_card',   label: 'Gift Card' },
  { value: 'original',    label: 'Original Payment Method' },
] as const

const RETURN_REASONS = [
  { value: 'defective',            label: 'Defective / Not Working' },
  { value: 'customer_changed_mind', label: 'Customer Changed Mind' },
  { value: 'wrong_item',           label: 'Wrong Item' },
  { value: 'damaged_in_shipping',  label: 'Damaged in Shipping' },
  { value: 'not_as_described',     label: 'Not As Described' },
  { value: 'other',                label: 'Other' },
] as const

type RefundMethodValue = typeof REFUND_METHODS[number]['value']
type ReturnReasonValue  = typeof RETURN_REASONS[number]['value']

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepDot({ n, current, label }: { n: number; current: number; label: string }) {
  const done    = current > n
  const active  = current === n
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={[
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
          done   ? 'bg-emerald-500 text-white'  :
          active ? 'bg-blue-600 text-white ring-2 ring-blue-500/30' :
                   'bg-zinc-800 text-zinc-500',
        ].join(' ')}
      >
        {done ? <CheckCircle2 className="w-4 h-4" /> : n}
      </div>
      <span className={[
        'text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap',
        active ? 'text-blue-400' : done ? 'text-emerald-400' : 'text-zinc-600',
      ].join(' ')}>
        {label}
      </span>
    </div>
  )
}

function StepBar({ current }: { current: number }) {
  const steps = ['Find Order', 'Select Items', 'Refund Method', 'Complete']
  return (
    <div className="flex items-start gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <StepDot n={i + 1} current={current} label={label} />
          {i < steps.length - 1 && (
            <div className={[
              'flex-1 h-px mt-[-18px] mx-1 transition-colors',
              current > i + 1 ? 'bg-emerald-500/50' : 'bg-zinc-800',
            ].join(' ')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function POSReturnsPage() {
  // Step 1 state
  const [step, setStep]             = useState<1 | 2 | 3 | 4>(1)
  const [searchInput, setSearchInput] = useState('')
  const [searching, setSearching]   = useState(false)
  const [searchError, setSearchError] = useState('')
  const [order, setOrder]           = useState<Order | null>(null)

  // Step 2 state
  const [selections, setSelections] = useState<Map<string, ReturnSelection>>(new Map())

  // Step 3 state
  const [refundMethod, setRefundMethod] = useState<RefundMethodValue>('original')
  const [notes, setNotes]           = useState('')
  const [processing, setProcessing] = useState(false)
  const [processError, setProcessError] = useState('')

  // Step 4 state
  const [returnNumber, setReturnNumber] = useState('')
  const [returnTotal, setReturnTotal]   = useState(0)

  // ── Step 1: search ──────────────────────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    const q = searchInput.trim().toUpperCase()
    if (!q) return

    setSearching(true)
    setSearchError('')
    setOrder(null)

    try {
      // Look up by order number fragment
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error('Search failed')
      const orders: Order[] = await res.json()

      if (!orders.length) {
        setSearchError('No orders found matching that number.')
        setSearching(false)
        return
      }

      // Exact match preferred; otherwise first
      const found = orders.find(o => o.orderNumber === q) ?? orders[0]

      // Fetch full order with payments via POS returns endpoint
      const detailRes = await fetch(`/api/pos/returns?orderId=${found.id}`)
      if (!detailRes.ok) {
        setSearchError('Could not load order details.')
        setSearching(false)
        return
      }

      const fullOrder: Order = await detailRes.json()
      setOrder(fullOrder)
    } catch {
      setSearchError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }, [searchInput])

  // ── Step 2: item selection helpers ─────────────────────────────────────────

  const toggleItem = useCallback((item: OrderItem) => {
    setSelections(prev => {
      const next = new Map(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        next.set(item.id, {
          orderItemId: item.id,
          quantity: 1,
          reason: 'customer_changed_mind',
          productName: item.productName,
          unitPrice: item.unitPrice,
          taxAmount: item.taxAmount,
          maxQuantity: item.quantity,
        })
      }
      return next
    })
  }, [])

  const updateQty = useCallback((itemId: string, qty: number) => {
    setSelections(prev => {
      const next = new Map(prev)
      const sel  = next.get(itemId)
      if (sel) next.set(itemId, { ...sel, quantity: Math.max(1, Math.min(qty, sel.maxQuantity)) })
      return next
    })
  }, [])

  const updateReason = useCallback((itemId: string, reason: ReturnReasonValue) => {
    setSelections(prev => {
      const next = new Map(prev)
      const sel  = next.get(itemId)
      if (sel) next.set(itemId, { ...sel, reason })
      return next
    })
  }, [])

  const selectedItems = Array.from(selections.values())

  const refundEstimate = selectedItems.reduce((sum, s) => {
    const base = s.unitPrice * s.quantity
    const tax  = s.maxQuantity > 0
      ? s.taxAmount * (s.quantity / s.maxQuantity)
      : 0
    return sum + base + tax
  }, 0)

  // ── Step 3: process return ──────────────────────────────────────────────────

  const handleProcess = useCallback(async () => {
    if (!order || !selectedItems.length) return

    setProcessing(true)
    setProcessError('')

    try {
      const res = await fetch('/api/pos/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalOrderId: order.id,
          items: selectedItems.map(s => ({
            orderItemId: s.orderItemId,
            quantity: s.quantity,
            reason: s.reason,
          })),
          refundMethod,
          notes: notes.trim() || undefined,
        }),
      })

      const data: {
        salesReturn?: { returnNumber: string }
        returnTotal?: number
        error?: string
      } = await res.json()

      if (!res.ok) {
        setProcessError(data.error ?? 'Return failed. Please try again.')
        return
      }

      setReturnNumber(data.salesReturn?.returnNumber ?? '')
      setReturnTotal(data.returnTotal ?? 0)
      setStep(4)
    } catch {
      setProcessError('Network error. Please try again.')
    } finally {
      setProcessing(false)
    }
  }, [order, selectedItems, refundMethod, notes])

  // ── Reset for another return ────────────────────────────────────────────────

  const reset = () => {
    setStep(1)
    setSearchInput('')
    setSearchError('')
    setOrder(null)
    setSelections(new Map())
    setRefundMethod('original')
    setNotes('')
    setProcessError('')
    setReturnNumber('')
    setReturnTotal(0)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar title="POS Returns" />

      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/pos"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            POS
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <RotateCcw className="w-4 h-4 text-blue-400" />
            POS Returns
          </div>
        </div>

        {/* Step indicator */}
        <StepBar current={step} />

        {/* ── Step 1: Find Order ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Search by Order Number
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. ORD-123456"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching || !searchInput.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
              >
                {searching
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Search className="w-4 h-4" />}
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>

            {searchError && (
              <div className="mt-3 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {searchError}
              </div>
            )}

            {order && (
              <div className="mt-4 border border-zinc-700 rounded-lg p-4">
                {/* Order summary */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-zinc-100 font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-100 font-semibold text-sm">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                      Order Total
                    </p>
                  </div>
                </div>

                {order.customer && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-zinc-400">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    {order.customer.firstName} {order.customer.lastName}
                  </div>
                )}

                {!order.customer && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2.5 py-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Walk-in order — customer required to process a return
                  </div>
                )}

                <div className="space-y-1.5">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Package className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span className="truncate max-w-[260px]">{item.productName}</span>
                        <span className="text-zinc-600">×{item.quantity}</span>
                      </div>
                      <span className="text-zinc-300 shrink-0">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!order.customer}
                  className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                >
                  Select Items to Return
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Select Items ────────────────────────────────────────── */}
        {step === 2 && order && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Order {order.orderNumber}
                </p>
                <p className="text-zinc-100 font-medium text-sm mt-0.5">
                  Select items and quantities to return
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Change order
              </button>
            </div>

            <div className="space-y-3">
              {order.items.map(item => {
                const sel = selections.get(item.id)
                const checked = !!sel

                return (
                  <div
                    key={item.id}
                    className={[
                      'border rounded-lg p-3.5 transition-colors cursor-pointer',
                      checked
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-zinc-800 hover:border-zinc-700',
                    ].join(' ')}
                    onClick={() => toggleItem(item)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div
                        className={[
                          'w-4.5 h-4.5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors',
                          checked
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-zinc-600 bg-zinc-900',
                        ].join(' ')}
                        style={{ width: 18, height: 18 }}
                      >
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-zinc-100 text-sm font-medium leading-snug truncate">
                              {item.productName}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">
                              {item.sku} · Qty sold: {item.quantity}
                            </p>
                          </div>
                          <p className="text-zinc-300 text-sm shrink-0">
                            {formatCurrency(item.unitPrice)} ea
                          </p>
                        </div>

                        {checked && sel && (
                          <div
                            className="mt-3 grid grid-cols-2 gap-3"
                            onClick={e => e.stopPropagation()}
                          >
                            {/* Qty */}
                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">
                                Return Qty
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={item.quantity}
                                value={sel.quantity}
                                onChange={e => updateQty(item.id, parseInt(e.target.value, 10) || 1)}
                                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {/* Reason */}
                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">
                                Reason
                              </label>
                              <select
                                value={sel.reason}
                                onChange={e => updateReason(item.id, e.target.value as ReturnReasonValue)}
                                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 text-sm focus:outline-none focus:border-blue-500 appearance-none"
                              >
                                {RETURN_REASONS.map(r => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Running total */}
            {selectedItems.length > 0 && (
              <div className="mt-4 flex items-center justify-between px-4 py-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-zinc-400 text-sm">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <span className="text-emerald-400 font-semibold text-sm">
                  Est. refund: {formatCurrency(refundEstimate)}
                </span>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedItems.length === 0}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
              >
                Continue → Choose Refund Method
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Refund Method ───────────────────────────────────────── */}
        {step === 3 && order && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Refund Method
            </p>

            {/* Refund summary */}
            <div className="mb-5 flex items-center justify-between px-4 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Total Refund
                </p>
                <p className="text-emerald-400 text-2xl font-bold mt-0.5">
                  {formatCurrency(refundEstimate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                  Items
                </p>
                {selectedItems.map(s => (
                  <p key={s.orderItemId} className="text-zinc-400 text-xs">
                    {s.productName} ×{s.quantity}
                  </p>
                ))}
              </div>
            </div>

            {/* Method selection */}
            <div className="space-y-2 mb-5">
              {REFUND_METHODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setRefundMethod(m.value)}
                  className={[
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors text-left',
                    refundMethod === m.value
                      ? 'border-blue-500/60 bg-blue-500/10 text-zinc-100'
                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-400',
                  ].join(' ')}
                >
                  <span>{m.label}</span>
                  {refundMethod === m.value && (
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes for this return…"
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {processError && (
              <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {processError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleProcess}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded transition-colors"
              >
                {processing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  : <><RotateCcw className="w-4 h-4" /> Process Return</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Success ─────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <h2 className="text-zinc-100 text-xl font-bold mb-1">Return Processed</h2>
            <p className="text-zinc-500 text-sm mb-6">
              The return has been recorded and inventory restocked.
            </p>

            <div className="inline-block bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-4 mb-6 text-left">
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                  Return Number
                </p>
                <p className="text-blue-400 font-mono font-semibold text-sm">{returnNumber}</p>
              </div>
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                  Amount Refunded
                </p>
                <p className="text-emerald-400 font-bold text-xl">{formatCurrency(returnTotal)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                  Refund Method
                </p>
                <p className="text-zinc-300 text-sm capitalize">
                  {REFUND_METHODS.find(m => m.value === refundMethod)?.label ?? refundMethod}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                Process Another Return
              </button>
              <Link
                href="/pos"
                className="px-5 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm rounded transition-colors"
              >
                Back to POS
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
