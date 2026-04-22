export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Grid3x3, Plus } from 'lucide-react'

const BIN_TYPE_COLOR: Record<string, string> = {
  RECEIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  SHIP: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PUTAWAY: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PICK: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  PUTPICK: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  QC: 'bg-red-500/10 text-red-400 border-red-500/30',
  FIXED: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
}

export default async function BinsPage() {
  const [bins, total, empty, blocked] = await Promise.all([
    prisma.warehouseBin.findMany({
      include: {
        store: { select: { name: true } },
        zone: { select: { code: true } },
        _count: { select: { contents: true } },
      },
      orderBy: [{ storeId: 'asc' }, { rankNo: 'asc' }, { code: 'asc' }],
    }),
    prisma.warehouseBin.count(),
    prisma.warehouseBin.count({ where: { isEmpty: true } }),
    prisma.warehouseBin.count({ where: { isBlocked: true } }),
  ])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Warehouse Bins" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Total Bins</p>
            <p className="text-2xl font-bold text-zinc-100">{total}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Empty</p>
            <p className="text-2xl font-bold text-emerald-400">{empty}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Blocked</p>
            <p className="text-2xl font-bold text-red-400">{blocked}</p>
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-200">
              {bins.length} Bins
            </h2>
            <Link href="/warehouse/bins/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Bin
              </button>
            </Link>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            {bins.length === 0 ? (
              <div className="p-12 text-center">
                <Grid3x3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-[13px]">No bins configured</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                      <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Bin Code</th>
                      <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Store</th>
                      <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Zone</th>
                      <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Type</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Rank</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Max Qty</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Contents</th>
                      <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bins.map(bin => (
                      <tr key={bin.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2">
                          <Link href={`/warehouse/bins/${bin.id}`} className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline font-semibold">
                            {bin.code}
                          </Link>
                          {bin.description && <p className="text-[11px] text-zinc-600 mt-0.5">{bin.description}</p>}
                        </td>
                        <td className="px-4 py-2 text-zinc-300">{bin.store?.name ?? '—'}</td>
                        {/* Zone displayed as ZONE-RACK-BIN monospace chip */}
                        <td className="px-4 py-2">
                          {bin.zone?.code ? (
                            <span className="font-mono text-[11px] bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 rounded px-1.5 py-0.5">
                              {bin.zone.code}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${BIN_TYPE_COLOR[bin.binType] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                            {bin.binType}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-zinc-400 tabular-nums">{bin.rankNo}</td>
                        <td className="px-4 py-2 text-right text-zinc-400 tabular-nums">
                          {bin.maxQty != null ? bin.maxQty.toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          <span className={bin._count.contents > 0 ? 'text-zinc-200 font-semibold' : 'text-zinc-600'}>
                            {bin._count.contents}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {bin.isEmpty && (
                              <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-zinc-700/40 text-zinc-400 border-zinc-600/40">Empty</span>
                            )}
                            {bin.isBlocked && (
                              <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-red-500/10 text-red-400 border-red-500/30">Blocked</span>
                            )}
                            {!bin.isEmpty && !bin.isBlocked && (
                              <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Active</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
