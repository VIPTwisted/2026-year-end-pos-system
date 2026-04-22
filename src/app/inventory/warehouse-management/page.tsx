'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkOrder {
  woNo: string
  type: 'Pick' | 'Put-away' | 'Replenishment' | 'Transfer' | 'Cycle Count'
  item: string
  qty: number
  fromLoc: string
  toLoc: string
  priority: 'High' | 'Normal' | 'Low'
  status: 'Open' | 'In Progress' | 'Completed' | 'On Hold'
  worker: string
}

interface InboundShipment {
  poNo: string
  vendor: string
  expectedDate: string
  items: number
  status: 'Scheduled' | 'In Transit' | 'Arrived' | 'Receiving'
}

interface OutboundShipment {
  soNo: string
  customer: string
  shipDate: string
  lines: number
  status: 'Picking' | 'Packed' | 'Staged' | 'Shipped' | 'Pending'
}

// ─── Static data ─────────────────────────────────────────────────────────────

const WORK_ORDERS: WorkOrder[] = [
  { woNo: 'WO-4421', type: 'Pick',         item: 'Widget A100',    qty: 50,  fromLoc: 'BULK-02', toLoc: 'SHIP-A',  priority: 'High',   status: 'In Progress', worker: 'Maria S.' },
  { woNo: 'WO-4422', type: 'Put-away',     item: 'Motor B200',     qty: 20,  fromLoc: 'RECV-A',  toLoc: 'BULK-04', priority: 'Normal', status: 'Open',        worker: '—' },
  { woNo: 'WO-4423', type: 'Replenishment',item: 'Coffee Blend',   qty: 100, fromLoc: 'BULK-06', toLoc: 'PICK-09', priority: 'Normal', status: 'Completed',   worker: 'James K.' },
  { woNo: 'WO-4424', type: 'Pick',         item: 'Control C300',   qty: 8,   fromLoc: 'PICK-03', toLoc: 'SHIP-B',  priority: 'High',   status: 'Open',        worker: '—' },
  { woNo: 'WO-4425', type: 'Transfer',     item: 'Drive Unit D400',qty: 15,  fromLoc: 'BULK-01', toLoc: 'BULK-05', priority: 'Low',    status: 'Open',        worker: '—' },
  { woNo: 'WO-4426', type: 'Pick',         item: 'T-Shirt White',  qty: 200, fromLoc: 'PICK-11', toLoc: 'SHIP-A',  priority: 'High',   status: 'In Progress', worker: 'David L.' },
  { woNo: 'WO-4427', type: 'Replenishment',item: 'Bolt M8 x25',    qty: 5000,fromLoc: 'BULK-03', toLoc: 'PICK-01', priority: 'Normal', status: 'Open',        worker: '—' },
  { woNo: 'WO-4428', type: 'Cycle Count',  item: 'PICK-07 Zone',   qty: 1,   fromLoc: 'PICK-07', toLoc: 'PICK-07', priority: 'Low',    status: 'On Hold',     worker: 'Ana P.' },
  { woNo: 'WO-4429', type: 'Put-away',     item: 'LED Panel 24V',  qty: 40,  fromLoc: 'RECV-B',  toLoc: 'BULK-02', priority: 'Normal', status: 'In Progress', worker: 'Tom H.' },
  { woNo: 'WO-4430', type: 'Pick',         item: 'Display I900',   qty: 5,   fromLoc: 'PICK-04', toLoc: 'SHIP-B',  priority: 'High',   status: 'Completed',   worker: 'Maria S.' },
]

const INBOUND: InboundShipment[] = [
  { poNo: 'PO-8812', vendor: 'IndusTech Mfg',     expectedDate: '2026-04-23', items: 3, status: 'In Transit' },
  { poNo: 'PO-8815', vendor: 'PrecisionParts Co',  expectedDate: '2026-04-24', items: 1, status: 'Scheduled' },
  { poNo: 'PO-8819', vendor: 'BeanSource LLC',      expectedDate: '2026-04-22', items: 2, status: 'Arrived'   },
  { poNo: 'PO-8821', vendor: 'SensorTech',          expectedDate: '2026-04-25', items: 4, status: 'Receiving' },
  { poNo: 'PO-8823', vendor: 'MetalWorks Co',       expectedDate: '2026-04-26', items: 2, status: 'Scheduled' },
]

