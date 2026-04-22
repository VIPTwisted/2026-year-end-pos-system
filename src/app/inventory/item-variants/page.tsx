export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Layers, ChevronRight, Filter } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export default async function ItemVariantsPage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>
}) {
  const sp = await searchParams

  const [rows, products] = await Promise.all([
    prisma.itemVariant.findMany({
      where: sp.itemId ? { itemId: sp.itemId } : undefined,
      orderBy: [{ itemId: 'asc' }, { variantCode: 'asc' }],
    }).catch(() => []),
    prisma.product.findMany({ select: { id: true, sku: true, name: true } }).catch(() => []),
  ])

  const productMap = new Map(products.map(p => [p.id, p]))
  const totalInventory = rows.reduce((s, r) => s + r.inventory, 0)

  return (
    <>
      <TopBar title="Item Variants" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1 text-[11px] text-zinc-500">
          <Link href="/inventory" className="hover:text-zinc-300 transition-colors">Inventory</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Item Variants</span>
        </div>

        {/* Filters */}
        <form method="GET" className="bg-[#16213e]/60 border-b border-zinc-800/40 px-4 py-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-medium uppercase tracking-wide">Filters</span>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Item</label>
              <select name="itemId" defaultValue={sp.itemId ?? ''}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500 w-52">
                <option value="">All Items</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                ))}
              </select>
            </div>
            <button type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors">
              Apply
            </button>
            {sp.itemId && (
              <Link href="/inventory/item-variants"
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[12px] rounded transition-colors">
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Stats */}
        <div className="px-4 py-3 grid grid-cols-2 gap-4 max-w-sm">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Variants</div>
            <div className="text-[20px] font-semibold text-zinc-100 mt-0.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              {rows.length}
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Total Inventory</div>
            <div className="text-[20px] font-semibold text-emerald-400 mt-0.5">{fmt(totalInventory)}</div>
          </div>
        </div>

        <div className="px-4 pb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Item No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Item Name</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Variant Code</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Sales Price</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Inventory</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-zinc-600 text-[12px]">
                        No item variants found. Create variants via the API or on individual item records.
                      </td>
                    </tr>
                  ) : (
                    rows.map(r => {
                      const prod = productMap.get(r.itemId)
                      return (
                        <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-3 py-2.5 text-blue-400 font-medium">{prod?.sku ?? '—'}</td>
                          <td className="px-3 py-2.5 text-zinc-300">{prod?.name ?? '—'}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[11px] font-mono font-medium">
                              {r.variantCode}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-zinc-300">{r.description ?? '—'}</td>
                          <td className="px-3 py-2.5 text-right text-zinc-300">${fmt(r.salesPrice)}</td>
                          <td className={`px-3 py-2.5 text-right font-medium ${r.inventory > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {fmt(r.inventory)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
