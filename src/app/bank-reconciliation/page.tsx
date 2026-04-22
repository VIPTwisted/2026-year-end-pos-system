export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Landmark, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react'

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  reconciled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export default async function BankReconciliationPage() {
  const [accounts, statements] = await Promise.all([
    prisma.bankAccount.findMany({ where: { isActive: true }, orderBy: { isPrimary: 'desc' } }),
    prisma.bankStatement.findMany({
      include: {
        bankAccount: true,
        _count: { select: { lines: true } },
      },
      orderBy: { statementDate: 'desc' },
      take: 50,
    }),
  ])

  const pendingCount = statements.filter(s => s.status === 'pending').length
  const inProgressCount = statements.filter(s => s.status === 'in_progress').length
  const reconciledCount = statements.filter(s => s.status === 'reconciled').length
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0)

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Bank Reconciliation</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Business Central — match bank statements to GL entries</p>
        </div>
        <Link
          href="/bank-reconciliation/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
        >
          Import Statement
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Bank Balance', value: fmt(totalBalance), icon: Landmark, color: 'text-zinc-100', bg: 'bg-[#16213e]' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/5' },
          { label: 'In Progress', value: inProgressCount, icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-400/5' },
          { label: 'Reconciled', value: reconciledCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
        ].map(k => {
          const Icon = k.icon
          return (
            <div key={k.label} className={`${k.bg} border border-zinc-800/50 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-500">{k.label}</span>
              </div>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            </div>
          )
        })}
      </div>

      {/* Bank Accounts */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Bank Accounts</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {accounts.length === 0 ? (
            <p className="text-xs text-zinc-600">No bank accounts configured. Add via Finance &gt; Bank module.</p>
          ) : accounts.map(acct => (
            <div key={acct.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-200">{acct.bankName}</span>
                </div>
                {acct.isPrimary && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Primary</span>
                )}
              </div>
              <div className="text-xs text-zinc-500 mb-1">
                {acct.accountCode} · {acct.accountType} · {acct.currency}
              </div>
              <div className="text-sm font-bold text-zinc-100">{fmt(acct.currentBalance)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Statements */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Bank Statements</p>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Bank</th>
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Statement Date</th>
                <th className="text-right px-4 py-2.5 font-medium uppercase tracking-widest">Opening</th>
                <th className="text-right px-4 py-2.5 font-medium uppercase tracking-widest">Closing</th>
                <th className="text-right px-4 py-2.5 font-medium uppercase tracking-widest">Difference</th>
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Lines</th>
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {statements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-600">
                    No statements imported yet. Import a bank statement to begin reconciliation.
                  </td>
                </tr>
              ) : statements.map(stmt => {
                const diff = stmt.closingBalance - stmt.openingBalance
                return (
                  <tr key={stmt.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-200">{stmt.bankAccount.bankName}</div>
                      <div className="text-zinc-600">{stmt.bankAccount.accountCode}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(stmt.statementDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400 font-mono">{fmt(stmt.openingBalance)}</td>
                    <td className="px-4 py-3 text-right text-zinc-200 font-mono font-medium">{fmt(stmt.closingBalance)}</td>
                    <td className={`px-4 py-3 text-right font-mono font-medium ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {diff >= 0 ? '+' : ''}{fmt(diff)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{stmt._count.lines}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[stmt.status] ?? STATUS_STYLES.pending}`}>
                        {stmt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/bank-reconciliation/${stmt.id}`}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        Reconcile <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
