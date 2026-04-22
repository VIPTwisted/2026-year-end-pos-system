import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Plus, BookOpen } from 'lucide-react'

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d)
}

export default async function JournalEntriesPage() {
  const entries = await prisma.journalEntry.findMany({
    include: {
      lines: true,
    },
    orderBy: { date: 'desc' },
    take: 100,
  })

  const newEntryButton = (
    <Link
      href="/finance/journal-entries/new"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      New Entry
    </Link>
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Journal Entries"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={newEntryButton}
      />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Summary strip */}
        <div className="flex items-center gap-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
              Total Entries
            </div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums">
              {entries.length}
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
              Total Posted
            </div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">
              {entries.filter((e) => e.status === 'posted').length}
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">
              Total Debits
            </div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums font-mono">
              {formatCurrency(
                entries.reduce(
                  (sum, e) => sum + e.lines.reduce((s, l) => s + l.debit, 0),
                  0
                )
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">All Journal Entries</h2>
            <span className="text-xs text-zinc-500">{entries.length} records</span>
          </div>

          {entries.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No journal entries yet.</p>
              <Link
                href="/finance/journal-entries/new"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Entry
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Reference
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Description
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Lines
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Total Debits
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {entries.map((entry) => {
                    const totalDebits = entry.lines.reduce((s, l) => s + l.debit, 0)
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <span className="text-sm text-zinc-300">{fmtDate(entry.date)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">
                            {entry.reference}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-zinc-300 truncate max-w-[280px] block">
                            {entry.description ?? (
                              <span className="text-zinc-600 italic">—</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-zinc-400 tabular-nums">
                            {entry.lines.length}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-zinc-100 font-semibold tabular-nums">
                            {formatCurrency(totalDebits)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                              entry.status === 'posted'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : entry.status === 'reversed'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-zinc-700 text-zinc-400'
                            }`}
                          >
                            {entry.status}
                          </span>
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
    </div>
  )
}
