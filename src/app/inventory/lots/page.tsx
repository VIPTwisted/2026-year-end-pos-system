import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Package,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Archive,
  Clock,
  Plus,
} from 'lucide-react'

export default async function LotsPage() {
  const now = new Date()
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [lots, expiringCount, expiredCount, blockedCount] = await Promise.all([
    prisma.lotNumber.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { receivedAt: 'desc' },
    }),
    prisma.lotNumber.count({
      where: {
        isExpired: false,
        isBlocked: false,
        expiresAt: { gte: now, lte: thirtyDaysOut },
      },
    }),
    prisma.lotNumber.count({ where: { isExpired: true } }),
    prisma.lotNumber.count({ where: { isBlocked: true } }),
  ])

  const totalQty = lots.reduce((sum, l) => sum + l.quantityOnHand, 0)

  function lotStatus(lot: {
    isExpired: boolean
    isBlocked: boolean
    expiresAt: Date | null
  }): 'expired' | 'blocked' | 'expiring' | 'active' {
    if (lot.isExpired) return 'expired'
    if (lot.isBlocked) return 'blocked'
    if (lot.expiresAt && lot.expiresAt <= thirtyDaysOut && lot.expiresAt >= now) return 'expiring'
    return 'active'
  }

  return (
    <>
      <TopBar
        title="Lot / Batch Tracking"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">Lot / Batch Tracking</h1>
              <p className="text-[12px] text-zinc-500 mt-0.5">{lots.length} lots tracked</p>
            </div>
            <Link
              href="/inventory/lots/new"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-[13px] font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Lot
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Lots</div>
              <div className="text-2xl font-bold text-zinc-100">{lots.length}</div>
              <div className="text-xs text-zinc-500 mt-1">{totalQty.toLocaleString()} units on hand</div>
            </div>
            <div className={`bg-[#16213e] border rounded-lg p-5 ${expiringCount > 0 ? 'border-amber-800/50' : 'border-zinc-800/50'}`}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Expiring (30d)</div>
              <div className={`text-2xl font-bold ${expiringCount > 0 ? 'text-amber-400' : 'text-zinc-100'}`}>{expiringCount}</div>
              <div className="text-xs text-zinc-500 mt-1">Lots expiring within 30 days</div>
            </div>
            <div className={`bg-[#16213e] border rounded-lg p-5 ${expiredCount > 0 ? 'border-red-800/50' : 'border-zinc-800/50'}`}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Expired / Blocked</div>
              <div className={`text-2xl font-bold ${expiredCount + blockedCount > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                {expiredCount + blockedCount}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{expiredCount} expired · {blockedCount} blocked</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Qty Tracked</div>
              <div className="text-2xl font-bold text-emerald-400">{totalQty.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 mt-1">Quantity on hand across all lots</div>
            </div>
          </div>

          {/* Table */}
          {lots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-lg border border-zinc-800/50">
              <Archive className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-[13px] text-zinc-500 mb-1">No lots tracked yet</p>
              <p className="text-[12px] text-zinc-600">Create a lot when receiving inventory</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/40">
                <Package className="w-4 h-4 text-zinc-500" />
                <span className="text-[13px] font-medium text-zinc-300">Lot Ledger</span>
                <span className="ml-auto text-[12px] text-zinc-600">{lots.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Lot #</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Product</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Supplier</th>
                      <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Qty On Hand</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Manufactured</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Expires</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Received</th>
                      <th className="text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map(lot => {
                      const status = lotStatus(lot)
                      return (
                        <tr
                          key={lot.id}
                          className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                        >
                          <td className="py-2.5 px-4">
                            <Link
                              href={`/inventory/lots/${lot.id}`}
                              className="font-mono text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {lot.lotNo}
                            </Link>
                          </td>
                          <td className="py-2.5 px-4">
                            <Link
                              href={`/products/${lot.product.id}`}
                              className="text-[13px] text-zinc-200 hover:text-zinc-100 transition-colors"
                            >
                              {lot.product.name}
                            </Link>
                            <div className="text-[11px] text-zinc-600 font-mono">{lot.product.sku}</div>
                          </td>
                          <td className="py-2.5 px-4 text-[13px] text-zinc-400">
                            {lot.supplier?.name ?? <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <span className={`font-semibold tabular-nums text-[13px] ${lot.quantityOnHand === 0 ? 'text-zinc-600' : 'text-zinc-100'}`}>
                              {lot.quantityOnHand.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-[13px] text-zinc-400">
                            {lot.manufacturedAt
                              ? new Date(lot.manufacturedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : <span className="text-zinc-600">—</span>
                            }
                          </td>
                          <td className="py-2.5 px-4 text-[13px]">
                            {lot.expiresAt ? (
                              <span className={status === 'expired' ? 'text-red-400' : status === 'expiring' ? 'text-amber-400' : 'text-zinc-300'}>
                                {new Date(lot.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-[13px] text-zinc-400">
                            {new Date(lot.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <StatusBadge status={status} />
                          </td>
                        </tr>
                      )
                    })}
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

function StatusBadge({ status }: { status: 'expired' | 'blocked' | 'expiring' | 'active' }) {
  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">
        <AlertTriangle className="w-3 h-3" />
        Expired
      </span>
    )
  }
  if (status === 'blocked') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700/60 text-zinc-400">
        <Ban className="w-3 h-3" />
        Blocked
      </span>
    )
  }
  if (status === 'expiring') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400">
        <Clock className="w-3 h-3" />
        Expiring Soon
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
      <CheckCircle2 className="w-3 h-3" />
      Active
    </span>
  )
}
