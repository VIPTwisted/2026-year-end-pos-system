'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, FileText, CheckCircle2, XCircle, Send,
  ArrowRightCircle, Trash2, User, Store as StoreIcon, Calendar,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuoteLine {
  id: string
  productId: string | null
  quantity: number
  unitPrice: number
  discountPct: number
  lineTotal: number
  description: string | null
  product: { id: string; name: string; sku: string; salePrice: number } | null
}

interface QuoteDetail {
  id: string
  quoteNumber: string
  status: string
  customerId: string | null
  storeId: string
  validUntil: string | null
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  notes: string | null
  terms: string | null
  convertedOrderId: string | null
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
  } | null
  store: { id: string; name: string; address: string | null; city: string | null; state: string | null }
  lines: QuoteLine[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700/60 text-zinc-400',
    sent: 'bg-blue-500/10 text-blue-400',
    accepted: 'bg-emerald-500/10 text-emerald-400',
    rejected: 'bg-red-500/10 text-red-400',
    expired: 'bg-amber-500/10 text-amber-400',
    converted: 'bg-violet-500/10 text-violet-400',
  }
  return map[status] ?? 'bg-zinc-700/60 text-zinc-400'
}

function fmtDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
      <div className="text-sm text-zinc-100">{value ?? '—'}</div>
    </div>
  )
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmCls,
  onClose,
  onConfirm,
  loading,
}: {
  title: string
  message: string
  confirmLabel: string
  confirmCls: string
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#16213e] border border-zinc-700/60 rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="px-5 py-4 border-b border-zinc-800/50">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-zinc-300 mb-5">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded text-sm font-medium text-white transition-colors disabled:opacity-50 ${confirmCls}`}
            >
              {loading ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [modal, setModal] = useState<'convert' | 'delete' | 'send' | null>(null)

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then(r => r.json())
      .then((d: QuoteDetail) => setQuote(d))
      .catch(() => notify('Failed to load quote', false))
      .finally(() => setLoading(false))
  }, [id, notify])

  const patch = useCallback(async (body: Record<string, unknown>) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Update failed')
      setQuote(data as QuoteDetail)
      return true
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : 'Update failed', false)
      return false
    } finally {
      setActionLoading(false)
    }
  }, [id, notify])

  const handleSend = async () => {
    const ok = await patch({ status: 'sent' })
    if (ok) { notify('Quote marked as sent'); setModal(null) }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error((d as { error?: string }).error ?? 'Delete failed')
      }
      notify('Quote deleted')
      setModal(null)
      setTimeout(() => router.push('/quotes'), 800)
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : 'Delete failed', false)
      setActionLoading(false)
    }
  }

  const handleConvertToOrder = async () => {
    // Mark quote as converted (the actual order creation is a separate flow)
    const ok = await patch({ status: 'converted' })
    if (ok) {
      notify('Quote marked as converted')
      setModal(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
        <TopBar title="Quote" showBack />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
        <TopBar title="Quote Not Found" showBack />
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
          Quote not found.{' '}
          <Link href="/quotes" className="text-blue-400 ml-1 hover:text-blue-300">Back to list</Link>
        </div>
      </div>
    )
  }

  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date() && !['converted', 'accepted'].includes(quote.status)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar
        title={quote.quoteNumber}
        breadcrumb={[{ label: 'Quotes', href: '/quotes' }]}
        showBack
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl transition-all ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {modal === 'send' && (
        <ConfirmModal
          title="Mark as Sent"
          message="Mark this quote as sent to the customer? Status will change to Sent."
          confirmLabel="Mark Sent"
          confirmCls="bg-blue-600 hover:bg-blue-700"
          onClose={() => setModal(null)}
          onConfirm={handleSend}
          loading={actionLoading}
        />
      )}
      {modal === 'convert' && (
        <ConfirmModal
          title="Convert to Order"
          message="Mark this quote as converted to a sales order? This will update the quote status to Converted."
          confirmLabel="Convert"
          confirmCls="bg-emerald-600 hover:bg-emerald-700"
          onClose={() => setModal(null)}
          onConfirm={handleConvertToOrder}
          loading={actionLoading}
        />
      )}
      {modal === 'delete' && (
        <ConfirmModal
          title="Delete Draft Quote"
          message="This will permanently delete this draft quote and all its line items. This cannot be undone."
          confirmLabel="Delete"
          confirmCls="bg-red-600 hover:bg-red-700"
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-5">
        <Link
          href="/quotes"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Quotes
        </Link>

        {/* Expiry warning */}
        {isExpired && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
            <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm text-amber-300">
              This quote expired on <strong>{fmtDate(quote.validUntil)}</strong>.
            </span>
          </div>
        )}

        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-zinc-100 font-mono">{quote.quoteNumber}</h1>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusBadge(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">Created {fmtDate(quote.createdAt)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {quote.status === 'draft' && (
                <>
                  <button
                    onClick={() => setModal('send')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Mark Sent
                  </button>
                  <button
                    onClick={() => setModal('delete')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-red-700/50 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
              )}
              {quote.status === 'sent' && (
                <>
                  <button
                    onClick={() => patch({ status: 'accepted' }).then(ok => ok && notify('Quote accepted'))}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => patch({ status: 'rejected' }).then(ok => ok && notify('Quote rejected'))}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-red-700/50 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </>
              )}
              {quote.status === 'accepted' && !quote.convertedOrderId && (
                <button
                  onClick={() => setModal('convert')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5" />
                  Convert to Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Customer */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <User className="w-4 h-4 text-zinc-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</span>
            </div>
            {quote.customer ? (
              <>
                <Field label="Name" value={`${quote.customer.firstName} ${quote.customer.lastName}`} />
                <Field label="Email" value={quote.customer.email ?? '—'} />
                <Field label="Phone" value={quote.customer.phone ?? '—'} />
                <Link href={`/customers/${quote.customer.id}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  View customer profile →
                </Link>
              </>
            ) : (
              <p className="text-sm text-zinc-500">No customer linked</p>
            )}
          </div>

          {/* Store */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <StoreIcon className="w-4 h-4 text-zinc-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Store</span>
            </div>
            <Field label="Store Name" value={quote.store.name} />
            {quote.store.address && (
              <Field label="Address" value={[quote.store.address, quote.store.city, quote.store.state].filter(Boolean).join(', ')} />
            )}
          </div>

          {/* Dates & Totals */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Details</span>
            </div>
            <Field label="Created" value={fmtDate(quote.createdAt)} />
            <Field
              label="Valid Until"
              value={
                quote.validUntil
                  ? <span className={isExpired ? 'text-amber-400' : ''}>{fmtDate(quote.validUntil)}</span>
                  : '—'
              }
            />
            {quote.convertedOrderId && (
              <Field label="Converted Order" value={<span className="font-mono text-violet-400">{quote.convertedOrderId.slice(0, 8)}</span>} />
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/40 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Line Items</h2>
            <span className="text-xs text-zinc-500">{quote.lines.length} line{quote.lines.length !== 1 ? 's' : ''}</span>
          </div>

          {quote.lines.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-600">No line items.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    {['Product / Description', 'Qty', 'Unit Price', 'Disc %', 'Line Total'].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${
                          ['Qty', 'Unit Price', 'Disc %', 'Line Total'].includes(h) ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quote.lines.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/20 hover:bg-zinc-800/10">
                      <td className="px-4 py-3">
                        {l.product ? (
                          <div>
                            <p className="text-sm text-zinc-100">{l.product.name}</p>
                            <p className="text-[11px] text-zinc-500 font-mono">{l.product.sku}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-300">{l.description ?? '—'}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-300 tabular-nums">{Number(l.quantity).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-300 tabular-nums">{formatCurrency(Number(l.unitPrice))}</td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-400 tabular-nums">
                        {Number(l.discountPct) > 0 ? `${Number(l.discountPct).toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-zinc-100 tabular-nums font-semibold">
                        {formatCurrency(Number(l.lineTotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700/30">
                    <td colSpan={4} className="px-4 py-2 text-right text-[11px] text-zinc-500">Subtotal</td>
                    <td className="px-4 py-2 text-right text-sm text-zinc-300 tabular-nums">{formatCurrency(Number(quote.subtotal))}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-[11px] text-zinc-500">Discount</td>
                    <td className="px-4 py-2 text-right text-sm text-amber-400 tabular-nums">-{formatCurrency(Number(quote.discountAmount))}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-[11px] text-zinc-500">Tax</td>
                    <td className="px-4 py-2 text-right text-sm text-zinc-300 tabular-nums">{formatCurrency(Number(quote.taxAmount))}</td>
                  </tr>
                  <tr className="bg-zinc-800/20 border-t border-zinc-700/50">
                    <td colSpan={4} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-zinc-100 tabular-nums">
                      {formatCurrency(Number(quote.total))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Notes & Terms */}
        {(quote.notes || quote.terms) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {quote.notes && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Notes</h2>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
              </div>
            )}
            {quote.terms && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Terms</h2>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{quote.terms}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
