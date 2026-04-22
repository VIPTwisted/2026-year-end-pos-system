export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { BarChart2, Download, Users, AlertTriangle, Clock, DollarSign } from 'lucide-react'

type RFMRow = {
  customerId: string
  customerName: string
  email: string | null
  recencyDays: number
  frequency: number
  monetary: number
  rScore: number
  fScore: number
  mScore: number
  rfmScore: string
  segment: string
  lastOrderDate: Date
}

const SEGMENT_COLORS: Record<string, string> = {
  'Champions': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Loyal': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'At Risk': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'Lost': 'bg-red-500/15 text-red-400 border-red-500/25',
  'New': 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'Potential Loyalists': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'Hibernating': 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  'Others': 'bg-zinc-700/30 text-zinc-500 border-zinc-600/20',
}

const SEGMENT_BAR_COLORS: Record<string, string> = {
  'Champions': 'bg-emerald-500',
  'Loyal': 'bg-blue-500',
  'At Risk': 'bg-amber-500',
  'Lost': 'bg-red-500',
  'New': 'bg-violet-500',
  'Potential Loyalists': 'bg-cyan-500',
  'Hibernating': 'bg-zinc-600',
  'Others': 'bg-zinc-700',
}

function scoreQuintile(value: number, sorted: number[], invert = false): number {
  if (sorted.length === 0) return 3
  const rank = sorted.filter(v => v <= value).length
  const pct = rank / sorted.length
  if (invert) {
    if (pct <= 0.2) return 5
    if (pct <= 0.4) return 4
    if (pct <= 0.6) return 3
    if (pct <= 0.8) return 2
    return 1
  }
  if (pct <= 0.2) return 1
  if (pct <= 0.4) return 2
  if (pct <= 0.6) return 3
  if (pct <= 0.8) return 4
  return 5
}

function getSegment(r: number, f: number, m: number): string {
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions'
  if (r === 1 && f >= 2) return 'Lost'
  if (r <= 2 && f >= 3) return 'At Risk'
  if (f >= 4) return 'Loyal'
  if (r === 5 && f === 1) return 'New'
  if (r >= 3 && f <= 2) return 'Potential Loyalists'
  if (r <= 2 && f <= 2) return 'Hibernating'
  return 'Others'
}

