import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, CalendarOff, Clock, Users, Calendar } from 'lucide-react'

const STATUS_BADGE: Record<string, React.ReactNode> = {
  pending: <Badge variant="default">Pending</Badge>,
  approved: <Badge variant="success">Approved</Badge>,
  rejected: <Badge variant="destructive">Rejected</Badge>,
}

const TYPE_COLORS: Record<string, string> = {
  absence: 'bg-zinc-500/10 text-zinc-400',
  vacation: 'bg-blue-500/10 text-blue-400',
  sick: 'bg-red-500/10 text-red-400',
  maternity: 'bg-pink-500/10 text-pink-400',
  other: 'bg-zinc-700/30 text-zinc-500',
}

export default async function AbsencePage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [codes, registrations] = await Promise.all([
    prisma.absenceCode.findMany({
      orderBy: { code: 'asc' },
      include: {
        _count: { select: { registrations: true } },
        registrations: {
          where: { status: 'approved' },
          select: { quantity: true },
        },
      },
    }),
    prisma.absenceRegistration.findMany({
      include: { code: true },
      orderBy: { fromDate: 'desc' },
      take: 100,
    }),
  ])

  const absencesThisMonth = registrations.filter(r =>
    r.status === 'approved' &&
    new Date(r.fromDate) <= monthEnd &&
    new Date(r.toDate) >= monthStart
  )
  const totalDaysThisMonth = absencesThisMonth.reduce((sum, r) => { const q = r.quantity ?? 0; return sum + (r.unit === 'days' ? q : q / 8) }, 0)
  const pendingCount = registrations.filter(r => r.status === 'pending').length

  // Most common code
  const codeFreq = registrations.reduce<Record<string, { count: number; desc: string }>>((acc, r) => {
    acc[r.code.code] = {
      count: (acc[r.code.code]?.count ?? 0) + 1,
      desc: r.code.description ?? '',
    }
    return acc
  }, {})
  const mostCommon = Object.entries(codeFreq).sort((a, b) => b[1].count - a[1].count)[0]?.[0] ?? '—'

  // On leave today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const onLeaveToday = registrations.filter(r =>
    r.status === 'approved' &&
    new Date(r.fromDate) <= today &&
    new Date(r.toDate) >= today
  ).length

  return (
    <>
      <TopBar title="Absence Management" />
      <main className="flex-1 p-6 space-y-6 overflow-auto bg-[#0f0f1a]">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Days This Month', value: totalDaysThisMonth.toFixed(1), icon: CalendarOff, color: 'text-blue-400' },
            { label: 'Pending Approvals', value: pendingCount, icon: Clock, color: 'text-amber-400' },
            { label: 'Most Common Code', value: mostCommon, icon: Calendar, color: 'text-violet-400' },
            { label: 'On Leave Today', value: onLeaveToday, icon: Users, color: 'text-emerald-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-semibold text-zinc-100">Absence Management</h1>
          <Link
            href="/hr/absence/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Registration
          </Link>
        </div>

        {/* Absence Codes */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50">
            <h3 className="text-[18px] font-semibold text-zinc-100">Absence Codes</h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/50">
                {['Code', 'Description', 'Type', 'Paid', 'Total Registrations', 'Total Days Used'].map(h => (
                  <th key={h} className="px-5 pb-3 pt-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-500">No absence codes defined</td></tr>
              )}
              {codes.map(code => {
                const totalDays = code.registrations.reduce((sum, r) => sum + (r.quantity ?? 0), 0)
                return (
                  <tr key={code.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-2 font-mono text-zinc-300">{code.code}</td>
                    <td className="px-3 py-2 text-zinc-300">{code.description}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_COLORS[code.type] ?? 'bg-zinc-800 text-zinc-400'}`}>
                        {code.type}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {code.isPaid
                        ? <span className="text-emerald-400">Paid</span>
                        : <span className="text-zinc-500">Unpaid</span>}
                    </td>
                    <td className="px-3 py-2 text-zinc-400">{code._count.registrations}</td>
                    <td className="px-5 py-2 text-zinc-300">{totalDays.toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Registrations */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50">
            <h3 className="text-[18px] font-semibold text-zinc-100">Recent Registrations</h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/50">
                {['Employee ID', 'Code', 'From', 'To', 'Days', 'Unit', 'Status'].map(h => (
                  <th key={h} className="px-5 pb-3 pt-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-zinc-500">No registrations found</td></tr>
              )}
              {registrations.slice(0, 50).map(reg => (
                <tr key={reg.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-2 text-zinc-400 font-mono">{reg.employeeId.slice(0, 8)}…</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${TYPE_COLORS[reg.code.type] ?? ''}`}>
                      {reg.code.code}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-300">{new Date(reg.fromDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-zinc-300">{new Date(reg.toDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-zinc-300">{reg.quantity}</td>
                  <td className="px-3 py-2 text-zinc-400">{reg.unit}</td>
                  <td className="px-5 py-2">
                    {STATUS_BADGE[reg.status] ?? <Badge variant="outline">{reg.status}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
