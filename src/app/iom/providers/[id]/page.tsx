export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Server } from 'lucide-react'
import { cn } from '@/lib/utils'
import ProviderActions from '../ProviderActions'

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const provider = await prisma.fulfillmentProvider.findUnique({
    where: { id },
    include: {
      store: true,
      instances: { orderBy: { createdAt: 'desc' } },
      allocations: {
        where: { isSelected: true },
        orderBy: { allocatedAt: 'desc' },
        take: 20,
        include: { orchestration: { select: { orchestrationNo: true, state: true, orderValue: true, createdAt: true } } },
      },
    },
  })

  if (!provider) notFound()

  const inst = provider.instances[0]
  const loadPct = provider.maxCapacity ? Math.min((provider.currentLoad / provider.maxCapacity) * 100, 100) : 0

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthAllocations = provider.allocations.filter(
    (a) => new Date(a.allocatedAt) >= startOfMonth
  )

  const avgCost = monthAllocations.length > 0
    ? monthAllocations.reduce((sum, a) => sum + a.costEstimate, 0) / monthAllocations.length
    : 0

  const avgDays = monthAllocations.length > 0
    ? monthAllocations.reduce((sum, a) => sum + a.daysEstimate, 0) / monthAllocations.length
    : 0

  const regions: string[] = provider.supportedRegions ? JSON.parse(provider.supportedRegions) : []
  const carriers: string[] = provider.supportedCarriers ? JSON.parse(provider.supportedCarriers) : []

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-purple-400" />
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{provider.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-zinc-500">{provider.code}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{provider.type}</span>
            </div>
          </div>
        </div>
        <ProviderActions providerId={provider.id} isActive={provider.isActive} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Orders This Month', value: monthAllocations.length },
          { label: 'Avg Cost/Order', value: `$${avgCost.toFixed(2)}` },
          { label: 'Avg Fulfillment Days', value: avgDays.toFixed(1) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{label}</div>
            <div className="text-xl font-bold text-zinc-100">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Configuration</h2>
          <div className="space-y-3">
            {provider.description && (
              <div><div className="text-xs text-zinc-500">Description</div><div className="text-sm text-zinc-300">{provider.description}</div></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-xs text-zinc-500">Priority</div><div className="text-sm text-zinc-300">{provider.priority}</div></div>
              <div><div className="text-xs text-zinc-500">Cost/Order</div><div className="text-sm text-zinc-300">${provider.costPerOrder.toFixed(2)}</div></div>
              <div><div className="text-xs text-zinc-500">Avg Processing</div><div className="text-sm text-zinc-300">{provider.avgProcessingDays} days</div></div>
              <div><div className="text-xs text-zinc-500">Max Capacity</div><div className="text-sm text-zinc-300">{provider.maxCapacity ?? 'Unlimited'}</div></div>
            </div>
            {provider.maxCapacity && (
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Current Load</span>
                  <span>{provider.currentLoad}/{provider.maxCapacity}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', loadPct > 80 ? 'bg-red-500' : 'bg-emerald-500')} style={{ width: `${loadPct}%` }} />
                </div>
              </div>
            )}
            {regions.length > 0 && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Supported Regions</div>
                <div className="flex flex-wrap gap-1">
                  {regions.map((r) => <span key={r} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">{r}</span>)}
                </div>
              </div>
            )}
            {carriers.length > 0 && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Carriers</div>
                <div className="flex flex-wrap gap-1">
                  {carriers.map((c) => <span key={c} className="text-xs px-2 py-0.5 bg-blue-900/40 text-blue-400 rounded">{c}</span>)}
                </div>
              </div>
            )}
            {provider.store && (
              <div><div className="text-xs text-zinc-500">Linked Store</div><div className="text-sm text-zinc-300">{provider.store.name}</div></div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Instance Status</h2>
          {provider.instances.length === 0 ? (
            <p className="text-sm text-zinc-500">No instances. Activate to create one.</p>
          ) : (
            provider.instances.map((inst) => (
              <div key={inst.id} className="border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-zinc-300 text-sm">{inst.name}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded', inst.status === 'active' ? 'bg-emerald-900/50 text-emerald-400' : inst.status === 'error' ? 'bg-red-900/50 text-red-400' : 'bg-zinc-700 text-zinc-400')}>
                    {inst.status}
                  </span>
                </div>
                {inst.activatedAt && <div className="text-xs text-zinc-500">Activated: {new Date(inst.activatedAt).toLocaleString()}</div>}
                {inst.lastHeartbeat && <div className="text-xs text-zinc-500">Last Heartbeat: {new Date(inst.lastHeartbeat).toLocaleString()}</div>}
                {inst.errorLog && <div className="text-xs text-red-400 mt-2">Error: {inst.errorLog}</div>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Allocations */}
      {provider.allocations.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Recent Allocations</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left pb-2 text-zinc-500 font-medium">Order</th>
                <th className="text-left pb-2 text-zinc-500 font-medium">State</th>
                <th className="text-right pb-2 text-zinc-500 font-medium">Value</th>
                <th className="text-right pb-2 text-zinc-500 font-medium">Cost Est.</th>
                <th className="text-left pb-2 text-zinc-500 font-medium">Allocated</th>
              </tr>
            </thead>
            <tbody>
              {provider.allocations.map((a) => (
                <tr key={a.id} className="border-b border-zinc-800/50">
                  <td className="py-2 font-mono text-blue-400">{a.orchestration.orchestrationNo}</td>
                  <td className="py-2 capitalize text-zinc-400">{a.orchestration.state.replace(/_/g, ' ')}</td>
                  <td className="py-2 text-right text-zinc-300">${a.orchestration.orderValue.toFixed(2)}</td>
                  <td className="py-2 text-right text-zinc-400">${a.costEstimate.toFixed(2)}</td>
                  <td className="py-2 text-zinc-500">{new Date(a.allocatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
