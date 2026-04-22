import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

// ─── Static mock data ────────────────────────────────────────────────────────

const ORDERS = [
  { no: 'SO-4401', customer: 'Hartfield Logistics',  type: 'Installation',  priority: 'High',     tech: 'Marcus Webb',    time: '08:00', status: 'In Progress', sla: '10:00' },
  { no: 'SO-4402', customer: 'NovaChem Industries',  type: 'Maintenance',   priority: 'Medium',   tech: 'Sara Finch',     time: '08:30', status: 'En Route',    sla: '12:30' },
  { no: 'SO-4403', customer: 'Apex Retail Group',    type: 'Repair',        priority: 'Critical', tech: 'James Okafor',   time: '09:00', status: 'Dispatched',  sla: '09:45' },
  { no: 'SO-4404', customer: 'BlueStar Hospital',    type: 'Inspection',    priority: 'Low',      tech: 'Yuki Tanaka',    time: '09:15', status: 'Scheduled',   sla: '14:00' },
  { no: 'SO-4405', customer: 'CrestView Hotels',     type: 'Installation',  priority: 'Medium',   tech: 'Chris Patel',    time: '10:00', status: 'Scheduled',   sla: '13:00' },
  { no: 'SO-4406', customer: 'Orion Pharma',         type: 'Repair',        priority: 'High',     tech: 'Elena Marsh',    time: '10:30', status: 'Dispatched',  sla: '11:30' },
  { no: 'SO-4407', customer: 'Greenfield Foods',     type: 'Maintenance',   priority: 'Low',      tech: 'Tom Kurosawa',   time: '11:00', status: 'Scheduled',   sla: '15:30' },
  { no: 'SO-4408', customer: 'SkyTech Aviation',     type: 'Calibration',   priority: 'Critical', tech: 'Liam Ortega',    time: '11:30', status: 'In Progress', sla: '12:00' },
  { no: 'SO-4409', customer: 'Meridian Bank',        type: 'Inspection',    priority: 'Medium',   tech: 'Derek Holt',     time: '13:00', status: 'Scheduled',   sla: '16:00' },
  { no: 'SO-4410', customer: 'PeakLine Retail',      type: 'Repair',        priority: 'High',     tech: 'Priya Nair',     time: '14:00', status: 'Scheduled',   sla: '16:30' },
]

const CASES = [
  { id: 'C-7701', subject: 'POS system offline',      customer: 'Apex Retail Group',   priority: 'Critical', age: '0h 23m' },
  { id: 'C-7698', subject: 'HVAC unit fault',          customer: 'BlueStar Hospital',   priority: 'High',     age: '1h 10m' },
  { id: 'C-7695', subject: 'Network connectivity',     customer: 'Hartfield Logistics', priority: 'High',     age: '2h 04m' },
  { id: 'C-7691', subject: 'Calibration drift',        customer: 'SkyTech Aviation',    priority: 'Critical', age: '2h 45m' },
  { id: 'C-7688', subject: 'Warranty claim — pump',    customer: 'NovaChem Industries', priority: 'Medium',   age: '3h 12m' },
  { id: 'C-7685', subject: 'Scheduled PM overdue',     customer: 'CrestView Hotels',    priority: 'Medium',   age: '4h 01m' },
  { id: 'C-7682', subject: 'Sensor replacement',       customer: 'Orion Pharma',        priority: 'Medium',   age: '4h 50m' },
  { id: 'C-7679', subject: 'Contract renewal',         customer: 'Meridian Bank',       priority: 'Low',      age: '5h 20m' },
  { id: 'C-7676', subject: 'Parts back-order query',   customer: 'Greenfield Foods',    priority: 'Low',      age: '6h 11m' },
  { id: 'C-7673', subject: 'Remote diagnostic request',customer: 'PeakLine Retail',     priority: 'Low',      age: '7h 00m' },
  { id: 'C-7670', subject: 'Firmware update needed',   customer: 'NovaChem Industries', priority: 'Medium',   age: '8h 30m' },
  { id: 'C-7667', subject: 'Emergency shutdown',       customer: 'SkyTech Aviation',    priority: 'Critical', age: '9h 15m' },
]

const PARTS = [
  { name: 'Control Board A4',  sku: 'CB-A4-001',  stock: 3,  reorder: 5,  status: 'Low' },
  { name: 'Pump Seal Kit',      sku: 'PSK-200',    stock: 12, reorder: 8,  status: 'OK' },
  { name: 'HVAC Filter Set',    sku: 'HFS-120',    stock: 0,  reorder: 10, status: 'Out' },
  { name: 'Calibration Weight', sku: 'CAL-50G',    stock: 7,  reorder: 4,  status: 'OK' },
  { name: 'Network Switch 24p', sku: 'NS-24-POE',  stock: 2,  reorder: 3,  status: 'Low' },
  { name: 'Sensor Module 3B',   sku: 'SM-3B-OPT',  stock: 0,  reorder: 6,  status: 'Out' },
  { name: 'Power Supply 48V',   sku: 'PS-48V-10A', stock: 5,  reorder: 4,  status: 'OK' },
  { name: 'Gasket Ring M30',    sku: 'GR-M30',     stock: 18, reorder: 10, status: 'OK' },
]

