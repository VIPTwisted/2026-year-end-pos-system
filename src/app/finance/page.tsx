import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, AlertCircle } from 'lucide-react'

const ACCOUNT_TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
type AccountType = typeof ACCOUNT_TYPE_ORDER[number]

const TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
}

function agingBucket(days: number): { label: string; variant: 'success' | 'default' | 'warning' | 'destructive' } {
  if (days <= 30)  return { label: 'Current',  variant: 'success' }
  if (days <= 60)  return { label: '31-60 days', variant: 'default' }
  if (days <= 90)  return { label: '61-90 days', variant: 'warning' }
  return           { label: '90+ days',  variant: 'destructive' }
}

export default async function FinancePage() {
  const now = new Date()

  const [accounts, entries, unpaidOrders] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: 'asc' } }),
    prisma.journalEntry.findMany({
      include: { lines: { include: { account: true } } },
      orderBy: { date: 'desc' },
      take: 20,
    }),
    prisma.order.findMany({
      where: { status: { notIn: ['paid', 'voided'] } },
      include: { customer: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // Group accounts by type
  const grouped = accounts.reduce<Record<string, typeof accounts>>(
    (acc, acct) => {
      const key = acct.type as string
      if (!acc[key]) acc[key] = []
      acc[key].push(acct)
      return acc
    },
    {}
  )

  // AR aging buckets
  const arRows = unpaidOrders.map(order => {
    const days = Math.floor((now.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    return { order, days, bucket: agingBucket(days) }
  })

  const bucketTotals = {
    current:  arRows.filter(r => r.days <= 30).reduce((s, r) => s + r.order.totalAmount, 0),
    d31_60:   arRows.filter(r => r.days > 30 && r.days <= 60).reduce((s, r) => s + r.order.totalAmount, 0),
    d61_90:   arRows.filter(r => r.days > 60 && r.days <= 90).reduce((s, r) => s + r.order.totalAmount, 0),
    d90plus:  arRows.filter(r => r.days > 90).reduce((s, r) => s + r.order.totalAmount, 0),
  }
  const arTotal = Object.values(bucketTotals).reduce((a, b) => a + b, 0)

  return (
    <>
      <TopBar title="Finance & Accounting" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* ── Section 1: Chart of Accounts ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Chart of Accounts</h2>
            <p className="text-sm text-zinc-500">{accounts.length} accounts</p>
          </div>

          {accounts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <DollarSign className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No accounts yet</p>
                <p className="text-sm">Add accounts to build your chart of accounts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ACCOUNT_TYPE_ORDER.filter(type => (grouped[type] ?? []).length > 0).map(type => {
                const typeAccounts = grouped[type] ?? []
                const typeTotal = typeAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
                return (
                  <Card key={type}>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
                      <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
                        {TYPE_LABELS[type]}
                      </h3>
                      <span className={`text-sm font-semibold tabular-nums ${typeTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(typeTotal)}
                      </span>
                    </div>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800/60 text-zinc-500 text-xs uppercase tracking-wide">
                            <th className="text-left px-5 py-2 font-medium">Code</th>
                            <th className="text-left py-2 font-medium">Name</th>
                            <th className="text-left py-2 font-medium">Subtype</th>
                            <th className="text-right px-5 py-2 font-medium">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40">
                          {typeAccounts.map(acct => (
                            <tr key={acct.id} className="hover:bg-zinc-900/40">
                              <td className="px-5 py-2.5 font-mono text-xs text-zinc-400">{acct.code}</td>
                              <td className="py-2.5 pr-4 text-zinc-300">
                                {acct.name}
                                {!acct.isActive && (
                                  <span className="ml-2 text-xs text-zinc-600">(inactive)</span>
                                )}
                              </td>
                              <td className="py-2.5 pr-4 text-zinc-500 capitalize text-xs">
                                {acct.subtype || <span className="text-zinc-700">—</span>}
                              </td>
                              <td className={`px-5 py-2.5 text-right font-semibold tabular-nums text-sm ${(acct.balance ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(acct.balance ?? 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Section 2: AR Aging ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Accounts Receivable Aging</h2>
            <p className="text-sm text-zinc-500">
              {unpaidOrders.length} unpaid orders · {formatCurrency(arTotal)} total outstanding
            </p>
          </div>

          {unpaidOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-1">No outstanding receivables</p>
                <p className="text-sm">All orders are paid or voided</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Aging summary cards */}
              <div className="grid grid-cols-4 gap-4 mb-5">
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Current (0-30d)</p>
                    <p className="text-xl font-bold text-emerald-400 tabular-nums">
                      {formatCurrency(bucketTotals.current)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {arRows.filter(r => r.days <= 30).length} orders
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">31-60 Days</p>
                    <p className="text-xl font-bold text-zinc-200 tabular-nums">
                      {formatCurrency(bucketTotals.d31_60)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {arRows.filter(r => r.days > 30 && r.days <= 60).length} orders
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">61-90 Days</p>
                    <p className="text-xl font-bold text-amber-400 tabular-nums">
                      {formatCurrency(bucketTotals.d61_90)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {arRows.filter(r => r.days > 60 && r.days <= 90).length} orders
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">90+ Days</p>
                    <p className="text-xl font-bold text-red-400 tabular-nums">
                      {formatCurrency(bucketTotals.d90plus)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {arRows.filter(r => r.days > 90).length} orders
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* AR detail table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                          <th className="text-left px-5 pb-3 pt-4 font-medium">Order #</th>
                          <th className="text-left pb-3 pt-4 font-medium">Customer</th>
                          <th className="text-left pb-3 pt-4 font-medium">Date</th>
                          <th className="text-right pb-3 pt-4 font-medium">Days Out</th>
                          <th className="text-right pb-3 pt-4 font-medium">Amount</th>
                          <th className="text-center pb-3 pt-4 font-medium">Status</th>
                          <th className="text-center px-5 pb-3 pt-4 font-medium">Bucket</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {arRows.map(({ order, days, bucket }) => (
                          <tr key={order.id} className="hover:bg-zinc-900/50">
                            <td className="px-5 py-3 font-mono text-xs text-zinc-300">
                              {order.orderNumber}
                            </td>
                            <td className="py-3 pr-4 text-zinc-400">
                              {order.customer
                                ? `${order.customer.firstName} ${order.customer.lastName}`
                                : <span className="text-zinc-600">Guest</span>}
                            </td>
                            <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${days > 90 ? 'text-red-400' : days > 60 ? 'text-amber-400' : 'text-zinc-300'}`}>
                              {days}d
                            </td>
                            <td className="py-3 pr-4 text-right font-semibold text-emerald-400 tabular-nums">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <Badge variant="secondary" className="capitalize">
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <Badge variant={bucket.variant}>{bucket.label}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </section>

        {/* ── Section 3: Recent Journal Entries ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Recent Journal Entries</h2>
            <p className="text-sm text-zinc-500">{entries.length} entries (last 20)</p>
          </div>

          {entries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <DollarSign className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No journal entries yet</p>
                <p className="text-sm">Transactions will generate journal entries automatically</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-5 pb-3 pt-4 font-medium">Reference</th>
                        <th className="text-left pb-3 pt-4 font-medium">Date</th>
                        <th className="text-left pb-3 pt-4 font-medium">Description</th>
                        <th className="text-right pb-3 pt-4 font-medium">Lines</th>
                        <th className="text-right pb-3 pt-4 font-medium">Total Debits</th>
                        <th className="text-right px-5 pb-3 pt-4 font-medium">Total Credits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {entries.map(entry => {
                        const totalDebits = entry.lines.reduce((sum, l) => sum + (l.debit ?? 0), 0)
                        const totalCredits = entry.lines.reduce((sum, l) => sum + (l.credit ?? 0), 0)
                        return (
                          <tr key={entry.id} className="hover:bg-zinc-900/50">
                            <td className="px-5 py-3 font-mono text-xs text-zinc-300">{entry.reference}</td>
                            <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                              {formatDate(entry.date)}
                            </td>
                            <td className="py-3 pr-4 text-zinc-400 max-w-[260px] truncate" title={entry.description ?? ''}>
                              {entry.description || <span className="text-zinc-600">—</span>}
                            </td>
                            <td className="py-3 pr-4 text-right text-zinc-400">{entry.lines.length}</td>
                            <td className="py-3 pr-4 text-right font-semibold text-emerald-400 tabular-nums">
                              {formatCurrency(totalDebits)}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold text-emerald-400 tabular-nums">
                              {formatCurrency(totalCredits)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

      </main>
    </>
  )
}
