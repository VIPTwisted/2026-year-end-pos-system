export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gift, Plus, CreditCard, DollarSign, CheckCircle, Clock } from 'lucide-react'

function statusVariant(status: string): 'success' | 'destructive' | 'warning' | 'secondary' | 'default' {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'secondary'
    case 'voided': return 'destructive'
    default: return 'default'
  }
}

export default async function GiftCardsPage() {
  const now = new Date()
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [cards, programs, recentTxs] = await Promise.all([
    prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: { program: { select: { name: true } } },
    }),
    prisma.giftCardProgram.findMany({ orderBy: { name: 'asc' } }),
    prisma.giftCardTx.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { card: { select: { cardNumber: true } } },
    }),
  ])

  const activeCards      = cards.filter(c => c.status === 'active' && (!c.expiresAt || c.expiresAt >= now))
  const totalIssued      = cards.length
  const activeBalance    = activeCards.reduce((s, c) => s + c.balance, 0)
  const partiallyUsed    = cards.filter(c => c.balance < c.initialAmt && c.balance > 0).length
  const expiringSoon     = activeCards.filter(c => c.expiresAt && c.expiresAt <= thirtyDaysOut).length

  return (
    <>
      <TopBar title="Gift Cards" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Gift Card Management</h2>
            <p className="text-sm text-zinc-500">{totalIssued} cards · {programs.length} programs</p>
          </div>
          <div className="flex gap-2">
            <Link href="/gift-cards/programs">
              <Button variant="outline" size="sm">Programs</Button>
            </Link>
            <Link href="/gift-cards/issue">
              <Button><Plus className="w-4 h-4 mr-1" />Issue Card</Button>
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Gift, color: 'text-blue-400', label: 'Total Issued', value: totalIssued, sub: `${programs.length} programs` },
            { icon: DollarSign, color: 'text-emerald-400', label: 'Active Balance', value: `$${activeBalance.toFixed(2)}`, sub: `${activeCards.length} active cards` },
            { icon: CheckCircle, color: 'text-amber-400', label: 'Partially Used', value: partiallyUsed, sub: 'partial balance remaining' },
            { icon: Clock, color: 'text-red-400', label: 'Expiring Soon', value: expiringSoon, sub: 'within 30 days' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{k.label}</p>
                </div>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-zinc-600 mt-1">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Programs grid */}
        {programs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Programs</h3>
            <div className="grid grid-cols-3 gap-3">
              {programs.map(p => (
                <Card key={p.id}>
                  <CardContent className="pt-4 pb-4">
                    <p className="font-medium text-zinc-100 text-sm">{p.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Prefix: <span className="font-mono">{p.prefix}</span>
                      {p.defaultAmt && <> · Default ${p.defaultAmt.toFixed(2)}</>}
                    </p>
                    {p.description && <p className="text-xs text-zinc-600 mt-1 truncate">{p.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cards table */}
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
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">All Cards</h3>
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
                    <th className="text-left pb-3 font-medium">Issued</th>
                    <th className="text-left pb-3 font-medium">Expires</th>
                    <th className="text-center pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {cards.map(card => (
                    <tr key={card.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-100 tracking-wider">{card.cardNumber}</td>
                      <td className="py-3 pr-4 text-xs text-zinc-400">{card.program?.name ?? '—'}</td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                        <span className={card.balance > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                          ${card.balance.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums text-xs">${card.initialAmt.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={statusVariant(card.status)}>{card.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{card.customerName || (card.customerId ? <span className="font-mono">{card.customerId.slice(0, 8)}…</span> : '—')}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{new Date(card.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                      <td className="py-3 pr-4 text-xs">
                        {card.expiresAt
                          ? <span className={card.expiresAt < now ? 'text-red-400' : 'text-zinc-400'}>{new Date(card.expiresAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                          : <span className="text-zinc-600">No expiry</span>}
                      </td>
                      <td className="py-3 text-center">
                        <Link href={`/gift-cards/${card.id}`} className="text-xs text-blue-400 hover:text-blue-300">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        {recentTxs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-left pb-3 font-medium">Card #</th>
                    <th className="text-left pb-3 font-medium">Type</th>
                    <th className="text-right pb-3 font-medium">Amount</th>
                    <th className="text-left pb-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recentTxs.map(tx => (
                    <tr key={tx.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 text-zinc-400 text-xs">{new Date(tx.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-zinc-300">{tx.card?.cardNumber}</td>
                      <td className="py-2.5 pr-4 text-xs capitalize text-zinc-300">{tx.txType}</td>
                      <td className="py-2.5 pr-4 text-right font-mono text-xs text-emerald-400">${tx.amount.toFixed(2)}</td>
                      <td className="py-2.5 text-xs text-zinc-500">{tx.reference || '—'}</td>
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
