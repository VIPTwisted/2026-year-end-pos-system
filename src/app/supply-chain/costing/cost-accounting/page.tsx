export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { Plus, Calculator } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const SAMPLE_ENTRIES = [
  { id: '1', date: '2026-04-15', entryNo: 'CE-000001', costType: 'Direct Material',   costCenter: 'Assembly',   costObject: 'PROD-001', amount: 12500.00, source: 'Production Order' },
  { id: '2', date: '2026-04-15', entryNo: 'CE-000002', costType: 'Direct Labor',       costCenter: 'Assembly',   costObject: 'PROD-001', amount:  8200.00, source: 'Production Order' },
  { id: '3', date: '2026-04-15', entryNo: 'CE-000003', costType: 'Fixed Overhead',     costCenter: 'Factory',    costObject: 'OVHD-001', amount:  3100.00, source: 'Allocation' },
  { id: '4', date: '2026-04-14', entryNo: 'CE-000004', costType: 'Variable Overhead',  costCenter: 'Machining',  costObject: 'PROD-002', amount:  1850.00, source: 'Production Order' },
  { id: '5', date: '2026-04-14', entryNo: 'CE-000005', costType: 'Direct Material',   costCenter: 'Packaging',  costObject: 'PROD-003', amount:  4700.00, source: 'Purchase' },
]

export default function CostAccountingPage() {
  const totalCost = SAMPLE_ENTRIES.reduce((s, e) => s + e.amount, 0)

  return (
    <>
      <TopBar
        title="Cost Accounting Ledger"
        breadcrumb={[{ label: 'Supply Chain', href: '/supply-chain' }, { label: 'Costing', href: '/supply-chain/costing' }]}
        actions={
          <Link
            href="/supply-chain/costing/cost-accounting/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Entry
          </Link>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Entries</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_ENTRIES.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Allocated</div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums">{formatCurrency(totalCost)}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Direct Material</div>
            <div className="text-xl font-bold text-blue-400 tabular-nums">{formatCurrency(SAMPLE_ENTRIES.filter(e => e.costType === 'Direct Material').reduce((s, e) => s + e.amount, 0))}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Overhead</div>
            <div className="text-xl font-bold text-amber-400 tabular-nums">{formatCurrency(SAMPLE_ENTRIES.filter(e => e.costType.includes('Overhead')).reduce((s, e) => s + e.amount, 0))}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Entry No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cost Type</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cost Center</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cost Object</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Source</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ENTRIES.map((e, idx) => (
                <tr key={e.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_ENTRIES.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{e.date}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{e.entryNo}</td>
                  <td className="px-4 py-2.5 text-zinc-200">{e.costType}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{e.costCenter}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-400">{e.costObject}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{e.source}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-200">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-700 bg-zinc-900/20">
                <td colSpan={6} className="px-4 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Total</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-zinc-100">{formatCurrency(totalCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_ENTRIES.length} entries</div>
      </div>
    </>
  )
}
