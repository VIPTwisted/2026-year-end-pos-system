'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const BG = '#0d0e24'
const CARD_BG = '#16213e'
const BORDER = 'rgba(99,102,241,0.15)'
const ACCENT = 'rgba(99,102,241,0.3)'
const TEXT = '#e2e8f0'
const MUTED = '#94a3b8'
const CARD = { background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px' }

type Tile = { label: string; count: number; badge: string | null }
type DirectReport = { initials: string; color: string; name: string; title: string; status: string }
type PendingAction = { icon: string; desc: string; priority: string }
type CalEvent = { day: number; type: string; label: string }
type UpcomingEvent = { date: string; event: string; type: string }
type Metrics = { turnoverRate: number; timeToHire: number; timeToHireTrend: number[]; trainingCompletion: number; diversity: { gender: { male: number; female: number }; age: { young: number; mid: number; senior: number }; dept: { ops: number; sales: number; it: number; other: number } } }
type Data = { workspaceTiles: Tile[]; directReports: DirectReport[]; pendingActions: PendingAction[]; calendarEvents: CalEvent[]; upcomingEvents: UpcomingEvent[]; metrics: Metrics }

const EVENT_DOT: Record<string, string> = { hire: '#16a34a', training: '#2563eb', review: '#d97706' }
const PRIORITY_COLOR: Record<string, string> = { High: '#dc2626', Medium: '#d97706', Low: '#94a3b8' }

function TurnoverGauge({ value }: { value: number }) {
  const R = 54; const cx = 70; const cy = 70
  const pct = Math.min(value / 20, 1)
  const startAngle = -200; const sweepAngle = 220
  const toRad = (d: number) => (d * Math.PI) / 180
  const arcPath = (r: number, start: number, sweep: number) => {
    const s = toRad(start); const e = toRad(start + sweep)
    const laf = sweep > 180 ? 1 : 0
    return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${laf} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)}`
  }
  const fillAngle = startAngle + sweepAngle * pct
  const needleAngle = toRad(fillAngle)
  const color = value < 10 ? '#16a34a' : value < 15 ? '#d97706' : '#dc2626'
  return (
    <svg width={140} height={100} viewBox="0 0 140 100">
      <path d={arcPath(R, startAngle, sweepAngle)} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth={10} strokeLinecap="round" />
      <path d={arcPath(R, startAngle, sweepAngle * pct)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
      {/* Target line at 10% */}
      {(() => {
        const tAngle = toRad(startAngle + sweepAngle * (10 / 20))
        const x1 = cx + (R - 7) * Math.cos(tAngle); const y1 = cy + (R - 7) * Math.sin(tAngle)
        const x2 = cx + (R + 7) * Math.cos(tAngle); const y2 = cy + (R + 7) * Math.sin(tAngle)
        return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d97706" strokeWidth={2} />
      })()}
      <line x1={cx} y1={cy} x2={cx + (R - 10) * Math.cos(needleAngle)} y2={cy + (R - 10) * Math.sin(needleAngle)} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill={color} />
      <text x={cx} y={cy + 20} textAnchor="middle" fill={color} fontSize={17} fontWeight={700}>{value}%</text>
      <text x={cx} y={cy + 32} textAnchor="middle" fill={MUTED} fontSize={8}>target &lt;10%</text>
    </svg>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const W = 160; const H = 30
  const min = Math.min(...values); const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * H * 0.8 - H * 0.1}`).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={1.5} />
    </svg>
  )
}

function DonutChart({ pct }: { pct: number }) {
  const R = 36; const cx = 50; const cy = 50; const stroke = 10
  const circ = 2 * Math.PI * R
  const filled = (pct / 100) * circ
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(20,184,166,0.8)" strokeWidth={stroke} strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill={TEXT} fontSize={15} fontWeight={700}>{pct}%</text>
    </svg>
  )
}

