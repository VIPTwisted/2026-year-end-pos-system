export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Wrench, Calendar, Clock, CheckCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Active':        'bg-emerald-500/10 text-emerald-400',
  'In Use':        'bg-blue-500/10 text-blue-400',
  'Under Repair':  'bg-amber-500/10 text-amber-400',
  'Retired':       'bg-zinc-700 text-zinc-400',
}

const WO_STATUS_COLORS: Record<string, string> = {
  'Open':       'bg-amber-500/10 text-amber-400',
  'In Progress':'bg-blue-500/10 text-blue-400',
  'Complete':   'bg-emerald-500/10 text-emerald-400',
  'Cancelled':  'bg-zinc-700 text-zinc-400',
}

const SAMPLE_ASSET = {
  id: 'AST-00001',
  name: 'CNC Mill Machine',
  type: 'Machinery',
  manufacturer: 'Haas',
  model: 'VF-2',
  serialNumber: 'HAAS-VF2-20220815',
  location: 'Building A - Bay 2',
  functionalLocation: 'Production Floor',
  status: 'In Use',
  acquisitionDate: '2022-08-15',
  warrantyEnd: '2025-08-15',
  powerRating: '20HP, 480V 3-Phase',
  weight: '6800',
  dimensions: '3350x2260x2720',
}

const SAMPLE_WORK_ORDERS = [
  { id: '1', woNo: 'WO-000045', type: 'Preventive', priority: 'Normal',   status: 'Complete',    startDate: '2026-02-10', endDate: '2026-02-10', assignedTo: 'Mike T.' },
  { id: '2', woNo: 'WO-000031', type: 'Corrective', priority: 'High',     status: 'Complete',    startDate: '2025-11-05', endDate: '2025-11-07', assignedTo: 'Lisa S.' },
  { id: '3', woNo: 'WO-000018', type: 'Inspection', priority: 'Normal',   status: 'Complete',    startDate: '2025-08-01', endDate: '2025-08-01', assignedTo: 'Mike T.' },
]

const SAMPLE_PARTS = [
  { id: '1', partNo: 'HAA-BELT-001', description: 'Timing Belt',    qty: 2, unit: 'EA', lastReplaced: '2026-02-10' },
  { id: '2', partNo: 'HAA-OIL-VG68', description: 'Spindle Oil',    qty: 5, unit: 'L',  lastReplaced: '2025-11-07' },
  { id: '3', partNo: 'HAA-FILTER-01', description: 'Air Filter',    qty: 1, unit: 'EA', lastReplaced: '2025-08-01' },
]

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <TopBar
        title={SAMPLE_ASSET.name}
        breadcrumb={[{ label: 'Assets', href: '/assets' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/assets/work-orders/new?assetId=${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" /> New Work Order
            </Link>
          </div>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
        <Link href="/assets" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-[13px] transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Assets
        </Link>

        {/* Asset Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[12px] text-blue-400">{SAMPLE_ASSET.id}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[SAMPLE_ASSET.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                {SAMPLE_ASSET.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-100 mb-1">{SAMPLE_ASSET.name}</h1>
            <p className="text-[13px] text-zinc-400">{SAMPLE_ASSET.manufacturer} {SAMPLE_ASSET.model} · {SAMPLE_ASSET.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FastTab: General */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">General</h2>
            </div>
            <div className="p-5 space-y-3 text-[13px]">
              {[
                { label: 'Asset Type', value: SAMPLE_ASSET.type },
                { label: 'Manufacturer', value: SAMPLE_ASSET.manufacturer },
                { label: 'Model', value: SAMPLE_ASSET.model },
                { label: 'Serial No.', value: SAMPLE_ASSET.serialNumber },
                { label: 'Functional Location', value: SAMPLE_ASSET.functionalLocation },
                { label: 'Acquisition Date', value: SAMPLE_ASSET.acquisitionDate },
                { label: 'Warranty End', value: SAMPLE_ASSET.warrantyEnd },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between border-b border-zinc-800/30 pb-2">
                  <span className="text-zinc-500">{f.label}</span>
                  <span className="text-zinc-200">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FastTab: Technical Specifications */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <h2 className="text-[13px] font-semibold text-zinc-200">Technical Specifications</h2>
            </div>
            <div className="p-5 space-y-3 text-[13px]">
              {[
                { label: 'Power Rating', value: SAMPLE_ASSET.powerRating },
                { label: 'Weight', value: `${SAMPLE_ASSET.weight} kg` },
                { label: 'Dimensions', value: `${SAMPLE_ASSET.dimensions} mm` },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between border-b border-zinc-800/30 pb-2">
                  <span className="text-zinc-500">{f.label}</span>
                  <span className="text-zinc-200">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Order History */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-zinc-200">Work Order History</h2>
            <Link href={`/assets/work-orders?assetId=${id}`} className="text-[12px] text-blue-400 hover:underline">View All</Link>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/40 bg-zinc-900/10">
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">WO No.</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Priority</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Assigned To</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Start</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">End</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_WORK_ORDERS.map((wo, idx) => (
                <tr key={wo.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_WORK_ORDERS.length - 1 ? 'border-b border-zinc-800/30' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">
                    <Link href={`/assets/work-orders/${wo.id}`} className="hover:underline">{wo.woNo}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-[12px]">{wo.type}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{wo.priority}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{wo.assignedTo}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{wo.startDate}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{wo.endDate}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${WO_STATUS_COLORS[wo.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {wo.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Parts List */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
            <h2 className="text-[13px] font-semibold text-zinc-200">Spare Parts</h2>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/40 bg-zinc-900/10">
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Part No.</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Qty</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Unit</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Replaced</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_PARTS.map((p, idx) => (
                <tr key={p.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_PARTS.length - 1 ? 'border-b border-zinc-800/30' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{p.partNo}</td>
                  <td className="px-4 py-2.5 text-zinc-200">{p.description}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{p.qty}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{p.unit}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{p.lastReplaced}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
