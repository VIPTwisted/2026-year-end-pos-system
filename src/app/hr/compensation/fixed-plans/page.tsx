import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, DollarSign } from 'lucide-react'

export default async function FixedPlansPage() {
  const plans = await prisma.compensationPlan.findMany({
    where: { type: { in: ['band', 'grade', 'step', 'fixed'] } },
    include: {
      _count: { select: { grades: true, employeeComps: true } },
    },
    orderBy: { code: 'asc' },
  })

  const TYPE_COLORS: Record<string, string> = {
    band:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    grade: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    step:  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    fixed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }

  const totalEmployees = plans.reduce((sum, p) => sum + p._count.employeeComps, 0)
  const activeCount = plans.filter(p => p.isActive).length

  return (
    <>
      <TopBar title="Fixed Compensation Plans" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div>
          <Link href="/hr/compensation" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Compensation
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-zinc-100">Fixed Compensation Plans</h1>
              <p className="text-[13px] text-zinc-500">Band, grade, and step-based pay structures</p>
            </div>
            <Link
              href="/hr/compensation/fixed-plans/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Plan
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Plans', value: plans.length, color: 'text-zinc-100' },
            { label: 'Active Plans', value: activeCount, color: 'text-emerald-400' },
            { label: 'Employees on Fixed Plans', value: totalEmployees, color: 'text-blue-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Plans table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <DollarSign className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[13px] mb-3">No fixed compensation plans found</p>
              <Link
                href="/hr/compensation/fixed-plans/new"
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
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Plan Name</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Currency</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Effective Date</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Grades</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employees</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5">
                        <Link href={`/hr/compensation/plans/${p.id}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">
                          {p.description ?? p.code}
                        </Link>
                        <p className="text-[11px] text-zinc-600 font-mono">{p.code}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] border font-medium capitalize ${TYPE_COLORS[p.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{p.currency}</td>
                      <td className="px-3 py-2.5 text-zinc-500 text-[12px]">
                        {p.effectiveDate ? new Date(p.effectiveDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right text-zinc-300">{p._count.grades}</td>
                      <td className="px-3 py-2.5 text-right text-zinc-300">{p._count.employeeComps}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-500'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
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
