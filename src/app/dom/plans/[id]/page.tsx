export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Truck, Package } from 'lucide-react'
import { DOMPlanActions } from './DOMPlanActions'

const BADGE_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  pending: 'warning',
  approved: 'default',
  executing: 'default',
  complete: 'success',
  failed: 'destructive',
}

const LINE_BADGE: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  pending: 'warning',
  picked: 'default',
  packed: 'default',
  shipped: 'secondary',
  complete: 'success',
}

const FULFILL_TYPE_LABELS: Record<string, string> = {
  ship_from_store: 'Ship from Store',
  pickup: 'Pickup',
  warehouse: 'Warehouse',
}

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const plan = await prisma.fulfillmentPlan.findUnique({
    where: { id },
    include: {
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          fulfillFromStore: { select: { id: true, name: true } },
        },
      },
    },
  })
  if (!plan) notFound()

  return (
    <>
      <TopBar title="Fulfillment Plan" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/dom/plans" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Plans
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-bold font-mono text-zinc-100">{plan.id}</span>
                  <Badge variant={BADGE_VARIANT[plan.status] ?? 'secondary'} className="capitalize">{plan.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span>Created: <span className="text-zinc-300">{formatDate(plan.createdAt)}</span></span>
                  <span>Updated: <span className="text-zinc-300">{formatDate(plan.updatedAt)}</span></span>
                  {plan.onlineOrderId && <span>Online Order: <span className="text-zinc-300 font-mono">{plan.onlineOrderId}</span></span>}
                  {plan.orderId && <span>Order: <span className="text-zinc-300 font-mono">{plan.orderId}</span></span>}
                  <span>{plan.lines.length} line{plan.lines.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <DOMPlanActions planId={plan.id} status={plan.status} />
            </div>
          </CardContent>
        </Card>

        {/* Lines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-400" />
              Fulfillment Lines ({plan.lines.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {plan.lines.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-zinc-500 text-sm">
                No lines on this plan.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Product', 'SKU', 'Qty', 'Fulfill From', 'Type', 'Status'].map(h => (
                      <th key={h} className={`px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Product' ? 'text-left' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plan.lines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30">
                      <td className="px-4 py-3 text-zinc-100 font-medium">{line.product.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{line.product.sku}</td>
                      <td className="px-4 py-3 text-zinc-300">{line.quantity}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {line.fulfillFromStore ? (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {line.fulfillFromStore.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {FULFILL_TYPE_LABELS[line.fulfillmentType] ?? line.fulfillmentType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={LINE_BADGE[line.status] ?? 'secondary'} className="capitalize text-xs">
                          {line.status}
                        </Badge>
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
