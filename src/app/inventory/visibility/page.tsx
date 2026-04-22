import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { Eye, Package, MapPin, AlertTriangle, ShieldAlert, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import VisibilityFilters from './VisibilityFilters'

export const dynamic = 'force-dynamic'

const STATUS_CONFIG = {
  in_stock:     { label: 'In Stock',    classes: 'bg-emerald-900/60 text-emerald-300', row: '' },
  low_stock:    { label: 'Low Stock',   classes: 'bg-amber-900/60 text-amber-300',    row: 'bg-amber-950/20' },
  out_of_stock: { label: 'Out of Stock',classes: 'bg-red-900/60 text-red-300',        row: 'bg-red-950/20' },
}

export default async function InventoryVisibilityPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; storeId?: string; status?: string; categoryId?: string }>
}) {
  const sp = await searchParams
  const search = sp.search ?? ''
  const storeId = sp.storeId ?? ''
  const statusFilter = sp.status ?? ''
  const categoryId = sp.categoryId ?? ''

  const [allInventory, stores, categories] = await Promise.all([
    prisma.inventory.findMany({
      where: storeId ? { storeId } : {},
      include: {
        product: { include: { category: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { product: { name: 'asc' } },
    }),
    prisma.store.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.productCategory.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  // Enrich with computed status
  const enriched = allInventory
    .filter((i) => {
      const nameMatch = !search || i.product.name.toLowerCase().includes(search.toLowerCase()) || i.product.sku.toLowerCase().includes(search.toLowerCase())
      const catMatch = !categoryId || i.product.categoryId === categoryId
      return nameMatch && catMatch
    })
    .map((i) => {
      const available = i.quantity - i.reserved
      const reorderPoint = i.product.reorderPoint ?? 0
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
      if (i.quantity <= 0) status = 'out_of_stock'
      else if (i.quantity <= reorderPoint) status = 'low_stock'
      return { ...i, available, computedStatus: status }
    })
    .filter((i) => !statusFilter || i.computedStatus === statusFilter)

  // KPIs
  const totalSKUs = enriched.length
  const totalLocations = new Set(enriched.map(i => i.storeId)).size
  const outOfStock = enriched.filter(i => i.computedStatus === 'out_of_stock').length
  const lowStock = enriched.filter(i => i.computedStatus === 'low_stock').length
  const totalReserved = enriched.reduce((sum, i) => sum + i.reserved, 0)

  const kpis = [
    { label: 'SKUs Tracked', value: totalSKUs, icon: Package, color: 'text-blue-400' },
    { label: 'Locations', value: totalLocations, icon: MapPin, color: 'text-purple-400' },
    { label: 'Out of Stock', value: outOfStock, icon: ShieldAlert, color: 'text-red-400' },
    { label: 'Low Stock Alerts', value: lowStock, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Reserved Qty', value: totalReserved.toFixed(0), icon: Lock, color: 'text-zinc-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Inventory Visibility"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }]}
      />

      <div className="p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-3">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
              <Icon className={cn('w-7 h-7', color)} />
              <div>
                <div className="text-xl font-bold text-zinc-100">{value}</div>
                <div className="text-[11px] text-zinc-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Store Tabs */}
        <div className="flex gap-2 flex-wrap">
          <a
            href="/inventory/visibility"
            className={cn(
              'px-3 py-1 rounded text-[13px] transition-colors',
              !storeId ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            All Locations ({allInventory.length})
          </a>
          {stores.map((s) => {
            const count = allInventory.filter(i => i.storeId === s.id).length
            return (
              <a
                key={s.id}
                href={`/inventory/visibility?storeId=${s.id}`}
                className={cn(
                  'px-3 py-1 rounded text-[13px] transition-colors',
                  storeId === s.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                )}
              >
                {s.name} ({count})
              </a>
            )
          })}
        </div>

        {/* Filters */}
        <VisibilityFilters
          categories={categories}
          currentSearch={search}
          currentCategory={categoryId}
          currentStatus={statusFilter}
          currentStoreId={storeId}
        />

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-zinc-800">
              <tr>
                {['SKU', 'Product Name', 'Location', 'On Hand', 'Reserved', 'Available', 'Reorder Pt.', 'Status'].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-[11px] text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map((item) => {
                const cfg = STATUS_CONFIG[item.computedStatus]
                return (
                  <tr key={`${item.productId}-${item.storeId}`} className={cn('border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors', cfg.row)}>
                    <td className="py-2.5 px-4 text-[12px] font-mono text-zinc-400">{item.product.sku}</td>
                    <td className="py-2.5 px-4 text-[13px] text-zinc-200 font-medium">{item.product.name}</td>
                    <td className="py-2.5 px-4 text-[13px] text-zinc-400">{item.store.name}</td>
                    <td className="py-2.5 px-4 text-[13px] tabular-nums text-zinc-200 font-medium">{item.quantity}</td>
                    <td className="py-2.5 px-4 text-[13px] tabular-nums text-zinc-400">{item.reserved}</td>
                    <td className={cn('py-2.5 px-4 text-[13px] tabular-nums font-medium',
                      item.available <= 0 ? 'text-red-400' : item.computedStatus === 'low_stock' ? 'text-amber-400' : 'text-emerald-400'
                    )}>
                      {item.available}
                    </td>
                    <td className="py-2.5 px-4 text-[13px] tabular-nums text-zinc-500">
                      {item.product.reorderPoint ?? <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium', cfg.classes)}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {enriched.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[13px] text-zinc-600">
                    No inventory records match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
