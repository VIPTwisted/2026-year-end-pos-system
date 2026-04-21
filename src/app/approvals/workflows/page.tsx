import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { GitBranch } from 'lucide-react'

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
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <Link href="/approvals" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              ← Back to Approvals
            </Link>
            <h2 className="text-lg font-semibold text-zinc-100 mt-1">Workflow Definitions</h2>
          </div>
          <Link href="/approvals/workflows/new">
            <Button size="sm">+ New Workflow</Button>
          </Link>
        </div>

        {workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-zinc-600">
              <GitBranch className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No workflows defined yet.</p>
              <Link href="/approvals/workflows/new" className="mt-3">
                <Button size="sm" variant="outline">Create First Workflow</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workflows.map(wf => (
              <Card key={wf.id}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-zinc-100">{wf.name}</span>
                        <Badge variant="outline" className="text-xs uppercase tracking-wide">
                          {wf.entityType.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant={wf.isActive ? 'success' : 'secondary'}>
                          {wf.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {wf.description && (
                        <p className="text-xs text-zinc-500 italic">{wf.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {wf.steps.map(step => (
                          <div key={step.id} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
                            <span className="text-xs text-zinc-600 font-mono">{step.stepOrder}.</span>
                            <span className="text-xs text-zinc-300 capitalize">{step.approverRole}</span>
                            {step.approverName && (
                              <span className="text-xs text-zinc-500">({step.approverName})</span>
                            )}
                            {!step.isRequired && (
                              <span className="text-xs text-zinc-600 italic">opt</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-zinc-500">{wf._count.requests} request{wf._count.requests !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{formatDate(wf.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
