import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, CalendarDays, DollarSign, TrendingUp, Plus, ChevronRight } from 'lucide-react'

export default async function PayrollPage() {
  const [
    activeEmployees,
    openPeriods,
    payrollTotals,
    periods,
  ] = await Promise.all([
    prisma.employee.count({ where: { isActive: true } }),
    prisma.payrollPeriod.count({ where: { status: 'open' } }),
    prisma.payrollEntry.aggregate({
      where: { period: { status: { in: ['posted', 'closed'] } } },
      _sum: { grossPay: true, netPay: true },
    }),
    prisma.payrollPeriod.findMany({
      orderBy: { payDate: 'desc' },
      include: {
        _count: { select: { entries: true } },
        entries: {
          select: { grossPay: true, netPay: true },
        },
      },
    }),
  ])

  const statusBadge = (status: string) => {
    switch (status) {
      case 'open':       return <Badge variant="default">Open</Badge>
      case 'processing': return <Badge variant="warning">Processing</Badge>
      case 'posted':     return <Badge variant="success">Posted</Badge>
      case 'closed':     return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">Closed</Badge>
      default:           return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <>
      <TopBar title="Payroll" />
      <main className="flex-1 p-6 space-y-6 overflow-auto">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Active Employees</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-100">{activeEmployees}</div>
              <div className="text-xs text-zinc-500 mt-1">On payroll</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Open Periods</span>
                <CalendarDays className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{openPeriods}</div>
              <div className="text-xs text-zinc-500 mt-1">Awaiting processing</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Total Gross Pay</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(Number(payrollTotals._sum.grossPay ?? 0))}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Posted + closed periods</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Total Net Pay</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {formatCurrency(Number(payrollTotals._sum.netPay ?? 0))}
              </div>
              <div className="text-xs text-zinc-500 mt-1">After all deductions</div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Periods Table */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Payroll Periods</CardTitle>
            <Link
              href="/hr/payroll/new"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-3 h-3" />
              New Payroll Period
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {periods.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-zinc-500">
                No payroll periods yet.{' '}
                <Link href="/hr/payroll/new" className="text-blue-400 hover:underline">Create one</Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-5 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Period</th>
                    <th className="text-left px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date Range</th>
                    <th className="text-left px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Pay Date</th>
                    <th className="text-center px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Entries</th>
                    <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Gross</th>
                    <th className="text-right px-5 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => {
                    const gross = period.entries.reduce((s, e) => s + e.grossPay, 0)
                    const net   = period.entries.reduce((s, e) => s + e.netPay, 0)
                    return (
                      <tr key={period.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-zinc-100">
                          <div className="flex items-center gap-2">
                            {period.name}
                            {period.fiscalYear && (
                              <span className="text-xs text-zinc-600 font-normal">{period.fiscalYear}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-zinc-400 text-xs">
                          {new Date(period.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' — '}
                          {new Date(period.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-3 text-zinc-300 text-xs">
                          {new Date(period.payDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {statusBadge(period.status)}
                        </td>
                        <td className="px-3 py-3 text-right text-zinc-400">{period._count.entries}</td>
                        <td className="px-3 py-3 text-right text-zinc-200 font-medium">
                          {formatCurrency(gross)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-emerald-400 font-semibold">{formatCurrency(net)}</span>
                            {(period.status === 'open' || period.status === 'processing') && (
                              <Link
                                href={`/hr/payroll/${period.id}`}
                                className="flex items-center gap-0.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                              >
                                Process <ChevronRight className="w-3 h-3" />
                              </Link>
                            )}
                            {(period.status === 'posted' || period.status === 'closed') && (
                              <Link
                                href={`/hr/payroll/${period.id}`}
                                className="flex items-center gap-0.5 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                              >
                                View <ChevronRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
