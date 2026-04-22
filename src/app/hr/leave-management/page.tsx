export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ── Static mock data ──────────────────────────────────────────────────────────

const LEAVE_TYPES = [
  { id: 'vacation',     label: 'Vacation',    accrual: '15d / yr',  color: '#6366f1', colorMuted: 'rgba(99,102,241,0.18)' },
  { id: 'sick',         label: 'Sick Leave',  accrual: '10d / yr',  color: '#f59e0b', colorMuted: 'rgba(245,158,11,0.18)'  },
  { id: 'fmla',         label: 'FMLA',        accrual: '480 hr',    color: '#10b981', colorMuted: 'rgba(16,185,129,0.18)' },
  { id: 'bereavement',  label: 'Bereavement', accrual: '5d',        color: '#8b5cf6', colorMuted: 'rgba(139,92,246,0.18)' },
  { id: 'personal',     label: 'Personal',    accrual: '3d',        color: '#ec4899', colorMuted: 'rgba(236,72,153,0.18)' },
  { id: 'military',     label: 'Military',    accrual: 'Unlimited', color: '#0ea5e9', colorMuted: 'rgba(14,165,233,0.18)'  },
]

const REQUESTS = [
  { id: 1,  employee: 'Ava Thompson',    type: 'vacation',    from: 'Apr 21', to: 'Apr 25', days: 5,  reason: 'Family vacation',        status: 'Pending'  },
  { id: 2,  employee: 'Liam Carter',     type: 'sick',        from: 'Apr 22', to: 'Apr 22', days: 1,  reason: 'Doctor appointment',     status: 'Pending'  },
  { id: 3,  employee: 'Sofia Reyes',     type: 'vacation',    from: 'May 1',  to: 'May 5',  days: 5,  reason: 'Spring break trip',      status: 'Pending'  },
  { id: 4,  employee: 'Noah Williams',   type: 'personal',    from: 'Apr 23', to: 'Apr 23', days: 1,  reason: 'Personal errand',        status: 'Pending'  },
  { id: 5,  employee: 'Emma Davis',      type: 'sick',        from: 'Apr 24', to: 'Apr 25', days: 2,  reason: 'Flu symptoms',           status: 'Pending'  },
  { id: 6,  employee: 'James Wilson',    type: 'bereavement', from: 'Apr 18', to: 'Apr 22', days: 5,  reason: 'Family bereavement',     status: 'Approved' },
  { id: 7,  employee: 'Olivia Brown',    type: 'vacation',    from: 'Apr 28', to: 'Apr 30', days: 3,  reason: 'Weekend extension',      status: 'Approved' },
  { id: 8,  employee: 'Ethan Martinez',  type: 'fmla',        from: 'May 5',  to: 'May 30', days: 26, reason: 'Medical leave (FMLA)',   status: 'Pending'  },
  { id: 9,  employee: 'Mia Johnson',     type: 'sick',        from: 'Apr 10', to: 'Apr 11', days: 2,  reason: 'Stomach illness',        status: 'Rejected' },
  { id: 10, employee: 'Lucas Garcia',    type: 'personal',    from: 'Apr 15', to: 'Apr 15', days: 1,  reason: 'Personal matter',        status: 'Cancelled'},
  { id: 11, employee: 'Chloe Lee',       type: 'vacation',    from: 'May 12', to: 'May 16', days: 5,  reason: 'Summer preview trip',    status: 'Pending'  },
  { id: 12, employee: 'Aiden Scott',     type: 'sick',        from: 'Apr 22', to: 'Apr 22', days: 1,  reason: 'Headache / migraine',    status: 'Pending'  },
]

