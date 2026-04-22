export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { ShipmentActions } from './ShipmentActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'secondary' | 'destructive'> = {
  open: 'default',
  partially_picked: 'warning',
  picked: 'success',
  posted: 'secondary',
}

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const shipment = await prisma.warehouseShipment.findUnique({
    where: { id },
    include: {
      store: { select: { name: true } },
      lines: { include: { product: { select: { name: true, sku: true } } } },
      activities: {
        include: { _count: { select: { lines: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!shipment) notFound()

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Shipment ${shipment.shipmentNo}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-zinc-100 font-mono">{shipment.shipmentNo}</h2>
                <Badge variant={STATUS_VARIANT[shipment.status] ?? 'default'} className="capitalize">
                  {shipment.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex gap-4 text-xs text-zinc-500">
                <span>Store: <span className="text-zinc-300">{shipment.store?.name}</span></span>
                {shipment.sourceType && <span>Source: <span className="text-zinc-300 capitalize">{shipment.sourceType}</span></span>}
                {shipment.shippingDate && <span>Ship Date: <span className="text-zinc-300">{formatDate(shipment.shippingDate)}</span></span>}
                <span>Created: <span className="text-zinc-300">{formatDate(shipment.createdAt)}</span></span>
              </div>
            </div>
            <ShipmentActions shipmentId={id} status={shipment.status} />
          </div>
        </div>

        {/* Lines */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Lines ({shipment.lines.length})</h3>
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">UOM</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Outstanding</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Picked</th>
                  <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">To Ship</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {shipment.lines.map(l => (
                  <tr key={l.id} className="hover:bg-zinc-900/40">
                    <td className="px-4 py-3">
                      <p className="text-zinc-200 text-xs font-medium">{l.product?.name ?? 'Unknown'}</p>
                      <p className="text-zinc-600 text-xs font-mono">{l.product?.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs font-mono">{l.unitOfMeasure}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{l.qtyOutstanding}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={l.qtyPicked >= l.qtyOutstanding ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                        {l.qtyPicked}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-amber-400 font-semibold">{l.qtyToShip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activities */}
        {shipment.activities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Pick Activities</h3>
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Activity #</th>
                    <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Lines</th>
                    <th className="text-center px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-zinc-500 text-xs font-medium uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {shipment.activities.map(a => (
                    <tr key={a.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3">
                        <Link href={`/warehouse/activities/${a.id}`} className="font-mono text-xs text-blue-400 hover:text-blue-300">
                          {a.activityNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-300 text-xs">{a._count.lines}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={a.status === 'completed' ? 'success' : 'default'} className="text-xs capitalize">{a.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 text-xs">{formatDate(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
