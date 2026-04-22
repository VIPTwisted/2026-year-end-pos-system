import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeftRight, Plus, Users, AlertCircle, TrendingUp } from 'lucide-react'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'default',
  posted: 'warning',
  reconciled: 'success',
}

const TYPE_BADGE: Record<string, string> = {
  sending: 'text-amber-400',
  receiving: 'text-emerald-400',
}

export default async function IntercompanyPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [partners, transactions, monthTxs, unreconciledCount] = await Promise.all([
    prisma.intercompanyPartner.findMany({
      orderBy: { partnerCode: 'asc' },
      include: { _count: { select: { transactions: true } } },
    }),
    prisma.intercompanyTransaction.findMany({
      orderBy: { postingDate: 'desc' },
      take: 20,
      include: {
        partner: { select: { id: true, partnerCode: true, partnerName: true } },
      },
    }),
    prisma.intercompanyTransaction.findMany({
      where: { postingDate: { gte: monthStart } },
      select: { amountInBase: true },
    }),
    prisma.intercompanyTransaction.count({
      where: { status: 'posted', isEliminated: false },
    }),
  ])

  const monthVolume = monthTxs.reduce((s, t) => s + t.amountInBase, 0)
  const activePartners = partners.filter(p => p.isActive).length

  const kpis = [
    { label: 'Active Partners', value: activePartners, icon: Users, color: 'text-blue-400' },
    { label: 'Pending Transactions', value: transactions.filter(t => t.status === 'pending').length, icon: AlertCircle, color: 'text-amber-400' },
    { label: 'Posted Uneliminated', value: unreconciledCount, icon: ArrowLeftRight, color: 'text-red-400' },
    { label: 'IC Volume This Month', value: formatCurrency(monthVolume), icon: TrendingUp, color: 'text-emerald-400' },
  ]

  return (
    <>
      <TopBar title="Intercompany Transactions" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Intercompany</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Related-party transactions between entities</p>
          </div>
          <Link href="/finance/intercompany/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> New Transaction
            </Button>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map(k => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">{k.label}</div>
                    <div className="text-xl font-bold text-zinc-100">{k.value}</div>
                  </div>
                  <k.icon className={`w-5 h-5 ${k.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Partners */}
          <div className="col-span-2">
            <Card>
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Partners</span>
              </div>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Code</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Name</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Type</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Txns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-zinc-600">No partners yet</td>
                      </tr>
                    )}
                    {partners.map(p => (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs text-blue-400">{p.partnerCode}</td>
                        <td className="px-4 py-2.5 text-zinc-300">{p.partnerName}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="secondary" className="text-xs capitalize">{p.partnerType}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right text-zinc-400">{p._count.transactions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <div className="col-span-3">
            <Card>
              <div className="px-4 py-3 border-b border-zinc-800">
                <span className="text-sm font-medium text-zinc-300">Recent Transactions</span>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">No.</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Partner</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Dir.</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Type</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Amount</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Status</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-zinc-600">No transactions yet</td>
                        </tr>
                      )}
                      {transactions.map(tx => (
                        <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-2.5">
                            <Link
                              href={`/finance/intercompany/${tx.id}`}
                              className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {tx.transactionNo}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5 text-zinc-300">{tx.partner.partnerCode}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-xs capitalize font-medium ${TYPE_BADGE[tx.direction] ?? 'text-zinc-400'}`}>
                              {tx.direction}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-zinc-400 capitalize text-xs">{tx.type}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-zinc-200">{formatCurrency(tx.amount)} {tx.currency}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant={STATUS_BADGE[tx.status] ?? 'secondary'} className="text-xs capitalize">
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-zinc-500 text-xs">{formatDate(tx.postingDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
