export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
type AccountType = (typeof ACCOUNT_TYPE_ORDER)[number]

const TYPE_LABELS: Record<AccountType, string> = {
  asset:     'Assets',
  liability: 'Liabilities',
  equity:    'Equity',
  revenue:   'Revenue',
  expense:   'Expenses',
}

const TYPE_HEADER_BADGE: Record<AccountType, string> = {
  asset:     'bg-blue-500/10 text-blue-400',
  liability: 'bg-red-500/10 text-red-400',
  equity:    'bg-purple-500/10 text-purple-400',
  revenue:   'bg-emerald-500/10 text-emerald-400',
  expense:   'bg-amber-500/10 text-amber-400',
}

const TYPE_DOT: Record<AccountType, string> = {
  asset:     'bg-blue-500',
  liability: 'bg-red-500',
  equity:    'bg-purple-500',
  revenue:   'bg-emerald-500',
  expense:   'bg-amber-500',
}

// Normal balance derived from type (accounting convention)
function normalBalance(type: string): string {
  if (type === 'asset' || type === 'expense') return 'DR'
  return 'CR'
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ChartOfAccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { code: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      subtype: true,
      mainAccountType: true,
      balance: true,
      isActive: true,
    },
  })

  // Stats
  const total = accounts.length
  const countByType = ACCOUNT_TYPE_ORDER.reduce<Record<AccountType, number>>(
    (acc, t) => ({ ...acc, [t]: accounts.filter(a => a.type === t).length }),
    { asset: 0, liability: 0, equity: 0, revenue: 0, expense: 0 }
  )

  // Group by type
  const grouped = accounts.reduce<Record<string, typeof accounts>>((acc, a) => {
    const key = a.type
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const newAccountBtn = (
    <Link
      href="/finance/chart-of-accounts/new"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      New Account
    </Link>
  )

  return (
    <>
      <TopBar
        title="Chart of Accounts"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={newAccountBtn}
      />

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Chart of Accounts</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">{total} accounts across {ACCOUNT_TYPE_ORDER.filter(t => countByType[t] > 0).length} types</p>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total</div>
            <div className="text-2xl font-bold text-zinc-100">{total}</div>
            <div className="text-xs text-zinc-500 mt-1">accounts</div>
          </div>
          {ACCOUNT_TYPE_ORDER.map(t => (
            <div key={t} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{TYPE_LABELS[t]}</div>
              <div className={`text-2xl font-bold ${TYPE_HEADER_BADGE[t].split(' ')[1]}`}>{countByType[t]}</div>
              <div className="text-xs text-zinc-500 mt-1">accounts</div>
            </div>
          ))}
        </div>

        {/* ── Account Sections by Type ──────────────────────────────────────── */}
        {accounts.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-500">
            <p className="text-[13px]">No accounts yet.</p>
            <Link
              href="/finance/chart-of-accounts/new"
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] rounded transition-colors"
            >
              Create First Account
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {ACCOUNT_TYPE_ORDER.filter(t => (grouped[t] ?? []).length > 0).map(type => {
              const typeAccounts = grouped[type] ?? []

              return (
                <section key={type}>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${TYPE_DOT[type]}`} />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-widest ${TYPE_HEADER_BADGE[type]}`}>
                      {TYPE_LABELS[type]}
                    </span>
                    <span className="text-[11px] text-zinc-600">{typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}</span>
                    <div className="flex-1 h-px bg-zinc-800/60" />
                  </div>

                  {/* Account table */}
                  <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                          <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                          <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Subtype</th>
                          <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Normal Balance</th>
                          <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#16213e]">
                        {typeAccounts.map((acct, idx) => (
                          <tr
                            key={acct.id}
                            className={`hover:bg-zinc-800/30 transition-colors ${idx !== typeAccounts.length - 1 ? 'border-b border-zinc-800/40' : ''}`}
                          >
                            <td className="px-4 py-2.5">
                              <Link
                                href={`/finance/chart-of-accounts/${acct.id}`}
                                className="font-mono text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                {acct.code}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-6">
                              <Link
                                href={`/finance/chart-of-accounts/${acct.id}`}
                                className="text-zinc-200 hover:text-zinc-100 transition-colors"
                              >
                                {acct.name}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-6 text-zinc-500 text-[12px] capitalize">
                              {acct.subtype ?? <span className="text-zinc-700">—</span>}
                            </td>
                            <td className="py-2.5 pr-6 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                normalBalance(acct.type) === 'DR'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-purple-500/10 text-purple-400'
                              }`}>
                                {normalBalance(acct.type)}
                              </span>
                            </td>
                            <td className="py-2.5 pr-6 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                acct.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-zinc-700 text-zinc-400'
                              }`}>
                                {acct.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-sm">
                              <span className={(acct.balance ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {formatCurrency(acct.balance ?? 0)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
