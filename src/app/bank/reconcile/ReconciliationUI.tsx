'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  CheckCircle2,
  Circle,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankAccount {
  id: string
  bankName: string
  accountCode: string
  accountNumber: string
  currentBalance: number
  currency: string
}

interface BankStatement {
  id: string
  statementDate: string
  openingBalance: number
  closingBalance: number
  status: string
}

interface BankStatementLine {
  id: string
  transactionDate: string
  description: string
  amount: number
  transactionType: string
  reference: string | null
  matchingStatus: string
  matchedToId: string | null
}

interface VendorPayment {
  id: string
  paymentNumber: string
  paymentDate: string
  amount: number
  paymentMethod: string
  status: string
  vendor: { id: string; name: string }
}

interface Props {
  bankAccount: BankAccount
  statement: BankStatement | null
  statementLines: BankStatementLine[]
  payments: VendorPayment[]
}

// ─── Add Statement Modal ─────────────────────────────────────────────────────

interface NewLine {
  transactionDate: string
  description: string
  amount: string
  transactionType: string
  reference: string
}

function AddStatementModal({
  bankAccountId,
  onClose,
  onCreated,
}: {
  bankAccountId: string
  onClose: () => void
  onCreated: () => void
}) {
  const [statementDate, setStatementDate] = useState('')
  const [openingBalance, setOpeningBalance] = useState('')
  const [closingBalance, setClosingBalance] = useState('')
  const [lines, setLines] = useState<NewLine[]>([
    { transactionDate: '', description: '', amount: '', transactionType: 'deposit', reference: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addLine = () =>
    setLines(prev => [
      ...prev,
      { transactionDate: '', description: '', amount: '', transactionType: 'deposit', reference: '' },
    ])

  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  const updateLine = (i: number, field: keyof NewLine, value: string) =>
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))

  const handleSubmit = async () => {
    if (!statementDate || openingBalance === '' || closingBalance === '') {
      setError('Statement date, opening balance, and closing balance are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/bank/statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccountId,
          statementDate,
          openingBalance: Number(openingBalance),
          closingBalance: Number(closingBalance),
          lines: lines
            .filter(l => l.description && l.amount && l.transactionDate)
            .map(l => ({
              transactionDate: l.transactionDate,
              description: l.description,
              amount: Number(l.amount),
              transactionType: l.transactionType,
              reference: l.reference || undefined,
            })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create statement')
      }
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating statement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">New Bank Statement</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-950/40 border border-red-800 text-red-300 text-xs px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Statement Date</label>
              <input
                type="date"
                value={statementDate}
                onChange={e => setStatementDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Opening Balance</label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={e => setOpeningBalance(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Closing Balance</label>
              <input
                type="number"
                step="0.01"
                value={closingBalance}
                onChange={e => setClosingBalance(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Transactions</p>
              <button
                onClick={addLine}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="date"
                    value={line.transactionDate}
                    onChange={e => updateLine(i, 'transactionDate', e.target.value)}
                    className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={line.description}
                    onChange={e => updateLine(i, 'description', e.target.value)}
                    placeholder="Description"
                    className="col-span-4 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={line.amount}
                    onChange={e => updateLine(i, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={line.transactionType}
                    onChange={e => updateLine(i, 'transactionType', e.target.value)}
                    className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="fee">Fee</option>
                    <option value="interest">Interest</option>
                  </select>
                  <input
                    type="text"
                    value={line.reference}
                    onChange={e => updateLine(i, 'reference', e.target.value)}
                    placeholder="Ref#"
                    className="col-span-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeLine(i)}
                    className="col-span-1 text-zinc-600 hover:text-red-400 flex justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create Statement'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Matching Status Badge ────────────────────────────────────────────────────

function MatchBadge({ status }: { status: string }) {
  if (status === 'matched') return <Badge variant="success">Matched</Badge>
  if (status === 'manual') return <Badge variant="warning">Manual</Badge>
  return <Badge variant="secondary">Unmatched</Badge>
}

// ─── Main Reconciliation UI ───────────────────────────────────────────────────

export function ReconciliationUI({ bankAccount, statement, statementLines, payments }: Props) {
  const [lines, setLines] = useState<BankStatementLine[]>(statementLines)
  const [paidItems, setPaidItems] = useState<VendorPayment[]>(payments)
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [reconciling, setReconciling] = useState(false)
  const [reconcileError, setReconcileError] = useState<string | null>(null)
  const [reconcileSuccess, setReconcileSuccess] = useState(false)

  const stmtId = statement?.id ?? null

  // GL balance = sum of matched payment amounts
  const matchedPaymentIds = new Set(lines.filter(l => l.matchedToId).map(l => l.matchedToId))
  const glBalance = paidItems
    .filter(p => matchedPaymentIds.has(p.id))
    .reduce((sum, p) => sum + p.amount, 0)

  const bankBalance = statement?.closingBalance ?? 0
  const difference = bankBalance - glBalance
  const canReconcile = stmtId && Math.abs(difference) < 0.01

  const performMatch = async (lineId: string, paymentId: string) => {
    if (!stmtId) return
    // Optimistic update
    setLines(prev =>
      prev.map(l =>
        l.id === lineId ? { ...l, matchingStatus: 'matched', matchedToId: paymentId } : l
      )
    )
    setSelectedLineId(null)
    setSelectedPaymentId(null)

    try {
      await fetch(`/api/bank/statements/${stmtId}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statementLineId: lineId, matchedToId: paymentId, matchedToType: 'payment' }),
      })
    } catch {
      // Roll back optimistic update on error
      setLines(prev =>
        prev.map(l =>
          l.id === lineId ? { ...l, matchingStatus: 'unmatched', matchedToId: null } : l
        )
      )
    }
  }

  const handleLineMatch = (lineId: string) => {
    if (selectedLineId === lineId) {
      setSelectedLineId(null)
      return
    }
    if (selectedPaymentId) {
      performMatch(lineId, selectedPaymentId)
    } else {
      setSelectedLineId(lineId)
    }
  }

  const handlePaymentMatch = (paymentId: string) => {
    if (selectedPaymentId === paymentId) {
      setSelectedPaymentId(null)
      return
    }
    if (selectedLineId) {
      performMatch(selectedLineId, paymentId)
    } else {
      setSelectedPaymentId(paymentId)
    }
  }

  const unmatchLine = (lineId: string) => {
    setLines(prev =>
      prev.map(l =>
        l.id === lineId ? { ...l, matchingStatus: 'unmatched', matchedToId: null } : l
      )
    )
  }

  const handleCompleteReconciliation = async () => {
    if (!stmtId || !canReconcile) return
    setReconciling(true)
    setReconcileError(null)
    try {
      const res = await fetch(`/api/bank/statements/${stmtId}/reconcile`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to reconcile')
      }
      setReconcileSuccess(true)
    } catch (err) {
      setReconcileError(err instanceof Error ? err.message : 'Reconciliation failed')
    } finally {
      setReconciling(false)
    }
  }

  const unmatchedLinesCount = lines.filter(l => l.matchingStatus === 'unmatched').length
  const matchedLinesCount = lines.filter(l => l.matchingStatus !== 'unmatched').length

  return (
    <>
      {showAddModal && (
        <AddStatementModal
          bankAccountId={bankAccount.id}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false)
            window.location.reload()
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            {bankAccount.bankName}
            <span className="ml-2 text-sm text-zinc-500 font-mono font-normal">
              ****{bankAccount.accountNumber.slice(-4)}
            </span>
          </h2>
          {statement ? (
            <p className="text-xs text-zinc-500 mt-0.5">
              Statement:{' '}
              {new Date(statement.statementDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
              &nbsp;&middot;&nbsp;
              {formatCurrency(statement.openingBalance)} → {formatCurrency(statement.closingBalance)}
              &nbsp;&middot;&nbsp;
              <span className={statement.status === 'reconciled' ? 'text-emerald-400' : 'text-amber-400'}>
                {statement.status.replace('_', ' ')}
              </span>
            </p>
          ) : (
            <p className="text-xs text-amber-400 mt-0.5">No statement loaded — add one to begin reconciliation</p>
          )}
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add Statement
        </Button>
      </div>

      {reconcileSuccess && (
        <div className="mb-4 bg-emerald-950/40 border border-emerald-700 rounded-lg px-4 py-3 flex items-center gap-2 text-emerald-300 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Reconciliation complete. Statement marked as reconciled.
        </div>
      )}

      {!statement ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No statement found for this account.</p>
            <p className="text-xs mt-1">Use "Add Statement" to import one manually.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Instruction hint */}
          {selectedLineId && !selectedPaymentId && (
            <div className="mb-3 text-xs text-blue-400 bg-blue-950/30 border border-blue-800 rounded px-3 py-2">
              Bank line selected — now click "Match" on a payment/GL entry to link them.
            </div>
          )}
          {selectedPaymentId && !selectedLineId && (
            <div className="mb-3 text-xs text-blue-400 bg-blue-950/30 border border-blue-800 rounded px-3 py-2">
              Payment selected — now click "Match" on a bank transaction to link them.
            </div>
          )}

          {/* Two-column matching area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* LEFT — Bank Transactions */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-zinc-100">Bank Transactions</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{lines.length} total</Badge>
                    {matchedLinesCount > 0 && (
                      <Badge variant="success">{matchedLinesCount} matched</Badge>
                    )}
                    {unmatchedLinesCount > 0 && (
                      <Badge variant="warning">{unmatchedLinesCount} unmatched</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {lines.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-zinc-500 text-sm">
                    No transactions on this statement
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {lines.map(line => {
                      const isDeposit = line.transactionType === 'deposit' || line.transactionType === 'interest'
                      const isSelected = selectedLineId === line.id
                      const isMatched = line.matchingStatus !== 'unmatched'

                      return (
                        <div
                          key={line.id}
                          className={`px-4 py-3 transition-colors ${
                            isSelected
                              ? 'bg-blue-950/40 border-l-2 border-blue-500'
                              : 'hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              {isDeposit ? (
                                <ArrowDownCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <ArrowUpCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <p className="text-xs text-zinc-100 font-medium truncate">
                                  {line.description}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {new Date(line.transactionDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                                  {line.reference && (
                                    <span className="ml-2 font-mono">#{line.reference}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span
                                className={`text-sm font-semibold font-mono ${
                                  isDeposit ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                {isDeposit ? '+' : '-'}
                                {formatCurrency(Math.abs(line.amount))}
                              </span>
                              <MatchBadge status={line.matchingStatus} />
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {!isMatched ? (
                              <button
                                onClick={() => handleLineMatch(line.id)}
                                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Match'}
                              </button>
                            ) : (
                              <button
                                onClick={() => unmatchLine(line.id)}
                                className="text-xs px-2 py-0.5 rounded border border-zinc-700 text-zinc-500 hover:border-red-600 hover:text-red-400 transition-colors"
                              >
                                Unmatch
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RIGHT — GL / Payments */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-zinc-100">GL / Payments</CardTitle>
                  <Badge variant="secondary">{paidItems.length} payments</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {paidItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm gap-1">
                    <p>No posted payments for this account</p>
                    <p className="text-xs">Payments must have status=posted and bankAccountId set</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {paidItems.map(payment => {
                      const isMatched = lines.some(l => l.matchedToId === payment.id)
                      const isSelected = selectedPaymentId === payment.id

                      return (
                        <div
                          key={payment.id}
                          className={`px-4 py-3 transition-colors ${
                            isSelected
                              ? 'bg-blue-950/40 border-l-2 border-blue-500'
                              : isMatched
                              ? 'bg-emerald-950/10'
                              : 'hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs text-zinc-100 font-medium">
                                {payment.vendor.name}
                              </p>
                              <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                                {payment.paymentNumber}
                                <span className="ml-2 not-italic">&middot;</span>
                                <span className="ml-2 not-italic">
                                  {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                    dateStyle: 'medium',
                                  })}
                                </span>
                              </p>
                              <p className="text-xs text-zinc-600 mt-0.5">{payment.paymentMethod}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-sm font-semibold font-mono text-red-400">
                                -{formatCurrency(payment.amount)}
                              </span>
                              {isMatched ? (
                                <Badge variant="success">Matched</Badge>
                              ) : (
                                <Badge variant="secondary">Unmatched</Badge>
                              )}
                            </div>
                          </div>
                          {!isMatched && (
                            <div className="mt-2">
                              <button
                                onClick={() => handlePaymentMatch(payment.id)}
                                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Match'}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reconciliation Summary */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-800">
              <CardTitle className="text-sm text-zinc-100">Reconciliation Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-zinc-800/50 rounded-lg px-4 py-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Bank Statement Balance</p>
                  <p className="text-xl font-bold font-mono text-zinc-100">
                    {formatCurrency(bankBalance)}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">Closing balance per statement</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg px-4 py-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">GL Balance (Matched)</p>
                  <p className="text-xl font-bold font-mono text-zinc-100">
                    {formatCurrency(glBalance)}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">Sum of matched payments</p>
                </div>
                <div
                  className={`rounded-lg px-4 py-3 ${
                    Math.abs(difference) < 0.01
                      ? 'bg-emerald-950/30 border border-emerald-800'
                      : 'bg-red-950/30 border border-red-900'
                  }`}
                >
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Difference</p>
                  <p
                    className={`text-xl font-bold font-mono ${
                      Math.abs(difference) < 0.01 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(difference)}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {Math.abs(difference) < 0.01 ? 'Balanced — ready to reconcile' : 'Must be $0.00 to reconcile'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  {Math.abs(difference) < 0.01 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-600" />
                  )}
                  {matchedLinesCount} of {lines.length} lines matched
                </div>

                <div className="flex items-center gap-3">
                  {reconcileError && (
                    <p className="text-xs text-red-400">{reconcileError}</p>
                  )}
                  <Button
                    onClick={handleCompleteReconciliation}
                    disabled={!canReconcile || reconciling || reconcileSuccess}
                    className={`${
                      canReconcile && !reconcileSuccess
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : ''
                    }`}
                  >
                    {reconcileSuccess
                      ? 'Reconciled'
                      : reconciling
                      ? 'Completing...'
                      : 'Complete Reconciliation'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
