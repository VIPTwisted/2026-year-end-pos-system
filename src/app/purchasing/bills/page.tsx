export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATUS_STYLE: Record<string, string> = {
  draft:     'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40',
  posted:    'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  matched:   'bg-violet-500/15 text-violet-400 border border-violet-500/30',
  partial:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  paid:      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
}

function ageDays(date: Date | string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

function isOverdue(dueDate: Date | string, status: string): boolean {
  if (['paid', 'cancelled'].includes(status)) return false
  return new Date(dueDate) < new Date()
}

function isDueThisWeek(dueDate: Date | string, status: string): boolean {
  if (['paid', 'cancelled'].includes(status)) return false
  const due  = new Date(dueDate)
  const now  = new Date()
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return due >= now && due <= week
}

export default async function VendorBillsPage() {
  const bills = await prisma.vendorInvoice.findMany({
    include: { vendor: true },
    orderBy: { invoiceDate: 'desc' },
    take: 300,
  })

  // Stats
  const now   = new Date()
  const month = now.getMonth()
  const year  = now.getFullYear()

  const totalOutstanding = bills
    .filter(b => !['paid', 'cancelled'].includes(b.status))
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0)

  const overdueCount = bills.filter(b => isOverdue(b.dueDate, b.status)).length

  const dueThisWeek = bills.filter(b => isDueThisWeek(b.dueDate, b.status)).length

  const totalPaidThisMonth = bills
    .filter(b => {
      const d = new Date(b.updatedAt)
      return b.status === 'paid' && d.getMonth() === month && d.getFullYear() === year
    })
    .reduce((sum, b) => sum + b.paidAmount, 0)

  const stats = [
    {
      label:   'Total Outstanding',
      value:   formatCurrency(totalOutstanding),
      accent:  'bg-amber-500',
      color:   'text-amber-400',
    },
    {
      label:   'Overdue Bills',
      value:   overdueCount,
      accent:  'bg-rose-500',
      color:   overdueCount > 0 ? 'text-rose-400' : 'text-zinc-400',
    },
    {
      label:   'Due This Week',
      value:   dueThisWeek,
      accent:  'bg-blue-500',
      color:   dueThisWeek > 0 ? 'text-blue-400' : 'text-zinc-400',
    },
    {
      label:   'Paid This Month',
      value:   formatCurrency(totalPaidThisMonth),
      accent:  'bg-emerald-500',
      color:   'text-emerald-400',
    },
  ]

  return (
    <>
      <TopBar title="Vendor Bills" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Vendor Bills</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              {bills.length} bills · Accounts Payable
            </p>
          </div>
          <Link href="/purchasing/bills/new">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded">
              <Plus className="w-3.5 h-3.5 mr-1.5" />New Bill
            </Button>
          </Link>
        </div>

        {/* ── Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div
              key={s.label}
              className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden"
            >
              <div className={`h-[3px] w-full ${s.accent}`} />
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        {bills.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-500">
            <p className="text-[13px] mb-4">No vendor bills yet</p>
            <Link href="/purchasing/bills/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded">
                <Plus className="w-3.5 h-3.5 mr-1.5" />New Bill
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Bill #</th>
                    <th className="text-left py-2.5 font-medium">Supplier</th>
                    <th className="text-left py-2.5 font-medium">Bill Date</th>
                    <th className="text-left py-2.5 font-medium">Due Date</th>
                    <th className="text-right py-2.5 font-medium">Total</th>
                    <th className="text-right py-2.5 font-medium">Paid</th>
                    <th className="text-right py-2.5 font-medium">Balance</th>
                    <th className="text-center py-2.5 font-medium">Status</th>
                    <th className="text-right px-4 py-2.5 font-medium">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b, idx) => {
                    const balance  = b.totalAmount - b.paidAmount
                    const overdue  = isOverdue(b.dueDate, b.status)
                    const age      = ageDays(b.invoiceDate)

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-zinc-800/30 transition-colors ${
                          idx !== bills.length - 1 ? 'border-b border-zinc-800/50' : ''
                        }`}
                      >
                        <td className="px-4 py-2 font-mono text-[11px]">
                          <Link
                            href={`/purchasing/bills/${b.id}`}
                            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                          >
                            {b.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-2 pr-6 text-zinc-200 font-medium">
                          {b.vendor?.name ?? '—'}
                        </td>
                        <td className="py-2 pr-6 text-zinc-500 text-[11px] whitespace-nowrap">
                          {formatDate(b.invoiceDate)}
                        </td>
                        <td className={`py-2 pr-6 text-[11px] whitespace-nowrap ${
                          overdue ? 'text-rose-400 font-medium' : 'text-zinc-500'
                        }`}>
                          {formatDate(b.dueDate)}
                          {overdue && (
                            <span className="ml-1 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-6 text-right font-semibold text-zinc-100 tabular-nums">
                          {formatCurrency(b.totalAmount)}
                        </td>
                        <td className="py-2 pr-6 text-right text-emerald-400 tabular-nums">
                          {b.paidAmount > 0 ? formatCurrency(b.paidAmount) : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className={`py-2 pr-6 text-right font-semibold tabular-nums ${
                          balance > 0 && !['paid', 'cancelled'].includes(b.status)
                            ? 'text-amber-400'
                            : 'text-zinc-500'
                        }`}>
                          {balance > 0 && !['paid', 'cancelled'].includes(b.status)
                            ? formatCurrency(balance)
                            : <span className="text-zinc-600">—</span>
                          }
                        </td>
                        <td className="py-2 pr-6 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            STATUS_STYLE[b.status] ?? 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-zinc-500 text-[11px] tabular-nums">
                          {age}d
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
