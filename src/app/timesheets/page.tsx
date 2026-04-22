export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Plus } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  approved: 'success', submitted: 'warning', rejected: 'destructive', open: 'secondary',
}

export default async function TimeSheetsPage() {
  const sheets = await prisma.timeSheet.findMany({
    include: {
      project: { select: { id: true, projectNo: true, description: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <TopBar title="Timesheets" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Timesheets</h2>
            <span className="text-sm text-zinc-500">({sheets.length})</span>
          </div>
          <Link href="/timesheets/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Timesheet
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {sheets.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No timesheets yet.</p>
                <Link href="/timesheets/new">
                  <Button size="sm" className="mt-4 gap-1.5"><Plus className="w-3.5 h-3.5" /> New Timesheet</Button>
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Sheet No', 'Resource', 'Project', 'Period', 'Lines', 'Status', ''].map(h => (
                      <th key={h} className={`px-4 pb-3 pt-4 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Sheet No' || h === 'Resource' ? 'text-left' : h === '' ? 'text-right' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheets.map(sheet => (
                    <tr key={sheet.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/timesheets/${sheet.id}`} className="font-mono text-xs text-blue-400 hover:underline">
                          {sheet.sheetNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{sheet.resourceId}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {sheet.project
                          ? <Link href={`/projects/${sheet.project.id}`} className="text-blue-400 hover:underline">
                              {sheet.project.projectNo}
                            </Link>
                          : <span className="text-zinc-600">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-400">
                        {formatDate(sheet.startDate)} — {formatDate(sheet.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-400">{sheet._count.lines}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={STATUS_VARIANT[sheet.status] ?? 'secondary'} className="capitalize text-xs">
                          {sheet.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/timesheets/${sheet.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs h-7 px-2">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
