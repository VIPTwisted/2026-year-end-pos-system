import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { DollarSign, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TYPE_COLOR: Record<string, string> = {
  customer: 'bg-blue-500/20 text-blue-400',
  grant:    'bg-emerald-500/20 text-emerald-400',
  internal: 'bg-zinc-700/40 text-zinc-400',
  investor: 'bg-purple-500/20 text-purple-400',
  loan:     'bg-yellow-500/20 text-yellow-400',
}

export default async function FundingSourcesPage() {
  const sources = await prisma.projectFundingSource.findMany({
    include: {
      project: { select: { projectNo: true, description: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const kpi = {
    totalFunded:    sources.reduce((s, f) => s + f.fundingAmount, 0),
    totalAllocated: sources.reduce((s, f) => s + f.allocatedAmount, 0),
    remaining:      sources.reduce((s, f) => s + (f.fundingAmount - f.allocatedAmount), 0),
  }

  return (
    <>
      <TopBar title="Funding Sources" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Funding Sources</h2>
            </div>
            <Link
              href="/projects/funding-sources/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Source
            </Link>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Funded',    value: `$${kpi.totalFunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,    color: 'text-blue-400' },
              { label: 'Allocated',       value: `$${kpi.totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-purple-400' },
              { label: 'Remaining',       value: `$${kpi.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,       color: 'text-emerald-400' },
            ].map(k => (
              <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Source Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Funded</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Allocated</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Invoiced</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Billing Rule</th>
                </tr>
              </thead>
              <tbody>
                {sources.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">No funding sources yet</td>
                  </tr>
                )}
                {sources.map(f => (
                  <tr key={f.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-300">{f.project.projectNo}</td>
                    <td className="px-4 py-3 text-zinc-200">{f.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[f.sourceType] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {f.sourceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-200 text-right font-mono">
                      ${f.fundingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-purple-400 text-right font-mono">
                      ${f.allocatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-right font-mono">
                      ${f.invoicedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{f.billingRule.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
