export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'

type ZReportSummary = {
  transactionCount: number
  returnCount: number
  voidCount: number
  totalSales: number
  totalReturns: number
  netSales: number
  taxCollected: number
  discountTotal: number
  expectedCash: number
  actualCash: number | null
  variance: number | null
}

type TopItem = {
  productId: string
  name: string
  qty: number
  total: number
}

type PaymentRow = {
  method: string
  count: number
  amount: number
}

async function getZReport(id: string) {
  const shift = await prisma.posShift.findUnique({
    where: { id },
    include: {
      store: { select: { name: true, address: true, city: true, state: true } },
      orders: {
        include: { payments: true, items: true },
      },
    },
  })
  if (!shift) return null

  const orders = shift.orders.filter(o => o.status !== 'voided')
  const voidedOrders = shift.orders.filter(o => o.status === 'voided')
  const returnOrders = orders.filter(o => o.totalAmount < 0)
  const saleOrders = orders.filter(o => o.totalAmount >= 0)

  const paymentBreakdown: Record<string, { count: number; amount: number }> = {}
  for (const order of orders) {
    for (const p of order.payments) {
      if (!paymentBreakdown[p.method]) paymentBreakdown[p.method] = { count: 0, amount: 0 }
      paymentBreakdown[p.method].count += 1
      paymentBreakdown[p.method].amount += p.amount
    }
  }

  const totalSales = saleOrders.reduce((s, o) => s + o.totalAmount, 0)
  const totalReturns = Math.abs(returnOrders.reduce((s, o) => s + o.totalAmount, 0))
  const taxCollected = orders.reduce((s, o) => s + o.taxAmount, 0)
  const discountTotal = orders.reduce((s, o) => s + o.discountAmount, 0)
  const netSales = totalSales - totalReturns
  const cashIn = paymentBreakdown['cash']?.amount ?? 0
  const expectedCash = shift.openFloat + cashIn
  const variance = shift.closeFloat != null ? shift.closeFloat - expectedCash : null

  const topItems: TopItem[] = Object.entries(
    orders.flatMap(o => o.items).reduce<Record<string, { name: string; qty: number; total: number }>>((acc, item) => {
      if (!acc[item.productId]) acc[item.productId] = { name: item.productName, qty: 0, total: 0 }
      acc[item.productId].qty += item.quantity
      acc[item.productId].total += item.lineTotal
      return acc
    }, {})
  )
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([productId, v]) => ({ productId, ...v }))

  const paymentRows: PaymentRow[] = Object.entries(paymentBreakdown).map(([method, v]) => ({
    method,
    count: v.count,
    amount: v.amount,
  }))

  const summary: ZReportSummary = {
    transactionCount: saleOrders.length,
    returnCount: returnOrders.length,
    voidCount: voidedOrders.length,
    totalSales,
    totalReturns,
    netSales,
    taxCollected,
    discountTotal,
    expectedCash,
    actualCash: shift.closeFloat ?? null,
    variance,
  }

  return { shift, summary, paymentRows, topItems }
}

