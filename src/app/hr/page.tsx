import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar } from 'lucide-react'

const SHIFT_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  scheduled: 'default',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

export default async function HRPage() {
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

  return (
    <>
      <TopBar title="HR & Workforce" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
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
        </div>

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
                    <th className="text-right pb-3 font-medium">Hourly Rate</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {employees.map(e => (
                    <tr key={e.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-medium text-zinc-100">
                        {e.lastName}, {e.firstName}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{e.position}</td>
                      <td className="py-3 pr-4 text-zinc-400">{e.department || '—'}</td>
                      <td className="py-3 pr-4 text-zinc-400">{e.store.name}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(e.hireDate)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400">
                        {e.hourlyRate != null ? `${formatCurrency(e.hourlyRate)}/hr` : '—'}
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={e.isActive ? 'success' : 'destructive'}>
                          {e.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
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
