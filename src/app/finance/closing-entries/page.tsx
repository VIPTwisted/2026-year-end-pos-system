'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { CheckCircle, RefreshCw, Archive, AlertTriangle } from 'lucide-react'

interface ClosingEntry {
  id: string
  fiscalYear: string
  accountNo: string
  accountName: string | null
  closingAmount: number
  retainedEarningsAccountNo: string | null
  status: string
  postedAt: string | null
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function ClosingEntriesPage() {
  const [entries, setEntries] = useState<ClosingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString())
  const [retainedEarningsAcct, setRetainedEarningsAcct] = useState('3900')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/closing-entries')
      .then(r => r.json())
      .then(d => setEntries(d.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const generateEntries = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/finance/closing-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscalYear, retainedEarningsAccountNo: retainedEarningsAcct, action: 'generate' }),
      })
      if (!res.ok) throw new Error('Failed')
      const d = await res.json()
      notify(`Generated ${d.count ?? 0} closing entries`)
      load()
    } catch {
      notify('Failed to generate entries', 'err')
    } finally {
      setGenerating(false)
    }
  }

  const postAllEntries = async () => {
    const ready = entries.filter(e => e.status === 'ready')
    if (!ready.length) { notify('No ready entries to post', 'err'); return }
    setPosting(true)
    try {
      const res = await fetch('/api/finance/closing-entries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'post', fiscalYear }),
      })
      if (!res.ok) throw new Error('Failed')
      notify('Year-end closing entries posted successfully')
      load()
    } catch {
      notify('Failed to post entries', 'err')
    } finally {
      setPosting(false)
    }
  }

  const readyEntries = entries.filter(e => e.status === 'ready')
  const postedEntries = entries.filter(e => e.status === 'posted')
  const totalClosing = readyEntries.reduce((s, e) => s + e.closingAmount, 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Year-End Closing Entries"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={generateEntries} disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-40 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} /> {generating ? 'Generating…' : 'Create Entries'}
            </button>
            <button onClick={postAllEntries} disabled={posting || !readyEntries.length}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> {posting ? 'Posting…' : 'Post All'}
            </button>
          </div>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Warning */}
        <div className="flex items-start gap-3 px-4 py-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-0.5">Year-End Close — Irreversible Action</p>
            <p className="text-xs text-zinc-400">
              Posting closing entries will zero out all income statement accounts (Revenue and Expense) and transfer the net income to the Retained Earnings account. This action cannot be undone. Ensure all transactions for the fiscal year are posted before proceeding.
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-zinc-100 mb-4">Close Parameters</h2>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Fiscal Year</label>
              <input type="text" value={fiscalYear} onChange={e => setFiscalYear(e.target.value)} placeholder="2025"
                className="w-28 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Retained Earnings Account</label>
              <input type="text" value={retainedEarningsAcct} onChange={e => setRetainedEarningsAcct(e.target.value)} placeholder="3900"
                className="w-32 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono" />
            </div>
            <div className="pb-0.5">
              <p className="text-xs text-zinc-500">Net income will be transferred to account <span className="text-zinc-300 font-mono">{retainedEarningsAcct}</span></p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Ready to Post</div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">{readyEntries.length}</div>
            <div className="text-xs text-zinc-500 mt-1">accounts to close</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Already Posted</div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">{postedEntries.length}</div>
            <div className="text-xs text-zinc-500 mt-1">entries completed</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Net Closing Amount</div>
            <div className={`text-xl font-bold tabular-nums ${totalClosing >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(totalClosing)}</div>
            <div className="text-xs text-zinc-500 mt-1">to retained earnings</div>
          </div>
        </div>

        {/* Entries table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Closing Entries — FY {fiscalYear}</h2>
            <span className="text-xs text-zinc-500">{entries.length} accounts</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center">
              <Archive className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500 mb-2">No closing entries generated yet.</p>
              <p className="text-xs text-zinc-600 mb-4">Click "Create Entries" to generate closing entries from income statement accounts.</p>
              <button onClick={generateEntries} disabled={generating}
                className="px-4 py-2 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-40 transition-colors">
                {generating ? 'Generating…' : 'Create Entries'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Fiscal Year', 'Account No.', 'Account Name', 'Closing Amount', 'Retained Earnings Acct', 'Status', 'Posted At'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {entries.map(e => (
                    <tr key={e.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{e.fiscalYear}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-blue-400">{e.accountNo}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-300">{e.accountName ?? '—'}</td>
                      <td className={`px-4 py-2.5 tabular-nums text-sm text-right font-bold ${e.closingAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmt(e.closingAmount)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{e.retainedEarningsAccountNo ?? retainedEarningsAcct}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${e.status === 'posted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-zinc-500">
                        {e.postedAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(e.postedAt)) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700/50 bg-zinc-900/30">
                    <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-zinc-400 text-right">Net to Retained Earnings</td>
                    <td className={`px-4 py-3 tabular-nums text-sm font-bold text-right ${totalClosing >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmt(totalClosing)}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
