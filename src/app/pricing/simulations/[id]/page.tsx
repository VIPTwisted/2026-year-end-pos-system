import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SimLine {
  item: string
  originalPrice: number
  newPrice: number
}

interface Params { params: Promise<{ id: string }> }

export default async function PriceSimulationCardPage({ params }: Params) {
  const { id } = await params
  const sim = await prisma.priceSimulation.findUnique({ where: { id } })
  if (!sim) notFound()

  let lines: SimLine[] = []
  try {
    lines = sim.linesJson ? JSON.parse(sim.linesJson) : []
  } catch { lines = [] }

  const totalOriginal = lines.reduce((s, l) => s + (l.originalPrice ?? 0), 0)
  const totalNew = lines.reduce((s, l) => s + (l.newPrice ?? 0), 0)
  const delta = totalNew - totalOriginal
  const deltaPct = totalOriginal > 0 ? (delta / totalOriginal) * 100 : 0

  const statusStyle: Record<string, string> = {
    draft: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    archived: 'bg-zinc-500/10 text-zinc-500 border-zinc-600/30',
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Simulation ${sim.simulationNo}`} />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-5">

        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <Link href="/pricing/simulations" className="hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Price Simulations
          </Link>
          <span>/</span>
          <span className="text-zinc-300 font-mono">{sim.simulationNo}</span>
        </div>

        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-zinc-400" />
          <h1 className="text-base font-semibold text-zinc-100">{sim.simulationNo}</h1>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${statusStyle[sim.status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'}`}>
            {sim.status}
          </span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${sim.simulationType === 'what_if' ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
            {sim.simulationType === 'what_if' ? 'What-If' : 'Planned'}
          </span>
        </div>

        {/* General FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">General</h2>
          <dl className="grid grid-cols-3 gap-4 text-[13px]">
            {[
              ['Simulation No.', sim.simulationNo],
              ['Description', sim.description ?? '—'],
              ['Price List', sim.priceList ?? '—'],
              ['Date From', sim.dateFrom ? new Date(sim.dateFrom).toLocaleDateString() : '—'],
              ['Date To', sim.dateTo ? new Date(sim.dateTo).toLocaleDateString() : '—'],
              ['Created', new Date(sim.createdAt).toLocaleDateString()],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <dt className="text-[10px] uppercase tracking-wide text-zinc-500 mb-0.5">{label}</dt>
                <dd className="text-zinc-200">{val as string}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* P&L Impact Table FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">P&L Impact</h2>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                {['Metric', 'Current', 'Simulated', 'Delta'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/20">
                <td className="px-4 py-2.5 text-zinc-300 font-medium">Total Revenue (Sim Lines)</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-300">{formatCurrency(totalOriginal)}</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-200">{formatCurrency(totalNew)}</td>
                <td className={`px-4 py-2.5 font-mono text-[12px] ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {delta >= 0 ? '+' : ''}{formatCurrency(delta)} ({deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%)
                </td>
              </tr>
              <tr className="border-b border-zinc-800/20">
                <td className="px-4 py-2.5 text-zinc-300 font-medium">Recorded Total Impact</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">—</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-200">{formatCurrency(sim.totalImpact)}</td>
                <td className={`px-4 py-2.5 font-mono text-[12px] ${sim.totalImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {sim.totalImpact >= 0 ? '+' : ''}{formatCurrency(sim.totalImpact)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-zinc-300 font-medium">Item Lines</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">{lines.length}</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">{lines.length}</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-500">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Simulation Lines FastTab */}
        {lines.length > 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/30">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Simulation Lines</h2>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                  {['Item', 'Original Price', 'New Price', 'Change %'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const orig = l.originalPrice ?? 0
                  const np = l.newPrice ?? 0
                  const pct = orig > 0 ? ((np - orig) / orig) * 100 : 0
                  return (
                    <tr key={i} className="border-b border-zinc-800/20 hover:bg-zinc-800/10">
                      <td className="px-4 py-2.5 font-mono text-zinc-300 text-[12px]">{l.item ?? '—'}</td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-300">{formatCurrency(orig)}</td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-200">{formatCurrency(np)}</td>
                      <td className={`px-4 py-2.5 font-mono text-[12px] ${pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
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
