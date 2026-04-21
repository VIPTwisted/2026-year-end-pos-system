import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gift, Plus } from 'lucide-react'

export default async function GiftCardsPage() {
  const cards = await prisma.giftCard.findMany({
    include: { customer: true, transactions: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalIssued = cards.length
  const totalBalance = cards.filter(c => c.isActive).reduce((sum, c) => sum + c.currentBalance, 0)
  const redeemedThisMonth = cards.flatMap(c => c.transactions).filter(t =>
    t.type === 'REDEEM' && new Date(t.createdAt) >= startOfMonth
  ).length
  const expiredCount = cards.filter(c => c.expiresAt && new Date(c.expiresAt) < now).length

  return (
    <>
      <TopBar title="Gift Cards" />
      <main className="flex-1 p-6 overflow-auto">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Issued</p>
              <p className="text-2xl font-bold text-zinc-100">{totalIssued}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Balance Outstanding</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalBalance)}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Redeemed This Month</p>
              <p className="text-2xl font-bold text-blue-400">{redeemedThisMonth}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Expired</p>
              <p className="text-2xl font-bold text-red-400">{expiredCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Gift Cards</h2>
            <p className="text-sm text-zinc-500">{cards.length} cards</p>
          </div>
          <Link href="/gift-cards/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" />Issue Gift Card
            </Button>
          </Link>
        </div>

        {cards.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Gift className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No gift cards yet</p>
              <p className="text-sm mb-4">Issue your first gift card to get started</p>
              <Link href="/gift-cards/new">
                <Button><Plus className="w-4 h-4 mr-1" />Issue Gift Card</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Card Number</th>
                  <th className="text-right pb-3 font-medium">Balance</th>
                  <th className="text-right pb-3 font-medium">Initial Value</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Issued</th>
                  <th className="text-left pb-3 font-medium">Expires</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {cards.map(card => {
                  const isExpired = card.expiresAt && new Date(card.expiresAt) < now
                  return (
                    <tr key={card.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs">
                        <Link
                          href={`/gift-cards/${card.id}`}
                          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        >
                          {card.cardNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400">
                        {formatCurrency(card.currentBalance)}
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400">
                        {formatCurrency(card.initialValue)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">
                        {card.customer
                          ? `${card.customer.firstName} ${card.customer.lastName}`
                          : <span className="text-zinc-600">Guest</span>}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                        {formatDate(card.issuedAt)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                        {card.expiresAt ? (
                          <span className={isExpired ? 'text-red-400' : ''}>
                            {formatDate(card.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-zinc-600">Never</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {!card.isActive ? (
                          <Badge variant="destructive">Voided</Badge>
                        ) : isExpired ? (
                          <Badge variant="warning">Expired</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
