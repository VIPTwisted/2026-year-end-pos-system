'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

interface GLAccount {
  id: string
  code: string
  name: string
  type: string
}

interface LineRow {
  key: string
  accountId: string
  description: string
  debit: string
  credit: string
}

function newLine(): LineRow {
  return {
    key: crypto.randomUUID(),
    accountId: '',
    description: '',
    debit: '',
    credit: '',
  }
}

function genRef() {
  return `JE-${Date.now().toString(36).toUpperCase()}`
}

export default function NewJournalEntryPage() {
  const router = useRouter()

  const [accounts, setAccounts] = useState<GLAccount[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [posting, setPosting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState(genRef)
  const [lines, setLines] = useState<LineRow[]>([newLine(), newLine()])

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch('/api/finance/gl-accounts')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load accounts')
        return r.json()
      })
      .then((d: { accounts: GLAccount[] }) => setAccounts(d.accounts ?? []))
      .catch(() => setAccounts([]))
      .finally(() => setLoadingAccounts(false))
  }, [])

  const totalDebits = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0)
  const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)
  const difference = totalDebits - totalCredits
  const isBalanced = Math.abs(difference) < 0.005
  const filledLines = lines.filter(
    (l) => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)
  )
  const canSubmit = isBalanced && filledLines.length >= 2 && !posting

  function addLine() {
    setLines((prev) => [...prev, newLine()])
  }

  function removeLine(key: string) {
    if (lines.length <= 2) return
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  function updateLine(key: string, field: keyof Omit<LineRow, 'key'>, value: string) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l
        const updated = { ...l, [field]: value }
        if (field === 'debit' && value) updated.credit = ''
        if (field === 'credit' && value) updated.debit = ''
        return updated
      })
    )
  }

  const handleSubmit = useCallback(async () => {
    setFormError(null)
    if (!canSubmit) return
    setPosting(true)

    try {
      const payload = {
        date: new Date(date + 'T12:00:00').toISOString(),
        description: description.trim() || undefined,
        reference: reference.trim() || undefined,
        lines: filledLines.map((l) => ({
          accountId: l.accountId,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
          description: l.description.trim() || undefined,
        })),
      }

      const res = await fetch('/api/finance/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to post entry')

      notify('Journal entry posted', 'ok')
      setTimeout(() => router.push('/finance/journal-entries'), 800)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setFormError(msg)
      notify(msg, 'err')
    } finally {
      setPosting(false)
    }
  }, [canSubmit, date, description, reference, filledLines, notify, router])

  const inputCls =
    'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls =
    'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Journal Entry"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Journal Entries', href: '/finance/journal-entries' },
        ]}
        showBack
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-16 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {toast.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Header fields */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-100">Entry Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input
                type="date"
                className={inputCls}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Reference</label>
              <input
                type="text"
                className={inputCls}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input
                type="text"
                className={inputCls}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional memo"
              />
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-100">Journal Lines</span>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Line
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Account
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Description
                  </th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-32">
                    Debit
                  </th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-32">
                    Credit
                  </th>
                  <th className="w-10 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {lines.map((line) => (
                  <tr key={line.key} className="hover:bg-zinc-800/20">
                    <td className="px-5 py-2.5">
                      {loadingAccounts ? (
                        <div className="h-8 bg-zinc-800 rounded animate-pulse w-full" />
                      ) : (
                        <select
                          className={`${inputCls} min-w-[220px]`}
                          value={line.accountId}
                          onChange={(e) => updateLine(line.key, 'accountId', e.target.value)}
                        >
                          <option value="">— Select account —</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} — {a.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Optional"
                        value={line.description}
                        onChange={(e) => updateLine(line.key, 'description', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${inputCls} font-mono text-right`}
                        placeholder="0.00"
                        value={line.debit}
                        onChange={(e) => updateLine(line.key, 'debit', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${inputCls} font-mono text-right`}
                        placeholder="0.00"
                        value={line.credit}
                        onChange={(e) => updateLine(line.key, 'credit', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        disabled={lines.length <= 2}
                        className="text-zinc-700 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded"
                        aria-label="Remove line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals footer */}
          <div className="border-t border-zinc-800/50 bg-zinc-900/30 px-5 py-3 flex items-center justify-end gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Total Debits
              </span>
              <span className="font-mono text-sm font-semibold text-zinc-100 tabular-nums">
                {formatCurrency(totalDebits)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Total Credits
              </span>
              <span className="font-mono text-sm font-semibold text-zinc-100 tabular-nums">
                {formatCurrency(totalCredits)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Difference
              </span>
              <span
                className={`font-mono text-sm font-bold tabular-nums ${
                  isBalanced ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isBalanced ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {formatCurrency(0)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {formatCurrency(Math.abs(difference))}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {formError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{formError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/finance/journal-entries"
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 border border-zinc-700 hover:border-zinc-600 rounded transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors min-w-[140px] justify-center"
          >
            {posting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Entry'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
