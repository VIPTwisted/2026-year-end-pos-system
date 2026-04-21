import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    select: { id: true, name: true, sku: true, price: true, category: true },
  })
  const topProductMap = Object.fromEntries(topProducts.map(p => [p.id, p]))

  // 2. Dead stock: tracked products with no order items
  const allTrackedProducts = await prisma.product.findMany({
    where: { trackStock: true, isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      category: true,
      _count: { select: { orderItems: true } },
    },
  })
  const deadStock = allTrackedProducts.filter(p => p._count.orderItems === 0)

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
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Product Intelligence</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Computed from order history · top sellers, dead stock, co-purchase patterns
          </p>
        </div>

        {/* Top Products by Frequency */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Top 10 Products by Sales Volume</h2>
          </div>

          {topByFrequency.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-10 text-center text-zinc-500 text-sm">No order data yet</CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Rank</th>
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-left pb-3 font-medium">SKU</th>
                    <th className="text-left pb-3 font-medium">Category</th>
                    <th className="text-right pb-3 font-medium">Units Sold</th>
                    <th className="text-right pb-3 font-medium">Order Lines</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {topByFrequency.map((row, i) => {
                    const product = topProductMap[row.productId]
                    return (
                      <tr key={row.productId} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 text-zinc-500 font-mono text-xs">#{i + 1}</td>
                        <td className="py-3 pr-4 font-medium text-zinc-100">
                          {product ? (
                            <Link href={`/products/${product.id}`} className="hover:text-blue-400 transition-colors">
                              {product.name}
                            </Link>
                          ) : (
                            <span className="text-zinc-500 font-mono text-xs">{row.productId}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-500">
                          {product?.sku ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          {product?.category ? (
                            <Badge variant="outline" className="text-xs capitalize">{product.category}</Badge>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right font-bold text-emerald-400 tabular-nums">
                          {(row._sum.quantity ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-zinc-400 tabular-nums">
                          {row._count.id}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Dead Stock */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              Dead Stock
              <span className="ml-2 text-sm font-normal text-red-400">{deadStock.length} products</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Tracked products with zero sales — consider promotions or clearance</p>

          {deadStock.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-10 text-center text-zinc-500 text-sm">
                No dead stock — all tracked products have sold at least once
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-left pb-3 font-medium">SKU</th>
                    <th className="text-left pb-3 font-medium">Category</th>
                    <th className="text-right pb-3 font-medium">Price</th>
                    <th className="text-center pb-3 font-medium">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {deadStock.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-medium text-zinc-100">
                        <Link href={`/products/${p.id}`} className="hover:text-blue-400 transition-colors">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{p.sku}</td>
                      <td className="py-3 pr-4">
                        {p.category ? (
                          <Badge variant="outline" className="text-xs capitalize">{p.category}</Badge>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant="destructive" className="text-xs">0 orders</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Co-Purchase Analysis */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Co-Purchase Analysis</h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Customers who bought X also bought Y — computed from last 500 orders
          </p>

          {topPairs.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-10 text-center text-zinc-500 text-sm">
                Not enough multi-item orders to compute pairs
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topPairs.map(([key, count]) => {
                const [idA, idB] = key.split('|||')
                const prodA = pairProductMap[idA]
                const prodB = pairProductMap[idB]
                return (
                  <Card key={key} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span className="text-sm font-medium text-zinc-100 truncate">
                          {prodA?.name ?? idA}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mb-2 pl-6">bought with</div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-sm font-medium text-blue-300 truncate">
                          {prodB?.name ?? idB}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-600">Co-purchased</span>
                        <Badge variant="outline" className="text-xs font-mono">{count}x</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

      </main>
    </>
  )
}
