import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function BenefitPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const plan = await prisma.benefitPlan.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { dependents: true },
        orderBy: { effectiveDate: 'desc' },
      },
    },
  })
  if (!plan) notFound()

  const empIds = plan.enrollments.map(e => e.employeeId)
  const employees = await prisma.employee.findMany({
    where: { id: { in: empIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
    active: 'success', pending: 'warning', terminated: 'destructive', waived: 'secondary',
  }

  return (
    <>
      <TopBar title={`Plan: ${plan.code}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{plan.name}</h1>
            <p className="text-sm text-zinc-500">{plan.code} &middot; {plan.planType} &middot; {plan.carrier ?? 'No carrier'}</p>
          </div>
          <Link href="/hr/benefits/enrollment/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />Enroll Employee
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Employee Cost', value: `${formatCurrency(plan.employeeCost)}/period` },
            { label: 'Employer Cost', value: `${formatCurrency(plan.employerCost)}/period`, color: 'text-emerald-400' },
            { label: 'Waiting Period', value: `${plan.waitingPeriodDays} days` },
            { label: 'Total Enrollments', value: plan.enrollments.length, color: 'text-blue-400' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-zinc-500 uppercase mb-1">{k.label}</p>
                <p className={`text-lg font-bold ${k.color ?? 'text-zinc-100'}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {plan.description && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-zinc-400">{plan.description}</p>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-sm font-semibold text-zinc-100 mb-3">Enrollments ({plan.enrollments.length})</h2>
          {plan.enrollments.length === 0 ? (
            <p className="text-zinc-500 text-sm">No enrollments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3">Employee</th>
                    <th className="text-left pb-3">Coverage</th>
                    <th className="text-right pb-3">Emp Cost</th>
                    <th className="text-right pb-3">Employer Cost</th>
                    <th className="text-left pb-3">Effective</th>
                    <th className="text-left pb-3">Terminates</th>
                    <th className="text-right pb-3">Dependents</th>
                    <th className="text-center pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {plan.enrollments.map(e => (
                    <tr key={e.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-medium text-zinc-100">{empMap[e.employeeId] ?? e.employeeId}</td>
                      <td className="py-3 pr-4 text-zinc-400 capitalize">{e.coverageType.replace(/_/g, ' ')}</td>
                      <td className="py-3 pr-4 text-right text-zinc-300">{formatCurrency(e.employeeCost)}</td>
                      <td className="py-3 pr-4 text-right text-emerald-400">{formatCurrency(e.employerCost)}</td>
                      <td className="py-3 pr-4 text-xs text-zinc-500">{new Date(e.effectiveDate).toLocaleDateString()}</td>
                      <td className="py-3 pr-4 text-xs text-zinc-500">{e.terminationDate ? new Date(e.terminationDate).toLocaleDateString() : '—'}</td>
                      <td className="py-3 pr-4 text-right text-zinc-400">{e.dependents.length}</td>
                      <td className="py-3 text-center">
                        <Badge variant={STATUS_VARIANT[e.status] ?? 'secondary'}>{e.status}</Badge>
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
