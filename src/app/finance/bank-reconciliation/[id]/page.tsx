'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import {
  CheckCircle, Wand2, RotateCcw, Plus, Check, X,
  Building2,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReconciliationLine {
  id: string
  reconciliationId: string
  transactionDate: string | null
  description: string | null
  statementAmount: number
  appliedAmount: number
  difference: number
  matched: boolean
  type: string
  status: string
  createdAt: string
}

interface Reconciliation {
  id: string
  bankAccountId: string
  statementDate: string
  statementNo: string | null
  openingBalance: number
  closingBalance: number
  status: string
  notes: string | null
  lines: ReconciliationLine[]
}

const fmtC = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const fmtD = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

// ─── Simulated ledger entries (bank account side) ────────────────────────────

function genLedgerEntries(recon: Reconciliation | null) {
  if (!recon) return []
  const d = recon.statementDate.slice(0, 10)
  return [
    { id: 'le1', date: d, no: 'PMT-0001', description: 'Vendor payment — Office Depot', amount: -1250.00, applied: false },
    { id: 'le2', date: d, no: 'REC-0001', description: 'Customer receipt — TechCorp', amount: 4500.00, applied: false },
    { id: 'le3', date: d, no: 'PMT-0002', description: 'Bank fee — Wire transfer', amount: -35.00, applied: false },
    { id: 'le4', date: d, no: 'REC-0002', description: 'Customer receipt — GlobalTrade', amount: 8200.00, applied: false },
    { id: 'le5', date: d, no: 'PMT-0003', description: 'Payroll disbursement', amount: -12500.00, applied: false },
  ]
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BankReconciliationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reconId = params?.id as string

  const [recon, setRecon] = useState<Reconciliation | null>(null)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [matching, setMatching] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Left panel — bank account ledger entries
  const [ledgerEntries, setLedgerEntries] = useState<Array<{
    id: string; date: string; no: string; description: string; amount: number; applied: boolean
  }>>([])

  // Right panel — bank statement lines
  const [stmtLines, setStmtLines] = useState<Array<{
    id: string; date: string; description: string; credit: number; debit: number; matched: boolean
  }>>([])

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/finance/bank-reconciliation/${reconId}`)
      .then(r => r.json())
      .then(d => {
        if (d.reconciliation) {
          const r = d.reconciliation as Reconciliation
          setRecon(r)
          setLedgerEntries(genLedgerEntries(r))
          const lines = (r.lines ?? []).map((l: ReconciliationLine) => ({
            id: l.id,
            date: l.transactionDate?.slice(0, 10) ?? r.statementDate?.slice(0, 10) ?? '',
            description: l.description ?? '',
            credit: l.statementAmount > 0 ? l.statementAmount : 0,
            debit: l.statementAmount < 0 ? Math.abs(l.statementAmount) : 0,
            matched: l.matched,
          }))
          if (lines.length === 0) {
            const today = r.statementDate.slice(0, 10)
            setStmtLines([
              { id: 'sl1', date: today, description: 'Opening deposit', credit: 4500.00, debit: 0, matched: false },
              { id: 'sl2', date: today, description: 'Vendor payment', credit: 0, debit: 1250.00, matched: false },
              { id: 'sl3', date: today, description: 'Wire transfer fee', credit: 0, debit: 35.00, matched: false },
              { id: 'sl4', date: today, description: 'Customer receipt', credit: 8200.00, debit: 0, matched: false },
              { id: 'sl5', date: today, description: 'Payroll', credit: 0, debit: 12500.00, matched: false },
            ])
          } else {
            setStmtLines(lines)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [reconId])

  useEffect(() => { load() }, [load])

  const toggleLedger = (id: string) => {
    setLedgerEntries(prev => prev.map(e => e.id === id ? { ...e, applied: !e.applied } : e))
  }

  const toggleStmt = (id: string) => {
    setStmtLines(prev => prev.map(l => l.id === id ? { ...l, matched: !l.matched } : l))
  }

  const autoMatch = () => {
    setMatching(true)
    setTimeout(() => {
      setLedgerEntries(prev => prev.map(e => ({ ...e, applied: true })))
      setStmtLines(prev => prev.map(l => ({ ...l, matched: true })))
      notify('Auto-match complete — entries matched')
      setMatching(false)
    }, 900)
  }

  const postRecon = async () => {
    if (!recon) return
    setPosting(true)
    try {
      const res = await fetch(`/api/finance/bank-reconciliation/${reconId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'post' }),
      })
      if (!res.ok) throw new Error()
      notify('Reconciliation posted successfully')
      load()
    } catch {
      notify('Post failed', 'err')
    } finally {
      setPosting(false)
    }
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const depositsOutstanding = ledgerEntries
    .filter(e => !e.applied && e.amount > 0)
    .reduce((s, e) => s + e.amount, 0)
  const paymentsOutstanding = ledgerEntries
    .filter(e => !e.applied && e.amount < 0)
    .reduce((s, e) => s + Math.abs(e.amount), 0)
  const stmtBalance = recon?.closingBalance ?? 0
  const adjustedBankBalance = stmtBalance + depositsOutstanding - paymentsOutstanding
  const glBalance = recon?.openingBalance ?? 0
  const difference = adjustedBankBalance - glBalance
  const isBalanced = Math.abs(difference) < 0.01
  const isPosted = recon?.status === 'completed'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Bank Account Reconciliation"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Bank Reconciliation', href: '/finance/bank-reconciliation' },
        ]}
        actions={
          !isPosted ? (
            <div className="flex items-center gap-1.5">
              <button onClick={autoMatch} disabled={matching}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-violet-700/40 text-violet-300 border border-violet-700/40 hover:bg-violet-700/60 disabled:opacity-40 transition-colors">
                <Wand2 className="w-3 h-3" /> {matching ? 'Matching…' : 'Match Automatically'}
              </button>
              <button onClick={() => router.push('/finance/bank-reconciliation')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                <RotateCcw className="w-3 h-3" /> Undo Last Posting
              </button>
              <button onClick={postRecon} disabled={posting || !isBalanced}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                <CheckCircle className="w-3 h-3" /> {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          ) : (
            <span className="text-xs text-emerald-400 font-medium px-3 py-1.5 rounded bg-emerald-900/20 border border-emerald-800/40">
              Completed — Read Only
            </span>
          )
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden p-5 gap-4">
        {loading ? (
          <div className="py-20 text-center text-sm text-zinc-500">Loading…</div>
        ) : !recon ? (
          <div className="py-20 text-center text-sm text-red-400">Reconciliation not found.</div>
        ) : (
          <>
            {/* Header card */}
            <div className="bg-[#16213e] border border-zinc-700 rounded-lg px-5 py-4 grid grid-cols-2 md:grid-cols-5 gap-5 shrink-0">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Bank Account No.</div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-sm font-mono text-zinc-100">{recon.bankAccountId}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Statement No.</div>
                <div className="text-sm font-mono text-zinc-100">{recon.statementNo ?? '—'}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Statement Date</div>
                <div className="text-sm text-zinc-100">{fmtD(recon.statementDate)}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Balance Last Statement</div>
                <div className="text-sm font-mono tabular-nums text-zinc-300">{fmtC(recon.openingBalance)}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Statement Ending Balance</div>
                <div className="text-sm font-mono tabular-nums font-semibold text-zinc-100">{fmtC(recon.closingBalance)}</div>
              </div>
            </div>

            {/* Two-panel work area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">
              {/* Left: Bank Account Ledger Entries */}
              <div className="bg-[#16213e] border border-zinc-700 rounded-lg flex flex-col min-h-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Bank Account Ledger Entries</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Click to toggle applied status</p>
                  </div>
                  <span className="text-xs text-zinc-500">{ledgerEntries.filter(e => e.applied).length}/{ledgerEntries.length} applied</span>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-zinc-900/90 border-b border-zinc-800 z-10">
                      <tr>
                        <th className="w-8 px-3 py-2.5 text-zinc-600"></th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Date</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">No.</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Description</th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Amount</th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.map((e, i) => (
                        <tr key={e.id} onClick={() => !isPosted && toggleLedger(e.id)}
                          className={`border-b border-zinc-800/40 cursor-pointer transition-colors ${e.applied ? 'bg-emerald-900/10' : i % 2 === 0 ? '' : 'bg-zinc-900/20'} hover:bg-zinc-800/30`}>
                          <td className="px-3 py-2.5">
                            <input type="checkbox" checked={e.applied} readOnly className="w-3.5 h-3.5 accent-emerald-500 pointer-events-none" />
                          </td>
                          <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{fmtD(e.date)}</td>
                          <td className="px-3 py-2.5 font-mono text-zinc-300">{e.no}</td>
                          <td className="px-3 py-2.5 text-zinc-400 max-w-[180px] truncate">{e.description}</td>
                          <td className={`px-3 py-2.5 font-mono tabular-nums text-right font-medium ${e.amount >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                            {fmtC(e.amount)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {e.applied
                              ? <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                              : <X className="w-3.5 h-3.5 text-zinc-600 mx-auto" />
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Bank Statement Lines */}
              <div className="bg-[#16213e] border border-zinc-700 rounded-lg flex flex-col min-h-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Bank Statement Lines</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Click row to match/unmatch</p>
                  </div>
                  {!isPosted && (
                    <button
                      onClick={() => {
                        const today = recon.statementDate.slice(0, 10)
                        setStmtLines(prev => [
                          ...prev,
                          { id: `new-${Date.now()}`, date: today, description: '', credit: 0, debit: 0, matched: false },
                        ])
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-zinc-700/60 text-zinc-300 hover:bg-zinc-700 transition-colors">
                      <Plus className="w-3 h-3" /> Add Line
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-zinc-900/90 border-b border-zinc-800 z-10">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Date</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Description</th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Credit</th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Debit</th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Difference</th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Matched</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stmtLines.map((l, i) => {
                        const diff = l.credit - l.debit
                        return (
                          <tr key={l.id} onClick={() => !isPosted && toggleStmt(l.id)}
                            className={`border-b border-zinc-800/40 cursor-pointer transition-colors ${l.matched ? 'bg-emerald-900/10' : i % 2 === 0 ? '' : 'bg-zinc-900/20'} hover:bg-zinc-800/30`}>
                            <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">
                              {isPosted ? fmtD(l.date) : (
                                <input type="date" value={l.date} onClick={e => e.stopPropagation()}
                                  onChange={e => setStmtLines(prev => prev.map(s => s.id === l.id ? { ...s, date: e.target.value } : s))}
                                  className="bg-transparent text-zinc-100 border-none focus:outline-none focus:bg-zinc-800/50 rounded px-1 w-[110px] text-xs" />
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              {isPosted ? (
                                <span className="text-zinc-400">{l.description}</span>
                              ) : (
                                <input value={l.description} onClick={e => e.stopPropagation()}
                                  onChange={e => setStmtLines(prev => prev.map(s => s.id === l.id ? { ...s, description: e.target.value } : s))}
                                  placeholder="Description"
                                  className="bg-transparent text-zinc-100 border-none focus:outline-none focus:bg-zinc-800/50 rounded px-1 w-full placeholder:text-zinc-600 text-xs" />
                              )}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums text-right font-mono text-emerald-300">
                              {l.credit > 0 ? fmtC(l.credit) : '—'}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums text-right font-mono text-red-400">
                              {l.debit > 0 ? fmtC(l.debit) : '—'}
                            </td>
                            <td className={`px-3 py-2.5 tabular-nums text-right font-mono font-medium ${Math.abs(diff) < 0.01 ? 'text-zinc-500' : diff > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {fmtC(diff)}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {l.matched
                                ? <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                                : <X className="w-3.5 h-3.5 text-zinc-600 mx-auto" />
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="bg-[#16213e] border border-zinc-700 rounded-lg px-5 py-4 shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Statement Balance</div>
                  <div className="text-sm font-mono tabular-nums font-semibold text-zinc-100">{fmtC(stmtBalance)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Deposits Outstanding</div>
                  <div className="text-sm font-mono tabular-nums text-emerald-300">+ {fmtC(depositsOutstanding)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Payments Outstanding</div>
                  <div className="text-sm font-mono tabular-nums text-red-400">- {fmtC(paymentsOutstanding)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Adjusted Bank Balance</div>
                  <div className="text-sm font-mono tabular-nums font-semibold text-zinc-100">{fmtC(adjustedBankBalance)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">G/L Balance</div>
                  <div className="text-sm font-mono tabular-nums text-zinc-300">{fmtC(glBalance)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Difference</div>
                  <div className={`text-sm font-mono tabular-nums font-bold px-2 py-0.5 rounded inline-block ${isBalanced ? 'text-emerald-400 bg-emerald-900/20' : 'text-red-400 bg-red-900/20'}`}>
                    {fmtC(Math.abs(difference))}
                  </div>
                </div>
              </div>
              {!isBalanced && (
                <p className="text-xs text-red-400">Adjusted bank balance does not match G/L balance. Apply all outstanding transactions before posting.</p>
              )}
              {isBalanced && (
                <p className="text-xs text-emerald-400">Balanced — adjusted bank balance matches G/L balance. Ready to post.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
