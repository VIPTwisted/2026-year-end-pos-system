import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowRight, Package, Plus, Truck } from 'lucide-react'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-400',
    released: 'bg-amber-500/10 text-amber-400',
    shipped: 'bg-purple-500/10 text-purple-400',
    received: 'bg-emerald-500/10 text-emerald-400',
    closed: 'bg-zinc-700 text-zinc-400',
  }
  return map[status] ?? 'bg-zinc-700 text-zinc-400'
}

export default async function InventoryTransfersPage() {
  const [transfers, totalCount] = await Promise.all([
    prisma.transferOrder.findMany({
      include: {
        fromStore: { select: { id: true, name: true } },
        toStore: { select: { id: true, name: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transferOrder.count(),
  ])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const pendingCount = transfers.filter(t => t.status === 'open' || t.status === 'released').length
  const inTransitCount = transfers.filter(t => t.status === 'shipped').length
  const completedThisMonth = transfers.filter(
    t => t.status === 'received' || t.status === 'closed',
  ).filter(t => new Date(t.createdAt) >= monthStart).length

  return (
    <>
      <TopBar title="Inventory Transfers" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">
              Inventory Transfers
            </h1>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              {totalCount} transfer{totalCount !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            href="/inventory/transfers/new"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Transfer
          </Link>
        </div>

        <div className="px-6 pb-6 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Pending
              </div>
              <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
              <div className="text-xs text-zinc-500 mt-1">Open or released</div>
            </div>
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                In Transit
              </div>
              <div className="text-2xl font-bold text-purple-400">{inTransitCount}</div>
              <div className="text-xs text-zinc-500 mt-1">Shipped, awaiting receipt</div>
            </div>
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Completed This Month
              </div>
              <div className="text-2xl font-bold text-emerald-400">{completedThisMonth}</div>
              <div className="text-xs text-zinc-500 mt-1">Received or closed</div>
            </div>
          </div>

          {/* Table */}
          {transfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-lg border border-zinc-800/50">
              <Truck className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-[13px] text-zinc-500 mb-1">No transfers yet</p>
              <p className="text-[12px] text-zinc-600 mb-4">
                Create a transfer to move stock between stores
              </p>
              <Link
                href="/inventory/transfers/new"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Transfer
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/40">
                <Package className="w-4 h-4 text-zinc-500" />
                <span className="text-[13px] font-medium text-zinc-300">All Transfers</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        Transfer #
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        From Store
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        To Store
                      </th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        Date
                      </th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        Items
                      </th>
                      <th className="text-center text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-4 font-medium">
                        Status
                      </th>
                      <th className="w-16 pb-2 pt-3 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map(t => (
                      <tr
                        key={t.id}
                        className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-[13px] font-mono font-medium text-zinc-100">
                            {t.orderNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[13px] text-zinc-300">{t.fromStore.name}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 text-[13px] text-zinc-300">
                            <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                            {t.toStore.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[13px] text-zinc-500">
                          {new Date(t.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-right tabular-nums text-zinc-300">
                          {t._count.lines}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusBadge(t.status)}`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/inventory/transfers/${t.id}`}
                            className="text-[12px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
