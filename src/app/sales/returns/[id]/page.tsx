import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RotateCcw, User, Receipt } from 'lucide-react'
import { ReturnActions } from './ReturnActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  pending: 'warning',
  approved: 'default',
  completed: 'success',
  rejected: 'destructive',
}

const CONDITION_COLOR: Record<string, string> = {
  good: 'text-emerald-400',
  opened: 'text-amber-400',
  damaged: 'text-red-400',
}

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

export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const salesReturn = await prisma.salesReturn.findUnique({
    where: { id },
    include: {
      customer: true,
      store: { select: { id: true, name: true } },
      order: { select: { id: true, orderNumber: true } },
      lines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
      creditMemo: true,
    },
  })

  if (!salesReturn) notFound()

  const showActions = ['pending', 'approved'].includes(salesReturn.status)

  return (
    <>
      <TopBar title={`Return ${salesReturn.returnNumber}`} />
      <main className="flex-1 overflow-auto bg-zinc-950">

        {/* D365 Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/sales/returns"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Returns
              </Link>
              <span className="text-zinc-700">/</span>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-zinc-400" />
                <span className="font-mono text-lg font-bold text-zinc-100 tracking-tight">{salesReturn.returnNumber}</span>
              </div>
              <Badge variant={STATUS_VARIANT[salesReturn.status] ?? 'secondary'} className="capitalize">
                {salesReturn.status}
              </Badge>
            </div>
            {showActions && (
              <div className="flex items-center gap-2">
                <ReturnActions returnId={salesReturn.id} status={salesReturn.status} />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* General FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="General" />
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              <Field label="Store" value={salesReturn.store.name} />
              <Field
                label="Customer"
                value={
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-500" />
                    <Link href={`/customers/${salesReturn.customer.id}`} className="text-blue-400 hover:underline">
                      {salesReturn.customer.firstName} {salesReturn.customer.lastName}
                    </Link>
                  </span>
                }
              />
              {salesReturn.customer.email && <Field label="Customer Email" value={salesReturn.customer.email} />}
              {salesReturn.customer.phone && <Field label="Customer Phone" value={salesReturn.customer.phone} />}
              {salesReturn.order && (
                <Field
                  label="Original Order"
                  value={
                    <Link href={`/orders/${salesReturn.order.id}`} className="text-blue-400 hover:underline font-mono">
                      {salesReturn.order.orderNumber}
                    </Link>
                  }
                />
              )}
              <Field label="Return Reason" value={<span className="capitalize">{salesReturn.returnReason ?? '—'}</span>} />
              <Field label="Refund Method" value={<span className="capitalize">{salesReturn.refundMethod.replace('_', ' ')}</span>} />
              <Field label="Date" value={formatDate(salesReturn.createdAt)} />
              {salesReturn.notes && (
                <div className="col-span-2">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Notes</p>
                  <p className="text-[13px] text-zinc-400 whitespace-pre-wrap">{salesReturn.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Return Items FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="Return Items" count={salesReturn.lines.length} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    {['Product', 'SKU', 'Qty', 'Unit Price', 'Condition', 'Restockable', 'Total'].map(h => (
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
                  {salesReturn.lines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2 text-[13px] text-zinc-100">{line.product.name}</td>
                      <td className="px-4 py-2 text-right font-mono text-[11px] text-zinc-500">{line.product.sku}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-300">{line.quantity}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-400">{formatCurrency(line.unitPrice)}</td>
                      <td className={`px-4 py-2 text-right text-[11px] capitalize font-medium ${CONDITION_COLOR[line.condition] ?? 'text-zinc-400'}`}>
                        {line.condition}
                      </td>
                      <td className="px-4 py-2 text-right text-[11px]">
                        <span className={line.restockable ? 'text-emerald-400' : 'text-zinc-600'}>
                          {line.restockable ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-[13px] text-emerald-400 font-semibold">
                        {formatCurrency(line.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Credit Memo FastTab */}
          {salesReturn.creditMemo && (
            <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
              <FastTabHeader label="Credit Memo" />
              <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
                <Field
                  label="Memo #"
                  value={
                    <span className="flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-zinc-500" />
                      <Link href={`/sales/credit-memos/${salesReturn.creditMemo.id}`} className="font-mono text-blue-400 hover:underline">
                        {salesReturn.creditMemo.memoNumber}
                      </Link>
                    </span>
                  }
                />
                <Field label="Amount" value={formatCurrency(salesReturn.creditMemo.amount)} />
                <Field label="Remaining" value={<span className="text-emerald-400 font-semibold">{formatCurrency(salesReturn.creditMemo.remaining)}</span>} />
                <Field label="Status" value={<span className="capitalize">{salesReturn.creditMemo.status.replace('_', ' ')}</span>} />
              </div>
            </div>
          )}

          {/* Footer Totals */}
          <div className="flex justify-end">
            <div className="w-56 border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/30">
              {[
                { label: 'Subtotal', value: formatCurrency(salesReturn.subtotal) },
                { label: 'Tax Refund', value: formatCurrency(salesReturn.taxRefund) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-1.5 border-b border-zinc-800/40 text-[13px]">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-300">{value}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-2.5 bg-zinc-800/40">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">Total Refund</span>
                <span className="text-[15px] font-bold text-emerald-400">{formatCurrency(salesReturn.total)}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
