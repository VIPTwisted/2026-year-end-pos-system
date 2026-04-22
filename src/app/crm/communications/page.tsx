import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

const CHANNEL_BADGE: Record<string, string> = {
  phone:     'bg-violet-500/15 text-violet-400 border-violet-500/30',
  email:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
  chat:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  in_person: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

const DIRECTION_BADGE: Record<string, string> = {
  inbound:  'bg-blue-500/10 text-blue-300',
  outbound: 'bg-violet-500/10 text-violet-300',
}

function formatDt(dt: Date) {
  return dt.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default async function CommunicationsPage() {
  const now         = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [communications, totalThisMonth] = await Promise.all([
    prisma.communication.findMany({
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.communication.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
  ])

  // Channel breakdown this month
  const channelCounts = await prisma.communication.groupBy({
    by: ['channel'],
    where: { createdAt: { gte: startOfMonth } },
    _count: { _all: true },
  })

  const channels = ['phone', 'email', 'chat', 'in_person']
  const channelMap = Object.fromEntries(
    channelCounts.map(c => [c.channel, c._count._all])
  )

  const stats = [
    { label: 'Total This Month', value: totalThisMonth.toString(), accent: 'bg-blue-500' },
    ...channels.map(ch => ({
      label: ch.replace('_', ' '),
      value: (channelMap[ch] ?? 0).toString(),
      accent:
        ch === 'phone'     ? 'bg-violet-500' :
        ch === 'email'     ? 'bg-blue-500'   :
        ch === 'chat'      ? 'bg-emerald-500' :
                             'bg-amber-500',
    })),
  ]

  return (
    <>
      <TopBar title="Communications" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Communications</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{communications.length} total · {totalThisMonth} this month</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className={`h-[3px] w-full ${s.accent}`} />
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        {communications.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
            <MessageSquare className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-[13px]">No communications yet.</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Date</th>
                    <th className="text-left py-2.5 font-medium">Customer</th>
                    <th className="text-left py-2.5 font-medium">Channel</th>
                    <th className="text-left py-2.5 font-medium">Direction</th>
                    <th className="text-left py-2.5 font-medium">Subject</th>
                    <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {communications.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-zinc-800/30 transition-colors ${idx !== communications.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-zinc-500 text-[11px] tabular-nums whitespace-nowrap">
                        {formatDt(c.createdAt)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/customers/${c.customer.id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {c.customer.firstName} {c.customer.lastName}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${CHANNEL_BADGE[c.channel] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-600'}`}>
                          {c.channel.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${DIRECTION_BADGE[c.direction] ?? 'bg-zinc-700/50 text-zinc-400'}`}>
                          {c.direction}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-300 max-w-[200px] truncate">
                        {c.subject ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize bg-zinc-500/10 text-zinc-400">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
