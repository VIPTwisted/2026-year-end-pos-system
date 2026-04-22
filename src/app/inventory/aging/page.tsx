import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { AgingTable, type AgingItem } from '@/components/inventory/AgingTable'
import { Download, TrendingDown, Clock, AlertTriangle, CheckCircle2, Layers } from 'lucide-react'

type Classification = 'active' | 'slow_moving' | 'aging' | 'dead_stock'

function classify(daysSince: number): Classification {
  if (daysSince <= 30) return 'active'
  if (daysSince <= 90) return 'slow_moving'
  if (daysSince <= 180) return 'aging'
  return 'dead_stock'
}

export default async function InventoryAgingPage() {
  const now = new Date()
  const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const cutoff90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  // Fetch all products with positive stock
  const products = await prisma.product.findMany({
    where: {
      inventory: { some: { quantity: { gt: 0 } } },
    },
    include: {
      category: true,
      inventory: true,
      orderItems: {
        include: {
          order: {
            select: { status: true, createdAt: true },
          },
        },
        orderBy: { order: { createdAt: 'desc' } },
      },
    },
  })

  const items: AgingItem[] = products.map((product) => {
    const currentQty = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)

    const completedItems = product.orderItems.filter(
      (oi) => oi.order.status === 'completed' || oi.order.status === 'paid',
    )

    let lastSoldDate: Date | null = null
    if (completedItems.length > 0) {
      lastSoldDate = completedItems[0].order.createdAt
    }

    const refDate = lastSoldDate ?? product.createdAt
    const daysSinceLastSold = Math.floor(
      (now.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24),
    )

    const velocity30d = completedItems
      .filter((oi) => oi.order.createdAt >= cutoff30)
      .reduce((sum, oi) => sum + oi.quantity, 0)

    const velocity90d = completedItems
      .filter((oi) => oi.order.createdAt >= cutoff90)
      .reduce((sum, oi) => sum + oi.quantity, 0)

    const unitCost = product.costPrice ?? 0
    const stockValue = currentQty * unitCost
    const classification = classify(daysSinceLastSold)

    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name ?? null,
      currentQty,
      unitCost,
      stockValue,
      lastSoldDate: lastSoldDate ? lastSoldDate.toISOString() : null,
      daysSinceLastSold,
      classification,
      velocity30d,
      velocity90d,
    }
  })

  // Summary
  const totalStockValue = items.reduce((s, i) => s + i.stockValue, 0)

  const byClass = (cls: Classification) => items.filter((i) => i.classification === cls)

  const activeItems = byClass('active')
  const slowItems = byClass('slow_moving')
  const agingItems = byClass('aging')
  const deadItems = byClass('dead_stock')

  const sumValue = (arr: AgingItem[]) => arr.reduce((s, i) => s + i.stockValue, 0)

  const summaryCards = [
    {
      label: 'Total Stock Value',
      value: formatCurrency(totalStockValue),
      count: items.length,
      countLabel: 'SKUs tracked',
      icon: Layers,
      color: 'text-zinc-100',
      border: 'border-zinc-800/50',
    },
    {
      label: 'Active (last 30d)',
      value: formatCurrency(sumValue(activeItems)),
      count: activeItems.length,
      countLabel: 'SKUs',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      border: 'border-emerald-800/30',
    },
    {
      label: 'Slow Moving (31–90d)',
      value: formatCurrency(sumValue(slowItems)),
      count: slowItems.length,
      countLabel: 'SKUs',
      icon: Clock,
      color: 'text-blue-400',
      border: 'border-blue-800/30',
    },
    {
      label: 'Aging (91–180d)',
      value: formatCurrency(sumValue(agingItems)),
      count: agingItems.length,
      countLabel: 'SKUs',
      icon: TrendingDown,
      color: 'text-amber-400',
      border: 'border-amber-800/30',
    },
    {
      label: 'Dead Stock (180d+)',
      value: formatCurrency(sumValue(deadItems)),
      count: deadItems.length,
      countLabel: 'SKUs',
      icon: AlertTriangle,
      color: 'text-red-400',
      border: 'border-red-800/30',
    },
  ]

  return (
    <>
      <TopBar
        title="Inventory Aging"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }]}
        actions={
          <a
            href="/api/inventory/aging/export"
            className="inline-flex items-center gap-2 h-8 px-3 rounded bg-zinc-800/60 border border-zinc-700/50 text-[13px] font-medium text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
        }
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

          {/* Page intro */}
          <div>
            <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">
              Inventory Aging Report
            </h1>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              Classify stock by days since last sale to identify dead inventory and markdown opportunities.
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className={`bg-[#16213e] border ${card.border} rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      {card.label}
                    </span>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className={`text-[22px] font-bold leading-none tabular-nums ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-1.5">
                    {card.count} {card.countLabel}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Dead stock action notice */}
          {deadItems.length > 0 && (
            <div className="bg-red-950/20 border border-red-800/30 rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-red-300">
                  Markdown Suggestions Active — {deadItems.length} dead stock SKU{deadItems.length !== 1 ? 's' : ''} detected
                </p>
                <p className="text-[12px] text-zinc-400 mt-0.5">
                  Aging items (91–180d): suggest <strong className="text-amber-300">10% discount</strong>. Dead stock under 1 year: <strong className="text-orange-300">25% discount</strong>. Dead stock over 1 year: <strong className="text-red-300">50% discount</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Client table with tabs */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-lg border border-zinc-800/50">
              <Layers className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-[13px] text-zinc-500">No inventory with stock found</p>
            </div>
          ) : (
            <AgingTable items={items} />
          )}

        </div>
      </main>
    </>
  )
}
