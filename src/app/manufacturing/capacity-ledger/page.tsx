export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Activity, ArrowLeft, Clock, DollarSign } from 'lucide-react'

export default async function CapacityLedgerPage({
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
    take: 200,
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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Capacity Ledger Entries" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        <Link
          href="/manufacturing"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Manufacturing
        </Link>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Entries', value: entries.length, icon: Activity, color: 'text-blue-400' },
            { label: 'Total Run Time (h)', value: totalRunTime.toFixed(2), icon: Clock, color: 'text-amber-400' },
            { label: 'Total Output Qty', value: totalOutput.toFixed(2), icon: Activity, color: 'text-emerald-400' },
            { label: 'Total Direct Cost', value: `$${totalDirectCost.toFixed(2)}`, icon: DollarSign, color: 'text-violet-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-zinc-800/60 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter */}
          {[
            { label: 'All Types', value: '' },
            { label: 'Work Center', value: 'work_center' },
            { label: 'Machine Center', value: 'machine_center' },
          ].map(({ label, value }) => (
            <Link
              key={value}
              href={value
                ? `/manufacturing/capacity-ledger?type=${value}${workCenterId ? `&workCenterId=${workCenterId}` : ''}`
                : `/manufacturing/capacity-ledger${workCenterId ? `?workCenterId=${workCenterId}` : ''}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                (value === '' && !type) || type === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Work Center filter */}
          {workCenters.length > 0 && (
            <span className="ml-2 flex items-center gap-1">
              <span className="text-xs text-zinc-600">Work Center:</span>
              <Link
                href={`/manufacturing/capacity-ledger${type ? `?type=${type}` : ''}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!workCenterId ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}
              >
                All
              </Link>
              {workCenters.map(wc => (
                <Link
                  key={wc.id}
                  href={`/manufacturing/capacity-ledger?workCenterId=${wc.id}${type ? `&type=${type}` : ''}`}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${workCenterId === wc.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}
                >
                  {wc.code}
                </Link>
              ))}
            </span>
          )}
        </div>

        {/* Page title */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400" />
          <h1 className="text-sm font-semibold text-zinc-200">Capacity Ledger Entries</h1>
          <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
            {entries.length}
          </span>
          {entries.length === 200 && (
            <span className="text-[11px] text-amber-400 ml-1">(showing latest 200)</span>
          )}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Entry No.', 'Posting Date', 'Type', 'Work Center', 'Op No.', 'Description', 'Setup (h)', 'Run (h)', 'Output Qty', 'Scrap Qty', 'Direct Cost'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                    No capacity ledger entries. Post output or consumption journals to populate this ledger.
                  </td>
                </tr>
              ) : (
                entries.map(entry => (
                  <tr key={entry.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{entry.entryNo}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-xs whitespace-nowrap">
                      {formatDate(entry.postingDate)}
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
                    <td className="px-4 py-2.5">
                      {entry.workCenter ? (
                        <Link
                          href={`/manufacturing/work-centers/${entry.workCenter.id}`}
                          className="text-blue-400 hover:underline text-xs font-mono"
                        >
                          {entry.workCenter.code}
                        </Link>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{entry.operationNo || '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-300 text-xs max-w-[160px] truncate">{entry.description || '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-xs">{entry.setupTime > 0 ? entry.setupTime.toFixed(2) : '—'}</td>
                    <td className="px-4 py-2.5 text-amber-400 text-xs font-semibold">{entry.runTime > 0 ? entry.runTime.toFixed(2) : '—'}</td>
                    <td className="px-4 py-2.5 text-emerald-400 text-xs font-semibold">{entry.outputQuantity > 0 ? entry.outputQuantity : '—'}</td>
                    <td className="px-4 py-2.5 text-red-400 text-xs">{entry.scrapQuantity > 0 ? entry.scrapQuantity : '—'}</td>
                    <td className="px-4 py-2.5 text-violet-400 text-xs font-semibold">
                      {entry.directCost > 0 ? `$${entry.directCost.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
