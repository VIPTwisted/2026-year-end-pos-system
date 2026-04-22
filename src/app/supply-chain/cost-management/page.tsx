'use client'
// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { DollarSign, Layers, Tag, Calculator, RefreshCw } from 'lucide-react'

const KPIS = [
  { label: 'Active Costing Versions', value: 2,  icon: Layers,     color: 'text-blue-400' },
  { label: 'Items w/ Standard Cost',  value: 147, icon: Tag,        color: 'text-emerald-400' },
  { label: 'Pending Recalculations',  value: 6,  icon: RefreshCw,  color: 'text-amber-400' },
  { label: 'Active BOM Calcs',        value: 31, icon: Calculator, color: 'text-zinc-300' },
]

const TABS = ['Costing Versions', 'Item Costs', 'BOM Calculations'] as const
type Tab = typeof TABS[number]

// --- Costing Versions data ---
const COSTING_VERSIONS = [
  { id: 'cv1', version: 'CV-2026-STD', type: 'standard', status: 'active', validFrom: '2026-01-01', validTo: '2026-12-31', items: 147, description: 'Standard cost version FY2026' },
  { id: 'cv2', version: 'CV-2026-Q2',  type: 'planned',  status: 'active', validFrom: '2026-04-01', validTo: '2026-06-30', items: 52,  description: 'Planned Q2 cost scenario' },
  { id: 'cv3', version: 'CV-2025-STD', type: 'standard', status: 'closed', validFrom: '2025-01-01', validTo: '2025-12-31', items: 139, description: 'FY2025 standard costs (closed)' },
]

// --- Item Costs data ---
const ITEM_COSTS = [
  { id: 'ic1', sku: 'ELEC-001', name: 'Microcontroller MCU-32', costGroup: 'Electronics', unitCost: 4.28,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic2', sku: 'MECH-012', name: 'Steel Bracket 6"',       costGroup: 'Hardware',    unitCost: 0.87,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic3', sku: 'PACK-005', name: 'Foam Insert Large',      costGroup: 'Packaging',   unitCost: 1.15,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
  { id: 'ic4', sku: 'ELEC-018', name: 'Li-Ion Battery 5000mAh', costGroup: 'Electronics', unitCost: 12.40, currency: 'USD', effectiveDate: '2026-04-01', version: 'CV-2026-Q2' },
  { id: 'ic5', sku: 'MECH-031', name: 'Aluminum Extrusion 1m',  costGroup: 'Hardware',    unitCost: 6.75,  currency: 'USD', effectiveDate: '2026-01-01', version: 'CV-2026-STD' },
]

// --- BOM Calculations data ---
const BOM_CALCS = [
  { id: 'bc1', item: 'Smart Sensor PRO',  sku: 'PRD-101', bomVer: 'BOM-101-v3', calcCost: 28.44, material: 19.60, labor: 5.20, overhead: 3.64, lastCalc: '2026-04-10' },
  { id: 'bc2', item: 'Controller Unit A', sku: 'PRD-205', bomVer: 'BOM-205-v2', calcCost: 62.18, material: 44.00, labor: 10.80,overhead: 7.38, lastCalc: '2026-04-08' },
  { id: 'bc3', item: 'Display Module 7"', sku: 'PRD-317', bomVer: 'BOM-317-v1', calcCost: 41.90, material: 32.00, labor: 6.40, overhead: 3.50, lastCalc: '2026-03-25' },
  { id: 'bc4', item: 'Power Supply 12V',  sku: 'PRD-422', bomVer: 'BOM-422-v4', calcCost: 15.70, material: 10.80, labor: 3.20, overhead: 1.70, lastCalc: '2026-04-15' },
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

export default function CostManagementPage() {
  const [tab, setTab] = useState<Tab>('Costing Versions')

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Cost Management" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Cost Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/supply-chain/cost-management/costing-versions">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
                Costing Versions
              </button>
            </Link>
            <Link href="/supply-chain/cost-management/item-costs">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
                Item Costs
              </button>
            </Link>
            <Link href="/supply-chain/cost-management/bom-calc">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
                BOM Calculations
              </button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
              <k.icon className={`w-5 h-5 ${k.color} shrink-0`} />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-800/50 pb-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-medium -mb-px border-b-2 transition-colors ${
                tab === t
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'Costing Versions' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Version', 'Type', 'Description', 'Items', 'Valid From', 'Valid To', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COSTING_VERSIONS.map(v => (
                  <tr key={v.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-blue-400 text-xs">{v.version}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${TYPE_MAP[v.type] ?? ''}`}>
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400">{v.description}</td>
                    <td className="px-4 py-2.5 text-zinc-300 font-semibold">{v.items}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{v.validFrom}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{v.validTo}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${VERSION_STATUS_MAP[v.status] ?? ''}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Item Costs' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['SKU', 'Item Name', 'Cost Group', 'Unit Cost', 'Effective Date', 'Costing Version'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ITEM_COSTS.map(ic => (
                  <tr key={ic.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{ic.sku}</td>
                    <td className="px-4 py-2.5 text-zinc-200 font-medium">{ic.name}</td>
                    <td className="px-4 py-2.5 text-zinc-500">{ic.costGroup}</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">${ic.unitCost.toFixed(2)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{ic.effectiveDate}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-blue-400">{ic.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'BOM Calculations' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Item', 'SKU', 'BOM Version', 'Calc Cost', 'Material', 'Labor', 'Overhead', 'Last Calc'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOM_CALCS.map(bc => (
                  <tr key={bc.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 text-zinc-200 font-medium">{bc.item}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{bc.sku}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{bc.bomVer}</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-bold">${bc.calcCost.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-zinc-400">${bc.material.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-zinc-400">${bc.labor.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-zinc-400">${bc.overhead.toFixed(2)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{bc.lastCalc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
