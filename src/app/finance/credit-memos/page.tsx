export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-emerald-500/10 text-emerald-400',
    partially_applied: 'bg-amber-500/10 text-amber-400',
    fully_used: 'bg-zinc-700/60 text-zinc-400',
    voided: 'bg-red-500/10 text-red-400',
  }
  const label: Record<string, string> = {
    open: 'Open',
    partially_applied: 'Partial',
    fully_used: 'Used',
    voided: 'Voided',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
        map[status] ?? 'bg-zinc-700/60 text-zinc-400'
      }`}
    >
      {label[status] ?? status}
    </span>
  )
}

export default async function CreditMemosPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [memos, issuedThisMonth, fullyUsedThisMonth] = await Promise.all([
    prisma.creditMemo.findMany({
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.creditMemo.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.creditMemo.count({
      where: {
        status: 'fully_used',
        updatedAt: { gte: startOfMonth },
      },
    }),
  ])

  const openMemos = memos.filter(m => m.status === 'open' || m.status === 'partially_applied')
  const totalOpenBalance = openMemos.reduce((sum, m) => sum + m.remaining, 0)

  const stats = [
    {
      label: 'Open Memos',
      value: openMemos.length.toString(),
      sub: 'open + partial',
    },
    {
      label: 'Open Balance',
      value: formatCurrency(totalOpenBalance),
      sub: 'remaining credit',
    },
    {
      label: 'Issued This Month',
      value: issuedThisMonth.toString(),
      sub: 'new credit memos',
    },
    {
      label: 'Fully Used This Month',
      value: fullyUsedThisMonth.toString(),
      sub: 'memos exhausted',
    },
  ]

  return (
    <>
      <TopBar
        title="Credit Memos"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <Link
            href="/finance/credit-memos/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-[12px] font-medium text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue Credit Memo
          </Link>
        }
      />

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
              <div
                key={s.label}
                className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5"
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                  {s.label}
                </div>
                <div className="text-2xl font-bold text-zinc-100 tabular-nums">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                All Credit Memos
              </span>
              <span className="text-[11px] text-zinc-600">{memos.length} total</span>
            </div>

            {memos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                <p className="text-[13px] mb-3">No credit memos yet</p>
                <Link
                  href="/finance/credit-memos/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-[12px] font-medium text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Issue Credit Memo
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/80 text-zinc-500 text-[11px] uppercase tracking-wide">
                      <th className="text-left px-5 py-2.5 font-medium">Memo #</th>
                      <th className="text-left py-2.5 font-medium">Customer</th>
                      <th className="text-right py-2.5 font-medium">Amount</th>
                      <th className="text-right py-2.5 font-medium">Remaining</th>
                      <th className="text-left py-2.5 font-medium">Issued</th>
                      <th className="text-left py-2.5 font-medium">Expires</th>
                      <th className="text-center px-5 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memos.map((memo, idx) => (
                      <tr
                        key={memo.id}
                        className={`hover:bg-zinc-800/30 transition-colors ${
                          idx !== memos.length - 1 ? 'border-b border-zinc-800/50' : ''
                        }`}
                      >
                        <td className="px-5 py-2.5">
                          <Link
                            href={`/finance/credit-memos/${memo.id}`}
                            className="font-mono text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {memo.memoNumber}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-6">
                          <Link
                            href={`/customers/${memo.customer.id}`}
                            className="text-zinc-300 hover:text-zinc-100 transition-colors"
                          >
                            {memo.customer.firstName} {memo.customer.lastName}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-6 text-right font-semibold tabular-nums text-zinc-200">
                          {formatCurrency(memo.amount)}
                        </td>
                        <td
                          className={`py-2.5 pr-6 text-right font-semibold tabular-nums ${
                            memo.remaining > 0 ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        >
                          {formatCurrency(memo.remaining)}
                        </td>
                        <td className="py-2.5 pr-6 text-zinc-500 text-[11px] whitespace-nowrap">
                          {formatDate(memo.createdAt)}
                        </td>
                        <td className="py-2.5 pr-6 text-zinc-500 text-[11px] whitespace-nowrap">
                          {memo.expiresAt ? formatDate(memo.expiresAt) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          <StatusBadge status={memo.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
