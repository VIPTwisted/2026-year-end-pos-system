import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Monitor, ArrowLeft } from 'lucide-react'
import DeviceActions from './DeviceActions'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string }> = {
    active:   { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    inactive: { cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    pending:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    error:    { cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }
  const s = map[status] ?? map.inactive
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${s.cls}`}>
      {status}
    </span>
  )
}

export default async function DeviceDetailPage({ params }: { params: { id: string } }) {
  const device = await prisma.storeCommerceDevice.findUnique({
    where: { id: params.id },
    include: { store: { select: { id: true, name: true } } },
  })
  if (!device) notFound()

  const fields = [
    { label: 'Device ID', value: device.deviceId },
    { label: 'Device Type', value: device.deviceType },
    { label: 'Store', value: device.store?.name ?? '—' },
    { label: 'Register ID', value: device.registerId ?? '—' },
    { label: 'Hardware Profile', value: device.hardwareProfileId ?? '—' },
    { label: 'Cloud POS URL', value: device.cloudPOSUrl ?? '—' },
    { label: 'App Version', value: device.appVersion ?? '—' },
    { label: 'OS Info', value: device.osInfo ?? '—' },
    { label: 'Offline Mode', value: device.offlineEnabled ? 'Enabled' : 'Disabled' },
    { label: 'Last Seen', value: device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never' },
    { label: 'Created', value: new Date(device.createdAt).toLocaleString() },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6 space-y-6">
      <div>
        <Link href="/channels/store-commerce" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Devices
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{device.deviceName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={device.activationStatus} />
                <span className="text-xs text-zinc-500 font-mono">{device.deviceId}</span>
              </div>
            </div>
          </div>
          <DeviceActions deviceId={device.id} status={device.activationStatus} />
        </div>
      </div>

      {/* Activation Code Banner */}
      {device.activationCode && device.activationStatus === 'pending' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <p className="text-sm text-amber-400 font-medium mb-1">Pending Activation</p>
          <p className="text-xs text-zinc-400 mb-3">Use this code to activate the device in the POS application</p>
          <div className="font-mono text-2xl font-bold text-amber-400 tracking-widest bg-amber-500/5 rounded-lg px-4 py-3 inline-block">
            {device.activationCode}
          </div>
        </div>
      )}

      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Device Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.label} className="flex flex-col gap-0.5">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">{f.label}</span>
              <span className="text-sm text-zinc-200 font-medium truncate">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
