export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus, Wrench } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  'Corrective':  'bg-red-500/10 text-red-400',
  'Preventive':  'bg-blue-500/10 text-blue-400',
  'Inspection':  'bg-purple-500/10 text-purple-400',
  'Modification':'bg-amber-500/10 text-amber-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  'Critical':  'bg-red-500/10 text-red-400',
  'High':      'bg-orange-500/10 text-orange-400',
  'Normal':    'bg-zinc-700 text-zinc-400',
  'Low':       'bg-zinc-800 text-zinc-500',
}

const STATUS_COLORS: Record<string, string> = {
  'Open':        'bg-amber-500/10 text-amber-400',
  'In Progress': 'bg-blue-500/10 text-blue-400',
  'On Hold':     'bg-zinc-700 text-zinc-400',
  'Complete':    'bg-emerald-500/10 text-emerald-400',
  'Cancelled':   'bg-red-500/10 text-red-400',
}

const SAMPLE_WOS = [
  { id: '1', woNo: 'WO-000051', assetId: 'AST-00003', assetName: 'Air Compressor 50HP', type: 'Corrective',  priority: 'High',     status: 'In Progress', startDate: '2026-04-20', endDate: '2026-04-22', assignedTo: 'Mike T.' },
  { id: '2', woNo: 'WO-000052', assetId: 'AST-00001', assetName: 'CNC Mill Machine',    type: 'Preventive',  priority: 'Normal',   status: 'Open',        startDate: '2026-05-01', endDate: '2026-05-01', assignedTo: 'Lisa S.' },
  { id: '3', woNo: 'WO-000053', assetId: 'AST-00002', assetName: 'Industrial Forklift', type: 'Inspection',  priority: 'Normal',   status: 'Open',        startDate: '2026-05-05', endDate: '2026-05-05', assignedTo: 'Tom R.' },
  { id: '4', woNo: 'WO-000049', assetId: 'AST-00004', assetName: 'Server Rack A',       type: 'Preventive',  priority: 'Normal',   status: 'Complete',    startDate: '2026-04-15', endDate: '2026-04-15', assignedTo: 'IT Team' },
  { id: '5', woNo: 'WO-000047', assetId: 'AST-00005', assetName: 'Welding Station #3',  type: 'Modification', priority: 'Low',     status: 'Complete',    startDate: '2026-04-10', endDate: '2026-04-11', assignedTo: 'Mike T.' },
]

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const sp = await searchParams
  const filtered = SAMPLE_WOS.filter(w =>
    (!sp.status || w.status === sp.status) &&
    (!sp.type   || w.type === sp.type)
  )

  return (
    <>
      <TopBar
        title="Maintenance Work Orders"
        breadcrumb={[{ label: 'Assets', href: '/assets' }]}
        actions={
          <Link
            href="/assets/work-orders/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Work Order
          </Link>
        }
      />
      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Status</div>
            <div className="space-y-1">
              {['', 'Open', 'In Progress', 'On Hold', 'Complete', 'Cancelled'].map(s => (
                <Link
                  key={s}
                  href={`/assets/work-orders?status=${s}&type=${sp.type ?? ''}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    (sp.status ?? '') === s
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {s || 'All'}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Type</div>
            <div className="space-y-1">
              {['', 'Corrective', 'Preventive', 'Inspection', 'Modification'].map(t => (
                <Link
                  key={t}
                  href={`/assets/work-orders?type=${t}&status=${sp.status ?? ''}`}
                  className={`block px-2 py-1.5 rounded text-[12px] transition-colors ${
                    (sp.type ?? '') === t
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {t || 'All Types'}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total</div>
              <div className="text-2xl font-bold text-zinc-100">{SAMPLE_WOS.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Open</div>
              <div className="text-2xl font-bold text-amber-400">{SAMPLE_WOS.filter(w => w.status === 'Open').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">In Progress</div>
              <div className="text-2xl font-bold text-blue-400">{SAMPLE_WOS.filter(w => w.status === 'In Progress').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Complete</div>
              <div className="text-2xl font-bold text-emerald-400">{SAMPLE_WOS.filter(w => w.status === 'Complete').length}</div>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">WO No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Asset</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Priority</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Assigned To</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Start Date</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">End Date</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-zinc-500">
                      No work orders. <Link href="/assets/work-orders/new" className="text-blue-400 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((wo, idx) => (
                    <tr key={wo.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                      <td className="px-4 py-2.5">
                        <Link href={`/assets/work-orders/${wo.id}`} className="font-mono text-[12px] text-blue-400 hover:text-blue-300">{wo.woNo}</Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <Link href={`/assets/${wo.assetId}`} className="text-zinc-300 hover:text-zinc-100 text-[12px]">{wo.assetName}</Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_COLORS[wo.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {wo.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${PRIORITY_COLORS[wo.priority] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {wo.priority}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{wo.assignedTo}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{wo.startDate}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{wo.endDate}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[wo.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {wo.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[12px] text-zinc-500">{filtered.length} work orders</div>
        </main>
      </div>
    </>
  )
}
