'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  Monitor, RefreshCw, Download, RotateCcw, ScrollText, Plus,
  Wifi, WifiOff, AlertTriangle, Clock, Ticket,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type DeviceStatus = 'Online' | 'Offline' | 'Warning'

interface Device {
  id: string
  type: string
  storeNumber: string
  storeName: string
  lastHeartbeat: string
  status: DeviceStatus
  version: string
  uptimeHistory: number[]
}

interface ApiData {
  devices: Device[]
  kpis: {
    devicesOnline: number
    devicesTotal: number
    devicesOffline: number
    devicesWarning: number
    pendingUpdates: number
    openTickets: number
    lastSync: string
  }
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: DeviceStatus }) {
  const cls =
    status === 'Online'  ? 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.5)]' :
    status === 'Warning' ? 'bg-amber-400  shadow-[0_0_6px_1px_rgba(251,191,36,0.5)]' :
    'bg-red-500 shadow-[0_0_6px_1px_rgba(239,68,68,0.5)]'
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`} />
}

// ─── Uptime Sparkline (SVG) ───────────────────────────────────────────────────
function UptimeSparkline({ values }: { values: number[] }) {
  const W = 112, H = 28
  const max = 100
  const step = W / (values.length - 1)

  const pts = values.map((v, i) => `${i * step},${H - (v / max) * H}`).join(' ')

  const fillPts = `0,${H} ${pts} ${(values.length - 1) * step},${H}`

  return (
    <svg width={W} height={H} className="overflow-visible">
      <polygon points={fillPts} fill="rgba(59,130,246,0.12)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={H - (v / max) * H}
          r="2"
          fill={v < 80 ? '#ef4444' : v < 95 ? '#f59e0b' : '#3b82f6'}
        />
      ))}
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RetailITPage() {
  const [data, setData] = useState<ApiData | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | 'All'>('All')

  useEffect(() => {
    fetch('/api/retail/retail-it')
      .then(r => r.json())
      .then((d: ApiData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function toggleRow(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  if (loading) {
    return (
      <>
        <TopBar title="Retail IT" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-zinc-400 text-sm animate-pulse">Loading device data…</p>
        </main>
      </>
    )
  }

  const { devices = [], kpis } = data ?? {}
  const filtered = filterStatus === 'All' ? devices : devices.filter(d => d.status === filterStatus)
  const lastSyncFmt = kpis?.lastSync ? new Date(kpis.lastSync).toLocaleTimeString() : '—'

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <>
      <TopBar title="Retail IT" />
      <main className="flex-1 overflow-auto p-6 space-y-6">

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Devices Online</p>
              <Wifi className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {kpis?.devicesOnline}
              <span className="text-lg font-normal text-zinc-500">/{kpis?.devicesTotal}</span>
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Pending Updates</p>
              <Download className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-3xl font-bold text-amber-400">{kpis?.pendingUpdates}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Open Tickets</p>
              <Ticket className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-3xl font-bold text-zinc-100">{kpis?.openTickets}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Last Sync</p>
              <Clock className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="text-lg font-semibold text-zinc-100">{lastSyncFmt}</p>
          </div>
        </div>

        {/* Action Ribbon */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Sync All
          </button>
          <button disabled={selected.length === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors">
            <Download className="h-3.5 w-3.5" /> Update Firmware
          </button>
          <button disabled={selected.length !== 1} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Restart Device
          </button>
          <button disabled={selected.length !== 1} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors">
            <ScrollText className="h-3.5 w-3.5" /> View Logs
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Plus className="h-3.5 w-3.5" /> New Device
          </button>

          <div className="ml-auto flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            {(['All', 'Online', 'Warning', 'Offline'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  filterStatus === s ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Device Grid */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100">
              Device Status
              <span className="ml-2 text-xs font-normal text-zinc-500">({filtered.length} devices)</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Device ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Store</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Last Heartbeat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Version</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">7-Day Uptime</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((device, i) => (
                  <tr
                    key={device.id}
                    onClick={() => toggleRow(device.id)}
                    className={`cursor-pointer border-b border-zinc-800/60 transition-colors last:border-0 ${
                      selected.includes(device.id) ? 'bg-blue-600/10' : i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/50'
                    } hover:bg-zinc-800/40`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(device.id)}
                        onChange={() => toggleRow(device.id)}
                        className="accent-blue-500"
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">{device.id}</td>
                    <td className="px-4 py-3 text-zinc-200">{device.type}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      <span className="font-mono text-zinc-500 mr-1">#{device.storeNumber}</span>
                      {device.storeName}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{device.lastHeartbeat}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <StatusDot status={device.status} />
                        <span className={`text-xs font-medium ${
                          device.status === 'Online' ? 'text-emerald-400' :
                          device.status === 'Warning' ? 'text-amber-400' : 'text-red-400'
                        }`}>{device.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{device.version}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <UptimeSparkline values={device.uptimeHistory} />
                        <div className="flex justify-between text-[10px] text-zinc-600">
                          {DAYS.map(d => <span key={d}>{d[0]}</span>)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation() }}
                          className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                        >
                          Restart
                        </button>
                        <button
                          onClick={e => { e.stopPropagation() }}
                          className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                        >
                          Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Connectivity Monitor — SVG Uptime Chart */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100">Connectivity Monitor — 7-Day Uptime %</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <svg width={Math.max(900, devices.length * 80)} height={200} className="w-full min-w-[700px]">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(pct => {
                const y = 160 - (pct / 100) * 140
                return (
                  <g key={pct}>
                    <line x1={60} x2={Math.max(900, devices.length * 80) - 10} y1={y} y2={y}
                      stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={52} y={y + 4} textAnchor="end" fontSize="10" fill="#71717a">{pct}%</text>
                  </g>
                )
              })}

              {/* Device columns */}
              {devices.map((device, di) => {
                const x = 70 + di * 72
                const avgUptime = Math.round(device.uptimeHistory.reduce((a, b) => a + b, 0) / device.uptimeHistory.length)
                const barH = (avgUptime / 100) * 140
                const barY = 160 - barH
                const barColor =
                  avgUptime >= 98 ? '#34d399' :
                  avgUptime >= 85 ? '#f59e0b' : '#ef4444'

                return (
                  <g key={device.id}>
                    <rect x={x - 20} y={barY} width={40} height={barH}
                      rx={4} fill={barColor} fillOpacity={0.25} />
                    <rect x={x - 20} y={barY} width={40} height={4}
                      rx={2} fill={barColor} />
                    <text x={x} y={barY - 6} textAnchor="middle" fontSize="9" fill={barColor} fontWeight="600">
                      {avgUptime}%
                    </text>
                    <text x={x} y={178} textAnchor="middle" fontSize="8" fill="#71717a"
                      transform={`rotate(-40, ${x}, 178)`}>
                      {device.id.replace('DEV-', '')}
                    </text>
                  </g>
                )
              })}

              {/* Axis */}
              <line x1={60} x2={60} y1={20} y2={160} stroke="#3f3f46" strokeWidth="1" />
              <line x1={60} x2={Math.max(900, devices.length * 80) - 10} y1={160} y2={160}
                stroke="#3f3f46" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </main>
    </>
  )
}
