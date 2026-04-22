import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const EVENT_COLORS: Record<string, string> = {
  marriage: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  divorce: 'bg-red-500/10 text-red-400 border-red-500/20',
  birth: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  adoption: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  death: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  employment_change: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  address_change: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  pending: 'warning', processed: 'success', denied: 'destructive',
}

export default async function LifeEventsPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [allEvents, processedThisMonth] = await Promise.all([
    prisma.lifeEvent.findMany({ orderBy: { eventDate: 'desc' } }),
    prisma.lifeEvent.count({ where: { status: 'processed', processedAt: { gte: monthStart } } }),
  ])

  const pending = allEvents.filter(e => e.status === 'pending').length
  const eventTypeBreakdown = allEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.eventType] = (acc[e.eventType] ?? 0) + 1
    return acc
  }, {})

  const empIds = [...new Set(allEvents.map(e => e.employeeId))]
  const employees = await prisma.employee.findMany({
    where: { id: { in: empIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  return (
    <>
      <TopBar title="Life Events" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Life Events</h1>
          <p className="text-sm text-zinc-500">QLE tracking — marriage, birth, divorce, employment changes</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 uppercase mb-1">Pending</p>
            <p className={`text-2xl font-bold ${pending > 0 ? 'text-red-400' : 'text-zinc-100'}`}>{pending}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 uppercase mb-1">Processed This Month</p>
            <p className="text-2xl font-bold text-emerald-400">{processedThisMonth}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 uppercase mb-1">Total Events</p>
            <p className="text-2xl font-bold text-zinc-100">{allEvents.length}</p>
          </CardContent></Card>
        </div>

        {/* Event type breakdown */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">By Event Type</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(eventTypeBreakdown).map(([type, count]) => (
                <span key={type} className={`px-3 py-1 rounded-lg text-xs border font-medium capitalize ${EVENT_COLORS[type] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
                  {type.replace(/_/g, ' ')} ({count})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events table */}
        {allEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <p className="text-sm">No life events recorded</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3">Employee</th>
                  <th className="text-left pb-3">Event Type</th>
                  <th className="text-left pb-3">Event Date</th>
                  <th className="text-left pb-3">Description</th>
                  <th className="text-center pb-3">Status</th>
                  <th className="text-left pb-3">Processed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {allEvents.map(ev => (
                  <tr key={ev.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-medium text-zinc-100">{empMap[ev.employeeId] ?? ev.employeeId}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs border capitalize ${EVENT_COLORS[ev.eventType] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
                        {ev.eventType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">{new Date(ev.eventDate).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{ev.description ?? '—'}</td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={STATUS_VARIANT[ev.status] ?? 'secondary'}>{ev.status}</Badge>
                    </td>
                    <td className="py-3 text-xs text-zinc-500">{ev.processedAt ? new Date(ev.processedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
