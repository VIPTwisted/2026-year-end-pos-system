'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface QuoteLine {
  id: string
  productName: string
  sku: string | null
  qty: number
  listPrice: number
  quotedPrice: number
  lineTotal: number
  notes: string | null
}

interface Quote {
  id: string
  quoteNumber: string
  org: { id: string; name: string; accountNumber: string }
  contactName: string | null
  status: string
  validUntil: string | null
  subtotal: number
  discount: number
  tax: number
  total: number
  notes: string | null
  rejectionReason: string | null
  lines: QuoteLine[]
  createdAt: string
  updatedAt: string
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  submitted: 'bg-blue-900/60 text-blue-300',
  'under-review': 'bg-yellow-900/60 text-yellow-300',
  approved: 'bg-green-900/60 text-green-300',
  rejected: 'bg-red-900/60 text-red-300',
  expired: 'bg-zinc-700 text-zinc-400',
  converted: 'bg-purple-900/60 text-purple-300',
}

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/b2b/quotes/${id}`)
      const data = await res.json()
      setQuote(data)
    } catch {
      setError('Failed to load quote')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line

  async function doAction(action: 'submit' | 'approve' | 'convert') {
    setActionLoading(true)
    try {
      await fetch(`/api/b2b/quotes/${id}/${action}`, { method: 'POST' })
      load()
    } finally {
      setActionLoading(false)
    }
  }

  async function doReject() {
    setActionLoading(true)
    try {
      await fetch(`/api/b2b/quotes/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      setShowRejectModal(false)
      load()
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading...</div>
  if (!quote) return <div className="p-6 text-red-400">Quote not found</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/b2b/quotes" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-4 h-4" /></Link>
        <FileText className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-zinc-100 font-mono">{quote.quoteNumber}</h1>
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[quote.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {quote.status}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {quote.status === 'draft' && (
            <button onClick={() => doAction('submit')} disabled={actionLoading} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              Submit for Review
            </button>
          )}
          {quote.status === 'submitted' && (
            <>
              <button onClick={() => doAction('approve')} disabled={actionLoading} className="flex items-center gap-1 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-1 px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 rounded-lg text-sm font-medium">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </>
          )}
          {quote.status === 'approved' && (
            <button onClick={() => doAction('convert')} disabled={actionLoading} className="flex items-center gap-1 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              <RefreshCw className="w-4 h-4" /> Convert to Order
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}

      {/* Info Row */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-zinc-500">Organization: </span>
          <Link href={`/b2b/organizations/${quote.org?.id}`} className="text-blue-400 hover:text-blue-300">{quote.org?.name}</Link>
          <span className="text-zinc-600 font-mono text-xs ml-1">({quote.org?.accountNumber})</span>
        </div>
        {quote.contactName && (
          <div>
            <span className="text-zinc-500">Contact: </span>
            <span className="text-zinc-300">{quote.contactName}</span>
          </div>
        )}
        {quote.validUntil && (
          <div>
            <span className="text-zinc-500">Valid Until: </span>
            <span className="text-zinc-300">{new Date(quote.validUntil).toLocaleDateString()}</span>
          </div>
        )}
        <div>
          <span className="text-zinc-500">Created: </span>
          <span className="text-zinc-400 text-xs">{new Date(quote.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Rejection Reason */}
      {quote.status === 'rejected' && quote.rejectionReason && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-300 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-200">{quote.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Lines */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <span className="text-sm font-semibold text-zinc-200">Line Items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">SKU</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">List Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Quoted Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Disc %</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-zinc-500 text-xs">No line items</td></tr>
              ) : quote.lines.map(line => {
                const discPct = line.listPrice > 0 ? ((line.listPrice - line.quotedPrice) / line.listPrice * 100) : 0
                return (
                  <tr key={line.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-4 py-3 text-zinc-100 font-medium">{line.productName}</td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{line.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{line.qty}</td>
                    <td className="px-4 py-3 text-right text-zinc-400 font-mono text-xs">${line.listPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-zinc-100 font-mono text-xs">${line.quotedPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-mono ${discPct > 0 ? 'text-green-400' : 'text-zinc-500'}`}>{discPct.toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-100 font-mono text-xs font-semibold">${line.lineTotal.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals + Notes */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Totals</p>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Subtotal</span>
            <span className="text-zinc-300 font-mono">${quote.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Discount</span>
            <span className="text-green-400 font-mono">{quote.discount > 0 ? `-$${quote.discount.toFixed(2)}` : '$0.00'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Tax</span>
            <span className="text-zinc-300 font-mono">${quote.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-zinc-800 pt-2 mt-2">
            <span className="text-zinc-100">Total</span>
            <span className="text-zinc-100 font-mono">${quote.total.toFixed(2)}</span>
          </div>
        </div>

        {quote.notes && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-zinc-300">{quote.notes}</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Reject Quote</h3>
            </div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Rejection reason (optional)..."
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 resize-none focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3">
              <button onClick={doReject} disabled={actionLoading} className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                Confirm Reject
              </button>
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
