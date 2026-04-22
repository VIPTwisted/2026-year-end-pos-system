export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus, AlertTriangle, Calendar } from 'lucide-react'

const CYCLE_COLORS: Record<string, string> = {
  'Daily':     'bg-blue-500/10 text-blue-400',
  'Weekly':    'bg-purple-500/10 text-purple-400',
  'Monthly':   'bg-emerald-500/10 text-emerald-400',
  'Quarterly': 'bg-amber-500/10 text-amber-400',
  'Annual':    'bg-red-500/10 text-red-400',
}

const SAMPLE_SCHEDULES = [
  { id: '1', assetId: 'AST-00001', assetName: 'CNC Mill Machine',     maintenanceType: 'Lubrication Check',  cycle: 'Monthly',   nextDue: '2026-05-01', lastCompleted: '2026-04-01', assignedTo: 'Mike T.' },
  { id: '2', assetId: 'AST-00001', assetName: 'CNC Mill Machine',     maintenanceType: 'Full Inspection',    cycle: 'Quarterly', nextDue: '2026-07-01', lastCompleted: '2026-04-01', assignedTo: 'Mike T.' },
  { id: '3', assetId: 'AST-00002', assetName: 'Industrial Forklift',  maintenanceType: 'Tire & Fluid Check', cycle: 'Monthly',   nextDue: '2026-05-05', lastCompleted: '2026-04-05', assignedTo: 'Tom R.' },
  { id: '4', assetId: 'AST-00002', assetName: 'Industrial Forklift',  maintenanceType: 'Annual Service',     cycle: 'Annual',    nextDue: '2027-01-20', lastCompleted: '2026-01-20', assignedTo: 'Tom R.' },
  { id: '5', assetId: 'AST-00004', assetName: 'Server Rack A',        maintenanceType: 'Filter Cleaning',   cycle: 'Quarterly', nextDue: '2026-06-15', lastCompleted: '2026-03-15', assignedTo: 'IT Team' },
  { id: '6', assetId: 'AST-00005', assetName: 'Welding Station #3',   maintenanceType: 'Cable Inspection',  cycle: 'Weekly',    nextDue: '2026-04-28', lastCompleted: '2026-04-21', assignedTo: 'Mike T.' },
]

function isDueSoon(date: string): boolean {
  const d = new Date(date)
  const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return diff <= 7 && diff >= 0
}

function isOverdue(date: string): boolean {
  return new Date(date) < new Date()
}

export default function MaintenanceSchedulesPage() {
  const overdue = SAMPLE_SCHEDULES.filter(s => isOverdue(s.nextDue))
  const dueSoon = SAMPLE_SCHEDULES.filter(s => !isOverdue(s.nextDue) && isDueSoon(s.nextDue))

  return (
    <>
      <TopBar
        title="Preventive Maintenance Schedules"
        breadcrumb={[{ label: 'Assets', href: '/assets' }]}
        actions={
          <Link
            href="/assets/maintenance-schedules/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Schedule
          </Link>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Schedules</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_SCHEDULES.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-400">{overdue.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Due in 7 Days</div>
            <div className="text-2xl font-bold text-amber-400">{dueSoon.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">On Schedule</div>
            <div className="text-2xl font-bold text-emerald-400">{SAMPLE_SCHEDULES.length - overdue.length - dueSoon.length}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Asset</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Maintenance Type</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cycle</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Next Due</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Completed</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Assigned To</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_SCHEDULES.map((s, idx) => {
                const overdue = isOverdue(s.nextDue)
                const dueSoon = !overdue && isDueSoon(s.nextDue)
                return (
                  <tr key={s.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_SCHEDULES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                    <td className="px-4 py-2.5">
                      <Link href={`/assets/${s.assetId}`} className="text-zinc-200 hover:text-zinc-100 text-[12px]">{s.assetName}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300">{s.maintenanceType}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${CYCLE_COLORS[s.cycle] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {s.cycle}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 text-[12px] font-medium ${overdue ? 'text-red-400' : dueSoon ? 'text-amber-400' : 'text-zinc-400'}`}>
                      {overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {dueSoon && <Calendar className="w-3 h-3 inline mr-1" />}
                      {s.nextDue}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{s.lastCompleted}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{s.assignedTo}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/assets/work-orders/new?scheduleId=${s.id}&assetId=${s.assetId}`} className="text-[12px] text-blue-400 hover:underline">Create WO</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_SCHEDULES.length} maintenance schedules</div>
      </div>
    </>
  )
}
