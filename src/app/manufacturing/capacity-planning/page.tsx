export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ─── Static mock data ────────────────────────────────────────────────────────

const WORK_CENTERS = [
  { id: 1, name: 'Assembly Line A',  code: 'ASM-A', utilization: 87, capacity: 160 },
  { id: 2, name: 'Welding Station',  code: 'WLD-1', utilization: 92, capacity: 120 },
  { id: 3, name: 'Paint Booth',      code: 'PNT-1', utilization: 61, capacity: 80  },
  { id: 4, name: 'CNC Mill 1',       code: 'CNC-1', utilization: 78, capacity: 200 },
  { id: 5, name: 'CNC Mill 2',       code: 'CNC-2', utilization: 45, capacity: 200 },
  { id: 6, name: 'Quality Check',    code: 'QC-01', utilization: 55, capacity: 100 },
  { id: 7, name: 'Packaging',        code: 'PKG-1', utilization: 82, capacity: 140 },
  { id: 8, name: 'Shipping Dock',    code: 'SHP-1', utilization: 69, capacity: 180 },
]

// 8 weeks: Apr 21 → Jun 8 2026
const WEEKS = [
  { label: 'Apr 21', startDate: '2026-04-21' },
  { label: 'Apr 28', startDate: '2026-04-28' },
  { label: 'May 5',  startDate: '2026-05-05' },
  { label: 'May 12', startDate: '2026-05-12' },
  { label: 'May 19', startDate: '2026-05-19' },
  { label: 'May 26', startDate: '2026-05-26' },
  { label: 'Jun 1',  startDate: '2026-06-01' },
  { label: 'Jun 8',  startDate: '2026-06-08' },
]

// Per-WC per-week load% — realistic variance around each WC's base utilization
const WEEKLY_LOAD: Record<string, number[]> = {
  'ASM-A': [82, 87, 91, 94, 88, 83, 79, 85],
  'WLD-1': [89, 92, 98, 96, 90, 88, 84, 92],
  'PNT-1': [58, 61, 65, 62, 57, 60, 63, 59],
  'CNC-1': [74, 78, 82, 80, 76, 72, 70, 77],
  'CNC-2': [42, 45, 48, 50, 46, 44, 43, 47],
  'QC-01': [52, 55, 58, 60, 54, 51, 53, 56],
  'PKG-1': [80, 82, 86, 89, 85, 80, 78, 82],
  'SHP-1': [65, 69, 72, 70, 67, 64, 68, 71],
}

const BOTTLENECK_ANALYSIS = [
  { wc: 'Welding Station', code: 'WLD-1', week: 'May 5',  excessHours: 9.6, load: 98 },
  { wc: 'Welding Station', code: 'WLD-1', week: 'May 12', excessHours: 7.2, load: 96 },
  { wc: 'Assembly Line A', code: 'ASM-A', week: 'May 12', excessHours: 6.4, load: 94 },
]

