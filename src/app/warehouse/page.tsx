import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Warehouse, ArrowRightLeft } from 'lucide-react'

const ENTRY_TYPE_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  RECEIVE: 'success',
  PICK: 'default',
  PUTAWAY: 'warning',
  TRANSFER: 'secondary',
  ADJUST_POS: 'success',
  ADJUST_NEG: 'destructive',
  WRITE_OFF: 'destructive',
  CROSS_DOCK: 'outline',
}

const BIN_STATE_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  AVAILABLE: 'success',
  QUARANTINE: 'destructive',
  WIP: 'warning',
  PICK_QUEUE: 'default',
  PUTAWAY_QUEUE: 'default',
  ADJUSTMENT_QUEUE: 'warning',
}

export default async function WarehousePage() {
  const [locationCount, zoneCount, binCount, occupiedCount] = await Promise.all([
    prisma.wmsLocation.count(),
    prisma.wmsZone.count({ where: { isActive: true } }),
    prisma.wmsBin.count(),
    prisma.wmsBin.count({ where: { isEmpty: false } }),
  ])

  const [locations, entries, binContents] = await Promise.all([
    prisma.wmsLocation.findMany({
      include: { zones: true },
      orderBy: { locationCode: 'asc' },
    }),
    prisma.wmsEntry.findMany({
      include: { product: true },
      orderBy: { postedAt: 'desc' },
      take: 30,
    }),
    prisma.wmsBinContent.findMany({
      include: { product: true },
      where: { quantity: { gt: 0 } },
      orderBy: { quantity: 'desc' },
      take: 20,
    }),
  ])

  return (
    <>
      <TopBar title="Warehouse Management" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Locations</p>
              <p className="text-2xl font-bold text-zinc-100">{locationCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active Zones</p>
              <p className="text-2xl font-bold text-blue-400">{zoneCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Bins</p>
              <p className="text-2xl font-bold text-zinc-100">{binCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Occupied Bins</p>
              <p className="text-2xl font-bold text-emerald-400">{occupiedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Locations */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Locations</h2>
            <p className="text-sm text-zinc-500">{locations.length} warehouse locations</p>
          </div>

          {locations.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Warehouse className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No Locations Configured</p>
                <p className="text-sm">Add warehouse locations to begin operations</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Code</th>
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">City / State</th>
                    <th className="text-right pb-3 font-medium">Zones</th>
                    <th className="text-left pb-3 font-medium">Workflow Flags</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {locations.map(loc => (
                    <tr key={loc.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{loc.locationCode}</td>
                      <td className="py-3 pr-4 text-zinc-300">{loc.name}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {[loc.city, loc.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400">{loc.zones.length}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {loc.requireReceive && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">Receive</Badge>
                          )}
                          {loc.requireShipment && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">Ship</Badge>
                          )}
                          {loc.requirePick && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">Pick</Badge>
                          )}
                          {loc.requirePutaway && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">Putaway</Badge>
                          )}
                          {loc.binMandatory && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">Bin Req</Badge>
                          )}
                          {!loc.requireReceive && !loc.requireShipment && !loc.requirePick && !loc.requirePutaway && !loc.binMandatory && (
                            <span className="text-zinc-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={loc.isActive ? 'success' : 'destructive'}>
                          {loc.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Recent Warehouse Movements */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Recent Movements</h2>
            <p className="text-sm text-zinc-500">Last {entries.length} warehouse entries</p>
          </div>

          {entries.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <ArrowRightLeft className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No Movements Yet</p>
                <p className="text-sm">Warehouse entries will appear here as inventory moves</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Entry #</th>
                    <th className="text-left pb-3 font-medium">Posted</th>
                    <th className="text-center pb-3 font-medium">Type</th>
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-left pb-3 font-medium">From Bin</th>
                    <th className="text-left pb-3 font-medium">To Bin</th>
                    <th className="text-right pb-3 font-medium">Qty</th>
                    <th className="text-left pb-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{entry.entryNumber}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                        {entry.postedAt ? formatDate(entry.postedAt) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={ENTRY_TYPE_VARIANT[entry.entryType] ?? 'secondary'} className="text-xs">
                          {entry.entryType}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">
                        {entry.product?.name ?? '—'}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{entry.fromBinCode ?? '—'}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{entry.toBinCode ?? '—'}</td>
                      <td className="py-3 pr-4 text-right text-zinc-300 font-medium">{entry.quantity}</td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs">
                        {entry.referenceType ? `${entry.referenceType}` : '—'}
                        {entry.referenceId ? ` #${entry.referenceId}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Bin Contents */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Bin Contents</h2>
            <p className="text-sm text-zinc-500">Top {binContents.length} occupied bins by quantity</p>
          </div>

          {binContents.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Warehouse className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No Bin Contents</p>
                <p className="text-sm">Receive inventory to populate bin contents</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Location</th>
                    <th className="text-left pb-3 font-medium">Zone</th>
                    <th className="text-left pb-3 font-medium">Bin</th>
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-left pb-3 font-medium">SKU</th>
                    <th className="text-right pb-3 font-medium">Qty</th>
                    <th className="text-right pb-3 font-medium">Pick Qty</th>
                    <th className="text-center pb-3 font-medium">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {binContents.map(bc => (
                    <tr key={bc.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{bc.locationCode}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{bc.zoneCode ?? '—'}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{bc.binCode}</td>
                      <td className="py-3 pr-4 text-zinc-300">{bc.product?.name ?? '—'}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{bc.product?.sku ?? '—'}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400">{bc.quantity}</td>
                      <td className="py-3 pr-4 text-right text-zinc-400">{bc.pickQty ?? 0}</td>
                      <td className="py-3 text-center">
                        <Badge variant={BIN_STATE_VARIANT[bc.state ?? ''] ?? 'secondary'} className="text-xs">
                          {bc.state ?? '—'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
