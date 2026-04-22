export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, GitBranch, Settings2 } from 'lucide-react'

const STATUS_CHIP: Record<string, string> = {
  new: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  certified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  closed: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40 opacity-60',
}

const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

export default async function RoutingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const routing = await prisma.routing.findUnique({
    where: { id },
    include: {
      lines: {
        include: {
          workCenter: { select: { id: true, name: true, code: true, costPerHour: true } },
        },
        orderBy: { operationNo: 'asc' },
      },
    },
  })

  if (!routing) notFound()

  const totalRunTime = routing.lines.reduce((sum, l) => sum + l.runTime, 0)
  const totalSetupTime = routing.lines.reduce((sum, l) => sum + l.setupTime, 0)
  const chipCls = STATUS_CHIP[routing.status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={routing.routingNumber} />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800/60 bg-[#12121f] px-4 py-2 flex items-center gap-1">
          <Link href="/manufacturing/routings">
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
                  <GitBranch className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${chipCls}`}>
                      {routing.status}
                    </span>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border bg-zinc-700/40 text-zinc-400 border-zinc-600/40 capitalize">
                      {routing.type}
                    </span>
                  </div>
                  <h1 className="text-lg font-bold text-zinc-100 font-mono">{routing.routingNumber}</h1>
                  <p className="text-sm text-zinc-400 mt-0.5">{routing.description}</p>
                  <div className="flex gap-4 mt-2 text-[11px] text-zinc-600">
                    <span>{routing.lines.length} operation{routing.lines.length !== 1 ? 's' : ''}</span>
                    <span>Total Run Time: {totalRunTime.toFixed(2)}h</span>
                    <span>Total Setup: {totalSetupTime.toFixed(2)}h</span>
                    <span>Version: 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* General FastTab */}
          <div className={sectionCls}>
            <div className={tabHeaderCls}>
              <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
              General
            </div>
            <div className="p-4 grid grid-cols-3 gap-x-8 gap-y-3 text-xs">
              {[
                { label: 'No.', value: routing.routingNumber, mono: true },
                { label: 'Description', value: routing.description },
                { label: 'Status', value: routing.status, capitalize: true },
                { label: 'Type', value: routing.type, capitalize: true },
                { label: 'Version', value: '1' },
                { label: 'Last Modified', value: new Date(routing.updatedAt).toLocaleDateString() },
              ].map(({ label, value, mono, capitalize }) => (
                <div key={label}>
                  <p className="text-zinc-600 uppercase tracking-wide text-[10px] mb-0.5">{label}</p>
                  <p className={`text-zinc-300 font-medium ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lines FastTab */}
          <div className={sectionCls}>
            <div className={tabHeaderCls}>
              <Settings2 className="w-3.5 h-3.5 text-zinc-500" />
              Lines ({routing.lines.length})
            </div>
            {routing.lines.length === 0 ? (
              <p className="px-5 py-6 text-xs text-zinc-600">No operations defined.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      {['Operation No.', 'Work Center', 'Machine Center', 'Setup Time', 'Run Time', 'Wait Time', 'Cost/Hr'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-600 font-medium tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {routing.lines.map(line => (
                      <tr key={line.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-900/40 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-zinc-400">{line.operationNo}</td>
                        <td className="px-4 py-2.5">
                          {line.workCenter ? (
                            <Link href={`/manufacturing/work-centers/${line.workCenter.id}`} className="text-blue-400 hover:underline">
                              {line.workCenter.code} — {line.workCenter.name}
                            </Link>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-500">—</td>
                        <td className="px-4 py-2.5 text-zinc-400 tabular-nums">{line.setupTime.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-zinc-100 font-semibold tabular-nums">{line.runTime.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-zinc-400 tabular-nums">{line.waitTime.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-emerald-400">
                          {line.workCenter?.costPerHour ? `$${line.workCenter.costPerHour.toFixed(2)}/h` : '—'}
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
