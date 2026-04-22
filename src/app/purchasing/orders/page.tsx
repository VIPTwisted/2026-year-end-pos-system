import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-zinc-700 text-zinc-200',
  open:     'bg-blue-900 text-blue-200',
  released: 'bg-emerald-900 text-emerald-300',
  pending_approval: 'bg-amber-900 text-amber-300',
  received: 'bg-purple-900 text-purple-300',
  cancelled:'bg-red-900 text-red-300',
}

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; vendor?: string; from?: string; to?: string }>
}) {
  const sp = await searchParams
  const status = sp.status
  const vendorId = sp.vendor

  const orders = await prisma.vendorPO.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(vendorId ? { vendorId } : {}),
    },
    include: {
      vendor: { select: { id: true, vendorCode: true, name: true } },
      lines:   true,
      receipts: { include: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  const vendors = await prisma.vendor.findMany({
    select: { id: true, vendorCode: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="Purchase Orders"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
        ]}
      />

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <Link href="/purchasing/orders/new">
          <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors">
            + New
          </button>
        </Link>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium transition-colors">
          Release
        </button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium transition-colors">
          Reopen
        </button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium transition-colors">
          Post
        </button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium transition-colors">
          Print
        </button>
        <div className="ml-auto text-xs text-zinc-400">{orders.length} records</div>
      </div>

      <div className="flex">
        {/* Filter Pane */}
        <details open className="w-56 shrink-0 border-r border-zinc-800 bg-[#16213e] min-h-screen">
          <summary className="px-4 py-3 text-xs font-semibold text-zinc-300 uppercase tracking-wide cursor-pointer select-none">
            Filters
          </summary>
          <form method="GET" className="px-4 pb-4 space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Status</label>
              <select
                name="status"
                defaultValue={status ?? ''}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="released">Released</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Vendor</label>
              <select
                name="vendor"
                defaultValue={vendorId ?? ''}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
              >
                <option value="">All Vendors</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">From Date</label>
              <input
                type="date"
                name="from"
                defaultValue={sp.from ?? ''}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">To Date</label>
              <input
                type="date"
                name="to"
                defaultValue={sp.to ?? ''}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
              />
            </div>
            <button
              type="submit"
              className="w-full px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded font-medium"
            >
              Apply
            </button>
            <Link href="/purchasing/orders" className="block text-center text-xs text-zinc-500 hover:text-zinc-300">
              Clear
            </Link>
          </form>
        </details>

        {/* Main Grid */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4 font-medium">No.</th>
                  <th className="text-left pb-3 pr-4 font-medium">Buy-from Vendor Name</th>
                  <th className="text-left pb-3 pr-4 font-medium">Order Date</th>
                  <th className="text-left pb-3 pr-4 font-medium">Status</th>
                  <th className="text-right pb-3 pr-4 font-medium">Amount</th>
                  <th className="text-right pb-3 font-medium">Amt Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500 text-xs">
                      No purchase orders found.{' '}
                      <Link href="/purchasing/orders/new" className="text-blue-400 hover:underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                )}
                {orders.map(po => {
                  const received = po.receipts.reduce(
                    (s, r) => s + r.lines.reduce((ls, l) => ls + l.qtyReceived * (po.lines.find(pl => pl.id === l.poLineId)?.unitCost ?? 0), 0),
                    0
                  )
                  return (
                    <tr key={po.id} className="hover:bg-zinc-800/40 transition-colors cursor-pointer">
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        <Link href={`/purchasing/orders/${po.id}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                          {po.poNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-200">{po.vendor?.name ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                        {new Date(po.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[po.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {po.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-emerald-400 tabular-nums">
                        {formatCurrency(po.totalAmt)}
                      </td>
                      <td className="py-2.5 text-right text-zinc-400 tabular-nums text-xs">
                        {formatCurrency(received)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
