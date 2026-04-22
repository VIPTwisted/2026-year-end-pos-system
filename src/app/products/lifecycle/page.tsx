import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Layers, RotateCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PHASE_STYLES: Record<string, string> = {
  introduction: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  growth: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  maturity: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  decline: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  discontinued: 'bg-red-500/10 text-red-400 border-red-500/30',
}

function PhaseChip({ phase }: { phase: string }) {
  const cls = PHASE_STYLES[phase] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {phase}
    </span>
  )
}

export default async function ProductLifecyclePage() {
  const items = await prisma.productLifecycle.findMany({
    orderBy: { effectiveDate: 'desc' },
  })

  const phaseCounts = items.reduce((acc, i) => {
    acc[i.lifecyclePhase] = (acc[i.lifecyclePhase] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Product Lifecycle" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* Phase summary strip */}
        <div className="grid grid-cols-5 gap-3">
          {['introduction', 'growth', 'maturity', 'decline', 'discontinued'].map(phase => (
            <div key={phase} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 capitalize">{phase}</p>
              <p className="text-lg font-semibold text-zinc-200 font-mono">{phaseCounts[phase] ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Product Lifecycle</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {items.length}
            </span>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Change Phase
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {items.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No lifecycle records found.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Item No.', 'Description', 'Lifecycle Phase', 'Effective Date', 'Notes'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-blue-400 text-[12px]">{item.itemNo}</td>
                    <td className="px-4 py-2.5 text-zinc-300">{item.description ?? '—'}</td>
                    <td className="px-4 py-2.5"><PhaseChip phase={item.lifecyclePhase} /></td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">
                      {new Date(item.effectiveDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-500 text-[12px]">{item.notes ?? '—'}</td>
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
