import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RoutingActions } from './RoutingActions'
import { ArrowLeft, GitBranch, Settings2 } from 'lucide-react'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  new: 'secondary',
  certified: 'success',
  closed: 'destructive',
}

export default async function RoutingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const routing = await prisma.routing.findUnique({
    where: { id },
    include: {
      lines: {
        include: {
          workCenter: { select: { id: true, name: true, code: true, costPerHour: true } },
        },
        orderBy: { operationNo: 'asc' },
      },
    },
  })

  if (!routing) notFound()

  const totalRunTime = routing.lines.reduce((sum, l) => sum + l.runTime, 0)
  const totalSetupTime = routing.lines.reduce((sum, l) => sum + l.setupTime, 0)

  return (
    <>
      <TopBar title={routing.routingNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/manufacturing/routings"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Routings
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <GitBranch className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={STATUS_BADGE[routing.status] ?? 'secondary'} className="capitalize">
                    {routing.status}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">{routing.type}</Badge>
                </div>
                <h1 className="text-xl font-bold text-zinc-100 font-mono">{routing.routingNumber}</h1>
                <p className="text-sm text-zinc-400 mt-0.5">{routing.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                  <span>{routing.lines.length} operation{routing.lines.length !== 1 ? 's' : ''}</span>
                  <span>Total run time: {totalRunTime}h</span>
                  <span>Total setup: {totalSetupTime}h</span>
                  <span>Created: {formatDate(routing.createdAt)}</span>
                </div>
              </div>
            </div>

            {routing.status !== 'closed' && (
              <div className="mt-5 pt-5 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Actions</p>
                <RoutingActions routingId={routing.id} status={routing.status} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-zinc-400" />
              Operations ({routing.lines.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {routing.lines.length === 0 ? (
              <p className="px-5 py-6 text-sm text-zinc-600">No operations defined.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Op #', 'Description', 'Work Center', 'Setup (h)', 'Run (h)', 'Wait (h)', 'Move (h)', 'Cost/Hr'].map(h => (
                        <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {routing.lines.map(line => (
                      <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-2.5 text-xs font-mono text-zinc-400">{line.operationNo}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-300">{line.description}</td>
                        <td className="px-4 py-2.5">
                          <Link href={`/manufacturing/work-centers/${line.workCenter.id}`} className="text-xs text-blue-400 hover:underline">
                            {line.workCenter.code} — {line.workCenter.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-zinc-400">{line.setupTime}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-300 font-semibold">{line.runTime}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-400">{line.waitTime}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-400">{line.moveTime}</td>
                        <td className="px-4 py-2.5 text-xs text-emerald-400">${line.workCenter.costPerHour}/h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
