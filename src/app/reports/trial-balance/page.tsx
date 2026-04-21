import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, CheckCircle, AlertTriangle } from 'lucide-react'

// Normal balance: debit-side accounts (asset, expense) carry debit balances
// Credit-side accounts (liability, equity, revenue) carry credit balances
function normalBalance(type: string): 'debit' | 'credit' {
  return type === 'asset' || type === 'expense' ? 'debit' : 'credit'
}

export default async function TrialBalancePage() {
  const today = new Date()

  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    include: {
      journalLines: {
        select: { debit: true, credit: true },
      },
    },
    orderBy: { code: 'asc' },
  })

  // For each account compute totals from journal lines (authoritative) with balance as fallback
  const rows = accounts.map(acct => {
    const totalDebits = acct.journalLines.reduce((s, l) => s + (l.debit ?? 0), 0)
    const totalCredits = acct.journalLines.reduce((s, l) => s + (l.credit ?? 0), 0)
    const nb = normalBalance(acct.type)

    // Net movement from journal lines; fall back to stored balance if no lines
    let debitBalance = 0
    let creditBalance = 0

    if (acct.journalLines.length > 0) {
      const net = totalDebits - totalCredits
      if (nb === 'debit') {
        debitBalance = net >= 0 ? net : 0
        creditBalance = net < 0 ? Math.abs(net) : 0
      } else {
        creditBalance = net <= 0 ? Math.abs(net) : 0
        debitBalance = net > 0 ? net : 0
      }
    } else {
      // Use stored balance
      const bal = acct.balance ?? 0
      if (nb === 'debit') {
        debitBalance = bal >= 0 ? bal : 0
        creditBalance = bal < 0 ? Math.abs(bal) : 0
      } else {
        creditBalance = bal >= 0 ? bal : 0
        debitBalance = bal < 0 ? Math.abs(bal) : 0
      }
    }

    return { acct, debitBalance, creditBalance }
  }).filter(r => r.debitBalance > 0 || r.creditBalance > 0 || (r.acct.balance ?? 0) !== 0)

  const grandDebit = rows.reduce((s, r) => s + r.debitBalance, 0)
  const grandCredit = rows.reduce((s, r) => s + r.creditBalance, 0)
  const isBalanced = Math.abs(grandDebit - grandCredit) <= 1

  const TYPE_LABEL: Record<string, string> = {
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expense',
  }

  return (
    <>
      <TopBar title="Trial Balance" />
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
            <h2 className="text-xl font-bold text-zinc-100">Trial Balance</h2>
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

        {/* Trial Balance Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 pb-3 pt-4 font-medium">Code</th>
                    <th className="text-left pb-3 pt-4 font-medium">Account Name</th>
                    <th className="text-left pb-3 pt-4 font-medium">Type</th>
                    <th className="text-right pb-3 pt-4 font-medium">Debit Balance</th>
                    <th className="text-right px-5 pb-3 pt-4 font-medium">Credit Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-zinc-600">
                        No accounts with balances found
                      </td>
                    </tr>
                  ) : (
                    rows.map(({ acct, debitBalance, creditBalance }) => (
                      <tr key={acct.id} className="hover:bg-zinc-900/50">
                        <td className="px-5 py-2.5 font-mono text-xs text-zinc-400">{acct.code}</td>
                        <td className="py-2.5 pr-4 text-zinc-300">{acct.name}</td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs text-zinc-500 capitalize">
                            {TYPE_LABEL[acct.type] ?? acct.type}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums text-sm">
                          {debitBalance > 0 ? (
                            <span className="text-zinc-200 font-medium">{formatCurrency(debitBalance)}</span>
                          ) : (
                            <span className="text-zinc-700">—</span>
                          )}
                        </td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-sm">
                          {creditBalance > 0 ? (
                            <span className="text-zinc-200 font-medium">{formatCurrency(creditBalance)}</span>
                          ) : (
                            <span className="text-zinc-700">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className={`border-t-2 ${isBalanced ? 'border-emerald-400/40' : 'border-amber-400/40'} bg-zinc-900/60`}>
                    <td colSpan={3} className="px-5 py-3 text-sm font-bold text-zinc-100">
                      Totals
                    </td>
                    <td className={`py-3 pr-4 text-right text-base font-bold tabular-nums ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatCurrency(grandDebit)}
                    </td>
                    <td className={`px-5 py-3 text-right text-base font-bold tabular-nums ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatCurrency(grandCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Balance status */}
        {!isBalanced && (
          <Card className="border-amber-400/30">
            <CardContent className="py-4 px-5 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-400">Trial balance is out of balance</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Difference of {formatCurrency(Math.abs(grandDebit - grandCredit))} — review unposted journal entries or missing account entries.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      </main>
    </>
  )
}
