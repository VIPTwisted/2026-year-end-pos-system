import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Calendar } from 'lucide-react'
import { EmployeeActions } from './EmployeeActions'

const SHIFT_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  scheduled: 'default',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

export default async function EmployeeDetailPage({
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
      shifts: {
        include: { store: true },
        orderBy: { startTime: 'desc' },
        take: 10,
      },
    },
  })

  if (!employee) notFound()

  const now = new Date()
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000
  const tenureYears = Math.floor(
    (now.getTime() - new Date(employee.hireDate).getTime()) / msPerYear
  )
  const tenureLabel =
    tenureYears < 1 ? '< 1 yr' : `${tenureYears} yr${tenureYears !== 1 ? 's' : ''}`

  return (
    <>
      <TopBar title={`${employee.firstName} ${employee.lastName}`} />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Back link */}
        <div>
          <Link
            href="/hr/employees"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Employees
          </Link>
        </div>

        {/* Employee header card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={employee.isActive ? 'success' : 'destructive'}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-zinc-100">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">{employee.user.email}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Position</p>
                <p className="text-sm text-zinc-200">{employee.position}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Department</p>
                <p className="text-sm text-zinc-200">{employee.department ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Store</p>
                <p className="text-sm text-zinc-200">{employee.store.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Hire Date</p>
                <p className="text-sm text-zinc-200">{formatDate(employee.hireDate)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Tenure</p>
                <p className="text-sm text-zinc-200">{tenureLabel}</p>
              </div>
            </div>

            {/* Rate row */}
            {employee.hourlyRate != null && (
              <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-8">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Hourly Rate</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {formatCurrency(employee.hourlyRate)}/hr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Est. Annual Cost</p>
                  <p className="text-xl font-bold text-zinc-200">
                    {formatCurrency(employee.hourlyRate * 40 * 52)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit actions */}
        <EmployeeActions
          employee={{
            id: employee.id,
            position: employee.position,
            department: employee.department,
            hourlyRate: employee.hourlyRate,
            isActive: employee.isActive,
          }}
        />

        {/* Recent shifts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <h2 className="text-lg font-semibold text-zinc-100">Recent Shifts</h2>
            <span className="text-sm text-zinc-500">({employee.shifts.length})</span>
          </div>

          {employee.shifts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-10 text-zinc-500">
                <p className="text-sm">No shifts on record</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-left pb-3 font-medium">Start</th>
                    <th className="text-left pb-3 font-medium">End</th>
                    <th className="text-left pb-3 font-medium">Store</th>
                    <th className="text-left pb-3 font-medium">Notes</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {employee.shifts.map(s => (
                    <tr key={s.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 text-zinc-300 text-xs">
                        {new Date(s.startTime).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {new Date(s.startTime).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {new Date(s.endTime).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{s.store.name}</td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs">{s.notes ?? '—'}</td>
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
