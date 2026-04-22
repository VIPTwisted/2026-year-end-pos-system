export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { AlertTriangle, TrendingDown } from 'lucide-react'

const SAMPLE_REQS = [
  { id: '1', itemNo: 'ITEM-001', itemName: 'Steel Rod 12mm',  demandDate: '2026-05-10', demandQty: 500,  supplyQty: 200, netReqQty: 300, suggestion: 'Planned PO' },
  { id: '2', itemNo: 'ITEM-002', itemName: 'Aluminum Sheet',   demandDate: '2026-05-12', demandQty: 200,  supplyQty: 200, netReqQty: 0,   suggestion: 'None' },
  { id: '3', itemNo: 'ITEM-003', itemName: 'Plastic Pellets',  demandDate: '2026-05-08', demandQty: 1000, supplyQty: 400, netReqQty: 600, suggestion: 'Planned PO' },
  { id: '4', itemNo: 'ITEM-004', itemName: 'Copper Wire',      demandDate: '2026-05-15', demandQty: 150,  supplyQty: 0,   netReqQty: 150, suggestion: 'Planned PO' },
  { id: '5', itemNo: 'ITEM-005', itemName: 'Circuit Board',    demandDate: '2026-05-07', demandQty: 75,   supplyQty: 100, netReqQty: 0,   suggestion: 'Excess Stock' },
]

export default function NetRequirementsPage() {
  const shortfalls = SAMPLE_REQS.filter(r => r.netReqQty > 0)

  return (
    <>
      <TopBar
        title="Net Requirements"
        breadcrumb={[{ label: 'Supply Chain', href: '/supply-chain' }, { label: 'Master Planning', href: '/supply-chain/master-planning' }]}
        actions={
          <Link
            href="/supply-chain/master-planning/planned-orders"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
          >
            View Planned Orders
          </Link>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Items Analyzed</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_REQS.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Shortfalls</div>
            <div className="text-2xl font-bold text-red-400">{shortfalls.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Planned Orders Suggested</div>
            <div className="text-2xl font-bold text-amber-400">{SAMPLE_REQS.filter(r => r.suggestion === 'Planned PO').length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Covered</div>
            <div className="text-2xl font-bold text-emerald-400">{SAMPLE_REQS.filter(r => r.netReqQty === 0).length}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item Name</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Demand Date</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Demand Qty</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Supply Qty</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Req. Qty</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_REQS.map((r, idx) => (
                <tr key={r.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_REQS.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{r.itemNo}</td>
                  <td className="px-4 py-2.5 text-zinc-200">{r.itemName}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{r.demandDate}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{r.demandQty.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{r.supplyQty.toLocaleString()}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums font-semibold ${r.netReqQty > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {r.netReqQty > 0 && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {r.netReqQty.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">
                    {r.suggestion === 'Planned PO' ? (
                      <Link href="/supply-chain/master-planning/planned-orders" className="text-blue-400 hover:underline">{r.suggestion}</Link>
                    ) : r.suggestion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_REQS.length} items analyzed</div>
      </div>
    </>
  )
}
