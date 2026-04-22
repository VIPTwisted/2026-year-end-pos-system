// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Wrench, Plus, CheckCircle2, AlertTriangle, Server, TrendingUp } from 'lucide-react'

// --- Static placeholder data (replace with prisma queries once schema models are added) ---
const ASSETS = [
  { id: 'a1', assetNo: 'AST-001', name: 'Forklift #1', type: 'vehicle', location: 'Warehouse A', status: 'in_service', lastMaint: '2026-03-15' },
  { id: 'a2', assetNo: 'AST-002', name: 'Conveyor Belt B', type: 'machine', location: 'Warehouse B', status: 'under_maintenance', lastMaint: '2026-04-10' },
  { id: 'a3', assetNo: 'AST-003', name: 'Office HVAC Unit', type: 'facility', location: 'HQ Floor 2', status: 'in_service', lastMaint: '2026-02-28' },
  { id: 'a4', assetNo: 'AST-004', name: 'Pallet Jack Set', type: 'tool', location: 'Warehouse A', status: 'in_service', lastMaint: '2026-04-01' },
  { id: 'a5', assetNo: 'AST-005', name: 'Delivery Van 003', type: 'vehicle', location: 'Yard', status: 'critical', lastMaint: '2025-12-20' },
  { id: 'a6', assetNo: 'AST-006', name: 'Compressor Unit', type: 'machine', location: 'Warehouse C', status: 'in_service', lastMaint: '2026-03-30' },
]

const STATUS_MAP: Record<string, string> = {
  in_service:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  under_maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical:          'bg-red-500/10 text-red-400 border-red-500/30',
  decommissioned:    'bg-zinc-700/40 text-zinc-500 border-zinc-600/40',
}

const STATUS_LABEL: Record<string, string> = {
  in_service: 'In Service', under_maintenance: 'Maintenance', critical: 'Critical', decommissioned: 'Decommissioned',
}

const TYPE_LABEL: Record<string, string> = {
  machine: 'Machine', vehicle: 'Vehicle', facility: 'Facility', tool: 'Tool',
}

function StatusChip({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_MAP[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

const total      = ASSETS.length
const inService  = ASSETS.filter(a => a.status === 'in_service').length
const underMaint = ASSETS.filter(a => a.status === 'under_maintenance').length
const critical   = ASSETS.filter(a => a.status === 'critical').length

const KPIS = [
  { label: 'Total Assets',       value: total,      icon: Server,       color: 'text-blue-400' },
  { label: 'In Service',         value: inService,  icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Under Maintenance',  value: underMaint, icon: Wrench,       color: 'text-amber-400' },
  { label: 'Critical',           value: critical,   icon: AlertTriangle,color: 'text-red-400' },
]

export default function AssetManagementPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Asset Management" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Asset Management</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {ASSETS.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/supply-chain/asset-management/maintenance-requests">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
                Maintenance Requests
              </button>
            </Link>
            <Link href="/supply-chain/asset-management/work-orders">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
                Work Orders
              </button>
            </Link>
            <Link href="/supply-chain/asset-management/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Asset
              </button>
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map(kpi => (
            <div key={kpi.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
              <kpi.icon className={`w-5 h-5 ${kpi.color} shrink-0`} />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Asset table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/30 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">All Assets</span>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Asset No', 'Name', 'Type', 'Location', 'Status', 'Last Maintenance'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSETS.map(a => (
                <tr key={a.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link href={`/supply-chain/asset-management/${a.id}`} className="font-mono text-blue-400 hover:text-blue-300 hover:underline">
                      {a.assetNo}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-200 font-medium">{a.name}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{TYPE_LABEL[a.type] ?? a.type}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{a.location}</td>
                  <td className="px-4 py-2.5"><StatusChip status={a.status} /></td>
                  <td className="px-4 py-2.5 text-zinc-500 font-mono text-xs">{a.lastMaint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
