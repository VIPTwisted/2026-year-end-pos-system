export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Map } from 'lucide-react'
import { NewZoneForm } from './NewZoneForm'

export default async function ZonesPage() {
  const [zones, stores] = await Promise.all([
    prisma.warehouseZone.findMany({
      include: {
        store: { select: { id: true, name: true } },
        _count: { select: { bins: true } },
      },
      orderBy: [{ storeId: 'asc' }, { rankNo: 'asc' }, { code: 'asc' }],
    }),
    prisma.store.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
  ])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Warehouse Zones" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Table */}
          <div className="xl:col-span-2">
            <h2 className="text-sm font-semibold text-zinc-200 mb-3">{zones.length} Zones</h2>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              {zones.length === 0 ? (
                <div className="p-12 text-center">
                  <Map className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">No zones configured</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                      <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Store</th>
                      <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Code</th>
                      <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Description</th>
                      <th className="text-center px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Bin Type</th>
                      <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Rank</th>
                      <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Bins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {zones.map(z => (
                      <tr key={z.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-4 py-3 text-zinc-300 text-xs">{z.store?.name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Link href={`/warehouse/zones/${z.id}`} className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300">
                            {z.code}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{z.description}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="text-xs font-mono">{z.binTypeCode}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500 tabular-nums text-xs">{z.rankNo}</td>
                        <td className="px-4 py-3 text-right text-zinc-200 tabular-nums font-semibold text-xs">{z._count.bins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Add Zone Form */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-200 mb-3">Add Zone</h2>
            <NewZoneForm stores={stores} />
          </div>
        </div>
      </main>
    </div>
  )
}
