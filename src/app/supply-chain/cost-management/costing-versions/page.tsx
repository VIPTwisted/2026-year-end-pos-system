// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Layers, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react'

const COSTING_VERSIONS = [
  {
    id: 'cv1', version: 'CV-2026-STD', type: 'standard', status: 'active',
    validFrom: '2026-01-01', validTo: '2026-12-31', items: 147,
    description: 'Standard cost version FY2026', createdBy: 'M. Reynolds', createdAt: '2025-12-15',
    notes: 'Approved by CFO on 2025-12-20. Includes updated raw material rates.',
  },
  {
    id: 'cv2', version: 'CV-2026-Q2', type: 'planned', status: 'active',
    validFrom: '2026-04-01', validTo: '2026-06-30', items: 52,
    description: 'Planned Q2 cost scenario (tariff impact)', createdBy: 'A. Kim', createdAt: '2026-03-28',
    notes: 'Models 12% tariff increase on imported electronics.',
  },
  {
    id: 'cv3', version: 'CV-2025-STD', type: 'standard', status: 'closed',
    validFrom: '2025-01-01', validTo: '2025-12-31', items: 139,
    description: 'Standard cost version FY2025', createdBy: 'M. Reynolds', createdAt: '2024-12-18',
    notes: 'Closed at year-end. Archived for reference.',
  },
  {
    id: 'cv4', version: 'CV-2026-DRAFT', type: 'planned', status: 'draft',
    validFrom: '2026-07-01', validTo: '2026-12-31', items: 0,
    description: 'H2 2026 cost planning draft', createdBy: 'A. Kim', createdAt: '2026-04-18',
    notes: 'Draft — pending approval.',
  },
]

const VERSION_STATUS_MAP: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  closed: 'bg-zinc-700/40 text-zinc-500 border-zinc-600/40',
  draft:  'bg-blue-500/10 text-blue-400 border-blue-500/30',
}

const TYPE_MAP: Record<string, string> = {
  standard: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  planned:  'bg-violet-500/10 text-violet-400 border-violet-500/30',
}

export default function CostingVersionsPage() {
  const active = COSTING_VERSIONS.filter(v => v.status === 'active').length
  const total  = COSTING_VERSIONS.length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Costing Versions" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/supply-chain/cost-management"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cost Management
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Costing Versions</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {total}
            </span>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Version
          </button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Versions', value: total,                                                            color: 'text-zinc-300' },
            { label: 'Active',         value: active,                                                           color: 'text-emerald-400' },
            { label: 'Standard',       value: COSTING_VERSIONS.filter(v => v.type === 'standard').length,       color: 'text-blue-400' },
            { label: 'Planned',        value: COSTING_VERSIONS.filter(v => v.type === 'planned').length,        color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className={`w-4 h-4 ${s.color} shrink-0`} />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {COSTING_VERSIONS.map(v => (
            <div key={v.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-zinc-100">{v.version}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${TYPE_MAP[v.type] ?? ''}`}>
                    {v.type}
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${VERSION_STATUS_MAP[v.status] ?? ''}`}>
                    {v.status}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 shrink-0">Created {v.createdAt} by {v.createdBy}</span>
              </div>

              <p className="text-xs text-zinc-400 mt-2">{v.description}</p>
              {v.notes && <p className="text-[11px] text-zinc-600 mt-1">{v.notes}</p>}

              <div className="mt-3 flex items-center gap-6 text-[11px] text-zinc-500">
                <span>Valid: <span className="text-zinc-300 font-mono">{v.validFrom}</span> → <span className="text-zinc-300 font-mono">{v.validTo}</span></span>
                <span>Items: <span className="text-zinc-300 font-semibold">{v.items}</span></span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
