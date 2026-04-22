export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, User, Package, CreditCard } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  layaway:   'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  paid:      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/30',
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash:       'Cash',
  visa:       'Visa',
  mastercard: 'Mastercard',
  debit:      'Debit',
  amex:       'Amex',
  layaway:    'Layaway',
}

export default async function LayawayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
      payments: { orderBy: { createdAt: 'asc' } },
    },
  }).catch(() => notFound())

  if (!order) notFound()

  const subtotal = order.items.reduce((s, i) => s + i.lineTotal, 0)
  const tax = order.taxAmount
  const total = order.totalAmount
  const paid = order.payments.reduce((s, p) => s + p.amount, 0)
  const balance = total - paid

  const statusStyle = STATUS_STYLES[order.status] ?? 'bg-zinc-800/60 text-zinc-500'

  return (
    <>
      <TopBar
        title={`Layaway ${order.orderNumber}`}
        breadcrumb={[{ label: 'Layaway Orders', href: '/layaway' }]}
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Header band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/layaway"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Layaway Orders
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="font-mono text-lg font-bold text-zinc-100 tracking-tight">{order.orderNumber}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium capitalize ${statusStyle}`}>
              {order.status}
            </span>
            <span className="text-[12px] text-zinc-500 ml-auto">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 max-w-5xl">

          {/* Customer card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800/40 py-2.5 px-4 flex items-center gap-2 bg-zinc-900/40">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">Customer</span>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
              {order.customer ? (
                <>
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Name</p>
                    <Link
                      href={`/customers/${order.customer.id}`}
                      className="text-[13px] text-blue-400 hover:underline"
                    >
                      {order.customer.firstName} {order.customer.lastName}
                    </Link>
                  </div>
                  {order.customer.phone && (
                    <div>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Phone</p>
                      <p className="text-[13px] text-zinc-100">{order.customer.phone}</p>
                    </div>
                  )}
                  {order.customer.email && (
                    <div>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Email</p>
                      <p className="text-[13px] text-zinc-100">{order.customer.email}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-zinc-500 italic col-span-3">No customer linked</p>
              )}
            </div>
          </div>

          {/* Items table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800/40 py-2.5 px-4 flex items-center gap-2 bg-zinc-900/40">
              <Package className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">
                Items ({order.items.length})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Product</th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">SKU</th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Qty</th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Unit Price</th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id} className="border-b border-zinc-800/40 last:border-0">
                      <td className="py-2.5 px-3 text-[13px] text-zinc-100">{item.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-[12px] text-zinc-500">{item.sku}</td>
                      <td className="py-2.5 px-3 text-[13px] text-right text-zinc-300 tabular-nums">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-[13px] text-right text-zinc-300 tabular-nums">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-[13px] text-right font-semibold text-zinc-100 tabular-nums">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment history */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-800/40 py-2.5 px-4 flex items-center gap-2 bg-zinc-900/40">
              <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">
                Payment History ({order.payments.length})
              </span>
            </div>
            {order.payments.length === 0 ? (
              <p className="text-[13px] text-zinc-500 italic px-4 py-3">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Date</th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Method</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Amount</th>
                      <th className="text-center text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.payments.map(pmt => (
                      <tr key={pmt.id} className="border-b border-zinc-800/40 last:border-0">
                        <td className="py-2.5 px-3 text-[13px] text-zinc-400">{formatDate(pmt.createdAt)}</td>
                        <td className="py-2.5 px-3 text-[13px] text-zinc-300 capitalize">
                          {PAYMENT_METHOD_LABEL[pmt.method] ?? pmt.method}
                        </td>
                        <td className="py-2.5 px-3 text-[13px] text-right font-semibold text-emerald-400 tabular-nums">
                          {formatCurrency(pmt.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize
                            ${pmt.status === 'deposit'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : pmt.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-700/50 text-zinc-400 border border-zinc-700/50'
                            }`}
                          >
                            {pmt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Financial summary */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300 mb-3">Financial Summary</div>
            <div className="space-y-1.5 max-w-xs ml-auto text-[13px]">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tax</span>
                <span className="tabular-nums">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-zinc-100 border-t border-zinc-800/40 pt-1.5">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Paid</span>
                <span className="tabular-nums">{formatCurrency(paid)}</span>
              </div>
              <div className={`flex justify-between font-bold border-t border-zinc-800/40 pt-1.5 text-base
                ${balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}
              >
                <span>Balance Due</span>
                <span className="tabular-nums">{formatCurrency(balance)}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