// ─── Dispatch board data ─────────────────────────────────────────────────────
// 6 technicians, slots 8am–6pm = 10 hrs = 60 half-hour slots → simplified to 5 blocks per tech
// Each block: { hour: start, span: hours, label, color }

const DISPATCH_TECHS = [
  {
    name: 'Marcus Webb',
    blocks: [
      { start: 0,   span: 2.5, label: 'SO-4401 · Hartfield',  color: '#6366f1' },
      { start: 2.5, span: 1,   label: 'Transit',               color: '#27272a' },
      { start: 3.5, span: 2,   label: 'SO-4412 · CrestView',   color: '#6366f1' },
      { start: 6,   span: 2,   label: 'Available',             color: '#10b981', dim: true },
    ],
  },
  {
    name: 'Sara Finch',
    blocks: [
      { start: 0.5, span: 3.5, label: 'SO-4402 · NovaChem',   color: '#6366f1' },
      { start: 4,   span: 1.5, label: 'SO-4415 · Meridian',   color: '#6366f1' },
      { start: 5.5, span: 2.5, label: 'Available',            color: '#10b981', dim: true },
    ],
  },
  {
    name: 'James Okafor',
    blocks: [
      { start: 1,   span: 1.5, label: 'SO-4403 · Apex',       color: '#ef4444' },
      { start: 2.5, span: 1,   label: 'Transit',              color: '#27272a' },
      { start: 3.5, span: 3,   label: 'SO-4418 · PeakLine',   color: '#6366f1' },
      { start: 7,   span: 1,   label: 'Break',                color: '#27272a' },
    ],
  },
  {
    name: 'Yuki Tanaka',
    blocks: [
      { start: 0,   span: 1.5, label: 'Admin',                color: '#27272a' },
      { start: 1.5, span: 4,   label: 'SO-4404 · BlueStar',   color: '#6366f1' },
      { start: 5.5, span: 2.5, label: 'Available',            color: '#10b981', dim: true },
    ],
  },
  {
    name: 'Liam Ortega',
    blocks: [
      { start: 3.5, span: 2,   label: 'SO-4408 · SkyTech',    color: '#ef4444' },
      { start: 5.5, span: 2,   label: 'SO-4420 · Orion',      color: '#6366f1' },
      { start: 8,   span: 2,   label: 'Available',            color: '#10b981', dim: true },
    ],
  },
  {
    name: 'Elena Marsh',
    blocks: [
      { start: 2.5, span: 2,   label: 'SO-4406 · Orion',      color: '#f59e0b' },
      { start: 4.5, span: 1.5, label: 'Transit',              color: '#27272a' },
      { start: 6,   span: 2,   label: 'SO-4422 · Greenfield', color: '#6366f1' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
  Critical: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  High:     { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  Medium:   { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
  Low:      { bg: 'rgba(63,63,70,0.5)',    text: '#a1a1aa' },
}

const STATUS_STYLE: Record<string, { color: string }> = {
  'In Progress': { color: '#818cf8' },
  'En Route':    { color: '#34d399' },
  'Dispatched':  { color: '#fbbf24' },
  'Scheduled':   { color: '#a1a1aa' },
  'Completed':   { color: '#10b981' },
}

const STOCK_STYLE: Record<string, { color: string }> = {
  OK:  { color: '#10b981' },
  Low: { color: '#f59e0b' },
  Out: { color: '#ef4444' },
}

const NAV_ITEMS = [
  'Cases', 'Service Orders', 'Dispatch Board', 'Resources',
  'Knowledge Base', 'SLA Policies', 'Warranties', 'Contracts',
]

// ─── Donut Chart SVG ──────────────────────────────────────────────────────────
// On-Time=28, At-Risk=11, Breached=8 → total=47

function SLADonut() {
  const onTime   = 28
  const atRisk   = 11
  const breached = 8
  const total    = onTime + atRisk + breached
  const r = 48
  const cx = 65, cy = 65
  const circ = 2 * Math.PI * r

  const segs = [
    { val: onTime,   color: '#10b981', label: 'On-Time' },
    { val: atRisk,   color: '#f59e0b', label: 'At-Risk' },
    { val: breached, color: '#ef4444', label: 'Breached' },
  ]

  let off = 0
  const circles = segs.map((s) => {
    const dash = (s.val / total) * circ
    const gap  = circ - dash
    const el = (
      <circle
        key={s.label}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={s.color}
        strokeWidth={13}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-off}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    )
    off += dash
    return el
  })

  return (
    <div>
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">SLA Status</div>
      <div className="flex items-center gap-3">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth={13} />
          {circles}
          <text x={cx} y={cy - 5}  textAnchor="middle" fill="#f4f4f5" fontSize="16" fontWeight="700">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#71717a" fontSize="8.5">open cases</text>
        </svg>
        <div className="space-y-1.5">
          {segs.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] text-zinc-400">{s.label}</span>
              <span className="text-[11px] font-bold ml-auto pl-2" style={{ color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Dispatch Board SVG ───────────────────────────────────────────────────────
// 6 rows, 10 hour slots (8am–6pm), 800px wide

function DispatchBoard() {
  const TOTAL_HOURS = 10
  const ROW_H = 38
  const LABEL_W = 110
  const CHART_W = 660
  const HEADER_H = 28

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
    const h = 8 + i
    return h <= 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`
  })

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
        <span className="text-sm font-semibold text-zinc-200">Dispatch Board — Apr 22, 2026</span>
        <span className="text-xs text-zinc-500 ml-3">6 technicians · 12 active orders</span>
      </div>
      <div className="overflow-x-auto p-4">
        <svg
          width={LABEL_W + CHART_W}
          height={HEADER_H + DISPATCH_TECHS.length * ROW_H + 4}
          style={{ display: 'block' }}
        >
          {/* Hour grid lines & labels */}
          {hours.map((h, i) => {
            const x = LABEL_W + (i / TOTAL_HOURS) * CHART_W
            return (
              <g key={h}>
                <line x1={x} y1={0} x2={x} y2={HEADER_H + DISPATCH_TECHS.length * ROW_H}
                  stroke="rgba(63,63,70,0.4)" strokeWidth={i === 0 ? 0 : 1} />
                <text x={x} y={16} textAnchor="middle" fill="#52525b" fontSize="9">{h}</text>
              </g>
            )
          })}

          {/* Row backgrounds + tech labels */}
          {DISPATCH_TECHS.map((tech, ri) => {
            const y = HEADER_H + ri * ROW_H
            return (
              <g key={tech.name}>
                <rect x={0} y={y} width={LABEL_W + CHART_W} height={ROW_H}
                  fill={ri % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'} />
                <line x1={0} y1={y + ROW_H} x2={LABEL_W + CHART_W} y2={y + ROW_H}
                  stroke="rgba(63,63,70,0.25)" strokeWidth={0.5} />
                <text x={LABEL_W - 8} y={y + ROW_H / 2 + 4} textAnchor="end"
                  fill="#a1a1aa" fontSize="9.5">{tech.name}</text>

                {/* Blocks */}
                {tech.blocks.map((blk, bi) => {
                  const bx = LABEL_W + (blk.start / TOTAL_HOURS) * CHART_W
                  const bw = (blk.span / TOTAL_HOURS) * CHART_W - 2
                  return (
                    <g key={bi}>
                      <rect
                        x={bx + 1} y={y + 5}
                        width={Math.max(bw, 4)} height={ROW_H - 10}
                        rx={3}
                        fill={blk.color}
                        opacity={(blk as { dim?: boolean }).dim ? 0.25 : 0.8}
                      />
                      {bw > 50 && (
                        <text x={bx + 6} y={y + ROW_H / 2 + 4}
                          fill="#fff" fontSize="8" opacity="0.9"
                          style={{ pointerEvents: 'none' }}
                        >
                          {blk.label.slice(0, Math.floor(bw / 6.5))}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#6366f1' }} /> Service Order
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#ef4444' }} /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#f59e0b' }} /> At-Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#10b981', opacity: 0.3 }} /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#27272a' }} /> Transit/Admin
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServiceWorkspacePage() {
  return (
    <>
      <TopBar
        title="Service Workspace"
        breadcrumb={[{ label: 'Service', href: '/service' }]}
      />

      {/* ── KPI Strip ─────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-6 gap-3 px-6 pt-5 pb-4"
        style={{ background: '#0f0f1a' }}
      >
        {[
          { label: 'Open Cases',          value: '47',   sub: 'Across all queues',  accent: '#6366f1' },
          { label: 'SLA Breach Risk',     value: '8',    sub: 'Next 2 hours',       accent: '#ef4444' },
          { label: 'Dispatched Today',    value: '12',   sub: 'Apr 22 orders',      accent: '#10b981' },
          { label: 'Avg Resolution Time', value: '4.2h', sub: 'Rolling 7-day avg',  accent: '#f59e0b' },
          { label: 'Customer Satisfaction',value:'4.1/5',sub: '126 responses',      accent: '#34d399' },
          { label: 'Parts on Order',      value: '23',   sub: '3 urgent items',     accent: '#f59e0b' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-3"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className="text-xl font-bold" style={{ color: kpi.accent }}>{kpi.value}</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout: Left | Center | Right ─────────────────────────────── */}
      <div
        className="flex gap-0"
        style={{ background: '#0f0f1a', paddingBottom: '24px' }}
      >
        {/* ── LEFT NAV 220px ───────────────────────────────────────────────── */}
        <div
          className="shrink-0 p-4"
          style={{ width: '220px', borderRight: '1px solid rgba(63,63,70,0.5)' }}
        >
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Workspace</div>
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors"
              style={
                i === 2
                  ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
                  : { color: '#a1a1aa' }
              }
            >
              <span>{item}</span>
              {i === 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                >
                  47
                </span>
              )}
              {i === 1 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
                >
                  28
                </span>
              )}
            </button>
          ))}

          <div className="mt-6">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Quick Actions</div>
            <button
              className="w-full py-2 text-xs font-medium rounded-lg mb-2"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              + New Case
            </button>
            <button
              className="w-full py-2 text-xs font-medium rounded-lg mb-2 text-zinc-300"
              style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
            >
              Create Work Order
            </button>
            <button
              className="w-full py-2 text-xs font-medium rounded-lg text-zinc-300"
              style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
            >
              Schedule Resource
            </button>
          </div>
        </div>

        {/* ── CENTER ───────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 px-4 pt-4 min-w-0">

          {/* Dispatch Board */}
          <DispatchBoard />

          {/* Today's Service Orders table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
              <span className="text-sm font-semibold text-zinc-200">Today&#39;s Service Orders</span>
              <span className="text-xs text-zinc-500">10 orders · Apr 22, 2026</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.4)' }}>
                    {['Order No.','Customer','Type','Priority','Technician','Scheduled','Status','SLA Deadline'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((o, i) => {
                    const pri = PRIORITY_STYLE[o.priority] ?? PRIORITY_STYLE.Low
                    const sts = STATUS_STYLE[o.status]   ?? STATUS_STYLE.Scheduled
                    return (
                      <tr
                        key={o.no}
                        style={{
                          borderBottom: '1px solid rgba(63,63,70,0.25)',
                          background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        }}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-3 py-2.5 font-mono text-zinc-400">{o.no}</td>
                        <td className="px-3 py-2.5 font-medium text-zinc-200 whitespace-nowrap">{o.customer}</td>
                        <td className="px-3 py-2.5 text-zinc-400">{o.type}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{ background: pri.bg, color: pri.text }}
                          >
                            {o.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-300 whitespace-nowrap">{o.tech}</td>
                        <td className="px-3 py-2.5 font-mono text-zinc-400">{o.time}</td>
                        <td className="px-3 py-2.5">
                          <span style={{ color: sts.color }} className="font-medium">{o.status}</span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-zinc-400">{o.sla}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL 260px ────────────────────────────────────────────── */}
        <div
          className="shrink-0 flex flex-col gap-4 p-4"
          style={{ width: '260px', borderLeft: '1px solid rgba(63,63,70,0.5)' }}
        >
          {/* SLA Status donut */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <SLADonut />
          </div>

          {/* Case Queue */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Case Queue
              <span className="ml-2 text-[10px] font-normal text-zinc-600">12 open</span>
            </div>
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {CASES.map((c) => {
                const p = PRIORITY_STYLE[c.priority] ?? PRIORITY_STYLE.Low
                return (
                  <div
                    key={c.id}
                    className="flex items-start gap-2 p-2 rounded-lg transition-colors hover:bg-zinc-800/40"
                  >
                    <span
                      className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: p.text }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-zinc-600">{c.id}</span>
                        <span className="text-[9px] text-zinc-600 shrink-0">{c.age}</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 truncate">{c.subject}</div>
                      <div className="text-[10px] text-zinc-600 truncate">{c.customer}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Parts Availability */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Parts Availability</div>
            <div className="space-y-2">
              {PARTS.map((p) => {
                const sc = STOCK_STYLE[p.status]
                return (
                  <div key={p.sku} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-zinc-300 font-medium truncate">{p.name}</div>
                      <div className="text-[10px] text-zinc-600 font-mono">{p.sku}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold" style={{ color: sc.color }}>
                        {p.stock === 0 ? 'Out' : p.stock}
                      </div>
                      <div className="text-[9px] text-zinc-600">RO:{p.reorder}</div>
                    </div>
                    <div
                      className="w-1.5 h-8 rounded-full shrink-0"
                      style={{
                        background: sc.color,
                        opacity: p.stock === 0 ? 1 : p.stock <= p.reorder ? 0.7 : 0.3,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
