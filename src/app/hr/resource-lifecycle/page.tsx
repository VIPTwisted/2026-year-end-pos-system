'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const CARD = { background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', padding: '20px' }
const MUTED = '#94a3b8'
const TEXT = '#e2e8f0'

type KPIs = { totalEmployees: number; newHires30d: number; transfersPending: number; terminations30d: number; openPositions: number }
type DeptBar = { dept: string; count: number }
type MonthTrend = { month: string; hires: number; terminations: number }
type LifecycleEvent = { type: string; name: string; event: string; date: string; status: string }
type OnboardEntry = { name: string; startDate: string; completion: number }
type Data = { kpis: KPIs; headcountByDept: DeptBar[]; hireTrend: MonthTrend[]; lifecycleEvents: LifecycleEvent[]; onboardingPipeline: OnboardEntry[] }

const EVENT_COLORS: Record<string, string> = { Hire: '#16a34a', Transfer: '#2563eb', Promote: '#6366f1', Leave: '#d97706', Terminate: '#dc2626' }
const STATUS_COLORS: Record<string, string> = { Active: '#16a34a', 'On Leave': '#d97706', Processed: '#94a3b8', Completed: '#6366f1' }

function typeBadge(type: string) {
  const bg = EVENT_COLORS[type] ?? '#6366f1'
  return (
    <span style={{ background: bg + '22', color: bg, border: `1px solid ${bg}44`, borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 600, minWidth: 68, display: 'inline-block', textAlign: 'center' }}>
      {type}
    </span>
  )
}
function statusChip(status: string) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS['Active']
  const ef = status.startsWith('Effective')
  const c = ef ? '#2563eb' : color
  return (
    <span style={{ background: c + '22', color: c, border: `1px solid ${c}44`, borderRadius: 4, padding: '2px 7px', fontSize: 11 }}>
      {status}
    </span>
  )
}

