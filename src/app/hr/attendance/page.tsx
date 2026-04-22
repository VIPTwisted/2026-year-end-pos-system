import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Clock, Plus, Users, CalendarDays, Timer } from 'lucide-react'

function hoursWorked(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60))
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function attendanceStatus(shift: { startTime: Date; endTime: Date; status: string }) {
  if (shift.status === 'in_progress') {
    return { label: 'In Progress', cls: 'bg-amber-500/10 text-amber-400' }
  }
  if (shift.status === 'cancelled') {
    return { label: 'Absent', cls: 'bg-red-500/10 text-red-400' }
  }
  // Late = check-in after 9:00 AM
  const checkInHour = shift.startTime.getHours()
  const checkInMin  = shift.startTime.getMinutes()
  if (checkInHour > 9 || (checkInHour === 9 && checkInMin > 0)) {
    return { label: 'Late', cls: 'bg-amber-500/10 text-amber-400' }
  }
  return { label: 'Present', cls: 'bg-emerald-500/10 text-emerald-400' }
}

export default async function AttendancePage() {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [allShifts, todayShifts] = await Promise.all([
    prisma.shift.findMany({
      where: { startTime: { gte: monthStart } },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, position: true, department: true },
        },
      },
      orderBy: { startTime: 'desc' },
      take: 200,
    }),
    prisma.shift.findMany({
      where: { startTime: { gte: today } },
      select: { id: true, status: true },
    }),
  ])

  const presentToday = todayShifts.filter(s => s.status !== 'cancelled').length

  const totalRecordsMonth = allShifts.length

  const completedThisMonth = allShifts.filter(s => s.status === 'completed')
  const avgHours = completedThisMonth.length > 0
    ? completedThisMonth.reduce((sum, s) => sum + hoursWorked(s.startTime, s.endTime), 0) / completedThisMonth.length
    : 0

  const stats = [
    {
      label: "Today's Present",
      value: presentToday,
      icon: Users,
      color: 'text-emerald-400',
      sub: 'checked in today',
    },
    {
      label: 'Records This Month',
      value: totalRecordsMonth,
      icon: CalendarDays,
      color: 'text-blue-400',
      sub: 'shift records',
    },
    {
      label: 'Avg Hours / Day',
      value: `${avgHours.toFixed(1)}h`,
      icon: Timer,
      color: 'text-cyan-400',
      sub: 'completed shifts',
    },
  ]

  return (
    <>
      <TopBar
        title="Attendance"
        actions={
          <Link
            href="/hr/attendance/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Attendance
          </Link>
        }
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto bg-[#0f0f1a]">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Attendance</h1>
            <p className="text-[13px] text-zinc-500">Track employee check-ins and shift hours</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-zinc-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Attendance table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-zinc-100">Attendance Records</h2>
            <span className="text-[12px] text-zinc-500">Current month · {totalRecordsMonth} records</span>
          </div>

          {allShifts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-[13px] text-zinc-500">No attendance records this month.</p>
              <Link href="/hr/attendance/new" className="mt-3 inline-block text-[13px] text-blue-400 hover:underline">
                Log the first attendance
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Notes', 'Status'].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium first:pl-5 last:pr-5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allShifts.map(shift => {
                    const status = attendanceStatus(shift)
                    const isInProgress = shift.status === 'in_progress'
                    const hrs = isInProgress
                      ? '—'
                      : `${hoursWorked(shift.startTime, shift.endTime).toFixed(2)}h`
                    return (
                      <tr
                        key={shift.id}
                        className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="px-5 py-2.5">
                          <div className="font-medium text-zinc-100">
                            {shift.employee.firstName} {shift.employee.lastName}
                          </div>
                          <div className="text-[11px] text-zinc-500">{shift.employee.position}</div>
                        </td>
                        <td className="px-5 py-2.5 text-zinc-400">{fmtDate(shift.startTime)}</td>
                        <td className="px-5 py-2.5 font-mono text-zinc-300">{fmtTime(shift.startTime)}</td>
                        <td className="px-5 py-2.5 font-mono text-zinc-400">
                          {isInProgress ? (
                            <span className="text-amber-400 text-[11px]">Active</span>
                          ) : (
                            fmtTime(shift.endTime)
                          )}
                        </td>
                        <td className="px-5 py-2.5 font-mono text-zinc-300">{hrs}</td>
                        <td className="px-5 py-2.5 text-zinc-500 max-w-[160px] truncate">
                          {shift.notes ?? '—'}
                        </td>
                        <td className="px-5 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