export default async function ZReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getZReport(id)
  if (!data) notFound()

  const { shift, summary, paymentRows, topItems } = data

  const varianceColor =
    summary.variance == null
      ? 'text-zinc-500'
      : summary.variance > 0
      ? 'text-emerald-400'
      : summary.variance < 0
      ? 'text-red-400'
      : 'text-zinc-400'

  const kpis: { label: string; value: string; color?: string }[] = [
    { label: 'Net Sales',      value: formatCurrency(summary.netSales),      color: 'text-emerald-400' },
    { label: 'Transactions',   value: String(summary.transactionCount) },
    { label: 'Returns',        value: String(summary.returnCount),            color: summary.returnCount > 0 ? 'text-red-400' : undefined },
    { label: 'Tax Collected',  value: formatCurrency(summary.taxCollected) },
    { label: 'Discounts',      value: formatCurrency(summary.discountTotal),  color: 'text-amber-400' },
    { label: 'Open Float',     value: formatCurrency(shift.openFloat) },
    { label: 'Close Float',    value: shift.closeFloat != null ? formatCurrency(shift.closeFloat) : '—' },
    {
      label: 'Variance',
      value: summary.variance == null
        ? '—'
        : `${summary.variance >= 0 ? '+' : ''}${formatCurrency(summary.variance)}`,
      color: varianceColor,
    },
  ]

  return (
    <>
      <TopBar
        title="Z-Report"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/shifts"
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded text-[12px] font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-700/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Shifts
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Z-Report
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh] px-6 pb-10">

        {/* ── Report header ──────────────────────────────────────────── */}
        <div className="pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">
                  Z-Report — Shift Close
                </h1>
                {shift.status === 'open' ? (
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border bg-emerald-950/60 text-emerald-400 border-emerald-800/40">
                    Open
                  </span>
                ) : (
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium border bg-zinc-800/60 text-zinc-400 border-zinc-700/40">
                    Closed
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-0.5 mt-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Store</span>
                  <p className="text-[13px] text-zinc-300">{shift.store?.name ?? '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cashier</span>
                  <p className="text-[13px] text-zinc-300">{shift.cashierName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Register</span>
                  <p className="text-[13px] font-mono text-zinc-300">{shift.registerId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Shift ID</span>
                  <p className="text-[11px] font-mono text-zinc-500 truncate">{shift.id}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Opened</span>
                  <p className="text-[13px] text-zinc-300">{formatDate(shift.openTime)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Closed</span>
                  <p className="text-[13px] text-zinc-300">
                    {shift.closeTime ? formatDate(shift.closeTime) : <span className="text-zinc-600">Still open</span>}
                  </p>
                </div>
                {shift.store?.address && (
                  <div className="col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Address</span>
                    <p className="text-[13px] text-zinc-400">
                      {shift.store.address}, {shift.store.city}, {shift.store.state}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {kpis.map(kpi => (
            <div key={kpi.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                {kpi.label}
              </div>
              <div className={`text-[18px] font-semibold tabular-nums ${kpi.color ?? 'text-zinc-100'}`}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Payment breakdown ──────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/40">
              <h2 className="text-[12px] font-semibold text-zinc-100 uppercase tracking-widest">
                Payment Breakdown
              </h2>
            </div>
            {paymentRows.length === 0 ? (
              <p className="px-4 py-6 text-[13px] text-zinc-500 text-center">No payments recorded</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-2 font-medium">Method</th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-2 font-medium">Count</th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map(row => (
                    <tr key={row.method} className="border-b border-zinc-800/30 last:border-0">
                      <td className="px-4 py-2.5 text-[13px] text-zinc-300 capitalize">{row.method}</td>
                      <td className="px-4 py-2.5 text-[13px] text-right tabular-nums text-zinc-400">{row.count}</td>
                      <td className="px-4 py-2.5 text-[13px] text-right tabular-nums font-medium text-zinc-200">
                        {formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-zinc-800/20">
                    <td className="px-4 py-2.5 text-[12px] font-semibold text-zinc-400 uppercase tracking-widest">Total</td>
                    <td className="px-4 py-2.5 text-[13px] text-right tabular-nums text-zinc-400">
                      {paymentRows.reduce((s, r) => s + r.count, 0)}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-right tabular-nums font-semibold text-emerald-400">
                      {formatCurrency(paymentRows.reduce((s, r) => s + r.amount, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* ── Top items ──────────────────────────────────────────── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/40">
              <h2 className="text-[12px] font-semibold text-zinc-100 uppercase tracking-widest">
                Top 10 Items Sold
              </h2>
            </div>
            {topItems.length === 0 ? (
              <p className="px-4 py-6 text-[13px] text-zinc-500 text-center">No items sold this shift</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-2 font-medium">Product</th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-2 font-medium">Qty</th>
                    <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item, i) => (
                    <tr key={item.productId} className="border-b border-zinc-800/30 last:border-0">
                      <td className="px-4 py-2.5 text-[13px] text-zinc-300">
                        <span className="text-zinc-600 mr-2 tabular-nums">{i + 1}.</span>
                        {item.name}
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-right tabular-nums text-zinc-400">{item.qty}</td>
                      <td className="px-4 py-2.5 text-[13px] text-right tabular-nums font-medium text-zinc-200">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Voids row ──────────────────────────────────────────────── */}
        {summary.voidCount > 0 && (
          <div className="mt-4 bg-red-950/20 border border-red-900/30 rounded-lg px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500">Voided Transactions</span>
            <p className="text-[14px] font-semibold text-red-400 mt-0.5">{summary.voidCount} voided</p>
          </div>
        )}
      </main>
    </>
  )
}
