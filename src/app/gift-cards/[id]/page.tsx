import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Gift } from 'lucide-react'
import { GiftCardActions } from './GiftCardActions'

export default async function GiftCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = await prisma.giftCard.findUnique({
    where: { id },
    include: {
      customer: true,
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!card) notFound()

  const now = new Date()
  const isExpired = card.expiresAt && new Date(card.expiresAt) < now

  const TRANSACTION_COLOR: Record<string, string> = {
    ISSUE: 'text-blue-400',
    RELOAD: 'text-emerald-400',
    REDEEM: 'text-amber-400',
    VOID: 'text-red-400',
    CASHOUT: 'text-purple-400',
  }

  return (
    <>
      <TopBar title={`Gift Card ${card.cardNumber}`} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            href="/gift-cards"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Gift Cards
          </Link>

          {/* Card Detail */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-mono">{card.cardNumber}</CardTitle>
                    <p className="text-xs text-zinc-500 mt-0.5">Issued {formatDate(card.issuedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!card.isActive ? (
                    <Badge variant="destructive">Voided</Badge>
                  ) : isExpired ? (
                    <Badge variant="warning">Expired</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Current Balance</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(card.currentBalance)}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Initial Value</p>
                  <p className="text-xl font-bold text-zinc-100">{formatCurrency(card.initialValue)}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Customer</p>
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {card.customer ? (
                      <Link href={`/customers/${card.customer.id}`} className="text-blue-400 hover:underline">
                        {card.customer.firstName} {card.customer.lastName}
                      </Link>
                    ) : (
                      <span className="text-zinc-500">Guest</span>
                    )}
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Expires</p>
                  <p className={`text-sm font-medium ${isExpired ? 'text-red-400' : 'text-zinc-200'}`}>
                    {card.expiresAt ? formatDate(card.expiresAt) : 'Never'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <GiftCardActions card={{ id: card.id, isActive: card.isActive }} />
            </CardContent>
          </Card>

          {/* Transaction History */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">
              Transaction History
              <span className="ml-2 text-sm font-normal text-zinc-500">({card.transactions.length})</span>
            </h2>

            {card.transactions.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-10 text-center text-zinc-500 text-sm">
                  No transactions yet
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 font-medium">Type</th>
                      <th className="text-right pb-3 font-medium">Amount</th>
                      <th className="text-right pb-3 font-medium">Before</th>
                      <th className="text-right pb-3 font-medium">After</th>
                      <th className="text-left pb-3 font-medium">Reference</th>
                      <th className="text-left pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {card.transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4">
                          <span className={`font-mono text-xs font-semibold ${TRANSACTION_COLOR[tx.type] ?? 'text-zinc-300'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${TRANSACTION_COLOR[tx.type] ?? 'text-zinc-300'}`}>
                          {tx.type === 'REDEEM' || tx.type === 'VOID' ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums">
                          {formatCurrency(tx.balanceBefore)}
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums font-medium">
                          {formatCurrency(tx.balanceAfter)}
                        </td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs">
                          {tx.reference ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-3 text-zinc-400 text-xs whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
