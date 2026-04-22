export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Server, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import ProviderActions from './ProviderActions'

const TYPE_COLORS: Record<string, string> = {
  warehouse: 'bg-blue-900/50 text-blue-300',
  store: 'bg-emerald-900/50 text-emerald-300',
  third_party_logistics: 'bg-purple-900/50 text-purple-300',
  drop_ship: 'bg-amber-900/50 text-amber-300',
  virtual: 'bg-zinc-700 text-zinc-400',
}

export default async function ProvidersPage() {
  const providers = await prisma.fulfillmentProvider.findMany({
    orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    include: {
      store: { select: { name: true } },
      instances: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { allocations: true } },
    },
  })

  const activeCount = providers.filter((p) => p.isActive).length
  const totalCapacity = providers.reduce((sum, p) => sum + (p.maxCapacity ?? 0), 0)
  const totalLoad = providers.reduce((sum, p) => sum + p.currentLoad, 0)
  const avgLoad = totalCapacity > 0 ? ((totalLoad / totalCapacity) * 100).toFixed(0) : '0'
  const errorToday = providers.filter((p) => p.instances[0]?.status === 'error').length

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-400" /> Provider Network
        </h1>
        <Link
          href="/iom/providers/new"
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Provider
        </Link>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Providers', value: activeCount, color: 'text-emerald-400' },
          { label: 'Total Capacity', value: totalCapacity > 0 ? `${totalCapacity}/day` : '—', color: 'text-blue-400' },
          { label: 'Avg Load', value: `${avgLoad}%`, color: 'text-amber-400' },
          { label: 'Errors Today', value: errorToday, color: errorToday > 0 ? 'text-red-400' : 'text-zinc-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[11px] text-zinc-500 mb-1.5">{label}</p>
            <p className={cn('text-2xl font-bold tabular-nums', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {providers.map((p) => {
          const inst = p.instances[0]
          const loadPct = p.maxCapacity ? Math.min((p.currentLoad / p.maxCapacity) * 100, 100) : 0
          const dotColor =
            inst?.status === 'active' ? 'bg-emerald-500' :
            inst?.status === 'error' ? 'bg-red-500' :
            p.isActive ? 'bg-amber-500' : 'bg-zinc-600'
          const barColor = loadPct > 80 ? 'bg-red-500' : loadPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
          const regions = p.supportedRegions ? JSON.parse(p.supportedRegions) : []

          return (
            <div key={p.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn('w-2 h-2 rounded-full', dotColor)} />
                    <h3 className="font-semibold text-zinc-100">{p.name}</h3>
                  </div>
                  <span className={cn('text-[11px] px-2 py-0.5 rounded font-medium', TYPE_COLORS[p.type] ?? 'bg-zinc-700 text-zinc-400')}>
                    {p.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">{p.code}</span>
              </div>

              {p.description && <p className="text-[13px] text-zinc-500">{p.description}</p>}

              {/* Load Bar */}
              {p.maxCapacity ? (
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
                    <span>Load</span>
                    <span className="tabular-nums">{p.currentLoad}/{p.maxCapacity}</span>
                  </div>
                  <div className="bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', barColor)}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[13px] text-zinc-600">No capacity limit</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-zinc-500 mb-0.5">Avg Processing</p>
                  <p className="text-[13px] text-zinc-300 font-medium">{p.avgProcessingDays} days</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 mb-0.5">Cost/Order</p>
                  <p className="text-[13px] text-zinc-300 font-medium">${p.costPerOrder.toFixed(2)}</p>
                </div>
                {p.store && (
                  <div className="col-span-2">
                    <p className="text-[11px] text-zinc-500 mb-0.5">Store</p>
                    <p className="text-[13px] text-zinc-300">{p.store.name}</p>
                  </div>
                )}
              </div>

              {regions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(regions as string[]).slice(0, 4).map((r) => (
                    <span key={r} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">{r}</span>
                  ))}
                  {regions.length > 4 && <span className="text-[10px] text-zinc-600">+{regions.length - 4}</span>}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1 border-t border-zinc-800/60">
                <Link href={`/iom/providers/${p.id}`} className="text-[13px] text-blue-400 hover:text-blue-300">
                  Manage
                </Link>
                <ProviderActions providerId={p.id} isActive={p.isActive} />
              </div>
            </div>
          )
        })}

        {providers.length === 0 && (
          <div className="col-span-3 py-16 text-center text-[13px] text-zinc-600">
            No providers yet. <Link href="/iom/providers/new" className="text-blue-400">Add your first provider</Link>
          </div>
        )}
      </div>
    </div>
  )
}
