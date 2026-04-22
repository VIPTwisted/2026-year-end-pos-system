import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Building2, Printer } from 'lucide-react'

const ACCOUNT_TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense']
const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
}

export default async function ConsolidationRunPage({
  params,
}: {
  params: Promise<{ id: string; runId: string }>
}) {
  const { id, runId } = await params

  const run = await prisma.consolidationRun.findUnique({
    where: { id: runId },
    include: {
      group: true,
      results: { orderBy: { accountCode: 'asc' } },
    },
  })
  if (!run || run.groupId !== id) notFound()

  // Get unique companies from results
  const companies = [...new Set(run.results.map(r => r.companyName))]
    .filter(c => c !== 'Eliminations')

  // Group results by account code
  const byAccount = new Map<
    string,
    {
      accountCode: string
      accountName: string
      byCompany: Record<string, { debit: number; credit: number; net: number }>
      eliminationDebit: number
      eliminationCredit: number
      consolidatedNet: number
    }
  >()

  for (const row of run.results) {
    if (!byAccount.has(row.accountCode)) {
      byAccount.set(row.accountCode, {
        accountCode: row.accountCode,
        accountName: row.accountName,
        byCompany: {},
        eliminationDebit: 0,
        eliminationCredit: 0,
        consolidatedNet: 0,
      })
    }
    const acc = byAccount.get(row.accountCode)!
    if (row.companyName === 'Eliminations') {
      acc.eliminationDebit += row.eliminationDebit
      acc.eliminationCredit += row.eliminationCredit
    } else {
      if (!acc.byCompany[row.companyName]) {
        acc.byCompany[row.companyName] = { debit: 0, credit: 0, net: 0 }
      }
      acc.byCompany[row.companyName].debit += row.debit
      acc.byCompany[row.companyName].credit += row.credit
      acc.byCompany[row.companyName].net += row.netBalance
    }
    acc.consolidatedNet =
      Object.values(acc.byCompany).reduce((s, c) => s + c.net, 0) -
      acc.eliminationDebit +
      acc.eliminationCredit
  }

  const accounts = Array.from(byAccount.values())

  // Simple grouping by account code prefix (1xxx=asset, 2xxx=liab, 3xxx=equity, 4xxx=rev, 5xxx=exp)
  const codeToType = (code: string) => {
    const n = parseInt(code[0])
    if (n === 1) return 'asset'
    if (n === 2) return 'liability'
    if (n === 3) return 'equity'
    if (n === 4) return 'revenue'
    return 'expense'
  }

  const grouped = ACCOUNT_TYPE_ORDER.map(type => ({
    type,
    label: ACCOUNT_TYPE_LABELS[type],
    rows: accounts.filter(a => codeToType(a.accountCode) === type),
  })).filter(g => g.rows.length > 0)

  // Net income
  const totalRevenue = accounts
    .filter(a => codeToType(a.accountCode) === 'revenue')
    .reduce((s, a) => s + a.consolidatedNet, 0)
  const totalExpenses = accounts
    .filter(a => codeToType(a.accountCode) === 'expense')
    .reduce((s, a) => s + Math.abs(a.consolidatedNet), 0)
  const netIncome = Math.abs(totalRevenue) - totalExpenses

  const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
    pending: 'default', running: 'warning', complete: 'success', failed: 'destructive',
  }

  return (
    <>
      <TopBar title={`Consolidation Run — ${formatDate(run.runDate)}`} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <Link
              href={`/finance/consolidation/${id}`}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to {run.group.name}
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => typeof window !== 'undefined' && window.print()}
            >
              <Printer className="w-3.5 h-3.5" />
              Export / Print
            </Button>
          </div>

          {/* Run Header */}
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <h1 className="text-base font-semibold text-zinc-100">{run.group.name} — Consolidated Trial Balance</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Period: {formatDate(run.periodStart)} — {formatDate(run.periodEnd)} ·
                      Run: {formatDate(run.runDate)} ·
                      {run.results.length} accounts
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_BADGE[run.status] ?? 'secondary'} className="capitalize">
                  {run.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Consolidated Trial Balance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400">Consolidated Trial Balance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Account</th>
                      {companies.map(c => (
                        <th key={c} className="text-right px-3 py-3 text-xs font-medium text-zinc-500 uppercase whitespace-nowrap">{c}</th>
                      ))}
                      <th className="text-right px-3 py-3 text-xs font-medium text-zinc-500 uppercase">Eliminations</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-zinc-400 uppercase">Consolidated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.map(group => (
                      <React.Fragment key={group.type}>
                        <tr className="bg-zinc-900/80">
                          <td
                            colSpan={companies.length + 3}
                            className="px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider"
                          >
                            {group.label}
                          </td>
                        </tr>
                        {group.rows.map(acc => {
                          const elimNet = acc.eliminationDebit - acc.eliminationCredit
                          return (
                            <tr key={acc.accountCode} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                              <td className="px-4 py-2.5">
                                <span className="font-mono text-xs text-zinc-500">{acc.accountCode}</span>
                                <span className="ml-2 text-zinc-300">{acc.accountName}</span>
                              </td>
                              {companies.map(c => (
                                <td key={c} className="px-3 py-2.5 text-right text-zinc-400 text-xs">
                                  {acc.byCompany[c]
                                    ? formatCurrency(acc.byCompany[c].net)
                                    : '—'}
                                </td>
                              ))}
                              <td className={`px-3 py-2.5 text-right text-xs ${elimNet !== 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
                                {elimNet !== 0 ? formatCurrency(Math.abs(elimNet)) : '—'}
                              </td>
                              <td className={`px-4 py-2.5 text-right font-medium text-sm ${acc.consolidatedNet >= 0 ? 'text-zinc-100' : 'text-red-400'}`}>
                                {formatCurrency(acc.consolidatedNet)}
                              </td>
                            </tr>
                          )
                        })}
                        {/* Subtotal row */}
                        <tr className="border-b-2 border-zinc-700 bg-zinc-900/50">
                          <td className="px-4 py-2 text-xs font-semibold text-zinc-400">
                            Total {group.label}
                          </td>
                          {companies.map(c => {
                            const subtotal = group.rows.reduce(
                              (s, a) => s + (a.byCompany[c]?.net ?? 0),
                              0,
                            )
                            return (
                              <td key={c} className="px-3 py-2 text-right text-xs font-semibold text-zinc-300">
                                {formatCurrency(subtotal)}
                              </td>
                            )
                          })}
                          <td className="px-3 py-2 text-right text-xs font-semibold text-amber-400">
                            {formatCurrency(group.rows.reduce((s, a) => s + a.eliminationDebit - a.eliminationCredit, 0))}
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-zinc-100">
                            {formatCurrency(group.rows.reduce((s, a) => s + a.consolidatedNet, 0))}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}

                    {/* Net Income reconciliation */}
                    <tr className="bg-blue-950/20 border-t-2 border-blue-900/50">
                      <td className="px-4 py-3 font-bold text-zinc-200" colSpan={companies.length + 2}>
                        Net Income (Revenue − Expenses)
                      </td>
                      <td className={`px-4 py-3 text-right font-bold text-lg ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(netIncome)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
