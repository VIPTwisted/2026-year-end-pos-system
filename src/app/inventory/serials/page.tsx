import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Hash, Package, ChevronLeft } from 'lucide-react'

interface EnrichedSerial {
  id:           string
  serialNumber: string
  productId:    string
  product:      { id: string; name: string; sku: string } | null
  orderId:      string
  orderNumber:  string
  soldAt:       Date
  customer:     { id: string; name: string } | null
}

export default async function SerialNumbersPage() {
  // Fetch all serials with their order + customer
  const serials = await prisma.saleSerialNumber.findMany({
    include: {
      order: {
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { soldAt: 'desc' },
    take: 200,
  })

  // Batch-fetch products
  const productIds = [...new Set(serials.map(s => s.productId))]
  const products   = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true },
  })
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  const enriched: EnrichedSerial[] = serials.map(s => ({
    id:           s.id,
    serialNumber: s.serialNumber,
    productId:    s.productId,
    product:      productMap[s.productId] ?? null,
    orderId:      s.orderId,
    orderNumber:  s.order.orderNumber,
    soldAt:       s.soldAt,
    customer:     s.order.customer
      ? { id: s.order.customer.id, name: `${s.order.customer.firstName} ${s.order.customer.lastName}` }
      : null,
  }))

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSerials         = enriched.length
  const uniqueProducts       = new Set(enriched.map(s => s.productId)).size

  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const serialsThisMonth = enriched.filter(s => new Date(s.soldAt) >= start).length

  return (
    <>
      <TopBar
        title="Serial Numbers Sold"
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

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Serials Tracked</div>
              <div className="text-2xl font-bold text-zinc-100">{totalSerials}</div>
              <div className="text-xs text-zinc-500 mt-1">All-time sold serial numbers</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Unique Products</div>
              <div className="text-2xl font-bold text-zinc-100">{uniqueProducts}</div>
              <div className="text-xs text-zinc-500 mt-1">Products with serial tracking</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Sales This Month</div>
              <div className="text-2xl font-bold text-blue-400">{serialsThisMonth}</div>
              <div className="text-xs text-zinc-500 mt-1">Serials recorded this month</div>
            </div>
          </div>

          {/* Table */}
          {enriched.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-lg border border-zinc-800/50">
              <Hash className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-[13px] text-zinc-500 mb-1">No serial numbers recorded</p>
              <p className="text-[12px] text-zinc-600">Serial numbers are logged when serial-tracked products are sold at POS</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/40">
                <Hash className="w-4 h-4 text-zinc-500" />
                <span className="text-[13px] font-medium text-zinc-300">Serial Number Ledger</span>
                <span className="ml-auto text-[12px] text-zinc-600">
                  Showing {enriched.length} most recent records
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Serial #</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Product</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">SKU</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Order #</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Sale Date</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4">Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enriched.map(s => (
                      <tr
                        key={s.id}
                        className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                      >
                        <td className="py-2.5 px-4">
                          <span className="font-mono text-[13px] text-emerald-400">{s.serialNumber}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          {s.product ? (
                            <Link
                              href={`/products/${s.product.id}`}
                              className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {s.product.name}
                            </Link>
                          ) : (
                            <span className="text-[13px] text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-mono text-[13px] text-zinc-500">
                            {s.product?.sku ?? '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <Link
                            href={`/orders/${s.orderId}`}
                            className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors font-mono"
                          >
                            {s.orderNumber}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[13px] text-zinc-300">
                            {new Date(s.soldAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day:   'numeric',
                              year:  'numeric',
                            })}
                          </span>
                          <span className="text-[11px] text-zinc-600 ml-1.5">
                            {new Date(s.soldAt).toLocaleTimeString('en-US', {
                              hour:   '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          {s.customer ? (
                            <span className="text-[13px] text-zinc-300">{s.customer.name}</span>
                          ) : (
                            <span className="text-[13px] text-zinc-600">Walk-in</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40">
                <span className="text-[12px] text-zinc-500">
                  Showing {enriched.length} most recent serial number records
                </span>
              </div>
            </div>
          )}

          {/* Quick facts footer */}
          {enriched.length > 0 && (
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-zinc-600 shrink-0" />
              <p className="text-[12px] text-zinc-600">
                Serial numbers are captured at point-of-sale for products with{' '}
                <span className="text-zinc-400 font-medium">Requires Serial</span> enabled.
              </p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
