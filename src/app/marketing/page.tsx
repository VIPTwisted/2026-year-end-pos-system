import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Megaphone } from 'lucide-react'

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
  const activeCount = campaigns.filter(c => c.status === 'active').length
  const scheduledCount = campaigns.filter(c => c.status === 'scheduled').length

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
          <div className="overflow-x-auto">
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
      </main>
    </>
  )
}
