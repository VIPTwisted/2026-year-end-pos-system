'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Req {
  id: string
  reqNumber: string
  org: { id: string; name: string; accountNumber: string }
  requestedBy: string | null
  status: string
  totalAmount: number
  createdAt: string
  approvals: Array<{ status: string; approverName: string }>
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  'pending-approval': 'bg-orange-900/60 text-orange-300',
  approved: 'bg-green-900/60 text-green-300',
  rejected: 'bg-red-900/60 text-red-300',
  ordered: 'bg-purple-900/60 text-purple-300',
}

const TABS = ['All', 'Draft', 'Pending Approval', 'Approved', 'Rejected', 'Ordered']
const TAB_STATUS: Record<string, string> = {
  All: '',
  Draft: 'draft',
  'Pending Approval': 'pending-approval',
  Approved: 'approved',
  Rejected: 'rejected',
  Ordered: 'ordered',
}

export default function RequisitionsPage() {
  const [reqs, setReqs] = useState<Req[]>([])
  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [approveModal, setApproveModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [approverName, setApproverName] = useState('')
  const [comments, setComments] = useState('')

  async function load(tab = activeTab) {
    setLoading(true)
    try {
      const status = TAB_STATUS[tab]
      const params = status ? `?status=${status}` : ''
      const res = await fetch('/api/b2b/requisitions' + params)
      setReqs(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [activeTab]) // eslint-disable-line

  async function doSubmit(id: string) {
    setActionLoading(id)
    try {
      await fetch(`/api/b2b/requisitions/${id}/submit`, { method: 'POST' })
      load()
    } finally {
      setActionLoading(null)
    }
  }

  async function doApproveReject() {
    if (!approveModal || !approverName) return
    setActionLoading(approveModal.id)
    try {
      const endpoint = approveModal.action === 'approve' ? 'approve' : 'reject'
      await fetch(`/api/b2b/requisitions/${approveModal.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverName, comments, reason: comments }),
      })
      setApproveModal(null)
      setApproverName('')
      setComments('')
      load()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-zinc-100">B2B Requisitions</h1>
        </div>
        <Link href="/b2b/requisitions/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Requisition
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Req #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Organization</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Requested By</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Approval</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : reqs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No requisitions found</td></tr>
              ) : reqs.map(req => (
                <tr key={req.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3">
                    <Link href={`/b2b/requisitions/${req.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{req.reqNumber}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-100 text-xs font-medium">{req.org?.name ?? '—'}</div>
                    <div className="text-zinc-600 font-mono text-xs">{req.org?.accountNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{req.requestedBy ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-zinc-300 font-mono text-xs">
                    ${req.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[req.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {req.approvals?.[0] ? (
                      <span className={`text-xs ${req.approvals[0].status === 'approved' ? 'text-green-400' : req.approvals[0].status === 'rejected' ? 'text-red-400' : 'text-orange-400'}`}>
                        {req.approvals[0].status}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/b2b/requisitions/${req.id}`} className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded">View</Link>
                      {req.status === 'draft' && (
                        <button
                          onClick={() => doSubmit(req.id)}
                          disabled={actionLoading === req.id}
                          className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-900/30 rounded disabled:opacity-50"
                        >Submit</button>
                      )}
                      {req.status === 'pending-approval' && (
                        <>
                          <button
                            onClick={() => setApproveModal({ id: req.id, action: 'approve' })}
                            className="px-2 py-1 text-xs text-green-400 hover:bg-green-900/30 rounded"
                          >Approve</button>
                          <button
                            onClick={() => setApproveModal({ id: req.id, action: 'reject' })}
                            className="px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 rounded"
                          >Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve/Reject Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 space-y-4">
            <div className="flex items-center gap-2">
              {approveModal.action === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <h3 className="text-sm font-semibold text-zinc-100 capitalize">{approveModal.action} Requisition</h3>
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
              <label className="block text-xs text-zinc-500 mb-1">Comments</label>
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
                onClick={doApproveReject}
                disabled={!approverName || actionLoading !== null}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 text-white ${approveModal.action === 'approve' ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}`}
              >
                {approveModal.action === 'approve' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Confirm
              </button>
              <button
                onClick={() => { setApproveModal(null); setApproverName(''); setComments('') }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