function HeadcountChart({ data }: { data: DeptBar[] }) {
  const max = Math.max(...data.map(d => d.count))
  const W = 340
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${data.length * 32 + 10}`} style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const barW = (d.count / max) * (W - 140)
        const y = i * 32 + 6
        return (
          <g key={d.dept}>
            <text x={95} y={y + 13} textAnchor="end" fill={MUTED} fontSize={12}>{d.dept}</text>
            <rect x={100} y={y} width={barW} height={20} rx={3} fill="rgba(20,184,166,0.7)" />
            <text x={100 + barW + 6} y={y + 13} fill={TEXT} fontSize={12}>{d.count}</text>
          </g>
        )
      })}
    </svg>
  )
}

function TrendChart({ data }: { data: MonthTrend[] }) {
  const W = 560; const H = 140; const PAD = { t: 16, b: 28, l: 30, r: 10 }
  const gW = W - PAD.l - PAD.r; const gH = H - PAD.t - PAD.b
  const maxY = 20; const barW = gW / data.length
  const xs = data.map((_, i) => PAD.l + i * barW + barW / 2)

  // cumulative net line (relative to Jan start)
  let cum = 0
  const nets: number[] = data.map(d => { cum += d.hires - d.terminations; return cum })
  const minNet = Math.min(...nets); const maxNet = Math.max(...nets)
  const netRange = maxNet - minNet || 1
  const lineY = (v: number) => PAD.t + gH - ((v - minNet) / netRange) * gH * 0.6 - gH * 0.2

  const pts = nets.map((v, i) => `${xs[i]},${lineY(v)}`).join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {/* Y gridlines */}
      {[0, 5, 10, 15, 20].map(v => {
        const y = PAD.t + gH - (v / maxY) * gH
        return <g key={v}>
          <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(99,102,241,0.1)" />
          <text x={PAD.l - 4} y={y + 4} fill={MUTED} fontSize={9} textAnchor="end">{v}</text>
        </g>
      })}
      {data.map((d, i) => {
        const bw = barW * 0.36
        const hH = (d.hires / maxY) * gH
        const tH = (d.terminations / maxY) * gH
        const bx = PAD.l + i * barW
        return (
          <g key={d.month}>
            <rect x={bx + barW * 0.06} y={PAD.t + gH - hH} width={bw} height={hH} rx={2} fill="rgba(34,197,94,0.7)" />
            <rect x={bx + barW * 0.06 + bw + 2} y={PAD.t + gH - tH} width={bw} height={tH} rx={2} fill="rgba(239,68,68,0.7)" />
            <text x={bx + barW / 2} y={H - 6} fill={MUTED} fontSize={9} textAnchor="middle">{d.month}</text>
          </g>
        )
      })}
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2" />
      {nets.map((v, i) => <circle key={i} cx={xs[i]} cy={lineY(v)} r={3} fill="#6366f1" />)}
      {/* Legend */}
      <rect x={PAD.l} y={H - 14} width={10} height={8} rx={1} fill="rgba(34,197,94,0.7)" />
      <text x={PAD.l + 13} y={H - 7} fill={MUTED} fontSize={9}>Hires</text>
      <rect x={PAD.l + 48} y={H - 14} width={10} height={8} rx={1} fill="rgba(239,68,68,0.7)" />
      <text x={PAD.l + 61} y={H - 7} fill={MUTED} fontSize={9}>Terminations</text>
      <line x1={PAD.l + 130} y1={H - 10} x2={PAD.l + 150} y2={H - 10} stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2" />
      <circle cx={PAD.l + 140} cy={H - 10} r={3} fill="#6366f1" />
      <text x={PAD.l + 153} y={H - 7} fill={MUTED} fontSize={9}>Net Change</text>
    </svg>
  )
}

export default function ResourceLifecyclePage() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch('/api/hr/resource-lifecycle').then(r => r.json()).then(setData)
  }, [])

  if (!data) return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: MUTED, fontSize: 14 }}>Loading Resource Lifecycle...</div>
    </div>
  )

  const { kpis, headcountByDept, hireTrend, lifecycleEvents, onboardingPipeline } = data

  const kpiTiles = [
    { label: 'Total Employees', value: kpis.totalEmployees, color: TEXT },
    { label: 'New Hires (30d)', value: kpis.newHires30d, color: '#16a34a' },
    { label: 'Transfers Pending', value: kpis.transfersPending, color: '#d97706' },
    { label: 'Terminations (30d)', value: kpis.terminations30d, color: '#dc2626' },
    { label: 'Open Positions', value: kpis.openPositions, color: '#2563eb' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: TEXT, fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <TopBar
        title="Resource Lifecycle"
        breadcrumb={[{ label: 'Human Resources', href: '/hr' }, { label: 'Resource Lifecycle', href: '/hr/resource-lifecycle' }]}
      />

      <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>

        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
          {kpiTiles.map(t => (
            <div key={t.label} style={{ ...CARD, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: t.color, lineHeight: 1 }}>{t.value}</div>
            </div>
          ))}
        </div>

        {/* Main 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 20 }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Headcount Bar Chart */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 16 }}>Headcount by Department</div>
              <HeadcountChart data={headcountByDept} />
            </div>

            {/* Hire/Term Trend */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 16 }}>Hire / Termination Trend — 12 Months</div>
              <TrendChart data={hireTrend} />
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Lifecycle Events */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 14 }}>Lifecycle Events — This Month</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lifecycleEvents.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < lifecycleEvents.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}>
                    <div style={{ minWidth: 68 }}>{typeBadge(ev.type)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: TEXT, fontWeight: 500 }}>{ev.name || <span style={{ color: MUTED, fontStyle: 'italic' }}>Confidential</span>}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{ev.event}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 60 }}>
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 3 }}>{ev.date}</div>
                      {statusChip(ev.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Onboarding Pipeline */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Onboarding Pipeline</div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>{onboardingPipeline.length} new hires in onboarding</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {onboardingPipeline.map((e, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: TEXT }}>{e.name}</span>
                      <span style={{ fontSize: 11, color: MUTED }}>{e.startDate} · <span style={{ color: e.completion === 100 ? '#16a34a' : TEXT, fontWeight: 600 }}>{e.completion}%</span></span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(99,102,241,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${e.completion}%`, background: e.completion === 100 ? '#16a34a' : '#6366f1', borderRadius: 3, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
