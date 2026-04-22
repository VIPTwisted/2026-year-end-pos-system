export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d)
}

type AgingBucket = 'current' | 'days31to60' | 'days61to90' | 'over90'

interface APAgingRow {
  id: string
  invoiceNumber: string
  vendorId: string
  vendorName: string
  invoiceDate: Date
  dueDate: Date
  totalAmount: number
  paidAmount: number
  balance: number
  bucket: AgingBucket
  daysPastDue: number
}

function getBucket(daysPastDue: number): AgingBucket {
  if (daysPastDue <= 0) return 'current'
  if (daysPastDue <= 30) return 'current'
  if (daysPastDue <= 60) return 'days31to60'
  if (daysPastDue <= 90) return 'days61to90'
  return 'over90'
}

const bucketLabel: Record<AgingBucket, string> = {
  current:    'Current (0-30)',
  days31to60: '31-60 Days',
  days61to90: '61-90 Days',
  over90:     '90+ Days',
}

const bucketColor: Record<AgingBucket, string> = {
  current:    'text-emerald-400',
  days31to60: 'text-amber-400',
  days61to90: 'text-orange-400',
  over90:     'text-red-400',
}

const bucketBadge: Record<AgingBucket, string> = {
  current:    'bg-emerald-500/10 text-emerald-400',
  days31to60: 'bg-amber-500/10 text-amber-400',
  days61to90: 'bg-orange-500/10 text-orange-400',
  over90:     'bg-red-500/10 text-red-400',
}

export default async function APAgingPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const invoices = await prisma.vendorInvoice.findMany({
    where: {
      status: { in: ['posted', 'partial', 'matched'] },
    },
    include: {
      vendor: {
        select: { id: true, name: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  const rows: APAgingRow[] = invoices
    .map((inv) => {
      const balance = inv.totalAmount - inv.paidAmount
      const due = new Date(inv.dueDate)
      due.setHours(0, 0, 0, 0)
      const msDiff = today.getTime() - due.getTime()
      const daysPastDue = Math.floor(msDiff / (1000 * 60 * 60 * 24))
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        vendorId: inv.vendorId,
        vendorName: inv.vendor.name,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balance,
        bucket: getBucket(daysPastDue),
        daysPastDue,
      }
    })
    .filter((r) => r.balance > 0.005)

  const bucketTotal = (b: AgingBucket) =>
    rows.filter((r) => r.bucket === b).reduce((s, r) => s + r.balance, 0)

  const currentTotal  = bucketTotal('current')
  const b3160         = bucketTotal('days31to60')
  const b6190         = bucketTotal('days61to90')
  const over90Total   = bucketTotal('over90')
  const grandTotal    = currentTotal + b3160 + b6190 + over90Total
  const pastDueTotal  = b3160 + b6190 + over90Total

  // Oldest bill = highest daysPastDue among open rows
  const oldestRow = rows.reduce<APAgingRow | null>((max, r) =>
    max === null || r.daysPastDue > max.daysPastDue ? r : max, null)

  // Summary per bucket for footer
  const buckets: AgingBucket[] = ['current', 'days31to60', 'days61to90', 'over90']

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="AP Aging Report"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
      />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Total AP Outstanding
            </div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums font-mono">
              {formatCurrency(grandTotal)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {rows.length} open {rows.length === 1 ? 'bill' : 'bills'}
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Current (0-30)
            </div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums font-mono">
              {formatCurrency(currentTotal)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {rows.filter((r) => r.bucket === 'current').length} bills
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Past Due (31+ Days)
            </div>
            <div className="text-2xl font-bold text-red-400 tabular-nums font-mono">
              {formatCurrency(pastDueTotal)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {rows.filter((r) => r.bucket !== 'current').length} bills overdue
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Oldest Bill
            </div>
            {oldestRow ? (
              <>
                <div className="text-2xl font-bold text-amber-400 tabular-nums font-mono">
                  {oldestRow.daysPastDue > 0 ? `${oldestRow.daysPastDue}d` : 'Current'}
                </div>
                <div className="text-xs text-zinc-500 mt-1 truncate" title={oldestRow.vendorName}>
                  {oldestRow.vendorName}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-zinc-500">—</div>
                <div className="text-xs text-zinc-500 mt-1">No open bills</div>
              </>
            )}
          </div>
        </div>

        {/* Detail table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Open Vendor Bills</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">{rows.length} records</span>
              <Link
                href="/api/finance/ap-aging/export"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                Export CSV
              </Link>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500">No outstanding AP bills. All vendor accounts are settled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Vendor / Supplier
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Bill #
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Bill Date
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Due Date
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Amount
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Paid
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Balance
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Days Past Due
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
                        <span className="text-sm text-zinc-200 font-medium">{row.vendorName}</span>
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
                            row.daysPastDue > 0 ? 'text-red-400' : 'text-zinc-400'
                          }`}
                        >
                          {fmtDate(row.dueDate)}
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
                          {formatCurrency(row.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.daysPastDue > 0 ? (
                          <span className="font-mono text-sm text-red-400">
                            {row.daysPastDue}d
                          </span>
                        ) : (
                          <span className="text-sm text-zinc-500">—</span>
                        )}
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
                {/* Summary per bucket + grand total */}
                <tfoot>
                  {buckets.map((b) => {
                    const bRows = rows.filter((r) => r.bucket === b)
                    if (bRows.length === 0) return null
                    return (
                      <tr key={b} className="border-t border-zinc-800/40 bg-zinc-900/20">
                        <td colSpan={6} className="px-5 py-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-widest ${bucketColor[b]}`}>
                            {bucketLabel[b]} — {bRows.length} {bRows.length === 1 ? 'bill' : 'bills'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className={`font-mono text-sm font-bold tabular-nums ${bucketColor[b]}`}>
                            {formatCurrency(bucketTotal(b))}
                          </span>
                        </td>
                        <td colSpan={2} />
                      </tr>
                    )
                  })}
                  <tr className="border-t border-zinc-700 bg-zinc-900/40">
                    <td colSpan={4} className="px-5 py-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        Total Outstanding AP
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-zinc-100 tabular-nums">
                        {formatCurrency(rows.reduce((s, r) => s + r.totalAmount, 0))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(rows.reduce((s, r) => s + r.paidAmount, 0))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-zinc-100 tabular-nums">
                        {formatCurrency(grandTotal)}
                      </span>
                    </td>
                    <td colSpan={2} />
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
