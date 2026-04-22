export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Award, Plus } from 'lucide-react'
import { RFQActions } from './RFQActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  open: 'default',
  sent: 'outline',
  quoted: 'warning',
  awarded: 'success',
  closed: 'secondary',
}

export default async function RFQDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const rfq = await prisma.purchaseRFQ.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { id: 'asc' },
      },
      quotes: {
        include: {
          vendor: true,
          lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
        },
        orderBy: { totalAmount: 'asc' },
      },
    },
  })

  if (!rfq) notFound()

  const allVendors = await prisma.vendor.findMany({
    where: { isActive: true },
    select: { id: true, name: true, vendorCode: true },
    orderBy: { name: 'asc' },
  })

  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, sku: true },
    orderBy: { name: 'asc' },
  })

  return (
    <>
      <TopBar title={`RFQ ${rfq.rfqNumber}`} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/purchasing/rfqs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />Back
            </Button>
          </Link>
          <Badge variant={STATUS_VARIANT[rfq.status] ?? 'secondary'} className="capitalize text-sm px-3 py-1">
            {rfq.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: RFQ details + lines */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header info */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base text-zinc-100">RFQ Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">RFQ Number</p>
                  <p className="text-zinc-100 font-mono font-medium">{rfq.rfqNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Request Date</p>
                  <p className="text-zinc-100">{formatDate(rfq.requestDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Vendor</p>
                  <p className="text-zinc-100">{rfq.vendor?.name ?? <span className="text-zinc-500 italic">Multi-vendor</span>}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Response Deadline</p>
                  <p className={rfq.responseDeadline && new Date(rfq.responseDeadline) < new Date() && rfq.status !== 'awarded' && rfq.status !== 'closed' ? 'text-red-400' : 'text-zinc-100'}>
                    {rfq.responseDeadline ? formatDate(rfq.responseDeadline) : '—'}
                  </p>
                </div>
                {rfq.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-zinc-500 mb-1">Notes</p>
                    <p className="text-zinc-300">{rfq.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lines */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base text-zinc-100">Request Lines ({rfq.lines.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-center pb-2 font-medium">Qty</th>
                      <th className="text-left pb-2 font-medium">UOM</th>
                      <th className="text-left pb-2 font-medium">Needed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {rfq.lines.map(line => (
                      <tr key={line.id}>
                        <td className="py-2 pr-4">
                          <p className="text-zinc-100">{line.product.name}</p>
                          <p className="text-xs text-zinc-500">{line.product.sku}</p>
                        </td>
                        <td className="py-2 pr-4 text-center text-zinc-100 font-mono">{line.quantity}</td>
                        <td className="py-2 pr-4 text-zinc-400">{line.unitOfMeasure}</td>
                        <td className="py-2 text-zinc-400 text-xs">
                          {line.neededByDate ? formatDate(line.neededByDate) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Vendor Quote Comparison */}
            {rfq.quotes.length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-zinc-100">Vendor Quote Comparison</CardTitle>
                    <p className="text-xs text-zinc-500">{rfq.quotes.length} quote(s) — sorted by total amount</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rfq.quotes.map((quote, i) => (
                      <div key={quote.id} className={`rounded-lg border p-4 ${quote.isAwarded ? 'border-emerald-600 bg-emerald-900/10' : 'border-zinc-700 bg-zinc-800/50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {i === 0 && !quote.isAwarded && <Badge variant="outline" className="text-xs text-amber-400 border-amber-600">Lowest</Badge>}
                            {quote.isAwarded && <Badge variant="success" className="text-xs"><Award className="w-3 h-3 mr-1" />Awarded</Badge>}
                            <span className="font-medium text-zinc-100">{quote.vendor.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 font-bold">{formatCurrency(quote.totalAmount)}</span>
                            {rfq.status !== 'awarded' && rfq.status !== 'closed' && (
                              <RFQActions rfqId={rfq.id} quoteId={quote.id} vendorName={quote.vendor.name} />
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                          <div>
                            <span className="text-zinc-500">Quote Date: </span>
                            <span className="text-zinc-300">{formatDate(quote.quoteDate)}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Valid Until: </span>
                            <span className="text-zinc-300">{quote.validUntil ? formatDate(quote.validUntil) : '—'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Lead Time: </span>
                            <span className="text-zinc-300">{quote.leadTimeDays != null ? `${quote.leadTimeDays} days` : '—'}</span>
                          </div>
                        </div>
                        {quote.lines.length > 0 && (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-zinc-600">
                                <th className="text-left pb-1">Product</th>
                                <th className="text-center pb-1">Qty</th>
                                <th className="text-right pb-1">Unit Price</th>
                                <th className="text-right pb-1">Line Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quote.lines.map(ql => (
                                <tr key={ql.id} className="border-t border-zinc-700/50">
                                  <td className="py-1 text-zinc-300">{ql.product.name}</td>
                                  <td className="py-1 text-center text-zinc-400">{ql.quantity}</td>
                                  <td className="py-1 text-right text-zinc-300">{formatCurrency(ql.unitPrice)}</td>
                                  <td className="py-1 text-right text-emerald-400">{formatCurrency(ql.lineTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: Actions */}
          <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-100">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/purchasing/rfqs/${rfq.id}/quotes/new`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />Add Vendor Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-100">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Lines</span>
                  <span className="text-zinc-100">{rfq.lines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Quotes</span>
                  <span className="text-zinc-100">{rfq.quotes.length}</span>
                </div>
                {rfq.quotes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Best Price</span>
                    <span className="text-emerald-400">{formatCurrency(Math.min(...rfq.quotes.map(q => q.totalAmount)))}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}

