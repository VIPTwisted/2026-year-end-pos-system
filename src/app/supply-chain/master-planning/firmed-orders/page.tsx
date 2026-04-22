export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  'Purchase Order': 'bg-blue-500/10 text-blue-400',
  'Production Order': 'bg-emerald-500/10 text-emerald-400',
  'Transfer Order': 'bg-purple-500/10 text-purple-400',
}

const SAMPLE_FIRMED = [
  { id: '1', refNo: 'PO-000042',  type: 'Purchase Order',  itemNo: 'ITEM-004', itemName: 'Copper Wire',    qty: 150, reqDate: '2026-05-15', vendor: 'ABC Metals',       firmedDate: '2026-04-20' },
  { id: '2', refNo: 'MO-000018',  type: 'Production Order', itemNo: 'FG-001',  itemName: 'Motor Assembly',  qty: 50,  reqDate: '2026-05-20', vendor: 'Internal',        firmedDate: '2026-04-20' },
  { id: '3', refNo: 'PO-000043',  type: 'Purchase Order',  itemNo: 'ITEM-001', itemName: 'Steel Rod 12mm', qty: 300, reqDate: '2026-05-10', vendor: 'Steel Supply Co.', firmedDate: '2026-04-21' },
]

export default function FirmedOrdersPage() {
  return (
    <>
      <TopBar
        title="Firmed Orders"
        breadcrumb={[{ label: 'Supply Chain', href: '/supply-chain' }, { label: 'Master Planning', href: '/supply-chain/master-planning' }]}
        actions={
          <Link
            href="/supply-chain/master-planning/planned-orders"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
          >
            Back to Planned Orders
          </Link>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Firmed Orders</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_FIRMED.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Purchase Orders</div>
            <div className="text-2xl font-bold text-blue-400">{SAMPLE_FIRMED.filter(f => f.type === 'Purchase Order').length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Production Orders</div>
            <div className="text-2xl font-bold text-emerald-400">{SAMPLE_FIRMED.filter(f => f.type === 'Production Order').length}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Ref. No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item Name</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Qty</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Req. Date</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Vendor / Source</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Firmed Date</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_FIRMED.map((f, idx) => (
                <tr key={f.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_FIRMED.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{f.refNo}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_COLORS[f.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {f.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-300">{f.itemNo}</td>
                  <td className="px-4 py-2.5 text-zinc-200">{f.itemName}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{f.qty.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{f.reqDate}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{f.vendor}</td>
                  <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{f.firmedDate}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/purchasing?ref=${f.refNo}`} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_FIRMED.length} firmed orders awaiting execution</div>
      </div>
    </>
  )
}
