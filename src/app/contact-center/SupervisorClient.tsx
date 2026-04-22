'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Clock, AlertTriangle, Star,
  UserCheck, Users, WifiOff, Radio,
  Phone, Mail, MessagesSquare, Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Conversation = {
  id: string
  conversationNo: string
  status: string
  direction: string
  agentName: string | null
  waitTimeSeconds: number
  sentiment: string | null
  startedAt: Date | string
  channel: { id: string; name: string; type: string }
  customer: { id: string; firstName: string; lastName: string } | null
}

type Presence = {
  id: string
  agentId: string
  agentName: string
  status: string
  statusNote: string | null
  channelCapacities: unknown
  activeConversations: number
  lastUpdated: Date | string
}

type ChannelVolume = { id: string; name: string; type: string; count: number }

type KPIs = {
  active: number
  waiting: number
  avgWait: number
  abandoned: number
  csatAvg: string | number
  agentsAvailable: number
  agentsBusy: number
  agentsOffline: number
}

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

const PRESENCE_COLORS: Record<string, string> = {
  available: 'bg-emerald-400',
  busy: 'bg-amber-400',
  away: 'bg-zinc-400',
  do_not_disturb: 'bg-red-500',
  on_break: 'bg-blue-400',
  offline: 'bg-zinc-600',
}

const PRESENCE_BADGE: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  busy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  away: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  do_not_disturb: 'bg-red-500/20 text-red-400 border-red-500/30',
  on_break: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  offline: 'bg-zinc-700/20 text-zinc-500 border-zinc-700/30',
}

function formatWait(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function SentimentDot({ v }: { v: string | null }) {
  if (v === 'positive') return <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title="Positive" />
  if (v === 'negative') return <span className="inline-block w-2 h-2 rounded-full bg-red-400" title="Negative" />
  return <span className="inline-block w-2 h-2 rounded-full bg-zinc-500" title="Neutral" />
}

function ChannelBadge({ type }: { type: string }) {
  const cl = CHANNEL_COLORS[type] ?? CHANNEL_COLORS.custom
  return <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', cl)}>{type.replace('_', ' ')}</span>
}

export default function SupervisorClient({
  kpis,
  liveQueue,
  presences,
  channelVolume,
}: {
  kpis: KPIs
  liveQueue: Conversation[]
  presences: Presence[]
  channelVolume: ChannelVolume[]
}) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30_000)
    return () => clearInterval(id)
  }, [router])

  const maxVol = Math.max(...channelVolume.map(c => c.count), 1)

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Contact Center — Supervisor View</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Real-time operations · Updates every 30s</p>
        </div>
        <Link
          href="/contact-center/conversations/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New Conversation
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard label="Active" value={kpis.active} icon={<MessageSquare className="w-4 h-4" />} color="emerald" />
        <KpiCard label="Waiting" value={kpis.waiting} icon={<Clock className="w-4 h-4" />} color="amber" />
        <KpiCard label="Avg Wait" value={formatWait(kpis.avgWait)} icon={<Clock className="w-4 h-4" />} color="blue" />
        <KpiCard label="Abandoned" value={kpis.abandoned} icon={<AlertTriangle className="w-4 h-4" />} color="red" />
        <KpiCard label="CSAT Score" value={kpis.csatAvg} icon={<Star className="w-4 h-4" />} color="yellow" />
        <KpiCard label="Available" value={kpis.agentsAvailable} icon={<UserCheck className="w-4 h-4" />} color="green" />
        <KpiCard label="Busy" value={kpis.agentsBusy} icon={<Users className="w-4 h-4" />} color="orange" />
        <KpiCard label="Offline" value={kpis.agentsOffline} icon={<WifiOff className="w-4 h-4" />} color="zinc" />
      </div>

      {/* Two-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Queue (2/3 width) */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100">Live Queue</h2>
            <span className="text-xs text-zinc-500">{liveQueue.length} conversations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Conv #</th>
                  <th className="px-4 py-3 text-left">Channel</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Wait</th>
                  <th className="px-4 py-3 text-left">Agent</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Sent.</th>
                </tr>
              </thead>
              <tbody>
                {liveQueue.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-600">No active conversations</td>
                  </tr>
                )}
                {liveQueue.map(conv => (
                  <tr key={conv.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/contact-center/conversations/${conv.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                        {conv.conversationNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><ChannelBadge type={conv.channel.type} /></td>
                    <td className="px-4 py-3 text-zinc-300">
                      {conv.customer ? `${conv.customer.firstName} ${conv.customer.lastName}` : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 tabular-nums">{formatWait(conv.waitTimeSeconds)}</td>
                    <td className="px-4 py-3 text-zinc-400">{conv.agentName ?? <span className="text-zinc-600">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[conv.status] ?? STATUS_COLORS.open)}>
                        {conv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3"><SentimentDot v={conv.sentiment} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Channel Volume */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-zinc-500" />
              Channel Volume Today
            </h2>
            <div className="space-y-3">
              {channelVolume.map(ch => (
                <div key={ch.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">{ch.name}</span>
                    <span className="text-zinc-500 tabular-nums">{ch.count}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.round((ch.count / maxVol) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {channelVolume.length === 0 && (
                <p className="text-xs text-zinc-600">No channels configured</p>
              )}
            </div>
          </div>

          {/* Agent Presence Grid */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-zinc-500" />
              Agent Presence
            </h2>
            <div className="space-y-2">
              {presences.length === 0 && (
                <p className="text-xs text-zinc-600">No agents registered</p>
              )}
              {presences.map(p => {
                const caps = p.channelCapacities as Record<string, number> | null
                return (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-zinc-800/50 last:border-0">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {p.agentName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-zinc-900', PRESENCE_COLORS[p.status] ?? PRESENCE_COLORS.offline)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-200 truncate">{p.agentName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium border', PRESENCE_BADGE[p.status] ?? PRESENCE_BADGE.offline)}>
                          {p.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-zinc-600">{p.activeConversations} active</span>
                      </div>
                    </div>
                    {caps && (
                      <div className="text-[10px] text-zinc-600 text-right">
                        {Object.entries(caps).map(([k, v]) => (
                          <div key={k}>{k}: {v}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <Link href="/contact-center/agents" className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300">
              Manage agents →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    red: 'text-red-400 bg-red-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    green: 'text-green-400 bg-green-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    zinc: 'text-zinc-400 bg-zinc-500/10',
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mb-2', colorMap[color])}>
        {icon}
      </div>
      <div className="text-xl font-bold text-zinc-100 tabular-nums">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  )
}
