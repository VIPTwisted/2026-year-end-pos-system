'use client'

import { useEffect, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PipelineStage {
  label: string
  value: string
  color: string
  width: number
}

interface LeadSlice {
  label: string
  value: number
  color: string
}

interface FinancialKpi {
  label: string
  value: string
  trend: string | null
  goal: number | null
  delta: string | null
  alert: boolean
}

interface GaugeData {
  label: string
  value: number
  max: number
  display: string
  subLabel: string
  alert: boolean
}

interface Opportunity {
  topic: string
  estRev: string
  healthState: string
  healthColor: string
  trend: string
  account: string
  timeSpent: number
  timeEngaged: number
  lastUpdated: string
}

interface CandidateBar {
  label: string
  value: number
  max: number
}

interface Lead {
  initials: string
  name: string
  color: string
  description: string
  badge: string
}

interface WorkItem {
  initials: string
  color: string
  title: string
  status: string
}

interface CaseOrigin {
  priority: string
  segments: { label: string; value: number; color: string }[]
}

interface WorkOrder {
  label: string
  value: number
  color: string
}

interface HeadcountRow {
  dept: string
  lastYear: number
  thisYear: number
}

interface AnalyticsData {
  salesPipeline: { stages: PipelineStage[] }
  leadsBySource: LeadSlice[]
  leadsByRating: LeadSlice[]
  financialKpis: FinancialKpi[]
  gauges: GaugeData[]
  opportunities: Opportunity[]
  candidatesPipeline: CandidateBar[]
  jobsMetrics: { withApplicants: number; noApplicants: number }
  openLeads: Lead[]
  workItems: WorkItem[]
  casesByOrigin: CaseOrigin[]
  workOrdersByStatus: WorkOrder[]
  headcount: HeadcountRow[]
}

// ─── SVG Chart Components ─────────────────────────────────────────────────────

function FunnelChart({ stages }: { stages: PipelineStage[] }) {
  const h = 40
  const gap = 3
  const totalH = stages.length * (h + gap)
  const W = 260

  return (
    <svg width={W} height={totalH} className="mx-auto">
      {stages.map((s, i) => {
        const topW = s.width
        const botW = stages[i + 1]?.width ?? Math.max(s.width * 0.75, 40)
        const y = i * (h + gap)
        const padT = (W - topW) / 2
        const padB = (W - botW) / 2
        return (
          <g key={i}>
            <polygon
              points={`${padT},${y} ${padT + topW},${y} ${padB + botW},${y + h} ${padB},${y + h}`}
              fill={s.color}
              opacity={0.9}
            />
            <text
              x={W / 2}
              y={y + h / 2 + 5}
              textAnchor="middle"
              fontSize="11"
              fill="white"
              fontWeight="600"
            >
              {s.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function DonutChart({ slices, size = 80, thickness = 16 }: { slices: LeadSlice[]; size?: number; thickness?: number }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  let cumAngle = -Math.PI / 2

  const paths = slices.map((sl) => {
    const angle = (sl.value / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(cumAngle)
    const y1 = cy + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + r * Math.cos(cumAngle)
    const y2 = cy + r * Math.sin(cumAngle)
    const large = angle > Math.PI ? 1 : 0
    const d = `M ${x1},${y1} A ${r},${r} 0 ${large},1 ${x2},${y2}`
    return { d, color: sl.color }
  })

  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={thickness} strokeLinecap="butt" />
      ))}
    </svg>
  )
}

function GaugeChart({ gauge }: { gauge: GaugeData }) {
  const pct = Math.min(gauge.value / gauge.max, 1)
  const r = 52
  const cx = 70
  const cy = 68
  const trackD = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`
  const valueAngle = Math.PI - pct * Math.PI
  const vx = cx + r * Math.cos(valueAngle)
  const vy = cy - r * Math.sin(valueAngle)
  const largeArc = pct > 0.5 ? 1 : 0
  const valueD = pct === 0
    ? ''
    : `M ${cx - r},${cy} A ${r},${r} 0 ${largeArc},1 ${vx},${vy}`
  const strokeColor = gauge.alert ? '#ef4444' : '#6366f1'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={140} height={82}>
        <path d={trackD} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} strokeLinecap="round" />
        {valueD && (
          <path d={valueD} fill="none" stroke={strokeColor} strokeWidth={12} strokeLinecap="round" />
        )}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill={gauge.alert ? '#ef4444' : 'white'}
        >
          {gauge.display}
        </text>
      </svg>
      <span className="text-[10px] text-zinc-500 text-center leading-tight px-1">{gauge.subLabel}</span>
      <span className="text-[11px] text-zinc-400 text-center leading-tight">{gauge.label}</span>
    </div>
  )
}

function StackedBarChart({ data }: { data: CaseOrigin[] }) {
  const allTotals = data.map((d) => d.segments.reduce((s, seg) => s + seg.value, 0))
  const maxTotal = Math.max(...allTotals, 1)
  const barH = 80
  const barW = 32
  const gap = 28
  const totalW = data.length * (barW + gap)

  return (
    <svg width={totalW + 20} height={barH + 24} className="mx-auto">
      {data.map((col, ci) => {
        let yOffset = 0
        const total = col.segments.reduce((s, seg) => s + seg.value, 0)
        const scale = barH / maxTotal
        return (
          <g key={ci} transform={`translate(${ci * (barW + gap) + 10}, 0)`}>
            {col.segments.map((seg, si) => {
              const segH = seg.value * scale
              const y = barH - yOffset - segH
              yOffset += segH
              return (
                <rect key={si} x={0} y={y} width={barW} height={Math.max(segH, 1)} fill={seg.color} rx={si === 0 ? 2 : 0} />
              )
            })}
            <text x={barW / 2} y={barH + 14} textAnchor="middle" fontSize="10" fill="#71717a">
              {col.priority}
            </text>
            <text x={barW / 2} y={barH - 2} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
              {total}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function GroupedBarChart({ data }: { data: HeadcountRow[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.lastYear, d.thisYear]), 1)
  const barH = 90
  const groupW = 36
  const barW = 14
  const gap = 18
  const totalW = data.length * (groupW + gap)

  return (
    <svg width={totalW + 20} height={barH + 36} className="mx-auto">
      {data.map((row, i) => {
        const lyH = (row.lastYear / maxVal) * barH
        const tyH = (row.thisYear / maxVal) * barH
        const x = i * (groupW + gap) + 10
        return (
          <g key={i}>
            <rect x={x} y={barH - lyH} width={barW} height={lyH} fill="#7dd3fc" rx={2} />
            <rect x={x + barW + 2} y={barH - tyH} width={barW} height={tyH} fill="#6366f1" rx={2} />
            <text x={x + barW + 1} y={barH + 12} textAnchor="middle" fontSize="8" fill="#71717a">
              {row.dept.substring(0, 8)}
            </text>
            <text x={x + barW + 1} y={barH + 22} textAnchor="middle" fontSize="8" fill="#71717a">
              {row.dept.length > 8 ? row.dept.substring(8, 16) : ''}
            </text>
            <text x={x} y={barH - lyH - 3} textAnchor="middle" fontSize="8" fill="#7dd3fc">
              {row.lastYear}
            </text>
            <text x={x + barW + 2} y={barH - tyH - 3} textAnchor="middle" fontSize="8" fill="#a5b4fc">
              {row.thisYear}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────

function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg p-3 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.15)' }}
    >
      {title && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-zinc-300 tracking-wide">{title}</span>
          <span className="text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">▼</span>
        </div>
      )}
      {children}
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-zinc-400">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: '#0d0e24' }}>
        <div className="text-zinc-500 text-sm animate-pulse">Loading analytics…</div>
      </div>
    )
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen text-white" style={{ background: '#0d0e24' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sales Insights</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Sales · Finance · Service · HR</p>
        </div>
        <div className="flex gap-2">
          <button
            className="text-xs px-3 py-1.5 rounded"
            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
          >
            This month ▼
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
          >
            Share
          </button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex gap-4 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">

          {/* Sales Pipeline */}
          <Card title="Sales Pipeline ▼">
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
              <LegendDot color="#6366f1" label="1-Qualify" />
              <LegendDot color="#0891b2" label="2-Develop" />
              <LegendDot color="#22d3ee" label="3-Propose" />
              <LegendDot color="#ef4444" label="4-Close" />
            </div>
            <FunnelChart stages={data.salesPipeline.stages} />
          </Card>

          {/* Leads by Source */}
          <Card title="Leads by Source">
            <div className="flex items-center gap-4">
              <DonutChart slices={data.leadsBySource} size={90} thickness={18} />
              <div className="flex flex-col gap-1.5">
                {data.leadsBySource.map((s, i) => (
                  <LegendDot key={i} color={s.color} label={`${s.label} (${s.value})`} />
                ))}
              </div>
            </div>
          </Card>

          {/* Leads by Rating */}
          <Card title="Leads by Rating">
            <div className="flex items-center gap-4">
              <DonutChart slices={data.leadsByRating} size={80} thickness={16} />
              <div className="flex flex-col gap-1.5">
                {data.leadsByRating.map((s, i) => (
                  <LegendDot key={i} color={s.color} label={`${s.label} (${s.value})`} />
                ))}
              </div>
            </div>
          </Card>

        </div>

        {/* ── CENTER COLUMN ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Financial KPI Row 1 */}
          <div className="grid grid-cols-3 gap-3">
            {data.financialKpis.slice(0, 3).map((kpi, i) => (
              <div
                key={i}
                className="rounded-lg p-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                <div className="text-[10px] text-zinc-500 mb-1">{kpi.label}</div>
                <div className={`text-xl font-bold ${kpi.alert ? 'text-red-400' : 'text-white'}`}>
                  {kpi.value}
                  {kpi.trend === 'up' && <span className="text-red-400 ml-1 text-sm">↑</span>}
                </div>
                {kpi.goal !== null && (
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Goal: {kpi.goal}{' '}
                    <span className="text-red-400">{kpi.delta}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Financial KPI Row 2 */}
          <div className="grid grid-cols-3 gap-3">
            {data.financialKpis.slice(3, 6).map((kpi, i) => (
              <div
                key={i}
                className="rounded-lg p-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                <div className="text-[10px] text-zinc-500 mb-1">{kpi.label}</div>
                <div className="text-xl font-bold text-white">{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Gauge Row */}
          <div
            className="rounded-lg p-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div className="grid grid-cols-4 gap-2">
              {data.gauges.map((g, i) => (
                <GaugeChart key={i} gauge={g} />
              ))}
            </div>
          </div>

          {/* My Open Opportunities */}
          <Card title="My Open Opportunities">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                    {['', 'Topic ↕', 'Est. Rev ↕', 'Health State ↕', 'Health ↕', 'Account ↕', 'Time Spent ↕', 'Time Engaged ↕', 'Last Updated ↕'].map(
                      (h, i) => (
                        <th
                          key={i}
                          className="text-left py-1.5 px-2 text-zinc-500 font-medium whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.opportunities.map((opp, i) => (
                    <tr
                      key={i}
                      className="hover:bg-white/5 cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="py-1.5 px-2">
                        <input type="checkbox" className="accent-indigo-500 w-3 h-3" />
                      </td>
                      <td className="py-1.5 px-2 text-zinc-200 truncate max-w-[110px]">{opp.topic}</td>
                      <td className="py-1.5 px-2 text-zinc-300">{opp.estRev}</td>
                      <td className="py-1.5 px-2">
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: opp.healthColor }}
                          />
                          <span style={{ color: opp.healthColor }}>{opp.healthState}</span>
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-zinc-400">{opp.trend}</td>
                      <td className="py-1.5 px-2 text-zinc-300">{opp.account}</td>
                      <td className="py-1.5 px-2 text-zinc-400">{opp.timeSpent}</td>
                      <td className="py-1.5 px-2 text-zinc-400">{opp.timeEngaged}</td>
                      <td className="py-1.5 px-2 text-zinc-500 whitespace-nowrap">{opp.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* A-Z pagination */}
            <div className="flex flex-wrap gap-0.5 mt-3 pt-2" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  className="text-[10px] w-5 h-5 rounded hover:bg-indigo-600/40 text-zinc-500 hover:text-white transition-colors"
                >
                  {letter}
                </button>
              ))}
              <button className="text-[10px] w-5 h-5 rounded hover:bg-indigo-600/40 text-zinc-500 hover:text-white transition-colors">
                #
              </button>
            </div>
          </Card>

          {/* Candidates Pipeline */}
          <Card title="Candidates Pipeline">
            <div className="flex flex-col gap-2">
              {data.candidatesPipeline.map((bar, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 w-32 flex-shrink-0">{bar.label}</span>
                  <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{
                        width: `${(bar.value / bar.max) * 100}%`,
                        background: 'linear-gradient(90deg, #6366f1, #0891b2)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-300 w-8 text-right">{bar.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Jobs metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-lg p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <div className="text-[10px] text-zinc-500 mb-1">Jobs with new applicants</div>
              <div className="text-4xl font-bold text-white">
                {data.jobsMetrics.withApplicants}
                <span className="text-green-400 text-xl ml-1">↑</span>
              </div>
            </div>
            <div
              className="rounded-lg p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <div className="text-[10px] text-zinc-500 mb-1">
                Jobs with no applicants{' '}
                <span className="text-indigo-400 cursor-pointer">Less than 5 days ▼</span>
              </div>
              <div className="text-4xl font-bold text-white">
                {data.jobsMetrics.noApplicants}
                <span className="text-green-400 text-xl ml-1">↑</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">

          {/* Open Leads */}
          <Card title="Open Leads">
            <div className="flex flex-col gap-2">
              {data.openLeads.map((lead, i) => (
                <div
                  key={i}
                  className="flex gap-2 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: lead.color }}
                  >
                    {lead.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-medium text-zinc-200">{lead.name}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                      >
                        {lead.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 truncate">{lead.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* My Work Items */}
          <Card title="My work items">
            <div className="flex flex-col gap-2">
              {data.workItems.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-2 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: item.color }}
                  >
                    {item.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] text-zinc-200">{item.title}</div>
                    <div className="text-[10px] text-zinc-500">{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Customer Cases by Origin */}
          <Card title="Customer Cases by Origin">
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
              {data.casesByOrigin[0]?.segments.map((seg, i) => (
                <LegendDot key={i} color={seg.color} label={seg.label} />
              ))}
            </div>
            <StackedBarChart data={data.casesByOrigin} />
          </Card>

          {/* Work Orders by Status (Donut) */}
          <Card title="Work Orders by Status">
            <div className="flex items-center gap-3">
              <DonutChart slices={data.workOrdersByStatus} size={90} thickness={20} />
              <div className="flex flex-col gap-1.5">
                {data.workOrdersByStatus.map((s, i) => (
                  <LegendDot key={i} color={s.color} label={`${s.label} (${s.value})`} />
                ))}
              </div>
            </div>
          </Card>

          {/* Headcount */}
          <Card title="Headcount">
            <div className="flex gap-4 mb-2">
              <LegendDot color="#7dd3fc" label="Last Year" />
              <LegendDot color="#6366f1" label="This Year" />
            </div>
            <GroupedBarChart data={data.headcount} />
          </Card>

        </div>
      </div>
    </div>
  )
}
