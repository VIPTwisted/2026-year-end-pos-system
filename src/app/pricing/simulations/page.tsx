import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Plus, Zap, Copy } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    archived: 'bg-zinc-500/10 text-zinc-500 border-zinc-600/30',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

function TypeChip({ type }: { type: string }) {
  const map: Record<string, string> = {
    what_if: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    planned: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }
  const cls = map[type] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  const label = type === 'what_if' ? 'What-If' : 'Planned'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${cls}`}>
      {label}
    </span>
  )
}

export default async function PriceSimulationsPage() {
  const sims = await prisma.priceSimulation.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Price Simulations" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Price Simulations</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {sims.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
              <Zap className="w-3.5 h-3.5" /> Activate
            </button>
            <Link href="/pricing/simulations/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {sims.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No price simulations found.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Simulation No.', 'Description', 'Status', 'Price List', 'Date Range', 'Type', 'Revenue Impact'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sims.map(s => (
                  <tr key={s.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/pricing/simulations/${s.id}`} className="font-mono text-blue-400 hover:text-blue-300 hover:underline text-[12px]">
                        {s.simulationNo}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300">{s.description ?? '—'}</td>
                    <td className="px-4 py-2.5"><StatusChip status={s.status} /></td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{s.priceList ?? '—'}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">
                      {s.dateFrom && s.dateTo
                        ? `${new Date(s.dateFrom).toLocaleDateString()} – ${new Date(s.dateTo).toLocaleDateString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5"><TypeChip type={s.simulationType} /></td>
                    <td className={`px-4 py-2.5 font-mono text-[12px] ${s.totalImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.totalImpact >= 0 ? '+' : ''}{formatCurrency(s.totalImpact)}
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
