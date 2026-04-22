import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Phone, PhoneIncoming, PhoneOutgoing, Plus, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

const DIR_BADGE: Record<string, string> = {
  inbound:  'bg-blue-500/10 text-blue-400',
  outbound: 'bg-emerald-500/10 text-emerald-400',
}

const OUTCOME_COLORS: Record<string, string> = {
  sale:      'bg-emerald-500/10 text-emerald-400',
  inquiry:   'bg-blue-500/10 text-blue-400',
  complaint: 'bg-red-500/10 text-red-400',
  callback:  'bg-amber-500/10 text-amber-400',
  no_answer: 'bg-zinc-700/50 text-zinc-400',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatTs(d: Date | null): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(d))
}

export default async function CallsListPage() {
  const calls = await prisma.callLog.findMany({
    orderBy: { callStartedAt: 'desc' },
    take: 200,
    include: {
      agent:    { select: { id: true, name: true, extension: true } },
      customer: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  const inbound  = calls.filter(c => c.direction === 'inbound').length
  const outbound = calls.filter(c => c.direction === 'outbound').length
  const withDur  = calls.filter(c => c.duration)
  const avgDur   = withDur.length
    ? Math.round(withDur.reduce((s, c) => s + (c.duration ?? 0), 0) / withDur.length)
    : null

  return (
    <>
      <TopBar title="Call Log" />
      <main className="flex-1 p-6 overflow-auto min-h-[100dvh]">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/call-center" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Call Center
            </Link>
            <div className="ml-auto">
              <Link href="/call-center/calls/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Log Call
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'TOTAL CALLS',    value: calls.length,                     color: 'text-zinc-100' },
              { label: 'INBOUND',        value: inbound,                           color: 'text-blue-400' },
              { label: 'OUTBOUND',       value: outbound,                          color: 'text-emerald-400' },
              { label: 'AVG DURATION',   value: formatDuration(avgDur),            color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{s.label}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Date / Time', 'Agent', 'Customer', 'Direction', 'Duration', 'Outcome', 'Notes'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 text-sm">
                      No calls logged yet.{' '}
                      <Link href="/call-center/calls/new" className="text-blue-400 hover:text-blue-300">Log the first one</Link>
                    </td>
                  </tr>
                )}
                {calls.map(c => (
                  <tr key={c.id} className="border-b border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs whitespace-nowrap">
                      {formatTs(c.callStartedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-zinc-200 text-sm">{c.agent?.name ?? '—'}</div>
                      {c.agent?.extension && (
                        <div className="text-zinc-500 text-xs">ext. {c.agent.extension}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.customer ? (
                        <Link href={`/customers/${c.customer.id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors">
                          {c.customer.firstName} {c.customer.lastName}
                        </Link>
                      ) : (
                        <span className="text-zinc-500 text-xs">Anonymous</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium capitalize ${DIR_BADGE[c.direction] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {c.direction === 'inbound'
                          ? <PhoneIncoming className="w-3 h-3" />
                          : <PhoneOutgoing className="w-3 h-3" />}
                        {c.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                      {formatDuration(c.duration)}
                    </td>
                    <td className="px-4 py-3">
                      {c.outcome ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${OUTCOME_COLORS[c.outcome] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {c.outcome.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-[200px] truncate">
                      {c.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {calls.length > 0 && (
            <p className="text-xs text-zinc-600 text-right">Showing {calls.length} most recent calls</p>
          )}
        </div>
      </main>
    </>
  )
}
