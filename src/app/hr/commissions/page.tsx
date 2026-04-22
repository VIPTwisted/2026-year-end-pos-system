export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

function formatPct(val: number): string {
  return `${(val * 100).toFixed(2)}%`
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'paid'
      ? 'bg-emerald-500/10 text-emerald-400'
      : status === 'approved'
      ? 'bg-blue-500/10 text-blue-400'
      : 'bg-amber-500/10 text-amber-400'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; status?: string; employeeId?: string }>
}) {
  const sp = await searchParams

  // Default period = current month
  const now = new Date()
  const currentPeriod = sp.period ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const commissions = await prisma.commission.findMany({
    where: {
      ...(sp.employeeId ? { employeeId: sp.employeeId } : {}),
      ...(sp.status ? { status: sp.status } : {}),
      period: currentPeriod,
    },
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true },
      },
      order: {
        select: { id: true, orderNumber: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Stats
  const pending = commissions.filter(c => c.status === 'pending')
  const approved = commissions.filter(c => c.status === 'approved')
  const paid = commissions.filter(c => c.status === 'paid')

  const totalPending = pending.reduce((acc, c) => acc + c.amount, 0)
  const totalApproved = approved.reduce((acc, c) => acc + c.amount, 0)
  const totalPaid = paid.reduce((acc, c) => acc + c.amount, 0)
  const grandTotal = commissions.reduce((acc, c) => acc + c.amount, 0)
  const avgPerOrder = commissions.length > 0 ? grandTotal / commissions.length : 0

  // Period navigation: prev / next month
  const [py, pm] = currentPeriod.split('-').map(Number)
  const prevDate = new Date(py, pm - 2, 1)
  const nextDate = new Date(py, pm, 1)
  const prevPeriod = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
  const nextPeriod = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`

  return (
    <>
      <TopBar title="Commission Tracking" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Commission Ledger</h1>
            <p className="text-[13px] text-zinc-500">{commissions.length} records · period {currentPeriod}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/hr/commissions/rates`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 text-[13px] font-medium hover:border-zinc-500 transition-colors"
            >
              Rate Config
            </Link>
            <Link
              href={`/hr/commissions/calculate?period=${currentPeriod}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
            >
              Calculate Period
            </Link>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-3">
          <Link
            href={`/hr/commissions?period=${prevPeriod}`}
            className="px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 text-[12px] hover:border-zinc-500 transition-colors"
          >
            ← {prevPeriod}
          </Link>
          <div className="px-4 py-1.5 rounded-md bg-[#16213e] border border-zinc-700 text-zinc-100 text-[13px] font-semibold">
            {currentPeriod}
          </div>
          <Link
            href={`/hr/commissions?period=${nextPeriod}`}
            className="px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 text-[12px] hover:border-zinc-500 transition-colors"
          >
            {nextPeriod} →
          </Link>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalPending)}</p>
            <p className="text-xs text-zinc-500 mt-1">{pending.length} commissions</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Approved</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalApproved)}</p>
            <p className="text-xs text-zinc-500 mt-1">{approved.length} commissions</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Paid This Month</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-zinc-500 mt-1">{paid.length} commissions</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Avg / Order</p>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(avgPerOrder)}</p>
            <p className="text-xs text-zinc-500 mt-1">{commissions.length} total orders</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Employee</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Order #</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Sale Amount</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rate %</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Commission</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Period</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 text-sm">
                    No commissions for period {currentPeriod}. Click &quot;Calculate Period&quot; to generate records.
                  </td>
                </tr>
              ) : (
                <>
                  {commissions.map(c => (
                    <tr key={c.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 text-zinc-200">
                        {c.employee.firstName} {c.employee.lastName}
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-400 text-[12px]">
                        #{c.order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-zinc-200">
                        {formatCurrency(c.saleAmount)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                        {formatPct(c.rate)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-emerald-400">
                        {formatCurrency(c.amount)}
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-500 text-[12px]">{c.period}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="border-t-2 border-zinc-700 bg-zinc-900/50">
                    <td colSpan={4} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Period Total
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-zinc-100 text-base">
                      {formatCurrency(grandTotal)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
