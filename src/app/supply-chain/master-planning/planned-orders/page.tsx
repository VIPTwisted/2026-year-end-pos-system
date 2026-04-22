export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  'Planned PO':      'bg-blue-500/10 text-blue-400',
  'Prod. Order':     'bg-emerald-500/10 text-emerald-400',
  'Transfer Order':  'bg-purple-500/10 text-purple-400',
}

const STATUS_COLORS: Record<string, string> = {
  'Suggested': 'bg-amber-500/10 text-amber-400',
  'Firmed':    'bg-emerald-500/10 text-emerald-400',
  'Cancelled': 'bg-zinc-700 text-zinc-400',
}

const SAMPLE_PLANNED = [
  { id: '1', refNo: 'PLN-000001', type: 'Planned PO',     itemNo: 'ITEM-001', itemName: 'Steel Rod 12mm', qty: 300, reqDate: '2026-05-10', status: 'Suggested' },
  { id: '2', refNo: 'PLN-000002', type: 'Planned PO',     itemNo: 'ITEM-003', itemName: 'Plastic Pellets', qty: 600, reqDate: '2026-05-08', status: 'Suggested' },
  { id: '3', refNo: 'PLN-000003', type: 'Planned PO',     itemNo: 'ITEM-004', itemName: 'Copper Wire',    qty: 150, reqDate: '2026-05-15', status: 'Suggested' },
  { id: '4', refNo: 'PLN-000004', type: 'Prod. Order',    itemNo: 'FG-001',   itemName: 'Motor Assembly',  qty: 50,  reqDate: '2026-05-20', status: 'Firmed' },
  { id: '5', refNo: 'PLN-000005', type: 'Transfer Order', itemNo: 'ITEM-002', itemName: 'Aluminum Sheet',  qty: 100, reqDate: '2026-05-18', status: 'Suggested' },
]

export default function PlannedOrdersPage() {
  return (
    <>
      <TopBar
        title="Planned Orders"
        breadcrumb={[{ label: 'Supply Chain', href: '/supply-chain' }, { label: 'Master Planning', href: '/supply-chain/master-planning' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[12px] font-medium rounded transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> Firm Selected
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-[12px] font-medium rounded transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Cancel Selected
            </button>
          </div>
        }
      />
      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        <aside className="w-60 shrink-0 border-r border-zinc-800/50 bg-[#0f0f1a] p-4 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Order Type</div>
            <div className="space-y-1">
              {['All', 'Planned PO', 'Prod. Order', 'Transfer Order'].map(t => (
                <Link
                  key={t}
                  href={`/supply-chain/master-planning/planned-orders?type=${t === 'All' ? '' : t}`}
                  className="block px-2 py-1.5 rounded text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Status</div>
            <div className="space-y-1">
              {['All', 'Suggested', 'Firmed', 'Cancelled'].map(s => (
                <Link
                  key={s}
                  href={`/supply-chain/master-planning/planned-orders?status=${s === 'All' ? '' : s}`}
                  className="block px-2 py-1.5 rounded text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Planned</div>
              <div className="text-2xl font-bold text-zinc-100">{SAMPLE_PLANNED.length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Suggested</div>
              <div className="text-2xl font-bold text-amber-400">{SAMPLE_PLANNED.filter(p => p.status === 'Suggested').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Firmed</div>
              <div className="text-2xl font-bold text-emerald-400">{SAMPLE_PLANNED.filter(p => p.status === 'Firmed').length}</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Planned POs</div>
              <div className="text-2xl font-bold text-blue-400">{SAMPLE_PLANNED.filter(p => p.type === 'Planned PO').length}</div>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="px-3 py-2.5 w-8"></th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Ref. No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item No.</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Item Name</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Qty</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Req. Date</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_PLANNED.map((p, idx) => (
                  <tr key={p.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_PLANNED.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                    <td className="px-3 py-2.5 text-center">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-blue-500" />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{p.refNo}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_COLORS[p.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-300">{p.itemNo}</td>
                    <td className="px-4 py-2.5 text-zinc-200">{p.itemName}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{p.qty.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{p.reqDate}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[p.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_PLANNED.length} planned orders</div>
        </main>
      </div>
    </>
  )
}
