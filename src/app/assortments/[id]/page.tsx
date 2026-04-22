import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Package, Layers } from 'lucide-react'
import { AssortmentDetailClient } from './AssortmentDetailClient'

export const dynamic = 'force-dynamic'

function formatDate(d: Date | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusBadge(status: string) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'expired') return <Badge variant="destructive">Expired</Badge>
  return <Badge variant="secondary">Draft</Badge>
}

export default async function AssortmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const assortment = await prisma.assortment.findUnique({
    where: { id },
    include: { lines: true, channels: true },
  })
  if (!assortment) notFound()

  const productIds = assortment.lines.filter(l => l.productId).map(l => l.productId!)
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, sku: true, salePrice: true, isActive: true } })
    : []

  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  return (
    <>
      <TopBar title={assortment.name} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/assortments">
            <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-zinc-100">{assortment.name}</h2>
              {statusBadge(assortment.status)}
            </div>
            {assortment.description && <p className="text-sm text-zinc-500 mt-0.5">{assortment.description}</p>}
          </div>
          <AssortmentDetailClient
            id={assortment.id}
            status={assortment.status}
            name={assortment.name}
            description={assortment.description ?? ''}
            startDate={assortment.startDate ? assortment.startDate.toISOString().slice(0, 10) : ''}
            endDate={assortment.endDate ? assortment.endDate.toISOString().slice(0, 10) : ''}
            channelIds={assortment.channels.map(c => c.channelId)}
            lineIds={assortment.lines.map(l => ({ id: l.id, productId: l.productId ?? undefined, lineType: l.lineType }))}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-zinc-500" />
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">Date Range</div>
                <div className="text-sm text-zinc-200">{formatDate(assortment.startDate)} → {formatDate(assortment.endDate)}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Package className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">Products</div>
                <div className="text-xl font-bold text-zinc-100">{assortment.lines.length}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">Channels</div>
                <div className="text-xl font-bold text-zinc-100">{assortment.channels.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="px-5 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-200">
                  Product Lines ({assortment.lines.length})
                </div>
                {assortment.lines.length === 0 ? (
                  <div className="py-10 text-center text-zinc-500 text-sm">No products in this assortment</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-5 py-2.5 font-medium">Product</th>
                        <th className="text-left px-5 py-2.5 font-medium">SKU</th>
                        <th className="text-right px-5 py-2.5 font-medium">Price</th>
                        <th className="text-center px-5 py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {assortment.lines.map(line => {
                        const p = line.productId ? productMap[line.productId] : null
                        return (
                          <tr key={line.id} className="hover:bg-zinc-900/50">
                            <td className="px-5 py-3 text-zinc-200">
                              {p ? p.name : <span className="text-zinc-500 italic">Unknown product</span>}
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-zinc-500">{p?.sku ?? '—'}</td>
                            <td className="px-5 py-3 text-right text-emerald-400 font-medium">
                              {p ? `$${p.salePrice.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-5 py-3 text-center">
                              {p ? (
                                <Badge variant={p.isActive ? 'success' : 'secondary'} className="text-xs">
                                  {p.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              ) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-5">
                <div className="text-sm font-medium text-zinc-200 mb-4">Channels ({assortment.channels.length})</div>
                {assortment.channels.length === 0 ? (
                  <div className="text-sm text-zinc-500">No channels assigned</div>
                ) : (
                  <div className="space-y-2">
                    {assortment.channels.map(c => (
                      <div key={c.id} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-zinc-300">{c.channelId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-5">
                <div className="text-sm font-medium text-zinc-200 mb-3">Info</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Created</span>
                    <span className="text-zinc-300">{formatDate(assortment.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Updated</span>
                    <span className="text-zinc-300">{formatDate(assortment.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ID</span>
                    <span className="text-zinc-500 font-mono">{assortment.id.slice(-8)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
