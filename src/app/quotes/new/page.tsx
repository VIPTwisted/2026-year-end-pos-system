'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CustomerResult {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface StoreResult {
  id: string
  name: string
}

interface LineItem {
  _key: string
  productId: string
  productName: string
  description: string
  quantity: string
  unitPrice: string
  discountPct: string
  lineTotal: number
}

// ── Styling ───────────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

function genKey() { return Math.random().toString(36).slice(2) }

function calcLine(qty: string, price: string, disc: string): number {
  const q = parseFloat(qty) || 0
  const p = parseFloat(price) || 0
  const d = parseFloat(disc) || 0
  return parseFloat((q * p * (1 - d / 100)).toFixed(2))
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewQuotePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Party + store
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([])
  const [customerSearching, setCustomerSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null)

  const [stores, setStores] = useState<StoreResult[]>([])
  const [storesLoaded, setStoresLoaded] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState('')

  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')

  // Lines
  const [lines, setLines] = useState<LineItem[]>([])

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // Load stores lazily
  const loadStores = useCallback(async () => {
    if (storesLoaded) return
    try {
      const res = await fetch('/api/stores?limit=50')
      if (!res.ok) return
      const data = await res.json()
      const list = (Array.isArray(data) ? data : (data.stores ?? [])) as StoreResult[]
      setStores(list)
      if (list.length > 0 && !selectedStoreId) setSelectedStoreId(list[0].id)
    } catch { /* silent */ } finally {
      setStoresLoaded(true)
    }
  }, [storesLoaded, selectedStoreId])

  const searchCustomer = async (q: string) => {
    setCustomerSearch(q)
    if (q.trim().length < 2) { setCustomerResults([]); return }
    setCustomerSearching(true)
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=8`)
      if (!res.ok) return
      const data = await res.json()
      const list = (Array.isArray(data) ? data : (data.customers ?? [])) as CustomerResult[]
      setCustomerResults(list.slice(0, 8))
    } catch { /* silent */ } finally {
      setCustomerSearching(false)
    }
  }

  const selectCustomer = (c: CustomerResult) => {
    setSelectedCustomer(c)
    setCustomerSearch('')
    setCustomerResults([])
  }

  // Line management
  const addLine = () => {
    setLines(prev => [...prev, {
      _key: genKey(),
      productId: '',
      productName: '',
      description: '',
      quantity: '1',
      unitPrice: '0.00',
      discountPct: '0',
      lineTotal: 0,
    }])
  }

  const updateLine = (key: string, field: keyof LineItem, val: string) => {
    setLines(prev => prev.map(l => {
      if (l._key !== key) return l
      const updated = { ...l, [field]: val }
      if (['quantity', 'unitPrice', 'discountPct'].includes(field)) {
        updated.lineTotal = calcLine(
          field === 'quantity' ? val : l.quantity,
          field === 'unitPrice' ? val : l.unitPrice,
          field === 'discountPct' ? val : l.discountPct,
        )
      }
      return updated
    }))
  }

  const removeLine = (key: string) => setLines(prev => prev.filter(l => l._key !== key))

  // Totals
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const discountAmount = lines.reduce((s, l) => {
    const q = parseFloat(l.quantity) || 0
    const p = parseFloat(l.unitPrice) || 0
    const d = parseFloat(l.discountPct) || 0
    return s + q * p * (d / 100)
  }, 0)
  const taxAmount = subtotal * 0.1
  const total = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) { setError('Customer is required'); return }
    if (!selectedStoreId) { setError('Store is required'); return }
    if (lines.length === 0) { setError('At least one line item is required'); return }

    setSaving(true)
    setError('')
    try {
      const body = {
        customerId: selectedCustomer.id,
        storeId: selectedStoreId,
        validUntil: validUntil || undefined,
        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,
        lines: lines.map(l => ({
          productId: l.productId || undefined,
          description: l.description || l.productName || undefined,
          quantity: parseFloat(l.quantity) || 1,
          unitPrice: parseFloat(l.unitPrice) || 0,
          discountPct: parseFloat(l.discountPct) || 0,
        })),
      }

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Create failed')
      notify('Quote created')
      router.push(`/quotes/${(data as { id: string }).id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar
        title="New Quote"
        breadcrumb={[{ label: 'Quotes', href: '/quotes' }]}
        showBack
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-5">
        <Link
          href="/quotes"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Quotes
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Header card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <ShoppingCart className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Quote Details</h2>
            </div>

            {/* Customer */}
            <div>
              <label className={labelCls}>Customer <span className="text-red-400">*</span></label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm text-zinc-100">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                    {selectedCustomer.email && <p className="text-xs text-zinc-500">{selectedCustomer.email}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={e => searchCustomer(e.target.value)}
                    placeholder="Search customer by name…"
                    className={inputCls}
                  />
                  {customerSearching && (
                    <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-zinc-600 border-t-blue-400 rounded-full animate-spin" />
                  )}
                  {customerResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#16213e] border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden">
                      {customerResults.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectCustomer(c)}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/60 transition-colors text-left"
                        >
                          <span className="text-sm text-zinc-100">{c.firstName} {c.lastName}</span>
                          <span className="text-xs text-zinc-500">{c.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Store + Valid Until */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Store <span className="text-red-400">*</span></label>
                <select
                  value={selectedStoreId}
                  onChange={e => setSelectedStoreId(e.target.value)}
                  onFocus={loadStores}
                  className={inputCls + ' cursor-pointer'}
                  required
                >
                  <option value="">Select store…</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/40 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Line Items</h2>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-zinc-600">
                No items yet.{' '}
                <button type="button" onClick={addLine} className="text-blue-400 hover:text-blue-300">
                  Add one
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-20">Qty</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-28">Unit Price</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-20">Disc %</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-28">Total</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map(l => (
                      <tr key={l._key} className="border-b border-zinc-800/20">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={l.description || l.productName}
                            onChange={e => updateLine(l._key, 'description', e.target.value)}
                            placeholder="Product or service description…"
                            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={l.quantity}
                            onChange={e => updateLine(l._key, 'quantity', e.target.value)}
                            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1.5 text-sm text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={l.unitPrice}
                            onChange={e => updateLine(l._key, 'unitPrice', e.target.value)}
                            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1.5 text-sm text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={l.discountPct}
                            onChange={e => updateLine(l._key, 'discountPct', e.target.value)}
                            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1.5 text-sm text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-zinc-100 tabular-nums font-semibold">
                          ${l.lineTotal.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeLine(l._key)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700/50">
                      <td colSpan={4} className="px-4 py-2 text-right text-[11px] text-zinc-500">Subtotal</td>
                      <td className="px-3 py-2 text-right text-sm text-zinc-300 tabular-nums">${subtotal.toFixed(2)}</td>
                      <td />
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-[11px] text-zinc-500">Discount</td>
                      <td className="px-3 py-2 text-right text-sm text-amber-400 tabular-nums">-${discountAmount.toFixed(2)}</td>
                      <td />
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-[11px] text-zinc-500">Tax (10%)</td>
                      <td className="px-3 py-2 text-right text-sm text-zinc-300 tabular-nums">${taxAmount.toFixed(2)}</td>
                      <td />
                    </tr>
                    <tr className="bg-zinc-800/20">
                      <td colSpan={4} className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        Total
                      </td>
                      <td className="px-3 py-2.5 text-right text-base font-bold text-zinc-100 tabular-nums">
                        ${total.toFixed(2)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Notes & Terms */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800/40 pb-3">Notes & Terms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Quote Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Notes for the customer…"
                  rows={3}
                  className={inputCls + ' resize-none'}
                />
              </div>
              <div>
                <label className={labelCls}>Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  placeholder="Quote terms…"
                  rows={3}
                  className={inputCls + ' resize-none'}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/quotes"
              className="px-4 py-2 rounded text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating…' : 'Create Quote'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
