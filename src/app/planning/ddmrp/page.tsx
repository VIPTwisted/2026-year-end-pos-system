'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, Box, TrendingUp, RefreshCw } from 'lucide-react'

interface BufferPosition {
  id: string
  itemName: string
  sku: string
  bufferZone: string   // TOP | BOQ | TOR
  topQty: number
  boqQty: number
  torQty: number
  onHand: number
  onOrder: number
  netFlowPosition: number
  zoneStatus: 'red' | 'yellow' | 'green'
  zonePercent: number
  replenishmentSignal: boolean
}

type ZoneColor = 'red' | 'yellow' | 'green'

const ZONE_BADGE: Record<ZoneColor, string> = {
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  green: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
}

const ZONE_BAR: Record<ZoneColor, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-emerald-500',
}

function calcZone(onHand: number, torQty: number, boqQty: number): { status: ZoneColor; pct: number } {
  if (torQty <= 0) return { status: 'green', pct: 100 }
  const pct = Math.min(100, Math.max(0, (onHand / torQty) * 100))
  const greenThreshold = (boqQty / torQty) * 100
  const yellowThreshold = (torQty * 0.3 / torQty) * 100 // bottom 30% = red/yellow boundary
  if (pct < 30) return { status: 'red', pct }
  if (pct < greenThreshold * 0.8) return { status: 'yellow', pct }
  return { status: 'green', pct }
}

export default function DDMRPPage() {
  const [buffers, setBuffers] = useState<BufferPosition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await fetch('/api/planning/ddmrp').then(r => r.json()).catch(() => [])
    setBuffers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const redZone    = buffers.filter(b => b.zoneStatus === 'red').length
  const yellowZone = buffers.filter(b => b.zoneStatus === 'yellow').length
  const greenZone  = buffers.filter(b => b.zoneStatus === 'green').length
  const alerts     = buffers.filter(b => b.replenishmentSignal).length
  const total      = buffers.length

  const zoneDist = [
    { label: 'Red Zone',    count: redZone,    color: 'bg-red-500',     pct: total ? (redZone / total) * 100 : 0 },
    { label: 'Yellow Zone', count: yellowZone, color: 'bg-yellow-500',  pct: total ? (yellowZone / total) * 100 : 0 },
    { label: 'Green Zone',  count: greenZone,  color: 'bg-emerald-500', pct: total ? (greenZone / total) * 100 : 0 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">DDMRP</h1>
          <p className="text-zinc-400 text-sm mt-1">Demand Driven Material Requirements Planning — buffer positions &amp; execution</p>
        </div>
        <div className="flex gap-3">
          <Link href="/planning/ddmrp/buffers"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Manage Buffers
          </Link>
          <button onClick={load}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Buffer Zones',      value: total,    icon: Box,           color: 'text-blue-400' },
          { label: 'On-Hand Positions', value: buffers.reduce((s, b) => s + b.onHand, 0).toLocaleString(), icon: Activity, color: 'text-purple-400' },
          { label: 'Execution Alerts',  value: alerts,   icon: AlertTriangle, color: 'text-yellow-400' },
          { label: 'Items in Red Zone', value: redZone,  icon: TrendingUp,    color: 'text-red-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Zone distribution bars */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-100 mb-4">Buffer Zone Distribution</h2>
        <div className="space-y-3">
          {zoneDist.map(z => (
            <div key={z.label} className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{z.label}</span>
                <span>{z.count} items ({z.pct.toFixed(0)}%)</span>
              </div>
              <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${z.color} rounded-full transition-all duration-500`}
                  style={{ width: `${z.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buffer table */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Buffer Positions</h2>
          <span className="text-xs text-zinc-500">{buffers.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Item', 'SKU', 'Zone', 'On-Hand', 'On-Order', 'Net Flow Pos.', 'Zone %', 'Status', 'Signal'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-zinc-600 text-sm">Loading buffer data…</td></tr>
              )}
              {!loading && buffers.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-zinc-600 text-sm">No buffer positions found. Set up buffers to get started.</td></tr>
              )}
              {buffers.map(b => (
                <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-3 text-zinc-100 font-medium">{b.itemName}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{b.sku}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs font-mono">{b.bufferZone}</td>
                  <td className="px-4 py-3 text-zinc-300">{b.onHand.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-400">{b.onOrder.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-300 font-medium">{b.netFlowPosition.toLocaleString()}</td>
                  <td className="px-4 py-3 w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${ZONE_BAR[b.zoneStatus]} rounded-full`}
                          style={{ width: `${b.zonePercent}%` }} />
                      </div>
                      <span className="text-xs text-zinc-400 w-8 text-right">{b.zonePercent.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${ZONE_BADGE[b.zoneStatus]}`}>
                      {b.zoneStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.replenishmentSignal
                      ? <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium"><AlertTriangle className="w-3 h-3" />REORDER</span>
                      : <span className="text-xs text-zinc-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
