import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'

interface InventoryProduct {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  unitPrice: number
  stockValue: number
  reorderPoint: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

interface InventoryReport {
  totalProducts: number
  totalSKUs: number
  totalStockValue: number
  lowStockCount: number
  outOfStockCount: number
  products: InventoryProduct[]
  topByValue: InventoryProduct[]
  lowStock: InventoryProduct[]
}

async function fetchInventory(): Promise<InventoryReport> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/reports/inventory`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load inventory report')
  return res.json() as Promise<InventoryReport>
}

function StatusBadge({ status }: { status: InventoryProduct['status'] }) {
  if (status === 'out_of_stock') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">
        Out of Stock
      </span>
    )
  }
  if (status === 'low_stock') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400">
        Low Stock
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
      In Stock
    </span>
  )
}

export default async function InventoryReportPage() {
  let report: InventoryReport | null = null
  let error: string | null = null

  try {
    report = await fetchInventory()
  } catch {
    error = 'Failed to load inventory report.'
  }

  return (
    <>
      <TopBar title="Inventory Report" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-100">Inventory Valuation Report</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Stock levels, values, and reorder status across all products</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg px-5 py-4 text-sm text-red-400">{error}</div>
        )}

        {report && (
          <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total SKUs</div>
                <div className="text-2xl font-bold text-zinc-100">{report.totalSKUs.toLocaleString()}</div>
                <div className="text-xs text-zinc-500 mt-1">Active products</div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Stock Value</div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">{formatCurrency(report.totalStockValue)}</div>
                <div className="text-xs text-zinc-500 mt-1">At sale price</div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Low Stock</div>
                <div className="text-2xl font-bold text-amber-400">{report.lowStockCount}</div>
                <div className="text-xs text-zinc-500 mt-1">Below reorder point</div>
              </div>
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Out of Stock</div>
                <div className="text-2xl font-bold text-red-400">{report.outOfStockCount}</div>
                <div className="text-xs text-zinc-500 mt-1">Zero quantity</div>
              </div>
            </div>

            {/* Full inventory table */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-100">All Products — Sorted by Stock Value</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Product</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">SKU</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Category</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Qty on Hand</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Unit Price</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Stock Value</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reorder Pt.</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.products.map(p => (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3 text-zinc-200 font-medium max-w-[220px] truncate">{p.name}</td>
                        <td className="px-5 py-3 text-zinc-400 font-mono text-xs">{p.sku}</td>
                        <td className="px-5 py-3 text-zinc-500 text-xs">{p.category}</td>
                        <td className="px-5 py-3 text-right text-zinc-200 tabular-nums">{p.quantity.toFixed(0)}</td>
                        <td className="px-5 py-3 text-right text-zinc-400 tabular-nums">{formatCurrency(p.unitPrice)}</td>
                        <td className="px-5 py-3 text-right text-zinc-100 font-semibold tabular-nums">{formatCurrency(p.stockValue)}</td>
                        <td className="px-5 py-3 text-right text-zinc-500 tabular-nums">{p.reorderPoint}</td>
                        <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                    {report.products.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-zinc-500 text-xs">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
