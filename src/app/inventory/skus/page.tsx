export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Barcode, ChevronRight, Filter, AlertTriangle } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export default async function SKUsPage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string; locationCode?: string }>
}) {
  const sp = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (sp.itemId) where.itemId = sp.itemId
  if (sp.locationCode) where.locationCode = sp.locationCode

  const [rows, products] = await Promise.all([
    prisma.stockkepingUnit.findMany({
      where,
      orderBy: [{ itemId: 'asc' }, { locationCode: 'asc' }],
    }).catch(() => []),
    prisma.product.findMany({ select: { id: true, sku: true, name: true } }).catch(() => []),
  ])

  const productMap = new Map(products.map(p => [p.id, p]))

  return (
    <>
      <TopBar title="Stockkeeping Units" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-1 text-[11px] text-zinc-500">
          <Link href="/inventory" className="hover:text-zinc-300 transition-colors">Inventory</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">SKUs</span>
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
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wide">Location</label>
              <input name="locationCode" defaultValue={sp.locationCode} placeholder="Location Code"
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-32" />
            </div>
            <button type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors">
              Apply
            </button>
            {Object.values(sp).some(Boolean) && (
              <Link href="/inventory/skus"
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[12px] rounded transition-colors">
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Stats */}
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-blue-400" />
            <span className="text-[13px] text-zinc-300 font-medium">{rows.length} SKUs</span>
          </div>
        </div>

        <div className="px-4 pb-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Item No.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Variant</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Location</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Reorder Point</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Reorder Qty</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Safety Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-12 text-center text-zinc-600 text-[12px]">
                        No stockkeeping units defined. SKUs are created per item-location combination.
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
                            {r.variantCode ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[11px] font-mono">
                                {r.variantCode}
                              </span>
                            ) : <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-zinc-300">{r.locationCode || '—'}</td>
                          <td className={`px-3 py-2.5 text-right ${r.reorderPoint > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                            {r.reorderPoint > 0 ? (
                              <span className="flex items-center justify-end gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {fmt(r.reorderPoint)}
                              </span>
                            ) : fmt(r.reorderPoint)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-zinc-300">{fmt(r.reorderQty)}</td>
                          <td className="px-3 py-2.5 text-right text-zinc-300">{fmt(r.safetyStock)}</td>
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
