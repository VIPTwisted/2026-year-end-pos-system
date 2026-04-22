export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Plus, Star } from 'lucide-react'

export default async function PriceListsPage() {
  const priceLists = await prisma.priceList.findMany({
    include: { _count: { select: { lines: true } } },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <>
      <TopBar title="Price Lists" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Price Lists</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Customer group pricing, volume breaks, and promotional prices</p>
          </div>
          <Link
            href="/price-lists/new"
            className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />New Price List
          </Link>
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">All Price Lists</span>
          <div className="flex-1 h-px bg-zinc-800/60" />
          <span className="text-[11px] text-zinc-600">{priceLists.length} lists</span>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5 font-medium">Name</th>
                  <th className="text-center py-2.5 font-medium">Currency</th>
                  <th className="text-center py-2.5 font-medium">Customer Groups</th>
                  <th className="text-center py-2.5 font-medium">Lines</th>
                  <th className="text-center py-2.5 font-medium">Date Range</th>
                  <th className="text-center px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {priceLists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-600 text-[13px]">
                      No price lists yet.{' '}
                      <Link href="/price-lists/new" className="text-blue-400 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  priceLists.map((pl, idx) => {
                    const now = new Date()
                    const isLive = pl.isActive && (!pl.startDate || pl.startDate <= now) && (!pl.endDate || pl.endDate >= now)

                    return (
                      <tr
                        key={pl.id}
                        className={`hover:bg-zinc-800/30 transition-colors ${idx !== priceLists.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <Link href={`/price-lists/${pl.id}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">
                              {pl.name}
                            </Link>
                            {pl.isDefault && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                                <Star className="w-2.5 h-2.5" />
                                Default
                              </span>
                            )}
                          </div>
                          {pl.description && <p className="text-[11px] text-zinc-500 mt-0.5">{pl.description}</p>}
                        </td>
                        <td className="py-2.5 text-center font-mono text-[13px] text-zinc-300">{pl.currency}</td>
                        <td className="py-2.5 text-center">
                          {pl.customerGroupId ? (
                            <span className="text-[11px] bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded capitalize">{pl.customerGroupId}</span>
                          ) : (
                            <span className="text-[11px] text-zinc-500">All customers</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center text-zinc-300 font-medium">{pl._count.lines}</td>
                        <td className="py-2.5 text-center text-[11px] text-zinc-500">
                          {pl.startDate || pl.endDate ? (
                            <span>{pl.startDate ? formatDate(pl.startDate) : '∞'} — {pl.endDate ? formatDate(pl.endDate) : '∞'}</span>
                          ) : (
                            <span className="text-zinc-600">Always</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${isLive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'}`}>
                            {isLive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  )
}
