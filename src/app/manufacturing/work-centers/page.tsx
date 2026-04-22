export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Settings2, ChevronRight, RefreshCw, Activity } from 'lucide-react'

export default async function WorkCentersPage() {
  const workCenters = await prisma.workCenter.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { routingLines: true, machineCenters: true } } },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Work Centers" />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800/60 bg-[#12121f] px-4 py-2 flex items-center gap-1">
          <Link href="/manufacturing/work-centers/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              + New
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
            Edit
          </button>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          <Link href="/manufacturing/work-centers">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </Link>
        </div>

        <div className="p-5 space-y-4">
          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: workCenters.length, color: 'text-blue-400', icon: Settings2 },
              { label: 'Active', value: workCenters.filter(w => w.isActive).length, color: 'text-emerald-400', icon: Activity },
              {
                label: 'Avg Efficiency',
                value: workCenters.length
                  ? `${(workCenters.reduce((s, w) => s + w.efficiency, 0) / workCenters.length).toFixed(1)}%`
                  : '—',
                color: 'text-amber-400',
                icon: Settings2,
              },
              {
                label: 'Avg Cost/Hr',
                value: workCenters.length
                  ? `$${(workCenters.reduce((s, w) => s + w.costPerHour, 0) / workCenters.length).toFixed(2)}`
                  : '—',
                color: 'text-violet-400',
                icon: Settings2,
              },
            ].map(({ label, value, color, icon: Icon }) => (
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

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-zinc-400" />
              <h1 className="text-sm font-semibold text-zinc-200">Work Centers</h1>
              <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
                {workCenters.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['No.', 'Name', 'Work Center Group', 'Capacity', 'Efficiency', 'Calendar Code', 'Blocked', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workCenters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[13px] text-zinc-600">
                      No work centers found.{' '}
                      <Link href="/manufacturing/work-centers/new" className="text-blue-400 hover:text-blue-300 hover:underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  workCenters.map(wc => (
                    <tr key={wc.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/50 transition-colors group">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/manufacturing/work-centers/${wc.id}`}
                          className="font-mono text-[13px] font-medium text-zinc-100 group-hover:text-blue-300 transition-colors"
                        >
                          {wc.code}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">{wc.name}</td>
                      <td className="px-4 py-2.5 text-zinc-500 text-xs">{wc.departmentId ?? '—'}</td>
                      <td className="px-4 py-2.5 text-zinc-400 tabular-nums">
                        {wc.capacity} <span className="text-zinc-600 text-[11px]">{wc.unitOfMeasure}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[13px] font-semibold tabular-nums ${
                          wc.efficiency >= 90 ? 'text-emerald-400' : wc.efficiency >= 70 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {wc.efficiency}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500 text-xs">—</td>
                      <td className="px-4 py-2.5">
                        {!wc.isActive ? (
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-red-500/10 text-red-400 border-red-500/30">
                            Yes
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link href={`/manufacturing/work-centers/${wc.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
