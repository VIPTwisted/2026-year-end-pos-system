export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Percent, Plus, Receipt, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

function taxTypeVariant(taxType: string): 'default' | 'secondary' | 'warning' | 'success' | 'outline' {
  if (taxType === 'sales') return 'default'
  if (taxType === 'use') return 'warning'
  if (taxType === 'vat') return 'success'
  if (taxType === 'exempt') return 'secondary'
  if (taxType === 'withholding') return 'outline'
  return 'secondary'
}

function sourceTypeVariant(sourceType: string): 'default' | 'secondary' | 'warning' | 'success' {
  if (sourceType === 'order') return 'default'
  if (sourceType === 'customer_invoice') return 'success'
  if (sourceType === 'vendor_invoice') return 'warning'
  return 'secondary'
}

export default async function TaxManagementPage() {
  const [taxCodes, recentTransactions] = await Promise.all([
    prisma.taxCode.findMany({
      include: { _count: { select: { transactions: true } } },
      orderBy: { code: 'asc' },
    }),
    prisma.taxTransaction.findMany({
      include: { taxCode: { select: { code: true, name: true } } },
      orderBy: { taxDate: 'desc' },
      take: 20,
    }),
  ])

  const activeCodes = taxCodes.filter(t => t.isActive).length

  const allTx = await prisma.taxTransaction.findMany({
    select: { taxAmount: true, sourceType: true },
  })

  const collectedTypes = ['order', 'customer_invoice']
  const paidTypes = ['vendor_invoice']

  const totalCollected = allTx
    .filter(t => collectedTypes.includes(t.sourceType))
    .reduce((s, t) => s + Number(t.taxAmount), 0)

  const totalPaid = allTx
    .filter(t => paidTypes.includes(t.sourceType))
    .reduce((s, t) => s + Number(t.taxAmount), 0)

  const netLiability = totalCollected - totalPaid

  return (
    <>
      <TopBar title="Tax Management" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Tax Management</h2>
            <p className="text-sm text-zinc-500">Tax codes, rates, and transaction ledger</p>
          </div>
          <Link href="/finance/tax/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              New Tax Code
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Active Tax Codes</p>
              </div>
              <p className="text-2xl font-bold text-blue-400 tabular-nums">{activeCodes}</p>
              <p className="text-xs text-zinc-600 mt-1">{taxCodes.length} total codes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Tax Collected</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(totalCollected)}</p>
              <p className="text-xs text-zinc-600 mt-1">orders + customer invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Tax Paid</p>
              </div>
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-zinc-600 mt-1">vendor invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${netLiability >= 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Net Liability</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${netLiability >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatCurrency(netLiability)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">collected minus paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Tax Codes Table */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Tax Codes</h3>
          {taxCodes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Percent className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No tax codes</p>
                <p className="text-sm mb-4">Add tax codes to start tracking tax transactions</p>
                <Link href="/finance/tax/new">
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Tax Code</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 pb-3 pt-4 font-medium">Code</th>
                      <th className="text-left pb-3 pt-4 font-medium">Name</th>
                      <th className="text-right pb-3 pt-4 font-medium">Rate</th>
                      <th className="text-left pb-3 pt-4 font-medium">Type</th>
                      <th className="text-left pb-3 pt-4 font-medium">Description</th>
                      <th className="text-right pb-3 pt-4 font-medium">Transactions</th>
                      <th className="text-center px-5 pb-3 pt-4 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {taxCodes.map(tc => (
                      <tr key={tc.id} className="hover:bg-zinc-900/50">
                        <td className="px-5 py-3 font-mono text-xs text-zinc-400">{tc.code}</td>
                        <td className="py-3 pr-4 text-zinc-200 font-medium">{tc.name}</td>
                        <td className="py-3 pr-4 text-right font-semibold text-zinc-200 tabular-nums">
                          {Number(tc.rate).toFixed(2)}%
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={taxTypeVariant(tc.taxType)} className="capitalize">{tc.taxType}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs max-w-[200px] truncate">
                          {tc.description || <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-400 tabular-nums">
                          {tc._count.transactions}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge variant={tc.isActive ? 'success' : 'secondary'}>
                            {tc.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recent Transactions */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Recent Tax Transactions
          </h3>
          {recentTransactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <Receipt className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-1">No tax transactions yet</p>
                <p className="text-sm">Transactions will appear here as they are recorded</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 pb-3 pt-4 font-medium">Date</th>
                      <th className="text-left pb-3 pt-4 font-medium">Tax Code</th>
                      <th className="text-left pb-3 pt-4 font-medium">Source</th>
                      <th className="text-left pb-3 pt-4 font-medium">Source ID</th>
                      <th className="text-right pb-3 pt-4 font-medium">Taxable Amount</th>
                      <th className="text-right pb-3 pt-4 font-medium">Tax Amount</th>
                      <th className="text-right px-5 pb-3 pt-4 font-medium">FY / Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {recentTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-900/50">
                        <td className="px-5 py-3 text-zinc-400 text-xs whitespace-nowrap">
                          {formatDate(tx.taxDate)}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-medium text-zinc-200">{tx.taxCode.name}</span>
                          <span className="ml-1.5 font-mono text-xs text-zinc-500">{tx.taxCode.code}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={sourceTypeVariant(tx.sourceType)} className="capitalize text-xs">
                            {tx.sourceType.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-500 max-w-[120px] truncate">
                          {tx.sourceId}
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums">
                          {formatCurrency(Number(tx.taxableAmount))}
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-emerald-400 tabular-nums">
                          {formatCurrency(Number(tx.taxAmount))}
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-zinc-500 tabular-nums">
                          {tx.fiscalYear ?? '—'}
                          {tx.periodNumber != null && ` / P${tx.periodNumber}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </section>

      </main>
    </>
  )
}
