import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function CompensationPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const plan = await prisma.compensationPlan.findUnique({
    where: { id },
    include: {
      grades: { include: { steps: { orderBy: { stepNo: 'asc' } } } },
      employeeComps: {
        include: { grade: true },
        orderBy: { effectiveDate: 'desc' },
      },
    },
  })
  if (!plan) notFound()

  // Fetch employee names
  const empIds = [...new Set(plan.employeeComps.map(c => c.employeeId))]
  const employees = await prisma.employee.findMany({
    where: { id: { in: empIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  const FREQ_LABELS: Record<string, string> = {
    weekly: 'Weekly', biweekly: 'Bi-Weekly', semimonthly: 'Semi-Monthly',
    monthly: 'Monthly', annual: 'Annual',
  }

  return (
    <>
      <TopBar title={`Plan: ${plan.code}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">{plan.code}</h1>
              <Badge variant={plan.isActive ? 'success' : 'secondary'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>
              <span className="px-2 py-0.5 rounded text-xs border bg-zinc-800 text-zinc-400 capitalize">{plan.type}</span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 uppercase mb-1">Currency</p>
            <p className="text-lg font-bold text-zinc-100">{plan.currency}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 uppercase mb-1">Effective</p>
            <p className="text-lg font-bold text-zinc-100">{plan.effectiveDate ? new Date(plan.effectiveDate).toLocaleDateString() : '—'}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 uppercase mb-1">Expires</p>
            <p className="text-lg font-bold text-zinc-100">{plan.expirationDate ? new Date(plan.expirationDate).toLocaleDateString() : 'No expiry'}</p>
          </CardContent></Card>
        </div>

        {/* Grades & Steps */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 mb-3">Grades &amp; Steps ({plan.grades.length})</h2>
          {plan.grades.length === 0 ? (
            <p className="text-zinc-500 text-sm">No grades defined for this plan.</p>
          ) : (
            <div className="space-y-4">
              {plan.grades.map(grade => (
                <Card key={grade.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-mono text-blue-400 font-medium">{grade.gradeCode}</span>
                        {grade.description && <span className="ml-2 text-zinc-400 text-sm">{grade.description}</span>}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-zinc-500">Min: <span className="text-emerald-400">{formatCurrency(grade.minAmount)}</span></span>
                        <span className="text-zinc-500">Mid: <span className="text-zinc-200">{formatCurrency(grade.midAmount)}</span></span>
                        <span className="text-zinc-500">Max: <span className="text-red-400">{formatCurrency(grade.maxAmount)}</span></span>
                      </div>
                    </div>
                    {grade.steps.length > 0 && (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-zinc-700 text-zinc-500">
                            <th className="text-left pb-2">Step</th>
                            <th className="text-right pb-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {grade.steps.map(s => (
                            <tr key={s.id}>
                              <td className="py-1.5 text-zinc-400">Step {s.stepNo}</td>
                              <td className="py-1.5 text-right font-mono text-zinc-200">{formatCurrency(s.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Enrolled employees */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 mb-3">Enrolled Employees ({plan.employeeComps.length})</h2>
          {plan.employeeComps.length === 0 ? (
            <p className="text-zinc-500 text-sm">No employees assigned to this plan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3">Employee</th>
                    <th className="text-left pb-3">Grade</th>
                    <th className="text-center pb-3">Step</th>
                    <th className="text-right pb-3">Amount</th>
                    <th className="text-left pb-3">Frequency</th>
                    <th className="text-right pb-3">Annual Equiv.</th>
                    <th className="text-left pb-3">Effective</th>
                    <th className="text-left pb-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {plan.employeeComps.map(c => {
                    const mults: Record<string, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, annual: 1 }
                    const annual = c.amount * (mults[c.payFrequency] ?? 26)
                    return (
                      <tr key={c.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 font-medium text-zinc-100">{empMap[c.employeeId] ?? c.employeeId}</td>
                        <td className="py-3 pr-4 text-zinc-400">{c.grade?.gradeCode ?? '—'}</td>
                        <td className="py-3 pr-4 text-center text-zinc-400">{c.stepNo ?? '—'}</td>
                        <td className="py-3 pr-4 text-right font-mono text-emerald-400">{formatCurrency(c.amount)}</td>
                        <td className="py-3 pr-4 text-zinc-400">{FREQ_LABELS[c.payFrequency] ?? c.payFrequency}</td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{formatCurrency(annual)}</td>
                        <td className="py-3 pr-4 text-xs text-zinc-500">{new Date(c.effectiveDate).toLocaleDateString()}</td>
                        <td className="py-3 text-zinc-500 capitalize text-xs">{c.reason?.replace(/_/g, ' ') ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
