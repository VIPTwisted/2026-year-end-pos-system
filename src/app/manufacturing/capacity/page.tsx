export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Activity, Clock, DollarSign } from 'lucide-react'

export default async function CapacityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; workCenterId?: string }>
}) {
  const { type, workCenterId } = await searchParams

  const entries = await prisma.capacityLedgerEntry.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(workCenterId ? { workCenterId } : {}),
    },
    orderBy: [{ postingDate: 'desc' }, { entryNo: 'desc' }],
    take: 250,
    include: {
      workCenter: { select: { id: true, code: true, name: true } },
    },
  })

  const workCenters = await prisma.workCenter.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, code: true, name: true },
  })

  const totalRunTime = entries.reduce((s, e) => s + e.runTime, 0)
  const totalDirectCost = entries.reduce((s, e) => s + e.directCost, 0)
  const totalOutput = entries.reduce((s, e) => s + e.outputQuantity, 0)
  const totalScrap = entries.reduce((s, e) => s + e.scrapQuantity, 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Capacity Ledger Entries" />
      <main className="flex-1 overflow-auto p-5 space-y-4">

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Entries', value: entries.length, icon: Activity, color: 'text-blue-400' },
            { label: 'Total Run Time (h)', value: totalRunTime.toFixed(2), icon: Clock, color: 'text-amber-400' },
            { label: 'Total Output Qty', value: totalOutput.toFixed(2), icon: Activity, color: 'text-emerald-400' },
            { label: 'Total Direct Cost', value: `$${totalDirectCost.toFixed(2)}`, icon: DollarSign, color: 'text-violet-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800/60 rounded-lg flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All Types', value: '' },
            { label: 'Work Center', value: 'work_center' },
            { label: 'Machine Center', value: 'machine_center' },
          ].map(({ label, value }) => (
            <Link
              key={value}
              href={
                value
                  ? `/manufacturing/capacity?type=${value}${workCenterId ? `&workCenterId=${workCenterId}` : ''}`
                  : `/manufacturing/capacity${workCenterId ? `?workCenterId=${workCenterId}` : ''}`
              }
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                (value === '' && !type) || type === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {label}
            </Link>
          ))}
          {workCenters.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-600 ml-2">WC:</span>
              <Link
                href={`/manufacturing/capacity${type ? `?type=${type}` : ''}`}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${!workCenterId ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}
              >
                All
              </Link>
              {workCenters.map(wc => (
                <Link
                  key={wc.id}
                  href={`/manufacturing/capacity?workCenterId=${wc.id}${type ? `&type=${type}` : ''}`}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${workCenterId === wc.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}
                >
                  {wc.code}
                </Link>
              ))}
            </span>
          )}
        </div>

        {/* Page header */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400" />
          <h1 className="text-sm font-semibold text-zinc-200">Capacity Ledger Entries</h1>
          <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
            {entries.length}
          </span>
          {entries.length === 250 && (
            <span className="text-[11px] text-amber-400 ml-1">(showing latest 250)</span>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {[
                    'Entry No.', 'Posting Date', 'Work Center', 'Item', 'Quantity',
                    'Time Type', 'Output', 'Scrap',
                  ].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[13px] text-zinc-600">
                      No capacity ledger entries. Post output or consumption journals to populate.
                    </td>
                  </tr>
                ) : (
                  entries.map(entry => (
                    <tr key={entry.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-500 tabular-nums">
                        {entry.entryNo}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 text-xs whitespace-nowrap">
                        {new Date(entry.postingDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5">
                        {entry.workCenter ? (
                          <Link
                            href={`/manufacturing/work-centers/${entry.workCenter.id}`}
                            className="text-blue-400 hover:underline text-xs font-mono"
                          >
                            {entry.workCenter.code}
                          </Link>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 text-xs">
                        {entry.productionOrderId ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300 text-xs tabular-nums">
                        {entry.outputQuantity > 0 ? entry.outputQuantity : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${
                          entry.type === 'work_center'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                        }`}>
                          {entry.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-emerald-400 text-xs tabular-nums font-semibold">
                        {entry.outputQuantity > 0 ? entry.outputQuantity : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-red-400 text-xs tabular-nums">
                        {entry.scrapQuantity > 0 ? entry.scrapQuantity : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-zinc-700">
          Total scrap: {totalScrap} units · Showing {entries.length} entries
        </p>
      </main>
    </div>
  )
}
