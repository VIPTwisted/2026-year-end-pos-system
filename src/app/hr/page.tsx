export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar } from 'lucide-react'

const SHIFT_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  scheduled: 'default',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

export default async function HRPage() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const [employees, shifts] = await Promise.all([
    prisma.employee.findMany({
      include: { store: true },
      orderBy: { lastName: 'asc' },
    }),
    prisma.shift.findMany({
      include: { employee: true, store: true },
      orderBy: { startTime: 'asc' },
      take: 50,
    }),
  ])

  const activeCount = employees.filter(e => e.isActive).length
  const departments = new Set(employees.map(e => e.department).filter(Boolean))

  // Avg Hourly Rate
  const empWithRate = employees.filter(e => e.hourlyRate != null)
  const avgHourlyRate =
    empWithRate.length > 0
      ? empWithRate.reduce((sum, e) => sum + (e.hourlyRate as number), 0) / empWithRate.length
      : null

  // Scheduled shifts today
  const shiftsToday = shifts.filter(
    s => s.startTime >= todayStart && s.startTime < todayEnd
  ).length

  // Workforce breakdown — by department
  const byDept = employees.reduce<Record<string, number>>((acc, e) => {
    const key = e.department || 'Unassigned'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  // Workforce breakdown — by store
  const byStore = employees.reduce<Record<string, number>>((acc, e) => {
    const key = e.store.name
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const storeCount = Object.keys(byStore).length

  return (
    <>
      <TopBar title="HR & Workforce" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Actions header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">HR & Workforce</h1>
            <p className="text-sm text-zinc-500">Overview, shifts, and employee management</p>
          </div>
          <Link href="/hr/employees">
            <Button size="sm" variant="outline">
              <Users className="w-4 h-4 mr-1.5" />
              Manage Employees
            </Button>
          </Link>
        </div>

        {/* KPI row — 5 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Employees</p>
              <p className="text-2xl font-bold text-zinc-100">{employees.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active</p>
              <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Departments</p>
              <p className="text-2xl font-bold text-zinc-100">{departments.size}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Avg Hourly Rate</p>
              <p className="text-2xl font-bold text-emerald-400">
                {avgHourlyRate != null ? `${formatCurrency(avgHourlyRate)}/hr` : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Shifts Today</p>
              <p className="text-2xl font-bold text-zinc-100">{shiftsToday}</p>
            </CardContent>
          </Card>
        </div>

        {/* Workforce Summary — NovaPOS HR analytics pattern */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wide">
                  Workforce Summary
                </h3>
                <span className="text-xs text-zinc-500">
                  {employees.length} employees across {storeCount} {storeCount === 1 ? 'store' : 'stores'}
                </span>
              </div>

              {/* By Department */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">By Department</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(byDept)
                    .sort((a, b) => b[1] - a[1])
                    .map(([dept, count]) => (
                      <span
                        key={dept}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
                      >
                        <span className="font-medium">{dept}</span>
                        <span className="text-zinc-500">{count}</span>
                      </span>
                    ))}
                </div>
              </div>

              {/* By Store */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">By Store</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(byStore)
                    .sort((a, b) => b[1] - a[1])
                    .map(([store, count]) => (
                      <span
                        key={store}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
                      >
                        <span className="font-medium">{store}</span>
                        <span className="text-zinc-500">{count}</span>
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees table */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Employees</h2>
            <p className="text-sm text-zinc-500">{employees.length} total</p>
          </div>

          {employees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Users className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No employees found — add staff to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Position</th>
                    <th className="text-left pb-3 font-medium">Department</th>
                    <th className="text-left pb-3 font-medium">Store</th>
                    <th className="text-left pb-3 font-medium">Hire Date</th>
                    <th className="text-left pb-3 font-medium">Tenure</th>
                    <th className="text-right pb-3 font-medium">Hourly Rate</th>
                    <th className="text-right pb-3 font-medium">Annual Cost</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {employees.map(e => {
                    const msPerYear = 365.25 * 24 * 60 * 60 * 1000
                    const tenureYears = Math.floor(
                      (now.getTime() - new Date(e.hireDate).getTime()) / msPerYear
                    )
                    const tenureLabel = tenureYears < 1 ? '< 1 yr' : `${tenureYears} yr${tenureYears !== 1 ? 's' : ''}`
                    const annualCost = e.hourlyRate != null ? e.hourlyRate * 40 * 52 : null

                    return (
                      <tr key={e.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 font-medium text-zinc-100">
                          {e.lastName}, {e.firstName}
                        </td>
                        <td className="py-3 pr-4 text-zinc-400">{e.position}</td>
                        <td className="py-3 pr-4 text-zinc-400">{e.department || '—'}</td>
                        <td className="py-3 pr-4 text-zinc-400">{e.store.name}</td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(e.hireDate)}</td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{tenureLabel}</td>
                        <td className="py-3 pr-4 text-right font-semibold text-emerald-400">
                          {e.hourlyRate != null ? `${formatCurrency(e.hourlyRate)}/hr` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-300">
                          {annualCost != null ? formatCurrency(annualCost) : '—'}
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={e.isActive ? 'success' : 'destructive'}>
                            {e.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming shifts */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Upcoming Shifts</h2>
            <p className="text-sm text-zinc-500">{shifts.length} shifts</p>
          </div>

          {shifts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Calendar className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No shifts scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Employee</th>
                    <th className="text-left pb-3 font-medium">Store</th>
                    <th className="text-left pb-3 font-medium">Start</th>
                    <th className="text-left pb-3 font-medium">End</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {shifts.map(s => (
                    <tr key={s.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-medium text-zinc-100">
                        {s.employee.lastName}, {s.employee.firstName}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{s.store.name}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(s.startTime)}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(s.endTime)}</td>
                      <td className="py-3 text-center">
                        <Badge variant={SHIFT_VARIANT[s.status] ?? 'secondary'}>
                          {s.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
