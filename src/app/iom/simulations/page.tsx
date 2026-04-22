import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FlaskConical, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-400',
  running: 'bg-blue-900/50 text-blue-300',
  completed: 'bg-emerald-900/50 text-emerald-300',
}

export default async function SimulationsPage() {
  const sims = await prisma.iOMSimulation.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-pink-400" /> AI Simulations
        </h1>
        <Link href="/iom/simulations/new" className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Simulation
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left p-4 text-zinc-500 font-medium">Name</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Policy</th>
              <th className="text-center p-4 text-zinc-500 font-medium">Test Orders</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Status</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Run Date</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Results</th>
            </tr>
          </thead>
          <tbody>
            {sims.map((s) => {
              const testOrders = Array.isArray(s.testOrders) ? s.testOrders : []
              const results = s.results as Array<{ winner: { providerName: string } | null }> | null
              const winnerSummary = results
                ? [...new Set(results.map((r) => r.winner?.providerName).filter(Boolean))].join(', ')
                : null

              return (
                <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="p-4">
                    <Link href={`/iom/simulations/${s.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                      {s.name}
                    </Link>
                    {s.description && <div className="text-xs text-zinc-500 mt-0.5">{s.description}</div>}
                  </td>
                  <td className="p-4 text-xs text-zinc-400">{s.policyId ? 'Custom Policy' : 'Default'}</td>
                  <td className="p-4 text-center text-zinc-400 text-xs">{testOrders.length}</td>
                  <td className="p-4">
                    <span className={cn('px-2 py-0.5 rounded text-xs capitalize', STATUS_COLORS[s.status] ?? 'bg-zinc-700 text-zinc-400')}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-zinc-500">
                    {s.runAt ? new Date(s.runAt).toLocaleString() : '—'}
                  </td>
                  <td className="p-4 text-xs text-zinc-400 max-w-xs truncate">
                    {winnerSummary ?? '—'}
                  </td>
                </tr>
              )
            })}
            {sims.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-600">No simulations. <Link href="/iom/simulations/new" className="text-blue-400">Create one</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
