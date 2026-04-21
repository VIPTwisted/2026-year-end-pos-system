import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

const ACCOUNT_TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
type AccountType = typeof ACCOUNT_TYPE_ORDER[number]

const TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
}

export default async function FinancePage() {
  const [accounts, entries] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: 'asc' } }),
    prisma.journalEntry.findMany({
      include: { lines: { include: { account: true } } },
      orderBy: { date: 'desc' },
      take: 20,
    }),
  ])

  // Group accounts by type
  const grouped = accounts.reduce<Record<string, typeof accounts>>(
    (acc, acct) => {
      const key = acct.type as string
      if (!acc[key]) acc[key] = []
      acc[key].push(acct)
      return acc
    },
    {}
  )

  return (
    <>
      <TopBar title="Finance & Accounting" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* ── Section 1: Chart of Accounts ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Chart of Accounts</h2>
            <p className="text-sm text-zinc-500">{accounts.length} accounts</p>
          </div>

          {accounts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <DollarSign className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No accounts yet</p>
                <p className="text-sm">Add accounts to build your chart of accounts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ACCOUNT_TYPE_ORDER.filter(type => (grouped[type] ?? []).length > 0).map(type => {
                const typeAccounts = grouped[type] ?? []
                const typeTotal = typeAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
                return (
                  <Card key={type}>
                    {/* Section header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
                      <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
                        {TYPE_LABELS[type]}
                      </h3>
                      <span className={`text-sm font-semibold tabular-nums ${typeTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(typeTotal)}
                      </span>
                    </div>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800/60 text-zinc-500 text-xs uppercase tracking-wide">
                            <th className="text-left px-5 py-2 font-medium">Code</th>
                            <th className="text-left py-2 font-medium">Name</th>
                            <th className="text-left py-2 font-medium">Subtype</th>
                            <th className="text-right px-5 py-2 font-medium">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40">
                          {typeAccounts.map(acct => (
                            <tr key={acct.id} className="hover:bg-zinc-900/40">
                              <td className="px-5 py-2.5 font-mono text-xs text-zinc-400">{acct.code}</td>
                              <td className="py-2.5 pr-4 text-zinc-300">
                                {acct.name}
                                {!acct.isActive && (
                                  <span className="ml-2 text-xs text-zinc-600">(inactive)</span>
                                )}
                              </td>
                              <td className="py-2.5 pr-4 text-zinc-500 capitalize text-xs">
                                {acct.subtype || <span className="text-zinc-700">—</span>}
                              </td>
                              <td className={`px-5 py-2.5 text-right font-semibold tabular-nums text-sm ${(acct.balance ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(acct.balance ?? 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Section 2: Recent Journal Entries ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Recent Journal Entries</h2>
            <p className="text-sm text-zinc-500">{entries.length} entries (last 20)</p>
          </div>

          {entries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <DollarSign className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No journal entries yet</p>
                <p className="text-sm">Transactions will generate journal entries automatically</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-5 pb-3 pt-4 font-medium">Reference</th>
                        <th className="text-left pb-3 pt-4 font-medium">Date</th>
                        <th className="text-left pb-3 pt-4 font-medium">Description</th>
                        <th className="text-right pb-3 pt-4 font-medium">Lines</th>
                        <th className="text-right pb-3 pt-4 font-medium">Total Debits</th>
                        <th className="text-right px-5 pb-3 pt-4 font-medium">Total Credits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {entries.map(entry => {
                        const totalDebits = entry.lines.reduce((sum, l) => sum + (l.debit ?? 0), 0)
                        const totalCredits = entry.lines.reduce((sum, l) => sum + (l.credit ?? 0), 0)
                        return (
                          <tr key={entry.id} className="hover:bg-zinc-900/50">
                            <td className="px-5 py-3 font-mono text-xs text-zinc-300">{entry.reference}</td>
                            <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                              {formatDate(entry.date)}
                            </td>
                            <td className="py-3 pr-4 text-zinc-400 max-w-[260px] truncate" title={entry.description ?? ''}>
                              {entry.description || <span className="text-zinc-600">—</span>}
                            </td>
                            <td className="py-3 pr-4 text-right text-zinc-400">{entry.lines.length}</td>
                            <td className="py-3 pr-4 text-right font-semibold text-emerald-400 tabular-nums">
                              {formatCurrency(totalDebits)}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold text-emerald-400 tabular-nums">
                              {formatCurrency(totalCredits)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

      </main>
    </>
  )
}
