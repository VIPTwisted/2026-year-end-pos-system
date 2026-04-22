import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Route, Plus } from 'lucide-react'

export default async function RoutesPage() {
  const routes = await prisma.tmsRoute.findMany({
    include: { carrier: { select: { name: true, carrierCode: true } } },
    orderBy: { routeCode: 'asc' },
  })

  const active = routes.filter(r => r.isActive).length
  const avgTransit = routes.length > 0
    ? routes.reduce((s, r) => s + r.transitDays, 0) / routes.length
    : 0
  const totalDistance = routes.reduce((s, r) => s + (r.distance ?? 0), 0)

  return (
    <>
      <TopBar title="Routes" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Routes &amp; Lanes</h1>
            <p className="text-[13px] text-zinc-500">Carrier route assignments, transit times &amp; rates</p>
          </div>
          <Link href="/transportation" className="text-[12px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md transition-colors">TMS Hub</Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Routes', value: active, color: 'text-emerald-400' },
            { label: 'Avg Transit Days', value: `${avgTransit.toFixed(1)}d`, color: 'text-blue-400' },
            { label: 'Total Distance', value: `${totalDistance.toLocaleString()} mi`, color: 'text-zinc-100' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {routes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
              <Route className="w-10 h-10 opacity-20" />
              <p className="text-[13px]">No routes configured yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Code</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Name</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Carrier</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Origin → Dest</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Transit Days</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Distance</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Rate/Mile</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Flat Rate</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Service</th>
                    <th className="text-center px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2">
                        <span className="font-mono text-blue-400 text-[12px]">{r.routeCode}</span>
                      </td>
                      <td className="px-3 py-2 font-medium text-zinc-100">{r.name}</td>
                      <td className="px-3 py-2">
                        {r.carrier ? (
                          <>
                            <span className="text-zinc-300">{r.carrier.name}</span>
                            <span className="block text-[11px] text-zinc-600 font-mono">{r.carrier.carrierCode}</span>
                          </>
                        ) : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-3 py-2 text-zinc-300">
                        {r.originCity}, {r.originState}
                        <span className="text-zinc-600 mx-1">→</span>
                        {r.destCity}, {r.destState}
                      </td>
                      <td className="px-3 py-2 text-center text-zinc-300 font-medium">{r.transitDays}d</td>
                      <td className="px-3 py-2 text-right text-zinc-400">
                        {r.distance != null ? `${r.distance.toLocaleString()} mi` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-zinc-300">
                        {r.ratePerMile != null ? `$${r.ratePerMile.toFixed(4)}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-zinc-300">
                        {r.flatRate != null ? `$${r.flatRate.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-zinc-400 capitalize">{r.serviceLevel}</td>
                      <td className="px-5 py-2 text-center">
                        <span className={`text-[11px] rounded-full px-2 py-0.5 font-medium ${r.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                          {r.isActive ? 'Active' : 'Inactive'}
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
