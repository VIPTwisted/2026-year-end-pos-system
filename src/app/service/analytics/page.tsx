import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { HeadphonesIcon, Clock, Star, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CSAnalyticsPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [allCases, surveys, slaItems, articles] = await Promise.all([
    prisma.serviceCase.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.caseSurvey.findMany({ where: { rating: { not: null } } }),
    prisma.sLAItem.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.knowledgeArticle.findMany({
      where: { status: 'published' },
      orderBy: { viewCount: 'desc' },
      take: 10,
    }),
  ])

  const thisMontCases = allCases.filter(c => new Date(c.createdAt) >= monthStart)
  const resolvedCases = allCases.filter(c => c.resolvedAt)

  const resolutionTimes = resolvedCases.map(c => (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime()) / 3600000)
  const avgResolutionHours = resolutionTimes.length > 0
    ? (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1)
    : '—'

  const avgCsat = surveys.length > 0
    ? (surveys.reduce((sum, s) => sum + (s.rating ?? 0), 0) / surveys.length).toFixed(2)
    : '—'

  const fcrPct = resolvedCases.length > 0 ? Math.round((resolvedCases.length / allCases.length) * 100) : 0

  const byPriority: Record<string, number> = {}
  for (const c of allCases) {
    byPriority[c.priority] = (byPriority[c.priority] ?? 0) + 1
  }
  const priorityOrder = ['critical', 'high', 'normal', 'low']
  const maxPriority = Math.max(...Object.values(byPriority), 1)

  const byStatus: Record<string, number> = {}
  for (const c of allCases) {
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1
  }

  const dailyCases: Record<string, number> = {}
  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    dailyCases[key] = 0
  }
  for (const c of allCases) {
    const key = new Date(c.createdAt).toISOString().slice(0, 10)
    if (key in dailyCases) dailyCases[key]++
  }
  const dailyEntries = Object.entries(dailyCases).sort((a, b) => a[0].localeCompare(b[0]))
  const maxDaily = Math.max(...Object.values(dailyCases), 1)

  const monthlyCompliance: Record<string, { met: number; total: number }> = {}
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyCompliance[key] = { met: 0, total: 0 }
  }
  for (const s of slaItems) {
    const key = new Date(s.createdAt).toISOString().slice(0, 7)
    if (key in monthlyCompliance) {
      monthlyCompliance[key].total++
      if (s.status === 'met') monthlyCompliance[key].met++
    }
  }
  const complianceEntries = Object.entries(monthlyCompliance).sort((a, b) => a[0].localeCompare(b[0]))

  const agentMap: Record<string, { handled: number; resolvedTimes: number[] }> = {}
  for (const c of allCases) {
    if (!c.assignedTo) continue
    if (!agentMap[c.assignedTo]) agentMap[c.assignedTo] = { handled: 0, resolvedTimes: [] }
    agentMap[c.assignedTo].handled++
    if (c.resolvedAt) {
      agentMap[c.assignedTo].resolvedTimes.push((new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / 3600000)
    }
  }
  const topAgents = Object.entries(agentMap)
    .map(([name, data]) => ({
      name,
      handled: data.handled,
      avgResolution: data.resolvedTimes.length > 0
        ? (data.resolvedTimes.reduce((a, b) => a + b, 0) / data.resolvedTimes.length).toFixed(1)
        : '—',
    }))
    .sort((a, b) => b.handled - a.handled)
    .slice(0, 5)

  const topArticles = articles.slice(0, 5).map(a => {
    const totalFb = a.helpfulCount + a.notHelpfulCount
    const helpfulPct = totalFb > 0 ? Math.round((a.helpfulCount / totalFb) * 100) : null
    return { ...a, helpfulPct }
  })

  return (
    <>
      <TopBar title="CS Analytics" />
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <HeadphonesIcon className="w-5 h-5 text-blue-400" /> CS Analytics
        </h1>
        <p className="text-[11px] text-zinc-500 mt-0.5">Case performance · SLA compliance · agent productivity</p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cases This Month', value: thisMontCases.length, icon: HeadphonesIcon, color: 'text-blue-400' },
          { label: 'Avg Resolution (h)', value: avgResolutionHours, icon: Clock, color: 'text-violet-400' },
          { label: 'Avg CSAT', value: avgCsat, icon: Star, color: 'text-amber-400' },
          {
            label: 'Resolution Rate %', value: `${fcrPct}%`, icon: CheckCircle2,
            color: fcrPct >= 70 ? 'text-emerald-400' : fcrPct >= 50 ? 'text-amber-400' : 'text-red-400',
          },
        ].map(k => (
          <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <k.icon className={cn('w-3.5 h-3.5', k.color)} />
              <p className="text-[11px] text-zinc-500">{k.label}</p>
            </div>
            <p className={cn('text-2xl font-bold tabular-nums', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* 2-col charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cases by Priority */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Cases by Priority</p>
          <div className="space-y-3">
            {priorityOrder.map(p => {
              const count = byPriority[p] ?? 0
              const barColor = p === 'critical' ? 'bg-red-500' : p === 'high' ? 'bg-amber-500' : p === 'normal' ? 'bg-blue-500' : 'bg-zinc-600'
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-[13px] text-zinc-400 w-14 capitalize">{p}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', barColor)}
                      style={{ width: `${Math.round((count / maxPriority) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[13px] text-zinc-300 tabular-nums w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cases by Status */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Cases by Status</p>
          <div className="space-y-3">
            {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const pct = Math.round((count / Math.max(allCases.length, 1)) * 100)
              const barColor = status === 'open' ? 'bg-amber-500' : status === 'resolved' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-blue-500' : status === 'closed' ? 'bg-zinc-600' : 'bg-sky-500'
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-[13px] text-zinc-400 w-20 capitalize">{status.replace('_', ' ')}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-zinc-600 w-6 text-right tabular-nums">{pct}%</span>
                  </div>
                  <span className="text-[13px] text-zinc-300 tabular-nums w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily Cases Trend */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Daily New Cases (Last 14 Days)</p>
          <div className="flex items-end gap-1 h-20">
            {dailyEntries.map(([date, count]) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-blue-600 hover:bg-blue-500 rounded-t transition-colors"
                  style={{ height: `${Math.max(2, Math.round((count / maxDaily) * 72))}px` }}
                  title={`${date}: ${count}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1.5">
            <span>{dailyEntries[0]?.[0]?.slice(5)}</span>
            <span>{dailyEntries[dailyEntries.length - 1]?.[0]?.slice(5)}</span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">SLA Compliance (Last 6 Months)</p>
          <div className="flex items-end gap-2 h-20">
            {complianceEntries.map(([month, data]) => {
              const pct = data.total > 0 ? Math.round((data.met / data.total) * 100) : 0
              const barBg = pct >= 90 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444'
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-zinc-400 font-semibold tabular-nums">{pct}%</span>
                  <div className="w-full rounded-t" style={{ height: `${Math.max(2, Math.round(pct * 0.64))}px`, backgroundColor: barBg }} />
                  <span className="text-[9px] text-zinc-600">{month.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Agent + KB 2-col */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Agents */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Top Agents</h2>
          {topAgents.length === 0 ? (
            <p className="text-center text-[13px] text-zinc-600 py-6">No assigned cases yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left pb-2.5 text-[11px] text-zinc-500 font-medium">Agent</th>
                  <th className="text-right pb-2.5 text-[11px] text-zinc-500 font-medium">Cases</th>
                  <th className="text-right pb-2.5 text-[11px] text-zinc-500 font-medium">Avg Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {topAgents.map((a, i) => (
                  <tr key={a.name} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-600">#{i + 1}</span>
                        <span className="text-[13px] text-zinc-300">{a.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] text-blue-400 font-semibold">{a.handled}</td>
                    <td className="py-2.5 text-right tabular-nums text-[13px] text-zinc-400">
                      {a.avgResolution === '—' ? '—' : `${a.avgResolution}h`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top KB Articles */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Top Knowledge Articles</h2>
          {topArticles.length === 0 ? (
            <p className="text-center text-[13px] text-zinc-600 py-6">No published articles yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left pb-2.5 text-[11px] text-zinc-500 font-medium">Article</th>
                  <th className="text-right pb-2.5 text-[11px] text-zinc-500 font-medium">Views</th>
                  <th className="text-right pb-2.5 text-[11px] text-zinc-500 font-medium">Helpful</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {topArticles.map(a => (
                  <tr key={a.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2.5 pr-4">
                      <p className="text-[13px] text-zinc-300 truncate max-w-[200px]" title={a.title}>{a.title}</p>
                      <p className="text-[11px] text-zinc-600 font-mono">{a.articleNo}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[13px] text-zinc-400">{a.viewCount.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      {a.helpfulPct !== null ? (
                        <span className={cn(
                          'text-[13px]',
                          a.helpfulPct >= 70 ? 'text-emerald-400' : a.helpfulPct >= 40 ? 'text-amber-400' : 'text-red-400'
                        )}>{a.helpfulPct}%</span>
                      ) : <span className="text-zinc-700 text-[13px]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
