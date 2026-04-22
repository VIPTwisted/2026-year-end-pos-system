import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Handshake, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-zinc-700/40 text-zinc-400',
  active:    'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function SubcontractsListPage() {
  const subs = await prisma.projectSubcontract.findMany({
    include: {
      project: { select: { projectNo: true, description: true } },
      vendor:  { select: { vendorCode: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const kpi = {
    active:          subs.filter(s => s.status === 'active').length,
    pendingVerify:   subs.filter(s => !s.pmVerified && s.status === 'active').length,
    paymentBlocked:  subs.filter(s => s.paymentBlock).length,
    totalValue:      subs.reduce((acc, s) => acc + s.value, 0),
  }

  return (
    <>
      <TopBar title="Subcontracts" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Subcontracts</h2>
            </div>
            <Link
              href="/projects/subcontracts/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Subcontract
            </Link>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Active',             value: kpi.active,         color: 'text-emerald-400' },
              { label: 'Pending PM Verify',  value: kpi.pendingVerify,  color: 'text-yellow-400' },
              { label: 'Payment Blocked',    value: kpi.paymentBlocked, color: 'text-red-400' },
              { label: 'Total Value', value: `$${kpi.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-blue-400' },
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Subcontract #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vendor</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Value</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Retention %</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">No subcontracts yet</td>
                  </tr>
                )}
                {subs.map(s => (
                  <tr key={s.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-200 font-mono text-xs">{s.subcontractNo}</td>
                    <td className="px-4 py-3 text-zinc-300">{s.project.projectNo}</td>
                    <td className="px-4 py-3 text-zinc-400">{s.vendor?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-200 text-right font-mono">
                      ${s.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-right">{s.retentionPct}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[s.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {s.status}
                      </span>
                      {s.paymentBlock && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/40 text-red-400">Blocked</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/projects/subcontracts/${s.id}`} className="text-blue-400 hover:text-blue-300 text-xs">
                        View
                      </Link>
                    </td>
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
