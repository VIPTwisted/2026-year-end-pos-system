import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Heart, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LifeEventsPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [events, pending, approved, processedThisMonth, expired] = await Promise.all([
    prisma.lifeEvent.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    }),
    prisma.lifeEvent.count({ where: { status: 'pending' } }),
    prisma.lifeEvent.count({ where: { status: 'approved' } }),
    prisma.lifeEvent.count({ where: { status: 'processed', processedAt: { gte: monthStart } } }),
    prisma.lifeEvent.count({ where: { status: 'expired' } }),
  ])

  const kpis = [
    { label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-400' },
    { label: 'Approved', value: approved, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Processed This Month', value: processedThisMonth, icon: Heart, color: 'text-blue-400' },
    { label: 'Expired', value: expired, icon: XCircle, color: 'text-red-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="Life Events" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-400">{k.label}</span>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-200">Life Events</h2>
            <Link href="/hr/benefits/life-events/new"
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> New Life Event
            </Link>
          </div>
          {events.length === 0 ? (
            <p className="text-zinc-500 text-sm">No life events recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Event Type</th>
                    <th className="pb-2 font-medium">Event Date</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Days Since</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => {
                    const daysSince = Math.floor((now.getTime() - new Date(ev.eventDate).getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <tr key={ev.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                        <td className="py-3">
                          <Link href={`/hr/benefits/life-events/${ev.id}`} className="text-blue-400 hover:underline">
                            {ev.employee.firstName} {ev.employee.lastName}
                          </Link>
                        </td>
                        <td className="py-3 capitalize text-zinc-300">{ev.eventType.replace(/_/g, ' ')}</td>
                        <td className="py-3 text-zinc-400">{new Date(ev.eventDate).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            ev.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            ev.status === 'processed' ? 'bg-blue-500/20 text-blue-400' :
                            ev.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                            ev.status === 'in_review' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>{ev.status.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="py-3 text-zinc-400">{daysSince}d</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
