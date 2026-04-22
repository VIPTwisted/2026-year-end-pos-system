import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Settings2, ArrowLeft, Activity, DollarSign, Cpu, ChevronRight } from 'lucide-react'

export default async function WorkCentersPage() {
  const workCenters = await prisma.workCenter.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { routingLines: true, machineCenters: true } } },
  })

  const active = workCenters.filter(wc => wc.isActive)
  const avgEfficiency = active.length
    ? active.reduce((s, wc) => s + wc.efficiency, 0) / active.length
    : 0
  const avgCost = active.length
    ? active.reduce((s, wc) => s + wc.costPerHour, 0) / active.length
    : 0

  const kpis = [
    { label: 'Total Work Centers', value: workCenters.length, icon: Cpu, color: 'text-blue-400' },
    { label: 'Active', value: active.length, icon: Activity, color: 'text-emerald-400' },
    { label: 'Avg Efficiency', value: `${avgEfficiency.toFixed(1)}%`, icon: Settings2, color: 'text-amber-400' },
    { label: 'Avg Cost/Hr', value: `$${avgCost.toFixed(2)}`, icon: DollarSign, color: 'text-violet-400' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Work Centers" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/manufacturing"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Manufacturing
        </Link>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color }) => (
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

        {/* Page header: title + count + New button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Work Centers</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {workCenters.length}
            </span>
          </div>
          <Link href="/manufacturing/work-centers/new">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              + New Work Center
            </button>
          </Link>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Code', 'Name', 'Capacity', 'Cost/Hr', 'Efficiency', 'Machines', 'Used In', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workCenters.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[13px] text-zinc-600">
                    No work centers.{' '}
                    <Link href="/manufacturing/work-centers/new" className="text-blue-400 hover:text-blue-300 hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                workCenters.map(wc => (
                  <tr key={wc.id} className="py-2 border-b border-zinc-800/30 hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-4 py-2">
                      <Link href={`/manufacturing/work-centers/${wc.id}`} className="font-mono text-[13px] font-medium text-zinc-100 group-hover:text-blue-300 transition-colors">
                        {wc.code}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{wc.name}</td>
                    <td className="px-4 py-2 text-zinc-400">
                      {wc.capacity} {wc.unitOfMeasure}
                    </td>
                    <td className="px-4 py-2 text-emerald-400">${wc.costPerHour.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[13px] font-semibold ${wc.efficiency >= 90 ? 'text-emerald-400' : wc.efficiency >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                        {wc.efficiency}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-zinc-400">{wc._count.machineCenters}</td>
                    <td className="px-4 py-2 text-zinc-400">{wc._count.routingLines} ops</td>
                    <td className="px-4 py-2">
                      {wc.isActive ? (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Active</span>
                      ) : (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-zinc-700/40 text-zinc-400 border-zinc-600/40">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
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

      </main>
    </div>
  )
}