const OUTBOUND: OutboundShipment[] = [
  { soNo: 'SO-2241', customer: 'Acme Corp',         shipDate: '2026-04-22', lines: 5,  status: 'Staged'   },
  { soNo: 'SO-2245', customer: 'TechRetail LLC',    shipDate: '2026-04-22', lines: 12, status: 'Picking'  },
  { soNo: 'SO-2248', customer: 'Global Dist Inc',   shipDate: '2026-04-23', lines: 8,  status: 'Packed'   },
  { soNo: 'SO-2250', customer: 'ShopNow Co',        shipDate: '2026-04-23', lines: 3,  status: 'Pending'  },
  { soNo: 'SO-2252', customer: 'BulkBuy Partners',  shipDate: '2026-04-24', lines: 20, status: 'Picking'  },
]

const BIN_UTILIZATION = [
  { zone: 'RECV',    pct: 45, color: '#22c55e' },
  { zone: 'BULK-01', pct: 78, color: '#f59e0b' },
  { zone: 'BULK-02', pct: 91, color: '#ef4444' },
  { zone: 'BULK-03', pct: 62, color: '#22c55e' },
  { zone: 'BULK-04', pct: 55, color: '#22c55e' },
  { zone: 'BULK-05', pct: 84, color: '#f59e0b' },
  { zone: 'PICK',    pct: 71, color: '#f59e0b' },
  { zone: 'SHIP',    pct: 38, color: '#22c55e' },
]

// Warehouse map cells — 6 columns × 4 rows = 24 bins
type BinStatus = 'available' | 'low' | 'full' | 'empty'
interface BinCell { code: string; label: string; status: BinStatus; item?: string; qty?: number }

