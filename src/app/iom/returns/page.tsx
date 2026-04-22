export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { RotateCcw, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  initiated: 'bg-zinc-700 text-zinc-300',
  label_created: 'bg-blue-900/50 text-blue-300',
  in_transit: 'bg-amber-900/50 text-amber-300',
  received: 'bg-purple-900/50 text-purple-300',
  inspected: 'bg-indigo-900/50 text-indigo-300',
  refund_issued: 'bg-emerald-900/50 text-emerald-300',
  closed: 'bg-zinc-800 text-zinc-500',
}

const STATES = ['initiated', 'label_created', 'in_transit', 'received', 'inspected', 'refund_issued', 'closed']

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const sp = await searchParams
  const state = sp.state

  const returns = await prisma.returnOrchestration.findMany({
    where: state ? { state } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      returnProvider: { select: { name: true } },
      _count: { select: { lines: true } },
    },
  })

  const counts = await prisma.returnOrchestration.groupBy({ by: ['state'], _count: { _all: true } })
  const countMap: Record<string, number> = {}
  for (const c of counts) countMap[c.state] = c._count._all

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-orange-400" /> Returns
        </h1>
        <Link href="/iom/returns/new" className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Return
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/iom/returns" className={cn('px-3 py-1.5 rounded-lg text-sm transition-colors', !state ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
          All
        </Link>
        {STATES.map((s) => (
          <Link key={s} href={`/iom/returns?state=${s}`}
            className={cn('px-3 py-1.5 rounded-lg text-sm capitalize transition-colors', state === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
            {s.replace(/_/g, ' ')} {countMap[s] ? `(${countMap[s]})` : ''}
          </Link>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left p-4 text-zinc-500 font-medium">Return #</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Customer</th>
              <th className="text-center p-4 text-zinc-500 font-medium">Lines</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Reason</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Method</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Provider</th>
              <th className="text-left p-4 text-zinc-500 font-medium">State</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="p-4">
                  <Link href={`/iom/returns/${r.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                    {r.returnNo}
                  </Link>
                </td>
                <td className="p-4 text-zinc-300 text-xs">
                  {r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : '—'}
                </td>
                <td className="p-4 text-center text-zinc-400 text-xs">{r._count.lines}</td>
                <td className="p-4 text-zinc-400 text-xs">{r.reason ?? '—'}</td>
                <td className="p-4 text-zinc-400 text-xs">{r.refundMethod}</td>
                <td className="p-4 text-zinc-400 text-xs">{r.returnProvider?.name ?? '—'}</td>
                <td className="p-4">
                  <span className={cn('px-2 py-0.5 rounded text-xs capitalize', STATE_COLORS[r.state] ?? 'bg-zinc-700 text-zinc-400')}>
                    {r.state.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4 text-zinc-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-zinc-600">No returns found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
