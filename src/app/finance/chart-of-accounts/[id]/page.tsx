export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AccountEditForm } from './AccountEditForm'

type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

const TYPE_BADGE: Record<string, string> = {
  asset:     'bg-blue-500/10 text-blue-400',
  liability: 'bg-red-500/10 text-red-400',
  equity:    'bg-purple-500/10 text-purple-400',
  revenue:   'bg-emerald-500/10 text-emerald-400',
  expense:   'bg-amber-500/10 text-amber-400',
}

const TYPE_LABELS: Record<string, string> = {
  asset:     'Asset',
  liability: 'Liability',
  equity:    'Equity',
  revenue:   'Revenue',
  expense:   'Expense',
}

function normalBalance(type: string): string {
  return type === 'asset' || type === 'expense' ? 'Debit (DR)' : 'Credit (CR)'
}

export default async function GLAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      journalLines: {
        include: { entry: true },
        orderBy: { entry: { date: 'desc' } },
        take: 20,
      },
    },
  })

  if (!account) notFound()

  // Compute running balance from journal lines (most recent first)
  // We need to display running balance, so reverse the array for chronological order
  const chronoLines = [...account.journalLines].reverse()
  let running = 0
  const linesWithBalance = chronoLines.map(line => {
    // For debit-normal accounts (asset/expense): debit increases, credit decreases
    // For credit-normal accounts: credit increases, debit decreases
    const isDebitNormal = account.type === 'asset' || account.type === 'expense'
    running += isDebitNormal
      ? (line.debit - line.credit)
      : (line.credit - line.debit)
    return { ...line, runningBalance: running }
  })
  // Reverse back to most-recent-first for display
  const displayLines = [...linesWithBalance].reverse()

  return (
    <>
      <TopBar
        title={`${account.code} — ${account.name}`}
        breadcrumb={[
          { label: 'Finance',           href: '/finance' },
          { label: 'Chart of Accounts', href: '/finance/chart-of-accounts' },
        ]}
        showBack
      />

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Account Header Card ─────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-2xl font-bold text-zinc-100">{account.code}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-widest ${TYPE_BADGE[account.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                    {TYPE_LABELS[account.type] ?? account.type}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${account.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{account.name}</h1>
                {account.subtype && (
                  <p className="text-[13px] text-zinc-500 mt-0.5 capitalize">{account.subtype}</p>
                )}
              </div>

              {/* Balance KPI */}
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-4 min-w-[160px] text-right">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Current Balance</div>
                <div className={`text-2xl font-bold tabular-nums ${(account.balance ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(account.balance ?? 0)}
                </div>
                <div className="text-[11px] text-zinc-600 mt-1">Normal: {normalBalance(account.type)}</div>
              </div>
            </div>

            {/* Meta grid */}
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/50">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Type</div>
                <div className="text-[13px] text-zinc-300 capitalize">{account.type}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Subtype</div>
                <div className="text-[13px] text-zinc-300 capitalize">{account.subtype ?? '—'}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Statement</div>
                <div className="text-[13px] text-zinc-300 capitalize">
                  {account.mainAccountType === 'balance_sheet' ? 'Balance Sheet'
                    : account.mainAccountType === 'profit_loss' ? 'Profit & Loss'
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Journal Lines</div>
                <div className="text-[13px] text-zinc-300">{account.journalLines.length}</div>
              </div>
            </div>
          </div>

          {/* ── Recent Journal Lines ────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/50">
              <h2 className="text-[13px] font-semibold text-zinc-200">Recent Journal Lines</h2>
              <span className="text-[11px] text-zinc-600">Last {account.journalLines.length} entries</span>
            </div>

            {displayLines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-zinc-600">
                <p className="text-[13px]">No journal activity yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                      <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                      <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reference</th>
                      <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                      <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Debit</th>
                      <th className="text-right py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Credit</th>
                      <th className="text-right px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayLines.map((line, idx) => (
                      <tr
                        key={line.id}
                        className={`hover:bg-zinc-800/30 transition-colors ${idx !== displayLines.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
                      >
                        <td className="px-5 py-2.5 text-zinc-500 text-[12px] whitespace-nowrap">
                          {formatDate(line.entry.date)}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-[11px] text-zinc-400">
                          {line.entry.reference}
                        </td>
                        <td className="py-2.5 pr-6 text-zinc-400 max-w-[220px] truncate" title={line.memo ?? line.entry.description ?? ''}>
                          {line.memo ?? line.entry.description ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-2.5 pr-6 text-right tabular-nums text-blue-400 font-medium">
                          {line.debit > 0 ? formatCurrency(line.debit) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-2.5 pr-6 text-right tabular-nums text-purple-400 font-medium">
                          {line.credit > 0 ? formatCurrency(line.credit) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className={`px-5 py-2.5 text-right tabular-nums font-semibold ${line.runningBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(line.runningBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Edit Form ───────────────────────────────────────────────────── */}
          <AccountEditForm
            id={account.id}
            initialName={account.name}
            initialSubtype={account.subtype ?? ''}
            initialIsActive={account.isActive}
          />

        </div>
      </main>
    </>
  )
}
