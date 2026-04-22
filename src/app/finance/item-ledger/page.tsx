import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ENTRY_TYPE_COLOR: Record<string, string> = {
  'Purchase':       'bg-blue-500/20 text-blue-400',
  'Sale':           'bg-emerald-500/20 text-emerald-400',
  'Positive Adj.':  'bg-teal-500/20 text-teal-400',
  'Negative Adj.':  'bg-red-500/20 text-red-400',
  'Transfer':       'bg-amber-500/20 text-amber-400',
  'Consumption':    'bg-orange-500/20 text-orange-400',
  'Output':         'bg-purple-500/20 text-purple-400',
}

export default async function ItemLedgerPage() {
  const entries = await prisma.itemLedgerEntry.findMany({
    orderBy: { postingDate: 'desc' },
    take: 500,
  })

  const stats = {
    total:       entries.length,
    purchases:   entries.filter(e => e.entryType === 'Purchase').length,
    sales:       entries.filter(e => e.entryType === 'Sale').length,
    totalQty:    entries.reduce((s, e) => s + e.qty, 0),
  }

  return (
    <>
      <TopBar title="Item Ledger Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Finance</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Item Ledger Entries</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{entries.length} entries</p>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Entries', value: String(stats.total),     color: 'text-zinc-100' },
              { label: 'Purchases',     value: String(stats.purchases), color: 'text-blue-400' },
              { label: 'Sales',         value: String(stats.sales),     color: 'text-emerald-400' },
              { label: 'Total Qty',     value: stats.totalQty.toFixed(2), color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[20px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          {entries.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16">
              <Package className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500">No item ledger entries.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Entry No.', 'Posting Date', 'Entry Type', 'Item No.', 'Description', 'Location', 'Qty', 'Remaining Qty', 'UOM', 'Lot No.', 'Serial No.'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          ['Qty','Remaining Qty'].includes(h) ? 'text-right' : 'text-left'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {entries.map(e => (
                      <tr key={e.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{e.entryNo}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(e.postingDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${ENTRY_TYPE_COLOR[e.entryType] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {e.entryType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{e.itemNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-300 max-w-[160px] truncate">{e.description ?? '—'}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400">{e.locationCode ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-100 tabular-nums font-semibold">{e.qty.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-400 tabular-nums">{e.remainingQty.toFixed(2)}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400">{e.unitOfMeasure}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{e.lotNo ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{e.serialNo ?? '—'}</td>
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
