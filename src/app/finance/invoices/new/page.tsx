'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, AlertTriangle, CheckCircle2, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface LineRow {
  key: string
  description: string
  quantity: string
  unitPrice: string
}

function newLine(): LineRow {
  return { key: crypto.randomUUID(), description: '', quantity: '1', unitPrice: '' }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function plus30() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

const inputCls =
  'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
const labelCls =
  'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

export default function NewInvoicePage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Step 1 — Customer
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Step 2 — Dates
  const [invoiceDate, setInvoiceDate] = useState(todayStr)
  const [dueDate, setDueDate] = useState(plus30)

  // Step 3 — Lines
  const [lines, setLines] = useState<LineRow[]>([newLine()])

  // Step 4 — Notes
  const [notes, setNotes] = useState('')

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then((d: { customers?: Customer[]; items?: Customer[] } | Customer[]) => {
        const list = Array.isArray(d)
          ? d
          : (d as { customers?: Customer[]; items?: Customer[] }).customers ??
            (d as { customers?: Customer[]; items?: Customer[] }).items ??
            []
        setCustomers(list)
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoadingCustomers(false))
  }, [])

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase()
    return (
      !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    )
  })

  // Line helpers
  function updateLine(key: string, field: keyof Omit<LineRow, 'key'>, value: string) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, [field]: value } : l)))
  }
  function addLine() {
    setLines((prev) => [...prev, newLine()])
  }
  function removeLine(key: string) {
    if (lines.length <= 1) return
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  const subtotal = lines.reduce(
    (s, l) => s + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0),
    0
  )

  const validLines = lines.filter(
    (l) => l.description.trim() && parseFloat(l.quantity) > 0 && parseFloat(l.unitPrice) >= 0
  )

  // Step validators
  const step1Valid = !!selectedCustomer
  const step2Valid = !!invoiceDate && !!dueDate
  const step3Valid = validLines.length > 0

  async function handleSubmit() {
    setFormError(null)
    setSubmitting(true)
    try {
      const payload = {
        customerId: selectedCustomer!.id,
        invoiceDate: new Date(invoiceDate + 'T12:00:00').toISOString(),
        dueDate: new Date(dueDate + 'T12:00:00').toISOString(),
        items: validLines.map((l) => ({
          description: l.description.trim(),
          quantity: parseFloat(l.quantity),
          unitPrice: parseFloat(l.unitPrice),
        })),
        notes: notes.trim() || null,
      }

      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json() as { invoice?: { id: string }; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to create invoice')

      notify('Invoice created', 'ok')
      setTimeout(() => router.push(`/finance/invoices/${data.invoice!.id}`), 800)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setFormError(msg)
      notify(msg, 'err')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Invoice"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Invoices', href: '/finance/invoices' },
        ]}
        showBack
      />

      {toast && (
        <div
          className={`fixed top-16 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {toast.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {['Customer', 'Dates', 'Line Items', 'Notes', 'Review'].map((label, i) => {
            const n = i + 1
            const active = n === step
            const done = n < step
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : done
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      active ? 'bg-white/20' : done ? 'bg-emerald-500/20' : 'bg-zinc-700'
                    }`}
                  >
                    {done ? '✓' : n}
                  </span>
                  {label}
                </div>
                {i < 4 && <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />}
              </div>
            )
          })}
        </div>

        {/* STEP 1 — Select Customer */}
        {step === 1 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Select Customer</h2>
            <div>
              <label className={labelCls}>Search</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Name or email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            {loadingCustomers ? (
              <div className="flex items-center gap-2 text-zinc-500 text-sm py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading customers...
              </div>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {filteredCustomers.slice(0, 30).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCustomer(c)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded text-left transition-colors ${
                      selectedCustomer?.id === c.id
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                        : 'bg-zinc-900/40 border border-zinc-800/40 text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="font-medium text-sm">
                      {c.firstName} {c.lastName}
                    </span>
                    {c.email && (
                      <span className="text-xs text-zinc-500">{c.email}</span>
                    )}
                    {selectedCustomer?.id === c.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
                {filteredCustomers.length === 0 && (
                  <p className="text-sm text-zinc-500 text-center py-8">No customers found.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Dates */}
        {step === 2 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
            <h2 className="text-sm font-semibold text-zinc-100">Invoice Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Invoice Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Due Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <p className="text-[11px] text-zinc-600 mt-1">Default: Net 30</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Line Items */}
        {step === 3 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-100">Line Items</span>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Description
                    </th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-24">
                      Qty
                    </th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-32">
                      Unit Price
                    </th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-32">
                      Line Total
                    </th>
                    <th className="w-10 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {lines.map((line) => {
                    const lineTotal =
                      (parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0)
                    return (
                      <tr key={line.key} className="hover:bg-zinc-800/20">
                        <td className="px-5 py-2.5">
                          <input
                            type="text"
                            className={inputCls}
                            placeholder="Description of service or product"
                            value={line.description}
                            onChange={(e) => updateLine(line.key, 'description', e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={`${inputCls} font-mono text-right`}
                            placeholder="1"
                            value={line.quantity}
                            onChange={(e) => updateLine(line.key, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={`${inputCls} font-mono text-right`}
                            placeholder="0.00"
                            value={line.unitPrice}
                            onChange={(e) => updateLine(line.key, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="font-mono text-sm text-zinc-200 tabular-nums">
                            {formatCurrency(lineTotal)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => removeLine(line.key)}
                            disabled={lines.length <= 1}
                            className="text-zinc-700 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-zinc-800/50 bg-zinc-900/30 px-5 py-3 flex items-center justify-end gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Subtotal
              </span>
              <span className="font-mono text-base font-bold text-zinc-100 tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>
        )}

        {/* STEP 4 — Notes */}
        {step === 4 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Notes</h2>
            <div>
              <label className={labelCls}>Internal Notes (optional)</label>
              <textarea
                rows={5}
                className={`${inputCls} resize-none`}
                placeholder="Payment terms, special instructions, memo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-100">Review Invoice</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Customer:</span>{' '}
                  <span className="text-zinc-100 font-medium">
                    {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Invoice Date:</span>{' '}
                  <span className="text-zinc-100">{invoiceDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Due Date:</span>{' '}
                  <span className="text-zinc-100">{dueDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Lines:</span>{' '}
                  <span className="text-zinc-100">{validLines.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Qty</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Unit Price</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {validLines.map((l) => (
                    <tr key={l.key}>
                      <td className="px-5 py-2.5 text-zinc-200">{l.description}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-zinc-400">{l.quantity}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-zinc-400">
                        {formatCurrency(parseFloat(l.unitPrice) || 0)}
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono text-zinc-200 font-semibold tabular-nums">
                        {formatCurrency((parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-zinc-700 bg-zinc-900/40 px-5 py-3 flex justify-end gap-6">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Total</span>
                <span className="font-mono text-lg font-bold text-zinc-100 tabular-nums">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            {notes && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Notes</p>
                <p className="text-sm text-zinc-300">{notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Error banner */}
        {formError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{formError}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <Link
              href="/finance/invoices"
              className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </Link>
          </div>

          {step < 5 && (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !step1Valid) ||
                (step === 2 && !step2Valid) ||
                (step === 3 && !step3Valid)
              }
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 5 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors min-w-[160px] justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
