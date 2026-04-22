// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Wrench, Calendar, MapPin, Hash, DollarSign, ShieldCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

// --- Static placeholder data ---
const MOCK_ASSET = {
  id: 'a1',
  assetNo: 'AST-001',
  name: 'Forklift #1',
  type: 'vehicle',
  serialNumber: 'FKL-2023-882',
  location: 'Warehouse A',
  status: 'in_service',
  purchaseDate: '2023-06-15',
  warrantyExpiry: '2026-06-15',
  cost: 38500,
  notes: 'Electric forklift, rated 5,000 lbs. Charged nightly at Bay 1.',
}

const MAINTENANCE_HISTORY = [
  { id: 'mh1', date: '2026-03-15', type: 'Preventive', tech: 'J. Torres', description: 'Annual hydraulic fluid change + brake inspection', result: 'Passed' },
  { id: 'mh2', date: '2025-12-10', type: 'Reactive', tech: 'M. Davis', description: 'Left fork tine cracked — replaced tine set', result: 'Repaired' },
  { id: 'mh3', date: '2025-09-05', type: 'Inspection', tech: 'J. Torres', description: 'OSHA quarterly safety inspection', result: 'Passed' },
  { id: 'mh4', date: '2025-06-01', type: 'Preventive', tech: 'L. Chen', description: '6-month battery capacity test + charger check', result: 'Passed' },
]

const UPCOMING_SCHEDULE = [
  { id: 'us1', dueDate: '2026-06-15', type: 'Preventive', description: 'Annual hydraulic + brake service', priority: 'medium' },
  { id: 'us2', dueDate: '2026-07-01', type: 'Inspection', description: 'OSHA quarterly safety inspection Q3', priority: 'high' },
]

const STATUS_MAP: Record<string, string> = {
  in_service:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  under_maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical:          'bg-red-500/10 text-red-400 border-red-500/30',
}

const TYPE_LABEL: Record<string, string> = {
  machine: 'Machine', vehicle: 'Vehicle', facility: 'Facility', tool: 'Tool',
}

const PRIORITY_MAP: Record<string, string> = {
  high:   'bg-red-500/10 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low:    'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
}

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = { ...MOCK_ASSET, id: params.id }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`${asset.assetNo} — ${asset.name}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/supply-chain/asset-management"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Assets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info card */}
          <div className="lg:col-span-1 bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200">{asset.name}</h2>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_MAP[asset.status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'}`}>
                {asset.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-3">
              {[
                { icon: Hash,        label: 'Asset No',       value: asset.assetNo },
                { icon: Wrench,      label: 'Type',           value: TYPE_LABEL[asset.type] ?? asset.type },
                { icon: Hash,        label: 'Serial Number',  value: asset.serialNumber },
                { icon: MapPin,      label: 'Location',       value: asset.location },
                { icon: Calendar,    label: 'Purchase Date',  value: asset.purchaseDate },
                { icon: ShieldCheck, label: 'Warranty Expiry',value: asset.warrantyExpiry },
                { icon: DollarSign,  label: 'Cost',           value: `$${asset.cost.toLocaleString()}` },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <row.icon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-xs text-zinc-500 w-32 shrink-0">{row.label}</span>
                  <span className="text-xs text-zinc-200 font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {asset.notes && (
              <div className="pt-2 border-t border-zinc-800/40">
                <p className="text-[11px] text-zinc-500 mb-1 uppercase tracking-wide font-medium">Notes</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{asset.notes}</p>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800/40 flex flex-col gap-2">
              <Link href="/supply-chain/asset-management/maintenance-requests/new">
                <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                  <Wrench className="w-3.5 h-3.5" /> New Maintenance Request
                </button>
              </Link>
            </div>
          </div>

          {/* Right column: history + schedule */}
          <div className="lg:col-span-2 space-y-6">

            {/* Maintenance history timeline */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/30 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Maintenance History</span>
              </div>
              <div className="p-4 space-y-3">
                {MAINTENANCE_HISTORY.map((h, i) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                      {i < MAINTENANCE_HISTORY.length - 1 && <div className="w-px flex-1 bg-zinc-800 mt-1" />}
                    </div>
                    <div className="pb-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-zinc-200">{h.type}</span>
                        <span className="text-[11px] text-zinc-500 font-mono">{h.date}</span>
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${h.result === 'Passed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                          {h.result}
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-400 mt-0.5">{h.description}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Tech: {h.tech}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming maintenance schedule */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/30 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Upcoming Schedule</span>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                    {['Due Date', 'Type', 'Description', 'Priority'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {UPCOMING_SCHEDULE.map(s => (
                    <tr key={s.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20">
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{s.dueDate}</td>
                      <td className="px-4 py-2.5 text-zinc-300">{s.type}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{s.description}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${PRIORITY_MAP[s.priority] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'}`}>
                          {s.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {UPCOMING_SCHEDULE.length === 0 && (
                <p className="px-4 py-4 text-[13px] text-zinc-600">No upcoming maintenance scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
