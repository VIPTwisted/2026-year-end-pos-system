import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Hash, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

function previewNextNumber(series: {
  prefix: string | null
  suffix: string | null
  lastNoUsed: number
  startingNo: number
  incrementBy: number
  paddingLength: number
}): string {
  const nextNo = Math.max(series.lastNoUsed + series.incrementBy, series.startingNo)
  const padded = String(nextNo).padStart(series.paddingLength, '0')
  return [series.prefix, padded, series.suffix].filter(Boolean).join('')
}

export default async function NumberSeriesPage() {
  const series = await prisma.numberSeries.findMany({
    include: { usageLogs: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { code: 'asc' },
  })

  const totalGenerated = series.reduce((sum, s) => sum + s.lastNoUsed, 0)
  const exhausted = series.filter(s => s.endingNo !== null && s.lastNoUsed >= s.endingNo)

  return (
    <>
      <TopBar title="Number Series" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Settings</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Number Series</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Auto-generate document numbers for orders, invoices, and cases</p>
            </div>
            <Link href="/settings/number-series/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Series
              </Button>
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Series Defined',  value: series.length.toString(),              color: 'text-zinc-100' },
              { label: 'Total Generated', value: totalGenerated.toLocaleString(),        color: 'text-blue-400' },
              { label: 'Exhausted',       value: exhausted.length.toString(),            color: exhausted.length > 0 ? 'text-red-400' : 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <Hash className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">All Series</span>
            <span className="text-[10px] text-zinc-600">({series.length} configured)</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Table */}
          {series.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-600">
              <Hash className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[14px] font-medium text-zinc-400 mb-2">No number series defined</p>
              <p className="text-[12px] mb-4 text-center max-w-xs">
                Number series auto-generate document numbers for orders, invoices, cases, and more
              </p>
              <Link href="/settings/number-series/new">
                <Button variant="outline" size="sm">Create First Series</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Code', 'Description', 'Prefix / Suffix', 'Last No.', 'Next Preview', 'Usage', 'Default', 'Manual', 'Last Used', ''].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                            h === 'Last No.' || h === 'Usage' || h === '' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {series.map(s => {
                      const isExhausted = s.endingNo !== null && s.lastNoUsed >= s.endingNo
                      const usedPct = s.endingNo
                        ? Math.min(100, Math.round((s.lastNoUsed / s.endingNo) * 100))
                        : null

                      return (
                        <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-[12px] text-blue-400 font-semibold">{s.code}</span>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-zinc-300">{s.description}</td>
                          <td className="px-4 py-3 font-mono text-[11px]">
                            {s.prefix && <span className="text-emerald-500">{s.prefix}</span>}
                            {s.prefix && s.suffix && <span className="text-zinc-700 mx-0.5">·</span>}
                            {s.suffix && <span className="text-amber-500">{s.suffix}</span>}
                            {!s.prefix && !s.suffix && <span className="text-zinc-700">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-[13px] text-zinc-400">
                            {s.lastNoUsed.toLocaleString()}
                            {s.endingNo && (
                              <span className="text-zinc-700 text-[11px] ml-1">/ {s.endingNo.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isExhausted ? (
                              <Badge variant="destructive" className="text-[10px]">EXHAUSTED</Badge>
                            ) : (
                              <span className="font-mono text-[12px] text-zinc-300">{previewNextNumber(s)}</span>
                            )}
                          </td>
                          {/* Progress bar column */}
                          <td className="px-4 py-3 text-right min-w-[100px]">
                            {usedPct !== null ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] text-zinc-500 tabular-nums">{usedPct}%</span>
                                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${usedPct >= 90 ? 'bg-red-500' : usedPct >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                    style={{ width: `${usedPct}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-700 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.isDefault ? (
                              <span className="text-emerald-500 text-[11px] font-medium">Yes</span>
                            ) : (
                              <span className="text-zinc-700 text-[11px]">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.allowManual ? (
                              <span className="text-zinc-400 text-[11px]">Yes</span>
                            ) : (
                              <span className="text-zinc-700 text-[11px]">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-zinc-600 whitespace-nowrap">
                            {s.usageLogs[0] ? formatDate(s.usageLogs[0].createdAt) : <span className="text-zinc-800">Never</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/settings/number-series/${s.id}`}>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]">Edit</Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
