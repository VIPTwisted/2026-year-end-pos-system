/**
 * Serial Number List
 * Route: /inventory/serial-numbers/
 *
 * Serial numbers sold at POS: serial #, product, order #, sale date, customer.
 * Each serial = qty 1. Includes warranty expiry where available.
 * Uses prisma.saleSerialNumber model (linked to Order, Product).
 *
 * TODO: When a standalone SerialNumber model is expanded (with warrantyExpiry,
 *   status, warehouseLocation), migrate this page to prisma.serialNumber.
 */
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Hash, Package, ChevronLeft, Shield } from 'lucide-react'

export default async function SerialNumbersPage() {
  const serials = await prisma.saleSerialNumber.findMany({
    include: {
      order: {
        include: { customer: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
    orderBy: { soldAt: 'desc' },
    take: 300,
  })

  const productIds = [...new Set(serials.map(s => s.productId))]
  const products   = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true },
  })
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  const enriched = serials.map(s => ({
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

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth  = enriched.filter(s => new Date(s.soldAt) >= monthStart).length
  const uniqueProds = new Set(enriched.map(s => s.productId)).size

  return (
    <>
      <TopBar title="Serial Numbers" breadcrumb={[{ label: 'Inventory', href: '/inventory' }]} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          <Link href="/inventory" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />Back to Inventory
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">Serial Number Registry</h1>
              <p className="text-[12px] text-zinc-500 mt-0.5">
                Serial-tracked products sold at POS · qty 1 per record · <Link href="/inventory/lot-tracking" className="text-blue-400 hover:text-blue-300">Lot Tracking →</Link>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Serials',     value: enriched.length, color: 'text-zinc-100',  sub: 'All-time records' },
              { label: 'Unique Products',   value: uniqueProds,     color: 'text-zinc-100',  sub: 'Products with serial tracking' },
              { label: 'Sold This Month',   value: thisMonth,       color: 'text-blue-400',  sub: 'Serial numbers recorded' },
            ].map(s => (
              <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{s.label}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

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
                <span className="ml-auto text-[12px] text-zinc-600">Showing {enriched.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      {['Serial #', 'Product', 'SKU', 'Order #', 'Sale Date', 'Customer', 'Warranty Expiry'].map((h, i) => (
                        <th key={h} className={`text-[10px] font-semibold uppercase tracking-widest text-zinc-500 py-2.5 px-4 ${i === 0 ? 'text-left' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {enriched.map(s => (
                      <tr key={s.id} className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors">
                        <td className="py-2.5 px-4"><span className="font-mono text-[13px] text-emerald-400">{s.serialNumber}</span></td>
                        <td className="py-2.5 px-4">
                          {s.product ? (
                            <Link href={`/products/${s.product.id}`} className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors">{s.product.name}</Link>
                          ) : <span className="text-[13px] text-zinc-600">—</span>}
                        </td>
                        <td className="py-2.5 px-4"><span className="font-mono text-[13px] text-zinc-500">{s.product?.sku ?? '—'}</span></td>
                        <td className="py-2.5 px-4">
                          <Link href={`/orders/${s.orderId}`} className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors font-mono">{s.orderNumber}</Link>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[13px] text-zinc-300">{new Date(s.soldAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-[11px] text-zinc-600 ml-1.5">{new Date(s.soldAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          {s.customer ? <span className="text-[13px] text-zinc-300">{s.customer.name}</span> : <span className="text-[13px] text-zinc-600">Walk-in</span>}
                        </td>
                        <td className="py-2.5 px-4">
                          {/* TODO: warrantyExpiry from SerialNumber model once expanded */}
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600">
                            <Shield className="w-3 h-3" />—
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-zinc-800/40 flex items-center gap-3">
                <Package className="w-4 h-4 text-zinc-600 shrink-0" />
                <p className="text-[12px] text-zinc-600">
                  Serial numbers are captured at point-of-sale for products with <span className="text-zinc-400 font-medium">Requires Serial</span> enabled.
                  {/* TODO: Warranty expiry and standalone serial status (active/voided/returned) require */}
                  {/*       expanding the SerialNumber stub model with: serialNo, productId, orderId,    */}
                  {/*       soldAt, customerId, warrantyExpiry, status fields.                          */}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
