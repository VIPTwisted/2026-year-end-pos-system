'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface BankAccount {
  id: string
  name: string
  accountCode: string
  bankName: string
  accountNumber: string
  currentBalance: number
  currency: string
}

interface BankTransaction {
  id: string
  date: string
  description: string
  amount: number
  runningBalance: number
  reference: string | null
  category: string | null
  isReconciled: boolean
}

interface BankReconciliation {
  id: string
  statementDate: string
  statementBalance: number
  clearedBalance: number
  difference: number
  status: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function maskAccount(num: string) {
  if (num.length <= 4) return num
  return '•••• ' + num.slice(-4)
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ReconcilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [account, setAccount] = useState<BankAccount | null>(null)
  const [unreconciled, setUnreconciled] = useState<BankTransaction[]>([])
  const [existingRecon, setExistingRecon] = useState<BankReconciliation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const [statementBalance, setStatementBalance] = useState('')
  const [statementDate, setStatementDate] = useState(new Date().toISOString().split('T')[0])
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [acctRes, reconRes] = await Promise.all([
        fetch(`/api/finance/bank-accounts/${id}`),
        fetch(`/api/finance/bank-accounts/${id}/reconcile`),
      ])

      if (!acctRes.ok) throw new Error('Failed to load account')
      const acctData = (await acctRes.json()) as BankAccount

      if (!reconRes.ok) throw new Error('Failed to load reconciliation status')
      const reconData = (await reconRes.json()) as {
        reconciliation: BankReconciliation | null
        unreconciledTransactions: BankTransaction[]
      }

      setAccount(acctData)
      setUnreconciled(reconData.unreconciledTransactions ?? [])
      setExistingRecon(reconData.reconciliation)

      if (reconData.reconciliation) {
        setStatementBalance(String(reconData.reconciliation.statementBalance))
        setStatementDate(
          new Date(reconData.reconciliation.statementDate).toISOString().split('T')[0]
        )
      }
    } catch {
      notify('Failed to load reconciliation data', 'err')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const clearedBalance = useMemo(() => {
    return unreconciled
      .filter((tx) => checkedIds.has(tx.id))
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [unreconciled, checkedIds])

  const statementBalanceNum = parseFloat(statementBalance) || 0
  // difference = statement balance minus the sum of checked (cleared) transactions
  const difference = statementBalanceNum - clearedBalance
  const isBalanced = Math.abs(difference) < 0.005

  function toggleAll() {
    if (checkedIds.size === unreconciled.length) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(unreconciled.map((t) => t.id)))
    }
  }

  function toggleTx(txId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(txId)) {
        next.delete(txId)
      } else {
        next.add(txId)
      }
      return next
    })
  }

  async function startReconciliation() {
    if (!statementBalance) {
      notify('Enter statement balance first', 'err')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/finance/bank-accounts/${id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statementDate,
          statementBalance: parseFloat(statementBalance),
          action: 'start',
          notes: notes || undefined,
        }),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        notify(d.error ?? 'Failed to start reconciliation', 'err')
        return
      }
      notify('Reconciliation started')
      await load()
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function completeReconciliation() {
    if (!isBalanced) {
      notify('Difference must be $0.00 before completing', 'err')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/finance/bank-accounts/${id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statementDate,
          statementBalance: parseFloat(statementBalance),
          action: 'complete',
          clearedTransactionIds: Array.from(checkedIds),
          notes: notes || undefined,
        }),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        notify(d.error ?? 'Failed to complete reconciliation', 'err')
        return
      }
      notify('Reconciliation completed!')
      setTimeout(() => router.push(`/finance/bank-accounts/${id}`), 1000)
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-red-400 text-sm">Account not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Top Bar */}
      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link
          href={`/finance/bank-accounts/${id}`}
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {account.bankName} — {maskAccount(account.accountNumber)}
          </span>
          <h1 className="text-base font-semibold text-zinc-100 leading-tight">Bank Reconciliation</h1>
        </div>
        {existingRecon && (
          <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400">
            Reconciliation in progress
          </span>
        )}
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Statement Controls */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
            Bank Statement
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {/* Statement Balance */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Statement Balance *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={statementBalance}
                  onChange={(e) => setStatementBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded pl-7 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 tabular-nums"
                />
              </div>
            </div>

            {/* Statement Date */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Statement Date *
              </label>
              <input
                type="date"
                value={statementDate}
                onChange={(e) => setStatementDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Notes <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reconciliation notes..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Start button */}
            {!existingRecon && (
              <button
                onClick={startReconciliation}
                disabled={saving || !statementBalance}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {saving ? 'Starting...' : 'Start Reconciliation'}
              </button>
            )}
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Statement Balance</div>
            <div className="text-2xl font-bold tabular-nums text-zinc-100">
              {statementBalance ? formatCurrency(statementBalanceNum, account.currency) : '—'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">From bank statement</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Cleared Balance</div>
            <div className="text-2xl font-bold tabular-nums text-blue-400">
              {formatCurrency(clearedBalance, account.currency)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">{checkedIds.size} transactions checked</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Difference</div>
            <div className={`text-2xl font-bold tabular-nums ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
              {statementBalance ? formatCurrency(difference, account.currency) : '—'}
            </div>
            <div className={`text-xs mt-1 ${isBalanced ? 'text-emerald-500' : 'text-zinc-500'}`}>
              {isBalanced ? 'Balanced — ready to complete' : 'Must reach $0.00 to complete'}
            </div>
          </div>
        </div>

        {/* Unreconciled Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Unreconciled Transactions ({unreconciled.length})
            </div>
            {unreconciled.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {checkedIds.size === unreconciled.length ? 'Uncheck All' : 'Check All'}
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 w-10"></th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reference</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Category</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {unreconciled.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-500 text-sm">
                      No unreconciled transactions. All caught up!
                    </td>
                  </tr>
                ) : (
                  unreconciled.map((tx) => (
                    <tr
                      key={tx.id}
                      className={`border-b border-zinc-800 cursor-pointer transition-colors ${
                        checkedIds.has(tx.id) ? 'bg-blue-500/5' : 'hover:bg-zinc-800/20'
                      }`}
                      onClick={() => toggleTx(tx.id)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checkedIds.has(tx.id)}
                          onChange={() => toggleTx(tx.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-zinc-300 tabular-nums whitespace-nowrap">{fmtDate(tx.date)}</td>
                      <td className="px-4 py-3 text-zinc-200 max-w-xs truncate">{tx.description}</td>
                      <td className="px-4 py-3 font-mono text-zinc-400 text-xs">
                        {tx.reference ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {tx.category ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 capitalize">
                            {tx.category}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">—</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums font-semibold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount, account.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complete Reconciliation */}
        {(existingRecon || unreconciled.length > 0) && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-100">Complete Reconciliation</div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {isBalanced
                  ? `${checkedIds.size} transactions cleared. Statement matches book balance.`
                  : `Difference of ${formatCurrency(Math.abs(difference), account.currency)} must be resolved before completing.`}
              </div>
            </div>
            <button
              onClick={completeReconciliation}
              disabled={saving || !isBalanced || !statementBalance || checkedIds.size === 0}
              className={`px-6 py-2.5 text-sm font-medium rounded transition-colors ${
                isBalanced && statementBalance && checkedIds.size > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Completing...' : 'Complete Reconciliation'}
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
