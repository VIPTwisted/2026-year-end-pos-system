export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { FiscalPeriodActions } from './FiscalPeriodActions'

function fyStatusVariant(status: string): 'default' | 'warning' | 'secondary' | 'outline' {
  if (status === 'open') return 'default'
  if (status === 'closing') return 'warning'
  return 'secondary'
}

function periodStatusVariant(status: string): 'success' | 'secondary' | 'warning' {
  if (status === 'open') return 'success'
  if (status === 'on_hold') return 'warning'
  return 'secondary'
}

function yearCloseStatusVariant(status: string): 'success' | 'warning' | 'secondary' | 'destructive' {
  if (status === 'completed') return 'success'
  if (status === 'in_progress') return 'warning'
  if (status === 'reversed') return 'destructive'
  return 'secondary'
}

export default async function FiscalPage() {
  const fiscalYears = await prisma.fiscalYear.findMany({
    include: {
      periods: { orderBy: { periodNumber: 'asc' } },
      yearEndClose: true,
    },
    orderBy: { startDate: 'desc' },
  })

  const currentYear = fiscalYears.find(fy => fy.status === 'open' || fy.status === 'closing')

  const formatDateOnly = (date: Date | string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <>
      <TopBar title="Fiscal Calendar" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fiscal Calendar</h2>
            <p className="text-xs text-zinc-500">{fiscalYears.length} fiscal year(s) configured</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/fiscal/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 text-zinc-100 hover:bg-zinc-700 px-3 h-9 text-sm font-medium transition-colors"
            >
              <Calendar className="w-4 h-4" />
              New Fiscal Year
            </Link>
            <Link
              href="/fiscal/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 px-3 h-9 text-sm font-medium transition-colors"
            >
              Add Period
            </Link>
          </div>
        </div>

        {/* Current Open Fiscal Year Highlight */}
        {currentYear && (
          <Card className="border-blue-600/40 bg-blue-950/20">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-1">
                    Current Fiscal Year
                  </p>
                  <CardTitle className="text-2xl text-zinc-100">{currentYear.name}</CardTitle>
                  <p className="text-sm text-zinc-400 mt-1">
                    {formatDateOnly(currentYear.startDate)} — {formatDateOnly(currentYear.endDate)}
                  </p>
                </div>
                <Badge variant={fyStatusVariant(currentYear.status)} className="shrink-0">
                  {currentYear.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-5 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total Periods</p>
                  <p className="text-xl font-bold text-zinc-100">{currentYear.periods.length}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Open</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {currentYear.periods.filter(p => p.status === 'open').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Closed</p>
                  <p className="text-xl font-bold text-zinc-400">
                    {currentYear.periods.filter(p => p.status === 'closed').length}
                  </p>
                </div>
              </div>

              {/* Period timeline for current year */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Periods</p>
                <div className="flex flex-wrap gap-2">
                  {currentYear.periods.map(period => (
                    <div
                      key={period.id}
                      className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 min-w-[160px]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-100 truncate">{period.name}</p>
                        <p className="text-[10px] text-zinc-500">
                          {formatDateOnly(period.startDate)} – {formatDateOnly(period.endDate)}
                        </p>
                      </div>
                      <Badge variant={periodStatusVariant(period.status)} className="shrink-0 text-[10px]">
                        {period.status}
                      </Badge>
                      {period.status === 'open' && (
                        <FiscalPeriodActions
                          fiscalYearId={currentYear.id}
                          periodId={period.id}
                          periodName={period.name}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {fiscalYears.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Calendar className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No fiscal years configured</p>
              <p className="text-xs mt-1">Create a fiscal year to get started</p>
            </CardContent>
          </Card>
        )}

        {/* All Fiscal Years Table */}
        {fiscalYears.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-zinc-100 mb-4">All Fiscal Years</h3>
            <div className="space-y-4">
              {fiscalYears.map(fy => {
                const openCount = fy.periods.filter(p => p.status === 'open').length
                const closedCount = fy.periods.filter(p => p.status === 'closed').length
                const onHoldCount = fy.periods.filter(p => p.status === 'on_hold').length
                const isCurrent = fy.id === currentYear?.id

                return (
                  <Card key={fy.id} className={isCurrent ? 'border-blue-600/30' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{fy.name}</CardTitle>
                              {isCurrent && (
                                <Badge variant="default" className="text-[10px]">Current</Badge>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {formatDateOnly(fy.startDate)} — {formatDateOnly(fy.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {fy.yearEndClose && (
                            <div className="text-right">
                              <p className="text-[10px] text-zinc-500">Net Income</p>
                              <p className={`text-sm font-semibold ${fy.yearEndClose.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(fy.yearEndClose.netIncome)}
                              </p>
                            </div>
                          )}
                          {fy.yearEndClose && (
                            <Badge variant={yearCloseStatusVariant(fy.yearEndClose.status)}>
                              YE: {fy.yearEndClose.status}
                            </Badge>
                          )}
                          <Badge variant={fyStatusVariant(fy.status)}>{fy.status}</Badge>
                          <ChevronRight className="w-4 h-4 text-zinc-600" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Periods summary row */}
                      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                        <span>{fy.periods.length} periods total</span>
                        {openCount > 0 && (
                          <span className="text-emerald-400">{openCount} open</span>
                        )}
                        {closedCount > 0 && (
                          <span className="text-zinc-400">{closedCount} closed</span>
                        )}
                        {onHoldCount > 0 && (
                          <span className="text-amber-400">{onHoldCount} on hold</span>
                        )}
                      </div>

                      {/* Period table */}
                      {fy.periods.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-zinc-800 text-zinc-600 uppercase tracking-wide">
                                <th className="text-left pb-2 font-medium">#</th>
                                <th className="text-left pb-2 font-medium">Period</th>
                                <th className="text-left pb-2 font-medium">Start</th>
                                <th className="text-left pb-2 font-medium">End</th>
                                <th className="text-center pb-2 font-medium">Status</th>
                                {fy.status !== 'closed' && fy.status !== 'archived' && (
                                  <th className="text-center pb-2 font-medium">Action</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                              {fy.periods.map(period => (
                                <tr key={period.id} className="hover:bg-zinc-900/30">
                                  <td className="py-2 pr-3 text-zinc-500 font-mono">{period.periodNumber}</td>
                                  <td className="py-2 pr-3 text-zinc-300">{period.name}</td>
                                  <td className="py-2 pr-3 text-zinc-500">{formatDateOnly(period.startDate)}</td>
                                  <td className="py-2 pr-3 text-zinc-500">{formatDateOnly(period.endDate)}</td>
                                  <td className="py-2 pr-3 text-center">
                                    <Badge
                                      variant={periodStatusVariant(period.status)}
                                      className="text-[10px]"
                                    >
                                      {period.status}
                                    </Badge>
                                  </td>
                                  {fy.status !== 'closed' && fy.status !== 'archived' && (
                                    <td className="py-2 text-center">
                                      {period.status === 'open' && (
                                        <FiscalPeriodActions
                                          fiscalYearId={fy.id}
                                          periodId={period.id}
                                          periodName={period.name}
                                        />
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
