import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

// ─── Static mock data ────────────────────────────────────────────────────────

const RESOURCES = [
  { id: 'R001', name: 'Alicia Vance',    role: 'Consultant',  dept: 'Advisory',    skills: ['PM','Finance','Azure'],    projects: 3, util: 92, availFrom: 'May 12' },
  { id: 'R002', name: 'Marcus Webb',     role: 'Developer',   dept: 'Engineering', skills: ['React','Azure','SQL'],     projects: 2, util: 78, availFrom: 'Apr 28' },
  { id: 'R003', name: 'Priya Nair',      role: 'Analyst',     dept: 'Data',        skills: ['SQL','Finance','PM'],      projects: 1, util: 54, availFrom: 'Apr 23' },
  { id: 'R004', name: 'Derek Holt',      role: 'Manager',     dept: 'Delivery',    skills: ['PM','Finance','Azure'],    projects: 4, util: 110, availFrom: 'May 19' },
  { id: 'R005', name: 'Simone Roy',      role: 'Consultant',  dept: 'Advisory',    skills: ['Azure','React','SQL'],     projects: 2, util: 85, availFrom: 'May 5' },
  { id: 'R006', name: 'James Okafor',    role: 'Developer',   dept: 'Engineering', skills: ['React','SQL','PM'],        projects: 1, util: 40, availFrom: 'Apr 22' },
  { id: 'R007', name: 'Nina Castellano', role: 'Analyst',     dept: 'Data',        skills: ['SQL','Finance','Azure'],   projects: 2, util: 67, availFrom: 'Apr 30' },
  { id: 'R008', name: 'Liam Ortega',     role: 'Consultant',  dept: 'Advisory',    skills: ['PM','Azure','Finance'],    projects: 3, util: 95, availFrom: 'May 14' },
  { id: 'R009', name: 'Sara Finch',      role: 'Developer',   dept: 'Engineering', skills: ['React','SQL','Azure'],     projects: 2, util: 72, availFrom: 'May 2' },
  { id: 'R010', name: 'Tom Kurosawa',    role: 'Manager',     dept: 'PMO',         skills: ['PM','Finance','SQL'],      projects: 5, util: 115, availFrom: 'May 26' },
  { id: 'R011', name: 'Elena Marsh',     role: 'Analyst',     dept: 'Data',        skills: ['SQL','Azure','Finance'],   projects: 1, util: 48, availFrom: 'Apr 24' },
  { id: 'R012', name: 'Chris Patel',     role: 'Other',       dept: 'Support',     skills: ['SQL','React','PM'],        projects: 1, util: 30, availFrom: 'Apr 22' },
  { id: 'R013', name: 'Aisha Brennan',   role: 'Consultant',  dept: 'Advisory',    skills: ['Finance','Azure','PM'],    projects: 2, util: 88, availFrom: 'May 8' },
  { id: 'R014', name: 'Rafael Dumas',    role: 'Developer',   dept: 'Engineering', skills: ['React','Azure','SQL'],     projects: 1, util: 61, availFrom: 'Apr 25' },
  { id: 'R015', name: 'Yuki Tanaka',     role: 'Other',       dept: 'Support',     skills: ['PM','SQL','Finance'],      projects: 1, util: 35, availFrom: 'Apr 22' },
]

const CATEGORIES = [
  { label: 'Consultant', count: 12 },
  { label: 'Developer',  count: 8 },
  { label: 'Analyst',    count: 6 },
  { label: 'Manager',    count: 5 },
  { label: 'Other',      count: 3 },
]

const SKILLS_FILTER = ['PM', 'Azure', 'React', 'SQL', 'Finance']

const SKILL_GAP = [
  { skill: 'Azure',   demand: 18, capacity: 11, pct: 61 },
  { skill: 'React',   demand: 15, capacity: 9,  pct: 60 },
  { skill: 'Finance', demand: 14, capacity: 10, pct: 71 },
  { skill: 'PM',      demand: 12, capacity: 8,  pct: 67 },
  { skill: 'SQL',     demand: 20, capacity: 14, pct: 70 },
  { skill: 'D365',    demand: 10, capacity: 4,  pct: 40 },
]

