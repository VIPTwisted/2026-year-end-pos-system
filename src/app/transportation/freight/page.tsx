import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Truck, RefreshCw, Receipt } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    reconciled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    disputed: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default async function FreightReconciliationPage() {
  const records = await prisma.freightReconciliation.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const totalDiff = records.reduce((s, r) => s + r.difference, 0)
  const open = records.filter(r => r.status === 'open').length
  const reconciled = records.filter(r => r.status === 'reconciled').length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Freight Reconciliation" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Records', value: records.length, color: 'text-zinc-200' },
            { label: 'Open', value: open, color: 'text-blue-400' },
            { label: 'Total Difference', value: formatCurrency(totalDiff), color: totalDiff !== 0 ? 'text-amber-400' : 'text-emerald-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-xl font-semibold font-mono ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Actions + header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Freight Charges</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {records.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
              <Receipt className="w-3.5 h-3.5" /> Create GL Entry
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reconcile
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {records.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No freight charges found.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Carrier', 'Service Code', 'Bill of Lading No.', 'Invoice Amount', 'Expected Amount', 'Difference', 'Status', 'GL Entry'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 text-zinc-300 font-medium">{r.carrier}</td>
                    <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">{r.serviceCode ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">{r.billOfLadingNo ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-200 font-mono text-[12px]">{formatCurrency(r.invoiceAmount)}</td>
                    <td className="px-4 py-2.5 text-zinc-200 font-mono text-[12px]">{formatCurrency(r.expectedAmount)}</td>
                    <td className={`px-4 py-2.5 font-mono text-[12px] ${r.difference !== 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatCurrency(r.difference)}
                    </td>
                    <td className="px-4 py-2.5"><StatusChip status={r.status} /></td>
                    <td className="px-4 py-2.5 text-[11px]">
                      {r.glEntryCreated
                        ? <span className="text-emerald-400">{r.glEntryRef ?? 'Created'}</span>
                        : <span className="text-zinc-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
