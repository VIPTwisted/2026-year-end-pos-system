export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Package, ShoppingCart, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function RecommendationsPage() {
  // 1. Top products by order frequency
  const topByFrequency = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    _count: { id: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  })

  // Fetch product details for top products
  const topProductIds = topByFrequency.map(r => r.productId)
  const topProducts = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, sku: true, salePrice: true, category: { select: { name: true } } },
  })
  const topProductMap = Object.fromEntries(topProducts.map(p => [p.id, p]))

  // 2. Dead stock: tracked products with no order items
  const allTrackedProducts = await prisma.product.findMany({
    where: { trackStock: true, isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      salePrice: true,
      category: { select: { name: true } },
      orderItems: { select: { id: true }, take: 1 },
    },
  })
  const deadStock = allTrackedProducts.filter(p => p.orderItems.length === 0)

  // 3. Co-purchase analysis: last 500 orders with 2+ items
  const recentOrders = await prisma.order.findMany({
    take: 500,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        select: { productId: true },
      },
    },
  })

  // Build co-purchase pairs
  const pairCounts: Record<string, number> = {}
  for (const order of recentOrders) {
    const ids = order.items.map(i => i.productId).filter(Boolean) as string[]
    if (ids.length < 2) continue
    const unique = [...new Set(ids)].sort()
    for (let a = 0; a < unique.length; a++) {
      for (let b = a + 1; b < unique.length; b++) {
        const key = `${unique[a]}|||${unique[b]}`
        pairCounts[key] = (pairCounts[key] ?? 0) + 1
      }
    }
  }

  const topPairs = Object.entries(pairCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Fetch product names for pairs
  const pairProductIds = [...new Set(topPairs.flatMap(([key]) => key.split('|||')))]
  const pairProducts = await prisma.product.findMany({
    where: { id: { in: pairProductIds } },
    select: { id: true, name: true, sku: true },
  })
  const pairProductMap = Object.fromEntries(pairProducts.map(p => [p.id, p]))

  return (
    <>
      <TopBar title="Product Intelligence" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-6">

          {/* Header */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Insights</p>
            <h1 className="text-[18px] font-semibold text-zinc-100">Product Intelligence</h1>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              Computed from order history · top sellers, dead stock, co-purchase patterns
            </p>
          </div>

          {/* Top Products by Frequency */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Top 10 Products by Sales Volume</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>

            {topByFrequency.length === 0 ? (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-10">
                <p className="text-[13px] text-zinc-600">No order data yet</p>
              </div>
            ) : (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-zinc-800/60">
                      <tr>
                        {['Rank', 'Product', 'SKU', 'Category', 'Units Sold', 'Order Lines'].map(h => (
                          <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${['Units Sold', 'Order Lines'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {topByFrequency.map((row, i) => {
                        const product = topProductMap[row.productId]
                        return (
                          <tr key={row.productId} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">#{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-zinc-100">
                              {product ? (
                                <Link href={`/products/${product.id}`} className="hover:text-blue-400 transition-colors">
                                  {product.name}
                                </Link>
                              ) : (
                                <span className="text-zinc-500 font-mono text-[11px]">{row.productId}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{product?.sku ?? '—'}</td>
                            <td className="px-4 py-3">
                              {product?.category?.name ? (
                                <Badge variant="outline" className="text-[11px] capitalize">{product.category.name}</Badge>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-400 tabular-nums text-[13px]">
                              {(row._sum.quantity ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-zinc-400 tabular-nums text-[13px]">{row._count.id}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Dead Stock */}
          <section>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Dead Stock</span>
              <span className="text-[10px] text-red-400">{deadStock.length} products</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>
            <p className="text-[11px] text-zinc-600 mb-3">Tracked products with zero sales — consider promotions or clearance</p>

            {deadStock.length === 0 ? (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-10">
                <p className="text-[13px] text-zinc-600">No dead stock — all tracked products have sold at least once</p>
              </div>
            ) : (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-zinc-800/60">
                      <tr>
                        {['Product', 'SKU', 'Category', 'Price', 'Orders'].map(h => (
                          <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${h === 'Price' ? 'text-right' : h === 'Orders' ? 'text-center' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {deadStock.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-zinc-100">
                            <Link href={`/products/${p.id}`} className="hover:text-blue-400 transition-colors">{p.name}</Link>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{p.sku}</td>
                          <td className="px-4 py-3">
                            {p.category?.name ? (
                              <Badge variant="outline" className="text-[11px] capitalize">{p.category.name}</Badge>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">${p.salePrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="destructive" className="text-[11px]">0 orders</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Co-Purchase Analysis */}
          <section>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">Co-Purchase Analysis</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>
            <p className="text-[11px] text-zinc-600 mb-3">
              Customers who bought X also bought Y — computed from last 500 orders
            </p>

            {topPairs.length === 0 ? (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex items-center justify-center py-10">
                <p className="text-[13px] text-zinc-600">Not enough multi-item orders to compute pairs</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                {topPairs.map(([key, count]) => {
                  const [idA, idB] = key.split('|||')
                  const prodA = pairProductMap[idA]
                  const prodB = pairProductMap[idB]
                  return (
                    <div key={key} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="text-[13px] font-medium text-zinc-100 truncate">{prodA?.name ?? idA}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mb-2 pl-5">bought with</div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-[13px] font-medium text-blue-300 truncate">{prodB?.name ?? idB}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-600">Co-purchased</span>
                        <Badge variant="outline" className="text-[11px] font-mono">{count}x</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  )
}
