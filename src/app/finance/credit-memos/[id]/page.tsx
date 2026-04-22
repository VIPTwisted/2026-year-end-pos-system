'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

interface CreditMemoTransaction {
  id: string
  orderId: string | null
  amount: number
  type: string
  createdAt: string
}

interface CreditMemo {
  id: string
  memoNumber: string
  amount: number
  remaining: number
  status: string
  notes: string | null
  expiresAt: string | null
  createdAt: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
  }
  salesReturn: {
    id: string
    returnNumber: string
    createdAt: string
  } | null
  transactions: CreditMemoTransaction[]
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-emerald-500/10 text-emerald-400',
    partially_applied: 'bg-amber-500/10 text-amber-400',
    fully_used: 'bg-zinc-700/60 text-zinc-400',
    voided: 'bg-red-500/10 text-red-400',
  }
  const label: Record<string, string> = {
    open: 'Open',
    partially_applied: 'Partially Used',
    fully_used: 'Fully Used',
    voided: 'Voided',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium ${
        map[status] ?? 'bg-zinc-700/60 text-zinc-400'
      }`}
    >
      {label[status] ?? status}
    </span>
  )
}

export default function CreditMemoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [memo, setMemo] = useState<CreditMemo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Apply form
  const [applyOrderId, setApplyOrderId] = useState('')
  const [applyAmount, setApplyAmount] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const [applyError, setApplyError] = useState('')

  // Void confirm
  const [showVoidConfirm, setShowVoidConfirm] = useState(false)
  const [voidLoading, setVoidLoading] = useState(false)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const loadMemo = useCallback(() => {
    setLoading(true)
    fetch(`/api/finance/credit-memos/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json() as Promise<CreditMemo>
      })
      .then(data => setMemo(data))
      .catch(() => setError('Failed to load credit memo'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    loadMemo()
  }, [loadMemo])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplyError('')

    const amount = parseFloat(applyAmount)
    if (!applyOrderId.trim()) {
      setApplyError('Order ID is required')
      return
    }
    if (!applyAmount || isNaN(amount) || amount <= 0) {
      setApplyError('Enter a valid positive amount')
      return
    }
    if (memo && amount > memo.remaining) {
      setApplyError(`Amount exceeds remaining balance of ${formatCurrency(memo.remaining)}`)
      return
    }

    setApplyLoading(true)
    try {
      const res = await fetch(`/api/finance/credit-memos/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: applyOrderId.trim(), amount }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Apply failed')
      notify('Credit applied successfully')
      setApplyOrderId('')
      setApplyAmount('')
      loadMemo()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Apply failed'
      setApplyError(msg)
      notify(msg, 'err')
    } finally {
      setApplyLoading(false)
    }
  }

  const handleVoid = async () => {
    setVoidLoading(true)
    try {
      const res = await fetch(`/api/finance/credit-memos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'voided' }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Void failed')
      notify('Credit memo voided')
      setShowVoidConfirm(false)
      loadMemo()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Void failed', 'err')
    } finally {
      setVoidLoading(false)
    }
  }

  const inputCls =
    'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors'
  const labelCls =
    'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

  if (loading) {
    return (
      <>
        <TopBar title="Credit Memo" showBack />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <div className="text-zinc-500 text-[13px]">Loading…</div>
        </main>
      </>
    )
  }

  if (error || !memo) {
    return (
      <>
        <TopBar title="Credit Memo" showBack />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <div className="text-red-400 text-[13px]">{error ?? 'Credit memo not found'}</div>
        </main>
      </>
    )
  }

  const canApply = memo.status !== 'voided' && memo.status !== 'fully_used' && memo.remaining > 0
  const canVoid = memo.status !== 'voided'

  return (
    <>
      <TopBar
        title={memo.memoNumber}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Credit Memos', href: '/finance/credit-memos' },
        ]}
        showBack
        actions={
          canVoid ? (
            <button
              onClick={() => setShowVoidConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-800/60 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Void Memo
            </button>
          ) : undefined
        }
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 text-white text-[13px] px-4 py-2.5 rounded shadow-lg ${
            toast.type === 'err' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Void Confirm Modal */}
      {showVoidConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-800/60 rounded-lg shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <h2 className="text-[14px] font-semibold text-zinc-100">Void Credit Memo?</h2>
            </div>
            <p className="text-[13px] text-zinc-400 mb-5">
              This will void <strong className="text-zinc-200">{memo.memoNumber}</strong> with a
              remaining balance of{' '}
              <strong className="text-emerald-400">{formatCurrency(memo.remaining)}</strong>.
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowVoidConfirm(false)}
                className="px-3 py-1.5 rounded border border-zinc-700 text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVoid}
                disabled={voidLoading}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 text-[12px] font-medium text-white transition-colors"
              >
                {voidLoading ? 'Voiding…' : 'Void Memo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-4xl mx-auto space-y-6">

          <Link
            href="/finance/credit-memos"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Credit Memos
          </Link>

          {/* Header card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  Credit Memo
                </div>
                <div className="text-xl font-bold text-zinc-100 font-mono">{memo.memoNumber}</div>
                <div className="text-[12px] text-zinc-500 mt-1">
                  Issued {formatDate(memo.createdAt)}
                  {memo.expiresAt && (
                    <> &nbsp;·&nbsp; Expires {formatDate(memo.expiresAt)}</>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={memo.status} />
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
                    Remaining Balance
                  </div>
                  <div
                    className={`text-3xl font-bold tabular-nums ${
                      memo.remaining > 0 ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    {formatCurrency(memo.remaining)}
                  </div>
                  <div className="text-[11px] text-zinc-600 mt-0.5">
                    of {formatCurrency(memo.amount)} original
                  </div>
                </div>
              </div>
            </div>

            {memo.notes && (
              <div className="mt-4 pt-4 border-t border-zinc-800/60">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  Reason / Notes
                </div>
                <p className="text-[13px] text-zinc-400">{memo.notes}</p>
              </div>
            )}
          </div>

          {/* Customer + Return info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Customer
              </div>
              <Link
                href={`/customers/${memo.customer.id}`}
                className="text-[14px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                {memo.customer.firstName} {memo.customer.lastName}
              </Link>
              {memo.customer.email && (
                <div className="text-[12px] text-zinc-500 mt-1">{memo.customer.email}</div>
              )}
              {memo.customer.phone && (
                <div className="text-[12px] text-zinc-500">{memo.customer.phone}</div>
              )}
            </div>

            {memo.salesReturn && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                  Linked Return
                </div>
                <div className="font-mono text-[13px] text-zinc-300">
                  {memo.salesReturn.returnNumber}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {formatDate(memo.salesReturn.createdAt)}
                </div>
              </div>
            )}
          </div>

          {/* Apply to Order form */}
          {canApply && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                Apply to Order
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      Order ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={applyOrderId}
                      onChange={e => setApplyOrderId(e.target.value)}
                      placeholder="Paste order ID…"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      Amount ($) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={memo.remaining}
                      value={applyAmount}
                      onChange={e => setApplyAmount(e.target.value)}
                      placeholder={`max ${formatCurrency(memo.remaining)}`}
                      className={inputCls}
                    />
                  </div>
                </div>

                {applyError && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                    {applyError}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[12px] font-medium text-white transition-colors"
                  >
                    {applyLoading ? 'Applying…' : 'Apply Credit'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Transaction history */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Application History
              </span>
              <span className="text-[11px] text-zinc-600">
                {memo.transactions.length} transaction{memo.transactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {memo.transactions.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-zinc-600">
                No transactions yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                      <th className="text-left px-5 py-2.5 font-medium">Type</th>
                      <th className="text-left py-2.5 font-medium">Order ID</th>
                      <th className="text-right py-2.5 font-medium">Amount</th>
                      <th className="text-left px-5 py-2.5 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memo.transactions.map((tx, idx) => (
                      <tr
                        key={tx.id}
                        className={`hover:bg-zinc-800/30 transition-colors ${
                          idx !== memo.transactions.length - 1 ? 'border-b border-zinc-800/50' : ''
                        }`}
                      >
                        <td className="px-5 py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                              tx.type === 'apply'
                                ? 'bg-blue-500/10 text-blue-400'
                                : tx.type === 'void'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-zinc-700/60 text-zinc-400'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 pr-6">
                          {tx.orderId ? (
                            <Link
                              href={`/orders/${tx.orderId}`}
                              className="font-mono text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {tx.orderId}
                            </Link>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-6 text-right font-semibold tabular-nums text-emerald-400">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-5 py-2.5 text-zinc-500 text-[11px] whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
