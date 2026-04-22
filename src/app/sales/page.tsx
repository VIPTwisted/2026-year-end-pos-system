export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TrendingUp, Users, DollarSign, Trophy, BarChart3, Target } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getDashboardData() {
  const [totalLeads, opps, wonDeals, lostDeals] = await Promise.all([
    prisma.salesLead.count(),
    prisma.salesOpportunity.findMany({
      where: { isWon: false, isLost: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.salesOpportunity.findMany({ where: { isWon: true }, select: { amount: true } }),
    prisma.salesOpportunity.count({ where: { isLost: true } }),
  ])

  const openOpportunities = await prisma.salesOpportunity.count({ where: { isWon: false, isLost: false } })
  const allOpps = await prisma.salesOpportunity.findMany({
    where: { isWon: false, isLost: false },
    select: { amount: true },
  })
  const totalPipelineValue = allOpps.reduce((s, o) => s + o.amount, 0)
  const wonCount = wonDeals.length
  const totalClosed = wonCount + lostDeals
  const conversionRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0
  const avgDealSize = wonCount > 0 ? wonDeals.reduce((s, o) => s + o.amount, 0) / wonCount : 0

  const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won']
  const kanban = await Promise.all(
    stages.map(async (stage) => {
      const stageopps = await prisma.salesOpportunity.findMany({
        where: { salesStage: stage },
        select: { amount: true },
      })
      return { stage, count: stageopps.length, value: stageopps.reduce((s, o) => s + o.amount, 0) }
    })
  )

  return { totalLeads, openOpportunities, totalPipelineValue, wonDeals: wonCount, conversionRate, avgDealSize, recentOpps: opps, kanban }
}

const stageLabels: Record<string, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default async function SalesDashboardPage() {
  const data = await getDashboardData()

  const kpis = [
    { label: 'Total Leads', value: data.totalLeads.toString(), icon: Users, color: 'text-blue-400' },
    { label: 'Open Opportunities', value: data.openOpportunities.toString(), icon: TrendingUp, color: 'text-violet-400' },
    { label: 'Pipeline Value', value: fmt(data.totalPipelineValue), icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Won Deals', value: data.wonDeals.toString(), icon: Trophy, color: 'text-amber-400' },
    { label: 'Conversion Rate', value: `${data.conversionRate}%`, icon: BarChart3, color: 'text-pink-400' },
    { label: 'Avg Deal Size', value: fmt(data.avgDealSize), icon: Target, color: 'text-cyan-400' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Sales</h1>
          <p className="text-sm text-zinc-400 mt-1">D365 Sales pipeline overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/sales/leads" className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Leads</Link>
          <Link href="/sales/opportunities" className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Opportunities</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-xs text-zinc-500">{kpi.label}</span>
              </div>
              <p className="text-xl font-semibold text-zinc-100">{kpi.value}</p>
            </div>
          )
        })}
      </div>

      {/* Kanban Pipeline */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Pipeline by Stage</h2>
        <div className="grid grid-cols-5 gap-3">
          {data.kanban.map((col) => (
            <div key={col.stage} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs font-medium text-zinc-400 mb-1">{stageLabels[col.stage]}</p>
              <p className="text-lg font-semibold text-zinc-100">{col.count}</p>
              <p className="text-xs text-emerald-400 mt-1">{fmt(col.value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Recent Opportunities</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Account</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Stage</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOpps.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No opportunities yet</td></tr>
              )}
              {data.recentOpps.map((opp) => (
                <tr key={opp.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/sales/opportunities/${opp.id}`} className="text-zinc-200 hover:text-white">{opp.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{opp.accountName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300">{stageLabels[opp.salesStage] || opp.salesStage}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-mono">{fmt(opp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
