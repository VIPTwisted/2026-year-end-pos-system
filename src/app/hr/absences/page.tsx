import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { UserX, Plus, RotateCcw, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

const CAUSE_COLOR: Record<string, string> = {
  'Sick Leave':  'bg-red-500/20 text-red-400',
  'Vacation':    'bg-emerald-500/20 text-emerald-400',
  'Personal':    'bg-blue-500/20 text-blue-400',
  'Bereavement': 'bg-zinc-700/40 text-zinc-400',
  'FMLA':        'bg-purple-500/20 text-purple-400',
  'Jury Duty':   'bg-amber-500/20 text-amber-400',
  'Other':       'bg-zinc-700/40 text-zinc-500',
}

export default async function AbsencesPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string; cause?: string; from?: string; to?: string }>
}) {
  const sp = await searchParams
  const employeeId = sp.employeeId ?? ''
  const cause      = sp.cause ?? ''
  const from       = sp.from ?? ''
  const to         = sp.to ?? ''

  const absences = await prisma.employeeAbsence.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
      ...(cause      ? { causeOfAbsence: cause } : {}),
    },
    orderBy: { fromDate: 'desc' },
  })

  const filtered = absences.filter(a => {
    const matchFrom = !from || new Date(a.fromDate) >= new Date(from)
    const matchTo   = !to   || new Date(a.toDate)   <= new Date(to)
    return matchFrom && matchTo
  })

  const stats = {
    total:     filtered.length,
    sick:      filtered.filter(a => a.causeOfAbsence === 'Sick Leave').length,
    vacation:  filtered.filter(a => a.causeOfAbsence === 'Vacation').length,
    totalDays: filtered.reduce((s, a) => s + (a.qty ?? 0), 0),
  }

  const causes = Array.from(new Set(absences.map(a => a.causeOfAbsence)))

  return (
    <>
      <TopBar title="Employee Absence" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-4">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Human Resources</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Employee Absences</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{filtered.length} records</p>
            </div>
            <Link href="/hr/absences/new">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Absence
              </button>
            </Link>
          </div>

          {/* Ribbon */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800/60">
            {[
              { label: 'New',             href: '/hr/absences/new', primary: true },
              { label: 'Register Return', href: '#',                primary: false },
            ].map(({ label, href, primary }) => (
              <Link key={label} href={href}>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-colors font-medium ${primary ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'}`}>
                  {label === 'Register Return' && <RotateCcw className="w-3 h-3" />}
                  {label}
                </button>
              </Link>
            ))}
          </div>

          {/* Filters */}
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Cause</label>
              <select name="cause" defaultValue={cause} className="px-3 py-1.5 text-[12px] bg-[#16213e] border border-zinc-800/50 rounded-md text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                <option value="">All Causes</option>
                {causes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-zinc-500 mb-1">From Date</label>
              <input name="from" type="date" defaultValue={from} className="px-3 py-1.5 text-[12px] bg-[#16213e] border border-zinc-800/50 rounded-md text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-zinc-500 mb-1">To Date</label>
              <input name="to" type="date" defaultValue={to} className="px-3 py-1.5 text-[12px] bg-[#16213e] border border-zinc-800/50 rounded-md text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            {employeeId && <input type="hidden" name="employeeId" value={employeeId} />}
            <button type="submit" className="px-3 py-1.5 text-[11px] bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md font-medium">Filter</button>
            {(cause || from || to) && (
              <Link href={employeeId ? `/hr/absences?employeeId=${employeeId}` : '/hr/absences'}>
                <button type="button" className="px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 rounded-md">Clear</button>
              </Link>
            )}
          </form>

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
          {filtered.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12">
              <UserX className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500 mb-4">No absence records found.</p>
              <Link href="/hr/absences/new">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
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
                      {['Employee No.', 'Employee Name', 'Cause of Absence', 'From Date', 'To Date', 'Quantity (Days)', 'Unit', 'Return Date', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${h === 'Quantity (Days)' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {filtered.map(a => (
                      <tr key={a.id} className="hover:bg-[rgba(99,102,241,0.05)] transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{a.employeeNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100">{a.employeeName ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${CAUSE_COLOR[a.causeOfAbsence] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {a.causeOfAbsence}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(a.fromDate)}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(a.toDate)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-100 tabular-nums font-semibold">{(a.qty ?? 0).toFixed(1)}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400">{a.unitOfMeasure ?? 'Days'}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-500 whitespace-nowrap">{a.returnDate ? formatDate(a.returnDate) : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
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
