export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  medical: 'bg-red-500/10 text-red-400 border-red-500/20',
  dental: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  vision: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  life: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  disability: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  retirement_401k: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  fsa: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  hsa: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

export default async function BenefitPlansPage() {
  const plans = await prisma.benefitPlan.findMany({
    include: { _count: { select: { enrollments: true } } },
    orderBy: { code: 'asc' },
  })

  return (
    <>
      <TopBar title="Benefit Plans" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Benefit Plans</h1>
            <p className="text-sm text-zinc-500">{plans.length} plans configured</p>
          </div>
          <Link
            href="/hr/benefits/plans/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />Add Plan
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-500">
            <p className="text-[13px]">No benefit plans configured</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Code</th>
                  <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Name</th>
                  <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                  <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Carrier</th>
                  <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Emp Cost/Period</th>
                  <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employer Cost/Period</th>
                  <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Enrollments</th>
                  <th className="text-center px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-2">
                      <Link href={`/hr/benefits/plans/${p.id}`} className="font-mono text-blue-400 hover:underline">{p.code}</Link>
                    </td>
                    <td className="px-3 py-2 font-medium text-zinc-200">{p.name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] border font-medium ${TYPE_COLORS[p.planType] ?? TYPE_COLORS.other}`}>
                        {p.planType === 'retirement_401k' ? '401(k)' : p.planType.charAt(0).toUpperCase() + p.planType.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-400">{p.carrier ?? '—'}</td>
                    <td className="px-3 py-2 text-right text-zinc-300">{formatCurrency(p.employeeCost)}</td>
                    <td className="px-3 py-2 text-right text-emerald-400">{formatCurrency(p.employerCost)}</td>
                    <td className="px-3 py-2 text-right text-zinc-300">{p._count.enrollments}</td>
                    <td className="px-5 py-2 text-center">
                      <Badge variant={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
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
