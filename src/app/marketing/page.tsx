import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Megaphone, TrendingUp, Send, Percent } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  scheduled: 'default',
  active: 'success',
  paused: 'warning',
  completed: 'outline',
  cancelled: 'destructive',
}

const TYPE_VARIANT: Record<string, 'default' | 'warning' | 'secondary' | 'outline'> = {
  email: 'default',
  sms: 'warning',
  social: 'secondary',
  push: 'outline',
}

export default async function MarketingPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount ?? 0), 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.openCount ?? 0), 0)
  const activeCount = campaigns.filter(c => c.status === 'active').length
  const scheduledCount = campaigns.filter(c => c.status === 'scheduled').length

  // Campaign Analytics — computed from fetched data
  const topCampaign = campaigns
    .filter(c => (c.sentCount ?? 0) > 0)
    .map(c => ({
      ...c,
      openRate: ((c.openCount ?? 0) / (c.sentCount ?? 1)) * 100,
    }))
    .sort((a, b) => b.openRate - a.openRate)[0] ?? null

  const overallEngagementRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0

  const engagementColor =
    overallEngagementRate > 25
      ? 'text-emerald-400'
      : overallEngagementRate >= 15
      ? 'text-amber-400'
      : 'text-red-400'

  // Channel Breakdown
  const channelMap: Record<string, { count: number; totalSent: number }> = {}
  for (const c of campaigns) {
    if (!channelMap[c.type]) channelMap[c.type] = { count: 0, totalSent: 0 }
    channelMap[c.type].count += 1
    channelMap[c.type].totalSent += c.sentCount ?? 0
  }
  const channels = Object.entries(channelMap).sort((a, b) => b[1].totalSent - a[1].totalSent)

  return (
    <>
      <TopBar title="Marketing Campaigns" />
      <main className="flex-1 p-6 overflow-auto">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Campaigns</p>
              <p className="text-2xl font-bold text-zinc-100">{campaigns.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active</p>
              <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Scheduled</p>
              <p className="text-2xl font-bold text-zinc-100">{scheduledCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Sent</p>
              <p className="text-2xl font-bold text-zinc-100">{totalSent.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Megaphone className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No campaigns yet</p>
              <p className="text-sm">Create your first campaign to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Name</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Subject</th>
                  <th className="text-left pb-3 font-medium">Start Date</th>
                  <th className="text-left pb-3 font-medium">End Date</th>
                  <th className="text-right pb-3 font-medium">Sent</th>
                  <th className="text-right pb-3 font-medium">Opened</th>
                  <th className="text-right pb-3 font-medium">Open Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {campaigns.map(c => {
                  const openRate =
                    c.sentCount && c.sentCount > 0
                      ? ((c.openCount ?? 0) / c.sentCount * 100).toFixed(1) + '%'
                      : '—'
                  return (
                    <tr key={c.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 text-zinc-100 font-medium">{c.name}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={TYPE_VARIANT[c.type] ?? 'default'}>{c.type}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={STATUS_VARIANT[c.status] ?? 'secondary'}>{c.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 max-w-[200px] truncate">
                        {c.subject ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {c.startDate ? formatDate(c.startDate) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {c.endDate ? formatDate(c.endDate) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400">
                        {(c.sentCount ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400">
                        {(c.openCount ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-medium text-emerald-400">{openRate}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* NovaPOS Marketing Intelligence — Campaign Analytics */}
        {campaigns.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">Campaign Analytics</h2>
              <p className="text-sm text-zinc-500">NovaPOS Marketing Intelligence · computed from live campaign data</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Top Performing Campaign */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <TrendingUp className="w-4 h-4" />
                    <CardTitle className="text-xs uppercase tracking-wide font-medium">Top Performing Campaign</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  {topCampaign ? (
                    <>
                      <p className="text-base font-bold text-zinc-100 truncate mb-1">{topCampaign.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={TYPE_VARIANT[topCampaign.type] ?? 'default'} className="text-xs">
                          {topCampaign.type}
                        </Badge>
                        <span className="text-emerald-400 font-semibold text-sm">
                          {topCampaign.openRate.toFixed(1)}% open rate
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-zinc-500 text-sm">No data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Total Reach */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Send className="w-4 h-4" />
                    <CardTitle className="text-xs uppercase tracking-wide font-medium">Total Reach</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className="text-3xl font-bold text-zinc-100">{totalSent.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500 mt-1">messages delivered</p>
                </CardContent>
              </Card>

              {/* Engagement Rate */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Percent className="w-4 h-4" />
                    <CardTitle className="text-xs uppercase tracking-wide font-medium">Engagement Rate</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className={`text-3xl font-bold ${engagementColor}`}>
                    {overallEngagementRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {overallEngagementRate > 25
                      ? 'Excellent — above industry average'
                      : overallEngagementRate >= 15
                      ? 'Average — room to improve'
                      : 'Below average — review targeting'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Channel Breakdown */}
            {channels.length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold text-zinc-100">Channel Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <div className="flex flex-wrap gap-3">
                    {channels.map(([type, stats]) => (
                      <div
                        key={type}
                        className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2"
                      >
                        <Badge variant={TYPE_VARIANT[type] ?? 'default'} className="capitalize">
                          {type}
                        </Badge>
                        <span className="text-zinc-400 text-xs">
                          {stats.count} campaign{stats.count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-300 text-xs font-medium">
                          {stats.totalSent.toLocaleString()} sent
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </>
  )
}
