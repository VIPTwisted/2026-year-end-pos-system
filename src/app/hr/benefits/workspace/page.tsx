import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Heart, Users, CalendarDays, Clock, AlertTriangle, FileText, Plus, CheckCircle, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BenefitsWorkspacePage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const [
    enrolledCount,
    pendingElections,
    lifeEventsThisMonth,
    allPlans,
    allEnrollments,
    recentLifeEvents,
  ] = await Promise.all([
    prisma.benefitEnrollment.count(),
    prisma.lifeEvent.count({ where: { status: 'pending' } }),
    prisma.lifeEvent.count({ where: { eventDate: { gte: monthStart } } }),
    prisma.benefitPlan.findMany(),
    prisma.benefitEnrollment.findMany(),
    prisma.lifeEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { employee: true },
    }),
  ])

  const totalEmployees = await prisma.employee.count({ where: { isActive: true } })

  const kpis = [
    { label: 'Enrolled Employees', value: enrolledCount, icon: Users, color: 'text-blue-400' },
    { label: 'Open Enrollment Active', value: 0, icon: CalendarDays, color: 'text-green-400' },
    { label: 'Pending Elections', value: pendingElections, icon: Clock, color: 'text-yellow-400' },
    { label: 'Life Events This Month', value: lifeEventsThisMonth, icon: Heart, color: 'text-pink-400' },
    { label: 'Plans Expiring Soon', value: 0, icon: AlertTriangle, color: 'text-red-400' },
  ]

  const actions = [
    { label: 'Start Open Enrollment', href: '/hr/benefits/workspace', icon: CalendarDays, desc: 'Launch a new enrollment period' },
    { label: 'Process Life Event', href: '/hr/benefits/life-events/new', icon: Heart, desc: 'Record a qualifying life event' },
    { label: 'Review Pending Elections', href: '/hr/benefits/life-events', icon: CheckCircle, desc: 'Approve or deny pending requests' },
    { label: 'Generate Census Report', href: '/hr/benefits/workspace', icon: FileText, desc: 'Export enrollment census data' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="Benefits Workspace" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

        {/* Action Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((a) => (
            <Link key={a.label} href={a.href}
              className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 hover:border-blue-500/50 transition-colors group">
              <a.icon className="w-5 h-5 text-blue-400 mb-2" />
              <p className="font-medium text-sm">{a.label}</p>
              <p className="text-xs text-zinc-500 mt-1">{a.desc}</p>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 mt-2 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Enrollment Summary */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-zinc-200">Enrollment Summary</h2>
          {allPlans.length === 0 ? (
            <p className="text-zinc-500 text-sm">No benefit plans configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Plan Name</th>
                    <th className="pb-2 font-medium">Enrolled</th>
                    <th className="pb-2 font-medium">Eligible</th>
                    <th className="pb-2 font-medium">Coverage %</th>
                  </tr>
                </thead>
                <tbody>
                  {allPlans.map((plan) => {
                    const enrolled = allEnrollments.length
                    const coverage = totalEmployees > 0 ? Math.round((enrolled / totalEmployees) * 100) : 0
                    return (
                      <tr key={plan.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                        <td className="py-3 text-zinc-200">{(plan as any).name ?? plan.id}</td>
                        <td className="py-3">{enrolled}</td>
                        <td className="py-3">{totalEmployees}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${coverage}%` }} />
                            </div>
                            <span>{coverage}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Life Events */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-200">Recent Life Events</h2>
            <Link href="/hr/benefits/life-events/new"
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> New Life Event
            </Link>
          </div>
          {recentLifeEvents.length === 0 ? (
            <p className="text-zinc-500 text-sm">No life events recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Event Type</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLifeEvents.map((ev) => (
                    <tr key={ev.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-3 text-zinc-200">{ev.employee.firstName} {ev.employee.lastName}</td>
                      <td className="py-3 capitalize">{ev.eventType.replace(/_/g, ' ')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ev.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          ev.status === 'processed' ? 'bg-blue-500/20 text-blue-400' :
                          ev.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>{ev.status}</span>
                      </td>
                      <td className="py-3 text-zinc-400">{new Date(ev.eventDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
