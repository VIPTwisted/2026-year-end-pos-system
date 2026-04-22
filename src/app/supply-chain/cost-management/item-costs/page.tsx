// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Tag, ArrowLeft } from 'lucide-react'

const ITEM_COSTS = [
  { id: 'ic01', sku: 'ELEC-001', name: 'Microcontroller MCU-32',    costGroup: 'Electronics', unitCost: 4.28,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic02', sku: 'ELEC-002', name: 'Capacitor 100uF 25V',        costGroup: 'Electronics', unitCost: 0.09,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic03', sku: 'ELEC-018', name: 'Li-Ion Battery 5000mAh',     costGroup: 'Electronics', unitCost: 12.40, currency: 'USD', effectiveDate: '2026-04-01', version: 'CV-2026-Q2'  },
  { id: 'ic04', sku: 'MECH-012', name: 'Steel Bracket 6"',           costGroup: 'Hardware',    unitCost: 0.87,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic05', sku: 'MECH-031', name: 'Aluminum Extrusion 1m',      costGroup: 'Hardware',    unitCost: 6.75,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic06', sku: 'MECH-047', name: 'Hex Bolt M6x20 (100 pack)',  costGroup: 'Hardware',    unitCost: 3.40,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic07', sku: 'PACK-005', name: 'Foam Insert Large',          costGroup: 'Packaging',   unitCost: 1.15,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic08', sku: 'PACK-009', name: 'Corrugated Box 12x10x6',     costGroup: 'Packaging',   unitCost: 0.68,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic09', sku: 'RAW-003',  name: 'ABS Plastic Pellets (kg)',   costGroup: 'Raw Material',unitCost: 2.20,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic10', sku: 'RAW-011',  name: 'Copper Wire 22AWG (100m)',   costGroup: 'Raw Material',unitCost: 8.90,  currency: 'USD', effectiveDate: '2026-04-01', version: 'CV-2026-Q2'  },
]

const COST_GROUP_COLOR: Record<string, string> = {
  'Electronics':   'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Hardware':      'bg-zinc-700/40 text-zinc-300 border-zinc-600/40',
  'Packaging':     'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Raw Material':  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

export default function ItemCostsPage() {
  const groups = [...new Set(ITEM_COSTS.map(i => i.costGroup))]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Item Costs" />
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
            <Tag className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Item Costs</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {ITEM_COSTS.length}
            </span>
          </div>
          {/* Cost group summary pills */}
          <div className="flex items-center gap-2">
            {groups.map(g => (
              <span key={g} className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${COST_GROUP_COLOR[g] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'}`}>
                {g}: {ITEM_COSTS.filter(i => i.costGroup === g).length}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['SKU', 'Item Name', 'Cost Group', 'Unit Cost', 'Currency', 'Effective Date', 'Costing Version'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ITEM_COSTS.map(ic => (
                <tr key={ic.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{ic.sku}</td>
                  <td className="px-4 py-2.5 text-zinc-200 font-medium">{ic.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${COST_GROUP_COLOR[ic.costGroup] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'}`}>
                      {ic.costGroup}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-emerald-400 font-semibold tabular-nums">${ic.unitCost.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-xs">{ic.currency}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{ic.effectiveDate}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-blue-400">{ic.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
