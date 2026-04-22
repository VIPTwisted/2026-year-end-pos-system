import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Truck, MapPin, Package, Plus } from 'lucide-react'

export default async function BOPISPage() {
  const [deliveryModes, pickupLocations, fulfillmentGroups] = await Promise.all([
    prisma.deliveryMode.findMany({ include: { pickupLocations: true }, orderBy: { createdAt: 'desc' } }),
    prisma.pickupLocation.findMany({ include: { timeSlots: true }, orderBy: { createdAt: 'desc' } }),
    prisma.fulfillmentGroup.findMany({ include: { stores: true }, orderBy: { createdAt: 'desc' } }),
  ])

  const totalSlots = pickupLocations.reduce((sum, l) => sum + l.timeSlots.length, 0)
  const activeLocations = pickupLocations.filter(l => l.isActive).length

  const kpis = [
    { label: 'Delivery Modes', value: deliveryModes.length, icon: Truck },
    { label: 'Pickup Locations', value: activeLocations, icon: MapPin },
    { label: 'Time Slots', value: totalSlots, icon: Package },
    { label: 'Fulfillment Groups', value: fulfillmentGroups.length, icon: Package },
  ]

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">BOPIS & Delivery Modes</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Buy Online Pickup In Store configuration</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{kpi.value}</div>
            </div>
          )
        })}
      </div>

      {/* Delivery Modes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Delivery Modes</p>
          <Link href="#" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
            <Plus className="w-3 h-3" /> Add mode
          </Link>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Code</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Name</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Type</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Locations</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {deliveryModes.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No delivery modes</td></tr>
              ) : deliveryModes.map(m => (
                <tr key={m.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-300 font-mono">{m.code}</td>
                  <td className="px-4 py-2.5 text-zinc-200 font-medium">{m.name}</td>
                  <td className="px-4 py-2.5 text-zinc-400 capitalize">{m.modeType}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{m.pickupLocations.length}</td>
                  <td className="px-4 py-2.5"><span className={m.isActive ? 'text-emerald-400' : 'text-zinc-600'}>{m.isActive ? 'Yes' : 'No'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pickup Locations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Pickup Locations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {pickupLocations.length === 0 ? (
            <p className="text-xs text-zinc-600 col-span-3">No pickup locations configured</p>
          ) : pickupLocations.map(loc => (
            <Link key={loc.id} href={`/channels/bopis/pickup-locations/${loc.id}`} className="block bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-200">{loc.storeName ?? 'Unnamed Location'}</span>
              </div>
              <p className="text-xs text-zinc-500">{loc.address}{loc.city ? `, ${loc.city}` : ''}{loc.state ? `, ${loc.state}` : ''}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-600">{loc.timeSlots.length} time slots</span>
                <span className={`text-xs ${loc.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>{loc.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Fulfillment Groups */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Fulfillment Groups</p>
          <Link href="/channels/fulfillment-groups" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Name</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Type</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Stores</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {fulfillmentGroups.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No fulfillment groups</td></tr>
              ) : fulfillmentGroups.map(g => (
                <tr key={g.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-200 font-medium">{g.name}</td>
                  <td className="px-4 py-2.5 text-zinc-400 capitalize">{g.fulfillmentType}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{g.stores.length}</td>
                  <td className="px-4 py-2.5"><span className={g.isActive ? 'text-emerald-400' : 'text-zinc-600'}>{g.isActive ? 'Yes' : 'No'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
