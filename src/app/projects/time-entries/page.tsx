import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Resource Ledger Entries — posted project time
// Backed by ItemLedgerEntry-style flat table; uses mock data until seed populated
async function getEntries() {
  try {
    const { prisma } = await import('@/lib/prisma')
    return await prisma.itemLedgerEntry.findMany({
      orderBy: { postingDate: 'desc' },
      take: 200,
    })
  } catch { return [] }
}

export default async function TimeEntriesPage() {
  const entries = await getEntries()

  return (
    <>
      <TopBar title="Resource Ledger Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Resource Ledger Entries</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Posted project time records</p>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16">
              <Activity className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500">No posted time entries yet.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Entry No.', 'Posting Date', 'Resource No.', 'Description', 'Project No.', 'Task No.', 'Unit of Measure', 'Qty', 'Total Cost', 'Total Price'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          ['Qty','Total Cost','Total Price'].includes(h) ? 'text-right' : 'text-left'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {entries.map(e => (
                      <tr key={e.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{e.entryNo}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(e.postingDate)}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{e.itemNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100 max-w-[180px] truncate">{e.description ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{e.documentNo ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{e.lotNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400">{e.unitOfMeasure}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-100 tabular-nums">{e.qty.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-300 tabular-nums">{formatCurrency(e.costAmount)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-emerald-400 tabular-nums">{formatCurrency(e.salesAmount)}</td>
                      </tr>
                    ))}
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
