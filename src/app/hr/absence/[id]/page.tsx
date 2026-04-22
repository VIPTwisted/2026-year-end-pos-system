import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import AbsenceEmployeeActions from './AbsenceEmployeeActions'

// Per-employee absence view — shows the employee's calendar + summary for current year
const TYPE_COLORS: Record<string, string> = {
  absence: 'bg-zinc-500/40',
  vacation: 'bg-blue-500/50',
  sick: 'bg-red-500/40',
  maternity: 'bg-pink-500/40',
  other: 'bg-zinc-700/40',
}

const STATUS_BADGE: Record<string, React.ReactNode> = {
  pending: <Badge variant="default">Pending</Badge>,
  approved: <Badge variant="success">Approved</Badge>,
  rejected: <Badge variant="destructive">Rejected</Badge>,
}

export default async function AbsenceEmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const { id: employeeId } = await params
  const { month, year } = await searchParams

  const now = new Date()
  const viewYear = parseInt(year ?? String(now.getFullYear()))
  const viewMonth = parseInt(month ?? String(now.getMonth())) // 0-based

  // Fetch employee
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) notFound()

  // All registrations for this employee this year
  const yearStart = new Date(viewYear, 0, 1)
  const yearEnd = new Date(viewYear, 11, 31, 23, 59, 59)

  const registrations = await prisma.absenceRegistration.findMany({
    where: {
      employeeId,
      fromDate: { gte: yearStart },
      toDate: { lte: yearEnd },
    },
    include: { code: true },
    orderBy: { fromDate: 'asc' },
  })

  // Summary per code
  const summaryMap = new Map<string, { code: string; type: string; days: number }>()
  for (const reg of registrations.filter(r => r.status === 'approved')) {
    const key = reg.code.code
    const existing = summaryMap.get(key)
    const qty = reg.quantity ?? 0
    const days = reg.unit === 'days' ? qty : qty / 8
    if (existing) existing.days += days
    else summaryMap.set(key, { code: key, type: reg.code.type, days })
  }

  // Build calendar for current month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay() // 0=Sun

  // Map of day → color for the month
  const dayColorMap = new Map<number, string>()
  for (const reg of registrations.filter(r => r.status === 'approved')) {
    const from = new Date(reg.fromDate)
    const to = new Date(reg.toDate)
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        dayColorMap.set(d.getDate(), TYPE_COLORS[reg.code.type] ?? 'bg-zinc-700/40')
      }
    }
  }

  const calendarCells = Array(firstDayOfWeek).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  )

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <>
      <TopBar title={`Absence — ${employee.firstName} ${employee.lastName}`} />
      <main className="flex-1 p-6 space-y-6 overflow-auto bg-[#0f0f1a] max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="col-span-2 bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">{MONTH_NAMES[viewMonth]} {viewYear}</h3>
              <div className="flex gap-2">
                <a
                  href={`?month=${viewMonth === 0 ? 11 : viewMonth - 1}&year=${viewMonth === 0 ? viewYear - 1 : viewYear}`}
                  className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 hover:text-zinc-100"
                >←</a>
                <a
                  href={`?month=${viewMonth === 11 ? 0 : viewMonth + 1}&year=${viewMonth === 11 ? viewYear + 1 : viewYear}`}
                  className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 hover:text-zinc-100"
                >→</a>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-xs text-zinc-500 font-medium py-1">{d}</div>
              ))}
              {calendarCells.map((day, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                    ${day == null ? '' : dayColorMap.has(day) ? dayColorMap.get(day) + ' text-white' : 'bg-zinc-800/30 text-zinc-500'}
                    ${day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear() ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  {day ?? ''}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-zinc-800">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-xs text-zinc-400 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Year Summary ({viewYear})</h3>
              {summaryMap.size === 0 ? (
                <p className="text-zinc-500 text-xs">No approved absences</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(summaryMap.values()).map(s => (
                    <div key={s.code} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[s.type] ?? ''}`} />
                        <span className="text-xs text-zinc-300">{s.code}</span>
                      </div>
                      <span className="text-xs font-medium text-zinc-100">{s.days.toFixed(1)} days</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registrations List */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-300">All Registrations</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80 border-b border-zinc-800">
              <tr>
                {['Code', 'From', 'To', 'Qty', 'Unit', 'Description', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {registrations.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-zinc-500">No registrations</td></tr>
              )}
              {registrations.map(reg => (
                <tr key={reg.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[reg.code.type] ?? ''} text-zinc-200`}>
                      {reg.code.code}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-300 text-xs">{new Date(reg.fromDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-zinc-300 text-xs">{new Date(reg.toDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-zinc-300">{reg.quantity}</td>
                  <td className="px-4 py-2 text-zinc-400 text-xs">{reg.unit}</td>
                  <td className="px-4 py-2 text-zinc-400 text-xs max-w-[150px] truncate">{reg.description ?? '—'}</td>
                  <td className="px-4 py-2">
                    {STATUS_BADGE[reg.status] ?? <Badge variant="outline">{reg.status}</Badge>}
                  </td>
                  <td className="px-4 py-2">
                    {reg.status === 'pending' && (
                      <AbsenceEmployeeActions regId={reg.id} />
                    )}
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
