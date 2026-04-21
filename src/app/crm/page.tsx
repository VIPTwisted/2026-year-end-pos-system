import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TrendingUp, DollarSign, Target, Trophy } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  open: 'default',
  won: 'success',
  lost: 'destructive',
  cancelled: 'secondary',
}

export default async function CRMPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [opportunities, wonThisMonth] = await Promise.all([
    prisma.opportunity.findMany({
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
        salesCycle: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.opportunity.count({
      where: { status: 'won', updatedAt: { gte: startOfMonth } },
    }),
  ])

  const openOpps = opportunities.filter(o => o.status === 'open')
  const totalPipeline = openOpps.reduce((s, o) => s + o.estimatedValue, 0)
  const avgProbability = openOpps.length > 0
    ? openOpps.reduce((s, o) => s + o.probability, 0) / openOpps.length
    : 0

  return (
    <>
      <TopBar title="CRM Pipeline" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Open Opportunities', value: openOpps.length.toString(), icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Total Pipeline', value: formatCurrency(totalPipeline), icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Avg Probability', value: `${avgProbability.toFixed(0)}%`, icon: Target, color: 'text-amber-400' },
            { label: 'Won This Month', value: wonThisMonth.toString(), icon: Trophy, color: 'text-purple-400' },
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

        {/* Header + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-200">Opportunities</h2>
          <Link href="/crm/new">
            <Button size="sm">+ New Opportunity</Button>
          </Link>
        </div>

        {/* Table */}
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-zinc-600">
              <TrendingUp className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No opportunities yet. Start by creating one.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Title</th>
                  <th className="text-left pb-3 font-medium">Contact / Customer</th>
                  <th className="text-left pb-3 font-medium">Sales Cycle</th>
                  <th className="text-right pb-3 font-medium">Value</th>
                  <th className="text-right pb-3 font-medium">Probability</th>
                  <th className="text-left pb-3 font-medium">Close Date</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {opportunities.map(opp => (
                  <tr key={opp.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 text-zinc-100 font-medium max-w-[200px] truncate">{opp.title}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">
                      {opp.contact
                        ? `${opp.contact.firstName} ${opp.contact.lastName}`
                        : opp.customer
                        ? `${opp.customer.firstName} ${opp.customer.lastName}`
                        : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">
                      {opp.salesCycle?.name ?? <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-right text-emerald-400 font-medium tabular-nums">
                      {formatCurrency(opp.estimatedValue)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      <span className={opp.probability >= 70 ? 'text-emerald-400' : opp.probability >= 40 ? 'text-amber-400' : 'text-zinc-400'}>
                        {opp.probability.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 text-xs">
                      {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={STATUS_VARIANT[opp.status] ?? 'secondary'} className="capitalize">
                        {opp.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/crm/${opp.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
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
