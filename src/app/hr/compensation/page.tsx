export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Plus } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  fixed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  variable: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  band: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  grade: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  step: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

export default async function CompensationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const where = type ? { type } : {}

  const [plans, allComps] = await Promise.all([
    prisma.compensationPlan.findMany({
      where,
      include: {
        _count: { select: { grades: true, employeeComps: true } },
      },
      orderBy: { code: 'asc' },
    }),
    prisma.employeeCompensation.findMany({ orderBy: { effectiveDate: 'desc' } }),
  ])

  const activePlans = plans.filter(p => p.isActive).length
  const totalAnnual = allComps.reduce((sum, c) => {
    const multipliers: Record<string, number> = {
      weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, annual: 1,
    }
    return sum + c.amount * (multipliers[c.payFrequency] ?? 26)
  }, 0)
  const uniqueEmps = new Set(allComps.map(c => c.employeeId)).size
  const avgSalary = allComps.length > 0
    ? allComps.reduce((s, c) => {
        const m: Record<string, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, annual: 1 }
        return s + c.amount * (m[c.payFrequency] ?? 26)
      }, 0) / allComps.length
    : 0

  const TYPES = ['fixed', 'variable', 'band', 'grade', 'step']

  return (
    <>
      <TopBar title="Compensation Management" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Compensation Management</h1>
            <p className="text-[13px] text-zinc-500">Plans, grades, steps and employee compensation</p>
          </div>
          <Link
            href="/hr/compensation/plans/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Plan
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active Plans', value: activePlans, color: 'text-zinc-100' },
            { label: 'Avg Annual Salary', value: formatCurrency(avgSalary), color: 'text-emerald-400' },
            { label: 'Total Annual Cost', value: formatCurrency(totalAnnual), color: 'text-amber-400' },
            { label: 'Employees with Plans', value: uniqueEmps, color: 'text-zinc-100' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/hr/compensation">
            <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${!type ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
              All
            </span>
          </Link>
          {TYPES.map(t => (
            <Link key={t} href={`/hr/compensation?type=${t}`}>
              <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium capitalize cursor-pointer transition-colors ${type === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
                {t}
              </span>
            </Link>
          ))}
        </div>

        {/* Plans table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <DollarSign className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[13px] mb-3">No compensation plans found</p>
              <Link
                href="/hr/compensation/plans/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
              >
                Create First Plan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Code</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Description</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Currency</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Grades</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employees</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Effective</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2">
                        <Link href={`/hr/compensation/plans/${p.id}`} className="font-mono text-blue-400 hover:underline">
                          {p.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-zinc-200">{p.description}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] border font-medium capitalize ${TYPE_COLORS[p.type] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-zinc-400">{p.currency}</td>
                      <td className="px-3 py-2 text-right text-zinc-300">{p._count.grades}</td>
                      <td className="px-3 py-2 text-right text-zinc-300">{p._count.employeeComps}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-zinc-500">
                        {p.effectiveDate ? new Date(p.effectiveDate).toLocaleDateString() : '—'}
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
