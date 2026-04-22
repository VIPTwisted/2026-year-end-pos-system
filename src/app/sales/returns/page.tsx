import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, Plus, ArrowRight } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  pending:   'warning',
  approved:  'default',
  completed: 'success',
  rejected:  'destructive',
}

// Sales document pipeline steps
const PIPELINE = ['Pending', 'Approved', 'Completed']

export default async function ReturnsPage() {
  const [returns, allReturns] = await Promise.all([
    prisma.salesReturn.findMany({
      include: {
        customer:   { select: { id: true, firstName: true, lastName: true } },
        store:      { select: { name: true } },
        order:      { select: { id: true, orderNumber: true } },
        creditMemo: { select: { id: true, memoNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.salesReturn.findMany({
      select: { status: true, total: true, createdAt: true },
    }),
  ])

  const now          = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const total       = allReturns.length
  const pending     = allReturns.filter(r => r.status === 'pending').length
  const thisMonth   = allReturns.filter(r => new Date(r.createdAt) >= startOfMonth).length
  const refundTotal = allReturns.filter(r => r.status === 'completed').reduce((s, r) => s + r.total, 0)

  return (
    <>
      <TopBar title="Sales Returns" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Sales</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Sales Returns</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Manage customer returns and refunds</p>
            </div>
            <Link
              href="/sales/returns/new"
              className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Return
            </Link>
          </div>

          {/* Status pipeline */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-4 py-3 flex items-center gap-0">
            {PIPELINE.map((step, i) => (
              <div key={step} className="flex items-center gap-0">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium ${
                  step === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                  step === 'Approved' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-zinc-800/60 text-zinc-500'
                }`}>
                  <span className="text-[10px] font-bold">{i + 1}</span>
                  {step}
                </div>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-700 mx-1" />
                )}
              </div>
            ))}
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Returns',    value: total.toString(),            color: 'text-zinc-100' },
              { label: 'Pending Approval', value: pending.toString(),          color: 'text-amber-400' },
              { label: 'This Month',       value: thisMonth.toString(),        color: 'text-blue-400' },
              { label: 'Refund Total',     value: formatCurrency(refundTotal), color: 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">All Returns</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Returns table */}
          {returns.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
              <RotateCcw className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-[13px]">No returns found</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Return #', 'Customer', 'Original Order', 'Reason', 'Method', 'Total', 'Status', 'Date', ''].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                            h === 'Return #' || h === 'Customer' ? 'text-left' : h === '' ? 'text-right' : 'text-right'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {returns.map(r => (
                      <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-300">{r.returnNumber}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100">{r.customer.firstName} {r.customer.lastName}</td>
                        <td className="px-4 py-3 text-right">
                          {r.order ? (
                            <Link href={`/orders/${r.order.id}`} className="text-[11px] text-blue-400 hover:underline font-mono">
                              {r.order.orderNumber}
                            </Link>
                          ) : <span className="text-zinc-700 text-[11px]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-400 capitalize">{r.returnReason ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-400 capitalize">{r.refundMethod.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-right text-[13px] font-semibold text-emerald-400 tabular-nums">
                          {formatCurrency(r.total)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={STATUS_VARIANT[r.status] ?? 'secondary'} className="capitalize text-[11px]">
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-[11px] text-zinc-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/sales/returns/${r.id}`} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                            View <ArrowRight className="w-3 h-3" />
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
