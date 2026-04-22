export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FlaskConical, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import SimulationRunButton from './SimulationRunButton'

export default async function SimulationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sim = await prisma.iOMSimulation.findUnique({ where: { id } })
  if (!sim) notFound()

  const testOrders = sim.testOrders as Array<{
    productId?: string; quantity?: number; region?: string; orderValue?: number; priority?: string
  }>

  const results = sim.results as Array<{
    testOrderIndex: number
    order: { orderValue?: number; region?: string; priority?: string }
    winner: { providerName: string; providerType: string; score: number; costEstimate: number; daysEstimate: number; reasons: string[] } | null
    allScores: Array<{ providerName: string; score: number }>
  }> | null

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-pink-400" /> {sim.name}
          </h1>
          {sim.description && <p className="text-sm text-zinc-500 mt-1">{sim.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('px-3 py-1 rounded-full text-sm capitalize', sim.status === 'completed' ? 'bg-emerald-900/50 text-emerald-300' : sim.status === 'running' ? 'bg-blue-900/50 text-blue-300' : 'bg-zinc-700 text-zinc-400')}>
            {sim.status}
          </span>
          {sim.status !== 'running' && <SimulationRunButton simId={sim.id} />}
        </div>
      </div>

      {/* Summary */}
      {results && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Test Orders</div>
            <div className="text-2xl font-bold text-zinc-100">{testOrders.length}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Providers Evaluated</div>
            <div className="text-2xl font-bold text-zinc-100">
              {results[0]?.allScores.length ?? 0}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Run Date</div>
            <div className="text-sm font-medium text-zinc-300">
              {sim.runAt ? new Date(sim.runAt).toLocaleString() : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {results ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Simulation Results</h2>
          <div className="space-y-4">
            {results.map((r) => (
              <div key={r.testOrderIndex} className="border border-zinc-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between bg-zinc-800/50 px-4 py-2">
                  <span className="text-sm font-medium text-zinc-300">Test Order #{r.testOrderIndex + 1}</span>
                  <div className="flex gap-4 text-xs text-zinc-500">
                    {r.order.region && <span>Region: {r.order.region}</span>}
                    {r.order.orderValue !== undefined && <span>Value: ${r.order.orderValue}</span>}
                    {r.order.priority && <span>Priority: {r.order.priority}</span>}
                  </div>
                </div>
                {r.winner ? (
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium text-zinc-100">Winner: {r.winner.providerName}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-zinc-700 text-zinc-400 rounded">{r.winner.providerType}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-zinc-400">
                        <span>Score: <strong className="text-zinc-200">{r.winner.score.toFixed(0)}/100</strong></span>
                        <span>Cost: <strong className="text-zinc-200">${r.winner.costEstimate.toFixed(2)}</strong></span>
                        <span>Days: <strong className="text-zinc-200">{r.winner.daysEstimate}</strong></span>
                      </div>
                    </div>
                    {r.winner.reasons.length > 0 && (
                      <div className="text-xs text-zinc-500 mb-3">{r.winner.reasons.join(' · ')}</div>
                    )}
                    {/* All scores */}
                    <div className="space-y-1.5">
                      {r.allScores.map((s) => (
                        <div key={s.providerName} className="flex items-center gap-3">
                          <span className="text-xs text-zinc-400 w-32 truncate">{s.providerName}</span>
                          <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', s.providerName === r.winner?.providerName ? 'bg-emerald-500' : 'bg-zinc-500')}
                              style={{ width: `${Math.max(0, s.score)}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500 w-10 text-right">{s.score.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-sm text-zinc-500">No eligible providers found</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <FlaskConical className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">Simulation has not been run yet</p>
          <SimulationRunButton simId={sim.id} />
        </div>
      )}

      {/* Test Orders summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Test Order Inputs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left pb-2 text-zinc-500 font-medium">#</th>
                <th className="text-left pb-2 text-zinc-500 font-medium">Product</th>
                <th className="text-center pb-2 text-zinc-500 font-medium">Qty</th>
                <th className="text-left pb-2 text-zinc-500 font-medium">Region</th>
                <th className="text-right pb-2 text-zinc-500 font-medium">Value</th>
                <th className="text-left pb-2 text-zinc-500 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {testOrders.map((o, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-1.5 text-zinc-500">{i + 1}</td>
                  <td className="py-1.5 text-zinc-400 font-mono">{o.productId ?? '—'}</td>
                  <td className="py-1.5 text-center text-zinc-400">{o.quantity ?? 1}</td>
                  <td className="py-1.5 text-zinc-400">{o.region ?? '—'}</td>
                  <td className="py-1.5 text-right text-zinc-300">${o.orderValue ?? 0}</td>
                  <td className="py-1.5 text-zinc-400 capitalize">{o.priority ?? 'standard'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
