import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, DollarSign, Star, Package } from 'lucide-react'
import { PriceListInlineEditor } from './PriceListInlineEditor'

export default async function PriceListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const pl = await prisma.priceList.findUnique({
    where: { id },
    include: {
      customerGroup: { select: { name: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true, salePrice: true } } },
        orderBy: [{ minQuantity: 'asc' }],
      },
    },
  })

  if (!pl) notFound()

  const groupName = pl.customerGroup?.name ?? null

  const now = new Date()
  const isLive = pl.isActive && (!pl.startDate || pl.startDate <= now) && (!pl.endDate || pl.endDate >= now)

  return (
    <>
      <TopBar title={pl.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/price-lists" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Price Lists
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold text-zinc-100">{pl.name}</span>
                  {pl.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-medium">
                      <Star className="w-3 h-3" />
                      Default
                    </span>
                  )}
                  <Badge variant={isLive ? 'success' : 'secondary'}>{isLive ? 'Active' : 'Inactive'}</Badge>
                </div>
                {pl.description && <p className="text-sm text-zinc-400">{pl.description}</p>}
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{pl.currency}</span>
                  <span>Group: {groupName ?? 'All customers'}</span>
                  {pl.startDate && <span>From: {formatDate(pl.startDate)}</span>}
                  {pl.endDate && <span>Until: {formatDate(pl.endDate)}</span>}
                  <span>{pl.lines.length} price lines</span>
                </div>
              </div>
              <div className="text-xs text-zinc-600">Created {formatDate(pl.createdAt)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Lines table with inline editor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400" />
                Price Lines ({pl.lines.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <PriceListInlineEditor priceListId={pl.id} initialLines={pl.lines.map(l => ({
              id: l.id,
              productId: l.productId,
              productName: l.product.name,
              productSku: l.product.sku,
              defaultPrice: l.product.salePrice,
              unitPrice: l.unitPrice,
              minQuantity: l.minQuantity ?? 1,
              startDate: l.startDate ? l.startDate.toISOString().slice(0, 10) : '',
              endDate: l.endDate ? l.endDate.toISOString().slice(0, 10) : '',
            }))} />
          </CardContent>
        </Card>

      </main>
    </>
  )
}
