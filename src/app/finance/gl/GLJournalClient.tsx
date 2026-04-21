'use client'

import { useState, useCallback } from 'react'
import { GLJournalForm } from './GLJournalForm'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react'

interface JournalLine {
  id: string
  accountId: string
  accountCode: string
  accountName: string
  debit: number
  credit: number
  memo: string | null
}

interface JournalEntry {
  id: string
  reference: string
  description: string | null
  date: string
  status: string
  createdAt: string
  createdBy: string | null
  lines: JournalLine[]
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso))
}

export function GLJournalClient({ initialEntries }: { initialEntries: JournalEntry[] }) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [refreshing, setRefreshing] = useState(false)

  const refreshEntries = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/finance/gl/entries')
      const data = await res.json()
      if (res.ok) setEntries(data.entries ?? [])
    } finally {
      setRefreshing(false)
    }
  }, [])

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Create Form */}
      <GLJournalForm onPosted={refreshEntries} />

      {/* Recent Entries */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Recent Journal Entries</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Last 20 entries — most recent first
            </p>
          </div>
          <div className="flex items-center gap-3">
            {refreshing && (
              <span className="text-xs text-zinc-500 animate-pulse">Refreshing...</span>
            )}
            <span className="text-xs text-zinc-600">{entries.length} entries</span>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No journal entries yet. Post your first entry above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Reference
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Description
                  </th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Lines
                  </th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Total Debits
                  </th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Total Credits
                  </th>
                  <th className="text-center px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                    Balanced
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {entries.map((entry) => {
                  const totalDebits = entry.lines.reduce((s, l) => s + l.debit, 0)
                  const totalCredits = entry.lines.reduce((s, l) => s + l.credit, 0)
                  const balanced = Math.abs(totalDebits - totalCredits) < 0.01

                  return (
                    <tr key={entry.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">
                          {entry.reference}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-zinc-400">{formatDate(entry.date)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-zinc-300 truncate max-w-[200px] block">
                          {entry.description ?? <span className="text-zinc-600 italic">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-zinc-400">{entry.lines.length}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-xs text-zinc-200">{formatCurrency(totalDebits)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-xs text-zinc-200">{formatCurrency(totalCredits)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            entry.status === 'posted'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {balanced ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" aria-label="Balanced" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mx-auto" aria-label="Out of balance" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
