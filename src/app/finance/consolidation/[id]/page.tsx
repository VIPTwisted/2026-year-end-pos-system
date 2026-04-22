import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Building2 } from 'lucide-react'
import { ConsolidationRunButton } from './ConsolidationRunButton'
import { AddCompanyForm } from './AddCompanyForm'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'default',
  running: 'warning',
  complete: 'success',
  failed: 'destructive',
}

const METHOD_BADGE: Record<string, 'default' | 'secondary' | 'warning'> = {
  full: 'default',
  proportional: 'warning',
  equity: 'secondary',
}

export default async function ConsolidationGroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const group = await prisma.consolidationGroup.findUnique({
    where: { id },
    include: {
      companies: { orderBy: { companyName: 'asc' } },
      runs: {
        orderBy: { runDate: 'desc' },
        include: { _count: { select: { results: true } } },
      },
    },
  })
  if (!group) notFound()

  return (
    <>
      <TopBar title={group.name} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/finance/consolidation"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Consolidation
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-zinc-400" />
                {group.name}
              </h1>
              {group.description && (
                <p className="text-sm text-zinc-500 mt-1">{group.description}</p>
              )}
            </div>
            <ConsolidationRunButton groupId={id} />
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* Companies Table */}
            <div className="col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-zinc-400">
                    Companies ({group.companies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Company</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Currency</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Ownership %</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Method</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.companies.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-zinc-600">No companies added yet</td>
                        </tr>
                      )}
                      {group.companies.map(c => (
                        <tr key={c.id} className="border-b border-zinc-800/50">
                          <td className="px-4 py-2.5 font-medium text-zinc-200">{c.companyName}</td>
                          <td className="px-4 py-2.5 text-zinc-400">{c.currency}</td>
                          <td className="px-4 py-2.5 text-right text-zinc-300">{c.ownershipPct}%</td>
                          <td className="px-4 py-2.5">
                            <Badge variant={METHOD_BADGE[c.consolidationMethod] ?? 'secondary'} className="text-xs capitalize">
                              {c.consolidationMethod}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant={c.isActive ? 'success' : 'secondary'} className="text-xs">
                              {c.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Runs History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-zinc-400">Run History ({group.runs.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Run Date</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Period</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Results</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Status</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase" />
                      </tr>
                    </thead>
                    <tbody>
                      {group.runs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-zinc-600">No runs yet</td>
                        </tr>
                      )}
                      {group.runs.map(run => (
                        <tr key={run.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-2.5 text-zinc-300 text-xs">{formatDate(run.runDate)}</td>
                          <td className="px-4 py-2.5 text-zinc-500 text-xs">
                            {formatDate(run.periodStart)} — {formatDate(run.periodEnd)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-zinc-300">{run._count.results}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant={STATUS_BADGE[run.status] ?? 'secondary'} className="text-xs capitalize">
                              {run.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5">
                            {run.status === 'complete' && (
                              <Link
                                href={`/finance/consolidation/${id}/runs/${run.id}`}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                View →
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="col-span-2 space-y-4">
              {/* Group Info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Group Details</div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Currency</span>
                      <span className="text-zinc-300">{group.currency}</span>
                    </div>
                    {group.periodStart && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Default Start</span>
                        <span className="text-zinc-300">{formatDate(group.periodStart)}</span>
                      </div>
                    )}
                    {group.periodEnd && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Default End</span>
                        <span className="text-zinc-300">{formatDate(group.periodEnd)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Created</span>
                      <span className="text-zinc-300">{formatDate(group.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Company */}
              <AddCompanyForm groupId={id} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
