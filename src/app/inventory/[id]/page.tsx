export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Package, AlertTriangle, CheckCircle2, Warehouse } from 'lucide-react'

export default async function InventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const inv = await prisma.inventory.findUnique({
    where: { id },
    include: {
      product: { include: { category: true, supplier: true } },
      store: true,
    },
  })

  if (!inv) notFound()

  const { product, store } = inv
  const available = inv.quantity - inv.reserved
  const rp = product.reorderPoint
  const stockValue = inv.quantity * (product.costPrice ?? 0)

  const isCritical = inv.quantity <= 2
  const isLow = !isCritical && rp != null && inv.quantity <= rp
  const isOk = rp != null && inv.quantity > rp

  let statusVariant: 'destructive' | 'warning' | 'success' | 'secondary' = 'secondary'
  let statusLabel = 'No Threshold'
  if (isCritical) { statusVariant = 'destructive'; statusLabel = 'Critical' }
  else if (isLow) { statusVariant = 'warning'; statusLabel = 'Low' }
  else if (isOk) { statusVariant = 'success'; statusLabel = 'OK' }

  // Recent transactions for this product/store
  const transactions = await prisma.inventoryTransaction.findMany({
    where: { productId: product.id, storeId: store.id },
    orderBy: { createdAt: 'desc' },
    take: 15,
  })

  // All locations for this product across stores
  const allLocations = await prisma.inventory.findMany({
    where: { productId: product.id },
    include: { store: true },
    orderBy: { quantity: 'desc' },
  })

  return (
    <>
      <TopBar title={product.name} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Header band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Inventory
              </Link>
              <span className="text-zinc-700">/</span>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400" />
                <span className="font-bold text-lg text-zinc-100">{product.name}</span>
              </div>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              {product.category && (
                <Badge variant="secondary" className="text-xs">{product.category.name}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/inventory`}>
                <Button variant="outline" size="sm">Back to Inventory</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* Reorder alert banner */}
          {(isCritical || isLow) && (
            <div className={`flex items-center gap-3 rounded-md border px-4 py-3 ${isCritical ? 'border-red-800 bg-red-950/30' : 'border-amber-800 bg-amber-950/20'}`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
              <p className={`text-sm font-medium ${isCritical ? 'text-red-300' : 'text-amber-300'}`}>
                {isCritical
                  ? `Critical stock level — only ${inv.quantity} unit${inv.quantity !== 1 ? 's' : ''} remaining at ${store.name}`
                  : `Stock below reorder point (${rp}) — ${inv.quantity} on hand at ${store.name}`}
              </p>
            </div>
          )}

          {isOk && (
            <div className="flex items-center gap-3 rounded-md border border-emerald-800 bg-emerald-950/20 px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm font-medium text-emerald-300">Stock levels healthy at {store.name}</p>
            </div>
          )}

          {/* Stock summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-[#16213e] border-zinc-800/50">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">On Hand</p>
                <p className="text-2xl font-bold text-zinc-100">{inv.quantity}</p>
                <p className="text-xs text-zinc-600 mt-1">{store.name}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#16213e] border-zinc-800/50">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Reserved</p>
                <p className="text-2xl font-bold text-zinc-400">{inv.reserved}</p>
                <p className="text-xs text-zinc-600 mt-1">committed to orders</p>
              </CardContent>
            </Card>
            <Card className="bg-[#16213e] border-zinc-800/50">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Available</p>
                <p className={`text-2xl font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {available}
                </p>
                <p className="text-xs text-zinc-600 mt-1">on hand − reserved</p>
              </CardContent>
            </Card>
            <Card className="bg-[#16213e] border-zinc-800/50">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Stock Value</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stockValue)}</p>
                <p className="text-xs text-zinc-600 mt-1">at cost price</p>
              </CardContent>
            </Card>
          </div>

          {/* Product details */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <div className="border-b border-zinc-800/40 py-2.5 px-4 bg-zinc-900/40">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">Product Details</span>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              {[
                { label: 'SKU', value: <span className="font-mono text-xs">{product.sku}</span> },
                { label: 'Barcode', value: product.barcode ?? '—' },
                { label: 'Unit', value: product.unit },
                { label: 'Category', value: product.category?.name ?? '—' },
                { label: 'Cost Price', value: formatCurrency(product.costPrice) },
                { label: 'Sale Price', value: formatCurrency(product.salePrice) },
                { label: 'Reorder Point', value: rp != null ? rp : '—' },
                { label: 'Reorder Qty', value: product.reorderQty != null ? product.reorderQty : '—' },
                { label: 'Supplier', value: product.supplier?.name ?? '—' },
                { label: 'Taxable', value: product.taxable ? 'Yes' : 'No' },
                { label: 'Track Stock', value: product.trackStock ? 'Yes' : 'No' },
                { label: 'Location', value: inv.location ?? '—' },
                { label: 'Last Updated', value: formatDate(inv.updatedAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-[13px] text-zinc-100">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All store locations for this product */}
          {allLocations.length > 1 && (
            <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
              <div className="border-b border-zinc-800/40 py-2.5 px-4 bg-zinc-900/40 flex items-center gap-2">
                <Warehouse className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">
                  All Store Locations ({allLocations.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                      <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Store</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">On Hand</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Reserved</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Available</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLocations.map(loc => {
                      const locAvail = loc.quantity - loc.reserved
                      const locVal = loc.quantity * (product.costPrice ?? 0)
                      const isCurrent = loc.id === id
                      return (
                        <tr key={loc.id} className={`border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors ${isCurrent ? 'bg-zinc-800/30' : ''}`}>
                          <td className="px-4 py-2 text-[13px] text-zinc-300">
                            {loc.store.name}
                            {isCurrent && <span className="ml-2 text-[11px] text-blue-400">(current)</span>}
                          </td>
                          <td className="px-4 py-2 text-right text-[13px] text-zinc-100 font-semibold tabular-nums">{loc.quantity}</td>
                          <td className="px-4 py-2 text-right text-[13px] text-zinc-500 tabular-nums">{loc.reserved}</td>
                          <td className={`px-4 py-2 text-right text-[13px] font-semibold tabular-nums ${locAvail <= 2 ? 'text-red-400' : locAvail <= (rp ?? 0) ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {locAvail}
                          </td>
                          <td className="px-4 py-2 text-right text-[13px] text-zinc-300 tabular-nums">{formatCurrency(locVal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent transactions */}
          {transactions.length > 0 && (
            <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
              <div className="border-b border-zinc-800/40 py-2.5 px-4 bg-zinc-900/40">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">
                  Recent Transactions ({transactions.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                      <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Date</th>
                      <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Type</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Qty</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Before</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">After</th>
                      <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2 text-[12px] text-zinc-500">{formatDate(tx.createdAt)}</td>
                        <td className="px-4 py-2">
                          <Badge variant={tx.quantity > 0 ? 'success' : 'destructive'} className="capitalize text-xs">
                            {tx.type}
                          </Badge>
                        </td>
                        <td className={`px-4 py-2 text-right text-[13px] font-semibold tabular-nums ${tx.quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                        </td>
                        <td className="px-4 py-2 text-right text-[13px] text-zinc-500 tabular-nums">{tx.beforeQty}</td>
                        <td className="px-4 py-2 text-right text-[13px] text-zinc-300 tabular-nums">{tx.afterQty}</td>
                        <td className="px-4 py-2 text-[12px] text-zinc-400 font-mono">{tx.reference ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
