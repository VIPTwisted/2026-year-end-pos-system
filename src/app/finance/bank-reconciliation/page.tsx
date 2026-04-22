export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'

function fmt(d: Date | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default async function BankReconciliationListPage() {
  const reconciliations = await prisma.bankReconciliation.findMany({
    orderBy: { statementDate: 'desc' },
    take: 50,
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Bank Account Reconciliation" />
      <main className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/finance/bank-reconciliation/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Reconciliation
          </Link>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg p-4">
          <p className="text-xs text-zinc-400">{reconciliations.length} Reconciliation{reconciliations.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-[#16213e] border border-zinc-700 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Bank Account No.</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Statement No.</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Statement Date</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Balance Last Statement</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Statement Ending Balance</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-zinc-400">Total Difference</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500 text-sm">No bank reconciliations found. Create one to get started.</td></tr>
              )}
              {reconciliations.map((r, i) => {
                const diff = r.closingBalance - r.openingBalance
                const status = r.status
                return (
                  <tr key={r.id} className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                    <td className="px-4 py-2.5">
                      <Link href={`/finance/bank-reconciliation/${r.id}`} className="text-blue-400 hover:underline font-mono text-xs">{r.bankAccountId}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300 text-xs font-mono">{r.statementNo ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-300 text-xs">{fmt(r.statementDate)}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-300 text-xs font-mono">{fmtCurrency(r.openingBalance)}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-300 text-xs font-mono">{fmtCurrency(r.closingBalance)}</td>
                    <td className={`px-4 py-2.5 text-right text-xs font-mono font-semibold ${Math.abs(diff) < 0.01 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmtCurrency(diff)}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {status === 'completed' ? 'Completed' : 'Open'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
