export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, TrendingUp, CheckSquare, Layers } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  active: 'default',
  completed: 'success',
  cancelled: 'secondary',
}

export default async function DeferralsPage() {
  const [templates, schedules] = await Promise.all([
    prisma.deferralTemplate.findMany({
      include: { _count: { select: { schedules: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.deferralSchedule.findMany({
      include: {
        template: { select: { id: true, name: true, deferralType: true } },
        lines: true,
      },
      where: { status: { not: 'cancelled' } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const totalDeferred = schedules.filter(s => s.status === 'active').reduce((sum, s) => sum + s.deferredAmt, 0)
  const totalRecognized = schedules.reduce((sum, s) => sum + s.recognizedAmt, 0)

  // Pending lines: unposted lines whose period date is <= today
  const today = new Date()
  const pendingLines = schedules.flatMap(s =>
    s.lines.filter(l => !l.isPosted && new Date(l.periodDate) <= today)
  ).length

  return (
    <>
      <TopBar title="Deferrals" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Deferred', value: formatCurrency(totalDeferred), icon: Clock, color: 'text-blue-400' },
            { label: 'Recognized', value: formatCurrency(totalRecognized), icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Pending Lines', value: pendingLines.toString(), icon: CheckSquare, color: 'text-amber-400' },
            { label: 'Active Templates', value: templates.filter(t => t.isActive).length.toString(), icon: Layers, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-5 flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                  <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Templates Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-200">Deferral Templates</h2>
          <Link href="/finance/deferrals/new">
            <Button size="sm">+ New Template</Button>
          </Link>
        </div>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-600 text-sm">No deferral templates defined yet.</CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Name</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-left pb-3 font-medium">Method</th>
                  <th className="text-right pb-3 font-medium">Periods</th>
                  <th className="text-center pb-3 font-medium">Schedules</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {templates.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 text-zinc-100 font-medium">{t.name}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={t.deferralType === 'REVENUE' ? 'success' : 'warning'} className="text-xs">
                        {t.deferralType}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{t.method.replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums">{t.periodsCount}</td>
                    <td className="py-3 pr-4 text-center text-zinc-400 tabular-nums">{t._count.schedules}</td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={t.isActive ? 'success' : 'secondary'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Active Schedules */}
        <div className="flex items-center justify-between mt-4">
          <h2 className="text-base font-semibold text-zinc-200">Active Schedules</h2>
          <Link href="/finance/deferrals/schedule/new">
            <Button size="sm" variant="outline">+ New Schedule</Button>
          </Link>
        </div>

        {schedules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-zinc-600 text-sm">No deferral schedules yet.</CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Entity Ref</th>
                  <th className="text-left pb-3 font-medium">Template</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-right pb-3 font-medium">Total Amount</th>
                  <th className="text-right pb-3 font-medium">Recognized</th>
                  <th className="text-right pb-3 font-medium">Remaining</th>
                  <th className="text-left pb-3 font-medium">Period</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {schedules.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-mono text-zinc-100 font-medium">{s.entityRef}</td>
                    <td className="py-3 pr-4 text-zinc-400">{s.template.name}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={s.template.deferralType === 'REVENUE' ? 'success' : 'warning'} className="text-xs">
                        {s.template.deferralType}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums">{formatCurrency(s.totalAmount)}</td>
                    <td className="py-3 pr-4 text-right text-emerald-400 tabular-nums">{formatCurrency(s.recognizedAmt)}</td>
                    <td className="py-3 pr-4 text-right text-amber-400 tabular-nums">
                      {formatCurrency(s.deferredAmt - s.recognizedAmt)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 text-xs">
                      {formatDate(s.startDate)} – {formatDate(s.endDate)}
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={STATUS_VARIANT[s.status] ?? 'secondary'} className="capitalize">
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
