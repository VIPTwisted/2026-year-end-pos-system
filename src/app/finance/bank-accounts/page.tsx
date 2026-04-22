import Link from 'next/link'
import { prisma } from '@/lib/prisma'

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function maskAccount(num: string) {
  if (num.length <= 4) return num
  return '•••• ' + num.slice(-4)
}

function accountTypeBadge(type: string) {
  const map: Record<string, string> = {
    checking: 'bg-blue-500/10 text-blue-400',
    savings: 'bg-emerald-500/10 text-emerald-400',
    credit_line: 'bg-amber-500/10 text-amber-400',
  }
  return map[type] ?? 'bg-zinc-700 text-zinc-400'
}

export default async function BankAccountsPage() {
  const accounts = await prisma.bankAccount.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reconciliations: {
        where: { status: 'completed' },
        orderBy: { statementDate: 'desc' },
        take: 1,
        select: { statementDate: true },
      },
      _count: { select: { transactions: { where: { isReconciled: false } } } },
    },
  })

  const totalCash = accounts.reduce((s, a) => s + a.currentBalance, 0)
  const needsReconciliation = accounts.filter((a) => a._count.transactions > 0).length
  const activeAccounts = accounts.filter((a) => a.isActive).length

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Top Bar */}
      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Finance</span>
          <h1 className="text-base font-semibold text-zinc-100 leading-tight">Bank Accounts</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/finance/bank-accounts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Account
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Accounts</div>
            <div className="text-2xl font-bold text-zinc-100">{activeAccounts}</div>
            <div className="text-xs text-zinc-500 mt-1">{accounts.length} total including inactive</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Cash Position</div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(totalCash)}</div>
            <div className="text-xs text-zinc-500 mt-1">Across all active accounts</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Needs Reconciliation</div>
            <div className={`text-2xl font-bold tabular-nums ${needsReconciliation > 0 ? 'text-amber-400' : 'text-zinc-100'}`}>
              {needsReconciliation}
            </div>
            <div className="text-xs text-zinc-500 mt-1">Accounts with unreconciled transactions</div>
          </div>
        </div>

        {/* Account Cards */}
        {accounts.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <div className="text-zinc-500 text-sm">No bank accounts yet.</div>
            <Link
              href="/finance/bank-accounts/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Add your first account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const lastRecon = account.reconciliations[0]
              return (
                <div
                  key={account.id}
                  className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 flex flex-col gap-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        {account.bankName}
                      </div>
                      <div className="text-base font-semibold text-zinc-100 mt-0.5">
                        {account.name || account.accountCode}
                      </div>
                      <div className="font-mono text-sm text-zinc-400 mt-0.5">
                        {maskAccount(account.accountNumber)}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${accountTypeBadge(account.accountType)}`}
                    >
                      {account.accountType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Balance */}
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                      Current Balance
                    </div>
                    <div
                      className={`text-3xl font-bold tabular-nums ${
                        account.currentBalance < 0 ? 'text-red-400' : 'text-zinc-100'
                      }`}
                    >
                      {formatCurrency(account.currentBalance, account.currency)}
                    </div>
                  </div>

                  {/* Reconciliation info */}
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-zinc-500">Last reconciled: </span>
                      <span className="text-zinc-300">
                        {lastRecon
                          ? new Date(lastRecon.statementDate).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>
                    {account._count.transactions > 0 && (
                      <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[11px] font-medium">
                        {account._count.transactions} unreconciled
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                    <Link
                      href={`/finance/bank-accounts/${account.id}`}
                      className="flex-1 text-center py-1.5 text-sm text-zinc-300 hover:text-zinc-100 bg-zinc-800/50 hover:bg-zinc-800 rounded transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/finance/bank-accounts/${account.id}/reconcile`}
                      className="flex-1 text-center py-1.5 text-sm text-zinc-300 hover:text-zinc-100 bg-zinc-800/50 hover:bg-zinc-800 rounded transition-colors"
                    >
                      Reconcile
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
