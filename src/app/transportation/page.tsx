export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Truck, Package, Route, Building2, ChevronRight, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-zinc-700 text-zinc-300',
  planning: 'bg-zinc-700 text-zinc-300',
  confirmed: 'bg-blue-500/20 text-blue-400',
  in_transit: 'bg-amber-500/20 text-amber-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function TransportationPage() {
  const [carriers, loads, shipments, routes] = await Promise.all([
    prisma.tmsCarrier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.tmsLoad.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.tmsShipment.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.tmsRoute.findMany({ where: { isActive: true }, orderBy: { routeCode: 'asc' } }),
  ])

  const openLoads = loads.filter(l => l.status === 'planning' || l.status === 'confirmed').length
  const inTransit = shipments.filter(s => s.status === 'in_transit').length
  const delivered = shipments.filter(s => s.status === 'delivered').length
  const totalFreight = shipments.reduce((s, sh) => s + (sh.totalCharge ?? 0), 0)
  const preferredCarriers = carriers.filter(c => c.isPreferred).length

  const recentShipments = shipments.slice(0, 8)

  return (
    <>
      <TopBar title="Transportation Management" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Transportation Management</h1>
            <p className="text-[13px] text-zinc-500">D365 TMS — carriers, loads, shipments, routes &amp; rates</p>
          </div>
          <Link
            href="/transportation/shipments/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            New Shipment
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Active Carriers', value: carriers.length, icon: Building2, color: 'text-zinc-100' },
            { label: 'Open Loads', value: openLoads, icon: Truck, color: 'text-blue-400' },
            { label: 'In Transit', value: inTransit, icon: TrendingUp, color: 'text-amber-400' },
            { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Preferred Carriers', value: preferredCarriers, icon: AlertTriangle, color: 'text-purple-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">{k.label}</p>
                <k.icon className={`w-4 h-4 ${k.color} opacity-60`} />
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Carriers',
              href: '/transportation/carriers',
              icon: Building2,
              desc: `${carriers.length} active carriers`,
              color: 'text-blue-400',
            },
            {
              label: 'Loads',
              href: '/transportation/loads',
              icon: Truck,
              desc: `${loads.length} recent loads`,
              color: 'text-purple-400',
            },
            {
              label: 'Shipments',
              href: '/transportation/shipments',
              icon: Package,
              desc: `${shipments.length} recent shipments`,
              color: 'text-amber-400',
            },
            {
              label: 'Routes',
              href: '/transportation/routes',
              icon: Route,
              desc: `${routes.length} active routes`,
              color: 'text-emerald-400',
            },
          ].map(q => (
            <Link
              key={q.href}
              href={q.href}
              className="bg-[#16213e] border border-zinc-800/50 hover:border-zinc-700 rounded-xl p-5 transition-colors group"
            >
              <q.icon className={`w-6 h-6 ${q.color} mb-3`} />
              <p className="text-[14px] font-semibold text-zinc-100 group-hover:text-white">{q.label}</p>
              <p className="text-[12px] text-zinc-500 mt-0.5">{q.desc}</p>
              <ChevronRight className="w-4 h-4 text-zinc-600 mt-2" />
            </Link>
          ))}
        </div>

        {/* Freight cost summary */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">Freight Cost Summary</p>
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="text-[12px] text-zinc-500">Total Freight Charges</p>
              <p className="text-xl font-bold text-emerald-400">${totalFreight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-[12px] text-zinc-500">Avg per Shipment</p>
              <p className="text-xl font-bold text-zinc-100">
                ${shipments.length > 0 ? (totalFreight / shipments.length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-zinc-500">Total Shipments</p>
              <p className="text-xl font-bold text-zinc-100">{shipments.length}</p>
            </div>
          </div>
        </div>

        {/* Recent shipments table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-zinc-100">Recent Shipments</h2>
            <Link href="/transportation/shipments" className="text-[12px] text-blue-400 hover:underline">View all</Link>
          </div>
          {recentShipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Package className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No shipments yet</p>
              <Link href="/transportation/shipments/new" className="mt-2 text-[12px] text-blue-400 hover:underline">Create first shipment</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Shipment #</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Origin</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Destination</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Scheduled</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Total</th>
                    <th className="text-center px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentShipments.map(s => (
                    <tr key={s.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2">
                        <Link href={`/transportation/shipments/${s.id}`} className="font-mono text-blue-400 hover:underline text-[12px]">
                          {s.shipmentNumber.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <span className="capitalize text-zinc-400">{s.shipmentType}</span>
                        <span className="ml-1.5 text-zinc-600 text-[11px]">/{s.mode}</span>
                      </td>
                      <td className="px-3 py-2 text-zinc-300">{s.originCity}, {s.originState}</td>
                      <td className="px-3 py-2 text-zinc-300">{s.destCity}, {s.destState}</td>
                      <td className="px-3 py-2 text-zinc-500">
                        {s.scheduledDate ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(s.scheduledDate).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-zinc-300">
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

        {/* Carriers list */}
        {carriers.length > 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-zinc-100">Carrier Directory</h2>
              <Link href="/transportation/carriers" className="text-[12px] text-blue-400 hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Code</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Carrier Name</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">SCAC</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Mode</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">On-Time %</th>
                    <th className="text-center px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Preferred</th>
                  </tr>
                </thead>
                <tbody>
                  {carriers.slice(0, 10).map(c => (
                    <tr key={c.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2">
                        <Link href={`/transportation/carriers/${c.id}`} className="font-mono text-blue-400 hover:underline text-[12px]">
                          {c.carrierCode}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-medium text-zinc-100">{c.name}</td>
                      <td className="px-3 py-2 font-mono text-zinc-400">{c.scac ?? '—'}</td>
                      <td className="px-3 py-2 text-zinc-400 capitalize">{c.carrierType}</td>
                      <td className="px-3 py-2 text-zinc-400 capitalize">{c.mode}</td>
                      <td className="px-3 py-2 text-right">
                        {c.onTimeRate != null ? (
                          <span className={`font-medium ${c.onTimeRate >= 95 ? 'text-emerald-400' : c.onTimeRate >= 85 ? 'text-amber-400' : 'text-red-400'}`}>
                            {c.onTimeRate.toFixed(1)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-2 text-center">
                        {c.isPreferred && (
                          <span className="rounded-full px-2 py-0.5 text-[11px] bg-purple-500/20 text-purple-400 border border-purple-500/30">Preferred</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
