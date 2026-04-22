import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Users, Plus, ChevronRight, ChevronDown, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  Active:     'bg-emerald-500/20 text-emerald-400',
  Terminated: 'bg-red-500/20 text-red-400',
  Inactive:   'bg-zinc-700/40 text-zinc-400',
}

export default async function EmployeesListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; status?: string; type?: string }>
}) {
  const sp = await searchParams
  const q      = sp.q?.toLowerCase() ?? ''
  const dept   = sp.dept ?? ''
  const status = sp.status ?? ''
  const empType = sp.type ?? ''

  const raw = await prisma.employee.findMany({
    include: { user: true, store: true },
    orderBy: { lastName: 'asc' },
  })

  const employees = raw.filter(e => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase()
    const matchQ    = !q || fullName.includes(q) || (e.user?.email ?? '').toLowerCase().includes(q)
    const matchDept = !dept || (e.department ?? '') === dept
    const eStatus   = e.isActive ? 'Active' : 'Inactive'
    const matchStat = !status || eStatus === status
    const matchType = !empType || (e.position ?? '').toLowerCase().includes(empType.toLowerCase())
    return matchQ && matchDept && matchStat && matchType
  })

  const departments = Array.from(new Set(raw.map(e => e.department).filter(Boolean))) as string[]
  const activeCount = raw.filter(e => e.isActive).length

  return (
    <>
      <TopBar title="Employees" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-4">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Human Resources</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Employees</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{raw.length} total · {activeCount} active</p>
            </div>
            <Link href="/hr/employees/new">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </Link>
          </div>

          {/* Ribbon */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800/60">
            {[
              { label: 'New',    href: '/hr/employees/new', primary: true },
            ].map(({ label, href, primary }) => (
              <Link key={label} href={href}>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-colors font-medium ${primary ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'}`}>
                  {label}
                </button>
              </Link>
            ))}
            <div className="ml-2 relative">
              <button className="flex items-center gap-1 px-3 py-1.5 text-[11px] rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium">
                Navigate <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Filter pane */}
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search name or email…"
                className="pl-8 pr-3 py-1.5 text-[12px] bg-[#16213e] border border-zinc-800/50 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-52"
              />
            </div>
            <select
              name="dept"
              defaultValue={dept}
              className="px-3 py-1.5 text-[12px] bg-[#16213e] border border-zinc-800/50 rounded-md text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-1.5 text-[12px] bg-[#16213e] border border-zinc-800/50 rounded-md text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Terminated">Terminated</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 text-[11px] bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md font-medium"
            >
              Filter
            </button>
            {(q || dept || status) && (
              <Link href="/hr/employees">
                <button type="button" className="px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 rounded-md">
                  Clear
                </button>
              </Link>
            )}
          </form>

          {/* Table */}
          {employees.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14">
              <Users className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500 mb-4">No employees found.</p>
              <Link href="/hr/employees/new">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
                  <Plus className="w-3.5 h-3.5" /> New Employee
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['No.', 'Full Name', 'Job Title', 'Department', 'Employment Type', 'Employment Date', 'Status', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {employees.map((e, idx) => {
                      const employeeNo = `EMP${String(idx + 1).padStart(4, '0')}`
                      const eStatus = e.isActive ? 'Active' : 'Inactive'
                      return (
                        <tr key={e.id} className="hover:bg-[rgba(99,102,241,0.05)] transition-colors group">
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{employeeNo}</td>
                          <td className="px-4 py-3 text-[13px] text-zinc-100 font-medium">
                            <Link href={`/hr/employees/${e.id}`} className="hover:text-indigo-300 transition-colors">
                              {e.lastName}, {e.firstName}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-zinc-400">{e.position}</td>
                          <td className="px-4 py-3 text-[12px] text-zinc-400">{e.department ?? '—'}</td>
                          <td className="px-4 py-3 text-[12px] text-zinc-400">Full-Time</td>
                          <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(e.hireDate)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[eStatus] ?? 'bg-zinc-700/40 text-zinc-400'}`}>
                              {eStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/hr/employees/${e.id}`}>
                              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
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
