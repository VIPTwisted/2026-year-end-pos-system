'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ArrowLeftRight, CheckCircle, AlertTriangle, RotateCcw, X } from 'lucide-react'

interface GLEntry {
  id: string
  accountCode: string
  description: string | null
  debit: number
  credit: number
  entityName: string | null
  createdAt: string
  account: {
    accountCode: string
    accountName: string
    accountType: string
  }
}

interface GLJournal {
  id: string
  journalNumber: string
  description: string | null
  postingDate: string
  period: string
  status: string
  postedBy: string | null
  postedAt: string | null
  reversedBy: string | null
  reversedAt: string | null
  createdAt: string
  entries: GLEntry[]
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  posted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  reversed: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type ModalAction = 'post' | 'reverse' | null

export default function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [journal, setJournal] = useState<GLJournal | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalAction>(null)
  const [processing, setProcessing] = useState(false)
  const [actionError, setActionError] = useState('')

  function load() {
    fetch(`/api/general-journals/${id}`)
      .then(r => r.json())
      .then(d => { setJournal(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePost() {
    setProcessing(true)
    setActionError('')
    const res = await fetch(`/api/general-journals/${id}/post`, { method: 'POST' })
    if (res.ok) { setModal(null); load() }
    else { const e = await res.json(); setActionError(e.error ?? 'Failed to post') }
    setProcessing(false)
  }

  async function handleReverse() {
    setProcessing(true)
    setActionError('')
    const res = await fetch(`/api/general-journals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'reversed', reversedBy: 'system', reversedAt: new Date().toISOString() }),
    })
    if (res.ok) { setModal(null); load() }
    else { const e = await res.json(); setActionError(e.error ?? 'Failed to reverse') }
    setProcessing(false)
  }

  if (loading) {
    return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-zinc-500 text-sm">Loading…</div>
  }
  if (!journal) {
    return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-red-400 text-sm">Journal not found.</div>
  }

  const totalDebit = journal.entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = journal.entries.reduce((s, e) => s + e.credit, 0)
  const balanced = Math.abs(totalDebit - totalCredit) <= 0.01

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-semibold text-zinc-100 font-mono">{journal.journalNumber}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[journal.status] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                {journal.status}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1 ml-9">{journal.description ?? 'No description'}</p>
          </div>
          <div className="flex items-center gap-2">
            {journal.status === 'draft' && (
              <button
                onClick={() => setModal('post')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Post
              </button>
            )}
            {journal.status === 'posted' && (
              <button
                onClick={() => setModal('reverse')}
                className="flex items-center gap-2 bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reverse
              </button>
            )}
            <button
              onClick={() => router.push('/general-journals')}
              className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-2 border border-zinc-700/50 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Posting Date', value: new Date(journal.postingDate).toLocaleDateString() },
            { label: 'Period', value: journal.period },
            { label: 'Lines', value: journal.entries.length.toString() },
            { label: 'Created', value: new Date(journal.createdAt).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm text-zinc-200 font-medium">{value}</p>
            </div>
          ))}
          {journal.postedAt && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Posted</p>
              <p className="text-sm text-zinc-200">{new Date(journal.postedAt).toLocaleString()}</p>
            </div>
          )}
          {journal.reversedAt && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Reversed</p>
              <p className="text-sm text-red-400">{new Date(journal.reversedAt).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Balance indicator */}
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${balanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          {balanced
            ? <><CheckCircle className="w-4 h-4" /> Balanced</>
            : <><AlertTriangle className="w-4 h-4" /> Unbalanced — Difference: {fmt(Math.abs(totalDebit - totalCredit))}</>
          }
        </div>

        {/* Lines Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/50">
            <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
              Journal Lines ({journal.entries.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Account</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Cost Center</th>
                <th className="text-right px-4 py-3">Debit</th>
                <th className="text-right px-4 py-3">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {journal.entries.map(e => (
                <tr key={e.id} className="hover:bg-zinc-800/20">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-mono text-xs text-indigo-400">{e.accountCode}</span>
                      <p className="text-xs text-zinc-400 mt-0.5">{e.account.accountName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 text-xs hidden md:table-cell">{e.description ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs hidden lg:table-cell">{e.entityName ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm">{e.debit > 0 ? fmt(e.debit) : ''}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm">{e.credit > 0 ? fmt(e.credit) : ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-700/50 bg-zinc-900/30">
                <td colSpan={3} className="px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">Totals</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-zinc-100">{fmt(totalDebit)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-zinc-100">{fmt(totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>

      {/* Confirmation Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">
                {modal === 'post' ? 'Post Journal?' : 'Reverse Journal?'}
              </h3>
              <button onClick={() => { setModal(null); setActionError('') }} className="text-zinc-500 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400">
              {modal === 'post'
                ? `Post journal ${journal.journalNumber}? This action cannot be easily undone. The journal will be locked.`
                : `Reverse journal ${journal.journalNumber}? Status will be set to reversed.`}
            </p>
            {actionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-3 py-2 rounded-lg">
                {actionError}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setModal(null); setActionError('') }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modal === 'post' ? handlePost : handleReverse}
                disabled={processing}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${modal === 'post' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-red-600/80 hover:bg-red-500 text-white'}`}
              >
                {processing ? 'Processing…' : modal === 'post' ? 'Post' : 'Reverse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
