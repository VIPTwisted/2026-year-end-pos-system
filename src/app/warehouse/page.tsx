export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Warehouse, ArrowRightLeft, Plus, MapPin, Grid3x3 } from 'lucide-react'

const ENTRY_TYPE_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  RECEIVE:    'success',
  PICK:       'warning',
  PUTAWAY:    'default',
  TRANSFER:   'default',
  ADJUST:     'secondary',
  WRITE_OFF:  'destructive',
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

export default async function WarehousePage() {
  // Summary counts
  const [totalLocations, totalBins, totalSkus, totalUnits] = await Promise.all([
    prisma.wmsLocation.count(),
    prisma.wmsBin.count(),
    prisma.wmsBinContent.groupBy({ by: ['productId'] }).then(r => r.length),
    prisma.wmsBinContent.aggregate({ _sum: { quantity: true } }).then(r => r._sum.quantity ?? 0),
  ])

  // Locations with zone + bin counts
  const locations = await prisma.wmsLocation.findMany({
    include: {
      zones: {
        include: { racks: { include: { bins: true } } },
      },
    },
    orderBy: { locationCode: 'asc' },
  })

  // Recent movements (last 10)
  const entries = await prisma.wmsEntry.findMany({
    include: { product: true },
    orderBy: { postedAt: 'desc' },
    take: 10,
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="Warehouse Management" />

      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Total Locations</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{totalLocations}</p>
            <p className="text-xs text-zinc-500 mt-1">warehouse sites</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Grid3x3 className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Total Bins</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{totalBins}</p>
            <p className="text-xs text-zinc-500 mt-1">storage positions</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Warehouse className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Total SKUs</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{totalSkus}</p>
            <p className="text-xs text-zinc-500 mt-1">distinct products</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Total Units</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{Number(totalUnits).toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">units on hand</p>
          </div>
        </div>

        {/* Locations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                {locations.length} Location{locations.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">Click a location to drill into zones, racks, and bins</p>
            </div>
            <Link href="/warehouse/movement/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm h-9 gap-2">
                <Plus className="w-4 h-4" />
                Log Movement
              </Button>
            </Link>
          </div>

          {locations.length === 0 ? (
            <div className="border border-zinc-800 rounded-xl p-16 text-center">
              <Warehouse className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium mb-2">No locations configured</p>
              <p className="text-sm text-zinc-600">Add warehouse locations to begin operations.</p>
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Code</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Name</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Zones</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Bins</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Workflow Flags</th>
                      <th className="text-center px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {locations.map(loc => {
                      const binCount = loc.zones.reduce(
                        (sum, z) => sum + z.racks.reduce((s2, r) => s2 + r.bins.length, 0),
                        0
                      )
                      return (
                        <tr key={loc.id} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="px-5 py-3.5">
                            <Link
                              href={`/warehouse/${loc.id}`}
                              className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-400/5 px-2 py-0.5 rounded group-hover:bg-blue-400/10 transition-colors"
                            >
                              {loc.locationCode}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5">
                            <Link href={`/warehouse/${loc.id}`} className="text-zinc-100 hover:text-blue-300 font-medium transition-colors">
                              {loc.name}
                            </Link>
                            {(loc.city || loc.state) && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {[loc.city, loc.state].filter(Boolean).join(', ')}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right text-zinc-300 tabular-nums">{loc.zones.length}</td>
                          <td className="px-4 py-3.5 text-right text-zinc-300 tabular-nums">{binCount}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {loc.requireReceive  && <Badge variant="secondary" className="text-xs px-1.5 py-0">Receive</Badge>}
                              {loc.requireShipment && <Badge variant="secondary" className="text-xs px-1.5 py-0">Ship</Badge>}
                              {loc.requirePick     && <Badge variant="secondary" className="text-xs px-1.5 py-0">Pick</Badge>}
                              {loc.requirePutaway  && <Badge variant="secondary" className="text-xs px-1.5 py-0">Putaway</Badge>}
                              {loc.binMandatory    && <Badge variant="outline"    className="text-xs px-1.5 py-0">Bin Req</Badge>}
                              {loc.isCrossDock     && <Badge variant="outline"    className="text-xs px-1.5 py-0">Cross-Dock</Badge>}
                              {!loc.requireReceive && !loc.requireShipment && !loc.requirePick && !loc.requirePutaway && !loc.binMandatory && !loc.isCrossDock && (
                                <span className="text-zinc-600 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge variant={loc.isActive ? 'success' : 'destructive'}>
                              {loc.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Recent Movements */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Recent Movements</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Last {entries.length} warehouse entries</p>
          </div>

          {entries.length === 0 ? (
            <div className="border border-zinc-800 rounded-xl p-16 text-center">
              <ArrowRightLeft className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium mb-2">No movements yet</p>
              <p className="text-sm text-zinc-600 mb-6">Warehouse entries will appear here as inventory moves.</p>
              <Link href="/warehouse/movement/new">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm gap-2">
                  <Plus className="w-4 h-4" />
                  Log Movement
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Entry #</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Posted</th>
                      <th className="text-center px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Type</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Product</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">From Bin</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">To Bin</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {entries.map(entry => (
                      <tr key={entry.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-zinc-300">{entry.entryNumber}</td>
                        <td className="px-4 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                          {entry.postedAt ? formatDate(entry.postedAt) : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Badge variant={ENTRY_TYPE_VARIANT[entry.entryType] ?? 'secondary'} className="text-xs">
                            {entry.entryType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-200">{entry.product?.name ?? '—'}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">{entry.fromBinCode ?? '—'}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">{entry.toBinCode ?? '—'}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-zinc-100 tabular-nums">{entry.quantity}</td>
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
