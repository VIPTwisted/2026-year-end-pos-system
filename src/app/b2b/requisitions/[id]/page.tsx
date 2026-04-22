'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ClipboardList, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ReqLine {
  id: string
  productName: string
  sku: string | null
  qty: number
  unitPrice: number
  lineTotal: number
  notes: string | null
}

interface Approval {
  id: string
  approverName: string
  approverEmail: string | null
  status: string
  comments: string | null
  actedAt: string | null
  createdAt: string
}

interface Req {
  id: string
  reqNumber: string
  org: { id: string; name: string; accountNumber: string }
  requestedBy: string | null
  status: string
  totalAmount: number
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  lines: ReqLine[]
  approvals: Approval[]
  createdAt: string
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  'pending-approval': 'bg-orange-900/60 text-orange-300',
  approved: 'bg-green-900/60 text-green-300',
  rejected: 'bg-red-900/60 text-red-300',
  ordered: 'bg-purple-900/60 text-purple-300',
}

const APPROVAL_BADGE: Record<string, string> = {
  pending: 'bg-orange-900/40 text-orange-300',
  approved: 'bg-green-900/40 text-green-300',
  rejected: 'bg-red-900/40 text-red-300',
}

export default function ReqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [req, setReq] = useState<Req | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [approvalModal, setApprovalModal] = useState<'approve' | 'reject' | null>(null)
  const [approverName, setApproverName] = useState('')
  const [comments, setComments] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/b2b/requisitions/${id}`)
      setReq(await res.json())
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line

  async function doSubmit() {
    setActionLoading(true)
    try {
      await fetch(`/api/b2b/requisitions/${id}/submit`, { method: 'POST' })
      load()
    } finally {
      setActionLoading(false)
    }
  }

  async function doApprovalAction() {
    if (!approvalModal || !approverName) return
    setActionLoading(true)
    try {
      const endpoint = approvalModal === 'approve' ? 'approve' : 'reject'
      await fetch(`/api/b2b/requisitions/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverName, comments, reason: comments }),
      })
      setApprovalModal(null)
      setApproverName('')
      setComments('')
      load()
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading...</div>
  if (!req) return <div className="p-6 text-red-400">Requisition not found</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/b2b/requisitions" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-4 h-4" /></Link>
        <ClipboardList className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-zinc-100 font-mono">{req.reqNumber}</h1>
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[req.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {req.status}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {req.status === 'draft' && (
            <button onClick={doSubmit} disabled={actionLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              Submit for Approval
            </button>
          )}
          {req.status === 'pending-approval' && (
            <>
              <button
                onClick={() => setApprovalModal('approve')}
                className="flex items-center gap-1 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => setApprovalModal('reject')}
                className="flex items-center gap-1 px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 rounded-lg text-sm font-medium"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>}

      {/* Info Row */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-zinc-500">Organization: </span>
          <Link href={`/b2b/organizations/${req.org?.id}`} className="text-blue-400 hover:text-blue-300">{req.org?.name}</Link>
          <span className="text-zinc-600 font-mono text-xs ml-1">({req.org?.accountNumber})</span>
        </div>
        {req.requestedBy && (
          <div><span className="text-zinc-500">Requested By: </span><span className="text-zinc-300">{req.requestedBy}</span></div>
        )}
        <div><span className="text-zinc-500">Created: </span><span className="text-zinc-400 text-xs">{new Date(req.createdAt).toLocaleDateString()}</span></div>
      </div>

      {/* Rejection Reason */}
      {req.status === 'rejected' && req.rejectionReason && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-300 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-200">{req.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Lines */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <span className="text-sm font-semibold text-zinc-200">Line Items</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">SKU</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Qty</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Unit Price</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {req.lines.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-zinc-500 text-xs">No line items</td></tr>
            ) : req.lines.map(line => (
              <tr key={line.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="px-4 py-3 text-zinc-100 font-medium">{line.productName}</td>
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{line.sku ?? '—'}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{line.qty}</td>
                <td className="px-4 py-3 text-right text-zinc-300 font-mono text-xs">${line.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-zinc-100 font-mono text-xs font-semibold">${line.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <div className="text-base font-bold">
            <span className="text-zinc-400 mr-4">Total:</span>
            <span className="text-zinc-100 font-mono">${req.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Approval Chain */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800">
          <span className="text-sm font-semibold text-zinc-200">Approval Chain</span>
        </div>
        {req.approvals.length === 0 ? (
          <div className="px-4 py-6 text-center text-zinc-500 text-xs">No approval records yet</div>
        ) : (
          <div className="p-4 space-y-3">
            {req.approvals.map((a, idx) => (
              <div key={a.id} className="flex items-start gap-4 p-3 bg-zinc-800/40 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400 font-mono">{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-200">{a.approverName}</span>
                    {a.approverEmail && <span className="text-xs text-zinc-500">{a.approverEmail}</span>}
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${APPROVAL_BADGE[a.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {a.status}
                    </span>
                    {a.actedAt && <span className="text-xs text-zinc-600">{new Date(a.actedAt).toLocaleString()}</span>}
                  </div>
                  {a.comments && <p className="text-xs text-zinc-400 mt-1">{a.comments}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 space-y-4">
            <div className="flex items-center gap-2">
              {approvalModal === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <h3 className="text-sm font-semibold text-zinc-100 capitalize">{approvalModal} Requisition</h3>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Approver Name *</label>
              <input
                value={approverName}
                onChange={e => setApproverName(e.target.value)}
                placeholder="Your name..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">{approvalModal === 'reject' ? 'Reason' : 'Comments'}</label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Comments..."
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 resize-none focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={doApprovalAction}
                disabled={!approverName || actionLoading}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 text-white ${approvalModal === 'approve' ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}`}
              >
                {approvalModal === 'approve' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Confirm
              </button>
              <button
                onClick={() => { setApprovalModal(null); setApproverName(''); setComments('') }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
