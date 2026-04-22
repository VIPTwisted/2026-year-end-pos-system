export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Truck } from 'lucide-react'
import { PlanActions } from './PlanActions'

const STATUSES = ['all', 'pending', 'approved', 'executing', 'complete', 'failed']

const BADGE_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  pending: 'warning',
  approved: 'default',
  executing: 'default',
  complete: 'success',
  failed: 'destructive',
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const activeStatus = sp.status || 'all'

  const plans = await prisma.fulfillmentPlan.findMany({
    where: activeStatus !== 'all' ? { status: activeStatus } : {},
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lines: true } } },
  })

  return (
    <>
      <TopBar title="Fulfillment Plans" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fulfillment Plans</h2>
            <p className="text-sm text-zinc-500">{plans.length} plans</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <Link
              key={s}
              href={s === 'all' ? '/dom/plans' : `/dom/plans?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                activeStatus === s
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Truck className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No fulfillment plans in this view</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 pb-3 pt-4 font-medium">Plan ID</th>
                    <th className="text-left pb-3 pt-4 font-medium">Order Ref</th>
                    <th className="text-center pb-3 pt-4 font-medium">Status</th>
                    <th className="text-right pb-3 pt-4 font-medium">Lines</th>
                    <th className="text-right pb-3 pt-4 font-medium">Created</th>
                    <th className="text-center px-5 pb-3 pt-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {plans.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-900/50">
                      <td className="px-5 py-3 font-mono text-xs text-blue-400">
                        <Link href={`/dom/plans/${p.id}`} className="hover:underline">{p.id.slice(0, 14)}…</Link>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs font-mono">
                        {p.onlineOrderId ? `WEB: ${p.onlineOrderId.slice(0, 10)}…` : p.orderId ? `ORD: ${p.orderId.slice(0, 10)}…` : '—'}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={BADGE_VARIANT[p.status] ?? 'secondary'} className="capitalize text-xs">{p.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-300">{p._count.lines}</td>
                      <td className="py-3 pr-4 text-right text-zinc-500 text-xs">{formatDate(p.createdAt)}</td>
                      <td className="px-5 py-3 text-center">
                        <PlanActions planId={p.id} status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
