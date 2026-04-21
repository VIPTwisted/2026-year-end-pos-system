import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: {
      user: true,
      store: true,
    },
    orderBy: { lastName: 'asc' },
  })

  const activeCount = employees.filter(e => e.isActive).length
  const departments = new Set(employees.map(e => e.department).filter(Boolean))

  return (
    <>
      <TopBar title="Employees" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Employee Directory</h1>
            <p className="text-sm text-zinc-500">{employees.length} total employees</p>
          </div>
          <Link href="/hr/employees/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New Employee
            </Button>
          </Link>
        </div>

        {/* KPI cards */}
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
          {employees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Users className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No employees yet</p>
                <Link href="/hr/employees/new" className="mt-3">
                  <Button size="sm" variant="outline">Hire First Employee</Button>
                </Link>
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
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {employees.map(e => (
                    <tr key={e.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-medium text-zinc-100">
                        <Link
                          href={`/hr/employees/${e.id}`}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {e.lastName}, {e.firstName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{e.position}</td>
                      <td className="py-3 pr-4 text-zinc-400">{e.department ?? '—'}</td>
                      <td className="py-3 pr-4 text-zinc-400">{e.store.name}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{formatDate(e.hireDate)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400">
                        {e.hourlyRate != null ? `${formatCurrency(e.hourlyRate)}/hr` : '—'}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={e.isActive ? 'success' : 'destructive'}>
                          {e.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/hr/employees/${e.id}`}>
                          <Button size="sm" variant="ghost" className="text-xs">
                            View
                          </Button>
                        </Link>
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
