export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus, RefreshCw } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(n)
}

const SAMPLE_UPDATES = [
  { id: '1', itemNo: 'ITEM-001', itemName: 'Steel Rod 12mm',  currentCost: 4.2500, newCost: 4.5000, effectiveDate: '2026-05-01', costVersion: 'CV-2026A' },
  { id: '2', itemNo: 'ITEM-002', itemName: 'Aluminum Sheet',   currentCost: 8.7500, newCost: 9.1000, effectiveDate: '2026-05-01', costVersion: 'CV-2026A' },
  { id: '3', itemNo: 'ITEM-003', itemName: 'Plastic Pellets',  currentCost: 1.2000, newCost: 1.1500, effectiveDate: '2026-05-01', costVersion: 'CV-2026A' },
  { id: '4', itemNo: 'ITEM-004', itemName: 'Copper Wire',      currentCost: 12.500, newCost: 13.200, effectiveDate: '2026-05-01', costVersion: 'CV-2026A' },
]

export default function StandardCostUpdatesPage() {
  return (
    <>
      <TopBar
        title="Standard Cost Updates"
        breadcrumb={[{ label: 'Supply Chain', href: '/supply-chain' }, { label: 'Costing', href: '/supply-chain/costing' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/supply-chain/costing/standard-cost-updates/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Update
            </Link>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[12px] font-medium rounded transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Activate All
            </button>
          </div>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Pending Updates</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_UPDATES.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Price Increases</div>
            <div className="text-2xl font-bold text-red-400">{SAMPLE_UPDATES.filter(u => u.newCost > u.currentCost).length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Price Decreases</div>
            <div className="text-2xl font-bold text-emerald-400">{SAMPLE_UPDATES.filter(u => u.newCost < u.currentCost).length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Cost Version</div>
            <div className="text-lg font-bold text-zinc-100">CV-2026A</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item Name</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Current Std. Cost</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">New Std. Cost</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Difference</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Effective Date</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cost Version</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_UPDATES.map((u, idx) => {
                const diff = u.newCost - u.currentCost
                const diffPct = ((diff / u.currentCost) * 100).toFixed(2)
                return (
                  <tr key={u.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_UPDATES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{u.itemNo}</td>
                    <td className="px-4 py-2.5 text-zinc-200">{u.itemName}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-400 tabular-nums">{formatCurrency(u.currentCost)}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-200 font-semibold tabular-nums">{formatCurrency(u.newCost)}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums font-semibold ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {diff >= 0 ? '+' : ''}{formatCurrency(diff)} ({diff >= 0 ? '+' : ''}{diffPct}%)
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{u.effectiveDate}</td>
                    <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">{u.costVersion}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_UPDATES.length} pending updates</div>
      </div>
    </>
  )
}
