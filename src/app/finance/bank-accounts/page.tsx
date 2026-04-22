export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit2, Trash2, ChevronRight, RefreshCw, FileText } from 'lucide-react'

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

function maskAccount(num: string) {
  if (num.length <= 4) return num
  return '•••• ' + num.slice(-4)
}

export default async function BankAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; currency?: string; blocked?: string }>
}) {
  const sp = await searchParams
  const filterSearch = sp.search ?? ''
  const filterCurrency = sp.currency ?? ''
  const filterBlocked = sp.blocked ?? ''

  const accounts = await prisma.bankAccount.findMany({
    where: {
      ...(filterSearch ? {
        OR: [
          { accountCode: { contains: filterSearch } },
          { bankName: { contains: filterSearch } },
          { name: { contains: filterSearch } },
          { accountNumber: { contains: filterSearch } },
        ],
      } : {}),
      ...(filterCurrency ? { currency: filterCurrency } : {}),
      ...(filterBlocked === 'yes' ? { isActive: false } : {}),
      ...(filterBlocked === 'no' ? { isActive: true } : {}),
    },
    include: {
      reconciliations: {
        orderBy: { statementDate: 'desc' },
        take: 1,
        select: { statementDate: true, statementNo: true },
      },
      _count: { select: { transactions: { where: { isReconciled: false } } } },
    },
    orderBy: { accountCode: 'asc' },
  })

  const buildHref = (overrides: Record<string, string>) => {
    const p = { search: filterSearch, currency: filterCurrency, blocked: filterBlocked, ...overrides }
    const qs = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    return `/finance/bank-accounts${qs ? '?' + qs : ''}`
  }

  const currencies = Array.from(new Set(accounts.map(a => a.currency))).sort()

  const actions = (
    <div className="flex items-center gap-1.5">
      <Link
        href="/finance/bank-accounts/new"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> New
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <div className="w-px h-5 bg-zinc-700 mx-1" />
      <Link
        href="/finance/bank-reconciliation"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
      >
        <FileText className="w-3.5 h-3.5" /> Bank Account Statement
      </Link>
      <Link
        href="/finance/bank-reconciliation"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Reconcile
      </Link>
    </div>
  )

  return (
    <>
      <TopBar
        title="Bank Accounts"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        {/* Filter Pane */}
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Search</div>
            <form>
              <input
                name="search"
                defaultValue={filterSearch}
                placeholder="No., Name, Bank…"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[12px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
              <input type="hidden" name="currency" value={filterCurrency} />
              <input type="hidden" name="blocked" value={filterBlocked} />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Currency</div>
            <div className="space-y-0.5">
              <Link
                href={buildHref({ currency: '' })}
                className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                  !filterCurrency ? 'bg-[rgba(99,102,241,0.15)] text-indigo-300' : 'text-zinc-400 hover:bg-[rgba(99,102,241,0.05)] hover:text-zinc-200'
                }`}
              >
                All Currencies
              </Link>
              {currencies.map(c => (
                <Link
                  key={c}
                  href={buildHref({ currency: c })}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    filterCurrency === c ? 'bg-[rgba(99,102,241,0.15)] text-indigo-300' : 'text-zinc-400 hover:bg-[rgba(99,102,241,0.05)] hover:text-zinc-200'
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Blocked</div>
            <div className="space-y-0.5">
              {[
                { value: '', label: 'All' },
                { value: 'no', label: 'Active' },
                { value: 'yes', label: 'Blocked' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={buildHref({ blocked: opt.value })}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    filterBlocked === opt.value
                      ? 'bg-[rgba(99,102,241,0.15)] text-indigo-300'
                      : 'text-zinc-400 hover:bg-[rgba(99,102,241,0.05)] hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Bank Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Bank Account No.</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance (LCY)</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Currency</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">SWIFT Code</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">IBAN</th>
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-zinc-500 text-[13px]">
                      No bank accounts.{' '}
                      <Link href="/finance/bank-accounts/new" className="text-indigo-400 hover:underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  accounts.map((account, idx) => (
                    <tr
                      key={account.id}
                      className={`hover:bg-[rgba(99,102,241,0.05)] transition-colors ${
                        idx !== accounts.length - 1 ? 'border-b border-zinc-800/40' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/finance/bank-accounts/${account.id}`}
                          className="font-mono text-[12px] text-indigo-400 hover:text-indigo-300"
                        >
                          {account.accountCode}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-200">
                        <Link href={`/finance/bank-accounts/${account.id}`} className="hover:text-white transition-colors">
                          {account.name ?? account.bankName}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400">{account.bankName}</td>
                      <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">
                        {maskAccount(account.accountNumber)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                        <span className={account.currentBalance < 0 ? 'text-red-400' : 'text-zinc-200'}>
                          {formatCurrency(account.currentBalance, account.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300">
                          {account.currency}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500 font-mono text-[12px]">
                        {account.swiftCode ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500 font-mono text-[12px]">
                        {account.ibanNumber ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-[12px] text-zinc-500">{accounts.length} records</div>
        </main>
      </div>
    </>
  )
}
