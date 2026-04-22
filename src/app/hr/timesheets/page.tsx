import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Clock, Plus, ArrowRight, Send, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  open:      'bg-blue-500/20 text-blue-400',
  submitted: 'bg-amber-500/20 text-amber-400',
  approved:  'bg-emerald-500/20 text-emerald-400',
  rejected:  'bg-red-500/20 text-red-400',
}

export default async function HrTimesheetsPage() {
  const timesheets = await prisma.hrTimesheet.findMany({
    orderBy: { weekStart: 'desc' },
  })

  const stats = {
    total:     timesheets.length,
    open:      timesheets.filter(t => t.status === 'open').length,
    submitted: timesheets.filter(t => t.status === 'submitted').length,
    approved:  timesheets.filter(t => t.status === 'approved').length,
  }

  return (
    <>
      <TopBar title="HR Timesheets" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Timesheets</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Attendance / hours worked — {timesheets.length} records</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* Action Ribbon */}
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-800/60">
            {[
              { label: 'New',     icon: Plus,        cls: 'bg-blue-600 hover:bg-blue-500 text-white' },
              { label: 'Submit',  icon: Send,        cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
              { label: 'Approve', icon: CheckCircle, cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
            ].map(({ label, icon: Icon, cls }) => (
              <button key={label} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-colors font-medium ${cls}`}>
                <Icon className="w-3 h-3" /> {label}
              </button>
            ))}
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total',     value: stats.total,     color: 'text-zinc-100' },
              { label: 'Open',      value: stats.open,      color: 'text-blue-400' },
              { label: 'Submitted', value: stats.submitted, color: 'text-amber-400' },
              { label: 'Approved',  value: stats.approved,  color: 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          {timesheets.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12">
              <Clock className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500">No timesheets found.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Employee', 'Week Starting', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total', 'Status', ''].map(h => (
                        <th key={h} className={`px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Total'].includes(h) ? 'text-right' :
                          h === 'Status' ? 'text-center' : 'text-left'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {timesheets.map(ts => (
                      <tr key={ts.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-3 py-3 text-[13px] text-zinc-100 min-w-[120px]">{ts.employeeName ?? ts.employeeNo ?? '—'}</td>
                        <td className="px-3 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{formatDate(ts.weekStart)}</td>
                        {[ts.monHours, ts.tueHours, ts.wedHours, ts.thuHours, ts.friHours, ts.satHours, ts.sunHours].map((h, i) => (
                          <td key={i} className={`px-3 py-3 text-right text-[12px] tabular-nums ${h > 0 ? 'text-zinc-200' : 'text-zinc-700'}`}>{h.toFixed(1)}</td>
                        ))}
                        <td className="px-3 py-3 text-right text-[12px] font-bold text-zinc-100 tabular-nums">{ts.totalHours.toFixed(1)}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STATUS_COLOR[ts.status] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {ts.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                            View <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
