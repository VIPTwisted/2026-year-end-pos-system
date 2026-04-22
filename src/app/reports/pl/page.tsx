export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'

export default async function PLPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const params = await searchParams
  const today = new Date()

  const [revenueAccounts, expenseAccounts, fiscalYears] = await Promise.all([
    prisma.account.findMany({
      where: { type: 'revenue', isActive: true },
      orderBy: { code: 'asc' },
    }),
    prisma.account.findMany({
      where: { type: 'expense', isActive: true },
      orderBy: { code: 'asc' },
    }),
    prisma.fiscalYear.findMany({
      orderBy: { startDate: 'desc' },
      take: 5,
    }),
  ])

  const activeFiscalYear = params.year
    ? fiscalYears.find(fy => fy.id === params.year) ?? fiscalYears[0]
    : fiscalYears.find(fy => fy.status === 'open') ?? fiscalYears[0]

  const totalRevenue = revenueAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
  const totalExpenses = expenseAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
  const netIncome = totalRevenue - totalExpenses
  const grossMarginPct = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0

  const fiscalLabel = activeFiscalYear?.name ?? 'All Periods'

  return (
    <>
      <TopBar title="Profit & Loss Statement" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/reports">
                <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-400 hover:text-zinc-100 -ml-2">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Reports
                </Button>
              </Link>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Profit & Loss Statement</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {fiscalLabel} &nbsp;·&nbsp; As of {formatDate(today)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className={`text-sm px-3 py-1 ${grossMarginPct >= 0 ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10'}`}
            >
              {grossMarginPct.toFixed(1)}% margin
            </Badge>
            <Button variant="outline" size="sm" className="gap-2 border-zinc-700 text-zinc-300" disabled>
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Revenue Section */}
        <Card>
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Revenue</h3>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5 font-medium">Code</th>
                  <th className="text-left py-2.5 font-medium">Account Name</th>
                  <th className="text-right px-5 py-2.5 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {revenueAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-zinc-600 text-sm">
                      No revenue accounts found
                    </td>
                  </tr>
                ) : (
                  revenueAccounts.map(acct => (
                    <tr key={acct.id} className="hover:bg-zinc-900/40">
                      <td className="px-5 py-2.5 font-mono text-xs text-zinc-400">{acct.code}</td>
                      <td className="py-2.5 pr-4 text-zinc-300">{acct.name}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-emerald-400">
                        {formatCurrency(acct.balance ?? 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700 bg-zinc-900/40">
                  <td colSpan={2} className="px-5 py-3 text-sm font-bold text-zinc-100">
                    Total Revenue
                  </td>
                  <td className="px-5 py-3 text-right text-base font-bold text-emerald-400 tabular-nums">
                    {formatCurrency(totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card>
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Expenses</h3>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5 font-medium">Code</th>
                  <th className="text-left py-2.5 font-medium">Account Name</th>
                  <th className="text-right px-5 py-2.5 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {expenseAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-zinc-600 text-sm">
                      No expense accounts found
                    </td>
                  </tr>
                ) : (
                  expenseAccounts.map(acct => (
                    <tr key={acct.id} className="hover:bg-zinc-900/40">
                      <td className="px-5 py-2.5 font-mono text-xs text-zinc-400">{acct.code}</td>
                      <td className="py-2.5 pr-4 text-zinc-300">{acct.name}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-red-400">
                        {formatCurrency(acct.balance ?? 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700 bg-zinc-900/40">
                  <td colSpan={2} className="px-5 py-3 text-sm font-bold text-zinc-100">
                    Total Expenses
                  </td>
                  <td className="px-5 py-3 text-right text-base font-bold text-red-400 tabular-nums">
                    {formatCurrency(totalExpenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Net Income Footer */}
        <Card className="border-zinc-700">
          <CardContent className="py-6 px-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Net Income</p>
                <p className="text-sm text-zinc-400">Total Revenue − Total Expenses</p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold tabular-nums ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(netIncome)}
                </p>
                <Badge
                  variant="secondary"
                  className={`mt-2 ${grossMarginPct >= 0 ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10'}`}
                >
                  {grossMarginPct.toFixed(2)}% gross margin
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </>
  )
}
