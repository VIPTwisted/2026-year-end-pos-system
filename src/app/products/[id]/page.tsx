export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, AlertTriangle, CheckCircle, Layers } from 'lucide-react'

function FastTabHeader({ label, extra }: { label: string; extra?: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-800/40 py-2.5 px-4 flex justify-between items-center bg-zinc-900/40">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">{label}</span>
      {extra && <span className="text-[11px] text-zinc-500">{extra}</span>}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[13px] text-zinc-100">{value ?? '—'}</p>
    </div>
  )
}

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
      bundle: true,
      bundleComponents: {
        include: {
          bundle: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      },
      variants: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  })

  if (!product) notFound()

  const totalStock = product.inventory.reduce((s, i) => s + i.quantity, 0)
  const variantCount = product.variants.length
  const margin = product.costPrice > 0
    ? (((product.salePrice - product.costPrice) / product.costPrice) * 100).toFixed(1)
    : null
  const isLowStock = product.reorderPoint != null && totalStock <= product.reorderPoint

  return (
    <>
      <TopBar title={product.name} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* D365 Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Products
              </Link>
              <span className="text-zinc-700">/</span>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400" />
                <span className="font-bold text-lg text-zinc-100">{product.name}</span>
              </div>
              <Badge variant={product.isActive ? 'success' : 'destructive'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {product.category && <Badge variant="secondary">{product.category.name}</Badge>}
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
            <div className="flex items-center gap-2">
              <Link href={`/products/${id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* General FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="General" />
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              <Field label="SKU" value={<span className="font-mono">{product.sku}</span>} />
              {product.barcode && <Field label="Barcode" value={<span className="font-mono">{product.barcode}</span>} />}
              <Field label="Unit" value={product.unit} />
              {product.supplier && <Field label="Supplier" value={product.supplier.name} />}
              <Field label="Taxable" value={product.taxable ? 'Yes' : 'No'} />
              <Field label="Track Stock" value={product.trackStock ? 'Yes' : 'No'} />
              {product.description && (
                <div className="col-span-2">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Description</p>
                  <p className="text-[13px] text-zinc-400">{product.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="Pricing" />
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Sale Price</p>
                <p className="text-[18px] font-bold text-emerald-400">{formatCurrency(product.salePrice)}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Cost Price</p>
                <p className="text-[18px] font-bold text-zinc-300">{formatCurrency(product.costPrice)}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Gross Margin</p>
                <p className={`text-[18px] font-bold ${Number(margin) > 30 ? 'text-emerald-400' : Number(margin) > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {margin ? `${margin}%` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Total Stock</p>
                <p className={`text-[18px] font-bold ${isLowStock ? 'text-amber-400' : 'text-zinc-100'}`}>
                  {totalStock.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Lines FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader
              label="Inventory by Location"
              extra={product.reorderPoint != null
                ? `Reorder point: ${product.reorderPoint} · Reorder qty: ${product.reorderQty ?? '—'}`
                : undefined
              }
            />
            {product.inventory.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-zinc-600">No inventory records.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                      {['Location', 'On Hand', 'Reserved', 'Available', 'Status'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide ${h === 'Location' ? 'text-left' : 'text-right'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.inventory.map(inv => {
                      const available = inv.quantity - inv.reserved
                      const low = product.reorderPoint != null && inv.quantity <= product.reorderPoint
                      return (
                        <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-2 text-[13px] text-zinc-200">{inv.store.name}</td>
                          <td className="px-4 py-2 text-right text-[13px] text-zinc-300">{inv.quantity}</td>
                          <td className="px-4 py-2 text-right text-[13px] text-zinc-500">{inv.reserved}</td>
                          <td className="px-4 py-2 text-right text-[13px] font-semibold text-emerald-400">{available}</td>
                          <td className="px-4 py-2 text-right">
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
                    <tr className="border-t border-zinc-700 bg-zinc-900/30">
                      <td className="px-4 py-2 text-[11px] text-zinc-500 uppercase tracking-wide">Total</td>
                      <td className="px-4 py-2 text-right font-bold text-zinc-100 text-[13px]">{totalStock}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Variants FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader
              label="Product Variants"
              extra={
                <Link
                  href={`/products/${id}/variants`}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-[11px]"
                >
                  Manage variants →
                </Link>
              }
            />
            <div className="px-4 py-3 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-500" />
                {variantCount > 0 ? (
                  <span className="text-[13px] text-zinc-200">
                    <span className="font-semibold text-blue-400">{variantCount}</span> active variant{variantCount !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-[13px] text-zinc-600">No variants configured</span>
                )}
              </div>
              <Link
                href={`/products/${id}/variants`}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                {variantCount > 0 ? 'View Variants' : 'Set Up Variants'}
              </Link>
            </div>
          </div>

          {/* Bundle Configuration FastTab */}
          {(product.bundle || product.bundleComponents.length > 0) && (
            <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
              <FastTabHeader label="Bundle Configuration" extra={
                <Link
                  href={
                    product.bundle
                      ? `/products/bundles/${product.bundle.id}`
                      : `/products/bundles/${product.bundleComponents[0].bundle.id}`
                  }
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  Open Bundle
                </Link>
              } />
              <div className="px-4 py-3 space-y-3">
                {product.bundle && (
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">
                      This product IS a bundle
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize
                        ${product.bundle.bundleType === 'kit'
                          ? 'bg-blue-500/10 text-blue-400'
                          : product.bundle.bundleType === 'bundle'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {product.bundle.bundleType}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                        ${product.bundle.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}
                      >
                        {product.bundle.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Link
                        href={`/products/bundles/${product.bundle.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View bundle definition →
                      </Link>
                    </div>
                  </div>
                )}
                {product.bundleComponents.length > 0 && (
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-2">
                      Component in {product.bundleComponents.length === 1 ? '1 bundle' : `${product.bundleComponents.length} bundles`}
                    </p>
                    <div className="space-y-1">
                      {product.bundleComponents.map(bc => (
                        <div key={bc.id} className="flex items-center gap-2 text-[13px]">
                          <Layers className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          <Link
                            href={`/products/bundles/${bc.bundle.id}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {bc.bundle.product.name}
                          </Link>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-500 text-xs font-mono">{bc.bundle.product.sku}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meta */}
          <p className="text-[11px] text-zinc-600 px-1">
            Created {formatDate(product.createdAt)} · Updated {formatDate(product.updatedAt)}
            {product.taxable && ' · Taxable'}
            {!product.trackStock && ' · Stock not tracked'}
          </p>

        </div>
      </main>
    </>
  )
}
