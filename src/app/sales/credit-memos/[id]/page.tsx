export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Receipt, User, Clock } from 'lucide-react'
import { CreditMemoActions } from './CreditMemoActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  open: 'success',
  partially_applied: 'default',
  applied: 'secondary',
  voided: 'destructive',
}

const TX_TYPE_COLOR: Record<string, string> = {
  apply: 'text-emerald-400',
  void: 'text-red-400',
  refund: 'text-blue-400',
}

export default async function CreditMemoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const memo = await prisma.creditMemo.findUnique({
    where: { id },
    include: {
      customer: true,
      salesReturn: { select: { id: true, returnNumber: true } },
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!memo) notFound()

  const usedAmount = memo.amount - memo.remaining
  const pctUsed = memo.amount > 0 ? (usedAmount / memo.amount) * 100 : 0

  return (
    <>
      <TopBar title={`Credit Memo ${memo.memoNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <Link href="/sales/credit-memos" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Credit Memos
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-mono text-zinc-100">{memo.memoNumber}</span>
                  <Badge variant={STATUS_VARIANT[memo.status] ?? 'secondary'} className="capitalize">
                    {memo.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <Link href={`/customers/${memo.customer.id}`} className="text-blue-400 hover:underline">
                      {memo.customer.firstName} {memo.customer.lastName}
                    </Link>
                  </span>
                  {memo.salesReturn && (
                    <span>
                      From Return:{' '}
                      <Link href={`/sales/returns/${memo.salesReturn.id}`} className="text-blue-400 hover:underline font-mono">
                        {memo.salesReturn.returnNumber}
                      </Link>
                    </span>
                  )}
                  {memo.expiresAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: <span className={new Date(memo.expiresAt) < new Date() ? 'text-red-400' : 'text-zinc-300'}>{formatDate(memo.expiresAt)}</span>
                    </span>
                  )}
                  <span>Issued: <span className="text-zinc-300">{formatDate(memo.createdAt)}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 shrink-0 text-center">
                {[
                  { label: 'Total Amount', value: formatCurrency(memo.amount) },
                  { label: 'Used', value: formatCurrency(usedAmount), color: 'text-amber-400' },
                  { label: 'Remaining', value: formatCurrency(memo.remaining), highlight: true },
                ].map(({ label, value, color, highlight }) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className={`text-lg font-bold ${highlight ? 'text-emerald-400' : color ?? 'text-zinc-200'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span>Credit used</span>
                <span>{pctUsed.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(pctUsed, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-zinc-400" />
                  Transaction History ({memo.transactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {memo.transactions.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-zinc-600">No transactions yet</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Type', 'Amount', 'Order ID', 'Date'].map(h => (
                          <th key={h} className={`px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Type' ? 'text-left' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {memo.transactions.map(tx => (
                        <tr key={tx.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                          <td className={`px-4 py-2.5 capitalize font-medium ${TX_TYPE_COLOR[tx.type] ?? 'text-zinc-300'}`}>{tx.type}</td>
                          <td className="px-4 py-2.5 text-right text-zinc-300">{formatCurrency(tx.amount)}</td>
                          <td className="px-4 py-2.5 text-right">
                            {tx.orderId ? (
                              <Link href={`/orders/${tx.orderId}`} className="text-xs text-blue-400 hover:underline font-mono">{tx.orderId}</Link>
                            ) : <span className="text-zinc-600 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-500">{formatDate(tx.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <CreditMemoActions memoId={memo.id} status={memo.status} remaining={memo.remaining} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-zinc-100 font-medium">{memo.customer.firstName} {memo.customer.lastName}</p>
                {memo.customer.email && <p className="text-zinc-400">{memo.customer.email}</p>}
                {memo.customer.phone && <p className="text-zinc-400">{memo.customer.phone}</p>}
                <Link href={`/customers/${memo.customer.id}`} className="text-blue-400 hover:underline text-xs block mt-2">
                  View Customer Profile
                </Link>
              </CardContent>
            </Card>

            {memo.notes && (
              <Card>
                <CardContent className="pt-4 text-xs">
                  <p className="text-zinc-500 uppercase tracking-wide font-medium mb-1">Notes</p>
                  <p className="text-zinc-300 whitespace-pre-wrap">{memo.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
