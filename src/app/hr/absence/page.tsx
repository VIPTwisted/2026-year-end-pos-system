import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { UserX, Plus, ArrowRight, RotateCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'

const CAUSE_COLOR: Record<string, string> = {
  'Sick Leave':   'bg-red-500/20 text-red-400',
  'Vacation':     'bg-emerald-500/20 text-emerald-400',
  'Personal':     'bg-blue-500/20 text-blue-400',
  'Bereavement':  'bg-zinc-700/40 text-zinc-400',
  'FMLA':         'bg-purple-500/20 text-purple-400',
  'Other':        'bg-zinc-700/40 text-zinc-500',
}

export default async function AbsencePage() {
  const absences = await prisma.employeeAbsence.findMany({
    orderBy: { fromDate: 'desc' },
  })

  const stats = {
    total:    absences.length,
    sick:     absences.filter(a => a.causeOfAbsence === 'Sick Leave').length,
    vacation: absences.filter(a => a.causeOfAbsence === 'Vacation').length,
    totalDays: absences.filter(a => a.unitOfMeasure === 'Days').reduce((s, a) => s + a.qty, 0),
  }

  return (
    <>
      <TopBar title="Employee Absence" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Employee Absence</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{absences.length} records</p>
            </div>
            <Link href="/hr/absence/new">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
                <Plus className="w-3.5 h-3.5" /> New Absence
              </button>
            </Link>
          </div>

          {/* Action Ribbon */}
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-800/60">
            {[
              { label: 'New',             icon: Plus,      href: '/hr/absence/new', cls: 'bg-blue-600 hover:bg-blue-500 text-white' },
              { label: 'Register Return', icon: RotateCcw, href: '#',              cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
            ].map(({ label, icon: Icon, href, cls }) => (
              <Link key={label} href={href}>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-colors font-medium ${cls}`}>
                  <Icon className="w-3 h-3" /> {label}
                </button>
              </Link>
            ))}
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Records', value: String(stats.total),        color: 'text-zinc-100' },
              { label: 'Sick Leave',    value: String(stats.sick),         color: 'text-red-400' },
              { label: 'Vacation',      value: String(stats.vacation),     color: 'text-emerald-400' },
              { label: 'Total Days',    value: stats.totalDays.toFixed(1), color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          {absences.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12">
              <UserX className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500 mb-4">No absence records.</p>
              <Link href="/hr/absence/new">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                  <Plus className="w-3.5 h-3.5" /> New Absence
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Employee No.', 'Name', 'Cause of Absence', 'From Date', 'To Date', 'Qty', 'Unit', 'Return Date', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${h === 'Qty' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {absences.map(a => (
                      <tr key={a.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{a.employeeNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100">{a.employeeName ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${CAUSE_COLOR[a.causeOfAbsence] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {a.causeOfAbsence}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(a.fromDate)}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(a.toDate)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-100 tabular-nums font-semibold">{a.qty.toFixed(1)}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400">{a.unitOfMeasure}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-500 whitespace-nowrap">{a.returnDate ? formatDate(a.returnDate) : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                            Edit <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
