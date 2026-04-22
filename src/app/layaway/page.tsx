export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATUS_STYLES: Record<string, string> = {
  layaway:   'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  paid:      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/30',
}

export default async function LayawayPage() {
  const orders = await prisma.order.findMany({
    where: { status: 'layaway' },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  // Stats
  const totalLayaways = orders.length
  const totalValue = orders.reduce((s, o) => s + o.totalAmount, 0)
  const totalDeposits = orders.reduce((s, o) => {
    return s + o.payments.filter(p => p.status === 'deposit').reduce((ps, p) => ps + p.amount, 0)
  }, 0)
  const outstandingBalance = totalValue - totalDeposits

  return (
    <>
      <TopBar
        title="Layaway Orders"
        actions={
          <Link href="/layaway/new">
            <Button size="sm" className="h-8 text-[13px] gap-1.5 bg-blue-600 hover:bg-blue-500 text-white border-0">
              <Plus className="w-3.5 h-3.5" />
              New Layaway
            </Button>
          </Link>
        }
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Page header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">Layaway Orders</h1>
            <p className="text-[12px] text-zinc-500 mt-0.5">{totalLayaways} active layaway{totalLayaways !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 px-6 pb-6 md:grid-cols-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Layaways</div>
            <div className="text-2xl font-bold text-zinc-100">{totalLayaways}</div>
            <div className="text-xs text-zinc-500 mt-1">active orders</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Value</div>
            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-zinc-500 mt-1">gross layaway value</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Deposits Collected</div>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalDeposits)}</div>
            <div className="text-xs text-zinc-500 mt-1">payments received</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Outstanding Balance</div>
            <div className="text-2xl font-bold text-amber-400">{formatCurrency(outstandingBalance)}</div>
            <div className="text-xs text-zinc-500 mt-1">still owed</div>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 pb-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-lg border border-zinc-800/50">
              <Archive className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-[13px] text-zinc-500 mb-1">No layaway orders</p>
              <p className="text-[12px] text-zinc-600 mb-4">Create a layaway to hold items for a customer</p>
              <Link href="/layaway/new">
                <Button size="sm" className="h-8 text-[13px] bg-blue-600 hover:bg-blue-500 text-white border-0">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Layaway
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] rounded-lg border border-zinc-800/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Order #</th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Customer</th>
                      <th className="text-left text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Date</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Items</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Total</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Deposit Paid</th>
                      <th className="text-right text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Balance Due</th>
                      <th className="text-center text-[10px] uppercase tracking-widest text-zinc-500 pb-2 pt-3 px-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const depositPaid = o.payments
                        .filter(p => p.status === 'deposit')
                        .reduce((s, p) => s + p.amount, 0)
                      const balance = o.totalAmount - depositPaid
                      const statusStyle = STATUS_STYLES[o.status] ?? 'bg-zinc-800/60 text-zinc-500'
                      return (
                        <tr
                          key={o.id}
                          className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <Link
                              href={`/layaway/${o.id}`}
                              className="font-mono text-[13px] text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              {o.orderNumber}
                            </Link>
                          </td>
                          <td className="py-2.5 px-3 text-[13px] text-zinc-300">
                            {o.customer
                              ? `${o.customer.firstName} ${o.customer.lastName}`
                              : <span className="text-zinc-500 italic">Unknown</span>
                            }
                          </td>
                          <td className="py-2.5 px-3 text-[13px] text-zinc-400">{formatDate(o.createdAt)}</td>
                          <td className="py-2.5 px-3 text-[13px] text-right text-zinc-400 tabular-nums">{o.items.length}</td>
                          <td className="py-2.5 px-3 text-[13px] text-right font-semibold text-zinc-100 tabular-nums">
                            {formatCurrency(o.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-[13px] text-right text-emerald-400 tabular-nums">
                            {formatCurrency(depositPaid)}
                          </td>
                          <td className="py-2.5 px-3 text-[13px] text-right font-semibold tabular-nums">
                            <span className={balance > 0 ? 'text-red-400' : 'text-emerald-400'}>
                              {formatCurrency(balance)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusStyle}`}>
                              {o.status}
                            </span>
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
