export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus, Layers } from 'lucide-react'

const NODE_COLORS: Record<string, string> = {
  material:   'bg-blue-500/10 text-blue-400',
  labor:      'bg-emerald-500/10 text-emerald-400',
  overhead:   'bg-amber-500/10 text-amber-400',
  cost_group: 'bg-purple-500/10 text-purple-400',
}

const SAMPLE_NODES = [
  { id: '1', name: 'Raw Material Cost', type: 'material',   rateSource: 'Purchase Price',      costGroup: 'Direct Material' },
  { id: '2', name: 'Direct Labor',      type: 'labor',      rateSource: 'Standard Rate',       costGroup: 'Direct Labor' },
  { id: '3', name: 'Machine Overhead',  type: 'overhead',   rateSource: 'Cost Center Rate',    costGroup: 'Fixed Overhead' },
  { id: '4', name: 'Variable Overhead', type: 'overhead',   rateSource: 'Absorption Rate',     costGroup: 'Variable Overhead' },
  { id: '5', name: 'Subcontract',       type: 'cost_group', rateSource: 'Vendor Quote',        costGroup: 'Subcontract' },
]

export default function CostingSheetsPage() {
  return (
    <>
      <TopBar
        title="Costing Sheets"
        breadcrumb={[{ label: 'Supply Chain', href: '/supply-chain' }, { label: 'Costing', href: '/supply-chain/costing' }]}
        actions={
          <Link
            href="/supply-chain/costing/costing-sheets/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Node
          </Link>
        }
      />
      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Node Type</div>
            <div className="space-y-1">
              {[
                { value: '', label: 'All Nodes' },
                { value: 'material',   label: 'Material' },
                { value: 'labor',      label: 'Labor' },
                { value: 'overhead',   label: 'Overhead' },
                { value: 'cost_group', label: 'Cost Group' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/supply-chain/costing/costing-sheets?type=${opt.value}`}
                  className="block px-2 py-1.5 rounded text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Nodes', value: SAMPLE_NODES.length, color: 'text-zinc-100' },
              { label: 'Material Nodes', value: SAMPLE_NODES.filter(n => n.type === 'material').length, color: 'text-blue-400' },
              { label: 'Overhead Nodes', value: SAMPLE_NODES.filter(n => n.type === 'overhead').length, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{s.label}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Node Type</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rate Source</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cost Group</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_NODES.map((node, idx) => (
                  <tr key={node.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_NODES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                    <td className="px-4 py-2.5 text-zinc-200 font-medium">{node.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${NODE_COLORS[node.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {node.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{node.rateSource}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{node.costGroup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_NODES.length} nodes</div>
        </main>
      </div>
    </>
  )
}
