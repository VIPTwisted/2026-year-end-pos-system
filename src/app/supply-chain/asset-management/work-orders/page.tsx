'use client'
// TODO: Add schema models: AssetItem, MaintenanceRequest, CostingVersion

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ClipboardList, CheckCircle2, Clock, Hourglass } from 'lucide-react'

const WORK_ORDERS = [
  { id: 'wo1', woNo: 'WO-0041', asset: 'Delivery Van 003', assetId: 'a5', description: 'Replace brake pads and check rotors', tech: 'J. Torres', priority: 'high',   status: 'open',        created: '2026-04-20', due: '2026-04-25' },
  { id: 'wo2', woNo: 'WO-0040', asset: 'Conveyor Belt B',  assetId: 'a2', description: 'Belt tensioner realignment + lubrication', tech: 'M. Davis', priority: 'medium', status: 'in_progress', created: '2026-04-18', due: '2026-04-30' },
  { id: 'wo3', woNo: 'WO-0039', asset: 'Forklift #1',      assetId: 'a1', description: 'Annual hydraulic fluid change', tech: 'J. Torres', priority: 'medium', status: 'completed',   created: '2026-03-10', due: '2026-03-15' },
  { id: 'wo4', woNo: 'WO-0038', asset: 'Office HVAC Unit', assetId: 'a3', description: 'Filter replacement + duct inspection', tech: 'L. Chen',  priority: 'low',    status: 'completed',   created: '2026-02-20', due: '2026-02-28' },
  { id: 'wo5', woNo: 'WO-0037', asset: 'Compressor Unit',  assetId: 'a6', description: 'Pressure relief valve calibration', tech: 'Unassigned', priority: 'low', status: 'open',        created: '2026-04-21', due: '2026-05-15' },
]

const STATUS_MAP: Record<string, string> = {
  open:        'bg-blue-500/10 text-blue-400 border-blue-500/30',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  completed:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const PRIORITY_MAP: Record<string, string> = {
  high:   'bg-red-500/10 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low:    'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
}

const FILTERS = ['all', 'open', 'in_progress', 'completed'] as const
type Filter = typeof FILTERS[number]

export default function WorkOrdersPage() {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? WORK_ORDERS : WORK_ORDERS.filter(w => w.status === filter)

  const kpis = [
    { label: 'Open',        value: WORK_ORDERS.filter(w => w.status === 'open').length,        icon: Clock,         color: 'text-blue-400' },
    { label: 'In Progress', value: WORK_ORDERS.filter(w => w.status === 'in_progress').length, icon: Hourglass,     color: 'text-amber-400' },
    { label: 'Completed',   value: WORK_ORDERS.filter(w => w.status === 'completed').length,   icon: CheckCircle2,  color: 'text-emerald-400' },
    { label: 'Total',       value: WORK_ORDERS.length,                                          icon: ClipboardList, color: 'text-zinc-300' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Work Orders" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Work Orders</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {WORK_ORDERS.length}
            </span>
          </div>
          <Link href="/supply-chain/asset-management">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
              All Assets
            </button>
          </Link>
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

        {/* Status filter tabs */}
        <div className="flex items-center gap-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {filtered.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No work orders match this filter.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['WO #', 'Asset', 'Description', 'Tech', 'Priority', 'Status', 'Due Date'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(wo => (
                  <tr key={wo.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-blue-400 text-xs">{wo.woNo}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/supply-chain/asset-management/${wo.assetId}`} className="text-zinc-200 hover:text-blue-400 transition-colors">
                        {wo.asset}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400 max-w-xs truncate">{wo.description}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{wo.tech}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${PRIORITY_MAP[wo.priority] ?? ''}`}>
                        {wo.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_MAP[wo.status] ?? ''}`}>
                        {wo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{wo.due}</td>
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