export default async function RFMPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string; sort?: string; dir?: string }>
}) {
  const { segment: filterSegment, sort = 'monetary', dir = 'desc' } = await searchParams
  const now = new Date()

  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    include: {
      orders: {
        where: { status: { notIn: ['voided', 'cancelled'] } },
        select: { id: true, totalAmount: true, createdAt: true },
      },
    },
  })

  const withOrders = customers.filter(c => c.orders.length > 0)
  const rawData = withOrders.map(c => {
    const lastOrder = c.orders.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
    const recencyDays = Math.floor((now.getTime() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const frequency = c.orders.length
    const monetary = c.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    return { customer: c, recencyDays, frequency, monetary, lastOrderDate: lastOrder.createdAt }
  })

  const sortedRecency = [...rawData.map(d => d.recencyDays)].sort((a, b) => a - b)
  const sortedFrequency = [...rawData.map(d => d.frequency)].sort((a, b) => a - b)
  const sortedMonetary = [...rawData.map(d => d.monetary)].sort((a, b) => a - b)

  let rfmData: RFMRow[] = rawData.map(d => {
    const rScore = scoreQuintile(d.recencyDays, sortedRecency, true)
    const fScore = scoreQuintile(d.frequency, sortedFrequency, false)
    const mScore = scoreQuintile(d.monetary, sortedMonetary, false)
    return {
      customerId: d.customer.id,
      customerName: `${d.customer.firstName} ${d.customer.lastName}`,
      email: d.customer.email,
      recencyDays: d.recencyDays,
      frequency: d.frequency,
      monetary: d.monetary,
      rScore,
      fScore,
      mScore,
      rfmScore: `${rScore}${fScore}${mScore}`,
      segment: getSegment(rScore, fScore, mScore),
      lastOrderDate: d.lastOrderDate,
    }
  })

  if (filterSegment) rfmData = rfmData.filter(r => r.segment === filterSegment)

  // Sort
  rfmData.sort((a, b) => {
    const va = a[sort as keyof RFMRow] as number
    const vb = b[sort as keyof RFMRow] as number
    return dir === 'desc' ? vb - va : va - vb
  })

  const segmentCounts: Record<string, number> = {}
  for (const row of rfmData) {
    segmentCounts[row.segment] = (segmentCounts[row.segment] ?? 0) + 1
  }
  // Use full data for segment counts (even when filtered)
  const allSegmentCounts: Record<string, number> = {}
  for (const row of rawData.map(d => {
    const r = scoreQuintile(d.recencyDays, sortedRecency, true)
    const f = scoreQuintile(d.frequency, sortedFrequency, false)
    const m = scoreQuintile(d.monetary, sortedMonetary, false)
    return getSegment(r, f, m)
  })) {
    allSegmentCounts[row] = (allSegmentCounts[row] ?? 0) + 1
  }

  const champions = allSegmentCounts['Champions'] ?? 0
  const atRisk = allSegmentCounts['At Risk'] ?? 0
  const avgRecency = rawData.length > 0 ? Math.round(rawData.reduce((s, r) => s + r.recencyDays, 0) / rawData.length) : 0
  const avgSpend = rawData.length > 0 ? rawData.reduce((s, r) => s + r.monetary, 0) / rawData.length : 0

  const maxSegCount = Math.max(...Object.values(allSegmentCounts), 1)

  const SORTED_SEGMENTS = ['Champions','Loyal','Potential Loyalists','New','At Risk','Hibernating','Lost','Others']

  const sortLink = (field: string) => {
    const newDir = sort === field && dir === 'desc' ? 'asc' : 'desc'
    return `?sort=${field}&dir=${newDir}${filterSegment ? `&segment=${filterSegment}` : ''}`
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="RFM Customer Analysis" />
      <div className="flex-1 p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Champions', value: champions, icon: BarChart2, color: 'text-emerald-400' },
            { label: 'At Risk', value: atRisk, icon: AlertTriangle, color: 'text-amber-400' },
            { label: 'Avg Recency (days)', value: avgRecency, icon: Clock, color: 'text-blue-400' },
            { label: 'Avg Spend', value: formatCurrency(avgSpend), icon: DollarSign, color: 'text-violet-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{value}</div>
            </div>
          ))}
        </div>

        {/* Segment Bar Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Segment Breakdown</h3>
          <div className="space-y-2">
            {SORTED_SEGMENTS.filter(s => allSegmentCounts[s] > 0).map(seg => (
              <div key={seg} className="flex items-center gap-3">
                <Link
                  href={filterSegment === seg ? '/customers/rfm' : `/customers/rfm?segment=${encodeURIComponent(seg)}`}
                  className="w-36 text-xs text-zinc-300 hover:text-white truncate"
                >
                  {seg}
                </Link>
                <div className="flex-1 bg-zinc-800 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${SEGMENT_BAR_COLORS[seg] ?? 'bg-zinc-600'}`}
                    style={{ width: `${((allSegmentCounts[seg] ?? 0) / maxSegCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-zinc-400">{allSegmentCounts[seg] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-zinc-300">
                RFM Table
                {filterSegment && <span className="ml-2 text-xs text-zinc-400">— {filterSegment}</span>}
              </h3>
              {filterSegment && (
                <Link href="/customers/rfm" className="text-xs text-blue-400 hover:text-blue-300">Clear filter</Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{rfmData.length} customers</span>
              <Link href="/api/customers/rfm?format=csv">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Download className="w-3 h-3" /> Download CSV
                </Button>
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/80 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    <Link href={sortLink('rScore')} className="hover:text-zinc-100 flex items-center gap-1">
                      R {sort === 'rScore' && (dir === 'desc' ? '↓' : '↑')}
                    </Link>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    <Link href={sortLink('fScore')} className="hover:text-zinc-100 flex items-center gap-1">
                      F {sort === 'fScore' && (dir === 'desc' ? '↓' : '↑')}
                    </Link>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    <Link href={sortLink('mScore')} className="hover:text-zinc-100 flex items-center gap-1">
                      M {sort === 'mScore' && (dir === 'desc' ? '↓' : '↑')}
                    </Link>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Segment</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    <Link href={sortLink('recencyDays')} className="hover:text-zinc-100">
                      Last Order {sort === 'recencyDays' && (dir === 'desc' ? '↓' : '↑')}
                    </Link>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    <Link href={sortLink('frequency')} className="hover:text-zinc-100">
                      Orders {sort === 'frequency' && (dir === 'desc' ? '↓' : '↑')}
                    </Link>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    <Link href={sortLink('monetary')} className="hover:text-zinc-100">
                      Total Spend {sort === 'monetary' && (dir === 'desc' ? '↓' : '↑')}
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {rfmData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                      No customer order data available
                    </td>
                  </tr>
                )}
                {rfmData.map(row => (
                  <tr key={row.customerId} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/customers/${row.customerId}`} className="text-blue-400 hover:text-blue-300 text-xs">
                        {row.customerName}
                      </Link>
                      {row.email && <p className="text-zinc-500 text-xs">{row.email}</p>}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        row.rScore >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                        row.rScore >= 3 ? 'bg-blue-500/20 text-blue-400' :
                        row.rScore >= 2 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{row.rScore}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        row.fScore >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                        row.fScore >= 3 ? 'bg-blue-500/20 text-blue-400' :
                        row.fScore >= 2 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{row.fScore}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        row.mScore >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                        row.mScore >= 3 ? 'bg-blue-500/20 text-blue-400' :
                        row.mScore >= 2 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{row.mScore}</span>
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/customers/rfm?segment=${encodeURIComponent(row.segment)}`}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${SEGMENT_COLORS[row.segment] ?? 'bg-zinc-800 text-zinc-400'}`}>
                          {row.segment}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-400 text-xs">
                      {new Date(row.lastOrderDate).toLocaleDateString()}
                      <p className="text-zinc-600">{row.recencyDays}d ago</p>
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{row.frequency}</td>
                    <td className="px-4 py-2 text-zinc-300 font-medium">{formatCurrency(row.monetary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
