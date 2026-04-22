export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { TrackingMethodForm } from './TrackingMethodForm'

export default async function ProductTrackingPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, sku: true },
  })
  if (!product) notFound()

  let tracking = await prisma.itemTracking.findUnique({
    where: { productId },
    include: {
      lotNos: { orderBy: { createdAt: 'desc' } },
      serialNos: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!tracking) {
    tracking = await prisma.itemTracking.create({
      data: { productId, trackingMethod: 'none' },
      include: {
        lotNos: { orderBy: { createdAt: 'desc' } },
        serialNos: { orderBy: { createdAt: 'desc' } },
      },
    })
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`Tracking: ${product.name}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-zinc-100">{product.name}</h2>
          <p className="text-xs text-zinc-500 font-mono">{product.sku}</p>
          <div className="mt-3">
            <TrackingMethodForm productId={productId} currentMethod={tracking.trackingMethod} />
          </div>
        </div>

        {/* Lot Numbers */}
        {(tracking.trackingMethod === 'lot' || tracking.trackingMethod === 'lot_and_serial') && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Lot Numbers ({tracking.lotNos.length})</h3>
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              {tracking.lotNos.length === 0 ? (
                <div className="p-8 text-center text-zinc-600 text-sm">No lot numbers</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Lot #</th>
                      <th className="text-right px-4 py-2.5 text-zinc-500 text-xs font-medium">Qty</th>
                      <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Expiration</th>
                      <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {tracking.lotNos.map(lot => {
                      const expired = lot.expiresAt && lot.expiresAt < new Date()
                      return (
                        <tr key={lot.id} className="hover:bg-zinc-900/40">
                          <td className="px-4 py-3 font-mono text-sm text-zinc-200">{lot.lotNo}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-zinc-300 font-semibold">{lot.quantity}</td>
                          <td className="px-4 py-3 text-xs">
                            {lot.expiresAt ? (
                              <span className={expired ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                                {formatDate(lot.expiresAt)} {expired && '(EXPIRED)'}
                              </span>
                            ) : <span className="text-zinc-700">—</span>}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 text-xs">{formatDate(lot.createdAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Serial Numbers */}
        {(tracking.trackingMethod === 'serial' || tracking.trackingMethod === 'lot_and_serial') && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Serial Numbers ({tracking.serialNos.length})</h3>
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              {tracking.serialNos.length === 0 ? (
                <div className="p-8 text-center text-zinc-600 text-sm">No serial numbers</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Serial #</th>
                      <th className="text-center px-4 py-2.5 text-zinc-500 text-xs font-medium">Status</th>
                      <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Purchase Date</th>
                      <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Sold Date</th>
                      <th className="text-left px-4 py-2.5 text-zinc-500 text-xs font-medium">Warranty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {tracking.serialNos.map(sn => (
                      <tr key={sn.id} className="hover:bg-zinc-900/40">
                        <td className="px-4 py-3 font-mono text-sm text-zinc-200">{sn.serialNo}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={
                            sn.status === 'available' ? 'success' :
                            sn.status === 'sold' ? 'secondary' :
                            sn.status === 'scrapped' ? 'destructive' : 'default'
                          } className="text-xs capitalize">{sn.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{sn.purchaseDate ? formatDate(sn.purchaseDate) : '—'}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{sn.soldDate ? formatDate(sn.soldDate) : '—'}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{sn.warrantyDate ? formatDate(sn.warrantyDate) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
