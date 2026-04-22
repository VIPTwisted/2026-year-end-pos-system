import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, User, ChevronDown } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  Active:   'bg-emerald-500/20 text-emerald-400',
  Inactive: 'bg-zinc-700/40 text-zinc-400',
}

export default async function EmployeeCardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: true,
      store: true,
      shifts: { orderBy: { startTime: 'desc' }, take: 5 },
    },
  })

  if (!employee) notFound()

  // Fetch absences via raw query (table may not be in generated Prisma client for some builds)
  let absences: Array<{ causeOfAbsence: string; fromDate: string; toDate: string; qty: number; unitOfMeasure: string }> = []
  try {
    absences = await (prisma as any).employeeAbsence.findMany({
      where: { employeeId: id },
      orderBy: { fromDate: 'desc' },
      take: 10,
    })
  } catch { /* table may not exist yet */ }

  const now = new Date()
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000
  const tenureYears = Math.floor((now.getTime() - new Date(employee.hireDate).getTime()) / msPerYear)
  const tenureLabel = tenureYears < 1 ? '< 1 yr' : `${tenureYears} yr${tenureYears !== 1 ? 's' : ''}`

  const totalAbsenceDays = absences.reduce((s, a) => s + (a.qty ?? 0), 0)
  const vacationDays = absences.filter(a => a.causeOfAbsence === 'Vacation').reduce((s, a) => s + (a.qty ?? 0), 0)
  const eStatus = employee.isActive ? 'Active' : 'Inactive'

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-0.5">{label}</p>
      <p className="text-[13px] text-zinc-200">{value}</p>
    </div>
  )

  return (
    <>
      <TopBar title={`${employee.firstName} ${employee.lastName}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 flex gap-5">

          {/* Main content */}
          <div className="flex-1 space-y-4 min-w-0">

            <div className="flex items-center gap-3">
              <Link href="/hr/employees" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Employees
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="text-[12px] text-zinc-400">{employee.lastName}, {employee.firstName}</span>
            </div>

            {/* Header */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-zinc-800/60 border border-zinc-700/50 rounded-xl flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLOR[eStatus]}`}>
                      {eStatus}
                    </span>
                  </div>
                  <h1 className="text-[20px] font-bold text-zinc-100">{employee.firstName} {employee.lastName}</h1>
                  <p className="text-[12px] text-zinc-500 mt-0.5">{employee.user?.email ?? '—'}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/hr/employees/${id}/edit`}>
                    <button className="px-3 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md font-medium transition-colors">Edit</button>
                  </Link>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md font-medium transition-colors">
                    Navigate <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-zinc-800/50">
                <Field label="Job Title"        value={employee.position} />
                <Field label="Department"       value={employee.department ?? '—'} />
                <Field label="Store"            value={employee.store?.name ?? '—'} />
                <Field label="Employment Date"  value={formatDate(employee.hireDate)} />
                <Field label="Tenure"           value={tenureLabel} />
              </div>
            </div>

            {/* FastTabs: General */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50">
                <h3 className="text-[13px] font-semibold text-zinc-200">General</h3>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="First Name"       value={employee.firstName} />
                <Field label="Last Name"        value={employee.lastName} />
                <Field label="Employment Type"  value="Full-Time" />
                <Field label="Department"       value={employee.department ?? '—'} />
                <Field label="Hourly Rate"      value={employee.hourlyRate != null ? `$${employee.hourlyRate.toFixed(2)}/hr` : '—'} />
                <Field label="Est. Annual Cost" value={employee.hourlyRate != null ? `$${(employee.hourlyRate * 40 * 52).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'} />
              </div>
            </div>

            {/* FastTabs: Communication */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50">
                <h3 className="text-[13px] font-semibold text-zinc-200">Communication</h3>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Email"  value={employee.user?.email ?? '—'} />
                <Field label="Phone"  value="—" />
                <Field label="Mobile" value="—" />
              </div>
            </div>

            {/* Employee Ledger Entries placeholder */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-zinc-200">Employee Ledger Entries</h3>
                <Link href={`/hr/absences?employeeId=${id}`} className="text-[11px] text-indigo-400 hover:text-indigo-300">View All</Link>
              </div>
              <div className="overflow-x-auto">
                {absences.length === 0 ? (
                  <p className="px-5 py-6 text-[12px] text-zinc-500">No absence entries recorded.</p>
                ) : (
                  <table className="w-full">
                    <thead className="border-b border-zinc-800/60">
                      <tr>
                        {['Cause of Absence', 'From Date', 'To Date', 'Qty', 'Unit'].map(h => (
                          <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {absences.map((a, i) => (
                        <tr key={i} className="hover:bg-[rgba(99,102,241,0.05)] transition-colors">
                          <td className="px-4 py-3 text-[12px] text-zinc-200">{a.causeOfAbsence}</td>
                          <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{a.fromDate ? formatDate(new Date(a.fromDate)) : '—'}</td>
                          <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{a.toDate ? formatDate(new Date(a.toDate)) : '—'}</td>
                          <td className="px-4 py-3 text-[12px] text-zinc-100 tabular-nums font-semibold text-right">{(a.qty ?? 0).toFixed(1)}</td>
                          <td className="px-4 py-3 text-[11px] text-zinc-400">{a.unitOfMeasure ?? 'Days'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* FactBox panel */}
          <div className="w-64 shrink-0 space-y-3">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/50">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Employee Statistics</h4>
              </div>
              <div className="px-4 py-3 space-y-3">
                {[
                  { label: 'Vacation Days Used', value: vacationDays.toFixed(1), color: 'text-emerald-400' },
                  { label: 'Total Absence Days',  value: totalAbsenceDays.toFixed(1), color: 'text-amber-400' },
                  { label: 'Absence Records',     value: String(absences.length), color: 'text-zinc-100' },
                  { label: 'Tenure',              value: tenureLabel, color: 'text-indigo-300' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <p className="text-[11px] text-zinc-500">{label}</p>
                    <p className={`text-[13px] font-bold tabular-nums ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/50">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Navigate</h4>
              </div>
              <div className="px-4 py-2 space-y-0.5">
                {[
                  { label: 'Absences',       href: `/hr/absences?employeeId=${id}` },
                  { label: 'Qualifications', href: `/hr/qualifications?employeeId=${id}` },
                  { label: 'Ledger Entries', href: `/hr/absences?employeeId=${id}` },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} className="block px-2 py-2 text-[12px] text-zinc-400 hover:text-indigo-300 hover:bg-[rgba(99,102,241,0.05)] rounded-md transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
