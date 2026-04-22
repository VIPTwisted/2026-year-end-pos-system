export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { ArrowUpDown } from 'lucide-react'

const TX_TYPES = ['earn', 'redeem', 'adjust', 'expire', 'enroll']

function typeBadge(type: string) {
  const map: Record<string, string> = {
    earn:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    redeem: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    adjust: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    expire: 'bg-red-500/15 text-red-400 border-red-500/30',
    enroll: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  }
  return map[type.toLowerCase()] ?? map.adjust
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type: filterType } = await searchParams

  const transactions = await prisma.loyaltyTransaction.findMany({
    where: filterType && filterType !== 'ALL' ? { type: filterType.toLowerCase() } : {},
    include: {
      card: {
        select: {
          id: true,
          cardNumber: true,
          customerId: true,
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  return (
    <>
      <TopBar title="Loyalty Transactions" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Loyalty Transactions</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{transactions.length} records</p>
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link
            href="/loyalty/transactions"
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${!filterType || filterType === 'ALL' ? 'bg-blue-600/20 text-blue-400' : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'}`}
          >
            All ({transactions.length})
          </Link>
          {TX_TYPES.map(t => {
            const count = transactions.filter(tx => tx.type.toLowerCase() === t).length
            return (
              <Link
                key={t}
                href={`/loyalty/transactions?type=${t}`}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${filterType?.toLowerCase() === t ? 'bg-blue-600/20 text-blue-400' : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)} ({count})
              </Link>
            )
          })}
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Transaction Log</span>
          <div className="flex-1 h-px bg-zinc-800/60" />
        </div>

        {transactions.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-500">
            <ArrowUpDown className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-[13px] font-medium text-zinc-300 mb-1">No transactions found</p>
            <p className="text-[13px]">Transactions will appear here as members earn and redeem points</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Date</th>
                    <th className="text-left py-2.5 font-medium">Customer</th>
                    <th className="text-left py-2.5 font-medium">Card #</th>
                    <th className="text-left py-2.5 font-medium">Type</th>
                    <th className="text-right py-2.5 font-medium">Points</th>
                    <th className="text-left py-2.5 font-medium">Order</th>
                    <th className="text-left px-4 py-2.5 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr
                      key={tx.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== transactions.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-zinc-400 text-[11px] whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-300 whitespace-nowrap">
                        <Link href={`/customers/${tx.card.customerId}`} className="hover:text-zinc-100">
                          {tx.card.customer.firstName} {tx.card.customer.lastName}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-[13px]">
                        <Link href={`/loyalty/cards/${tx.cardId}`} className="text-blue-400 hover:underline">
                          {tx.card.cardNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${typeBadge(tx.type)}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-2.5 pr-4 text-right font-mono font-bold tabular-nums ${tx.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.points >= 0 ? '+' : ''}{tx.points.toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 text-[11px]">
                        {tx.orderId ? (
                          <Link href={`/orders/${tx.orderId}`} className="text-blue-400 hover:underline font-mono">
                            {tx.orderId.slice(0, 8)}…
                          </Link>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500 text-[11px] max-w-xs truncate">
                        {tx.description ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
