export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Package, AlertTriangle, TrendingUp, XCircle } from 'lucide-react'

/* ── helpers ─────────────────────────────────────────────────── */
function stockBadge(qty: number, reorder: number | null) {
  if (qty <= 0) return { label: 'Out of Stock', cls: 'bg-red-500/10 text-red-400' }
  if (reorder !== null && qty < reorder) return { label: 'Low Stock', cls: 'bg-amber-500/10 text-amber-400' }
  return { label: 'In Stock', cls: 'bg-emerald-500/10 text-emerald-400' }
}

/* ── page ─────────────────────────────────────────────────────── */
export default async function ProductAnalyticsPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  /* ── Fetch aggregated order items grouped by product ────────── */
  const orderItemAgg = await prisma.orderItem.groupBy({
    by: ['productId', 'productName', 'sku'],
    _sum: { quantity: true, lineTotal: true },
    _avg: { unitPrice: true },
    orderBy: { _sum: { lineTotal: 'desc' } },
    take: 20,
  })

  /* ── Products sold this month ───────────────────────────────── */
  const orderItemsThisMonth = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: { createdAt: { gte: monthStart } },
    },
    _sum: { quantity: true },
  })
  const soldThisMonth = new Set(orderItemsThisMonth.map(i => i.productId))

  /* ── All active products with inventory ─────────────────────── */
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      reorderPoint: true,
      inventory: {
        select: { quantity: true },
      },
    },
  })

  /* ── Low stock products ─────────────────────────────────────── */
  const lowStockProducts = allProducts.filter(p => {
    const qty = p.inventory.reduce((s, i) => s + i.quantity, 0)
    return p.reorderPoint !== null && qty < p.reorderPoint
  })
  lowStockProducts.sort((a, b) => {
    const aqty = a.inventory.reduce((s, i) => s + i.quantity, 0)
    const bqty = b.inventory.reduce((s, i) => s + i.quantity, 0)
    const aratio = a.reorderPoint ? aqty / a.reorderPoint : 1
    const bratio = b.reorderPoint ? bqty / b.reorderPoint : 1
    return aratio - bratio
  })

  /* ── Zero sales this month ──────────────────────────────────── */
  const zeroSalesThisMonth = allProducts.filter(p => !soldThisMonth.has(p.id)).length

  /* ── Build inventory map ────────────────────────────────────── */
  const inventoryMap = new Map<string, number>()
  for (const p of allProducts) {
    const total = p.inventory.reduce((s, i) => s + i.quantity, 0)
    inventoryMap.set(p.id, total)
  }

  /* ── KPI: top selling by qty ────────────────────────────────── */
  const topByQty = [...orderItemAgg].sort(
    (a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0)
  )[0]

  /* ── KPI: highest revenue product ──────────────────────────── */
  const topByRev = orderItemAgg[0] // already sorted by lineTotal desc

  /* ── Low stock count (all products) ────────────────────────── */
  const lowStockCount = lowStockProducts.length

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <>
      <TopBar title="Product Performance" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Breadcrumb + header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/analytics" className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">Analytics</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-300">Products</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Product Performance</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Revenue, units sold, and stock alerts — live from Prisma</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Top by Qty</span>
            </div>
            <div className="text-lg font-bold text-zinc-100 leading-tight line-clamp-2">
              {topByQty ? topByQty.productName : '—'}
            </div>
            <div className="text-xs text-zinc-500 mt-1 tabular-nums">
              {topByQty ? `${(topByQty._sum.quantity ?? 0).toFixed(0)} units sold` : 'No data'}
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Highest Revenue</span>
            </div>
            <div className="text-lg font-bold text-zinc-100 leading-tight line-clamp-2">
              {topByRev ? topByRev.productName : '—'}
            </div>
            <div className="text-xs text-emerald-400 mt-1 tabular-nums font-semibold">
              {topByRev ? formatCurrency(topByRev._sum.lineTotal ?? 0) : 'No data'}
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Zero Sales (Month)</span>
            </div>
            <div className="text-3xl font-bold text-red-400 tabular-nums">{zeroSalesThisMonth}</div>
            <div className="text-xs text-zinc-500 mt-1">Products with no orders this month</div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Low Stock</span>
            </div>
            <div className="text-3xl font-bold text-amber-400 tabular-nums">{lowStockCount}</div>
            <div className="text-xs text-zinc-500 mt-1">Below reorder point</div>
          </div>
        </div>

        {/* Top 20 products by revenue */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Top 20 Products by Revenue</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>
          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-10">#</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Product</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">SKU</th>
                  <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Units Sold</th>
                  <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Revenue</th>
                  <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Avg Price</th>
                  <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Stock</th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {orderItemAgg.map((item, i) => {
                  const qty = inventoryMap.get(item.productId) ?? 0
                  const product = allProducts.find(p => p.id === item.productId)
                  const badge = stockBadge(qty, product?.reorderPoint ?? null)
                  return (
                    <tr key={item.productId} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4 text-zinc-500 font-mono text-xs">{i + 1}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/products/${item.productId}`}
                          className="text-zinc-100 hover:text-blue-400 transition-colors font-medium text-[13px]"
                        >
                          {item.productName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-[12px] text-zinc-400">{item.sku}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-zinc-300 text-[13px]">
                        {(item._sum.quantity ?? 0).toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold text-emerald-400 text-[13px]">
                        {formatCurrency(item._sum.lineTotal ?? 0)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-zinc-300 text-[13px]">
                        {formatCurrency(item._avg.unitPrice ?? 0)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-zinc-300 text-[13px]">
                        {qty.toFixed(0)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {orderItemAgg.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-600 text-[13px]">No sales data found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Low Stock Alerts</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
              <span className="text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-medium">
                {lowStockProducts.length} products
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-amber-500/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-amber-500/5">
                    <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Product</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">SKU</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Current Stock</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reorder Point</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Suggested Order</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => {
                    const qty = p.inventory.reduce((s, i) => s + i.quantity, 0)
                    const reorder = p.reorderPoint ?? 0
                    const suggested = reorder * 2
                    const pct = reorder > 0 ? (qty / reorder) * 100 : 0
                    const urgency = qty <= 0 ? { label: 'Critical', cls: 'bg-red-500/10 text-red-400' }
                      : pct < 50 ? { label: 'High', cls: 'bg-red-500/10 text-red-400' }
                      : { label: 'Medium', cls: 'bg-amber-500/10 text-amber-400' }
                    return (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/products/${p.id}`}
                            className="text-zinc-100 hover:text-blue-400 transition-colors font-medium text-[13px]"
                          >
                            {p.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-mono text-[12px] text-zinc-400">{p.sku}</td>
                        <td className="py-3 px-4 text-right tabular-nums">
                          <span className="text-[13px] font-semibold text-red-400">{qty.toFixed(0)}</span>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-zinc-300 text-[13px]">{reorder}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-blue-400 text-[13px] font-semibold">{suggested}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${urgency.cls}`}>
                            {urgency.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
