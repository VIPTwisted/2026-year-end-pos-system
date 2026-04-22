export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'

function FastTab({ title, open = true, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
      <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 list-none flex items-center justify-between select-none">
        <span>{title}</span>
        <span className="text-zinc-600 text-[10px]">▼</span>
      </summary>
      <div className="px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-zinc-800/40">
        {children}
      </div>
    </details>
  )
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-[13px] text-zinc-100 ${mono ? 'font-mono' : ''}`}>{value ?? <span className="text-zinc-600">—</span>}</p>
    </div>
  )
}

export default async function ItemCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: { select: { id: true, name: true } },
      inventory: {
        include: { store: { select: { id: true, name: true, city: true } } },
        orderBy: { quantity: 'desc' },
      },
    },
  })

  if (!product) notFound()

  const totalStock = product.inventory.reduce((s, i) => s + i.quantity, 0)
  const isLowStock = product.reorderPoint != null && totalStock <= product.reorderPoint
  const margin = product.costPrice > 0
    ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)
    : null
  const qtyOnSalesOrder = product.inventory.reduce((s, i) => s + (i.reserved ?? 0), 0)

  return (
    <>
      <TopBar title={product.name} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* D365 Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/products" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Items
              </Link>
              <span className="text-zinc-700">›</span>
              <Package className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-base text-zinc-100">{product.name}</span>
              <span className="text-zinc-600 text-sm font-mono">({product.sku})</span>
              {!product.isActive && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">Blocked</span>
              )}
              {isLowStock && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-3 h-3" /> Low Stock
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/products/${id}/edit`}
                className="h-7 px-3 text-[12px] font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 rounded transition-colors">
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-5 p-6">
          {/* FastTabs Main Column */}
          <div className="flex-1 space-y-3">

            {/* General */}
            <FastTab title="General">
              <Field label="No." value={product.sku} mono />
              <Field label="Description" value={product.name} />
              <Field label="Description 2" value={product.description} />
              <Field label="Base Unit of Measure" value={product.unit?.toUpperCase()} />
              <Field label="Item Category Code" value={product.category?.name} />
              <Field label="Product Group Code" value={product.category?.slug} mono />
              <Field label="Blocked" value={!product.isActive ? 'Yes' : 'No'} />
              <Field label="Last Date Modified" value={formatDate(product.updatedAt)} />
            </FastTab>

            {/* Inventory */}
            <FastTab title="Inventory">
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Inventory</p>
                <p className={`text-[18px] font-bold ${isLowStock ? 'text-amber-400' : 'text-zinc-100'}`}>{totalStock.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Qty on Sales Order</p>
                <p className="text-[18px] font-bold text-blue-400">{qtyOnSalesOrder.toLocaleString()}</p>
              </div>
              <Field label="Qty on Purch. Order" value="0" />
              <Field label="Reorder Point" value={product.reorderPoint?.toLocaleString()} />
              <Field label="Maximum Inventory" value="—" />
              <Field label="Reorder Quantity" value={product.reorderQty?.toLocaleString()} />
            </FastTab>

            {/* Costs & Posting */}
            <FastTab title="Costs & Posting" open={false}>
              <Field label="Costing Method" value="FIFO" />
              <Field label="Standard Cost" value={formatCurrency(product.costPrice)} />
              <Field label="Unit Cost" value={formatCurrency(product.costPrice)} />
              <Field label="Last Direct Cost" value={formatCurrency(product.costPrice)} />
              <Field label="Unit Price" value={formatCurrency(product.salePrice)} />
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Gross Margin</p>
                <p className={`text-[13px] font-semibold ${Number(margin) > 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {margin ? `${margin}%` : '—'}
                </p>
              </div>
              <Field label="Gen. Prod. Posting Group" value="RETAIL" />
              <Field label="Taxable" value={product.taxable ? 'Yes' : 'No'} />
            </FastTab>

            {/* Item Tracking */}
            <FastTab title="Item Tracking" open={false}>
              <Field label="Serial Nos." value="—" />
              <Field label="Lot Nos." value="—" />
              <Field label="Expiration Calculation" value="—" />
              <Field label="Track Stock" value={product.trackStock ? 'Yes' : 'No'} />
            </FastTab>

            {/* Replenishment */}
            <FastTab title="Replenishment" open={false}>
              <Field label="Replenishment System" value="Purchase" />
              <Field label="Vendor No." value={product.supplier?.name} />
              <Field label="Vendor Item No." value={product.sku} mono />
              <Field label="Lead Time Calculation" value="1W" />
              <Field label="Reorder Point" value={product.reorderPoint?.toLocaleString()} />
              <Field label="Reorder Quantity" value={product.reorderQty?.toLocaleString()} />
            </FastTab>

          </div>

          {/* FactBox Sidebar */}
          <div className="w-64 shrink-0 space-y-3">

            {/* Item Statistics */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2.5 border-b border-zinc-800/40 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Item Statistics</span>
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Sales (LCY)</p>
                  <p className="text-[13px] font-semibold text-emerald-400 tabular-nums">{formatCurrency(product.salePrice * totalStock)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Invoiced Qty</p>
                  <p className="text-[13px] font-semibold text-zinc-300 tabular-nums">0</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide">COGS</p>
                  <p className="text-[13px] font-semibold text-zinc-300 tabular-nums">{formatCurrency(product.costPrice * totalStock)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Inventory Value</p>
                  <p className="text-[13px] font-semibold text-blue-400 tabular-nums">{formatCurrency(product.costPrice * totalStock)}</p>
                </div>
              </div>
            </div>

            {/* Inventory by Location */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2.5 border-b border-zinc-800/40 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Inventory by Location</span>
              </div>
              {product.inventory.length === 0 ? (
                <p className="p-3 text-[12px] text-zinc-600">No inventory records</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/30">
                      <th className="text-left px-3 py-1.5 text-[10px] text-zinc-600 font-medium">Location</th>
                      <th className="text-right px-3 py-1.5 text-[10px] text-zinc-600 font-medium">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.inventory.map(inv => (
                      <tr key={inv.id} className="border-b border-zinc-800/20 last:border-0">
                        <td className="px-3 py-1.5 text-[12px] text-zinc-300">{inv.store.name}</td>
                        <td className="px-3 py-1.5 text-right text-[12px] tabular-nums text-zinc-200">{inv.quantity}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-zinc-700/50 bg-zinc-900/30">
                      <td className="px-3 py-1.5 text-[11px] text-zinc-500">Total</td>
                      <td className="px-3 py-1.5 text-right text-[12px] font-bold tabular-nums text-zinc-100">{totalStock}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
