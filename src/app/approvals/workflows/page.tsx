export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { GitBranch, Plus } from 'lucide-react'

export default async function ApprovalWorkflowsPage() {
  const workflows = await prisma.approvalWorkflow.findMany({
    include: {
      steps: { orderBy: { stepOrder: 'asc' } },
      _count: { select: { requests: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <TopBar title="Approval Workflows" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <Link href="/approvals" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                ← Back to Approvals
              </Link>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight mt-1">Workflow Definitions</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{workflows.length} workflows configured</p>
            </div>
            <Link href="/approvals/workflows/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5">
                <Plus className="w-3.5 h-3.5" />New Workflow
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <GitBranch className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">All Workflows</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {workflows.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-14 text-zinc-600">
              <GitBranch className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No workflows defined yet.</p>
              <Link href="/approvals/workflows/new" className="mt-3">
                <Button size="sm" variant="outline">Create First Workflow</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map(wf => (
                <div key={wf.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[14px] font-semibold text-zinc-100">{wf.name}</span>
                        <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
                          {wf.entityType.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant={wf.isActive ? 'success' : 'secondary'} className="text-[11px]">
                          {wf.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {wf.description && (
                        <p className="text-[12px] text-zinc-500 italic">{wf.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {wf.steps.map(step => (
                          <div key={step.id} className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/60 rounded px-2 py-1">
                            <span className="text-[11px] text-zinc-600 font-mono">{step.stepOrder}.</span>
                            <span className="text-[11px] text-zinc-300 capitalize">{step.approverRole}</span>
                            {step.approverName && (
                              <span className="text-[11px] text-zinc-500">({step.approverName})</span>
                            )}
                            {!step.isRequired && (
                              <span className="text-[10px] text-zinc-600 italic">opt</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] text-zinc-500">{wf._count.requests} request{wf._count.requests !== 1 ? 's' : ''}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">{formatDate(wf.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
