'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Check, X, AlertCircle } from 'lucide-react'

interface Quote {
  id: string
  quoteNumber: string
  org: { id: string; name: string; accountNumber: string }
  contactName: string | null
  status: string
  validUntil: string | null
  total: number
  createdAt: string
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

const TABS = ['All', 'Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Expired', 'Converted']
const TAB_STATUS: Record<string, string> = {
  All: '',
  Draft: 'draft',
  Submitted: 'submitted',
  'Under Review': 'under-review',
  Approved: 'approved',
  Rejected: 'rejected',
  Expired: 'expired',
  Converted: 'converted',
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function load(tab = activeTab) {
    setLoading(true)
    try {
      const status = TAB_STATUS[tab]
      const params = status ? `?status=${status}` : ''
      const res = await fetch('/api/b2b/quotes' + params)
      const data = await res.json()
      setQuotes(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [activeTab]) // eslint-disable-line

  async function doAction(id: string, action: 'submit' | 'approve' | 'convert') {
    setActionLoading(id)
    try {
      await fetch(`/api/b2b/quotes/${id}/${action}`, { method: 'POST' })
      load()
    } finally {
      setActionLoading(null)
    }
  }

  async function doReject() {
    if (!rejectModal) return
    setActionLoading(rejectModal.id)
    try {
      await fetch(`/api/b2b/quotes/${rejectModal.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      setRejectModal(null)
      setRejectReason('')
      load()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-zinc-100">B2B Quotes</h1>
        </div>
        <Link href="/b2b/quotes/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Quote
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
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Quote #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Organization</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Contact</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Valid Until</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : quotes.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No quotes found</td></tr>
              ) : quotes.map(q => (
                <tr key={q.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3">
                    <Link href={`/b2b/quotes/${q.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{q.quoteNumber}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-100 text-xs font-medium">{q.org?.name ?? '—'}</div>
                    <div className="text-zinc-600 text-xs font-mono">{q.org?.accountNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{q.contactName ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-zinc-300 font-mono text-xs">
                    ${q.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[q.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/b2b/quotes/${q.id}`} className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded">View</Link>
                      {q.status === 'draft' && (
                        <button
                          onClick={() => doAction(q.id, 'submit')}
                          disabled={actionLoading === q.id}
                          className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-900/30 rounded disabled:opacity-50"
                        >Submit</button>
                      )}
                      {q.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => doAction(q.id, 'approve')}
                            disabled={actionLoading === q.id}
                            className="px-2 py-1 text-xs text-green-400 hover:bg-green-900/30 rounded disabled:opacity-50"
                          >Approve</button>
                          <button
                            onClick={() => setRejectModal({ id: q.id })}
                            className="px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 rounded"
                          >Reject</button>
                        </>
                      )}
                      {q.status === 'approved' && (
                        <button
                          onClick={() => doAction(q.id, 'convert')}
                          disabled={actionLoading === q.id}
                          className="px-2 py-1 text-xs text-purple-400 hover:bg-purple-900/30 rounded disabled:opacity-50"
                        >Convert</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
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
              <button
                onClick={doReject}
                disabled={actionLoading !== null}
                className="flex items-center gap-1 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                <X className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
