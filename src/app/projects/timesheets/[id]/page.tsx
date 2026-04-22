import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Send, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  open:      'bg-blue-500/20 text-blue-400',
  submitted: 'bg-amber-500/20 text-amber-400',
  approved:  'bg-emerald-500/20 text-emerald-400',
  rejected:  'bg-red-500/20 text-red-400',
}

export default async function TimesheetDetailPage({ params }: { params: { id: string } }) {
  const ts = await prisma.timesheet.findUnique({
    where: { id: params.id },
    include: { lines: { orderBy: { dayDate: 'asc' } } },
  })

  if (!ts) notFound()

  return (
    <>
      <TopBar title={`Timesheet ${ts.timesheetNo}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5 max-w-5xl">

          <Link href="/projects/timesheets" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="w-3 h-3" /> Back to Timesheets
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects / Timesheets</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">{ts.timesheetNo}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize mt-1 ${STATUS_COLOR[ts.status] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                {ts.status}
              </span>
            </div>
            {/* Actions based on status */}
            <div className="flex items-center gap-2">
              {ts.status === 'open' && (
                <form action={`/api/projects/timesheets/${ts.id}`} method="POST">
                  <input type="hidden" name="_method" value="PATCH" />
                  <input type="hidden" name="status" value="submitted" />
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-amber-600 hover:bg-amber-500 text-white rounded-md font-medium">
                    <Send className="w-3 h-3" /> Submit
                  </button>
                </form>
              )}
              {ts.status === 'submitted' && (
                <>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-red-700 hover:bg-red-600 text-white rounded-md font-medium">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md font-medium">
                    <RotateCcw className="w-3 h-3" /> Recall
                  </button>
                </>
              )}
              {ts.status === 'approved' && (
                <span className="text-[11px] text-emerald-400 font-medium">Approved</span>
              )}
            </div>
          </div>

          {/* General FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">General</span>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Resource No.',  value: ts.resourceNo },
                { label: 'Name',          value: ts.resourceName ?? '—' },
                { label: 'Start Date',    value: formatDate(ts.startDate) },
                { label: 'End Date',      value: formatDate(ts.endDate) },
                { label: 'Status',        value: ts.status },
                { label: 'Total Hours',   value: ts.totalHours.toFixed(2) },
                { label: 'Submitted At',  value: ts.submittedAt ? formatDate(ts.submittedAt) : '—' },
                { label: 'Approved At',   value: ts.approvedAt ? formatDate(ts.approvedAt) : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
                  <p className="text-[13px] text-zinc-100 font-medium capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lines FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Timesheet Lines ({ts.lines.length})</span>
            </div>
            {ts.lines.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-zinc-600">No lines on this timesheet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Day', 'Date', 'Type', 'Project No.', 'Task No.', 'Description', 'Hours'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${h === 'Hours' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {ts.lines.map(line => (
                      <tr key={line.id} className="hover:bg-zinc-800/20">
                        <td className="px-4 py-3 text-[12px] font-semibold text-zinc-300">{line.dayOfWeek}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(line.dayDate)}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-300">{line.lineType}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{line.projectNo ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{line.taskNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100">{line.description ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-[13px] font-semibold text-zinc-100 tabular-nums">{line.hours.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-zinc-800/60">
                    <tr>
                      <td colSpan={6} className="px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest text-right">Total Hours</td>
                      <td className="px-4 py-2 text-right text-[14px] font-bold text-zinc-100 tabular-nums">{ts.totalHours.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          {ts.notes && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Notes</p>
              <p className="text-[13px] text-zinc-300">{ts.notes}</p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
