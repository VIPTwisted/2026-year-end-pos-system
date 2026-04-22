export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock } from 'lucide-react'
import { TimesheetActions } from './TimesheetActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  approved: 'success', submitted: 'warning', rejected: 'destructive', open: 'secondary',
}

export default async function TimesheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sheet = await prisma.timeSheet.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, projectNo: true, description: true } },
      lines: {
        include: {
          resource: { select: { id: true, resourceNo: true, name: true } },
        },
        orderBy: { date: 'asc' },
      },
    },
  })
  if (!sheet) notFound()

  const totalHours = sheet.lines.reduce((s, l) => s + Number(l.hours), 0)

  return (
    <>
      <TopBar title={sheet.sheetNo} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/timesheets" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Timesheets
        </Link>

        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-zinc-100">{sheet.sheetNo}</span>
                  <Badge variant={STATUS_VARIANT[sheet.status] ?? 'secondary'} className="capitalize">{sheet.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span>Resource: <span className="text-zinc-300">{sheet.resourceId}</span></span>
                  {sheet.project && (
                    <span>Project: <Link href={`/projects/${sheet.project.id}`} className="text-blue-400 hover:underline">{sheet.project.projectNo}</Link></span>
                  )}
                  <span>Period: <span className="text-zinc-300">{formatDate(sheet.startDate)} — {formatDate(sheet.endDate)}</span></span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-blue-400">{totalHours.toFixed(1)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <TimesheetActions sheetId={sheet.id} status={sheet.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              Time Lines ({sheet.lines.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sheet.lines.length === 0 ? (
              <p className="px-5 pb-5 text-xs text-zinc-600">No lines yet. Status must be open to add lines via API.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Date', 'Description', 'Type', 'Hours', 'Billable', 'Status', 'Notes'].map(h => (
                      <th key={h} className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Description' || h === 'Notes' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheet.lines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{formatDate(line.date)}</td>
                      <td className="px-4 py-2.5 text-zinc-200">{line.description}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant="secondary" className="text-xs capitalize">{line.type}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-blue-400 font-semibold">{Number(line.hours).toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-right text-xs">{line.isBillable ? <span className="text-emerald-400">Y</span> : <span className="text-zinc-600">N</span>}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant={STATUS_VARIANT[line.status] ?? 'secondary'} className="text-xs capitalize">{line.status}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">{line.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={3} className="px-4 py-2.5 text-right text-xs text-zinc-500 uppercase tracking-wide">Total</td>
                    <td className="px-4 py-2.5 text-right text-zinc-100 font-bold text-sm">{totalHours.toFixed(1)} h</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
