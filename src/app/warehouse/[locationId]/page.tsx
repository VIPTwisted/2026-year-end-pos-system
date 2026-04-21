import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Layers, Grid3x3 } from 'lucide-react'

const ZONE_TYPE_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  STORAGE:    'default',
  RECEIVING:  'success',
  SHIPPING:   'warning',
  QUARANTINE: 'destructive',
  WIP:        'secondary',
  CROSS_DOCK: 'outline',
}

const STATE_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  AVAILABLE:        'success',
  QUARANTINE:       'destructive',
  WIP:              'warning',
  PICK_QUEUE:       'default',
  PUTAWAY_QUEUE:    'default',
  ADJUSTMENT_QUEUE: 'secondary',
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ locationId: string }>
}) {
  const { locationId } = await params

  const location = await prisma.wmsLocation.findUnique({
    where: { id: locationId },
    include: {
      zones: {
        include: {
          racks: {
            include: {
              bins: {
                include: {
                  contents: {
                    include: { product: true },
                    where: { quantity: { gt: 0 } },
                  },
                },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!location) notFound()

  // Flatten all bin contents across zones/racks
  const allContents = location.zones.flatMap(z =>
    z.racks.flatMap(r =>
      r.bins.flatMap(b =>
        b.contents.map(c => ({
          id: c.id,
          binCode: b.binCode,
          zoneCode: z.zoneCode,
          sku: c.product.sku,
          productName: c.product.name,
          quantity: c.quantity,
          pickQty: c.pickQty,
          state: c.state,
        }))
      )
    )
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title={`${location.locationCode} — ${location.name}`} />

      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Back */}
        <Link
          href="/warehouse"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Warehouse
        </Link>

        {/* Location Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-lg font-bold text-blue-400">{location.locationCode}</span>
                <Badge variant={location.isActive ? 'success' : 'destructive'}>
                  {location.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {location.isCrossDock && <Badge variant="outline">Cross-Dock</Badge>}
              </div>
              <h1 className="text-xl font-semibold text-zinc-100 mb-1">{location.name}</h1>
              {(location.city || location.state) && (
                <p className="text-sm text-zinc-500">
                  {[location.city, location.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <Link href="/warehouse/movement/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm h-9 gap-2 shrink-0">
                Log Movement
              </Button>
            </Link>
          </div>

          {/* Workflow flags */}
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-zinc-800">
            <span className="text-xs text-zinc-500 mr-1 self-center">Workflow:</span>
            {location.requireReceive  && <Badge variant="secondary">Receive Required</Badge>}
            {location.requireShipment && <Badge variant="secondary">Ship Required</Badge>}
            {location.requirePick     && <Badge variant="secondary">Pick Required</Badge>}
            {location.requirePutaway  && <Badge variant="secondary">Putaway Required</Badge>}
            {location.binMandatory    && <Badge variant="outline">Bin Mandatory</Badge>}
            {!location.requireReceive && !location.requireShipment && !location.requirePick && !location.requirePutaway && !location.binMandatory && (
              <span className="text-xs text-zinc-600">No workflow requirements</span>
            )}
          </div>
        </div>

        {/* Zones */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              {location.zones.length} Zone{location.zones.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {location.zones.length === 0 ? (
            <div className="border border-zinc-800 rounded-xl p-10 text-center text-zinc-500">
              <p className="text-sm">No zones configured for this location.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {location.zones.map(zone => {
                const binCount = zone.racks.reduce((sum, r) => sum + r.bins.length, 0)
                return (
                  <div key={zone.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold text-zinc-100">{zone.zoneCode}</span>
                      <Badge variant={ZONE_TYPE_VARIANT[zone.zoneType] ?? 'default'} className="text-xs">
                        {zone.zoneType}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 mb-3">{zone.name}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{zone.racks.length} rack{zone.racks.length !== 1 ? 's' : ''}</span>
                      <span>{binCount} bin{binCount !== 1 ? 's' : ''}</span>
                      <Badge variant={zone.isActive ? 'success' : 'destructive'} className="text-xs ml-auto">
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bin Contents */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Grid3x3 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              Bin Contents
            </h2>
            <span className="text-sm text-zinc-500 ml-1">({allContents.length} line{allContents.length !== 1 ? 's' : ''})</span>
          </div>

          {allContents.length === 0 ? (
            <div className="border border-zinc-800 rounded-xl p-10 text-center text-zinc-500">
              <p className="text-sm">No inventory in this location.</p>
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Zone</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Bin</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">SKU</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Product</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Qty</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Pick Qty</th>
                      <th className="text-center px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {allContents.map(c => (
                      <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-zinc-500">{c.zoneCode}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-300">{c.binCode}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400">{c.sku}</td>
                        <td className="px-4 py-3 text-zinc-200">{c.productName}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-400 tabular-nums">{c.quantity}</td>
                        <td className="px-4 py-3 text-right text-zinc-400 tabular-nums">{c.pickQty}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={STATE_VARIANT[c.state] ?? 'secondary'} className="text-xs">
                            {c.state}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
