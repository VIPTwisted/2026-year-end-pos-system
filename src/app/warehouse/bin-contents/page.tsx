export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Layers } from 'lucide-react'

export default async function BinContentsPage({
  searchParams,
}: {
  searchParams: Promise<{ zoneId?: string; storeId?: string }>
}) {
  const { zoneId, storeId } = await searchParams

  const where: Record<string, unknown> = {}
  if (zoneId) where.bin = { zoneId }
  if (storeId) where.bin = { ...(where.bin as object ?? {}), storeId }

  const [contents, stores, zones] = await Promise.all([
    prisma.warehouseBinContent.findMany({
      where,
      include: {
        bin: {
          select: {
            code: true,
            id: true,
            zone: { select: { code: true } },
            store: { select: { name: true } },
          },
        },
        product: { select: { name: true, sku: true } },
      },
      orderBy: [{ bin: { storeId: 'asc' } }, { bin: { code: 'asc' } }],
      take: 500,
    }),
    prisma.store.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    prisma.warehouseZone.findMany({ select: { id: true, code: true }, orderBy: { code: 'asc' } }),
  ])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Bin Contents" />
      <main className="flex-1 p-6 space-y-5">

        {/* Filter pane */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Filters</span>
            <form method="GET" className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">Store</label>
                <select
                  name="storeId"
                  defaultValue={storeId ?? ''}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Stores</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">Zone</label>
                <select
                  name="zoneId"
                  defaultValue={zoneId ?? ''}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Zones</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.code}</option>)}
                </select>
              </div>
              <button type="submit" className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs rounded transition-colors">
                Apply
              </button>
              <Link href="/warehouse/bin-contents" className="text-xs text-zinc-500 hover:text-zinc-300">
                Clear
              </Link>
            </form>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-800/30 bg-zinc-900/20 flex items-center justify-between">
            <span className="text-xs text-zinc-500">{contents.length} record{contents.length !== 1 ? 's' : ''}</span>
          </div>
          {contents.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-[13px]">No bin contents found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Location</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Zone Code</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Bin Code</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Item No.</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Description</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Variant</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Qty</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Qty (Base)</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Lot No.</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Serial No.</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map(c => (
                    <tr key={c.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2 text-zinc-400 text-xs">{c.bin?.store?.name ?? '—'}</td>
                      <td className="px-4 py-2">
                        <span className="font-mono text-xs bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 rounded px-1.5 py-0.5">
                          {c.bin?.zone?.code ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Link href={`/warehouse/bins/${c.binId}`} className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300">
                          {c.bin?.code ?? '—'}
                        </Link>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-zinc-300">{c.product?.sku ?? '—'}</td>
                      <td className="px-4 py-2 text-zinc-300 text-xs">{c.product?.name ?? '—'}</td>
                      <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{c.variantCode ?? '—'}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-bold text-zinc-100">{c.quantity}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-400">{c.qtyBase}</td>
                      <td className="px-4 py-2 font-mono text-xs text-zinc-500">{c.lotNo ?? '—'}</td>
                      <td className="px-4 py-2 font-mono text-xs text-zinc-500">{c.serialNo ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
