import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, ArrowLeftRight } from 'lucide-react'
import { IntercompanyActions } from './IntercompanyActions'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'default',
  posted: 'warning',
  reconciled: 'success',
}

export default async function IntercompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tx = await prisma.intercompanyTransaction.findUnique({
    where: { id },
    include: { partner: true },
  })
  if (!tx) notFound()

  return (
    <>
      <TopBar title={`IC — ${tx.transactionNo}`} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/finance/intercompany"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Intercompany
          </Link>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
                      {tx.transactionNo}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_BADGE[tx.status] ?? 'secondary'} className="capitalize">
                        {tx.status}
                      </Badge>
                      {tx.isEliminated && (
                        <Badge variant="secondary" className="text-xs">Eliminated</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Partner</div>
                      <div className="text-zinc-200 font-medium">{tx.partner.partnerName}</div>
                      <div className="text-xs text-zinc-500">{tx.partner.partnerCode} · {tx.partner.partnerType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Direction</div>
                      <div className={`font-medium capitalize ${tx.direction === 'sending' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {tx.direction}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Type</div>
                      <div className="text-zinc-300 capitalize">{tx.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Document No.</div>
                      <div className="text-zinc-400 font-mono text-xs">{tx.documentNo ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Posting Date</div>
                      <div className="text-zinc-300">{formatDate(tx.postingDate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Elimination Needed</div>
                      <div className={tx.eliminationNeeded ? 'text-amber-400' : 'text-zinc-500'}>
                        {tx.eliminationNeeded ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-zinc-500 mb-1">Description</div>
                      <div className="text-zinc-300">{tx.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Amount</div>
                    <div className="text-2xl font-bold text-zinc-100">{formatCurrency(tx.amount)} {tx.currency}</div>
                  </div>
                  {tx.currency !== 'USD' && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Amount (Base USD)</div>
                      <div className="text-lg font-medium text-blue-400">{formatCurrency(tx.amountInBase)}</div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-zinc-800 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Exchange Rate</span>
                      <span className="text-zinc-300">{tx.exchangeRate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <IntercompanyActions txId={tx.id} status={tx.status} isEliminated={tx.isEliminated} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