const EMPLOYEES_BALANCE = [
  { name: 'Ava Thompson',   vacation: 12, sick: 8  },
  { name: 'Liam Carter',    vacation: 15, sick: 10 },
  { name: 'Sofia Reyes',    vacation: 9,  sick: 6  },
  { name: 'Noah Williams',  vacation: 14, sick: 9  },
  { name: 'Emma Davis',     vacation: 7,  sick: 4  },
  { name: 'James Wilson',   vacation: 10, sick: 10 },
  { name: 'Olivia Brown',   vacation: 3,  sick: 7  },
  { name: 'Ethan Martinez', vacation: 15, sick: 5  },
]

const UPCOMING = [
  { employee: 'James Wilson',   type: 'bereavement', from: 'Apr 18', to: 'Apr 22', days: 5  },
  { employee: 'Olivia Brown',   type: 'vacation',    from: 'Apr 28', to: 'Apr 30', days: 3  },
  { employee: 'Sofia Reyes',    type: 'vacation',    from: 'May 1',  to: 'May 5',  days: 5  },
  { employee: 'Ethan Martinez', type: 'fmla',        from: 'May 5',  to: 'May 30', days: 26 },
  { employee: 'Ava Thompson',   type: 'vacation',    from: 'Apr 21', to: 'Apr 25', days: 5  },
  { employee: 'Noah Williams',  type: 'personal',    from: 'Apr 23', to: 'Apr 23', days: 1  },
  { employee: 'Emma Davis',     type: 'sick',        from: 'Apr 24', to: 'Apr 25', days: 2  },
  { employee: 'Chloe Lee',      type: 'vacation',    from: 'May 12', to: 'May 16', days: 5  },
  { employee: 'Liam Carter',    type: 'sick',        from: 'Apr 22', to: 'Apr 22', days: 1  },
  { employee: 'Aiden Scott',    type: 'sick',        from: 'Apr 22', to: 'Apr 22', days: 1  },
]

const POLICY_VIOLATIONS = [
  { employee: 'Ethan Martinez', issue: 'FMLA consecutive days exceeding 30-day window', severity: 'High'   },
  { employee: 'Olivia Brown',   issue: 'Vacation balance below 2d (near depletion)',     severity: 'Medium' },
  { employee: 'Emma Davis',     issue: '3 sick occurrences in 60-day rolling period',    severity: 'Low'    },
]

// April 2026 calendar leave blocks: [employeeInitials, day, typeId]
const CAL_BLOCKS: [string, number, string][] = [
  ['JW', 18, 'bereavement'], ['JW', 19, 'bereavement'], ['JW', 20, 'bereavement'],
  ['JW', 21, 'bereavement'], ['JW', 22, 'bereavement'],
  ['AT', 21, 'vacation'], ['AT', 22, 'vacation'], ['AT', 23, 'vacation'],
  ['AT', 24, 'vacation'], ['AT', 25, 'vacation'],
  ['LC', 22, 'sick'],
  ['NW', 23, 'personal'],
  ['ED', 24, 'sick'], ['ED', 25, 'sick'],
  ['OB', 28, 'vacation'], ['OB', 29, 'vacation'], ['OB', 30, 'vacation'],
  ['AS', 22, 'sick'],
]

// April 2026: starts Wednesday (day-of-week index 3, 0=Sun)
const APR_START_DOW = 3
const APR_DAYS = 30

function typeColor(typeId: string) {
  return LEAVE_TYPES.find(t => t.id === typeId)?.color ?? '#6366f1'
}

const STATUS_STYLE: Record<string, string> = {
  Pending:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Approved:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Rejected:  'bg-red-500/20 text-red-400 border border-red-500/30',
  Cancelled: 'bg-zinc-700/40 text-zinc-500 border border-zinc-700/40',
}

const SEVERITY_STYLE: Record<string, string> = {
  High:   'bg-red-500/20 text-red-400',
  Medium: 'bg-amber-500/20 text-amber-400',
  Low:    'bg-zinc-700/40 text-zinc-400',
}

