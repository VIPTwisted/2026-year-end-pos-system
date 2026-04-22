import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Truck, Plus } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-zinc-700 text-zinc-300',
  confirmed: 'bg-blue-500/20 text-blue-400',
  tendered: 'bg-purple-500/20 text-purple-400',
  dispatched: 'bg-amber-500/20 text-amber-400',
  in_transit: 'bg-orange-500/20 text-orange-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function LoadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const { status, type } = await searchParams
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (type) where.loadType = type

  const loads = await prisma.tmsLoad.findMany({
    where,
    include: {
      carrier: { select: { name: true, carrierCode: true } },
      _count: { select: { shipments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const STATUSES = ['planning', 'confirmed', 'tendered', 'dispatched', 'in_transit', 'delivered', 'cancelled']
  const LOAD_TYPES = ['FTL', 'LTL', 'PTL', 'Parcel']

  const totalMiles = loads.reduce((s, l) => s + (l.estimatedMiles ?? 0), 0)
  const totalWeight = loads.reduce((s, l) => s + (l.weight ?? 0), 0)
  const totalFreight = loads.reduce((s, l) => s + (l.rateAmount ?? 0), 0)
  const openLoads = loads.filter(l => ['planning', 'confirmed', 'tendered'].includes(l.status)).length

  return (
    <>
      <TopBar title="Loads" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Loads</h1>
            <p className="text-[13px] text-zinc-500">Transportation load management</p>
          </div>
          <div className="flex gap-2">
            <Link href="/transportation" className="text-[12px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md transition-colors">TMS Hub</Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open Loads', value: openLoads, color: 'text-amber-400' },
            { label: 'Total Est. Miles', value: `${totalMiles.toLocaleString()} mi`, color: 'text-blue-400' },
            { label: 'Total Weight', value: `${totalWeight.toLocaleString()} lb`, color: 'text-zinc-100' },
            { label: 'Total Rate', value: `$${totalFreight.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-emerald-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/transportation/loads">
            <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${!status && !type ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>All</span>
          </Link>
          {STATUSES.map(s => (
            <Link key={s} href={`/transportation/loads?status=${s}`}>
              <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium capitalize cursor-pointer transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>{s.replace('_', ' ')}</span>
            </Link>
          ))}
          <span className="text-zinc-700 px-1">|</span>
          {LOAD_TYPES.map(t => (
            <Link key={t} href={`/transportation/loads?type=${t}`}>
              <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${type === t ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>{t}</span>
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {loads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
              <Truck className="w-10 h-10 opacity-20" />
              <p className="text-[13px]">No loads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Load #</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Carrier</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Origin → Dest</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Pickup</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Delivery</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Weight</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Rate</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Shipments</th>
                    <th className="text-center px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loads.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2">
                        <Link href={`/transportation/loads/${l.id}`} className="font-mono text-blue-400 hover:underline text-[12px]">
                          {l.loadNumber.slice(0, 8).toUpperCase()}
                        </Link>
                        {l.proNumber && <p className="text-[11px] text-zinc-600 font-mono">PRO: {l.proNumber}</p>}
                      </td>
                      <td className="px-3 py-2 text-zinc-400 font-medium">{l.loadType}</td>
                      <td className="px-3 py-2">
                        {l.carrier ? (
                          <>
                            <span className="text-zinc-300 font-medium">{l.carrier.name}</span>
                            <span className="block text-[11px] text-zinc-500 font-mono">{l.carrier.carrierCode}</span>
                          </>
                        ) : <span className="text-zinc-600">Unassigned</span>}
                      </td>
                      <td className="px-3 py-2 text-zinc-300">
                        {l.originCity}, {l.originState}
                        <span className="text-zinc-600 mx-1">→</span>
                        {l.destCity}, {l.destState}
                      </td>
                      <td className="px-3 py-2 text-zinc-500">
                        {l.pickupDate ? new Date(l.pickupDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 py-2 text-zinc-500">
                        {l.deliveryDate ? new Date(l.deliveryDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-zinc-400">
                        {l.weight != null ? `${l.weight.toLocaleString()} lb` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-zinc-300 font-medium">
                        {l.rateAmount != null ? `$${l.rateAmount.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-center text-zinc-400">{l._count.shipments}</td>
                      <td className="px-5 py-2 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[l.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {l.status.replace('_', ' ')}
                        </span>
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
