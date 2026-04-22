import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  PackageSearch,
  TrendingUp,
  DollarSign,
  Layers,
  BrainCircuit,
  ChevronRight,
} from 'lucide-react'

export default async function InventoryPage() {
  // ── Main inventory query (ordered by store → product) ────────────────────
  const inventory = await prisma.inventory.findMany({
    include: {
      product: { include: { category: true } },
      store: true,
    },
    orderBy: [{ store: { name: 'asc' } }, { product: { name: 'asc' } }],
  })

  // ── Reorder alerts query (DDMRP / reorder-point pattern) ─────────────────
  const reorderItems = await prisma.inventory.findMany({
    where: { quantity: { lte: 5 } },
    include: { product: true, store: true },
    orderBy: { quantity: 'asc' },
  })

  // ── KPI computations (server-side, no extra DB round-trips) ──────────────
  const totalSKUs = inventory.length

  const totalStockValue = inventory.reduce((sum, inv) => {
    return sum + inv.quantity * (inv.product.costPrice ?? 0)
  }, 0)

  const reorderAlertCount = inventory.filter(inv => {
    const rp = inv.product.reorderPoint
    return rp !== null && rp !== undefined && inv.quantity <= rp
  }).length

  // ── Demand Intelligence derivations ──────────────────────────────────────
  // Fastest-moving proxy: lowest (quantity / reorderPoint) ratio → most depleted relative to threshold
  const itemsWithThreshold = inventory.filter(
    inv => inv.product.reorderPoint !== null && inv.product.reorderPoint !== undefined && inv.product.reorderPoint > 0,
  )

  const fastestMoving = itemsWithThreshold.length > 0
    ? itemsWithThreshold.reduce((prev, cur) => {
        const prevRatio = prev.quantity / (prev.product.reorderPoint ?? 1)
        const curRatio = cur.quantity / (cur.product.reorderPoint ?? 1)
        return curRatio < prevRatio ? cur : prev
      })
    : null

  // Most valuable: highest (quantity * costPrice)
  const mostValuable = inventory.length > 0
    ? inventory.reduce((prev, cur) => {
        const prevVal = prev.quantity * (prev.product.costPrice ?? 0)
        const curVal = cur.quantity * (cur.product.costPrice ?? 0)
        return curVal > prevVal ? cur : prev
      })
    : null

  // Critical count + replacement cost (items below reorder point)
  const criticalItems = inventory.filter(inv => {
    const rp = inv.product.reorderPoint
    return rp !== null && rp !== undefined && inv.quantity <= rp
  })
  const criticalReplacementCost = criticalItems.reduce((sum, inv) => {
    const needed = Math.max(0, (inv.product.reorderPoint ?? 0) - inv.quantity)
    return sum + needed * (inv.product.costPrice ?? 0)
  }, 0)

  return (
    <>
      <TopBar title="Inventory" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Stock Levels</h2>
            <p className="text-sm text-zinc-500">{totalSKUs} product-location entries</p>
          </div>
          <Button variant="outline">Adjust Stock</Button>
        </div>

        {/* ── KPI header row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total SKUs Tracked</CardDescription>
                <Layers className="w-4 h-4 text-zinc-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-100">{totalSKUs}</p>
              <p className="text-xs text-zinc-500 mt-1">Product-location records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Stock Value</CardDescription>
                <DollarSign className="w-4 h-4 text-zinc-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalStockValue)}</p>
              <p className="text-xs text-zinc-500 mt-1">At cost price</p>
            </CardContent>
          </Card>

          <Card className={reorderAlertCount > 0 ? 'border-red-700' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Reorder Alerts</CardDescription>
                <AlertTriangle className={`w-4 h-4 ${reorderAlertCount > 0 ? 'text-red-400' : 'text-zinc-500'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${reorderAlertCount > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                {reorderAlertCount}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Items at or below reorder point</p>
            </CardContent>
          </Card>
        </div>

        {/* ── DDMRP Reorder Alerts section ─────────────────────────────────── */}
        {reorderItems.length === 0 ? (
          <Card className="border-emerald-800 bg-emerald-950/30">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300 font-medium">All inventory levels healthy — no reorder actions required</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-800 bg-red-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <CardTitle className="text-red-300 text-base">Reorder Required — {reorderItems.length} item{reorderItems.length !== 1 ? 's' : ''}</CardTitle>
              </div>
              <CardDescription>Items at or below 5 units — action needed to prevent stockouts</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {reorderItems.map(inv => {
                  const rp = inv.product.reorderPoint ?? 5
                  const suggestedQty = inv.product.reorderQty ?? rp * 2
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center gap-4 bg-zinc-900 rounded-lg px-4 py-2.5 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-zinc-100 truncate block">{inv.product.name}</span>
                        <span className="text-xs text-zinc-500">{inv.product.sku} · {inv.store.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-red-400 font-bold tabular-nums">{inv.quantity}</span>
                        <span className="text-zinc-600 mx-1">/</span>
                        <span className="text-zinc-400 text-xs">{rp} ROP</span>
                      </div>
                      <div className="text-xs text-zinc-400 shrink-0 hidden sm:block">
                        Suggest <span className="text-amber-300 font-semibold">{suggestedQty}</span> units
                      </div>
                      <Badge variant="destructive" className="shrink-0 text-xs">Reorder Now</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Main inventory table ──────────────────────────────────────────── */}
        {inventory.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Warehouse className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No inventory data — run seed script or receive a purchase order</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PackageSearch className="w-4 h-4 text-zinc-400" />
                Full Inventory Ledger
              </CardTitle>
              <CardDescription>All product-location records ordered by store then product</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 pr-4 font-medium">Product</th>
                      <th className="text-left pb-3 pr-4 font-medium">Category</th>
                      <th className="text-left pb-3 pr-4 font-medium">SKU</th>
                      <th className="text-left pb-3 pr-4 font-medium">Store</th>
                      <th className="text-right pb-3 pr-4 font-medium">On Hand</th>
                      <th className="text-right pb-3 pr-4 font-medium">Reserved</th>
                      <th className="text-right pb-3 pr-4 font-medium">Available</th>
                      <th className="text-right pb-3 pr-4 font-medium">Stock Value</th>
                      <th className="text-center pb-3 font-medium">Status</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {inventory.map(inv => {
                      const rp = inv.product.reorderPoint
                      const available = inv.quantity - inv.reserved
                      const stockValue = inv.quantity * (inv.product.costPrice ?? 0)

                      let statusVariant: 'destructive' | 'warning' | 'success' | 'secondary' = 'secondary'
                      let statusLabel = 'No Threshold'
                      if (inv.quantity <= 2) {
                        statusVariant = 'destructive'
                        statusLabel = 'Critical'
                      } else if (rp !== null && rp !== undefined && inv.quantity <= rp) {
                        statusVariant = 'warning'
                        statusLabel = 'Low'
                      } else if (rp !== null && rp !== undefined && inv.quantity > rp) {
                        statusVariant = 'success'
                        statusLabel = 'OK'
                      }

                      const isCritical = inv.quantity <= 2
                      const isLow = !isCritical && rp !== null && rp !== undefined && inv.quantity <= rp

                      return (
                        <tr key={inv.id} className="hover:bg-zinc-800/40 transition-colors group">
                          <td className="py-3 pr-4">
                            <Link href={`/inventory/${inv.id}`} className="font-medium text-zinc-100 group-hover:text-blue-300 transition-colors">
                              {inv.product.name}
                            </Link>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-xs text-zinc-400">
                              {inv.product.category?.name ?? <span className="text-zinc-600">—</span>}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-mono text-xs text-zinc-500">{inv.product.sku}</span>
                          </td>
                          <td className="py-3 pr-4 text-zinc-400">{inv.store.name}</td>
                          <td className="py-3 pr-4 text-right font-semibold tabular-nums text-zinc-100">
                            {inv.quantity}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-zinc-500">{inv.reserved}</td>
                          <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {available}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-zinc-300">
                            {formatCurrency(stockValue)}
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant={statusVariant} className="gap-1">
                              {isCritical && <AlertTriangle className="w-3 h-3" />}
                              {statusLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/inventory/${inv.id}`}>
                              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Demand Intelligence section (NovaPOS AI Forecasting stub) ─────────── */}
        {inventory.length > 0 && (
          <Card className="border-zinc-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base">Demand Intelligence</CardTitle>
                <Badge variant="outline" className="ml-auto text-xs font-normal">Powered by inventory analytics</Badge>
              </div>
              <CardDescription>
                Real-time signals derived from current stock positions and cost data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Fastest Moving */}
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Fastest Moving</span>
                  </div>
                  {fastestMoving ? (
                    <>
                      <p className="text-sm font-semibold text-zinc-100 leading-tight">{fastestMoving.product.name}</p>
                      <p className="text-xs text-zinc-500 mt-1 font-mono">{fastestMoving.product.sku}</p>
                      <p className="text-xs text-amber-400 mt-2 font-medium">
                        {fastestMoving.quantity} on hand · ROP {fastestMoving.product.reorderPoint}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">Most depleted relative to reorder point</p>
                    </>
                  ) : (
                    <p className="text-xs text-zinc-600 mt-1">No threshold data available</p>
                  )}
                </div>

                {/* Most Valuable Stock */}
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Most Valuable Stock</span>
                  </div>
                  {mostValuable ? (
                    <>
                      <p className="text-sm font-semibold text-zinc-100 leading-tight">{mostValuable.product.name}</p>
                      <p className="text-xs text-zinc-500 mt-1 font-mono">{mostValuable.product.sku}</p>
                      <p className="text-xs text-emerald-400 mt-2 font-medium">
                        {formatCurrency(mostValuable.quantity * (mostValuable.product.costPrice ?? 0))} at cost
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">{mostValuable.quantity} units × {formatCurrency(mostValuable.product.costPrice ?? 0)}</p>
                    </>
                  ) : (
                    <p className="text-xs text-zinc-600 mt-1">No cost data available</p>
                  )}
                </div>

                {/* Critical Count */}
                <div className={`rounded-lg p-4 border ${criticalItems.length > 0 ? 'bg-red-950/30 border-red-800/50' : 'bg-zinc-800/50 border-zinc-700/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-4 h-4 ${criticalItems.length > 0 ? 'text-red-400' : 'text-zinc-500'}`} />
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Below Reorder Point</span>
                  </div>
                  <p className={`text-3xl font-bold ${criticalItems.length > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                    {criticalItems.length}
                  </p>
                  <p className="text-xs text-zinc-400 mt-2 font-medium">
                    {criticalItems.length > 0
                      ? <>Replacement cost: <span className="text-red-300">{formatCurrency(criticalReplacementCost)}</span></>
                      : 'No items below threshold'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">Cost to restore to reorder point</p>
                </div>

              </div>
            </CardContent>
          </Card>
        )}

      </main>
    </>
  )
}
