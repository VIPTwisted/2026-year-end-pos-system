'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react'

interface Customer { id: string; firstName: string; lastName: string; email: string | null }
interface Store { id: string; name: string }
interface Product { id: string; name: string; sku: string; salePrice: number }

interface QuoteLine {
  productId: string
  description: string
  quantity: number
  unitPrice: number
  discountPct: number
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </label>
  )
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 ${className}`}
      {...props}
    />
  )
}

function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export default function NewQuotePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [storeId, setStoreId] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [lines, setLines] = useState<QuoteLine[]>([
    { productId: '', description: '', quantity: 1, unitPrice: 0, discountPct: 0 },
  ])

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([c, s, p]) => {
      setCustomers(Array.isArray(c) ? c : [])
      setStores(Array.isArray(s) ? s : [])
      setProducts(Array.isArray(p) ? p : [])
      if (Array.isArray(s) && s.length > 0) setStoreId(s[0].id)
    }).catch(() => setError('Failed to load data'))
  }, [])

  // Customer typeahead filter
  const filteredCustomers = customerSearch.trim().length > 0
    ? customers.filter(c =>
        `${c.firstName} ${c.lastName} ${c.email ?? ''}`.toLowerCase().includes(customerSearch.toLowerCase())
      ).slice(0, 8)
    : customers.slice(0, 8)

  const updateLine = useCallback((idx: number, field: keyof QuoteLine, value: string | number) => {
    setLines(prev => {
      const next = [...prev]
      if (field === 'productId') {
        const prod = products.find(p => p.id === value)
        next[idx] = { ...next[idx], productId: value as string, unitPrice: prod?.salePrice ?? 0 }
      } else {
        next[idx] = { ...next[idx], [field]: value }
      }
      return next
    })
  }, [products])

  const addLine = () => setLines(prev => [
    ...prev,
    { productId: '', description: '', quantity: 1, unitPrice: 0, discountPct: 0 },
  ])

  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
  const discountTotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice * (l.discountPct / 100), 0)
  const taxAmount = (subtotal - discountTotal) * 0.1
  const total = subtotal - discountTotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId || !storeId) { setError('Customer and store are required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sales/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          storeId,
          validUntil: validUntil || null,
          notes: notes || null,
          internalNotes: internalNotes || null,
          lines: lines.map((l, i) => ({ ...l, sortOrder: i })),
        }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Failed to create quote')
      }
      const q = await res.json() as { id: string }
      router.push(`/sales/quotes/${q.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Sales Quote" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          <Link
            href="/sales/quotes"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotes
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100">New Sales Quote</h1>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-xs text-red-300">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Header card */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Quote Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Customer typeahead */}
                <div className="flex flex-col gap-1.5 lg:col-span-2">
                  <Label>Customer *</Label>
                  <Input
                    type="text"
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search customer..."
                  />
                  {customerSearch.length > 0 && !customerId && (
                    <div className="bg-zinc-900 border border-zinc-700 rounded overflow-hidden max-h-48 overflow-y-auto mt-1">
                      {filteredCustomers.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-zinc-500">No results</p>
                      ) : filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCustomerId(c.id)
                            setCustomerSearch(`${c.firstName} ${c.lastName}`)
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
                        >
                          {c.firstName} {c.lastName}
                          {c.email && <span className="ml-2 text-zinc-500">{c.email}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {customerId && (
                    <button
                      type="button"
                      onClick={() => { setCustomerId(''); setCustomerSearch('') }}
                      className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors text-left"
                    >
                      ✕ Clear customer
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Store *</Label>
                  <Select value={storeId} onChange={e => setStoreId(e.target.value)} required>
                    <option value="">Select store...</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={e => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Line Items card */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Line Items</p>
                <button
                  type="button"
                  onClick={addLine}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/50">
                    <tr>
                      {['Product', 'Description', 'Qty', 'Unit Price', 'Disc %', 'Line Total', ''].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${
                            h === 'Product' || h === 'Description' ? 'text-left' : h === '' ? '' : 'text-right'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {lines.map((line, idx) => {
                      const lineTotal = line.quantity * line.unitPrice * (1 - line.discountPct / 100)
                      return (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            <select
                              value={line.productId}
                              onChange={e => updateLine(idx, 'productId', e.target.value)}
                              className="w-44 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select...</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={line.description}
                              onChange={e => updateLine(idx, 'description', e.target.value)}
                              placeholder="Optional description"
                              className="w-36 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={line.quantity}
                              onChange={e => updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={line.discountPct}
                              onChange={e => updateLine(idx, 'discountPct', parseFloat(e.target.value) || 0)}
                              className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-right text-xs font-semibold text-emerald-400 tabular-nums">
                            {fmt(lineTotal)}
                          </td>
                          <td className="px-4 py-2">
                            {lines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLine(idx)}
                                className="text-zinc-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes + Totals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Notes card */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Notes</p>
                <div className="flex flex-col gap-1.5">
                  <Label>Customer Notes</Label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Notes visible to customer..."
                    className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Internal Notes</Label>
                  <textarea
                    value={internalNotes}
                    onChange={e => setInternalNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal use only..."
                    className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Totals card */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Totals</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Subtotal</span>
                    <span className="text-zinc-300 tabular-nums">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Discount</span>
                    <span className="text-amber-400 tabular-nums">-{fmt(discountTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Tax (10%)</span>
                    <span className="text-zinc-300 tabular-nums">{fmt(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-zinc-700">
                    <span className="text-zinc-100">Total</span>
                    <span className="text-emerald-400 tabular-nums">{fmt(total)}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !customerId || !storeId}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Quote'}
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>
      </main>
    </>
  )
}
