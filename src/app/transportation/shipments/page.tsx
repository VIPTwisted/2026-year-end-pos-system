export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Package, Plus, Clock } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-zinc-700 text-zinc-300',
  confirmed: 'bg-blue-500/20 text-blue-400',
  in_transit: 'bg-amber-500/20 text-amber-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
  exception: 'bg-rose-500/20 text-rose-400',
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const { status, type } = await searchParams
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (type) where.shipmentType = type

  const [shipments, carriers] = await Promise.all([
    prisma.tmsShipment.findMany({
      where,
      include: { carrier: { select: { name: true, carrierCode: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tmsCarrier.findMany({ where: { isActive: true }, select: { id: true, name: true, carrierCode: true } }),
  ])

  const STATUSES = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled', 'exception']
  const TYPES = ['outbound', 'inbound', 'transfer']

  const totalCharge = shipments.reduce((s, sh) => s + (sh.totalCharge ?? 0), 0)
  const inTransit = shipments.filter(s => s.status === 'in_transit').length
  const delivered = shipments.filter(s => s.status === 'delivered').length

  return (
    <>
      <TopBar title="Shipments" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Shipments</h1>
            <p className="text-[13px] text-zinc-500">{shipments.length} shipments{status ? ` · ${status}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/transportation" className="text-[12px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md transition-colors">TMS Hub</Link>
            <Link href="/transportation/shipments/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              New Shipment
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'In Transit', value: inTransit, color: 'text-amber-400' },
            { label: 'Delivered', value: delivered, color: 'text-emerald-400' },
            { label: 'Total Freight', value: `$${totalCharge.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-blue-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/transportation/shipments">
            <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${!status && !type ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>All</span>
          </Link>
          {STATUSES.map(s => (
            <Link key={s} href={`/transportation/shipments?status=${s}`}>
              <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium capitalize cursor-pointer transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
                {s.replace('_', ' ')}
              </span>
            </Link>
          ))}
          <span className="text-zinc-700 px-1">|</span>
          {TYPES.map(t => (
            <Link key={t} href={`/transportation/shipments?type=${t}`}>
              <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium capitalize cursor-pointer transition-colors ${type === t ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>{t}</span>
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
              <Package className="w-10 h-10 opacity-20" />
              <p className="text-[13px]">No shipments found</p>
              <Link href="/transportation/shipments/new" className="text-[12px] text-blue-400 hover:underline">Create first shipment</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Shipment #</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Carrier</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Origin → Dest</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Scheduled</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Delivered</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Weight</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Total</th>
                    <th className="text-center px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(s => (
                    <tr key={s.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2">
                        <Link href={`/transportation/shipments/${s.id}`} className="font-mono text-blue-400 hover:underline text-[12px]">
                          {s.shipmentNumber.slice(0, 8).toUpperCase()}
                        </Link>
                        {s.trackingNumber && (
                          <p className="text-[11px] text-zinc-600 font-mono">{s.trackingNumber}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="capitalize text-zinc-400">{s.shipmentType}</span>
                        <span className="block text-[11px] text-zinc-600 capitalize">{s.mode}</span>
                      </td>
                      <td className="px-3 py-2 text-zinc-300">
                        {s.carrier ? (
                          <>
                            <span className="font-medium">{s.carrier.name}</span>
                            <span className="block text-[11px] text-zinc-500 font-mono">{s.carrier.carrierCode}</span>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2 text-zinc-300">
                        <span>{s.originCity}, {s.originState}</span>
                        <span className="text-zinc-600 mx-1">→</span>
                        <span>{s.destCity}, {s.destState}</span>
                      </td>
                      <td className="px-3 py-2 text-zinc-500">
                        {s.scheduledDate ? (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.scheduledDate).toLocaleDateString()}</span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2 text-zinc-500">
                        {s.deliveredDate ? new Date(s.deliveredDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-zinc-400">
                        {s.weight != null ? `${s.weight.toLocaleString()} lb` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-zinc-300 font-medium">
                        {s.totalCharge != null ? `$${s.totalCharge.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-2 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[s.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {s.status.replace('_', ' ')}
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
