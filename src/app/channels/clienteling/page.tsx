export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users2, CheckSquare, Clock, User, List, Mail, ChevronRight, AlertCircle } from 'lucide-react'

export default async function ChannelClientelingPage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)

  const [activeLists, tasksDueToday, allOpenTasks, contactedThisWeek, recentTasks, recentEntries] = await Promise.all([
    prisma.clientelingList.count({ where: { status: 'active' } }),
    prisma.associateTask.count({
      where: {
        status: 'open',
        dueDate: { lte: new Date(todayStart.getTime() + 86400000 - 1) },
      },
    }),
    prisma.associateTask.count({ where: { status: 'open' } }),
    prisma.clientActivity.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.associateTask.findMany({
      where: { status: 'open' },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      take: 10,
    }),
    prisma.clientelingEntry.findMany({
      include: { list: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const kpis = [
    { label: 'Active Lists', value: activeLists, icon: List, color: 'text-blue-400' },
    { label: 'Tasks Due Today', value: tasksDueToday, icon: AlertCircle, color: 'text-red-400' },
    { label: 'Open Tasks', value: allOpenTasks, icon: CheckSquare, color: 'text-amber-400' },
    { label: 'Contacted This Week', value: contactedThisWeek, icon: Mail, color: 'text-green-400' },
  ]

  const navLinks = [
    { href: '/clienteling', label: 'Clienteling Hub', icon: Users2 },
    { href: '/clienteling/lists', label: 'Client Lists', icon: List },
    { href: '/clienteling/customers', label: 'Customer 360', icon: User },
    { href: '/clienteling/tasks', label: 'Associate Tasks', icon: CheckSquare },
  ]

  const PRIORITY_BADGE: Record<string, string> = {
    high:   'bg-red-500/20 text-red-400 border border-red-500/30',
    normal: 'bg-zinc-700/50 text-zinc-300 border border-zinc-700',
    low:    'bg-zinc-800/50 text-zinc-500 border border-zinc-800',
  }

  const STATUS_BADGE: Record<string, string> = {
    pending:   'bg-zinc-700/50 text-zinc-400',
    contacted: 'bg-blue-500/20 text-blue-400',
    converted: 'bg-green-500/20 text-green-400',
    declined:  'bg-red-500/20 text-red-400',
  }

  const isOverdue = (dueDate: Date | null) =>
    dueDate ? new Date(dueDate) < new Date() : false

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Users2 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Clienteling</h1>
          <p className="text-xs text-zinc-500">NovaPOS Commerce — associate tasks, client lists, outreach</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Nav links */}
      <div className="grid grid-cols-4 gap-3">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 bg-[#16213e] border border-zinc-800/50 hover:border-purple-500/40 rounded-lg px-4 py-3 text-xs text-zinc-300 hover:text-zinc-100 transition-all group"
          >
            <Icon className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-medium">{label}</span>
            <ChevronRight className="w-3 h-3 ml-auto text-zinc-600 group-hover:text-purple-400 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Two-column: tasks + entries */}
      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* Associate tasks */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/50">
            <h2 className="text-sm font-semibold text-zinc-100">Open Associate Tasks</h2>
            <Link href="/clienteling/tasks" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CheckSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No open tasks</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/30">
              {recentTasks.map(task => (
                <div key={task.id} className="px-5 py-3 flex items-start gap-3">
                  <span className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.normal}`}>
                    {task.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-200 truncate">{task.subject}</div>
                    {task.customerName && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-zinc-600" />
                        <span className="text-xs text-zinc-500 truncate">{task.customerName}</span>
                      </div>
                    )}
                  </div>
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 shrink-0 text-xs ${isOverdue(task.dueDate) ? 'text-red-400' : 'text-zinc-500'}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client entries */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/50">
            <h2 className="text-sm font-semibold text-zinc-100">Recent Client Entries</h2>
            <Link href="/clienteling/lists" className="text-xs text-blue-400 hover:text-blue-300">View lists →</Link>
          </div>
          {recentEntries.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Users2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No client entries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/30">
              {recentEntries.map(entry => (
                <div key={entry.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-400">
                    {entry.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-200">{entry.customerName}</div>
                    <div className="text-xs text-zinc-500 truncate">
                      {entry.list?.name ?? 'No list'} {entry.customerEmail && `· ${entry.customerEmail}`}
                    </div>
                    {entry.lastContact && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <span className="text-xs text-zinc-600">
                          Last contact {new Date(entry.lastContact).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_BADGE[entry.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
