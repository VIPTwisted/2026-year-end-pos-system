export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RefreshCw, ChevronRight, AlertTriangle, CheckCircle, Clock, Cpu } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  Ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'In Process': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Error: 'bg-red-500/20 text-red-400 border-red-500/30',
  Finished: 'bg-zinc-600/30 text-zinc-400 border-zinc-600/40',
  'On Hold': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

const OBJ_TYPE_COLOR: Record<string, string> = {
  Codeunit: 'text-blue-400',
  Report: 'text-purple-400',
  XMLport: 'text-amber-400',
}

const MOCK_QUEUES = [
  { id: 'JQ-001', code: 'SEND-INVOICES', description: 'Send Outstanding Invoices', objectType: 'Codeunit', objectId: 370, status: 'Ready', earliestStart: '2026-04-23 06:00', nextRunTime: '2026-04-23 06:00', lastRunDuration: '00:02:14' },
  { id: 'JQ-002', code: 'MRP-CALC', description: 'MRP Plan Calculation', objectType: 'Report', objectId: 99001061, status: 'Ready', earliestStart: '2026-04-23 02:00', nextRunTime: '2026-04-23 02:00', lastRunDuration: '00:08:45' },
  { id: 'JQ-003', code: 'SYNC-ECOM', description: 'E-Commerce Order Sync', objectType: 'Codeunit', objectId: 50100, status: 'In Process', earliestStart: '2026-04-22 22:00', nextRunTime: '2026-04-22 22:00', lastRunDuration: '—' },
  { id: 'JQ-004', code: 'CALC-DEPREC', description: 'Fixed Asset Depreciation', objectType: 'Report', objectId: 5695, status: 'Finished', earliestStart: '2026-04-22 23:00', nextRunTime: '2026-04-23 23:00', lastRunDuration: '00:01:32' },
  { id: 'JQ-005', code: 'EXPORT-DATA', description: 'Data Lake Export (Daily)', objectType: 'XMLport', objectId: 50200, status: 'Error', earliestStart: '2026-04-22 01:00', nextRunTime: '2026-04-23 01:00', lastRunDuration: '00:00:08' },
  { id: 'JQ-006', code: 'REMIND-CUST', description: 'Send Customer Reminders', objectType: 'Codeunit', objectId: 392, status: 'On Hold', earliestStart: '2026-04-25 08:00', nextRunTime: '—', lastRunDuration: '00:00:52' },
]

export default function JobQueuesPage() {
  const ready = MOCK_QUEUES.filter(q => q.status === 'Ready').length
  const inProcess = MOCK_QUEUES.filter(q => q.status === 'In Process').length
  const errors = MOCK_QUEUES.filter(q => q.status === 'Error').length

  return (
    <>
      <TopBar title="Job Queue Entries" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Ready</p>
                <p className="text-2xl font-bold text-emerald-400">{ready}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500/30" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">In Process</p>
                <p className="text-2xl font-bold text-blue-400">{inProcess}</p>
              </div>
              <Cpu className="w-5 h-5 text-blue-500/30" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Errors</p>
                <p className={`text-2xl font-bold ${errors > 0 ? 'text-red-400' : 'text-zinc-400'}`}>{errors}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-500/30" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Entries</p>
                <p className="text-2xl font-bold text-zinc-100">{MOCK_QUEUES.length}</p>
              </div>
              <Clock className="w-5 h-5 text-zinc-500/30" />
            </div>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" className="gap-2 bg-emerald-700 hover:bg-emerald-600">
            <Play className="w-4 h-4" />
            Set to Ready
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Pause className="w-4 h-4" />
            Set On Hold
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </Button>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Status:</span>
          {['All', 'Ready', 'In Process', 'Error', 'Finished', 'On Hold'].map(s => (
            <Link
              key={s}
              href={s === 'All' ? '/admin/job-queues' : `/admin/job-queues?status=${encodeURIComponent(s)}`}
              className="px-2.5 py-1 rounded text-xs font-medium border bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Object Type</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Object ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Earliest Start</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Next Run Time</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Last Duration</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_QUEUES.map(q => (
                    <tr key={q.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{q.code}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{q.description}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${OBJ_TYPE_COLOR[q.objectType] ?? 'text-zinc-400'}`}>
                          {q.objectType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-zinc-500">{q.objectId}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[q.status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {q.status === 'Error' && <AlertTriangle className="w-3 h-3" />}
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{q.earliestStart}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{q.nextRunTime}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">{q.lastRunDuration}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/job-queues/${q.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