const TOP_UTILIZED = [
  { name: 'Tom Kurosawa',    util: 115, spark: [70,80,90,100,110,115] },
  { name: 'Derek Holt',      util: 110, spark: [65,80,95,100,108,110] },
  { name: 'Liam Ortega',     util: 95,  spark: [60,70,78,85,92,95] },
  { name: 'Alicia Vance',    util: 92,  spark: [55,65,74,82,88,92] },
  { name: 'Aisha Brennan',   util: 88,  spark: [50,60,70,78,84,88] },
]

// ─── Gantt data: 12 resources × 4 weeks ──────────────────────────────────────
// Each resource has daily state: 'booked' | 'available' | 'off'
// Week starts Apr 21 2026 (Mon). 20 weekdays across 4 weeks.

const GANTT_ROWS = [
  { name: 'Alicia V.',    days: ['B','B','B','B','B', 'B','B','B','A','B', 'B','B','B','B','B', 'A','A','B','B','B'] },
  { name: 'Marcus W.',    days: ['A','B','B','A','B', 'B','A','A','B','B', 'A','B','B','A','A', 'B','B','A','A','B'] },
  { name: 'Priya N.',     days: ['A','A','B','A','A', 'A','A','A','B','A', 'A','A','A','B','A', 'A','A','A','A','B'] },
  { name: 'Derek H.',     days: ['B','B','B','B','B', 'B','B','B','B','B', 'B','B','B','B','B', 'B','B','B','B','B'] },
  { name: 'Simone R.',    days: ['B','B','A','B','B', 'B','B','B','A','B', 'B','A','B','B','B', 'A','B','B','A','B'] },
  { name: 'James O.',     days: ['A','A','A','A','B', 'A','A','A','A','B', 'A','A','A','A','A', 'A','A','A','A','A'] },
  { name: 'Nina C.',      days: ['B','A','B','A','B', 'A','B','A','B','A', 'B','A','A','B','A', 'A','B','A','B','A'] },
  { name: 'Liam O.',      days: ['B','B','B','B','B', 'B','B','A','B','B', 'B','B','B','B','A', 'B','B','B','B','B'] },
  { name: 'Sara F.',      days: ['A','B','B','B','A', 'B','B','B','A','B', 'A','B','B','A','B', 'B','A','B','B','A'] },
  { name: 'Tom K.',       days: ['B','B','B','B','B', 'B','B','B','B','B', 'B','B','B','B','B', 'B','B','B','B','B'] },
  { name: 'Elena M.',     days: ['A','A','B','A','A', 'A','B','A','A','A', 'A','A','B','A','A', 'A','A','A','A','A'] },
  { name: 'Chris P.',     days: ['A','A','A','A','A', 'A','A','A','A','A', 'A','A','A','A','B', 'A','A','A','A','A'] },
]

// Week headers: Apr 21, Apr 28, May 5, May 12
const WEEK_HEADERS = ['Apr 21', 'Apr 28', 'May 5', 'May 12']
const DAY_LABELS   = ['M','T','W','T','F', 'M','T','W','T','F', 'M','T','W','T','F', 'M','T','W','T','F']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function utilColor(u: number) {
  if (u > 100) return '#ef4444'
  if (u >= 80)  return '#f59e0b'
  return '#10b981'
}

function utilBarColor(u: number) {
  if (u > 100) return '#ef4444'
  if (u >= 80)  return '#f59e0b'
  return '#6366f1'
}

