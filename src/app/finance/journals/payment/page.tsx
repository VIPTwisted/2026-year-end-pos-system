'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { BookOpen, Plus } from 'lucide-react'

interface PaymentBatch {
  id: string
  batchName: string
  description: string | null
  batchType: string
  status: string
  createdAt: string
  _count?: { lines: number }
}

const STATUS_CLS: Record<string, string> = {
  open: 'bg-amber-500/10 text-amber-400',
  posted: 'bg-emerald-500/10 text-emerald-400',
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))
}

export default function PaymentJournalPage() {
  const [batches, setBatches] = useState<PaymentBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/journals/payment')
      .then(r => r.json())
      .then(d => setBatches(d.batches ?? []))
      .catch(() => setBatches([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const createBatch = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/finance/journals/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchName: newName.trim(), batchType: 'Payment' }),
      })
      if (!res.ok) throw new Error('Failed')
      notify('Batch created')
      setNewName('')
      setShowNew(false)
      load()
    } catch {
      notify('Failed to create batch', 'err')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Payment Journals"
        breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Journals', href: '/finance/journals/general' }]}
        actions={
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Batch
          </button>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Info bar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#16213e] border border-zinc-800/50">
          <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-zinc-400">
            Payment Journals are used to post outgoing payments to vendors and apply them to open invoices. Each batch can contain multiple journal lines.
          </p>
        </div>

        {/* New batch inline form */}
        {showNew && (
          <div className="bg-[#16213e] border border-blue-600/30 rounded-lg p-5 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Batch Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createBatch()}
                placeholder="e.g. PAYJNL-001"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <button
              onClick={createBatch}
              disabled={creating || !newName.trim()}
              className="px-4 py-2 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => { setShowNew(false); setNewName('') }}
              className="px-3 py-2 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Batches table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Journal Batches</h2>
            <span className="text-xs text-zinc-500">{batches.length} batches</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : batches.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500 mb-3">No payment journal batches yet.</p>
              <button onClick={() => setShowNew(true)} className="text-xs text-blue-400 hover:text-blue-300">
                Create your first batch →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Batch Name', 'Description', 'Type', 'Lines', 'Created', 'Status', ''].map(h => (
                      <th key={h} className={`px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${h === '' ? '' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {batches.map(b => (
                    <tr key={b.id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-5 py-3">
                        <Link href={`/finance/journals/payment/${b.id}`} className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded hover:text-blue-300">
                          {b.batchName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{b.description ?? '—'}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{b.batchType}</td>
                      <td className="px-5 py-3 tabular-nums text-sm text-zinc-300">{b._count?.lines ?? 0}</td>
                      <td className="px-5 py-3 text-sm text-zinc-500">{fmtDate(b.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CLS[b.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/finance/journals/payment/${b.id}`} className="px-3 py-1 rounded text-[11px] font-medium bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 transition-colors">
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
