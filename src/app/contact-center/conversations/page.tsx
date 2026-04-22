import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_TABS = ['open', 'active', 'wrap_up', 'closed', 'abandoned'] as const
const CHANNEL_FILTERS = ['all', 'voice', 'live_chat', 'email', 'whatsapp', 'facebook', 'sms'] as const

const CHANNEL_COLORS: Record<string, string> = {
  voice: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  live_chat: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  email: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  whatsapp: 'bg-green-500/20 text-green-400 border-green-500/30',
  facebook: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  sms: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  custom: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-zinc-500/20 text-zinc-300',
  active: 'bg-emerald-500/20 text-emerald-400',
  waiting: 'bg-amber-500/20 text-amber-400',
  wrap_up: 'bg-purple-500/20 text-purple-400',
  closed: 'bg-zinc-600/20 text-zinc-500',
  abandoned: 'bg-red-500/20 text-red-400',
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function SentimentDot({ v }: { v: string | null }) {
  if (v === 'positive') return <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
  if (v === 'negative') return <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
  return <span className="inline-block w-2 h-2 rounded-full bg-zinc-500" />
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; channel?: string }>
}) {
  const sp = await searchParams
  const statusFilter = sp.status ?? 'open'
  const channelFilter = sp.channel ?? 'all'

  const where: Record<string, unknown> = {}
  if (statusFilter !== 'all') where.status = statusFilter
  if (channelFilter !== 'all') {
    const channels = await prisma.contactChannel.findMany({ where: { type: channelFilter } })
    where.channelId = { in: channels.map(c => c.id) }
  }

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      channel: true,
      customer: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { startedAt: 'desc' },
    take: 200,
  })

  const counts = await prisma.conversation.groupBy({
    by: ['status'],
    _count: { id: true },
  })
  const countMap = Object.fromEntries(counts.map(c => [c.status, c._count.id]))

  return (
    <>
      <TopBar title="Conversations" />
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">Conversations</h1>
        <Link
          href="/contact-center/conversations/new"
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New Outbound
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-0.5 border-b border-zinc-800">
        {STATUS_TABS.map(tab => (
          <Link
            key={tab}
            href={`?status=${tab}&channel=${channelFilter}`}
            className={cn(
              'px-4 py-2 text-[13px] font-medium rounded-t border-b-2 transition-colors capitalize',
              statusFilter === tab
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
            )}
          >
            {tab.replace('_', ' ')}
            {countMap[tab] ? <span className="ml-1.5 text-[11px] text-zinc-600">({countMap[tab]})</span> : null}
          </Link>
        ))}
      </div>

      {/* Channel Action Chips */}
      <div className="flex gap-2 flex-wrap">
        {CHANNEL_FILTERS.map(ch => (
          <Link
            key={ch}
            href={`?status=${statusFilter}&channel=${ch}`}
            className={cn(
              'px-2.5 py-0.5 text-[12px] font-medium rounded border transition-colors',
              channelFilter === ch
                ? 'bg-zinc-700 border-zinc-500 text-zinc-100'
                : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
            )}
          >
            {ch === 'all' ? 'All' : ch.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* Conversation rows — avatar + name + channel icon + message preview */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Conv #</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Channel</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Dir.</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Agent</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Wait</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Handle</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Sent.</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">CSAT</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-[11px] text-zinc-500 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-[13px] text-zinc-600">No conversations</td>
                </tr>
              )}
              {conversations.map(conv => {
                /* Avatar initials derived from customer name */
                const initials = conv.customer
                  ? `${conv.customer.firstName[0] ?? ''}${conv.customer.lastName[0] ?? ''}`.toUpperCase()
                  : '??'
                return (
                  <tr key={conv.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/contact-center/conversations/${conv.id}`} className="text-[13px] text-blue-400 hover:text-blue-300 font-mono">
                        {conv.conversationNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium border', CHANNEL_COLORS[conv.channel.type] ?? CHANNEL_COLORS.custom)}>
                        {conv.channel.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium', conv.direction === 'outbound' ? 'bg-violet-500/20 text-violet-400' : 'bg-sky-500/20 text-sky-400')}>
                        {conv.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {conv.customer ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-800/60 flex items-center justify-center text-[9px] font-bold text-blue-200 shrink-0">
                            {initials}
                          </div>
                          <Link href={`/customers/${conv.customer.id}`} className="text-[13px] text-zinc-300 hover:text-zinc-100">
                            {conv.customer.firstName} {conv.customer.lastName}
                          </Link>
                        </div>
                      ) : <span className="text-[13px] text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-400">{conv.agentName ?? <span className="text-zinc-600">—</span>}</td>
                    <td className="px-4 py-3 text-[13px] text-zinc-400 tabular-nums">{fmtSecs(conv.waitTimeSeconds)}</td>
                    <td className="px-4 py-3 text-[13px] text-zinc-400 tabular-nums">{fmtSecs(conv.handleTimeSeconds)}</td>
                    <td className="px-4 py-3"><SentimentDot v={conv.sentiment} /></td>
                    <td className="px-4 py-3 text-[13px] text-zinc-400">{conv.csat ? `${conv.csat}/5` : <span className="text-zinc-600">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium', STATUS_COLORS[conv.status] ?? STATUS_COLORS.open)}>
                        {conv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-500 tabular-nums whitespace-nowrap">
                      {new Date(conv.startedAt).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  )
}
