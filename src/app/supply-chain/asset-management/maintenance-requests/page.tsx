// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Wrench, Plus, Clock, AlertTriangle, CheckCircle2, Hourglass } from 'lucide-react'

const REQUESTS = [
  { id: 'mr1', reqNo: 'MR-001', asset: 'Delivery Van 003', assetId: 'a5', type: 'reactive',   priority: 'high',   status: 'open',        tech: 'J. Torres', dueDate: '2026-04-25' },
  { id: 'mr2', reqNo: 'MR-002', asset: 'Conveyor Belt B',  assetId: 'a2', type: 'preventive', priority: 'medium', status: 'in_progress', tech: 'M. Davis',  dueDate: '2026-04-30' },
  { id: 'mr3', reqNo: 'MR-003', asset: 'Office HVAC Unit', assetId: 'a3', type: 'inspection', priority: 'low',    status: 'completed',   tech: 'L. Chen',   dueDate: '2026-04-15' },
  { id: 'mr4', reqNo: 'MR-004', asset: 'Forklift #1',      assetId: 'a1', type: 'preventive', priority: 'medium', status: 'open',        tech: 'J. Torres', dueDate: '2026-05-10' },
  { id: 'mr5', reqNo: 'MR-005', asset: 'Compressor Unit',  assetId: 'a6', type: 'inspection', priority: 'low',    status: 'open',        tech: 'Unassigned',dueDate: '2026-05-15' },
]

const STATUS_MAP: Record<string, string> = {
  open:        'bg-blue-500/10 text-blue-400 border-blue-500/30',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  completed:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  cancelled:   'bg-zinc-700/40 text-zinc-500 border-zinc-600/40',
}

const PRIORITY_MAP: Record<string, string> = {
  high:   'bg-red-500/10 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low:    'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
}

const TYPE_LABEL: Record<string, string> = {
  preventive: 'Preventive', reactive: 'Reactive', inspection: 'Inspection',
}

const kpis = [
  { label: 'Open',        value: REQUESTS.filter(r => r.status === 'open').length,        icon: Clock,         color: 'text-blue-400' },
  { label: 'In Progress', value: REQUESTS.filter(r => r.status === 'in_progress').length, icon: Hourglass,     color: 'text-amber-400' },
  { label: 'Completed',   value: REQUESTS.filter(r => r.status === 'completed').length,   icon: CheckCircle2,  color: 'text-emerald-400' },
  { label: 'High Priority',value: REQUESTS.filter(r => r.priority === 'high').length,     icon: AlertTriangle, color: 'text-red-400' },
]

export default function MaintenanceRequestsPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Maintenance Requests" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Maintenance Requests</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {REQUESTS.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/supply-chain/asset-management">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
                All Assets
              </button>
            </Link>
            <Link href="/supply-chain/asset-management/maintenance-requests/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Request
              </button>
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
              <k.icon className={`w-5 h-5 ${k.color} shrink-0`} />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {REQUESTS.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No maintenance requests yet.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Req #', 'Asset', 'Type', 'Priority', 'Status', 'Assigned Tech', 'Due Date'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REQUESTS.map(r => (
                  <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-blue-400 text-xs">{r.reqNo}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/supply-chain/asset-management/${r.assetId}`} className="text-zinc-200 hover:text-blue-400 transition-colors">
                        {r.asset}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400">{TYPE_LABEL[r.type] ?? r.type}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${PRIORITY_MAP[r.priority] ?? ''}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_MAP[r.status] ?? ''}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400">{r.tech}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{r.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
