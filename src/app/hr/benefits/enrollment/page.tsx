export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

export default async function BenefitEnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const where = status ? { status } : {}

  const enrollments = await prisma.benefitEnrollment.findMany({
    where,
    include: { plan: true },
    orderBy: { effectiveDate: 'desc' },
  })

  const empIds = [...new Set(enrollments.map(e => e.employeeId))]
  const employees = await prisma.employee.findMany({
    where: { id: { in: empIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  const STATUSES = ['active', 'pending', 'terminated', 'waived']
  const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
    active: 'success', pending: 'warning', terminated: 'destructive', waived: 'secondary',
  }

  return (
    <>
      <TopBar title="Benefit Enrollments" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Benefit Enrollments</h1>
            <p className="text-sm text-zinc-500">{enrollments.length} enrollments{status ? ` — ${status}` : ''}</p>
          </div>
          <Link
            href="/hr/benefits/enrollment/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />Enroll Employee
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-2">
          <Link href="/hr/benefits/enrollment">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${!status ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>All</span>
          </Link>
          {STATUSES.map(s => (
            <Link key={s} href={`/hr/benefits/enrollment?status=${s}`}>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize cursor-pointer transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>{s}</span>
            </Link>
          ))}
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-500">
            <p className="text-[13px]">No enrollments found</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employee</th>
                  <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Plan</th>
                  <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Coverage Type</th>
                  <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Emp Cost</th>
                  <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employer Cost</th>
                  <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Effective</th>
                  <th className="text-center px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(e => (
                  <tr key={e.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-2 font-medium text-zinc-100">{empMap[e.employeeId] ?? e.employeeId}</td>
                    <td className="px-3 py-2 text-zinc-300">{e.plan.name}</td>
                    <td className="px-3 py-2 text-zinc-400 capitalize">{e.coverageType.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2 text-right text-zinc-300">{formatCurrency(e.employeeCost)}</td>
                    <td className="px-3 py-2 text-right text-emerald-400">{formatCurrency(e.employerCost)}</td>
                    <td className="px-3 py-2 text-zinc-500">{new Date(e.effectiveDate).toLocaleDateString()}</td>
                    <td className="px-5 py-2 text-center">
                      <Badge variant={STATUS_VARIANT[e.status] ?? 'secondary'}>{e.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </main>
    </>
  )
}
