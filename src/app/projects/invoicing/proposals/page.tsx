import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Receipt, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-zinc-700/40 text-zinc-400',
  posted:    'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function ProposalsListPage() {
  const proposals = await prisma.projectInvoiceProposal.findMany({
    include: {
      project: { select: { projectNo: true, description: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <TopBar title="Invoice Proposals" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects / Invoicing</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Invoice Proposals</h2>
            </div>
            <Link
              href="/projects/invoicing/proposals/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Proposal
            </Link>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Proposal #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Period</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-600">No invoice proposals yet</td>
                  </tr>
                )}
                {proposals.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-200 font-mono text-xs">{p.proposalNumber}</td>
                    <td className="px-4 py-3 text-zinc-300">{p.project.projectNo} — {p.project.description}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {new Date(p.periodStart).toLocaleDateString()} – {new Date(p.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-200 text-right font-mono">
                      ${p.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[p.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/projects/invoicing/proposals/${p.id}`} className="text-blue-400 hover:text-blue-300 text-xs">
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