const WAREHOUSE_GRID: BinCell[] = [
  { code: 'RECV-A', label: 'RECV-A', status: 'available', item: 'Motor B200',    qty: 20  },
  { code: 'RECV-B', label: 'RECV-B', status: 'available', item: 'LED Panel 24V', qty: 40  },
  { code: 'BULK-01',label: 'BULK-01',status: 'available', item: 'Drive Unit D400',qty: 75 },
  { code: 'BULK-02',label: 'BULK-02',status: 'full',      item: 'Widget A100',   qty: 450 },
  { code: 'BULK-03',label: 'BULK-03',status: 'available', item: 'Bolt M8 x25',   qty: 12400 },
  { code: 'BULK-04',label: 'BULK-04',status: 'available', item: 'Motor B200',    qty: 28  },
  { code: 'BULK-05',label: 'BULK-05',status: 'low',       item: 'Sensor E500',   qty: 30  },
  { code: 'BULK-06',label: 'BULK-06',status: 'full',      item: 'Coffee Blend',  qty: 340 },
  { code: 'PICK-01',label: 'PICK-01',status: 'available', item: 'Bolt M8 x25',   qty: 1000},
  { code: 'PICK-02',label: 'PICK-02',status: 'available', item: 'Packaging Box', qty: 800 },
  { code: 'PICK-03',label: 'PICK-03',status: 'low',       item: 'Control C300',  qty: 5   },
  { code: 'PICK-04',label: 'PICK-04',status: 'available', item: 'Display I900',  qty: 17  },
  { code: 'PICK-05',label: 'PICK-05',status: 'empty',     item: undefined,       qty: 0   },
  { code: 'PICK-06',label: 'PICK-06',status: 'available', item: 'Bearing G700',  qty: 40  },
  { code: 'PICK-07',label: 'PICK-07',status: 'low',       item: 'Cable H800',    qty: 8   },
  { code: 'PICK-08',label: 'PICK-08',status: 'full',      item: 'T-Shirt White', qty: 380 },
  { code: 'PICK-09',label: 'PICK-09',status: 'available', item: 'Coffee Blend',  qty: 100 },
  { code: 'PICK-10',label: 'PICK-10',status: 'empty',     item: undefined,       qty: 0   },
  { code: 'PICK-11',label: 'PICK-11',status: 'low',       item: 'T-Shirt Black', qty: 12  },
  { code: 'PICK-12',label: 'PICK-12',status: 'available', item: 'LED Panel 24V', qty: 65  },
  { code: 'SHIP-A', label: 'SHIP-A', status: 'available', item: 'SO-2241 Staged',qty: 5   },
  { code: 'SHIP-B', label: 'SHIP-B', status: 'low',       item: 'SO-2245 Pick',  qty: 12  },
  { code: 'EMPTY-1',label: '—',      status: 'empty',     item: undefined,       qty: 0   },
  { code: 'EMPTY-2',label: '—',      status: 'empty',     item: undefined,       qty: 0   },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BIN_COLORS: Record<BinStatus, string> = {
  available: '#22c55e',
  low:       '#f59e0b',
  full:      '#ef4444',
  empty:     '#1e293b',
}

function PriorityChip({ p }: { p: WorkOrder['priority'] }) {
  const map = { High: 'bg-red-500/15 text-red-400 border-red-500/25', Normal: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30', Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${map[p]}`}>{p}</span>
}

function StatusWorkChip({ s }: { s: WorkOrder['status'] }) {
  const map: Record<string, string> = {
    'Open':        'bg-sky-500/15 text-sky-400 border-sky-500/25',
    'In Progress': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    'Completed':   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    'On Hold':     'bg-amber-500/15 text-amber-400 border-amber-500/25',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${map[s] ?? ''}`}>{s}</span>
}

function InboundStatusChip({ s }: { s: InboundShipment['status'] }) {
  const map: Record<string, string> = {
    'Scheduled':  'bg-zinc-700/50 text-zinc-400',
    'In Transit': 'bg-sky-500/15 text-sky-400',
    'Arrived':    'bg-amber-500/15 text-amber-400',
    'Receiving':  'bg-indigo-500/15 text-indigo-300',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${map[s] ?? ''}`}>{s}</span>
}

function OutboundStatusChip({ s }: { s: OutboundShipment['status'] }) {
  const map: Record<string, string> = {
    'Pending':  'bg-zinc-700/50 text-zinc-400',
    'Picking':  'bg-sky-500/15 text-sky-400',
    'Packed':   'bg-violet-500/15 text-violet-300',
    'Staged':   'bg-amber-500/15 text-amber-400',
    'Shipped':  'bg-emerald-500/15 text-emerald-400',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${map[s] ?? ''}`}>{s}</span>
}

// ─── Warehouse Map ────────────────────────────────────────────────────────────

function WarehouseMap() {
  const [tooltip, setTooltip] = useState<{ cell: BinCell; x: number; y: number } | null>(null)

  return (
    <div className="relative">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {WAREHOUSE_GRID.map((cell) => (
          <div
            key={cell.code}
            className="relative rounded flex flex-col items-center justify-center cursor-default transition-all"
            style={{
              height: 52,
              background: cell.status === 'empty' ? 'rgba(30,41,59,0.4)' : `${BIN_COLORS[cell.status]}18`,
              border: `1px solid ${cell.status === 'empty' ? 'rgba(99,102,241,0.08)' : BIN_COLORS[cell.status] + '40'}`,
            }}
            onMouseEnter={e => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              setTooltip({ cell, x: rect.left, y: rect.top })
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <div
              className="w-2 h-2 rounded-full mb-1"
              style={{ background: BIN_COLORS[cell.status] }}
            />
            <span className="text-[9px] font-mono font-bold" style={{ color: cell.status === 'empty' ? '#475569' : '#e2e8f0' }}>
              {cell.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && tooltip.cell.item && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded text-[11px] pointer-events-none shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 60,
            background: '#0d0e24',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#e2e8f0',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="font-mono font-bold text-indigo-300 text-[10px]">{tooltip.cell.code}</div>
          <div>{tooltip.cell.item}</div>
          <div className="text-[#94a3b8]">Qty: {tooltip.cell.qty?.toLocaleString()}</div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
        {([['available', 'Available'], ['low', 'Low Space'], ['full', 'Full'], ['empty', 'Empty/Reserved']] as [BinStatus, string][]).map(([s, label]) => (
          <div key={s} className="flex items-center gap-1.5 text-[10px]" style={{ color: '#94a3b8' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: BIN_COLORS[s] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bin Utilization SVG Chart ────────────────────────────────────────────────

function BinUtilizationChart() {
  const BAR_H = 18
  const GAP   = 10
  const LABEL_W = 60
  const BAR_MAX = 180
  const totalH  = BIN_UTILIZATION.length * (BAR_H + GAP)

  return (
    <div>
      <div className="text-[11px] font-semibold text-[#e2e8f0] mb-3">Bin Zone Utilization</div>
      <svg width="100%" viewBox={`0 0 ${LABEL_W + BAR_MAX + 40} ${totalH}`} style={{ overflow: 'visible' }}>
        {BIN_UTILIZATION.map((b, i) => {
          const y   = i * (BAR_H + GAP)
          const bw  = (b.pct / 100) * BAR_MAX
          const col = b.pct >= 85 ? '#ef4444' : b.pct >= 65 ? '#f59e0b' : '#22c55e'
          return (
            <g key={b.zone}>
              <text x={LABEL_W - 6} y={y + BAR_H - 4} textAnchor="end" fontSize={10} fill="#94a3b8" fontFamily="monospace">{b.zone}</text>
              {/* Track */}
              <rect x={LABEL_W} y={y} width={BAR_MAX} height={BAR_H} rx={3} fill="rgba(255,255,255,0.04)" />
              {/* Bar */}
              <rect x={LABEL_W} y={y} width={bw} height={BAR_H} rx={3} fill={col} opacity={0.75} />
              {/* Label */}
              <text x={LABEL_W + bw + 5} y={y + BAR_H - 4} fontSize={10} fill={col} fontWeight={700}>{b.pct}%</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WarehouseManagementPage() {
  const [data, setData] = useState<{ workOrders: WorkOrder[]; inbound: InboundShipment[]; outbound: OutboundShipment[] } | null>(null)

  useEffect(() => {
    fetch('/api/inventory/warehouse-management')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ workOrders: WORK_ORDERS, inbound: INBOUND, outbound: OUTBOUND }))
  }, [])

  const workOrders = data?.workOrders ?? WORK_ORDERS
  const inbound    = data?.inbound    ?? INBOUND
  const outbound   = data?.outbound   ?? OUTBOUND

  const KPIs = [
    { label: 'Warehouse Utilization', value: '72%',   color: '#f59e0b', sub: 'Amber — monitor' },
    { label: 'Pending Receipts',       value: '8',     color: '#6366f1', sub: 'POs awaiting receive' },
    { label: 'Pending Shipments',      value: '14',    color: '#6366f1', sub: 'Orders to ship' },
    { label: 'Open Work Orders',       value: '23',    color: '#6366f1', sub: 'WOs in queue' },
    { label: 'Pick Accuracy',          value: '99.2%', color: '#22c55e', sub: 'Green — on target' },
  ]

  return (
    <div style={{ background: '#0d0e24', minHeight: '100dvh' }} className="flex flex-col">
      <TopBar
        title="Warehouse Management"
        breadcrumb={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Warehouse Management', href: '/inventory/warehouse-management' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 rounded text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              New Transfer
            </button>
            {['Receive PO', 'Ship Order', 'Cycle Count'].map(label => (
              <button key={label} className="h-8 px-3 rounded text-[12px] font-medium border text-[#94a3b8] hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'transparent' }}>
                {label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-5 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)', background: '#16213e' }}>
        {KPIs.map((kpi, i) => (
          <div
            key={kpi.label}
            className="px-4 py-3 flex flex-col gap-0.5"
            style={{ borderRight: i < KPIs.length - 1 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}
          >
            <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#94a3b8' }}>{kpi.label}</div>
            <div className="text-[22px] font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[10px]" style={{ color: 'rgba(148,163,184,0.6)' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main — 2 columns */}
      <div className="flex-1 flex gap-4 p-4 overflow-auto">

        {/* LEFT 55% */}
        <div className="flex flex-col gap-4" style={{ flex: '0 0 55%', minWidth: 0 }}>

          {/* Warehouse Map */}
          <div className="rounded-lg border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold text-[#e2e8f0]">Warehouse Map</span>
              <span className="text-[10px] text-[#94a3b8]">Hover bin for details</span>
            </div>
            <WarehouseMap />
          </div>

          {/* Work Orders */}
          <div className="rounded-lg border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
              <span className="text-[12px] font-semibold text-[#e2e8f0]">Work Orders</span>
              <span className="text-[11px] text-[#94a3b8]">{workOrders.length} orders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.04)' }}>
                    {['WO #', 'Type', 'Item', 'Qty', 'From Loc', 'To Loc', 'Priority', 'Status', 'Worker'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((wo, i) => (
                    <tr
                      key={wo.woNo}
                      className="transition-colors hover:bg-indigo-500/5"
                      style={{ borderBottom: i < workOrders.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none' }}
                    >
                      <td className="px-3 py-2 font-mono font-bold text-indigo-300 text-[10px]">{wo.woNo}</td>
                      <td className="px-3 py-2 text-[#e2e8f0]">{wo.type}</td>
                      <td className="px-3 py-2 text-[#94a3b8]">{wo.item}</td>
                      <td className="px-3 py-2 text-right font-medium text-[#e2e8f0]">{wo.qty.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono text-[10px] text-sky-400">{wo.fromLoc}</td>
                      <td className="px-3 py-2 font-mono text-[10px] text-sky-400">{wo.toLoc}</td>
                      <td className="px-3 py-2"><PriorityChip p={wo.priority} /></td>
                      <td className="px-3 py-2"><StatusWorkChip s={wo.status} /></td>
                      <td className="px-3 py-2 text-[#94a3b8]">{wo.worker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT 45% */}
        <div className="flex flex-col gap-4" style={{ flex: '0 0 45%', minWidth: 0 }}>

          {/* Inbound Shipments */}
          <div className="rounded-lg border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-[12px] font-semibold text-[#e2e8f0]">Inbound Shipments</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-semibold">{inbound.length} expected</span>
              </div>
            </div>
            <div className="divide-y" style={{ divideColor: 'rgba(99,102,241,0.08)' }}>
              {inbound.map(s => (
                <div key={s.poNo} className="px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-500/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-300">{s.poNo}</span>
                      <InboundStatusChip s={s.status} />
                    </div>
                    <div className="text-[11px] text-[#e2e8f0] mt-0.5">{s.vendor}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-[#94a3b8]">{s.expectedDate}</div>
                    <div className="text-[11px] font-medium text-[#e2e8f0] mt-0.5">{s.items} line{s.items !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outbound Shipments */}
          <div className="rounded-lg border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-[12px] font-semibold text-[#e2e8f0]">Outbound Shipments</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">{outbound.length} orders</span>
              </div>
            </div>
            <div className="divide-y" style={{ divideColor: 'rgba(99,102,241,0.08)' }}>
              {outbound.map(s => (
                <div key={s.soNo} className="px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-500/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-300">{s.soNo}</span>
                      <OutboundStatusChip s={s.status} />
                    </div>
                    <div className="text-[11px] text-[#e2e8f0] mt-0.5">{s.customer}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-[#94a3b8]">{s.shipDate}</div>
                    <div className="text-[11px] font-medium text-[#e2e8f0] mt-0.5">{s.lines} lines</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bin Utilization Chart */}
          <div className="rounded-lg border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <BinUtilizationChart />
          </div>

        </div>
      </div>
    </div>
  )
}
