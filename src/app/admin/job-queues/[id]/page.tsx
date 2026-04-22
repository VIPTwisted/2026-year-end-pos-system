export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Pause, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const MOCK_QUEUE = {
  id: 'JQ-001',
  code: 'SEND-INVOICES',
  description: 'Send Outstanding Invoices',
  objectType: 'Codeunit',
  objectId: 370,
  status: 'Ready',
  earliestStart: '2026-04-23 06:00',
  nextRunTime: '2026-04-23 06:00',
  recurrence: 'Daily',
  noOfMinutesBetweenRuns: 1440,
  maxNoOfAttempts: 3,
  runLog: [
    { id: 'RUN-001', startTime: '2026-04-22 06:00:12', endTime: '2026-04-22 06:02:26', result: 'Success', errorMessage: '' },
    { id: 'RUN-002', startTime: '2026-04-21 06:00:08', endTime: '2026-04-21 06:02:19', result: 'Success', errorMessage: '' },
    { id: 'RUN-003', startTime: '2026-04-20 06:00:15', endTime: '2026-04-20 06:00:23', result: 'Error', errorMessage: 'SMTP connection timeout. Retry 1 of 3.' },
    { id: 'RUN-004', startTime: '2026-04-20 06:05:15', endTime: '2026-04-20 06:07:11', result: 'Success', errorMessage: '' },
    { id: 'RUN-005', startTime: '2026-04-19 06:00:09', endTime: '2026-04-19 06:02:01', result: 'Success', errorMessage: '' },
  ],
}

export default function JobQueueDetailPage({ params }: { params: { id: string } }) {
  const q = MOCK_QUEUE
  const successCount = q.runLog.filter(r => r.result === 'Success').length
  const errorCount = q.runLog.filter(r => r.result === 'Error').length

  return (
    <>
      <TopBar title={`Job Queue: ${q.code}`} />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-5xl">

        <div className="flex items-center justify-between">
          <Link href="/admin/job-queues" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Job Queue Entries
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2 bg-emerald-700 hover:bg-emerald-600">
              <Play className="w-4 h-4" />
              Set to Ready
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Pause className="w-4 h-4" />
              Set On Hold
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-zinc-100">{q.code}</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {q.status}
          </span>
        </div>

        {/* FastTab: General */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">General</span>
          </div>
          <CardContent className="p-5 grid grid-cols-3 gap-5">
            <div><p className="text-xs text-zinc-500 mb-1">Code</p><p className="text-sm font-mono text-zinc-300">{q.code}</p></div>
            <div className="col-span-2"><p className="text-xs text-zinc-500 mb-1">Description</p><p className="text-sm text-zinc-300">{q.description}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Object Type</p><p className="text-sm text-blue-400">{q.objectType}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Object ID</p><p className="text-sm font-mono text-zinc-300">{q.objectId}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Status</p><p className="text-sm text-emerald-400 font-medium">{q.status}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Earliest Start</p><p className="text-sm text-zinc-300">{q.earliestStart}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Next Run Time</p><p className="text-sm text-zinc-300">{q.nextRunTime}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Recurrence</p><p className="text-sm text-zinc-300">{q.recurrence}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Interval (min)</p><p className="text-sm text-zinc-300">{q.noOfMinutesBetweenRuns}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Max Attempts</p><p className="text-sm text-zinc-300">{q.maxNoOfAttempts}</p></div>
          </CardContent>
        </Card>

        {/* Run History */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200">Run History</span>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" />{successCount} success</span>
              <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" />{errorCount} error</span>
            </div>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Run ID</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Start Time</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">End Time</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Result</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Error Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {q.runLog.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3 font-mono text-xs text-zinc-500">{r.id}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{r.startTime}</td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{r.endTime}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${r.result === 'Success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.result === 'Success' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {r.result}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-red-400/80">{r.errorMessage || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
