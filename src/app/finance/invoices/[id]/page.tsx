'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  lineAmount: number
  taxAmount: number
  accountCode: string | null
}

interface Settlement {
  id: string
  settledAmount: number
  discountTaken: number
  paymentRef: string | null
  settledAt: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  invoiceDate: string
  dueDate: string
  postingDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  notes: string | null
  customer: Customer
  lines: InvoiceLine[]
  settlements: Settlement[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))
}

const statusBadge: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-400',
  posted: 'bg-blue-500/10 text-blue-400',
  partial: 'bg-amber-500/10 text-amber-400',
  paid: 'bg-emerald-500/10 text-emerald-400',
  void: 'bg-red-500/10 text-red-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

const inputCls =
  'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
const labelCls =
  'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

// ── Component ─────────────────────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const invoiceId = params.id

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Payment modal
  const [showPayment, setShowPayment] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payRef, setPayRef] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [submittingPay, setSubmittingPay] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  // Void confirmation modal
  const [showVoid, setShowVoid] = useState(false)
  const [voidPin, setVoidPin] = useState('')
  const [voidReason, setVoidReason] = useState('')
  const [submittingVoid, setSubmittingVoid] = useState(false)
  const [voidError, setVoidError] = useState<string | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const loadInvoice = useCallback(() => {
    setLoading(true)
    fetch(`/api/finance/invoices/${invoiceId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load invoice')
        return r.json()
      })
      .then((d: { invoice: Invoice }) => setInvoice(d.invoice))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load invoice')
      )
      .finally(() => setLoading(false))
  }, [invoiceId])

  useEffect(() => {
    loadInvoice()
  }, [loadInvoice])

  async function handlePost() {
    try {
      const res = await fetch(`/api/finance/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'posted' }),
      })
      const data = await res.json() as { invoice?: Invoice; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to post invoice')
      setInvoice(data.invoice ?? null)
      notify('Invoice posted', 'ok')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Error', 'err')
    }
  }

  async function handleRecordPayment() {
    setPayError(null)
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) {
      setPayError('Enter a valid payment amount')
      return
    }
    setSubmittingPay(true)
    try {
      const res = await fetch(`/api/finance/invoices/${invoiceId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method: payMethod,
          reference: payRef.trim() || null,
          notes: payNotes.trim() || null,
        }),
      })
      const data = await res.json() as { invoice?: Invoice; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to record payment')
      setInvoice(data.invoice ?? null)
      setShowPayment(false)
      setPayAmount('')
      setPayRef('')
      setPayNotes('')
      notify('Payment recorded', 'ok')
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmittingPay(false)
    }
  }

  async function handleVoid() {
    setVoidError(null)
    if (!voidReason.trim()) {
      setVoidError('Reason is required')
      return
    }
    if (voidPin.trim().length < 4) {
      setVoidError('Manager PIN must be at least 4 digits')
      return
    }
    setSubmittingVoid(true)
    try {
      const res = await fetch(`/api/finance/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'void' }),
      })
      const data = await res.json() as { invoice?: Invoice; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to void invoice')
      setInvoice(data.invoice ?? null)
      setShowVoid(false)
      setVoidPin('')
      setVoidReason('')
      notify('Invoice voided', 'ok')
    } catch (err) {
      setVoidError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmittingVoid(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar
          title="Invoice"
          breadcrumb={[
            { label: 'Finance', href: '/finance' },
            { label: 'Invoices', href: '/finance/invoices' },
          ]}
          showBack
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar
          title="Invoice"
          breadcrumb={[
            { label: 'Finance', href: '/finance' },
            { label: 'Invoices', href: '/finance/invoices' },
          ]}
          showBack
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-sm text-zinc-400">{error ?? 'Invoice not found'}</p>
            <Link
              href="/finance/invoices"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Back to invoices
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const balance = Math.max(0, invoice.totalAmount - invoice.paidAmount)
  const isOverdue =
    new Date(invoice.dueDate) < new Date() && !['paid', 'void', 'cancelled'].includes(invoice.status)
  const canPost = invoice.status === 'draft'
  const canPay = ['posted', 'partial'].includes(invoice.status)
  const canVoid = ['draft', 'posted', 'partial'].includes(invoice.status)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={invoice.invoiceNumber}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Invoices', href: '/finance/invoices' },
        ]}
        showBack
      />

      {/* Toast */}
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

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold text-zinc-100">
                  {invoice.invoiceNumber}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                    statusBadge[invoice.status] ?? 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {invoice.status}
                </span>
                {isOverdue && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">
                    OVERDUE
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-300 font-medium">
                {invoice.customer.firstName} {invoice.customer.lastName}
              </p>
              {invoice.customer.email && (
                <p className="text-xs text-zinc-500">{invoice.customer.email}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {canPost && (
                <button
                  type="button"
                  onClick={handlePost}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                >
                  Post Invoice
                </button>
              )}
              {canPay && (
                <button
                  type="button"
                  onClick={() => setShowPayment(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                >
                  Record Payment
                </button>
              )}
              {canVoid && (
                <button
                  type="button"
                  onClick={() => setShowVoid(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-700 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                >
                  Void
                </button>
              )}
            </div>
          </div>

          {/* Date row */}
          <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-zinc-800/50">
            <div>
              <p className={labelCls}>Invoice Date</p>
              <p className="text-sm text-zinc-200">{fmtDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className={labelCls}>Due Date</p>
              <p className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-200'}`}>
                {fmtDate(invoice.dueDate)}
              </p>
            </div>
            <div>
              <p className={labelCls}>Posting Date</p>
              <p className="text-sm text-zinc-200">{fmtDate(invoice.postingDate)}</p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50">
            <span className="text-sm font-semibold text-zinc-100">Line Items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-20">Qty</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-28">Unit Price</th>
                  <th className="text-right px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-28">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {invoice.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-zinc-800/20">
                    <td className="px-5 py-3 text-zinc-200">{line.description}</td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-400 tabular-nums">{line.quantity}</td>
                    <td className="px-3 py-3 text-right font-mono text-zinc-400 tabular-nums">
                      {formatCurrency(line.unitPrice)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-zinc-200 font-semibold tabular-nums">
                      {formatCurrency(line.lineAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Totals */}
          <div className="border-t border-zinc-800/50 bg-zinc-900/30 px-5 py-4 space-y-2">
            <div className="flex justify-end gap-12 text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-mono text-zinc-300 tabular-nums w-28 text-right">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-end gap-12 text-sm">
                <span className="text-zinc-500">Tax</span>
                <span className="font-mono text-zinc-300 tabular-nums w-28 text-right">
                  {formatCurrency(invoice.taxAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-12 text-sm border-t border-zinc-800/50 pt-2">
              <span className="text-zinc-100 font-semibold">Total</span>
              <span className="font-mono text-zinc-100 font-bold tabular-nums w-28 text-right">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payments table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50">
            <span className="text-sm font-semibold text-zinc-100">Payments Recorded</span>
          </div>
          {invoice.settlements.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-zinc-500">No payments recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {invoice.settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-800/20">
                      <td className="px-5 py-3 text-zinc-300 text-sm">{fmtDate(s.settledAt)}</td>
                      <td className="px-3 py-3 text-right font-mono text-emerald-400 font-semibold tabular-nums">
                        {formatCurrency(s.settledAmount)}
                      </td>
                      <td className="px-3 py-3 text-zinc-500 text-xs font-mono">
                        {s.paymentRef ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Balance due */}
        <div
          className={`bg-[#16213e] border rounded-lg p-6 flex items-center justify-between ${
            balance > 0 && !['void', 'cancelled'].includes(invoice.status)
              ? 'border-red-500/30'
              : 'border-zinc-800/50'
          }`}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Balance Due</p>
            <p className="text-xs text-zinc-500">Paid: {formatCurrency(invoice.paidAmount)}</p>
          </div>
          <span
            className={`text-3xl font-bold font-mono tabular-nums ${
              balance > 0 && !['void', 'cancelled'].includes(invoice.status)
                ? 'text-red-400'
                : 'text-emerald-400'
            }`}
          >
            {formatCurrency(balance)}
          </span>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className={labelCls}>Notes</p>
            <p className="text-sm text-zinc-300">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* ── Record Payment Modal ─────────────────────────── */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100">Record Payment</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPayment(false)
                  setPayError(null)
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Amount</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={`${inputCls} font-mono`}
                  placeholder={formatCurrency(balance)}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Method</label>
                <select
                  className={inputCls}
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="ach">ACH / Bank Transfer</option>
                  <option value="wire">Wire</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Reference # (optional)</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Check #, wire ref..."
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Notes (optional)</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Optional memo"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                />
              </div>
              {payError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded p-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{payError}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setShowPayment(false)
                  setPayError(null)
                }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                disabled={submittingPay}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded transition-colors min-w-[120px] justify-center"
              >
                {submittingPay ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Record Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Void Confirmation Modal ──────────────────────── */}
      {showVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#16213e] border border-red-700/40 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-red-400">Void Invoice</h3>
              <button
                type="button"
                onClick={() => {
                  setShowVoid(false)
                  setVoidError(null)
                  setVoidPin('')
                  setVoidReason('')
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">
                  Voiding <span className="font-mono font-bold">{invoice.invoiceNumber}</span> is
                  irreversible. This action requires manager approval.
                </p>
              </div>
              <div>
                <label className={labelCls}>Void Reason</label>
                <select
                  className={inputCls}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                >
                  <option value="">— Select reason —</option>
                  <option value="duplicate">Duplicate invoice</option>
                  <option value="error">Entry error</option>
                  <option value="customer_dispute">Customer dispute</option>
                  <option value="cancelled_order">Cancelled order</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Manager PIN</label>
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Min 4 digits"
                  value={voidPin}
                  onChange={(e) => setVoidPin(e.target.value)}
                  maxLength={8}
                />
              </div>
              {voidError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded p-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{voidError}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setShowVoid(false)
                  setVoidError(null)
                  setVoidPin('')
                  setVoidReason('')
                }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVoid}
                disabled={submittingVoid || !voidReason || voidPin.length < 4}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors min-w-[120px] justify-center"
              >
                {submittingVoid ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Voiding...
                  </>
                ) : (
                  'Confirm Void'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
