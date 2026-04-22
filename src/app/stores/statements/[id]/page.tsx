export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import StatementActions from './StatementActions'

export default async function StatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const statement = await prisma.retailStatement.findUnique({
    where: { id },
    include: {
      store: true,
      tenderLines: true,
    },
  })
  if (!statement) notFound()

  const totalDeclared = statement.tenderLines.reduce((sum, t) => sum + t.declaredAmount, 0)
  const totalDifference = statement.tenderLines.reduce((sum, t) => sum + t.difference, 0)

  const STATUS_BADGE = {
    open: <Badge variant="default">Open</Badge>,
    calculated: <Badge variant="warning">Calculated</Badge>,
    posted: <Badge variant="success">Posted</Badge>,
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <TopBar title={`Statement — ${statement.statementNo}`} />
      <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl font-bold">{statement.statementNo}</span>
                {STATUS_BADGE[statement.status as keyof typeof STATUS_BADGE] ?? <Badge variant="outline">{statement.status}</Badge>}
              </div>
              <p className="text-zinc-400 text-sm">
                {statement.store.name} · Business Date: {new Date(statement.businessDate).toLocaleDateString()}
                · Method: {statement.statementMethod}
              </p>
            </div>
            <StatementActions id={statement.id} status={statement.status} />
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-zinc-800">
            {[
              { label: 'Net Sales', value: formatCurrency(statement.netSales) },
              { label: 'Total Discounts', value: formatCurrency(statement.totalDiscounts) },
              { label: 'Total Tax', value: formatCurrency(statement.totalTax) },
              { label: 'Net Payments', value: formatCurrency(statement.totalPayments) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-lg font-semibold text-zinc-100">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tender Lines */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-300">Tender Lines</h3>
          </div>
          {statement.tenderLines.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-sm">
              Run Calculate to populate tender lines
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/80 border-b border-zinc-800">
                <tr>
                  {['Tender Type', 'Expected', 'Declared', 'Difference'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {statement.tenderLines.map(line => {
                  const diff = line.declaredAmount - line.expectedAmount
                  const absDiff = Math.abs(diff)
                  return (
                    <tr key={line.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2 text-zinc-300 capitalize">{line.tenderType.replace('_', ' ')}</td>
                      <td className="px-4 py-2 text-zinc-300">{formatCurrency(line.expectedAmount)}</td>
                      <td className="px-4 py-2 text-zinc-300">{formatCurrency(line.declaredAmount)}</td>
                      <td className={`px-4 py-2 font-medium ${absDiff > 0.01 ? 'text-red-400' : 'text-zinc-500'}`}>
                        {absDiff > 0.01 ? formatCurrency(diff) : '—'}
                      </td>
                    </tr>
                  )
                })}
                {/* Total difference row */}
                <tr className="bg-zinc-800/50 border-t-2 border-zinc-700">
                  <td className="px-4 py-3 font-semibold text-zinc-200">Total</td>
                  <td className="px-4 py-3 font-semibold text-zinc-200">{formatCurrency(statement.totalPayments)}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-200">{formatCurrency(totalDeclared)}</td>
                  <td className={`px-4 py-3 text-xl font-bold ${Math.abs(totalDifference) > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatCurrency(totalDifference)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
