'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Account {
  id: string
  code: string
  name: string
  type: string
}

interface LineRow {
  id: string
  accountId: string
  debit: string
  credit: string
  memo: string
}

function newLine(): LineRow {
  return { id: crypto.randomUUID(), accountId: '', debit: '', credit: '', memo: '' }
}

function genRef() {
  return `JE-${Date.now().toString(36).toUpperCase()}`
}

export function GLJournalForm({ onPosted }: { onPosted: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [reference, setReference] = useState(genRef)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [lines, setLines] = useState<LineRow[]>([newLine(), newLine()])

  useEffect(() => {
    fetch('/api/finance/accounts')
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []))
      .catch(() => setAccounts([]))
      .finally(() => setLoadingAccounts(false))
  }, [])

  const totalDebits = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0)
  const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01
  const hasLines = lines.some((l) => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))

  function addLine() {
    setLines((prev) => [...prev, newLine()])
  }

  function removeLine(id: string) {
    if (lines.length <= 2) return
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  function updateLine(id: string, field: keyof LineRow, value: string) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const updated = { ...l, [field]: value }
        // Mutual exclusion: entering debit clears credit and vice versa
        if (field === 'debit' && value) updated.credit = ''
        if (field === 'credit' && value) updated.debit = ''
        return updated
      })
    )
  }

  const handlePost = useCallback(async () => {
    setError(null)
    setSuccessMsg(null)
    if (!isBalanced || !hasLines) return
    setPosting(true)
    try {
      const res = await fetch('/api/finance/gl/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.trim(),
          description: description.trim() || null,
          date: new Date(date).toISOString(),
          lines: lines
            .filter((l) => l.accountId)
            .map((l) => ({
              accountId: l.accountId,
              debit: parseFloat(l.debit) || 0,
              credit: parseFloat(l.credit) || 0,
              memo: l.memo.trim() || null,
            })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to post entry')
      setSuccessMsg(`Journal entry ${data.entry.reference} posted successfully.`)
      setReference(genRef())
      setDescription('')
      setDate(new Date().toISOString().slice(0, 10))
      setLines([newLine(), newLine()])
      onPosted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setPosting(false)
    }
  }, [reference, description, date, lines, isBalanced, hasLines, onPosted])

  const inputCls =
    'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Create Journal Entry</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Enter balanced debit and credit lines, then post to the GL.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Debits</p>
            <p className="text-sm font-mono font-semibold text-zinc-100">{formatCurrency(totalDebits)}</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Credits</p>
            <p className="text-sm font-mono font-semibold text-zinc-100">{formatCurrency(totalCredits)}</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Balance</p>
            {isBalanced ? (
              <div className="flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">OK</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 justify-end">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-sm font-semibold text-red-400">
                  {formatCurrency(Math.abs(totalDebits - totalCredits))} off
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Header fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Reference</label>
            <input
              type="text"
              className={inputCls}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
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
            <label className={labelCls}>Description</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Optional memo for this entry..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Lines */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/50 border-b border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Journal Lines</span>
            <Button
              type="button"
              onClick={addLine}
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-xs h-7 gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Line
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-2.5 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Account
                  </th>
                  <th className="text-left px-3 py-2.5 text-zinc-500 text-xs uppercase tracking-wide font-medium w-36">
                    Debit
                  </th>
                  <th className="text-left px-3 py-2.5 text-zinc-500 text-xs uppercase tracking-wide font-medium w-36">
                    Credit
                  </th>
                  <th className="text-left px-3 py-2.5 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Memo
                  </th>
                  <th className="px-3 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {lines.map((line, idx) => (
                  <tr key={line.id} className="hover:bg-zinc-900/30">
                    <td className="px-4 py-2.5">
                      {loadingAccounts ? (
                        <div className="h-8 bg-zinc-800 rounded animate-pulse" />
                      ) : (
                        <select
                          className={`${inputCls} min-w-[220px]`}
                          value={line.accountId}
                          onChange={(e) => updateLine(line.id, 'accountId', e.target.value)}
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
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${inputCls} font-mono`}
                        placeholder="0.00"
                        value={line.debit}
                        onChange={(e) => updateLine(line.id, 'debit', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${inputCls} font-mono`}
                        placeholder="0.00"
                        value={line.credit}
                        onChange={(e) => updateLine(line.id, 'credit', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Optional line memo..."
                        value={line.memo}
                        onChange={(e) => updateLine(line.id, 'memo', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length <= 2}
                        className="text-zinc-700 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded"
                        title={idx < 2 ? 'Minimum 2 lines required' : 'Remove line'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals row */}
          <div className="border-t border-zinc-800 bg-zinc-900/50 px-4 py-3 flex items-center justify-end gap-8">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Total Debits</span>
              <span className="font-mono text-sm font-semibold text-zinc-100">{formatCurrency(totalDebits)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Total Credits</span>
              <span className="font-mono text-sm font-semibold text-zinc-100">{formatCurrency(totalCredits)}</span>
            </div>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">Balanced</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">
                    Out of balance by {formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-400">{successMsg}</p>
          </div>
        )}

        {/* Post button */}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handlePost}
            disabled={!isBalanced || !hasLines || posting}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm gap-2 min-w-[140px]"
          >
            {posting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Entry'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
