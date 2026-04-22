'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react'

interface COA {
  id: string
  accountCode: string
  accountName: string
  accountType: string
}

interface JournalLine {
  accountCode: string
  description: string
  debit: string
  credit: string
  costCenter: string
}

const JOURNAL_TYPES = ['General', 'Recurring', 'Reversing', 'Opening']

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const emptyLine = (): JournalLine => ({
  accountCode: '',
  description: '',
  debit: '',
  credit: '',
  costCenter: '',
})

export default function NewJournalPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<COA[]>([])
  const [journalType, setJournalType] = useState('General')
  const [description, setDescription] = useState('')
  const [postingDate, setPostingDate] = useState(new Date().toISOString().slice(0, 10))
  const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/chart-of-accounts')
      .then(r => r.json())
      .then(d => setAccounts(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) <= 0.01

  function updateLine(idx: number, field: keyof JournalLine, value: string) {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  function addLine() {
    setLines(prev => [...prev, emptyLine()])
  }

  function removeLine(idx: number) {
    if (lines.length <= 2) return
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  async function submit(saveAsDraft: boolean) {
    if (!description.trim()) { setError('Description is required.'); return }
    const validLines = lines.filter(l => l.accountCode)
    if (validLines.length < 2) { setError('At least 2 lines with an account are required.'); return }
    if (!saveAsDraft && !balanced) { setError('Journal must balance (Debit = Credit) to post.'); return }
    setError('')
    setSaving(true)

    const period = postingDate.slice(0, 7)
    try {
      const res = await fetch('/api/general-journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          postingDate,
          period,
          journalType,
          lines: validLines.map(l => ({
            accountCode: l.accountCode,
            description: l.description,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
            entityName: l.costCenter || null,
          })),
        }),
      })
      if (!res.ok) { const e = await res.json(); setError(e.error ?? 'Save failed'); setSaving(false); return }
      const data = await res.json()
      if (!saveAsDraft) {
        await fetch(`/api/general-journals/${data.id}/post`, { method: 'POST' })
      }
      router.push('/general-journals')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              New General Journal
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Create a GL journal entry</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1.5 border border-zinc-700/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Header Form */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Journal Type</label>
            <select
              value={journalType}
              onChange={e => setJournalType(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              {JOURNAL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Posting Date</label>
            <input
              type="date"
              value={postingDate}
              onChange={e => setPostingDate(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wide block mb-1.5">Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Journal description…"
              className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Lines */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Journal Lines</h2>
            <button
              onClick={addLine}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-2">Account</th>
                  <th className="text-left px-4 py-2">Description</th>
                  <th className="text-left px-4 py-2 hidden lg:table-cell">Cost Center</th>
                  <th className="text-right px-4 py-2 w-32">Debit</th>
                  <th className="text-right px-4 py-2 w-32">Credit</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">
                      <select
                        value={line.accountCode}
                        onChange={e => updateLine(idx, 'accountCode', e.target.value)}
                        className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">— Select Account —</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.accountCode}>
                            {a.accountCode} — {a.accountName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={line.description}
                        onChange={e => updateLine(idx, 'description', e.target.value)}
                        placeholder="Line description"
                        className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      <input
                        value={line.costCenter}
                        onChange={e => updateLine(idx, 'costCenter', e.target.value)}
                        placeholder="Cost center"
                        className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.debit}
                        onChange={e => updateLine(idx, 'debit', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1.5 text-xs text-right text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.credit}
                        onChange={e => updateLine(idx, 'credit', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1.5 text-xs text-right text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => removeLine(idx)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                        disabled={lines.length <= 2}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700/50 bg-zinc-900/30">
                  <td colSpan={3} className="px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wide">
                    Totals
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-zinc-100">{fmt(totalDebit)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-zinc-100">{fmt(totalCredit)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Balance indicator */}
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${balanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          {balanced
            ? <><CheckCircle className="w-4 h-4" /> Journal is balanced</>
            : <><AlertTriangle className="w-4 h-4" /> Difference: {fmt(Math.abs(totalDebit - totalCredit))}</>
          }
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => submit(true)}
            disabled={saving}
            className="px-5 py-2 rounded-lg border border-zinc-700/50 text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => submit(false)}
            disabled={saving || !balanced}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Post Journal'}
          </button>
        </div>

      </div>
    </div>
  )
}
