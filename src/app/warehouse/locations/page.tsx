export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MapPin, Plus, CheckCircle, XCircle } from 'lucide-react'

function BoolBadge({ value }: { value: boolean }) {
  return value
    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
    : <XCircle className="w-3.5 h-3.5 text-zinc-700 inline" />
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams

  const locations = await prisma.wmsLocation.findMany({
    where: search
      ? {
          OR: [
            { locationCode: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      zones: { select: { id: true } },
    },
    orderBy: { locationCode: 'asc' },
  })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Locations" />
      <main className="flex-1 p-6 space-y-5">

        {/* Ribbon */}
        <div className="flex items-center justify-between gap-4">
          <form method="GET" className="flex items-center gap-2">
            <input
              name="search"
              defaultValue={search ?? ''}
              placeholder="Search code / name…"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 w-56"
            />
            <button type="submit" className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs rounded transition-colors">
              Search
            </button>
            {search && (
              <Link href="/warehouse/locations" className="text-xs text-zinc-500 hover:text-zinc-300">Clear</Link>
            )}
          </form>
          <div className="flex items-center gap-2">
            <Link href="/warehouse/locations/new">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-800/30 bg-zinc-900/20">
            <span className="text-xs text-zinc-500">{locations.length} location{locations.length !== 1 ? 's' : ''}</span>
          </div>
          {locations.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-[13px]">No locations configured</p>
              <Link href="/warehouse/locations/new" className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Location
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Code</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Name</th>
                    <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Bin Mandatory</th>
                    <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Require Receive</th>
                    <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Require Shipment</th>
                    <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Require Pick</th>
                    <th className="text-center px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Require Put-Away</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Zones</th>
                    <th className="w-6 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {locations.map(loc => (
                    <tr key={loc.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2">
                        <Link
                          href={`/warehouse/${loc.id}`}
                          className="font-mono text-[13px] font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {loc.locationCode}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-zinc-300">{loc.name}</td>
                      <td className="px-4 py-2 text-center"><BoolBadge value={loc.binMandatory} /></td>
                      <td className="px-4 py-2 text-center"><BoolBadge value={loc.requireReceive} /></td>
                      <td className="px-4 py-2 text-center"><BoolBadge value={loc.requireShipment} /></td>
                      <td className="px-4 py-2 text-center"><BoolBadge value={loc.requirePick} /></td>
                      <td className="px-4 py-2 text-center"><BoolBadge value={loc.requirePutaway} /></td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-400">{loc.zones.length}</td>
                      <td className="px-2 py-2 text-zinc-600">›</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
