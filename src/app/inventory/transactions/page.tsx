import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { List, ChevronLeft, ArrowUpDown } from 'lucide-react'

interface EnrichedTransaction {
  id:        string
  productId: string
  product:   { id: string; name: string; sku: string } | null
  storeId:   string
  type:      string
  quantity:  number
  beforeQty: number
  afterQty:  number
  reference: string | null
  notes:     string | null
  createdBy: string | null
  createdAt: Date
}

type BadgeStyle = {
  bg:   string
  text: string
  label: string
}

const TYPE_STYLES: Record<string, BadgeStyle> = {
  receive:    { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Receive'    },
  sale:       { bg: 'bg-blue-500/10',    text: 'text-blue-400',    label: 'Sale'       },
  adjustment: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   label: 'Adjustment' },
  return:     { bg: 'bg-purple-500/10',  text: 'text-purple-400',  label: 'Return'     },
  void:       { bg: 'bg-red-500/10',     text: 'text-red-400',     label: 'Void'       },
}

function getTypeStyle(type: string): BadgeStyle {
  return TYPE_STYLES[type.toLowerCase()] ?? {
    bg: 'bg-zinc-700/50', text: 'text-zinc-400', label: type,
  }
}

export default async function InventoryTransactionsPage() {
  const transactions = await prisma.inventoryTransaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  // Batch-fetch products
  const productIds = [...new Set(transactions.map(t => t.productId))]
  const products   = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true },
  })
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  const enriched: EnrichedTransaction[] = transactions.map(t => ({
    id:        t.id,
    productId: t.productId,
    product:   productMap[t.productId] ?? null,
    storeId:   t.storeId,
    type:      t.type,
    quantity:  t.quantity,
    beforeQty: t.beforeQty,
    afterQty:  t.afterQty,
    reference: t.reference,
    notes:     t.notes,
    createdBy: t.createdBy,
    createdAt: t.createdAt,
  }))

  // ── Stats ──────────────────────────────────────────────────────────────────
  const now     = new Date()
  const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1)

  const transactionsToday = enriched.filter(t => new Date(t.createdAt) >= todayStart).length

  const totalReceivedMonth = enriched
    .filter(t => t.type === 'receive' && new Date(t.createdAt) >= monthStart)
    .reduce((sum, t) => sum + t.quantity, 0)

  const totalSoldMonth = enriched
    .filter(t => t.type === 'sale' && new Date(t.createdAt) >= monthStart)
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0)

  return (
    <>
      <TopBar
        title="Inventory Transactions"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Back link */}
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Inventory
          </Link>

          {/* Type legend */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mr-1">Types:</span>
            {Object.entries(TYPE_STYLES).map(([, style]) => (
              <span
                key={style.label}
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${style.bg} ${style.text}`}
              >
                {style.label}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Transactions Today</div>
              <div className="text-2xl font-bold text-zinc-100">{transactionsToday}</div>
              <div className="text-xs text-zinc-500 mt-1">All types combined</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Received (Month)</div>
              <div className="text-2xl font-bold text-emerald-400">{totalReceivedMonth}</div>
              <div className="text-xs text-zinc-500 mt-1">Units received this month</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Sold (Month)</div>
              <div className="text-2xl font-bold text-blue-400">{totalSoldMonth}</div>
              <div className="text-xs text-zinc-500 mt-1">Units sold this month</div>
            </div>
          </div>

          {/* Table */}
          {enriched.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-lg border border-zinc-800/50">
              <List className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-[13px] text-zinc-500 mb-1">No inventory transactions yet</p>
              <p className="text-[12px] text-zinc-600">Transactions are created automatically when stock is received, sold, or adjusted</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/40">
                <ArrowUpDown className="w-4 h-4 text-zinc-500" />
                <span className="text-[13px] font-medium text-zinc-300">Transaction Log</span>
                <span className="ml-auto text-[12px] text-zinc-600">
                  Showing {enriched.length} most recent transactions
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Date</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Product</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">SKU</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Type</th>
                      <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Qty</th>
                      <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Before</th>
                      <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">After</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Reference</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enriched.map(t => {
                      const style       = getTypeStyle(t.type)
                      const qtyPositive = t.quantity >= 0
                      const qtyDisplay  = qtyPositive ? `+${t.quantity}` : `${t.quantity}`
                      const qtyColor    = qtyPositive ? 'text-emerald-400' : 'text-red-400'

                      return (
                        <tr
                          key={t.id}
                          className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                        >
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span className="text-[13px] text-zinc-300">
                              {new Date(t.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day:   'numeric',
                                year:  'numeric',
                              })}
                            </span>
                            <span className="text-[11px] text-zinc-600 ml-1.5">
                              {new Date(t.createdAt).toLocaleTimeString('en-US', {
                                hour:   '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {t.product ? (
                              <Link
                                href={`/products/${t.product.id}`}
                                className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                {t.product.name}
                              </Link>
                            ) : (
                              <span className="text-[13px] text-zinc-600">Unknown product</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-mono text-[13px] text-zinc-500">
                              {t.product?.sku ?? '—'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${style.bg} ${style.text}`}>
                              {style.label}
                            </span>
                          </td>
                          <td className={`py-2.5 px-4 text-right font-semibold tabular-nums text-[13px] ${qtyColor}`}>
                            {qtyDisplay}
                          </td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-[13px] text-zinc-500">
                            {t.beforeQty}
                          </td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-[13px] text-zinc-300 font-semibold">
                            {t.afterQty}
                          </td>
                          <td className="py-2.5 px-4">
                            {t.reference ? (
                              <span className="font-mono text-[12px] text-zinc-400">{t.reference}</span>
                            ) : (
                              <span className="text-zinc-700">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 max-w-[180px]">
                            {t.notes ? (
                              <span className="text-[12px] text-zinc-500 truncate block">{t.notes}</span>
                            ) : (
                              <span className="text-zinc-700">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40">
                <span className="text-[12px] text-zinc-500">
                  Showing {enriched.length} most recent transactions
                </span>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
