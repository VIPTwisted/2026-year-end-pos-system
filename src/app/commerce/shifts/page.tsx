export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Plus, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'

function duration(openedAt: Date, closedAt?: Date | null): string {
  const end = closedAt ? new Date(closedAt) : new Date()
  const mins = Math.floor((end.getTime() - new Date(openedAt).getTime()) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const STATUS_VARIANT: Record<string, 'success' | 'destructive' | 'warning' | 'default'> = {
  open: 'success',
  closed: 'default',
  blind_closed: 'default',
  suspended: 'warning',
}

export default async function ShiftsPage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [allShifts, openShifts, todayShifts] = await Promise.all([
    prisma.cashShift.findMany({
      orderBy: { openedAt: 'desc' },
      take: 100,
      include: {
        register: { include: { channel: true } },
        tenders: true,
      },
    }),
    prisma.cashShift.count({ where: { status: 'open' } }),
    prisma.cashShift.findMany({
      where: { openedAt: { gte: todayStart } },
    }),
  ])

  const todayCash = todayShifts.reduce((s, sh) => s + sh.cashSales, 0)
  const todayCard = todayShifts.reduce((s, sh) => s + sh.cardSales, 0)
  const totalVariance = todayShifts
    .filter(sh => sh.variance !== null)
    .reduce((s, sh) => s + (sh.variance ?? 0), 0)

  return (
    <>
      <TopBar title="Shift Management" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Shift Management</h1>
            <p className="text-sm text-zinc-500">{allShifts.length} shift(s) in history</p>
          </div>
          <Link
            href="/commerce/shifts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Open Shift
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Open Shifts</p>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{openShifts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Cash Today</p>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(todayCash)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Card Today</p>
              </div>
              <p className="text-3xl font-bold text-blue-400">{formatCurrency(todayCard)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`w-4 h-4 ${Math.abs(totalVariance) > 10 ? 'text-rose-400' : 'text-zinc-500'}`} />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Variance</p>
              </div>
              <p className={`text-3xl font-bold ${Math.abs(totalVariance) > 10 ? 'text-rose-400' : 'text-zinc-300'}`}>
                {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Shifts table */}
        <Card>
          <CardContent className="pt-4 pb-2 px-0">
            {allShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                <Clock className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No shifts found.</p>
                <Link href="/commerce/shifts/new" className="text-xs text-blue-400 hover:text-blue-300 mt-2">
                  Open the first shift
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-2">Shift #</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Register</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Channel</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Status</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Float</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Cash Sales</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Card Sales</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Variance</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Duration</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allShifts.map(shift => (
                      <tr key={shift.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-zinc-300">{shift.shiftNumber}</td>
                        <td className="px-4 py-3 text-zinc-200">{shift.register.name}</td>
                        <td className="px-4 py-3 text-zinc-400">{shift.register.channel.name}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={STATUS_VARIANT[shift.status] ?? 'default'}>
                            {shift.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-400">{formatCurrency(shift.openingFloat)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{formatCurrency(shift.cashSales)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-blue-400">{formatCurrency(shift.cardSales)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {shift.variance !== null ? (
                            <span className={Math.abs(shift.variance) > 5 ? 'text-rose-400' : 'text-zinc-300'}>
                              {shift.variance >= 0 ? '+' : ''}{formatCurrency(shift.variance)}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-400">
                          {duration(shift.openedAt, shift.closedAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link href={`/commerce/shifts/${shift.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                            {shift.status === 'open' ? 'Manage' : 'View'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
