export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ScanLine } from 'lucide-react'

const METHOD_LABEL: Record<string, string> = {
  none: 'None',
  serial: 'Serial',
  lot: 'Lot',
  lot_and_serial: 'Lot + Serial',
}

function TrackingChip({ method }: { method: string }) {
  const map: Record<string, string> = {
    none: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    serial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    lot: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    lot_and_serial: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }
  const cls = map[method] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${cls}`}>
      {METHOD_LABEL[method] ?? method}
    </span>
  )
}

export default async function ItemTrackingPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      itemTracking: {
        select: {
          trackingMethod: true,
          _count: { select: { lotNos: true, serialNos: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Item Tracking" />
      <main className="flex-1 p-6 space-y-5">

        {/* Page header with count + links */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">
            {products.length} Products
          </h2>
          <div className="flex gap-3">
            <Link href="/warehouse/lot-numbers" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
              All Lot Numbers
            </Link>
            <Link href="/warehouse/serial-numbers" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
              All Serial Numbers
            </Link>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <ScanLine className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-[13px]">No products found</p>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Product</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">SKU</th>
                  <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Tracking</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Lots</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Serials</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const tracking = p.itemTracking[0]
                  const method = tracking?.trackingMethod ?? 'none'
                  const lotCount = tracking?._count.lotNos ?? 0
                  const serialCount = tracking?._count.serialNos ?? 0
                  return (
                    <tr key={p.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2 text-zinc-200 font-medium">{p.name}</td>
                      <td className="px-4 py-2 font-mono text-zinc-500">{p.sku}</td>
                      <td className="px-4 py-2 text-center">
                        <TrackingChip method={method} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        {lotCount > 0 ? (
                          <Link href={`/warehouse/lot-numbers?productId=${p.id}`} className="text-amber-400 hover:text-amber-300 hover:underline font-semibold">
                            {lotCount}
                          </Link>
                        ) : <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {serialCount > 0 ? (
                          <Link href={`/warehouse/serial-numbers?productId=${p.id}`} className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold">
                            {serialCount}
                          </Link>
                        ) : <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link href={`/warehouse/item-tracking/${p.id}`} className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
                          Configure
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
