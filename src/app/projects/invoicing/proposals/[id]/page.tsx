import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import ProposalActions from './ProposalActions'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-zinc-700/40 text-zinc-400',
  posted:    'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const proposal = await prisma.projectInvoiceProposal.findUnique({
    where: { id: params.id },
    include: {
      project: { select: { projectNo: true, description: true } },
    },
  })

  if (!proposal) notFound()

  let lines: Array<{ description: string; amount: number }> = []
  try { lines = JSON.parse(proposal.linesJson ?? '[]') } catch {}

  return (
    <>
      <TopBar title={`Proposal — ${proposal.proposalNumber}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5 max-w-4xl">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                <Link href="/projects/invoicing/proposals" className="hover:text-zinc-300">Invoice Proposals</Link> / {proposal.proposalNumber}
              </p>
              <h2 className="text-[18px] font-semibold text-zinc-100">{proposal.proposalNumber}</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[proposal.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
              {proposal.status}
            </span>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Project</p>
              <p className="text-zinc-200">{proposal.project.projectNo} — {proposal.project.description}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Period</p>
              <p className="text-zinc-200">
                {new Date(proposal.periodStart).toLocaleDateString()} – {new Date(proposal.periodEnd).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Total Amount</p>
              <p className="text-zinc-200 font-mono font-semibold">
                ${proposal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {proposal.postedAt && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Posted At</p>
                <p className="text-zinc-400 text-xs">{new Date(proposal.postedAt).toLocaleString()}</p>
              </div>
            )}
            {proposal.postedBy && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Posted By</p>
                <p className="text-zinc-400">{proposal.postedBy}</p>
              </div>
            )}
          </div>

          {lines.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50">
                <h3 className="text-sm font-semibold text-zinc-300">Transaction Lines</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-xs text-zinc-500">Description</th>
                    <th className="text-right px-5 py-3 text-xs text-zinc-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-b border-zinc-800/20">
                      <td className="px-5 py-3 text-zinc-300">{line.description}</td>
                      <td className="px-5 py-3 text-zinc-200 text-right font-mono">${line.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <ProposalActions id={proposal.id} status={proposal.status} />
        </div>
      </main>
    </>
  )
}