// ── KPI strip ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-4 py-3.5 flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
      <p className={`text-[22px] font-bold tabular-nums leading-none ${accent ?? 'text-zinc-100'}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Leave type sidebar item ───────────────────────────────────────────────────
function LeaveTypeItem({ lt }: { lt: typeof LEAVE_TYPES[number] }) {
  const count = REQUESTS.filter(r => r.type === lt.id && r.status === 'Pending').length
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors hover:bg-zinc-800/40"
      style={{ borderLeft: `3px solid ${lt.color}` }}
    >
      <div className="ml-2">
        <p className="text-[12px] font-medium text-zinc-200 leading-none">{lt.label}</p>
        <p className="text-[10px] text-zinc-500 mt-0.5">{lt.accrual}</p>
      </div>
      {count > 0 && (
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: lt.colorMuted, color: lt.color }}
        >
          {count}
        </span>
      )}
    </div>
  )
}

// ── April 2026 calendar (SVG) ─────────────────────────────────────────────────
function LeaveCalendar() {
  const CELL_W = 46
  const CELL_H = 52
  const HEAD_H = 28
  const PAD = 8
  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const totalCells = APR_START_DOW + APR_DAYS
  const rows = Math.ceil(totalCells / 7)
  const W = 7 * CELL_W + PAD * 2
  const H = HEAD_H + rows * CELL_H + PAD * 2

  // Group blocks by day
  const byDay: Record<number, [string, string][]> = {}
  for (const [initials, day, type] of CAL_BLOCKS) {
    if (!byDay[day]) byDay[day] = []
    byDay[day].push([initials, type])
  }

  const today = 22 // April 22 2026

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
      {/* Day headers */}
      {DAYS_OF_WEEK.map((d, i) => (
        <text
          key={d}
          x={PAD + i * CELL_W + CELL_W / 2}
          y={HEAD_H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="#71717a"
          fontFamily="ui-monospace,monospace"
        >
          {d}
        </text>
      ))}

      {Array.from({ length: APR_DAYS }, (_, idx) => {
        const day = idx + 1
        const cellIndex = APR_START_DOW + idx
        const col = cellIndex % 7
        const row = Math.floor(cellIndex / 7)
        const x = PAD + col * CELL_W
        const y = PAD + HEAD_H + row * CELL_H
        const isToday = day === today
        const blocks = byDay[day] ?? []
        const isWeekend = col === 0 || col === 6

        return (
          <g key={day}>
            {/* Cell bg */}
            <rect
              x={x + 1} y={y + 1} width={CELL_W - 2} height={CELL_H - 2}
              rx={4}
              fill={isToday ? 'rgba(99,102,241,0.12)' : isWeekend ? 'rgba(255,255,255,0.02)' : 'transparent'}
              stroke={isToday ? 'rgba(99,102,241,0.5)' : 'rgba(63,63,70,0.3)'}
              strokeWidth={isToday ? 1.5 : 0.5}
            />
            {/* Day number */}
            <text
              x={x + CELL_W - 6} y={y + 14}
              textAnchor="end"
              fontSize={10}
              fill={isToday ? '#818cf8' : isWeekend ? '#52525b' : '#a1a1aa'}
              fontFamily="ui-monospace,monospace"
              fontWeight={isToday ? 700 : 400}
            >
              {day}
            </text>
            {/* Leave blocks (up to 3) */}
            {blocks.slice(0, 3).map(([initials, type], bi) => (
              <g key={bi}>
                <rect
                  x={x + 2} y={y + 18 + bi * 11}
                  width={CELL_W - 4} height={10}
                  rx={2}
                  fill={typeColor(type)}
                  opacity={0.75}
                />
                <text
                  x={x + CELL_W / 2} y={y + 26 + bi * 11}
                  textAnchor="middle"
                  fontSize={7.5}
                  fill="#fff"
                  fontFamily="ui-monospace,monospace"
                  fontWeight={600}
                >
                  {initials}
                </text>
              </g>
            ))}
            {blocks.length > 3 && (
              <text x={x + CELL_W - 4} y={y + CELL_H - 4} textAnchor="end" fontSize={7} fill="#71717a">
                +{blocks.length - 3}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Leave balance bar chart (SVG) ─────────────────────────────────────────────
function BalanceBarChart() {
  const maxVal = 15
  const BAR_H = 20
  const GAP = 6
  const LABEL_W = 104
  const BAR_AREA = 120
  const W = LABEL_W + BAR_AREA + 8
  const H = EMPLOYEES_BALANCE.length * (BAR_H + GAP) + GAP

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      {EMPLOYEES_BALANCE.map((emp, i) => {
        const y = GAP + i * (BAR_H + GAP)
        const vacW = (emp.vacation / maxVal) * BAR_AREA * 0.55
        const sickW = (emp.sick / maxVal) * BAR_AREA * 0.45
        const firstName = emp.name.split(' ')[0]
        return (
          <g key={emp.name}>
            <text x={0} y={y + BAR_H / 2 + 4} fontSize={9.5} fill="#a1a1aa" fontFamily="ui-sans-serif,sans-serif">
              {firstName}
            </text>
            {/* Vacation bar */}
            <rect x={LABEL_W} y={y + 2} width={vacW} height={BAR_H - 4} rx={2} fill="#6366f1" opacity={0.8} />
            {/* Sick bar */}
            <rect x={LABEL_W + vacW + 2} y={y + 2} width={sickW} height={BAR_H - 4} rx={2} fill="#f59e0b" opacity={0.7} />
            <text x={LABEL_W + vacW + sickW + 6} y={y + BAR_H / 2 + 4} fontSize={8.5} fill="#71717a" fontFamily="ui-monospace,monospace">
              {emp.vacation}v/{emp.sick}s
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LeaveManagementPage() {
  const pending   = REQUESTS.filter(r => r.status === 'Pending').length
  const onLeave   = CAL_BLOCKS.filter(([, day]) => day === 22).length  // today = Apr 22
  const balAvg    = (EMPLOYEES_BALANCE.reduce((s, e) => s + e.vacation, 0) / EMPLOYEES_BALANCE.length).toFixed(1)
  const approved  = REQUESTS.filter(r => r.status === 'Approved').length
  const rejected  = REQUESTS.filter(r => r.status === 'Rejected').length

  return (
    <>
      <TopBar
        title="Leave Management"
        breadcrumb={[{ label: 'HR', href: '/hr' }]}
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-5 space-y-5">

          {/* ── KPI strip ── */}
          <div className="flex gap-3 flex-wrap">
            <KpiCard label="Leave Requests"      value={String(pending)}  sub="Pending approval"      accent="text-amber-400"   />
            <KpiCard label="On Leave Today"      value={String(onLeave)}  sub="April 22, 2026"         accent="text-rose-400"    />
            <KpiCard label="Avg Balance"         value={`${balAvg}d`}     sub="Vacation (avg)"         accent="text-indigo-400"  />
            <KpiCard label="Approved This Month" value={String(approved)} sub="April 2026"             accent="text-emerald-400" />
            <KpiCard label="Rejected"            value={String(rejected)} sub="This month"             accent="text-zinc-400"    />
          </div>

          {/* ── 3-column layout ── */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '240px 1fr 260px' }}>

            {/* ── LEFT: Leave Types ── */}
            <div className="space-y-1">
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-3 py-2.5 border-b border-zinc-800/50">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Leave Types</p>
                </div>
                <div className="p-2 space-y-0.5">
                  {LEAVE_TYPES.map(lt => <LeaveTypeItem key={lt.id} lt={lt} />)}
                </div>
                {/* Legend */}
                <div className="px-3 py-2.5 border-t border-zinc-800/50 space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1.5">Legend</p>
                  {LEAVE_TYPES.map(lt => (
                    <div key={lt.id} className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: lt.color }} />
                      <span className="text-[10px] text-zinc-500">{lt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── CENTER ── */}
            <div className="space-y-4 min-w-0">

              {/* Calendar */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-100">Leave Calendar</p>
                    <p className="text-[10px] text-zinc-500">April 2026 — color-coded by leave type</p>
                  </div>
                  <div className="flex gap-3">
                    {LEAVE_TYPES.slice(0, 4).map(lt => (
                      <span key={lt.id} className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <span className="w-2 h-2 rounded-sm inline-block" style={{ background: lt.color }} />
                        {lt.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 overflow-x-auto">
                  <LeaveCalendar />
                </div>
              </div>

              {/* Pending Requests Table */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-100">Leave Requests</p>
                    <p className="text-[10px] text-zinc-500">{REQUESTS.length} requests — {pending} pending review</p>
                  </div>
                  <button className="px-3 py-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors font-medium">
                    + New Request
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-zinc-800/60">
                      <tr>
                        {['Employee', 'Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[9px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {REQUESTS.map(req => {
                        const lt = LEAVE_TYPES.find(t => t.id === req.type)
                        return (
                          <tr key={req.id} className="hover:bg-zinc-800/25 transition-colors">
                            <td className="px-3 py-2.5 text-[11px] font-medium text-zinc-200 whitespace-nowrap">{req.employee}</td>
                            <td className="px-3 py-2.5">
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                                style={{ background: lt?.colorMuted, color: lt?.color }}
                              >
                                {lt?.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-[11px] text-zinc-400 whitespace-nowrap">{req.from}</td>
                            <td className="px-3 py-2.5 text-[11px] text-zinc-400 whitespace-nowrap">{req.to}</td>
                            <td className="px-3 py-2.5 text-[11px] text-zinc-300 tabular-nums font-medium">{req.days}</td>
                            <td className="px-3 py-2.5 text-[11px] text-zinc-500 max-w-[160px] truncate">{req.reason}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLE[req.status]}`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              {req.status === 'Pending' ? (
                                <div className="flex gap-1">
                                  <button className="px-2 py-0.5 text-[10px] bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 border border-emerald-600/30 rounded transition-colors font-medium">
                                    Approve
                                  </button>
                                  <button className="px-2 py-0.5 text-[10px] bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/20 rounded transition-colors font-medium">
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-zinc-600">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="space-y-4">

              {/* Leave Balance Summary */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-3 py-2.5 border-b border-zinc-800/50">
                  <p className="text-[11px] font-semibold text-zinc-200">Leave Balance Summary</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">
                    <span className="inline-flex items-center gap-1 mr-2">
                      <span className="w-2 h-2 rounded-sm inline-block bg-indigo-500" />Vacation
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm inline-block bg-amber-500" />Sick
                    </span>
                  </p>
                </div>
                <div className="p-3">
                  <BalanceBarChart />
                </div>
              </div>

              {/* Upcoming Absences */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-3 py-2.5 border-b border-zinc-800/50">
                  <p className="text-[11px] font-semibold text-zinc-200">Upcoming Absences</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Next 30 days</p>
                </div>
                <div className="divide-y divide-zinc-800/40">
                  {UPCOMING.map((u, i) => {
                    const lt = LEAVE_TYPES.find(t => t.id === u.type)
                    return (
                      <div key={i} className="px-3 py-2 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-zinc-200 truncate">{u.employee}</p>
                          <p className="text-[10px] text-zinc-500">{u.from} – {u.to}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 text-right">
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: lt?.colorMuted, color: lt?.color }}
                          >
                            {lt?.label}
                          </span>
                          <p className="text-[9px] text-zinc-600 mt-0.5">{u.days}d</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Policy Violations */}
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
                <div className="px-3 py-2.5 border-b border-zinc-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-200">Policy Violations</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{POLICY_VIOLATIONS.length} flagged</p>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="divide-y divide-zinc-800/40">
                  {POLICY_VIOLATIONS.map((v, i) => (
                    <div key={i} className="px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[11px] font-medium text-zinc-200">{v.employee}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${SEVERITY_STYLE[v.severity]}`}>
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-snug">{v.issue}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
