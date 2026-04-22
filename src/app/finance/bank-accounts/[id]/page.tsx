'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface BankAccount {
  id: string
  accountCode: string
  name: string
  bankName: string
  accountNumber: string
  routingNumber: string | null
  accountType: string
  currentBalance: number
  currency: string
  isActive: boolean
  isPrimary: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface BankTransaction {
  id: string
  accountId: string
  date: string
  description: string
  amount: number
  runningBalance: number
  reference: string | null
  category: string | null
  isReconciled: boolean
  reconciledAt: string | null
  createdAt: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

const CATEGORIES = ['revenue', 'payroll', 'supplies', 'transfer', 'tax', 'rent', 'utilities', 'other']

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

export default function BankAccountDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [account, setAccount] = useState<BankAccount | null>(null)
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [saving, setSaving] = useState(false)

  // Add transaction form
  const [showTxForm, setShowTxForm] = useState(false)
  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    reference: '',
    category: '',
    type: 'deposit', // deposit | withdrawal
  })

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/finance/bank-accounts/${id}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = (await res.json()) as BankAccount & { transactions: BankTransaction[] }
      setAccount(data)
      setTransactions(data.transactions ?? [])
    } catch {
      setError('Failed to load account')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!txForm.description || !txForm.amount) {
      notify('Description and amount are required', 'err')
      return
    }
    const amountNum = parseFloat(txForm.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      notify('Enter a valid positive amount', 'err')
      return
    }
    const finalAmount = txForm.type === 'withdrawal' ? -amountNum : amountNum

    setSaving(true)
    try {
      const res = await fetch(`/api/finance/bank-accounts/${id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: txForm.date,
          description: txForm.description,
          amount: finalAmount,
          reference: txForm.reference || undefined,
          category: txForm.category || undefined,
        }),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        notify(d.error ?? 'Failed to add transaction', 'err')
        return
      }
      notify('Transaction added')
      setTxForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', reference: '', category: '', type: 'deposit' })
      setShowTxForm(false)
      await load()
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

  if (error || !account) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-red-400 text-sm">{error ?? 'Account not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Top Bar */}
      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link
          href="/finance/bank-accounts"
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{account.bankName}</span>
          <h1 className="text-base font-semibold text-zinc-100 leading-tight">
            {account.name || account.accountCode}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href={`/finance/bank-accounts/${account.id}/reconcile`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded transition-colors"
          >
            Reconcile
          </Link>
          <button
            onClick={() => setShowTxForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Account Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-6">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Account Number</div>
                <div className="font-mono text-zinc-300">{maskAccount(account.accountNumber)}</div>
              </div>
              {account.routingNumber && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Routing Number</div>
                  <div className="font-mono text-zinc-300">{account.routingNumber}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Account Type</div>
                <div className="text-zinc-300 capitalize">{account.accountType.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Currency</div>
                <div className="text-zinc-300">{account.currency}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Current Balance</div>
              <div className={`text-3xl font-bold tabular-nums ${account.currentBalance < 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                {formatCurrency(account.currentBalance, account.currency)}
              </div>
            </div>
          </div>
          {account.notes && (
            <div className="mt-4 pt-4 border-t border-zinc-800 text-sm text-zinc-400">{account.notes}</div>
          )}
        </div>

        {/* Add Transaction Inline Form */}
        {showTxForm && (
          <div className="bg-[#16213e] border border-blue-500/30 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">New Transaction</div>
            <form onSubmit={addTransaction} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Type toggle */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Type</label>
                <div className="flex rounded overflow-hidden border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setTxForm((f) => ({ ...f, type: 'deposit' }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${txForm.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm((f) => ({ ...f, type: 'withdrawal' }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${txForm.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                  >
                    Withdrawal
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Date</label>
                <input
                  type="date"
                  value={txForm.date}
                  onChange={(e) => setTxForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={txForm.amount}
                    onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded pl-7 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 tabular-nums"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Description *</label>
                <input
                  type="text"
                  value={txForm.description}
                  onChange={(e) => setTxForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What is this transaction for?"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Category</label>
                <select
                  value={txForm.category}
                  onChange={(e) => setTxForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">— None —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Reference <span className="text-zinc-600">(optional)</span></label>
                <input
                  type="text"
                  value={txForm.reference}
                  onChange={(e) => setTxForm((f) => ({ ...f, reference: e.target.value }))}
                  placeholder="Check #, wire ref..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit */}
              <div className="md:col-span-3 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
                >
                  {saving ? 'Adding...' : 'Add Transaction'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTxForm(false)}
                  className="px-6 py-2 text-sm text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transaction History */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
            Transaction History
          </div>
          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Category</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reference</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-zinc-500 text-sm">
                      No transactions yet. Add your first transaction above.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3 text-zinc-300 tabular-nums whitespace-nowrap">{fmtDate(tx.date)}</td>
                      <td className="px-4 py-3 text-zinc-200 max-w-xs truncate">{tx.description}</td>
                      <td className="px-4 py-3">
                        {tx.category ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300 capitalize">
                            {tx.category}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-400 text-xs">
                        {tx.reference ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums font-semibold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount, account.currency)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-300 font-mono text-sm">
                        {formatCurrency(tx.runningBalance, account.currency)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.isReconciled ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
                            Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-400">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