// ─── Donut chart SVG ──────────────────────────────────────────────────────────
// available=22, booked=8, overbooked=4 → total=34
function UtilizationDonut() {
  const available  = 22
  const booked     = 8
  const overbooked = 4
  const total      = available + booked + overbooked
  const r = 52
  const cx = 70, cy = 70
  const circumference = 2 * Math.PI * r

  // Segments: available=teal, booked=indigo, overbooked=red
  const segments = [
    { value: available,  color: '#10b981', label: 'Available' },
    { value: booked,     color: '#6366f1', label: 'Booked' },
    { value: overbooked, color: '#ef4444', label: 'Overbooked' },
  ]

  let offset = 0
  const paths = segments.map((seg) => {
    const pct = seg.value / total
    const dash = pct * circumference
    const gap  = circumference - dash
    const el = (
      <circle
        key={seg.label}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={14}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    )
    offset += dash
    return el
  })

  return (
    <div>
      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Utilization Overview</div>
      <div className="flex items-center gap-4">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth={14} />
          {paths}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#f4f4f5" fontSize="18" fontWeight="700">34</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#71717a" fontSize="9">resources</text>
        </svg>
        <div className="space-y-2">
          {segments.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-xs text-zinc-300">{s.label}</span>
              <span className="text-xs font-semibold text-zinc-100 ml-auto pl-3">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
  const w = 56, h = 20
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectResourcesPage() {
  return (
    <>
      <TopBar
        title="Resources"
        breadcrumb={[{ label: 'Projects', href: '/projects' }]}
      />

      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-5 gap-3 px-6 pt-5 pb-4"
        style={{ background: '#0f0f1a' }}
      >
        {[
          { label: 'Total Resources',    value: '34',  sub: 'All active',         accent: '#6366f1' },
          { label: 'Available',          value: '22',  sub: 'Ready to book',      accent: '#10b981' },
          { label: 'Overbooked',         value: '4',   sub: 'Needs attention',    accent: '#ef4444' },
          { label: 'Utilization Rate',   value: '73%', sub: 'Rolling 4-week avg', accent: '#f59e0b' },
          { label: 'Bookings This Week', value: '18',  sub: 'Apr 21 – Apr 25',    accent: '#6366f1' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="text-[11px] text-zinc-400 uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className="text-2xl font-bold" style={{ color: kpi.accent }}>{kpi.value}</div>
            <div className="text-[11px] text-zinc-500 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout: Left | Center | Right ─────────────────────────────── */}
      <div
        className="flex gap-0 min-h-0"
        style={{ background: '#0f0f1a', padding: '0 0 24px 0' }}
      >
        {/* ── LEFT PANEL 240px ─────────────────────────────────────────────── */}
        <div
          className="shrink-0 flex flex-col gap-4 p-4"
          style={{ width: '240px', borderRight: '1px solid rgba(63,63,70,0.5)' }}
        >
          {/* Resource categories */}
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Categories</div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 text-sm text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              >
                <span>{cat.label}</span>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Skills filter */}
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_FILTER.map((sk) => (
                <button
                  key={sk}
                  className="px-2.5 py-1 text-xs rounded-md text-zinc-300 hover:text-white transition-colors"
                  style={{ background: '#1e293b', border: '1px solid rgba(63,63,70,0.5)' }}
                >
                  {sk}
                </button>
              ))}
            </div>
          </div>

          {/* Role filter */}
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Role</div>
            {['All Roles', 'Billable', 'Non-billable', 'External', 'Internal'].map((r) => (
              <button
                key={r}
                className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded transition-colors"
              >
                {r}
              </button>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-auto">
            <button
              className="w-full py-2 text-xs font-medium rounded-lg transition-colors"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              + New Booking
            </button>
            <button
              className="w-full py-2 text-xs font-medium rounded-lg mt-2 transition-colors text-zinc-300 hover:text-white"
              style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
            >
              Export Report
            </button>
          </div>
        </div>

        {/* ── CENTER ───────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 px-4 pt-4 min-w-0">

          {/* ── Gantt Chart ───────────────────────────────────────────────── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
              <span className="text-sm font-semibold text-zinc-200">Resource Availability — Apr 21 – May 18, 2026</span>
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#6366f1' }} /> Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#3f3f46' }} /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#1c1c27' }} /> Off
                </span>
              </div>
            </div>

            <svg
              width="100%"
              viewBox="0 0 900 300"
              preserveAspectRatio="xMinYMin meet"
              style={{ display: 'block' }}
            >
              {/* Background */}
              <rect width="900" height="300" fill="#16213e" />

              {/* Week header bands */}
              {WEEK_HEADERS.map((wk, wi) => (
                <g key={wk}>
                  <rect x={160 + wi * 185} y={0} width={185} height={28}
                    fill={wi % 2 === 0 ? '#1a2540' : '#16213e'} />
                  <text x={160 + wi * 185 + 92} y={18} textAnchor="middle"
                    fill="#94a3b8" fontSize="10" fontWeight="600">{wk}</text>
                  {wi > 0 && (
                    <line x1={160 + wi * 185} y1={0} x2={160 + wi * 185} y2={300}
                      stroke="rgba(63,63,70,0.6)" strokeWidth="1" />
                  )}
                </g>
              ))}

              {/* Day labels */}
              {DAY_LABELS.map((d, i) => (
                <text key={i} x={160 + i * 37 + 18} y={42} textAnchor="middle"
                  fill="#52525b" fontSize="8.5">{d}</text>
              ))}

              {/* Today marker (day 0 = Apr 22, i.e. column index 1) */}
              <line x1={160 + 1 * 37 + 18} y1={28} x2={160 + 1 * 37 + 18} y2={300}
                stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.8" />
              <text x={160 + 1 * 37 + 18} y={24} textAnchor="middle"
                fill="#6366f1" fontSize="8" fontWeight="700">TODAY</text>

              {/* Row dividers */}
              {GANTT_ROWS.map((_, ri) => (
                <line key={ri} x1={0} y1={52 + ri * 21} x2={900} y2={52 + ri * 21}
                  stroke="rgba(63,63,70,0.3)" strokeWidth="0.5" />
              ))}

              {/* Resource name column */}
              {GANTT_ROWS.map((row, ri) => (
                <text key={row.name} x={150} y={52 + ri * 21 + 14} textAnchor="end"
                  fill="#a1a1aa" fontSize="9.5">{row.name}</text>
              ))}

              {/* Gantt blocks */}
              {GANTT_ROWS.map((row, ri) =>
                row.days.map((state, di) => {
                  const fill = state === 'B' ? '#6366f1'
                    : state === 'A' ? '#3f3f46'
                    : '#1c1c27'
                  const opacity = state === 'B' ? 0.85 : state === 'A' ? 0.5 : 0.3
                  return (
                    <rect
                      key={`${ri}-${di}`}
                      x={160 + di * 37 + 2}
                      y={52 + ri * 21 + 3}
                      width={33}
                      height={15}
                      rx={3}
                      fill={fill}
                      opacity={opacity}
                    />
                  )
                })
              )}
            </svg>
          </div>

          {/* ── Resource Table ────────────────────────────────────────────── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
              <span className="text-sm font-semibold text-zinc-200">Resource Directory</span>
              <span className="ml-2 text-xs text-zinc-500">15 resources</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.4)' }}>
                    {['ID','Name','Role','Department','Skills','Projects','Utilization','Available From'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESOURCES.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid rgba(63,63,70,0.25)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      }}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-3 py-2.5 font-mono text-zinc-500">{r.id}</td>
                      <td className="px-3 py-2.5 font-medium text-zinc-200 whitespace-nowrap">{r.name}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{r.role}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{r.dept}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {r.skills.map((sk) => (
                            <span
                              key={sk}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-zinc-300">{r.projects}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(r.util, 100)}%`,
                                background: utilBarColor(r.util),
                              }}
                            />
                          </div>
                          <span style={{ color: utilColor(r.util), minWidth: '32px' }} className="font-medium">
                            {r.util}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{r.availFrom}</td>
                    </tr>
                  ))}
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
          {/* Utilization donut */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <UtilizationDonut />
          </div>

          {/* Skill Gap Analysis */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Skill Gap Analysis</div>
            <div className="space-y-3">
              {SKILL_GAP.map((s) => (
                <div key={s.skill}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-300 font-medium">{s.skill}</span>
                    <span className="text-[10px] text-zinc-500">{s.capacity}/{s.demand}</span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#0f0f1a' }}>
                    {/* Demand track */}
                    <div className="absolute inset-0 rounded-full" style={{ background: '#27272a' }} />
                    {/* Capacity fill */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${s.pct}%`,
                        background: s.pct < 60 ? '#ef4444' : s.pct < 75 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">{s.demand - s.capacity} gap · {s.pct}% covered</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Utilized */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)' }}
          >
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Top Utilized</div>
            <div className="space-y-3">
              {TOP_UTILIZED.map((r) => (
                <div key={r.name} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-300 font-medium truncate">{r.name}</div>
                    <div
                      className="text-[10px] font-bold"
                      style={{ color: r.util > 100 ? '#ef4444' : '#f59e0b' }}
                    >
                      {r.util}%
                    </div>
                  </div>
                  <Sparkline data={r.spark} color={r.util > 100 ? '#ef4444' : '#f59e0b'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
