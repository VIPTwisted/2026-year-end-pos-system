export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilePlus, Plus, AlertTriangle } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  open: 'default',
  sent: 'outline',
  quoted: 'warning',
  awarded: 'success',
  closed: 'secondary',
}

const TABS = ['all', 'open', 'sent', 'quoted', 'awarded', 'closed']

export default async function RFQsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const activeTab = sp.status ?? 'all'

  const rfqs = await prisma.purchaseRFQ.findMany({
    where: activeTab !== 'all' ? { status: activeTab } : {},
    include: {
      vendor: { select: { id: true, name: true } },
      lines: true,
      quotes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const now = new Date()

  // KPI counts
  const [openCount, awaitingCount, quotedCount, awardedThisMonth] = await Promise.all([
    prisma.purchaseRFQ.count({ where: { status: 'open' } }),
    prisma.purchaseRFQ.count({ where: { status: 'sent' } }),
    prisma.purchaseRFQ.count({ where: { status: 'quoted' } }),
    prisma.purchaseRFQ.count({
      where: {
        status: 'awarded',
        updatedAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    }),
  ])

  return (
    <>
      <TopBar title="Purchase RFQs" />
      <main className="flex-1 p-6 overflow-auto">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open RFQs', value: openCount, color: 'text-blue-400' },
            { label: 'Awaiting Response', value: awaitingCount, color: 'text-amber-400' },
            { label: 'Quotes Received', value: quotedCount, color: 'text-violet-400' },
            { label: 'Awarded This Month', value: awardedThisMonth, color: 'text-emerald-400' },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs + Action */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <Link
                key={tab}
                href={tab === 'all' ? '/purchasing/rfqs' : `/purchasing/rfqs?status=${tab}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {tab}
              </Link>
            ))}
          </div>
          <Link href="/purchasing/rfqs/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />New RFQ
            </Button>
          </Link>
        </div>

        {/* Table */}
        {rfqs.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <FilePlus className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-base font-medium text-zinc-300 mb-2">No RFQs found</p>
              <Link href="/purchasing/rfqs/new">
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create RFQ</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">RFQ #</th>
                  <th className="text-left pb-3 font-medium">Request Date</th>
                  <th className="text-left pb-3 font-medium">Vendor</th>
                  <th className="text-center pb-3 font-medium">Lines</th>
                  <th className="text-left pb-3 font-medium">Response Deadline</th>
                  <th className="text-center pb-3 font-medium">Quotes</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {rfqs.map(rfq => {
                  const isOverdue = rfq.responseDeadline && new Date(rfq.responseDeadline) < now && rfq.status !== 'awarded' && rfq.status !== 'closed'
                  return (
                    <tr key={rfq.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs">
                        <Link href={`/purchasing/rfqs/${rfq.id}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                          {rfq.rfqNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">{formatDate(rfq.requestDate)}</td>
                      <td className="py-3 pr-4 text-zinc-300">{rfq.vendor?.name ?? <span className="text-zinc-600 italic">Multi-vendor</span>}</td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant="outline" className="font-mono text-xs">{rfq.lines.length}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs whitespace-nowrap">
                        {rfq.responseDeadline ? (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
                            {isOverdue && <AlertTriangle className="w-3 h-3" />}
                            {formatDate(rfq.responseDeadline)}
                          </span>
                        ) : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={rfq.quotes.length > 0 ? 'success' : 'secondary'} className="font-mono text-xs">
                          {rfq.quotes.length}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={STATUS_VARIANT[rfq.status] ?? 'secondary'} className="capitalize">
                          {rfq.status}
                        </Badge>
                      </td>
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
