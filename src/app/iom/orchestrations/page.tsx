import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { GitBranch, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  received: 'bg-zinc-700 text-zinc-200',
  validated: 'bg-blue-900/60 text-blue-300',
  optimizing: 'bg-purple-900/60 text-purple-300',
  allocated_to_provider: 'bg-indigo-900/60 text-indigo-300',
  in_fulfillment: 'bg-amber-900/60 text-amber-300',
  shipped: 'bg-cyan-900/60 text-cyan-300',
  delivered: 'bg-emerald-900/60 text-emerald-300',
  cancelled: 'bg-red-900/60 text-red-300',
}

const SOURCE_COLORS: Record<string, string> = {
  pos: 'bg-blue-900/50 text-blue-300',
  ecommerce: 'bg-purple-900/50 text-purple-300',
  call_center: 'bg-amber-900/50 text-amber-300',
  manual: 'bg-zinc-700 text-zinc-300',
  api: 'bg-emerald-900/50 text-emerald-300',
}

const PRIORITY_COLORS: Record<string, string> = {
  rush: 'bg-red-900/60 text-red-300',
  expedited: 'bg-amber-900/60 text-amber-300',
  standard: 'bg-zinc-700 text-zinc-400',
}

const STATES = ['received', 'validated', 'optimizing', 'allocated_to_provider', 'in_fulfillment', 'shipped', 'delivered', 'cancelled']

export default async function OrchestrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; priority?: string }>
}) {
  const sp = await searchParams
  const state = sp.state
  const priority = sp.priority

  const where: Record<string, unknown> = {}
  if (state) where.state = state
  if (priority) where.priority = priority

  const orchestrations = await prisma.orderOrchestration.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      _count: { select: { lines: true } },
    },
  })

  const counts = await prisma.orderOrchestration.groupBy({ by: ['state'], _count: { _all: true } })
  const countMap: Record<string, number> = {}
  for (const c of counts) countMap[c.state] = c._count._all

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-400" /> Orchestrations
        </h1>
        <Link
          href="/iom/orchestrations/new"
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>

      {/* State Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/iom/orchestrations"
          className={cn(
            'px-3 py-1 rounded text-[13px] transition-colors',
            !state ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          )}
        >
          All ({Object.values(countMap).reduce((a, b) => a + b, 0)})
        </Link>
        {STATES.map((s) => (
          <Link
            key={s}
            href={`/iom/orchestrations?state=${s}`}
            className={cn(
              'px-3 py-1 rounded text-[13px] capitalize transition-colors',
              state === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            {s.replace(/_/g, ' ')} {countMap[s] ? `(${countMap[s]})` : ''}
          </Link>
        ))}
      </div>

      {/* Priority Action Chips */}
      <div className="flex gap-2">
        {['rush', 'expedited', 'standard'].map((p) => (
          <Link
            key={p}
            href={state ? `/iom/orchestrations?state=${state}&priority=${p}` : `/iom/orchestrations?priority=${p}`}
            className={cn(
              'px-2.5 py-0.5 rounded text-[12px] capitalize transition-colors',
              priority === p ? 'bg-zinc-600 text-white' : 'bg-zinc-800/60 text-zinc-500 hover:bg-zinc-800'
            )}
          >
            {p}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-zinc-800">
            <tr>
              {['IOM #', 'Source', 'Customer', 'Lines', 'Value', 'Priority', 'State', 'Promised', 'Created'].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    'py-3 px-4 text-[11px] text-zinc-500 font-medium',
                    i === 0 || i === 1 || i === 2 || i === 5 || i === 6 || i === 7 || i === 8 ? 'text-left' : 'text-center',
                    i === 4 ? 'text-right' : ''
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orchestrations.map((o) => {
              const isOverdue = o.promisedDate && new Date(o.promisedDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) && o.state !== 'delivered'
              return (
                <tr key={o.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-2.5 px-4">
                    <Link href={`/iom/orchestrations/${o.id}`} className="text-[13px] text-blue-400 hover:text-blue-300 font-mono">
                      {o.orchestrationNo}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium', SOURCE_COLORS[o.sourceType] ?? 'bg-zinc-700 text-zinc-400')}>
                      {o.sourceType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[13px] text-zinc-300">
                    {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-center text-[13px] text-zinc-400 tabular-nums">{o._count.lines}</td>
                  <td className="py-2.5 px-4 text-right text-[13px] text-zinc-300 tabular-nums">${o.orderValue.toFixed(2)}</td>
                  <td className="py-2.5 px-4">
                    <span className={cn('px-2 py-0.5 rounded text-[11px] capitalize', PRIORITY_COLORS[o.priority] ?? '')}>
                      {o.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={cn('px-2 py-0.5 rounded text-[11px] capitalize', STATE_COLORS[o.state] ?? 'bg-zinc-700 text-zinc-400')}>
                      {o.state.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[13px]">
                    {o.promisedDate ? (
                      <span className={cn(isOverdue ? 'text-amber-400 font-medium' : 'text-zinc-400')}>
                        {new Date(o.promisedDate).toLocaleDateString()}
                      </span>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="py-2.5 px-4 text-[13px] text-zinc-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              )
            })}
            {orchestrations.length === 0 && (
              <tr><td colSpan={9} className="py-10 text-center text-[13px] text-zinc-600">No orchestrations found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
