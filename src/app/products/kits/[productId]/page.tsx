export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Package } from 'lucide-react'
import { KitActions } from './KitActions'

export default async function KitDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const kit = await prisma.productKit.findFirst({
    where: { productId },
    include: {
      product: { select: { id: true, name: true, sku: true, salePrice: true } },
      components: {
        include: {
          component: { select: { id: true, name: true, sku: true, salePrice: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  if (!kit) notFound()

  const stores = await prisma.store.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })

  // Compute kit total price
  let kitTotal = kit.product.salePrice
  for (const comp of kit.components) {
    if (comp.chargeType === 'add_price') kitTotal += comp.priceOffset
    if (comp.chargeType === 'subtract_price') kitTotal -= comp.priceOffset
  }

  return (
    <>
      <TopBar title={`Kit — ${kit.product.name}`} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/products/kits"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Kits & Bundles
          </Link>

          <div className="grid grid-cols-3 gap-6">
            {/* Main */}
            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="w-4 h-4 text-zinc-400" />
                      {kit.product.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={kit.kitType === 'fixed' ? 'default' : 'secondary'} className="capitalize">
                        {kit.kitType}
                      </Badge>
                      <Badge variant={kit.isActive ? 'success' : 'destructive'} className="text-xs">
                        {kit.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">SKU</div>
                      <div className="font-mono text-zinc-300">{kit.product.sku}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Base Price</div>
                      <div className="text-zinc-200">{formatCurrency(kit.product.salePrice)}</div>
                    </div>
                    {kit.description && (
                      <div className="col-span-2">
                        <div className="text-xs text-zinc-500 mb-1">Description</div>
                        <div className="text-zinc-400">{kit.description}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Components Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-zinc-400">
                    Components ({kit.components.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Product</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Qty</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Optional</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Charge</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Price Offset</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Contribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kit.components.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-zinc-600">No components defined</td>
                        </tr>
                      )}
                      {kit.components.map(comp => {
                        const contribution =
                          comp.chargeType === 'add_price'
                            ? comp.priceOffset
                            : comp.chargeType === 'subtract_price'
                              ? -comp.priceOffset
                              : 0
                        return (
                          <tr key={comp.id} className="border-b border-zinc-800/50">
                            <td className="px-4 py-2.5">
                              <div className="text-zinc-200">{comp.component.name}</div>
                              <div className="text-xs text-zinc-600 font-mono">{comp.component.sku}</div>
                            </td>
                            <td className="px-4 py-2.5 text-right text-zinc-300">{comp.quantity}</td>
                            <td className="px-4 py-2.5">
                              {comp.isOptional && (
                                <Badge variant="secondary" className="text-xs">Optional</Badge>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-xs capitalize ${comp.chargeType === 'included' ? 'text-zinc-500' : 'text-amber-400'}`}>
                                {comp.chargeType.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-zinc-400">
                              {comp.chargeType !== 'included' ? formatCurrency(comp.priceOffset) : '—'}
                            </td>
                            <td className={`px-4 py-2.5 text-right font-medium ${contribution > 0 ? 'text-emerald-400' : contribution < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                              {contribution !== 0 ? formatCurrency(Math.abs(contribution)) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-zinc-700 bg-zinc-900/50">
                        <td colSpan={5} className="px-4 py-3 text-sm text-zinc-400 font-medium">Kit Total Price</td>
                        <td className="px-4 py-3 text-right font-bold text-zinc-100">{formatCurrency(kitTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <KitActions productId={productId} stores={stores} products={[]} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
