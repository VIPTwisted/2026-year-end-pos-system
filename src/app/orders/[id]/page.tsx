export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { OrderActions } from './OrderActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  paid: 'success', pending: 'warning', refunded: 'destructive', voided: 'secondary',
}

// ---------- D365 FastTab primitives ----------
function FastTabHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="border-b border-zinc-800/40 py-2.5 px-4 flex justify-between items-center bg-zinc-900/40">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">
        {label}{count !== undefined ? ` (${count})` : ''}
      </span>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[13px] text-zinc-100">{value ?? '—'}</p>
    </div>
  )
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      store: { select: { id: true, name: true, address: true, city: true, state: true } },
      items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      payments: true,
    },
  })

  if (!order) notFound()

  const canVoid = ['pending', 'paid'].includes(order.status)

  return (
    <>
      <TopBar title={`Order ${order.orderNumber}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* D365 Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/orders"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Orders
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="font-mono text-lg font-bold text-zinc-100 tracking-tight">{order.orderNumber}</span>
              <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="capitalize">
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {canVoid && (
                <OrderActions orderId={order.id} status={order.status} />
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* General FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="General" />
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              <Field label="Store" value={order.store.name} />
              {order.customer ? (
                <Field
                  label="Customer"
                  value={
                    <Link href={`/customers/${order.customer.id}`} className="text-blue-400 hover:underline">
                      {order.customer.firstName} {order.customer.lastName}
                    </Link>
                  }
                />
              ) : (
                <Field label="Customer" value="Walk-in" />
              )}
              <Field label="Date" value={formatDate(order.createdAt)} />
              <Field label="Payment Method" value={order.paymentMethod ?? '—'} />
              {order.notes && <Field label="Notes" value={<span className="italic text-zinc-400">{order.notes}</span>} />}
            </div>
          </div>

          {/* Lines FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="Line Items" count={order.items.length} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    {['Product', 'SKU', 'Qty', 'Unit Price', 'Tax', 'Total'].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide ${h === 'Product' ? 'text-left' : 'text-right'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2 text-[13px] text-zinc-100">{item.productName}</td>
                      <td className="px-4 py-2 text-right font-mono text-[11px] text-zinc-500">{item.sku}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-300">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-400">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-500">{formatCurrency(item.taxAmount)}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-emerald-400 font-semibold">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="Payments" count={order.payments.length} />
            {order.payments.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-zinc-600">No payments recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                      {['Method', 'Date', 'Reference', 'Status', 'Amount'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.payments.map(pmt => (
                      <tr key={pmt.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2 text-[13px] text-zinc-300 capitalize">{pmt.method}</td>
                        <td className="px-4 py-2 text-[13px] text-zinc-500">{formatDate(pmt.createdAt)}</td>
                        <td className="px-4 py-2 font-mono text-[11px] text-zinc-600">{pmt.reference ?? '—'}</td>
                        <td className="px-4 py-2">
                          <Badge variant={pmt.status === 'completed' ? 'success' : 'secondary'} className="capitalize text-xs">
                            {pmt.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right text-[13px] font-semibold text-emerald-400">{formatCurrency(pmt.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Totals */}
          <div className="flex justify-end">
            <div className="w-64 border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/30">
              {[
                { label: 'Subtotal', value: formatCurrency(order.subtotal) },
                { label: 'Tax', value: formatCurrency(order.taxAmount) },
                { label: 'Discount', value: formatCurrency(order.discountAmount) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-1.5 border-b border-zinc-800/40 text-[13px]">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-300">{value}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-2.5 bg-zinc-800/40">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">Amount Due</span>
                <span className="text-[15px] font-bold text-emerald-400">{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.amountTendered && (
                <>
                  <div className="flex justify-between px-4 py-1.5 border-t border-zinc-800/40 text-[13px]">
                    <span className="text-zinc-500">Tendered</span>
                    <span className="text-zinc-300">{formatCurrency(order.amountTendered)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-1.5 text-[13px]">
                    <span className="text-zinc-500">Change</span>
                    <span className="text-zinc-300">{formatCurrency(order.changeDue ?? 0)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
