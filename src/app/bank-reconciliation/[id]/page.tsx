import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, Landmark, CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { notFound } from 'next/navigation'

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const MATCH_STYLES: Record<string, string> = {
  unmatched: 'bg-zinc-700/50 text-zinc-500 border-zinc-700',
  matched: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  manual: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

const MATCH_ICONS: Record<string, typeof Circle> = {
  unmatched: Circle,
  matched: CheckCircle,
  manual: AlertCircle,
}

const TYPE_COLORS: Record<string, string> = {
  deposit: 'text-emerald-400',
  withdrawal: 'text-red-400',
  fee: 'text-amber-400',
  interest: 'text-blue-400',
}

export default async function BankReconciliationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const statement = await prisma.bankStatement.findUnique({
    where: { id },
    include: {
      bankAccount: true,
      lines: { orderBy: { transactionDate: 'asc' } },
    },
  })

  if (!statement) notFound()

  const matched = statement.lines.filter(l => l.matchingStatus === 'matched' || l.matchingStatus === 'manual').length
  const unmatched = statement.lines.filter(l => l.matchingStatus === 'unmatched').length
  const matchPct = statement.lines.length > 0 ? Math.round((matched / statement.lines.length) * 100) : 0

  const deposits = statement.lines.filter(l => l.amount > 0).reduce((s, l) => s + l.amount, 0)
  const withdrawals = statement.lines.filter(l => l.amount < 0).reduce((s, l) => s + l.amount, 0)

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/bank-reconciliation" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs">
          <ChevronLeft className="w-3 h-3" /> Bank Reconciliation
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-zinc-500" />
          {statement.bankAccount.bankName} — {new Date(statement.statementDate).toLocaleDateString()}
        </h1>
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs border ${
          statement.status === 'reconciled'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : statement.status === 'in_progress'
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            : 'bg-zinc-700/50 text-zinc-400 border-zinc-700'
        }`}>
          {statement.status.replace('_', ' ')}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Opening Balance', value: fmt(statement.openingBalance), color: 'text-zinc-300' },
          { label: 'Closing Balance', value: fmt(statement.closingBalance), color: 'text-zinc-100' },
          { label: 'Total Deposits', value: fmt(deposits), color: 'text-emerald-400' },
          { label: 'Total Withdrawals', value: fmt(withdrawals), color: 'text-red-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-2">{k.label}</div>
            <div className={`text-xl font-bold font-mono ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Match progress */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Matching Progress</p>
          <span className="text-xs text-zinc-400">{matched}/{statement.lines.length} lines matched ({matchPct}%)</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${matchPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {matched} matched</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600" /> {unmatched} unmatched</span>
        </div>
      </section>

      {/* Statement Lines */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
          Statement Lines ({statement.lines.length})
        </p>
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Date</th>
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Description</th>
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Type</th>
                <th className="text-right px-4 py-2.5 font-medium uppercase tracking-widest">Amount</th>
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Reference</th>
                <th className="text-left px-4 py-2.5 font-medium uppercase tracking-widest">Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {statement.lines.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-600">No statement lines</td></tr>
              ) : statement.lines.map(line => {
                const MatchIcon = MATCH_ICONS[line.matchingStatus] ?? Circle
                return (
                  <tr key={line.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-400 font-mono">
                      {new Date(line.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-200 max-w-[220px] truncate" title={line.description}>
                      {line.description}
                    </td>
                    <td className={`px-4 py-3 capitalize ${TYPE_COLORS[line.transactionType] ?? 'text-zinc-400'}`}>
                      {line.transactionType}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-medium ${line.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {line.amount >= 0 ? '+' : ''}{fmt(line.amount)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 font-mono">{line.reference ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${MATCH_STYLES[line.matchingStatus] ?? MATCH_STYLES.unmatched}`}>
                        <MatchIcon className="w-2.5 h-2.5" />
                        {line.matchingStatus}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Actions */}
      {statement.status !== 'reconciled' && (
        <div className="flex justify-end gap-3">
          <p className="text-xs text-zinc-600 self-center">
            Note: Schema additions needed for full auto-match engine (GL entry cross-reference).
          </p>
          <button className="px-4 py-2 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">
            Auto-Match Lines
          </button>
          <button className="px-4 py-2 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 rounded transition-colors">
            Post Reconciliation
          </button>
        </div>
      )}
    </main>
  )
}