function DiversityBars({ metrics }: { metrics: Metrics }) {
  const bars: { label: string; a: { label: string; pct: number; color: string }[]; }[] = [
    { label: 'Gender', a: [{ label: 'Male', pct: metrics.diversity.gender.male, color: '#6366f1' }, { label: 'Female', pct: metrics.diversity.gender.female, color: '#ec4899' }] },
    { label: 'Age 18-30', a: [{ label: '18-30', pct: metrics.diversity.age.young, color: '#06b6d4' }, { label: '31-45', pct: metrics.diversity.age.mid, color: '#6366f1' }] },
    { label: 'Age 46+', a: [{ label: '46+', pct: metrics.diversity.age.senior, color: '#8b5cf6' }, { label: '(other)', pct: 0, color: 'transparent' }] },
    { label: 'Dept Split', a: [{ label: 'Ops', pct: metrics.diversity.dept.ops, color: '#14b8a6' }, { label: 'Other', pct: metrics.diversity.dept.other, color: '#6366f1' }] },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
      {bars.map(b => (
        <div key={b.label}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>{b.label}</div>
          {b.a.filter(x => x.pct > 0).map(x => (
            <div key={x.label} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: MUTED }}>{x.label}</span>
                <span style={{ fontSize: 10, color: TEXT }}>{x.pct}%</span>
              </div>
              <div style={{ height: 5, background: 'rgba(99,102,241,0.12)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${x.pct}%`, background: x.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function MiniCalendar({ events }: { events: CalEvent[] }) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const eventMap: Record<number, string[]> = {}
  events.forEach(e => { if (!eventMap[e.day]) eventMap[e.day] = []; eventMap[e.day].push(e.type) })
  const firstDow = new Date(2026, 3, 1).getDay() // April 2026 starts Tuesday=2
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: 9, color: MUTED, padding: '2px 0' }}>{d}</div>)}
        {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
        {days.map(d => (
          <div key={d} style={{ textAlign: 'center', padding: '3px 0', position: 'relative' }}>
            <span style={{ fontSize: 10, color: eventMap[d] ? TEXT : MUTED }}>{d}</span>
            {eventMap[d] && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 1 }}>
                {eventMap[d].slice(0, 2).map((t, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: EVENT_DOT[t] ?? '#6366f1' }} />)}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        {[['hire', 'Hire'], ['training', 'Training/Interview'], ['review', 'Review']].map(([t, l]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: EVENT_DOT[t] }} />
            <span style={{ fontSize: 9, color: MUTED }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HRWorkspacePage() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch('/api/hr/workspace').then(r => r.json()).then(setData)
  }, [])

  if (!data) return (
    <div style={{ minHeight: '100dvh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: MUTED, fontSize: 14 }}>Loading HR Workspace...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: BG, color: TEXT, fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <TopBar
        title="HR Workspace"
        breadcrumb={[{ label: 'Human Resources', href: '/hr' }, { label: 'Workspace', href: '/hr/workspace' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100dvh - 72px)' }}>

        {/* Left workspace tiles */}
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: '20px 0' }}>
          {data.workspaceTiles.map(tile => (
            <div key={tile.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: 12.5, color: TEXT }}>{tile.label}</span>
              <span style={{
                background: tile.badge === 'amber' ? '#d9770622' : 'rgba(99,102,241,0.15)',
                color: tile.badge === 'amber' ? '#d97706' : MUTED,
                border: `1px solid ${tile.badge === 'amber' ? '#d9770644' : BORDER}`,
                borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 600
              }}>{tile.count}</span>
            </div>
          ))}
        </div>

        {/* Main 3-col */}
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '35% 35% 30%', gap: 18, alignItems: 'start' }}>

          {/* Col 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Direct Reports */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 12 }}>My Direct Reports</div>
              {data.directReports.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < data.directReports.length - 1 ? `1px solid rgba(99,102,241,0.08)` : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{r.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: TEXT, fontWeight: 500 }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>{r.title}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: r.status === 'Active' ? '#16a34a22' : '#d9770622', color: r.status === 'Active' ? '#16a34a' : '#d97706', border: `1px solid ${r.status === 'Active' ? '#16a34a44' : '#d9770644'}` }}>{r.status}</span>
                    <span style={{ fontSize: 10, color: '#6366f1', cursor: 'pointer' }}>View Profile</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Actions */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Pending Actions</div>
              {data.pendingActions.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < data.pendingActions.length - 1 ? `1px solid rgba(99,102,241,0.08)` : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round">
                      {a.icon === 'clock' && <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
                      {a.icon === 'file' && <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>}
                      {a.icon === 'shield' && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>}
                      {a.icon === 'award' && <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>}
                      {a.icon === 'user' && <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                    </svg>
                  </div>
                  <div style={{ flex: 1, fontSize: 11.5, color: TEXT, lineHeight: 1.4 }}>{a.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: PRIORITY_COLOR[a.priority] + '22', color: PRIORITY_COLOR[a.priority], border: `1px solid ${PRIORITY_COLOR[a.priority]}44` }}>{a.priority}</span>
                    <button style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: `1px solid ${BORDER}`, cursor: 'pointer' }}>Act</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Calendar */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 12 }}>HR Calendar — April 2026</div>
              <MiniCalendar events={data.calendarEvents} />
            </div>

            {/* Upcoming Events */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Upcoming Events</div>
              {data.upcomingEvents.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < data.upcomingEvents.length - 1 ? `1px solid rgba(99,102,241,0.08)` : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: EVENT_DOT[e.type] ?? '#6366f1', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11.5, color: TEXT }}>{e.event}</div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{e.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Turnover Gauge */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Turnover Rate</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <TurnoverGauge value={data.metrics.turnoverRate} />
              </div>
            </div>

            {/* Time to Hire */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Time-to-Hire</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>{data.metrics.timeToHire} <span style={{ fontSize: 13, color: MUTED, fontWeight: 400 }}>days avg</span></div>
              <Sparkline values={data.metrics.timeToHireTrend} />
            </div>

            {/* Training Completion */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Training Completion</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <DonutChart pct={data.metrics.trainingCompletion} />
                <div>
                  <div style={{ fontSize: 11, color: MUTED }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'rgba(20,184,166,0.8)', marginRight: 5 }} />Completed: {data.metrics.trainingCompletion}%</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', marginRight: 5 }} />Pending: {100 - data.metrics.trainingCompletion}%</div>
                </div>
              </div>
            </div>

            {/* Diversity */}
            <div style={CARD}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Diversity Metrics</div>
              <DiversityBars metrics={data.metrics} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
