import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gift, Plus, CreditCard, DollarSign, CheckCircle, Clock } from 'lucide-react'

function statusVariant(status: string): 'success' | 'destructive' | 'warning' | 'secondary' | 'default' {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'secondary'
    case 'void': return 'destructive'
    default: return 'default'
  }
}

function resolveStatus(card: { status: string; expiresAt: Date | null }): string {
  if (card.status !== 'active') return card.status
  if (card.expiresAt && card.expiresAt < new Date()) return 'expired'
  return card.status
}

export default async function GiftCards2Page() {
  const [cards, programs] = await Promise.all([
    prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        program: { select: { name: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    }),
    prisma.giftCardProgram.count({ where: { isActive: true } }),
  ])

  const now = new Date()
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const activeCards = cards.filter(c => c.status === 'active' && (!c.expiresAt || c.expiresAt >= now))
  const totalIssuedValue = cards.reduce((s, c) => s + c.initialAmt, 0)
  const activeBalance = activeCards.reduce((s, c) => s + c.balance, 0)
  const redeemedCount = cards.filter(c => c.balance < c.initialAmt).length
  const expiringSoon = activeCards.filter(c => c.expiresAt && c.expiresAt <= thirtyDaysOut).length

  const recentTxs = cards.flatMap(c => c.transactions.map(tx => ({ ...tx, card: c }))).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10)

  return (
    <>
      <TopBar title="Gift Cards 2.0" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Gift Card Management</h2>
            <p className="text-sm text-zinc-500">{cards.length} cards · {programs} active programs</p>
          </div>
          <div className="flex gap-2">
            <Link href="/gift-cards/programs"><Button variant="outline" size="sm">Manage Programs</Button></Link>
            <Link href="/gift-cards/issue"><Button><Plus className="w-4 h-4 mr-1" />Issue Card</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Issued</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{cards.length}</p>
              <p className="text-xs text-zinc-600 mt-1">${totalIssuedValue.toFixed(2)} total value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Active Balance</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">${activeBalance.toFixed(2)}</p>
              <p className="text-xs text-zinc-600 mt-1">{activeCards.length} active cards</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Partially Used</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{redeemedCount}</p>
              <p className="text-xs text-zinc-600 mt-1">partial or full use</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-red-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Expiring Soon</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{expiringSoon}</p>
              <p className="text-xs text-zinc-600 mt-1">within 30 days</p>
            </CardContent>
          </Card>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <CreditCard className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No gift cards issued yet</p>
              <Link href="/gift-cards/issue" className="mt-3">
                <Button size="sm"><Plus className="w-3 h-3 mr-1" />Issue First Card</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Card #</th>
                  <th className="text-left pb-3 font-medium">Program</th>
                  <th className="text-right pb-3 font-medium">Balance</th>
                  <th className="text-right pb-3 font-medium">Initial</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Expires</th>
                  <th className="text-center pb-3 font-medium">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {cards.map(card => {
                  const status = resolveStatus(card)
                  return (
                    <tr key={card.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-100 tracking-wider">{card.cardNumber}</td>
                      <td className="py-3 pr-4 text-xs text-zinc-400">{card.program?.name || '—'}</td>
                      <td className="py-3 pr-4 text-right">
                        <span className={`font-semibold tabular-nums ${card.balance > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          ${card.balance.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums text-xs">${card.initialAmt.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-center"><Badge variant={statusVariant(status)}>{status}</Badge></td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{card.customerName || '—'}</td>
                      <td className="py-3 pr-4 text-xs">
                        {card.expiresAt
                          ? <span className={card.expiresAt < now ? 'text-red-400' : 'text-zinc-400'}>
                              {new Date(card.expiresAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                            </span>
                          : <span className="text-zinc-600">No expiry</span>}
                      </td>
                      <td className="py-3 text-center">
                        <Link href={`/gift-cards/${card.id}`} className="text-xs text-blue-400 hover:text-blue-300">View</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {recentTxs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Card</th>
                    <th className="text-left pb-3 font-medium">Type</th>
                    <th className="text-right pb-3 font-medium">Amount</th>
                    <th className="text-right pb-3 font-medium">Balance After</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recentTxs.map(tx => (
                    <tr key={tx.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 font-mono text-xs text-zinc-300">{tx.card.cardNumber}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={tx.txType === 'issue' ? 'success' : tx.txType === 'redeem' ? 'warning' : tx.txType === 'void' ? 'destructive' : 'secondary'}>
                          {tx.txType}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-mono text-zinc-200">${tx.amount.toFixed(2)}</td>
                      <td className="py-2.5 pr-4 text-right font-mono text-xs text-zinc-400">${tx.balanceAfter.toFixed(2)}</td>
                      <td className="py-2.5 text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
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