const ACTION_ITEMS = [
  { priority: 'High',   action: 'Shift Welding Station work orders to WLD-2 (spare capacity available) for Wks 16–18' },
  { priority: 'High',   action: 'Authorize overtime on Assembly Line A — Wk 17: +8 hrs Saturday shift' },
  { priority: 'Medium', action: 'Outsource 12% of Packaging load (PKG-1) to contract facility for Wk 17–18' },
  { priority: 'Medium', action: 'Delay 3 non-critical production orders (PO-0441, PO-0447, PO-0452) by 1 week' },
  { priority: 'Low',    action: 'Schedule preventive maintenance on CNC Mill 1 during low-load Wk 20 (70%)' },
  { priority: 'Low',    action: 'Review CNC Mill 2 utilization — persistent underload; consider rebalancing routing' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadColor(pct: number): string {
  if (pct > 90) return '#ef4444'   // red-500
  if (pct >= 70) return '#f59e0b'  // amber-500
  return '#10b981'                  // emerald-500
}

function loadBg(pct: number): string {
  if (pct > 90) return 'rgba(239,68,68,0.15)'
  if (pct >= 70) return 'rgba(245,158,11,0.15)'
  return 'rgba(16,185,129,0.12)'
}

function loadText(pct: number): string {
  if (pct > 90) return '#fca5a5'
  if (pct >= 70) return '#fcd34d'
  return '#6ee7b7'
}

function utilizationBarColor(pct: number): string {
  if (pct > 90) return '#ef4444'
  if (pct >= 70) return '#f59e0b'
  return '#6366f1'
}

const priorityColor: Record<string, string> = {
  High:   'bg-red-500/15 text-red-400 border-red-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Low:    'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

// ─── SVG Gantt chart constants ────────────────────────────────────────────────

const SVG_W       = 760
const SVG_H       = 500
const LEFT_PAD    = 118  // Y-axis label area
const RIGHT_PAD   = 12
const TOP_PAD     = 36   // header row
const BOTTOM_PAD  = 24
const ROW_H       = (SVG_H - TOP_PAD - BOTTOM_PAD) / WORK_CENTERS.length  // per-row height
const COL_W       = (SVG_W - LEFT_PAD - RIGHT_PAD) / WEEKS.length          // per-week width
const BAR_PADDING = 4   // px top/bottom within row
const TODAY_X     = LEFT_PAD + COL_W * 1 + COL_W * (1 / 7) // Apr 22 = day 1 of wk Apr 21

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CapacityPlanningPage() {
  const totalWCs       = WORK_CENTERS.length
  const bottleneckWCs  = WORK_CENTERS.filter(w => w.utilization > 90).length
  const avgUtilization = Math.round(WORK_CENTERS.reduce((s, w) => s + w.utilization, 0) / WORK_CENTERS.length)
  const overloadedPeriods = BOTTLENECK_ANALYSIS.length
  const availableHours = WORK_CENTERS.reduce((s, w) => s + Math.round(w.capacity * (1 - w.utilization / 100)), 0)

  const kpis = [
    { label: 'Total Work Centers',       value: totalWCs,            color: 'text-indigo-400',  bar: '#6366f1' },
    { label: 'Bottleneck WCs',           value: bottleneckWCs,       color: 'text-red-400',     bar: '#ef4444' },
    { label: 'Avg Utilization',          value: `${avgUtilization}%`, color: 'text-amber-400',  bar: '#f59e0b' },
    { label: 'Overloaded Periods',       value: overloadedPeriods,   color: 'text-orange-400',  bar: '#f97316' },
    { label: 'Available Capacity (hrs)', value: availableHours.toLocaleString(), color: 'text-emerald-400', bar: '#10b981' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0f0f1a' }}>
      <TopBar
        title="Capacity Planning"
        breadcrumb={[{ label: 'Manufacturing', href: '/manufacturing' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              Run MRP
            </button>
            <button
              className="px-3 py-1.5 rounded text-xs font-medium border transition-colors"
              style={{ background: 'transparent', color: '#a1a1aa', borderColor: 'rgba(63,63,70,0.6)' }}
            >
              Refresh
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-auto p-5 space-y-4">

        {/* ── KPI Strip ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {kpis.map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg p-4 border"
              style={{ background: '#16213e', borderColor: 'rgba(63,63,70,0.5)' }}
            >
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[10px] uppercase tracking-wide mt-1" style={{ color: '#71717a' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Three-column layout ─────────────────────────────────────────── */}
        <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>

          {/* Left: Work Center List */}
          <div
            className="rounded-lg border shrink-0"
            style={{ width: 220, background: '#16213e', borderColor: 'rgba(63,63,70,0.5)' }}
          >
            <div
              className="px-3 py-2 border-b text-[11px] font-semibold uppercase tracking-wider"
              style={{ borderColor: 'rgba(63,63,70,0.5)', color: '#6366f1' }}
            >
              Work Centers
            </div>
            <div className="p-2 space-y-1.5">
              {WORK_CENTERS.map(wc => {
                const barColor = utilizationBarColor(wc.utilization)
                return (
                  <div key={wc.id} className="px-1.5 py-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium" style={{ color: '#e2e8f0' }}>{wc.name}</span>
                      <span
                        className="text-[11px] font-bold tabular-nums"
                        style={{ color: barColor }}
                      >
                        {wc.utilization}%
                      </span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(63,63,70,0.5)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${wc.utilization}%`, background: barColor }}
                      />
                    </div>
                    <div className="mt-0.5 text-[10px]" style={{ color: '#52525b' }}>{wc.code} · {wc.capacity}h cap</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Center: SVG Gantt Chart */}
          <div
            className="rounded-lg border flex-1 overflow-hidden"
            style={{ background: '#16213e', borderColor: 'rgba(63,63,70,0.5)' }}
          >
            <div
              className="px-4 py-2 border-b flex items-center gap-2"
              style={{ borderColor: 'rgba(63,63,70,0.5)' }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#6366f1' }}>
                Capacity Load — Apr 21 · Jun 8, 2026
              </span>
              <span className="ml-auto flex items-center gap-3 text-[10px]" style={{ color: '#71717a' }}>
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#10b981' }} />&lt;70%</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#f59e0b' }} />70–90%</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#ef4444' }} />&gt;90%</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                width={SVG_W}
                height={SVG_H}
                style={{ display: 'block', minWidth: SVG_W }}
                aria-label="Capacity Gantt chart"
              >
                {/* Background grid */}
                {WEEKS.map((_, wi) => (
                  <rect
                    key={`bg-col-${wi}`}
                    x={LEFT_PAD + wi * COL_W}
                    y={TOP_PAD}
                    width={COL_W}
                    height={SVG_H - TOP_PAD - BOTTOM_PAD}
                    fill={wi % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
                  />
                ))}

                {/* Horizontal row dividers */}
                {WORK_CENTERS.map((_, ri) => (
                  <line
                    key={`hdiv-${ri}`}
                    x1={LEFT_PAD}
                    y1={TOP_PAD + ri * ROW_H}
                    x2={SVG_W - RIGHT_PAD}
                    y2={TOP_PAD + ri * ROW_H}
                    stroke="rgba(63,63,70,0.25)"
                    strokeWidth={1}
                  />
                ))}

                {/* Week header columns */}
                {WEEKS.map((wk, wi) => (
                  <g key={`wk-hdr-${wi}`}>
                    <line
                      x1={LEFT_PAD + wi * COL_W}
                      y1={0}
                      x2={LEFT_PAD + wi * COL_W}
                      y2={SVG_H - BOTTOM_PAD}
                      stroke="rgba(63,63,70,0.3)"
                      strokeWidth={1}
                    />
                    <text
                      x={LEFT_PAD + wi * COL_W + COL_W / 2}
                      y={22}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#71717a"
                      fontFamily="ui-monospace, monospace"
                    >
                      {wk.label}
                    </text>
                  </g>
                ))}

                {/* Y-axis: WC labels */}
                {WORK_CENTERS.map((wc, ri) => {
                  const cy = TOP_PAD + ri * ROW_H + ROW_H / 2
                  return (
                    <g key={`wc-label-${ri}`}>
                      <text
                        x={LEFT_PAD - 6}
                        y={cy + 1}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={10}
                        fill="#a1a1aa"
                        fontFamily="ui-sans-serif, sans-serif"
                      >
                        {wc.name}
                      </text>
                      <text
                        x={LEFT_PAD - 6}
                        y={cy + 12}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={8.5}
                        fill="#52525b"
                        fontFamily="ui-monospace, monospace"
                      >
                        {wc.code}
                      </text>
                    </g>
                  )
                })}

                {/* Load bars */}
                {WORK_CENTERS.map((wc, ri) => {
                  const loads = WEEKLY_LOAD[wc.code]
                  return loads.map((pct, wi) => {
                    const x   = LEFT_PAD + wi * COL_W + 3
                    const y   = TOP_PAD + ri * ROW_H + BAR_PADDING
                    const bw  = COL_W - 6
                    const bh  = ROW_H - BAR_PADDING * 2
                    const fillW = (pct / 100) * bw
                    const col = loadColor(pct)
                    return (
                      <g key={`bar-${ri}-${wi}`}>
                        {/* Background track */}
                        <rect
                          x={x}
                          y={y}
                          width={bw}
                          height={bh}
                          rx={3}
                          fill="rgba(255,255,255,0.04)"
                        />
                        {/* Fill bar */}
                        <rect
                          x={x}
                          y={y}
                          width={fillW}
                          height={bh}
                          rx={3}
                          fill={col}
                          opacity={0.75}
                        />
                        {/* % label inside bar */}
                        {bw > 28 && (
                          <text
                            x={x + bw / 2}
                            y={y + bh / 2 + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={9}
                            fill={pct > 50 ? '#fff' : '#71717a'}
                            fontFamily="ui-monospace, monospace"
                            opacity={0.9}
                          >
                            {pct}%
                          </text>
                        )}
                      </g>
                    )
                  })
                })}

                {/* Today line (Apr 22 ≈ day 1 of week Apr 21) */}
                <line
                  x1={TODAY_X}
                  y1={TOP_PAD}
                  x2={TODAY_X}
                  y2={SVG_H - BOTTOM_PAD}
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
                <text
                  x={TODAY_X + 3}
                  y={TOP_PAD + 10}
                  fontSize={9}
                  fill="#818cf8"
                  fontFamily="ui-sans-serif, sans-serif"
                >
                  Today
                </text>

                {/* Bottom axis line */}
                <line
                  x1={LEFT_PAD}
                  y1={SVG_H - BOTTOM_PAD}
                  x2={SVG_W - RIGHT_PAD}
                  y2={SVG_H - BOTTOM_PAD}
                  stroke="rgba(63,63,70,0.4)"
                  strokeWidth={1}
                />
              </svg>
            </div>
          </div>

          {/* Right: Bottleneck + Action Items */}
          <div className="shrink-0 space-y-3" style={{ width: 260 }}>

            {/* Bottleneck Analysis FastTab */}
            <div
              className="rounded-lg border"
              style={{ background: '#16213e', borderColor: 'rgba(63,63,70,0.5)' }}
            >
              <div
                className="px-3 py-2 border-b text-[11px] font-semibold uppercase tracking-wider"
                style={{ borderColor: 'rgba(63,63,70,0.5)', color: '#ef4444' }}
              >
                Bottleneck Analysis
              </div>
              <div className="p-3 space-y-2">
                {BOTTLENECK_ANALYSIS.map((b, i) => (
                  <div
                    key={i}
                    className="rounded-md p-2.5"
                    style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-semibold" style={{ color: '#fca5a5' }}>{b.wc}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}
                      >
                        {b.load}%
                      </span>
                    </div>
                    <div className="text-[11px]" style={{ color: '#a1a1aa' }}>
                      Week of {b.week} · <span style={{ color: '#fca5a5' }}>+{b.excessHours}h excess</span>
                    </div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: '#52525b' }}>{b.code}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items FastTab */}
            <div
              className="rounded-lg border"
              style={{ background: '#16213e', borderColor: 'rgba(63,63,70,0.5)' }}
            >
              <div
                className="px-3 py-2 border-b text-[11px] font-semibold uppercase tracking-wider"
                style={{ borderColor: 'rgba(63,63,70,0.5)', color: '#6366f1' }}
              >
                Action Items
              </div>
              <div className="p-3 space-y-2">
                {ACTION_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-md p-2.5"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(63,63,70,0.4)' }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${priorityColor[item.priority]}`}
                      >
                        {item.priority}
                      </span>
                      <p className="text-[11px] leading-relaxed" style={{ color: '#a1a1aa' }}>{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Capacity Load Table ──────────────────────────────────────────── */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: '#16213e', borderColor: 'rgba(63,63,70,0.5)' }}
        >
          <div
            className="px-4 py-2 border-b text-[11px] font-semibold uppercase tracking-wider"
            style={{ borderColor: 'rgba(63,63,70,0.5)', color: '#6366f1' }}
          >
            Capacity Load Grid — % Utilization by Work Center &amp; Week
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.4)', background: 'rgba(0,0,0,0.2)' }}>
                  <th
                    className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wide font-semibold whitespace-nowrap"
                    style={{ color: '#71717a', minWidth: 160 }}
                  >
                    Work Center
                  </th>
                  {WEEKS.map(wk => (
                    <th
                      key={wk.label}
                      className="text-center px-2 py-2.5 text-[10px] uppercase tracking-wide font-medium whitespace-nowrap"
                      style={{ color: '#71717a', minWidth: 72 }}
                    >
                      {wk.label}
                    </th>
                  ))}
                  <th
                    className="text-center px-3 py-2.5 text-[10px] uppercase tracking-wide font-medium whitespace-nowrap"
                    style={{ color: '#71717a', minWidth: 64 }}
                  >
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody>
                {WORK_CENTERS.map((wc, ri) => {
                  const loads = WEEKLY_LOAD[wc.code]
                  const avg   = Math.round(loads.reduce((s, v) => s + v, 0) / loads.length)
                  return (
                    <tr
                      key={wc.id}
                      style={{ borderBottom: '1px solid rgba(63,63,70,0.25)' }}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-2.5">
                        <div className="text-[12px] font-medium" style={{ color: '#e2e8f0' }}>{wc.name}</div>
                        <div className="text-[10px] font-mono" style={{ color: '#52525b' }}>{wc.code}</div>
                      </td>
                      {loads.map((pct, wi) => (
                        <td key={wi} className="px-2 py-2.5 text-center">
                          <span
                            className="inline-block rounded px-2 py-0.5 text-[11px] font-bold tabular-nums"
                            style={{
                              background: loadBg(pct),
                              color:      loadText(pct),
                              minWidth:   38,
                            }}
                          >
                            {pct}%
                          </span>
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className="inline-block rounded px-2 py-0.5 text-[11px] font-bold tabular-nums"
                          style={{
                            background: loadBg(avg),
                            color:      loadText(avg),
                            minWidth:   38,
                          }}
                        >
                          {avg}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div
            className="px-4 py-2 border-t text-[10px]"
            style={{ borderColor: 'rgba(63,63,70,0.3)', color: '#52525b' }}
          >
            Color key: <span style={{ color: '#6ee7b7' }}>Green &lt;70%</span> · <span style={{ color: '#fcd34d' }}>Amber 70–90%</span> · <span style={{ color: '#fca5a5' }}>Red &gt;90%</span> · NovaPOS Capacity Planning Module
          </div>
        </div>

      </main>
    </div>
  )
}
