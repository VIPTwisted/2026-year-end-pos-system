'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

interface VendorInvoiceLine {
  id:          string
  description: string
  quantity:    number
  unitPrice:   number
  lineAmount:  number
  taxAmount:   number
}

interface Settlement {
  id:            string
  settledAmount: number
  discountTaken: number
  settledAt:     string
  payment: {
    id:            string
    paymentNumber: string
    paymentDate:   string
    paymentMethod: string
    amount:        number
    checkNumber:   string | null
  }
}

interface Vendor {
  id:           string
  vendorCode:   string
  name:         string
  email:        string | null
  phone:        string | null
  paymentTerms: string | null
}

interface VendorInvoice {
  id:             string
  invoiceNumber:  string
  vendorId:       string
  invoiceDate:    string
  dueDate:        string
  postingDate:    string
  subtotal:       number
  taxAmount:      number
  totalAmount:    number
  paidAmount:     number
  status:         string
  matchingStatus: string
  poId:           string | null
  notes:          string | null
  createdAt:      string
  updatedAt:      string
  vendor:         Vendor
  lines:          VendorInvoiceLine[]
  settlements:    Settlement[]
}

interface Toast {
  msg:  string
  type: 'ok' | 'err'
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  draft:     'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
  posted:    'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  matched:   'bg-violet-500/15 text-violet-400 border border-violet-500/30',
  partial:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  paid:      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
      <div className="text-[13px] text-zinc-100">{children}</div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VendorBillDetailPage() {
  const params = useParams()
  const id     = params.id as string
  const router = useRouter()

  const [bill,     setBill]     = useState<VendorInvoice | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [toast,    setToast]    = useState<Toast | null>(null)

  // Payment form state
  const [payAmount,  setPayAmount]  = useState('')
  const [payMethod,  setPayMethod]  = useState('Check')
  const [payRef,     setPayRef]     = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [postLoading, setPostLoading] = useState(false)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const fetchBill = useCallback(() => {
    setLoading(true)
    fetch(`/api/purchasing/bills/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json() as Promise<VendorInvoice>
      })
      .then(d => setBill(d))
      .catch(() => notify('Failed to load bill', 'err'))
      .finally(() => setLoading(false))
  }, [id, notify])

  useEffect(() => { fetchBill() }, [fetchBill])

  async function handlePost() {
    if (!bill) return
    setPostLoading(true)
    try {
      const res = await fetch(`/api/vendors/invoices/${id}/post`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Failed to post bill')
      }
      notify('Bill posted to GL')
      fetchBill()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to post', 'err')
    } finally {
      setPostLoading(false)
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!bill) return

    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) { notify('Enter a valid amount', 'err'); return }

    setPayLoading(true)
    try {
      const res = await fetch(`/api/purchasing/bills/${id}/payment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          amount,
          method:    payMethod,
          reference: payRef.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Payment failed')
      }

      notify('Payment recorded')
      setPayAmount('')
      setPayRef('')
      fetchBill()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Payment failed', 'err')
    } finally {
      setPayLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Vendor Bill" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <p className="text-zinc-500 text-sm">Loading bill…</p>
        </main>
      </>
    )
  }

  if (!bill) {
    return (
      <>
        <TopBar title="Vendor Bill" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh] flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-400 text-sm">Bill not found.</p>
          <Button onClick={() => router.push('/purchasing/bills')} className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-4 text-sm">
            Back to Bills
          </Button>
        </main>
      </>
    )
  }

  const balance  = bill.totalAmount - bill.paidAmount
  const overdue  = !['paid', 'cancelled'].includes(bill.status) && new Date(bill.dueDate) < new Date()
  const canPost  = bill.status === 'draft'
  const canPay   = ['posted', 'partial', 'matched'].includes(bill.status) && balance > 0

