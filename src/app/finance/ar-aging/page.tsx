export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d)
}

type AgingBucket = 'current' | 'days31to60' | 'days61to90' | 'over90'

interface AgingRow {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  invoiceDate: Date
  dueDate: Date
  totalAmount: number
  paidAmount: number
  outstanding: number
  bucket: AgingBucket
  daysOverdue: number
}

function getBucket(daysOverdue: number): AgingBucket {
  if (daysOverdue <= 0) return 'current'
  if (daysOverdue <= 30) return 'current'
  if (daysOverdue <= 60) return 'days31to60'
  if (daysOverdue <= 90) return 'days61to90'
  return 'over90'
}

export default async function ARAgingPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const invoices = await prisma.customerInvoice.findMany({
    where: {
      status: { in: ['posted', 'partial'] },
    },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  const rows: AgingRow[] = invoices
    .map((inv) => {
      const outstanding = inv.totalAmount - inv.paidAmount
      const due = new Date(inv.dueDate)
      due.setHours(0, 0, 0, 0)
      const msDiff = today.getTime() - due.getTime()
      const daysOverdue = Math.floor(msDiff / (1000 * 60 * 60 * 24))
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customerName: `${inv.customer.firstName} ${inv.customer.lastName}`,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        outstanding,
        bucket: getBucket(daysOverdue),
        daysOverdue,
      }
    })
    .filter((r) => r.outstanding > 0.005)

  const bucketTotal = (b: AgingBucket) =>
    rows.filter((r) => r.bucket === b).reduce((s, r) => s + r.outstanding, 0)

  const currentTotal = bucketTotal('current')
  const b3160 = bucketTotal('days31to60')
  const b6190 = bucketTotal('days61to90')
  const over90 = bucketTotal('over90')
  const grandTotal = currentTotal + b3160 + b6190 + over90

  const bucketLabel: Record<AgingBucket, string> = {
    current: 'Current (0-30)',
    days31to60: '31-60 Days',
    days61to90: '61-90 Days',
    over90: '90+ Days',
  }

  const bucketColor: Record<AgingBucket, string> = {
    current: 'text-emerald-400',
    days31to60: 'text-amber-400',
    days61to90: 'text-orange-400',
    over90: 'text-red-400',
  }

  const bucketBadge: Record<AgingBucket, string> = {
    current: 'bg-emerald-500/10 text-emerald-400',
    days31to60: 'bg-amber-500/10 text-amber-400',
    days61to90: 'bg-orange-500/10 text-orange-400',
    over90: 'bg-red-500/10 text-red-400',
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="AR Aging Report"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
      />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Current (0-30)
            </div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums font-mono">
              {formatCurrency(currentTotal)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {rows.filter((r) => r.bucket === 'current').length} invoices
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              31-60 Days
            </div>
            <div className="text-xl font-bold text-amber-400 tabular-nums font-mono">
              {formatCurrency(b3160)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {rows.filter((r) => r.bucket === 'days31to60').length} invoices
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              61-90 Days
            </div>
            <div className="text-xl font-bold text-orange-400 tabular-nums font-mono">
              {formatCurrency(b6190)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {rows.filter((r) => r.bucket === 'days61to90').length} invoices
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              90+ Days
            </div>
            <div className="text-xl font-bold text-red-400 tabular-nums font-mono">
              {formatCurrency(over90)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {rows.filter((r) => r.bucket === 'over90').length} invoices
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 border-blue-500/20">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Total Outstanding
            </div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums font-mono">
              {formatCurrency(grandTotal)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {rows.length} open invoices
            </div>
          </div>
        </div>

        {/* Detail table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Open Invoices</h2>
            <span className="text-xs text-zinc-500">{rows.length} records</span>
          </div>

          {rows.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500">No outstanding AR invoices. All accounts are settled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Invoice #
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Invoice Date
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Due Date
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Total
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Paid
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Outstanding
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Aging
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm text-zinc-200 font-medium">{row.customerName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">
                          {row.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-400">{fmtDate(row.invoiceDate)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-medium ${
                            row.daysOverdue > 0 ? 'text-red-400' : 'text-zinc-400'
                          }`}
                        >
                          {fmtDate(row.dueDate)}
                          {row.daysOverdue > 0 && (
                            <span className="ml-1 text-[11px] text-red-500">
                              ({row.daysOverdue}d)
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-zinc-300 tabular-nums">
                          {formatCurrency(row.totalAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-emerald-400 tabular-nums">
                          {formatCurrency(row.paidAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-mono text-sm font-bold tabular-nums ${bucketColor[row.bucket]}`}
                        >
                          {formatCurrency(row.outstanding)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${bucketBadge[row.bucket]}`}
                        >
                          {bucketLabel[row.bucket]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Grand total row */}
                <tfoot>
                  <tr className="border-t border-zinc-700 bg-zinc-900/40">
                    <td colSpan={4} className="px-5 py-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        Total Outstanding AR
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-zinc-100 tabular-nums">
                        {formatCurrency(
                          invoices
                            .filter((i) => rows.some((r) => r.id === i.id))
                            .reduce((s, i) => s + i.totalAmount, 0)
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(
                          invoices
                            .filter((i) => rows.some((r) => r.id === i.id))
                            .reduce((s, i) => s + i.paidAmount, 0)
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-zinc-100 tabular-nums">
                        {formatCurrency(grandTotal)}
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
