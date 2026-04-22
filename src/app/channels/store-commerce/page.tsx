import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Monitor, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:   { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Active' },
    inactive: { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: 'Inactive' },
    pending:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Pending' },
    error:    { cls: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Error' },
  }
  const s = map[status] ?? map.inactive
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  )
}

export default async function StoreCommercePage() {
  const devices = await prisma.storeCommerceDevice.findMany({
    orderBy: { createdAt: 'desc' },
    include: { store: { select: { name: true } } },
  })

  const total = devices.length
  const active = devices.filter(d => d.activationStatus === 'active').length
  const inactive = devices.filter(d => d.activationStatus === 'inactive').length
  const pending = devices.filter(d => d.activationStatus === 'pending').length

  const kpis = [
    { label: 'Total Devices', value: total, icon: Monitor, color: 'text-blue-400' },
    { label: 'Active', value: active, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Inactive', value: inactive, icon: XCircle, color: 'text-zinc-400' },
    { label: 'Pending Activation', value: pending, icon: Clock, color: 'text-amber-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="w-6 h-6 text-blue-400" />
            Store Commerce Devices
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage POS device registrations and activation</p>
        </div>
        <Link
          href="/channels/store-commerce/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-bold text-zinc-100">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Devices Table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/50">
          <h2 className="text-sm font-semibold text-zinc-300">Devices ({total})</h2>
        </div>

        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Monitor className="w-10 h-10 text-zinc-700" />
            <p className="text-zinc-500 text-sm">No devices registered yet</p>
            <Link href="/channels/store-commerce/new" className="text-blue-400 text-sm hover:underline">Register your first device</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Device ID', 'Name', 'Type', 'Store', 'Status', 'Last Seen', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {devices.map(d => (
                  <tr key={d.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-3 text-zinc-400 font-mono text-xs">{d.deviceId}</td>
                    <td className="px-5 py-3 text-zinc-200 font-medium">{d.deviceName}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{d.deviceType}</span>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{d.store?.name ?? '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={d.activationStatus} /></td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">
                      {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/channels/store-commerce/${d.id}`}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
