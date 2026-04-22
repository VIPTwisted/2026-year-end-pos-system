export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, CheckCircle, AlertTriangle } from 'lucide-react'

export default async function BalanceSheetPage() {
  const today = new Date()

  const [assetAccounts, liabilityAccounts, equityAccounts] = await Promise.all([
    prisma.account.findMany({
      where: { type: 'asset', isActive: true },
      orderBy: { code: 'asc' },
    }),
    prisma.account.findMany({
      where: { type: 'liability', isActive: true },
      orderBy: { code: 'asc' },
    }),
    prisma.account.findMany({
      where: { type: 'equity', isActive: true },
      orderBy: { code: 'asc' },
    }),
  ])

  const totalAssets = assetAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
  const totalEquity = equityAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
  const liabPlusEquity = totalLiabilities + totalEquity
  const isBalanced = Math.abs(totalAssets - liabPlusEquity) <= 1

  return (
    <>
      <TopBar title="Balance Sheet" />
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
            <h2 className="text-xl font-bold text-zinc-100">Balance Sheet</h2>
            <p className="text-sm text-zinc-500 mt-0.5">As of {formatDate(today)}</p>
          </div>
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <Badge variant="secondary" className="gap-1.5 text-emerald-400 border-emerald-400/20 bg-emerald-400/10">
                <CheckCircle className="w-3.5 h-3.5" />
                Balanced
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5 text-amber-400 border-amber-400/20 bg-amber-400/10">
                <AlertTriangle className="w-3.5 h-3.5" />
                Out of Balance
              </Badge>
            )}
            <Button variant="outline" size="sm" className="gap-2 border-zinc-700 text-zinc-300" disabled>
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-3 gap-6">

          {/* ASSETS */}
          <Card>
            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Assets</h3>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Code</th>
                    <th className="text-left py-2.5 font-medium">Name</th>
                    <th className="text-right px-4 py-2.5 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {assetAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-zinc-600 text-sm">
                        No asset accounts
                      </td>
                    </tr>
                  ) : (
                    assetAccounts.map(acct => (
                      <tr key={acct.id} className="hover:bg-zinc-900/40">
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{acct.code}</td>
                        <td className="py-2.5 pr-3 text-zinc-300 text-xs leading-tight">{acct.name}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400 text-xs">
                          {formatCurrency(acct.balance ?? 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700 bg-zinc-900/40">
                    <td colSpan={2} className="px-4 py-3 text-xs font-bold text-zinc-100">Total Assets</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400 tabular-nums text-sm">
                      {formatCurrency(totalAssets)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* LIABILITIES */}
          <Card>
            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Liabilities</h3>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Code</th>
                    <th className="text-left py-2.5 font-medium">Name</th>
                    <th className="text-right px-4 py-2.5 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {liabilityAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-zinc-600 text-sm">
                        No liability accounts
                      </td>
                    </tr>
                  ) : (
                    liabilityAccounts.map(acct => (
                      <tr key={acct.id} className="hover:bg-zinc-900/40">
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{acct.code}</td>
                        <td className="py-2.5 pr-3 text-zinc-300 text-xs leading-tight">{acct.name}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-red-400 text-xs">
                          {formatCurrency(acct.balance ?? 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700 bg-zinc-900/40">
                    <td colSpan={2} className="px-4 py-3 text-xs font-bold text-zinc-100">Total Liabilities</td>
                    <td className="px-4 py-3 text-right font-bold text-red-400 tabular-nums text-sm">
                      {formatCurrency(totalLiabilities)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* EQUITY */}
          <Card>
            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Equity</h3>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Code</th>
                    <th className="text-left py-2.5 font-medium">Name</th>
                    <th className="text-right px-4 py-2.5 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {equityAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-zinc-600 text-sm">
                        No equity accounts
                      </td>
                    </tr>
                  ) : (
                    equityAccounts.map(acct => (
                      <tr key={acct.id} className="hover:bg-zinc-900/40">
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{acct.code}</td>
                        <td className="py-2.5 pr-3 text-zinc-300 text-xs leading-tight">{acct.name}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-blue-400 text-xs">
                          {formatCurrency(acct.balance ?? 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700 bg-zinc-900/40">
                    <td colSpan={2} className="px-4 py-3 text-xs font-bold text-zinc-100">Total Equity</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-400 tabular-nums text-sm">
                      {formatCurrency(totalEquity)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Balance equation footer */}
        <Card className={`border ${isBalanced ? 'border-emerald-400/30' : 'border-amber-400/30'}`}>
          <CardContent className="py-5 px-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isBalanced ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Assets = Liabilities + Equity</p>
                  {!isBalanced && (
                    <p className="text-xs text-amber-400 mt-0.5">
                      Difference: {formatCurrency(Math.abs(totalAssets - liabPlusEquity))} — check for missing or unposted entries
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Assets</p>
                  <p className="text-lg font-bold text-emerald-400 tabular-nums">{formatCurrency(totalAssets)}</p>
                </div>
                <div className="text-zinc-600 text-xl font-light">=</div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Liabilities + Equity</p>
                  <p className={`text-lg font-bold tabular-nums ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {formatCurrency(liabPlusEquity)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </>
  )
}
