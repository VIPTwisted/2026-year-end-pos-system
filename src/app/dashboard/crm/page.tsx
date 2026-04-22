'use client'

import { TopBar } from '@/components/layout/TopBar'
import { useEffect, useState } from 'react'
import { ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface LeadSource { name: string; value: number; color: string }
interface PipelineStage { stage: string; amount: number; color: string; pct: number }
interface Opportunity {
  topic: string; estRev: number; healthKpi: string; trend: string
  account: string; timeSpent: string; timeEngaged: string
}
interface Gauge { value: number; max: number }
interface CsatGauge { value: number; goal: number; delta: number }
interface CandidateStage { stage: string; count: number; color: string }
interface OpenLead { name: string; source: string; note: string; initials: string; color: string }
interface WorkItem { title: string; category: string; timeLeft: string; status: string; initials: string; color: string }
interface CaseOrigin { origin: string; normal: number; low: number; high: number }

interface CRMData {
  leadsBySource: LeadSource[]
  salesPipeline: PipelineStage[]
  opportunities: Opportunity[]
  kpis: { avgDealSize: number; workingCapital: number; cogs: number }
  gauges: { newBusinessToday: Gauge; chatsToday: Gauge; csatToday: CsatGauge; escalationsToday: Gauge }
  candidatesPipeline: CandidateStage[]
  openLeads: OpenLead[]
  workItems: WorkItem[]
  casesByOrigin: CaseOrigin[]
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: LeadSource[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = 52, cx = 64, cy = 64, sw = 22
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      {data.map((d, i) => {
        const pct = d.value / total
        const dash = pct * circ
        const gap = circ - dash
        const rot = offset * 360 - 90
        offset += pct
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={sw}
            strokeDasharray={`${dash} ${gap}`}
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={r - sw / 2 - 2} fill="#0d0e24" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(165,180,252,0.6)" fontSize="9">TOTAL</text>
    </svg>
  )
}

// ─── Funnel SVG ───────────────────────────────────────────────────────────────
function SalesFunnel({ stages }: { stages: PipelineStage[] }) {
  const fmtAmt = (n: number) => '$' + n.toLocaleString()
  return (
    <div className="flex flex-col gap-2 mt-2">
      {stages.map((s, i) => (
        <div key={s.stage} className="flex items-center gap-2">
          <div className="w-16 text-[10px] text-white/50 text-right shrink-0">{s.stage}</div>
          <div className="flex-1 relative h-7 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="absolute inset-y-0 left-0 rounded flex items-center"
              style={{ width: `${s.pct}%`, background: s.color, opacity: 0.85 }}
            />
            <span className="absolute inset-0 flex items-center pl-3 text-[10px] font-semibold text-white z-10">
              {s.stage}
            </span>
          </div>
          <div className="w-28 text-[11px] font-semibold text-white/80 text-right shrink-0">{fmtAmt(s.amount)}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Arc Gauge ────────────────────────────────────────────────────────────────
function ArcGauge({
  value, max, label, subLabel, danger = false
}: { value: number; max: number; label: string; subLabel?: string; danger?: boolean }) {
  const pct = Math.min(1, value / max)
  const r = 38, cx = 50, cy = 54, sw = 8
  const startAngle = -210
  const sweepDeg = 240
  const angle = startAngle + pct * sweepDeg
  const toRad = (d: number) => (d * Math.PI) / 180
  const arcPath = (start: number, end: number) => {
    const sx = cx + r * Math.cos(toRad(start))
    const sy = cy + r * Math.sin(toRad(start))
    const ex = cx + r * Math.cos(toRad(end))
    const ey = cy + r * Math.sin(toRad(end))
    const large = Math.abs(end - start) > 180 ? 1 : 0
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`
  }
  const trackEnd = startAngle + sweepDeg
  const color = danger ? '#ef4444' : '#4f46e5'
  const fmtVal = value >= 1000 ? (value / 1000).toFixed(1) + 'K' : String(value)
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="80" viewBox="0 0 100 80">
        <path d={arcPath(startAngle, trackEnd)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} strokeLinecap="round" />
        <path d={arcPath(startAngle, angle)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill={danger ? '#ef4444' : 'white'} fontSize="16" fontWeight="bold">{fmtVal}</text>
      </svg>
      <span className="text-[10px] text-white/60 text-center leading-tight">{label}</span>
      {subLabel && <span className="text-[9px] text-white/40 text-center">{subLabel}</span>}
    </div>
  )
}

// ─── Trend Icon ───────────────────────────────────────────────────────────────
function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'Improving') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400 inline" />
  if (trend === 'Declining') return <TrendingDown className="w-3.5 h-3.5 text-red-400 inline" />
  return <Minus className="w-3.5 h-3.5 text-yellow-400 inline" />
}

// ─── Health Dot ───────────────────────────────────────────────────────────────
function HealthDot({ kpi }: { kpi: string }) {
  const color = kpi === 'Good' ? '#10b981' : kpi === 'Poor' ? '#ef4444' : '#f59e0b'
  return <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: color }} />
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmtCurrency(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + (n / 1000).toFixed(1) + 'K'
  return '$' + n.toFixed(0)
}

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────
function HorizBarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <div className="w-28 text-[10px] text-white/50 text-right shrink-0 truncate">{d.label}</div>
          <div className="flex-1 relative h-5 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="absolute inset-y-0 left-0 rounded"
              style={{ width: `${Math.round((d.value / maxVal) * 100)}%`, background: d.color }}
            />
            <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-semibold text-white z-10">
              {d.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Stacked Bar Chart (Cases by Origin) ──────────────────────────────────────
function StackedBarChart({ data }: { data: CaseOrigin[] }) {
  const maxTotal = Math.max(...data.map((d) => d.normal + d.low + d.high))
  const BAR_H = 100
  return (
    <div className="flex items-end gap-3 mt-3" style={{ height: BAR_H + 32 }}>
      {data.map((d) => {
        const tot = d.normal + d.low + d.high
        const hN = (d.normal / maxTotal) * BAR_H
        const hL = (d.low / maxTotal) * BAR_H
        const hH = (d.high / maxTotal) * BAR_H
        return (
          <div key={d.origin} className="flex flex-col items-center gap-1 flex-1">
            <div className="flex flex-col justify-end w-full" style={{ height: BAR_H }}>
              <div title={`High: ${d.high}`} style={{ height: hH, background: '#ef4444', borderRadius: '2px 2px 0 0' }} />
              <div title={`Normal: ${d.normal}`} style={{ height: hN, background: '#4f46e5' }} />
              <div title={`Low: ${d.low}`} style={{ height: hL, background: '#059669', borderRadius: '0 0 2px 2px' }} />
            </div>
            <span className="text-[9px] text-white/40 text-center">{d.origin}</span>
          </div>
        )
      })}
      {/* Legend */}
      <div className="flex flex-col gap-1 ml-1 justify-end pb-5 text-[9px] text-white/50 shrink-0">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#ef4444' }} />High</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#4f46e5' }} />Normal</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#059669' }} />Low</div>
      </div>
    </div>
  )
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg p-4 ${className}`}
      style={{ background: '#0f1230', border: '1px solid rgba(99,102,241,0.15)' }}>
      {title && <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-3">{title}</p>}
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CRMDashboardPage() {
  const [data, setData] = useState<CRMData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/crm')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <>
        <TopBar title="CRM Dashboard" />
        <main className="flex-1 flex items-center justify-center" style={{ background: '#0d0e24', minHeight: '100dvh' }}>
          <div className="text-white/30 text-sm">Loading CRM data…</div>
        </main>
      </>
    )
  }

  const maxCandidates = Math.max(...data.candidatesPipeline.map((c) => c.count))

  return (
    <>
      <TopBar title="CRM Dashboard" />
      <main className="flex-1 overflow-auto" style={{ background: '#0d0e24', minHeight: '100dvh' }}>

        {/* Header strip */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#0f1230', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <div>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">NovaPOS</p>
            <h1 className="text-xl font-bold text-white">CRM Combined Dashboard</h1>
          </div>
        </div>

        {/* 3-column grid */}
        <div className="p-5 grid gap-4" style={{ gridTemplateColumns: '260px 1fr 260px', alignItems: 'start' }}>

          {/* ══════════════════ LEFT COLUMN ══════════════════ */}
          <div className="flex flex-col gap-4">

            {/* Leads by Source */}
            <Card title="Leads by Source">
              <div className="flex items-center gap-4">
                <DonutChart data={data.leadsBySource} />
                <div className="flex flex-col gap-1.5">
                  {data.leadsBySource.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                      <span className="text-[10px] text-white/60 leading-none">{s.name}</span>
                      <span className="text-[10px] text-white/40 ml-auto pl-2 tabular-nums">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Tab row */}
              <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
                {['All', 'Website', 'LinkedIn', 'Other'].map((t, i) => (
                  <button key={t}
                    className="text-[9px] px-2 py-0.5 rounded transition-colors"
                    style={i === 0
                      ? { background: 'rgba(79,70,229,0.3)', color: '#a5b4fc' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(165,180,252,0.5)' }}>
                    {t}
                  </button>
                ))}
              </div>
            </Card>

            {/* Sales Pipeline */}
            <Card title="Sales Pipeline">
              <SalesFunnel stages={data.salesPipeline} />
            </Card>

          </div>

          {/* ══════════════════ CENTER COLUMN ══════════════════ */}
          <div className="flex flex-col gap-4">

            {/* My Open Opportunities table */}
            <Card title="My Open Opportunities by Relationship">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                      {[
                        'Topic', 'Est. Rev.', 'Rel. Health (KPI)', 'Rel. Health',
                        'Account', 'Time Spent', 'Time Engaged',
                      ].map((h) => (
                        <th key={h} className="pb-2 pr-3 text-left font-medium text-white/40 text-[9px] uppercase tracking-wide whitespace-nowrap">
                          <span className="flex items-center gap-0.5">
                            {h} <ArrowUpDown className="w-2 h-2 opacity-50 shrink-0" />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.opportunities.map((op, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors"
                        style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                        <td className="py-2 pr-3 text-indigo-300 max-w-[130px] truncate">{op.topic}</td>
                        <td className="py-2 pr-3 text-white/70 tabular-nums whitespace-nowrap">{fmtCurrency(op.estRev)}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          <HealthDot kpi={op.healthKpi} />
                          <span className="text-white/60">{op.healthKpi}</span>
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          <TrendIcon trend={op.trend} />
                          <span className="text-white/40 text-[9px] ml-1">{op.trend}</span>
                        </td>
                        <td className="py-2 pr-3 text-white/60 whitespace-nowrap">{op.account}</td>
                        <td className="py-2 pr-3 text-white/40 whitespace-nowrap">{op.timeSpent}</td>
                        <td className="py-2 pr-3 text-white/40 whitespace-nowrap">{op.timeEngaged}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* KPI row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Average Deal Size', value: fmtCurrency(data.kpis.avgDealSize), sub: 'this year' },
                { label: 'Working Capital', value: fmtCurrency(data.kpis.workingCapital), sub: '' },
                { label: 'Cost of Goods Sold', value: fmtCurrency(data.kpis.cogs), sub: '' },
              ].map((k) => (
                <div key={k.label} className="rounded-lg p-3"
                  style={{ background: '#0f1230', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div className="text-xl font-bold text-white">{k.value}</div>
                  {k.sub && <div className="text-[9px] text-indigo-400 mt-0.5">{k.sub}</div>}
                  <div className="text-[9px] text-white/40 mt-1 leading-tight">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Gauges row */}
            <div className="rounded-lg p-4 grid grid-cols-4 gap-2"
              style={{ background: '#0f1230', border: '1px solid rgba(99,102,241,0.15)' }}>
              <ArcGauge
                value={data.gauges.newBusinessToday.value}
                max={data.gauges.newBusinessToday.max}
                label="New business today"
                subLabel="0–400K"
              />
              <ArcGauge
                value={data.gauges.chatsToday.value}
                max={data.gauges.chatsToday.max}
                label="Chats today"
                subLabel="0–7500"
              />
              {/* CSAT special */}
              <div className="flex flex-col items-center gap-1">
                <svg width="100" height="80" viewBox="0 0 100 80">
                  {(() => {
                    const r2 = 38, cx2 = 50, cy2 = 54, sw2 = 8
                    const startA = -210; const sweepA = 240
                    const pctCsat = Math.min(1, data.gauges.csatToday.value / 5)
                    const toR = (d: number) => (d * Math.PI) / 180
                    const arcP = (s: number, e: number) => {
                      const sx = cx2 + r2 * Math.cos(toR(s)), sy = cy2 + r2 * Math.sin(toR(s))
                      const ex = cx2 + r2 * Math.cos(toR(e)), ey = cy2 + r2 * Math.sin(toR(e))
                      return `M ${sx} ${sy} A ${r2} ${r2} 0 ${Math.abs(e - s) > 180 ? 1 : 0} 1 ${ex} ${ey}`
                    }
                    return (
                      <>
                        <path d={arcP(startA, startA + sweepA)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw2} strokeLinecap="round" />
                        <path d={arcP(startA, startA + pctCsat * sweepA)} fill="none" stroke="#ef4444" strokeWidth={sw2} strokeLinecap="round" />
                        <text x={cx2} y={cy2 - 6} textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold">{data.gauges.csatToday.value}</text>
                      </>
                    )
                  })()}
                </svg>
                <span className="text-[10px] text-white/60 text-center">CSAT today</span>
                <span className="text-[9px] text-red-400 text-center">
                  Goal: {data.gauges.csatToday.goal} · {data.gauges.csatToday.delta}%
                </span>
              </div>
              <ArcGauge
                value={data.gauges.escalationsToday.value}
                max={data.gauges.escalationsToday.max}
                label="Escalations today"
                subLabel={`0–${data.gauges.escalationsToday.max}`}
                danger={data.gauges.escalationsToday.value > data.gauges.escalationsToday.max * 0.5}
              />
            </div>

            {/* Candidates Pipeline */}
            <Card title="Candidates Pipeline">
              <HorizBarChart
                data={data.candidatesPipeline.map((c) => ({
                  label: c.stage,
                  value: c.count,
                  color: c.color,
                }))}
                maxVal={maxCandidates}
              />
            </Card>

          </div>

          {/* ══════════════════ RIGHT COLUMN ══════════════════ */}
          <div className="flex flex-col gap-4">

            {/* Open Leads */}
            <Card title="Open Leads">
              <div className="flex flex-col gap-3">
                {data.openLeads.map((lead) => (
                  <div key={lead.name} className="flex items-start gap-2.5 p-2.5 rounded-lg"
                    style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: lead.color }}>
                      {lead.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-white">{lead.name}</div>
                      <div className="text-[9px] text-indigo-400 mb-0.5">{lead.source}</div>
                      <div className="text-[10px] text-white/50 truncate">{lead.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* My Work Items */}
            <Card title="My Work Items">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-white/30">Modified On</span>
                <ArrowUpDown className="w-2.5 h-2.5 text-white/30" />
              </div>
              <div className="flex flex-col gap-2">
                {data.workItems.map((item) => (
                  <div key={item.title} className="p-2.5 rounded-lg"
                    style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: item.color }}>
                        {item.initials}
                      </div>
                      <span className="text-[11px] font-semibold text-white leading-tight truncate">{item.title}</span>
                    </div>
                    <div className="flex gap-2 text-[9px] text-white/40 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>{item.category}</span>
                      <span className="text-yellow-400">{item.timeLeft}</span>
                      <span className="text-emerald-400">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customer Cases by Origin */}
            <Card title="Customer Cases by Origin">
              <StackedBarChart data={data.casesByOrigin} />
            </Card>

          </div>
        </div>
      </main>
    </>
  )
}
