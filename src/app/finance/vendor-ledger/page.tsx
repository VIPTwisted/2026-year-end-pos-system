import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BookOpen, CheckSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

const DOCTYPE_COLOR: Record<string, string> = {
  Invoice:        'bg-blue-500/20 text-blue-400',
  'Credit Memo':  'bg-purple-500/20 text-purple-400',
  Payment:        'bg-emerald-500/20 text-emerald-400',
  Refund:         'bg-amber-500/20 text-amber-400',
}

export default async function VendorLedgerPage() {
  const entries = await prisma.vendorLedgerEntry.findMany({
    orderBy: { postingDate: 'desc' },
    take: 500,
  })

  const stats = {
    total:          entries.length,
    open:           entries.filter(e => e.isOpen).length,
    totalDebit:     entries.reduce((s, e) => s + e.debitAmount, 0),
    totalCredit:    entries.reduce((s, e) => s + e.creditAmount, 0),
    totalRemaining: entries.filter(e => e.isOpen).reduce((s, e) => s + e.remainingAmount, 0),
  }

  return (
    <>
      <TopBar title="Vendor Ledger Entries" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Finance</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Vendor Ledger Entries</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{entries.length} entries</p>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Entries',  value: String(stats.total),                  color: 'text-zinc-100' },
              { label: 'Open',           value: String(stats.open),                   color: 'text-amber-400' },
              { label: 'Total Debit',    value: formatCurrency(stats.totalDebit),     color: 'text-blue-400' },
              { label: 'Total Credit',   value: formatCurrency(stats.totalCredit),    color: 'text-emerald-400' },
              { label: 'Remaining Open', value: formatCurrency(stats.totalRemaining), color: 'text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[18px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          {entries.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16">
              <BookOpen className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500">No vendor ledger entries.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Entry No.', 'Posting Date', 'Doc. Type', 'Doc. No.', 'Vendor No.', 'Description', 'Curr.', 'Debit', 'Credit', 'Remaining', 'Open'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          ['Debit','Credit','Remaining'].includes(h) ? 'text-right' :
                          h === 'Open' ? 'text-center' : 'text-left'
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${DOCTYPE_COLOR[e.documentType] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {e.documentType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{e.documentNo ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{e.vendorNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-300 max-w-[180px] truncate">{e.description ?? '—'}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-500">{e.currency}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-blue-400 tabular-nums">{e.debitAmount > 0 ? formatCurrency(e.debitAmount) : '—'}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-emerald-400 tabular-nums">{e.creditAmount > 0 ? formatCurrency(e.creditAmount) : '—'}</td>
                        <td className="px-4 py-3 text-right text-[12px] tabular-nums font-semibold text-zinc-100">{formatCurrency(e.remainingAmount)}</td>
                        <td className="px-4 py-3 text-center">
                          {e.isOpen ? <CheckSquare className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-zinc-700 text-[11px]">—</span>}
                        </td>
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
