import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react'

// Variable plans map to CompensationPlan where type = 'variable'
// TODO: add awardPeriod, targetPct, calcMethod fields to CompensationPlan or create VariableCompensationPlan model

export default async function VariablePlansPage() {
  const plans = await prisma.compensationPlan.findMany({
    where: { type: 'variable' },
    include: {
      _count: { select: { grades: true, employeeComps: true } },
    },
    orderBy: { code: 'asc' },
  })

  // Mock variable-specific metadata until schema is extended
  const variableMeta: Record<string, { method: string; targetPct: number; awardPeriod: string }> = {
    default: { method: '% of Salary', targetPct: 10, awardPeriod: 'Annual' },
  }

  const totalParticipants = plans.reduce((s, p) => s + p._count.employeeComps, 0)

  return (
    <>
      <TopBar title="Variable Compensation Plans" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div>
          <Link href="/hr/compensation" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Compensation
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-zinc-100">Variable Compensation Plans</h1>
              <p className="text-[13px] text-zinc-500">Bonus, commission, and incentive plans</p>
            </div>
            <Link
              href="/hr/compensation/plans/new"
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
            { label: 'Variable Plans', value: plans.length, color: 'text-purple-400' },
            { label: 'Active Plans', value: plans.filter(p => p.isActive).length, color: 'text-emerald-400' },
            { label: 'Plan Participants', value: totalParticipants, color: 'text-zinc-100' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <TrendingUp className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[13px] mb-1">No variable compensation plans</p>
              <p className="text-[12px] text-zinc-600 mb-3">Create bonus and incentive programs for your team</p>
              <Link
                href="/hr/compensation/plans/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
              >
                Create Variable Plan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Plan Name</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Calculation Method</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Target %</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Award Period</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Currency</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Participants</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => {
                    const meta = variableMeta[p.id] ?? variableMeta.default
                    return (
                      <tr key={p.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-2.5">
                          <Link href={`/hr/compensation/plans/${p.id}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">
                            {p.description ?? p.code}
                          </Link>
                          <p className="text-[11px] text-zinc-600 font-mono">{p.code}</p>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-400">{meta.method}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-amber-400">{meta.targetPct}%</td>
                        <td className="px-3 py-2.5 text-zinc-400">{meta.awardPeriod}</td>
                        <td className="px-3 py-2.5 text-zinc-400">{p.currency}</td>
                        <td className="px-3 py-2.5 text-right text-zinc-300">{p._count.employeeComps}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-500'}`}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
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
