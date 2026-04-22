// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Calculator, ArrowLeft } from 'lucide-react'

const BOM_CALCS = [
  {
    id: 'bc1', item: 'Smart Sensor PRO',      sku: 'PRD-101', bomVer: 'BOM-101-v3',
    calcCost: 28.44, material: 19.60, labor: 5.20, overhead: 3.64, lastCalc: '2026-04-10',
    version: 'CV-2026-STD', status: 'current',
  },
  {
    id: 'bc2', item: 'Controller Unit A',     sku: 'PRD-205', bomVer: 'BOM-205-v2',
    calcCost: 62.18, material: 44.00, labor: 10.80, overhead: 7.38, lastCalc: '2026-04-08',
    version: 'CV-2026-STD', status: 'current',
  },
  {
    id: 'bc3', item: 'Display Module 7"',     sku: 'PRD-317', bomVer: 'BOM-317-v1',
    calcCost: 41.90, material: 32.00, labor: 6.40, overhead: 3.50, lastCalc: '2026-03-25',
    version: 'CV-2026-STD', status: 'stale',
  },
  {
    id: 'bc4', item: 'Power Supply 12V',      sku: 'PRD-422', bomVer: 'BOM-422-v4',
    calcCost: 15.70, material: 10.80, labor: 3.20, overhead: 1.70, lastCalc: '2026-04-15',
    version: 'CV-2026-STD', status: 'current',
  },
  {
    id: 'bc5', item: 'Wireless Module BLE5',  sku: 'PRD-538', bomVer: 'BOM-538-v2',
    calcCost: 18.92, material: 13.40, labor: 3.60, overhead: 1.92, lastCalc: '2026-04-10',
    version: 'CV-2026-Q2',  status: 'current',
  },
  {
    id: 'bc6', item: 'Enclosure Type B',      sku: 'PRD-601', bomVer: 'BOM-601-v1',
    calcCost: 9.55,  material: 6.80,  labor: 1.80, overhead: 0.95, lastCalc: '2026-02-14',
    version: 'CV-2026-STD', status: 'stale',
  },
]

const COST_BAR = (val: number, total: number) => {
  const pct = total > 0 ? Math.round((val / total) * 100) : 0
  return pct
}

export default function BomCalcPage() {
  const stale   = BOM_CALCS.filter(b => b.status === 'stale').length
  const current = BOM_CALCS.filter(b => b.status === 'current').length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="BOM Calculations" />
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
            <Calculator className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">BOM Cost Calculations</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {BOM_CALCS.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-400 font-medium">{current} current</span>
            <span className="text-[11px] text-amber-400 font-medium">{stale} stale</span>
          </div>
        </div>

        {/* Table with inline cost breakdown bars */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Item', 'SKU', 'BOM Version', 'Calc Cost', 'Cost Breakdown', 'Last Calc', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BOM_CALCS.map(bc => {
                const matPct  = COST_BAR(bc.material, bc.calcCost)
                const labPct  = COST_BAR(bc.labor, bc.calcCost)
                const ovrPct  = COST_BAR(bc.overhead, bc.calcCost)
                return (
                  <tr key={bc.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-200 font-medium">{bc.item}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{bc.sku}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{bc.bomVer}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold tabular-nums">${bc.calcCost.toFixed(2)}</td>
                    <td className="px-4 py-3 min-w-[160px]">
                      {/* Stacked horizontal breakdown bar */}
                      <div className="flex h-2 rounded-full overflow-hidden gap-px w-32">
                        <div
                          className="bg-blue-500 rounded-l-full"
                          style={{ width: `${matPct}%` }}
                          title={`Material $${bc.material.toFixed(2)}`}
                        />
                        <div
                          className="bg-violet-500"
                          style={{ width: `${labPct}%` }}
                          title={`Labor $${bc.labor.toFixed(2)}`}
                        />
                        <div
                          className="bg-amber-500 rounded-r-full"
                          style={{ width: `${ovrPct}%` }}
                          title={`Overhead $${bc.overhead.toFixed(2)}`}
                        />
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-blue-400">M ${bc.material.toFixed(2)}</span>
                        <span className="text-[10px] text-violet-400">L ${bc.labor.toFixed(2)}</span>
                        <span className="text-[10px] text-amber-400">O ${bc.overhead.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{bc.lastCalc}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                        bc.status === 'current'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {bc.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-blue-500 inline-block" /> Material</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-violet-500 inline-block" /> Labor</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-amber-500 inline-block" /> Overhead</span>
        </div>
      </main>
    </div>
  )
}