  return (
    <>
      <TopBar title={bill.invoiceNumber} />
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl border ${
          toast.type === 'ok'
            ? 'bg-emerald-900/90 text-emerald-300 border-emerald-600/40'
            : 'bg-rose-900/90 text-rose-300 border-rose-600/40'
        }`}>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="flex items-start gap-4">
            <Link href="/purchasing/bills">
              <Button variant="ghost" className="h-8 px-2 text-zinc-400 hover:text-zinc-100 mt-0.5">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-zinc-100 font-mono">{bill.invoiceNumber}</h1>
                <span className={`px-2.5 py-0.5 rounded text-[12px] font-medium capitalize ${
                  STATUS_STYLE[bill.status] ?? 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40'
                }`}>
                  {bill.status}
                </span>
                {overdue && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    OVERDUE
                  </span>
                )}
              </div>
              <p className="text-[13px] text-zinc-500 mt-0.5">{bill.vendor.name}</p>
            </div>
            <div className="flex gap-2">
              {canPost && (
                <Button
                  onClick={handlePost}
                  disabled={postLoading}
                  className="h-8 px-4 text-[13px] bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  {postLoading ? 'Posting…' : 'Post Bill'}
                </Button>
              )}
            </div>
          </div>

          {/* ── Bill info grid ───────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Field label="Vendor">
                <Link
                  href={`/purchasing/suppliers/${bill.vendorId}`}
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {bill.vendor.name}
                </Link>
              </Field>
              <Field label="Vendor Code">
                <span className="font-mono text-zinc-400">{bill.vendor.vendorCode}</span>
              </Field>
              <Field label="Bill Date">{formatDate(bill.invoiceDate)}</Field>
              <Field label="Due Date">
                <span className={overdue ? 'text-rose-400 font-semibold' : ''}>
                  {formatDate(bill.dueDate)}
                </span>
              </Field>
              <Field label="Payment Terms">{bill.vendor.paymentTerms ?? '—'}</Field>
              <Field label="PO Reference">
                {bill.poId ? (
                  <span className="font-mono text-zinc-400">{bill.poId}</span>
                ) : '—'}
              </Field>
              <Field label="Matching Status">
                <span className="capitalize">{bill.matchingStatus ?? '—'}</span>
              </Field>
              <Field label="Notes">{bill.notes ?? '—'}</Field>
            </div>
          </div>

          {/* ── Financials ────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total',   value: bill.totalAmount, color: 'text-zinc-100' },
              { label: 'Paid',    value: bill.paidAmount,  color: 'text-emerald-400' },
              { label: 'Balance', value: balance,           color: balance > 0 ? 'text-amber-400' : 'text-zinc-500' },
            ].map(f => (
              <div key={f.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{f.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${f.color}`}>
                  {formatCurrency(f.value)}
                </p>
              </div>
            ))}
          </div>

          {/* ── Line items ────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800/60 px-5 py-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Line Items ({bill.lines.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/60 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-5 py-2 font-medium">Description</th>
                    <th className="text-right py-2 pr-5 font-medium">Qty</th>
                    <th className="text-right py-2 pr-5 font-medium">Unit Price</th>
                    <th className="text-right py-2 pr-5 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.lines.map((l, idx) => (
                    <tr
                      key={l.id}
                      className={`${idx !== bill.lines.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
                    >
                      <td className="px-5 py-2.5 text-zinc-200">{l.description}</td>
                      <td className="py-2.5 pr-5 text-right text-zinc-400 tabular-nums">{l.quantity}</td>
                      <td className="py-2.5 pr-5 text-right text-zinc-400 tabular-nums">
                        {formatCurrency(l.unitPrice)}
                      </td>
                      <td className="py-2.5 pr-5 text-right font-semibold text-zinc-100 tabular-nums">
                        {formatCurrency(l.lineAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700/60 bg-zinc-900/40">
                    <td colSpan={3} className="px-5 py-3 text-right text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">
                      Total
                    </td>
                    <td className="py-3 pr-5 text-right text-lg font-bold text-zinc-100 tabular-nums">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── Payment history ───────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800/60 px-5 py-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Payment History ({bill.settlements.length})
              </h2>
            </div>
            {bill.settlements.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-600 text-[13px]">
                No payments recorded yet
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/60 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-5 py-2 font-medium">Payment #</th>
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Method</th>
                    <th className="text-left py-2 font-medium">Reference</th>
                    <th className="text-right py-2 pr-5 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.settlements.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`${idx !== bill.settlements.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
                    >
                      <td className="px-5 py-2.5 font-mono text-[11px] text-blue-400">{s.payment.paymentNumber}</td>
                      <td className="py-2.5 pr-5 text-zinc-500 text-[11px] whitespace-nowrap">
                        {formatDate(s.payment.paymentDate)}
                      </td>
                      <td className="py-2.5 pr-5 text-zinc-400 capitalize">{s.payment.paymentMethod}</td>
                      <td className="py-2.5 pr-5 text-zinc-500 font-mono text-[11px]">
                        {s.payment.checkNumber ?? '—'}
                      </td>
                      <td className="py-2.5 pr-5 text-right text-emerald-400 font-semibold tabular-nums">
                        {formatCurrency(s.settledAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Record Payment form ───────────────────────────────── */}
          {canPay && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                Record Payment
              </h2>
              <form onSubmit={handlePayment} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Amount */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                    Amount <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    placeholder={formatCurrency(balance).replace('$', '')}
                    min="0.01"
                    step="0.01"
                    max={balance}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 h-9 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none placeholder:text-zinc-600"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                    Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 h-9 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Check">Check</option>
                    <option value="ACH">ACH</option>
                    <option value="Wire">Wire</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                {/* Reference */}
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                    Reference / Check #
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 h-9 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none placeholder:text-zinc-600"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={payLoading}
                    className="w-full h-9 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded disabled:opacity-50"
                  >
                    <DollarSign className="w-4 h-4 mr-1.5" />
                    {payLoading ? 'Saving…' : 'Record Payment'}
                  </Button>
                </div>
              </form>

              {/* Quick-fill balance button */}
              {balance > 0 && (
                <button
                  type="button"
                  onClick={() => setPayAmount(balance.toFixed(2))}
                  className="mt-2 text-[11px] text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  Pay full balance {formatCurrency(balance)}
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
