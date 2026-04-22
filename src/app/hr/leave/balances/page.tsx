import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'

export default async function LeaveBalancesPage() {
  const enrollments = await prisma.leavePlanEnrollment.findMany({
    include: { plan: { include: { leaveType: true } } },
    orderBy: [{ employeeId: 'asc' }, { enrolledAt: 'asc' }],
  })

  const empIds = [...new Set(enrollments.map(e => e.employeeId))]
  const employees = await prisma.employee.findMany({
    where: { id: { in: empIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  // Group by employee
  const byEmployee: Record<string, typeof enrollments> = {}
  for (const e of enrollments) {
    if (!byEmployee[e.employeeId]) byEmployee[e.employeeId] = []
    byEmployee[e.employeeId].push(e)
  }

  return (
    <>
      <TopBar title="Leave Balances" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Leave Balances</h1>
          <p className="text-sm text-zinc-500">All employee leave plan balances</p>
        </div>

        {Object.keys(byEmployee).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <p className="text-sm">No leave plan enrollments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(byEmployee).map(([empId, emps]) => (
              <div key={empId}>
                <h2 className="text-sm font-semibold text-zinc-200 mb-2">{empMap[empId] ?? empId}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="text-left pb-2">Leave Type</th>
                        <th className="text-left pb-2">Plan</th>
                        <th className="text-right pb-2">Balance (hrs)</th>
                        <th className="text-right pb-2">Used YTD</th>
                        <th className="text-right pb-2">Pending</th>
                        <th className="text-right pb-2">Available</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {emps.map(e => {
                        const available = Math.max(0, e.balance - e.pendingHours)
                        return (
                          <tr key={e.id} className="hover:bg-zinc-900/50">
                            <td className="py-2 pr-4 text-zinc-300">{e.plan.leaveType.name}</td>
                            <td className="py-2 pr-4 text-zinc-400">{e.plan.name}</td>
                            <td className="py-2 pr-4 text-right text-zinc-200 font-medium">{e.balance.toFixed(1)}h</td>
                            <td className="py-2 pr-4 text-right text-red-400">{e.usedYtd.toFixed(1)}h</td>
                            <td className="py-2 pr-4 text-right text-amber-400">{e.pendingHours.toFixed(1)}h</td>
                            <td className="py-2 text-right font-bold text-emerald-400">{available.toFixed(1)}h</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
