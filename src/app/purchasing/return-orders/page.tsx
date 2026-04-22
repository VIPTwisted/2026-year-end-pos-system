import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-zinc-700 text-zinc-200',
  open:      'bg-blue-900 text-blue-200',
  shipped:   'bg-indigo-900 text-indigo-300',
  received:  'bg-emerald-900 text-emerald-300',
  cancelled: 'bg-red-900 text-red-300',
}

export default async function PurchaseReturnOrdersPage() {
  // Return orders are vendor POs with negative line amounts or 'return' status
  const returns = await prisma.vendorPO.findMany({
    where: { status: 'return' },
    include: { vendor: { select: { id: true, name: true, vendorCode: true } }, lines: true },
    orderBy: { createdAt: 'desc' },
    take: 300,
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="Purchase Return Orders"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
        ]}
      />

      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">+ New Return Order</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Release</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Post</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Print</button>
        <div className="ml-auto text-xs text-zinc-400">{returns.length} records</div>
      </div>

      <main className="p-6 overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left pb-3 pr-4 font-medium">No.</th>
                <th className="text-left pb-3 pr-4 font-medium">Vendor</th>
                <th className="text-left pb-3 pr-4 font-medium">Return Date</th>
                <th className="text-left pb-3 pr-4 font-medium">Status</th>
                <th className="text-right pb-3 pr-4 font-medium">Lines</th>
                <th className="text-right pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {returns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500 text-xs">
                    No purchase return orders found.
                  </td>
                </tr>
              )}
              {returns.map(r => (
                <tr key={r.id} className="hover:bg-zinc-800/40 cursor-pointer">
                  <td className="py-2.5 pr-4 font-mono text-xs">
                    <Link href={`/purchasing/orders/${r.id}`} className="text-blue-400 hover:underline">{r.poNumber}</Link>
                  </td>
                  <td className="py-2.5 pr-4 text-zinc-200">{r.vendor?.name ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-zinc-400 text-xs whitespace-nowrap">{new Date(r.orderDate).toLocaleDateString()}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-zinc-400 text-xs">{r.lines.length}</td>
                  <td className="py-2.5 text-right font-semibold text-red-400 tabular-nums">{formatCurrency(r.totalAmt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
