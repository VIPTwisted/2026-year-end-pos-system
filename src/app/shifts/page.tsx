export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ShiftsPage() {
  const shifts = await prisma.posShift.findMany({
    orderBy: { openTime: 'desc' },
    take: 100,
    include: { store: { select: { name: true } } },
  })

  return (
    <>
      <TopBar
        title="Shift Management"
        actions={
          <Link
            href="/pos"
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded text-[12px] font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Open Shift
          </Link>
        }
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* ── Page header ───────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">Shift Management</h1>
          <p className="text-[12px] text-zinc-500 mt-0.5">{shifts.length} shifts</p>
        </div>

        {/* ── Table ─────────────────────────────────────────────────── */}
        <div className="px-6 pb-6">
          {shifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-lg border border-zinc-800/50">
              <Clock className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-[13px] text-zinc-500 mb-1">No shifts recorded</p>
              <p className="text-[12px] text-zinc-600 mb-4">Open a new shift from the POS terminal</p>
              <Link
                href="/pos"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-[13px] font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Open Shift
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Date / Time</th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Cashier</th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Register</th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Store</th>
                      <th className="text-center text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Status</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Open Float</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Total Sales</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Txns</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map(s => {
                      const variance =
                        s.closeFloat != null && s.expectedCash != null
                          ? s.closeFloat - s.expectedCash
                          : null

                      const varianceColor =
                        variance == null
                          ? 'text-zinc-600'
                          : variance > 0
                          ? 'text-emerald-400'
                          : variance < 0
                          ? 'text-red-400'
                          : 'text-zinc-400'

                      return (
                        <tr
                          key={s.id}
                          className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                        >
                          <td className="py-2 px-3 text-[13px] text-zinc-300 whitespace-nowrap">
                            {formatDate(s.openTime)}
                          </td>
                          <td className="py-2 px-3 text-[13px] text-zinc-300">{s.cashierName}</td>
                          <td className="py-2 px-3 text-[13px] font-mono text-zinc-400">{s.registerId}</td>
                          <td className="py-2 px-3 text-[13px] text-zinc-400">
                            {s.store?.name ?? <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {s.status === 'open' ? (
                              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border bg-emerald-950/60 text-emerald-400 border-emerald-800/40">
                                Open
                              </span>
                            ) : (
                              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border bg-zinc-800/60 text-zinc-400 border-zinc-700/40">
                                Closed
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[13px] text-right tabular-nums text-zinc-400">
                            {formatCurrency(s.openFloat)}
                          </td>
                          <td className="py-2 px-3 text-[13px] text-right tabular-nums font-semibold text-emerald-400">
                            {formatCurrency(s.totalSales)}
                          </td>
                          <td className="py-2 px-3 text-[13px] text-right tabular-nums text-zinc-400">
                            {s.transactionCount}
                          </td>
                          <td className={`py-2 px-3 text-[13px] text-right tabular-nums font-medium ${varianceColor}`}>
                            {variance == null
                              ? '—'
                              : `${variance >= 0 ? '+' : ''}${formatCurrency(variance)}`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Footer ────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-3 py-2.5 border-t border-zinc-800/40">
                <span className="text-[12px] text-zinc-500">
                  Showing {shifts.length > 0 ? 1 : 0}–{shifts.length} of {shifts.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
