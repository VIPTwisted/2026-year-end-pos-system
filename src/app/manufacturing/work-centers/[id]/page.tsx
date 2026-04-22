export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Settings2, GitBranch, Cpu } from 'lucide-react'

const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

export default async function WorkCenterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const wc = await prisma.workCenter.findUnique({
    where: { id },
    include: {
      machineCenters: true,
      routingLines: {
        include: { routing: { select: { id: true, routingNumber: true, description: true, status: true } } },
        take: 30,
      },
    },
  })

  if (!wc) notFound()

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={wc.name} />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800/60 bg-[#12121f] px-4 py-2 flex items-center gap-1">
          <Link href="/manufacturing/work-centers">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>
          </Link>
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className={sectionCls}>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                  <Settings2 className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {wc.isActive ? (
                      <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Active</span>
                    ) : (
                      <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-red-500/10 text-red-400 border-red-500/30">Blocked</span>
                    )}
                    <span className="font-mono text-xs text-zinc-500">{wc.code}</span>
                  </div>
                  <h1 className="text-lg font-bold text-zinc-100">{wc.name}</h1>
                  {wc.description && <p className="text-sm text-zinc-500 mt-1">{wc.description}</p>}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
                {[
                  { label: 'Capacity', value: `${wc.capacity} / ${wc.unitOfMeasure}`, color: 'text-blue-400' },
                  { label: 'Cost per Hour', value: `$${wc.costPerHour.toFixed(2)}`, color: 'text-emerald-400' },
                  {
                    label: 'Efficiency',
                    value: `${wc.efficiency}%`,
                    color: wc.efficiency >= 90 ? 'text-emerald-400' : wc.efficiency >= 70 ? 'text-amber-400' : 'text-red-400',
                  },
                  { label: 'Machine Centers', value: wc.machineCenters.length, color: 'text-violet-400' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className={`text-base font-bold tabular-nums ${color}`}>{value}</p>
                    <p className="text-zinc-600 uppercase tracking-wide text-[10px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* General FastTab */}
          <div className={sectionCls}>
            <div className={tabHeaderCls}>
              <Settings2 className="w-3.5 h-3.5 text-zinc-500" />
              General
            </div>
            <div className="p-4 grid grid-cols-3 gap-x-8 gap-y-3 text-xs">
              {[
                { label: 'No.', value: wc.code, mono: true },
                { label: 'Name', value: wc.name },
                { label: 'Type', value: wc.type, capitalize: true },
                { label: 'Work Center Group', value: wc.departmentId ?? '—' },
                { label: 'Capacity', value: `${wc.capacity} ${wc.unitOfMeasure}` },
                { label: 'Efficiency', value: `${wc.efficiency}%` },
                { label: 'Cost per Hour', value: `$${wc.costPerHour.toFixed(2)}` },
                { label: 'Queue Time', value: `${wc.queueTime}h` },
                { label: 'Calendar Code', value: '—' },
              ].map(({ label, value, mono, capitalize }) => (
                <div key={label}>
                  <p className="text-zinc-600 uppercase tracking-wide text-[10px] mb-0.5">{label}</p>
                  <p className={`text-zinc-300 font-medium ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Machine Centers FastTab */}
          <div className={sectionCls}>
            <div className={tabHeaderCls}>
              <Cpu className="w-3.5 h-3.5 text-zinc-500" />
              Machine Centers ({wc.machineCenters.length})
            </div>
            {wc.machineCenters.length === 0 ? (
              <p className="px-5 py-4 text-xs text-zinc-600">No machine centers assigned.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['No.', 'Name', 'Capacity', 'Cost/Hr', 'Active'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-600 font-medium tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wc.machineCenters.map(mc => (
                    <tr key={mc.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-zinc-400">{mc.code}</td>
                      <td className="px-4 py-2.5 text-zinc-300">{mc.name}</td>
                      <td className="px-4 py-2.5 text-zinc-400 tabular-nums">{mc.capacity}</td>
                      <td className="px-4 py-2.5 text-emerald-400 tabular-nums">${mc.costPerHour.toFixed(2)}</td>
                      <td className="px-4 py-2.5">
                        {mc.isActive
                          ? <span className="text-emerald-400">Yes</span>
                          : <span className="text-zinc-600">No</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Routing Operations FastTab */}
          {wc.routingLines.length > 0 && (
            <div className={sectionCls}>
              <div className={tabHeaderCls}>
                <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                Routing Operations ({wc.routingLines.length})
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Routing', 'Description', 'Op No.', 'Run Time (h)'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-600 font-medium tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wc.routingLines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href={`/manufacturing/routings/${line.routing.id}`} className="font-mono text-blue-400 hover:underline">
                          {line.routing.routingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400">{line.routing.description}</td>
                      <td className="px-4 py-2.5 font-mono text-zinc-500">{line.operationNo}</td>
                      <td className="px-4 py-2.5 text-zinc-300 tabular-nums">{line.runTime.toFixed(2)}</td>
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
