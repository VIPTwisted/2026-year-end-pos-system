import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { CalendarDays, DollarSign, TrendingUp, Users, Plus, ChevronRight } from 'lucide-react'

export default async function PayrollPage() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const [
    openPeriods,
    activeEmployees,
    ytdTotals,
    periods,
  ] = await Promise.all([
    prisma.payrollPeriod.count({ where: { status: 'open' } }),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.payrollEntry.aggregate({
      where: {
        period: {
          payDate: { gte: startOfYear },
          status: { in: ['processing', 'paid'] },
        },
      },
      _sum: { grossPay: true, netPay: true },
    }),
    prisma.payrollPeriod.findMany({
      orderBy: { payDate: 'desc' },
      include: {
        _count: { select: { entries: true } },
      },
    }),
  ])

  const avgPayPerEmployee =
    activeEmployees > 0 && ytdTotals._sum.netPay
      ? Number(ytdTotals._sum.netPay) / activeEmployees
      : 0

  const statusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400">
            Open
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400">
            Processing
          </span>
        )
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
            Paid
          </span>
        )
      case 'void':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400">
            Void
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-400">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Payroll"
        breadcrumb={[{ label: 'Home', href: '/' }]}
        actions={
          <Link
            href="/payroll/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Period
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Open Periods',
              value: openPeriods,
              icon: CalendarDays,
              color: 'text-amber-400',
              sub: 'Awaiting processing',
            },
            {
              label: 'Active Employees',
              value: activeEmployees,
              icon: Users,
              color: 'text-blue-400',
              sub: 'On payroll',
            },
            {
              label: 'Total Payroll YTD',
              value: formatCurrency(Number(ytdTotals._sum.grossPay ?? 0)),
              icon: DollarSign,
              color: 'text-emerald-400',
              sub: 'Gross pay this year',
            },
            {
              label: 'Avg Net Pay / Employee',
              value: formatCurrency(avgPayPerEmployee),
              icon: TrendingUp,
              color: 'text-cyan-400',
              sub: 'YTD average',
            },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-zinc-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Periods table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-zinc-100">Payroll Periods</h2>
            <span className="text-[11px] text-zinc-500">{periods.length} total</span>
          </div>

          {periods.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] text-zinc-500 mb-3">No payroll periods yet.</p>
              <Link
                href="/payroll/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Period
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Period</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date Range</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Pay Date</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Employees</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Gross</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Tax</th>
                    <th className="text-right px-5 pb-3 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr
                      key={period.id}
                      className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-5 py-3 font-semibold text-zinc-100">{period.name}</td>
                      <td className="px-3 py-3 text-zinc-400">
                        {new Date(period.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' — '}
                        {new Date(period.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {new Date(period.payDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-3 text-center">{statusBadge(period.status)}</td>
                      <td className="px-3 py-3 text-right text-zinc-400">{period._count.entries}</td>
                      <td className="px-3 py-3 text-right text-zinc-200 font-medium tabular-nums">
                        {formatCurrency(period.totalGross)}
                      </td>
                      <td className="px-3 py-3 text-right text-red-400 tabular-nums">
                        {formatCurrency(period.totalTax)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-emerald-400 font-semibold tabular-nums">
                            {formatCurrency(period.totalNet)}
                          </span>
                          <Link
                            href={`/payroll/${period.id}`}
                            className="flex items-center gap-0.5 text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
