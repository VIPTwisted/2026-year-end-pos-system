import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Scale } from 'lucide-react'

export const dynamic = 'force-dynamic'

function VarianceChip({ pct }: { pct: number }) {
  const abs = Math.abs(pct)
  const cls = abs <= 2
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : abs <= 5
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-red-500/10 text-red-400 border-red-500/30'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${cls}`}>
      {pct > 0 ? '+' : ''}{pct.toFixed(2)}%
    </span>
  )
}

export default async function CatchWeightPage() {
  const items = await prisma.catchWeightItem.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const avgVariance = items.length
    ? items.reduce((s, i) => s + Math.abs(i.variancePct), 0) / items.length
    : 0
  const outOfSpec = items.filter(i => Math.abs(i.variancePct) > 5).length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Catch Weight Items" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Items', value: items.length, color: 'text-zinc-200' },
            { label: 'Avg Variance', value: `${avgVariance.toFixed(2)}%`, color: 'text-zinc-200' },
            { label: 'Out of Spec (>5%)', value: outOfSpec, color: outOfSpec > 0 ? 'text-red-400' : 'text-emerald-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-xl font-semibold font-mono ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-zinc-400" />
          <h1 className="text-sm font-semibold text-zinc-200">Catch Weight Items</h1>
          <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
            {items.length}
          </span>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {items.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No catch weight items found.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Item No.', 'Description', 'Lot No.', 'Qty', 'Nominal Weight', 'Actual Weight', 'Unit', 'Variance %'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-blue-400 text-[12px]">{item.itemNo}</td>
                    <td className="px-4 py-2.5 text-zinc-300">{item.description ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">{item.lotNo ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-200 font-mono text-[12px]">{item.qty.toFixed(3)}</td>
                    <td className="px-4 py-2.5 text-zinc-300 font-mono text-[12px]">{item.nominalWeight.toFixed(3)}</td>
                    <td className="px-4 py-2.5 text-zinc-300 font-mono text-[12px]">{item.actualWeight.toFixed(3)}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{item.unit}</td>
                    <td className="px-4 py-2.5"><VarianceChip pct={item.variancePct} /></td>
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
