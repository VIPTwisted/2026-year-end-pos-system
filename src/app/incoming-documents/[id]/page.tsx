'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Inbox, Link2, CheckCircle, XCircle, X } from 'lucide-react'

interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  lineAmount: number
  taxAmount: number
  accountCode: string | null
}

interface VendorInvoiceDetail {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  postingDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  status: string
  matchingStatus: string
  poId: string | null
  journalEntryId: string | null
  notes: string | null
  vendor: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
  lines: InvoiceLine[]
}

const STATUS_MAP: Record<string, { label: string; style: string }> = {
  draft:      { label: 'Received',   style: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  posted:     { label: 'Processing', style: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  matched:    { label: 'Matched',    style: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
  paid:       { label: 'Posted',     style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  cancelled:  { label: 'Rejected',   style: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  partial:    { label: 'Processing', style: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function IncomingDocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [doc, setDoc] = useState<VendorInvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'approve' | 'reject' | 'match' | null>(null)
  const [processing, setProcessing] = useState(false)
  const [poInput, setPoInput] = useState('')

  function load() {
    fetch(`/api/incoming-documents/${id}`)
      .then(r => r.json())
      .then(d => { setDoc(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(status: string, extra: Record<string, unknown> = {}) {
    setProcessing(true)
    const res = await fetch(`/api/incoming-documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extra }),
    })
    if (res.ok) { setModal(null); load() }
    setProcessing(false)
  }

  if (loading) {
    return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-zinc-500 text-sm">Loading…</div>
  }
  if (!doc) {
    return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-red-400 text-sm">Document not found.</div>
  }

  const statusInfo = STATUS_MAP[doc.status]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Inbox className="w-6 h-6 text-violet-400" />
              <h1 className="text-2xl font-semibold text-zinc-100 font-mono">{doc.invoiceNumber}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo?.style ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                {statusInfo?.label ?? doc.status}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1 ml-9">{doc.vendor.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {doc.status === 'draft' && (
              <>
                <button
                  onClick={() => setModal('approve')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => setModal('reject')}
                  className="flex items-center gap-2 bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            {(doc.status === 'draft' || doc.status === 'posted') && (
              <button
                onClick={() => setModal('match')}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Link2 className="w-4 h-4" /> Match to PO
              </button>
            )}
            <button
              onClick={() => router.push('/incoming-documents')}
              className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2 border border-zinc-700/50 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-4">Invoice Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Vendor', value: doc.vendor.name },
              { label: 'Invoice Date', value: new Date(doc.invoiceDate).toLocaleDateString() },
              { label: 'Due Date', value: new Date(doc.dueDate).toLocaleDateString() },
              { label: 'Posting Date', value: new Date(doc.postingDate).toLocaleDateString() },
              { label: 'Subtotal', value: fmt(doc.subtotal) },
              { label: 'Tax', value: fmt(doc.taxAmount) },
              { label: 'Total', value: fmt(doc.totalAmount) },
              { label: 'Paid', value: fmt(doc.paidAmount) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm text-zinc-200 font-medium">{value}</p>
              </div>
            ))}
          </div>
          {doc.poId && (
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Matched PO</p>
              <p className="text-sm text-violet-400 font-mono">{doc.poId}</p>
            </div>
          )}
          {doc.notes && (
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-zinc-300">{doc.notes}</p>
            </div>
          )}
        </div>

        {/* Lines */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/50">
            <h2 className="text-sm font-medium text-zinc-300">Invoice Lines ({doc.lines.length})</h2>
          </div>
          {doc.lines.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No line items.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Qty</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Unit Price</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">Tax</th>
                  <th className="text-right px-4 py-3">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {doc.lines.map(line => (
                  <tr key={line.id} className="hover:bg-zinc-800/20">
                    <td className="px-4 py-3 text-zinc-200">{line.description}</td>
                    <td className="px-4 py-3 text-right text-zinc-400 hidden md:table-cell">{line.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300 hidden md:table-cell">{fmt(line.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-400 hidden lg:table-cell">{fmt(line.taxAmount)}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-200">{fmt(line.lineAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700/50 bg-zinc-900/30">
                  <td colSpan={4} className="px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Total</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-zinc-100">{fmt(doc.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">
                {modal === 'approve' ? 'Approve Document' : modal === 'reject' ? 'Reject Document' : 'Match to PO'}
              </h3>
              <button onClick={() => setModal(null)} className="text-zinc-500 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modal === 'match' && (
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Purchase Order ID</label>
                <input
                  value={poInput}
                  onChange={e => setPoInput(e.target.value)}
                  placeholder="PO-XXXXXXXX"
                  className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>
            )}

            {modal !== 'match' && (
              <p className="text-sm text-zinc-400">
                {modal === 'approve'
                  ? 'Approve this incoming document? Status will be set to Matched.'
                  : 'Reject this document? Status will be set to Rejected.'}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={processing || (modal === 'match' && !poInput.trim())}
                onClick={() => {
                  if (modal === 'approve') updateStatus('matched')
                  else if (modal === 'reject') updateStatus('cancelled')
                  else if (modal === 'match') updateStatus('matched', { poId: poInput.trim(), matchingStatus: 'two_way' })
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  modal === 'reject' ? 'bg-red-600/80 hover:bg-red-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {processing ? 'Processing…' : modal === 'approve' ? 'Approve' : modal === 'reject' ? 'Reject' : 'Match'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
