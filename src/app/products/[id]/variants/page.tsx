export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Plus } from 'lucide-react'
import { AddVariantModal } from './AddVariantModal'

export default async function ProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true, sku: true, salePrice: true, costPrice: true },
  })
  if (!product) notFound()

  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    include: {
      attributes: {
        include: {
          attributeValue: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const attributes = await prisma.productVariantAttribute.findMany({
    include: { values: true },
    orderBy: { name: 'asc' },
  })

  // Gather unique attribute names across all variants
  const attrNames = Array.from(
    new Set(
      variants.flatMap(v =>
        v.attributes.map(a => a.attributeValue.name)
      )
    )
  )

  return (
    <>
      <TopBar title={`${product.name} — Variants`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/products/${id}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Product
          </Link>
        </div>

        {/* Product Summary */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
          <Package className="w-4 h-4 text-zinc-500" />
          <div className="flex-1">
            <span className="text-sm font-medium text-zinc-200">{product.name}</span>
            <span className="ml-2 font-mono text-xs text-zinc-600">{product.sku}</span>
          </div>
          <span className="text-xs text-zinc-500">Base price: <span className="text-emerald-400 font-semibold">{formatCurrency(product.salePrice)}</span></span>
          <span className="text-xs text-zinc-500">Base cost: <span className="text-zinc-300">{formatCurrency(product.costPrice)}</span></span>
        </div>

        {/* Variant Matrix */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Variant Matrix
              <span className="ml-auto text-xs font-normal text-zinc-500">{variants.length} variants</span>
              <AddVariantModal productId={id} attributes={attributes} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {variants.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Package className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-600">No variants yet.</p>
                <p className="text-xs text-zinc-700 mt-1">Use the Add Variant button above to create product variants.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Code</th>
                    <th className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">SKU</th>
                    {attrNames.map(name => (
                      <th key={name} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{name}</th>
                    ))}
                    <th className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Price Offset</th>
                    <th className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Effective Price</th>
                    <th className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map(v => {
                    const attrMap = Object.fromEntries(
                      v.attributes.map(a => [a.attributeValue.name, a.value])
                    )
                    const effectivePrice = product.salePrice + v.priceOffset
                    return (
                      <tr key={v.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                        <td className="px-4 py-3 font-mono text-xs text-zinc-300">{v.variantCode}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">{v.sku ?? '—'}</td>
                        {attrNames.map(name => (
                          <td key={name} className="px-4 py-3 text-xs text-zinc-400">
                            {attrMap[name] ?? '—'}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-xs">
                          <span className={v.priceOffset === 0 ? 'text-zinc-600' : v.priceOffset > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {v.priceOffset === 0 ? '—' : (v.priceOffset > 0 ? '+' : '') + formatCurrency(v.priceOffset)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-emerald-400 font-semibold">
                          {formatCurrency(effectivePrice)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={v.isActive ? 'success' : 'secondary'} className="text-xs">
                            {v.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
