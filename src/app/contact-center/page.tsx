import { prisma } from '@/lib/prisma'
import SupervisorClient from './SupervisorClient'

export const dynamic = 'force-dynamic'

export default async function ContactCenterSupervisorPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    allToday,
    presences,
    channels,
  ] = await Promise.all([
    prisma.conversation.findMany({
      where: { startedAt: { gte: today } },
      include: {
        channel: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.agentPresence.findMany({ orderBy: { agentName: 'asc' } }),
    prisma.contactChannel.findMany({ where: { isActive: true } }),
  ])

  const active = allToday.filter(c => c.status === 'active').length
  const waiting = allToday.filter(c => c.status === 'waiting' || c.status === 'open').length
  const abandoned = allToday.filter(c => c.status === 'abandoned').length
  const waitTimes = allToday.filter(c => c.waitTimeSeconds > 0).map(c => c.waitTimeSeconds)
  const avgWait = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0
  const csats = allToday.filter(c => c.csat !== null).map(c => c.csat as number)
  const csatAvg = csats.length ? (csats.reduce((a, b) => a + b, 0) / csats.length).toFixed(1) : '—'

  const agentsAvailable = presences.filter(p => p.status === 'available').length
  const agentsBusy = presences.filter(p => p.status === 'busy').length
  const agentsOffline = presences.filter(p => p.status === 'offline' || p.status === 'away' || p.status === 'do_not_disturb' || p.status === 'on_break').length

  const channelVolume = channels.map(ch => ({
    id: ch.id,
    name: ch.name,
    type: ch.type,
    count: allToday.filter(c => c.channelId === ch.id).length,
  }))

  const liveQueue = allToday.filter(c => ['open', 'active', 'waiting', 'wrap_up'].includes(c.status))

  const kpis = { active, waiting, avgWait, abandoned, csatAvg, agentsAvailable, agentsBusy, agentsOffline }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <SupervisorClient
        kpis={kpis}
        liveQueue={liveQueue as unknown as Parameters<typeof SupervisorClient>[0]['liveQueue']}
        presences={presences}
        channelVolume={channelVolume}
      />
    </div>
  )
}
