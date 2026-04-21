import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: { select: { id: true, name: true } },
      inventory: {
        include: { store: { select: { id: true, name: true } } },
        orderBy: { quantity: 'desc' },
      },
    },
  })

  if (!product) notFound()

  const totalStock = product.inventory.reduce((s, i) => s + i.quantity, 0)
  const margin = product.costPrice > 0
    ? (((product.salePrice - product.costPrice) / product.costPrice) * 100).toFixed(1)
    : null
  const isLowStock = product.reorderPoint != null && totalStock <= product.reorderPoint

  return (
    <>
      <TopBar title={product.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Products
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant={product.isActive ? 'success' : 'destructive'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {product.category && (
                    <Badge variant="secondary">{product.category.name}</Badge>
                  )}
                  {isLowStock && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />Low Stock
                    </Badge>
                  )}
                  {!isLowStock && totalStock > 0 && (
                    <Badge variant="outline" className="text-emerald-400 border-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />In Stock
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{product.name}</h1>
                {product.description && (
                  <p className="text-sm text-zinc-500 mt-1">{product.description}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
                  <span>SKU: <span className="font-mono text-zinc-300">{product.sku}</span></span>
                  {product.barcode && <span>Barcode: <span className="font-mono text-zinc-300">{product.barcode}</span></span>}
                  <span>Unit: <span className="text-zinc-300">{product.unit}</span></span>
                  {product.supplier && <span>Supplier: <span className="text-zinc-300">{product.supplier.name}</span></span>}
                </div>
              </div>
              <Link href={`/products/${id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>

            {/* Pricing KPIs */}
            <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { label: 'Sale Price', value: formatCurrency(product.salePrice), color: 'text-emerald-400' },
                { label: 'Cost Price', value: formatCurrency(product.costPrice), color: 'text-zinc-300' },
                { label: 'Gross Margin', value: margin ? `${margin}%` : '—', color: Number(margin) > 30 ? 'text-emerald-400' : Number(margin) > 0 ? 'text-amber-400' : 'text-zinc-500' },
                { label: 'Total Stock', value: totalStock.toLocaleString(), color: isLowStock ? 'text-amber-400' : 'text-zinc-100' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory by Store */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-400" />
              Inventory by Location
              {product.reorderPoint != null && (
                <span className="ml-auto text-xs font-normal text-zinc-500">
                  Reorder point: {product.reorderPoint} · Reorder qty: {product.reorderQty ?? '—'}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {product.inventory.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-zinc-600">No inventory records.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Location','On Hand','Reserved','Available','Status'].map(h => (
                      <th key={h} className={`px-5 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Location' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {product.inventory.map(inv => {
                    const available = inv.quantity - inv.reserved
                    const low = product.reorderPoint != null && inv.quantity <= product.reorderPoint
                    return (
                      <tr key={inv.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3 text-zinc-200">{inv.store.name}</td>
                        <td className="px-5 py-3 text-right text-zinc-300">{inv.quantity}</td>
                        <td className="px-5 py-3 text-right text-zinc-500">{inv.reserved}</td>
                        <td className="px-5 py-3 text-right font-semibold text-emerald-400">{available}</td>
                        <td className="px-5 py-3 text-right">
                          {low
                            ? <Badge variant="warning" className="text-xs">Low</Badge>
                            : <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-900">OK</Badge>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td className="px-5 py-2.5 text-xs text-zinc-500 uppercase tracking-wide">Total</td>
                    <td className="px-5 py-2.5 text-right font-bold text-zinc-100">{totalStock}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Meta */}
        <div className="text-xs text-zinc-600">
          Created {formatDate(product.createdAt)} · Updated {formatDate(product.updatedAt)}
          {product.taxable && ' · Taxable'}
          {!product.trackStock && ' · Stock not tracked'}
        </div>

      </main>
    </>
  )
}
