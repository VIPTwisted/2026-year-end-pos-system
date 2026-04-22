import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type BadgeColor = 'amber' | 'blue' | 'emerald' | 'red' | 'purple' | 'zinc'

const TYPE_META: Record<string, { label: string; color: BadgeColor }> = {
  safe_drop:           { label: 'Safe Drop',           color: 'amber'   },
  bank_drop:           { label: 'Bank Drop',           color: 'blue'    },
  petty_cash_in:       { label: 'Petty Cash In',       color: 'emerald' },
  petty_cash_out:      { label: 'Petty Cash Out',      color: 'red'     },
  tender_declaration:  { label: 'Tender Declaration',  color: 'purple'  },
  float_entry:         { label: 'Float Entry',         color: 'zinc'    },
}

const BADGE_CLASSES: Record<BadgeColor, string> = {
  amber:   'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  blue:    'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  red:     'bg-red-500/20 text-red-300 border border-red-500/30',
  purple:  'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  zinc:    'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30',
}

function formatAmount(amount: number, type: string): string {
  const negative = type === 'safe_drop' || type === 'bank_drop' || type === 'petty_cash_out'
  const sign = negative ? '-' : '+'
  return `${sign}$${Math.abs(amount).toFixed(2)}`
}

export default async function CashManagementPage() {
  const entries = await prisma.cashManagementEntry.findMany({
    take: 200,
    orderBy: { performedAt: 'desc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="Cash Management" />

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Cash Management</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Safe drops, bank drops, petty cash, and tender declarations</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-[#16213e] border border-zinc-800/50 rounded px-3 py-1.5">
            <span>{entries.length} entries (recent 200)</span>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <p className="text-lg font-medium mb-1">No entries yet</p>
            <p className="text-sm">Cash operations performed at the POS will appear here.</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Date / Time</th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Type</th>
                  <th className="text-right px-4 py-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Description</th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Performed By</th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Shift ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {entries.map(entry => {
                  const meta = TYPE_META[entry.type] ?? { label: entry.type, color: 'zinc' as BadgeColor }
                  const badgeClass = BADGE_CLASSES[meta.color]
                  const isNegative = entry.type === 'safe_drop' || entry.type === 'bank_drop' || entry.type === 'petty_cash_out'
                  return (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-zinc-400 text-xs font-mono whitespace-nowrap">
                        {new Date(entry.performedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${badgeClass}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold tabular-nums ${isNegative ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatAmount(entry.amount, entry.type)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 max-w-[240px] truncate">
                        {entry.description ?? <span className="text-zinc-700 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{entry.performedBy}</td>
                      <td className="px-4 py-3 text-zinc-600 font-mono text-[11px] truncate max-w-[140px]">
                        {entry.posShiftId}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
