'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:     '#0d0e24',
  card:   '#16213e',
  border: 'rgba(99,102,241,0.15)',
  text:   '#e2e8f0',
  muted:  '#94a3b8',
  indigo: '#6366f1',
}

// ── Static data ────────────────────────────────────────────────────────────
type Method = 'Straight-line' | 'Milestone' | 'Upon Completion' | 'Upon Delivery'
type SchedStatus = 'Active' | 'Completed' | 'Pending'

const METHOD_STYLE: Record<Method, { bg: string; color: string }> = {
  'Straight-line':   { bg:'rgba(99,102,241,0.15)',  color:'#a5b4fc' },
  'Milestone':       { bg:'rgba(251,191,36,0.12)',  color:'#fbbf24' },
  'Upon Completion': { bg:'rgba(6,182,212,0.12)',   color:'#22d3ee' },
  'Upon Delivery':   { bg:'rgba(52,211,153,0.12)',  color:'#34d399' },
}
const STATUS_STYLE: Record<SchedStatus, { bg: string; color: string }> = {
  Active:    { bg:'rgba(52,211,153,0.12)',  color:'#34d399' },
  Completed: { bg:'rgba(6,182,212,0.12)',   color:'#22d3ee' },
  Pending:   { bg:'rgba(148,163,184,0.12)', color:'#94a3b8' },
}

const SCHEDULES = [
  { no:'REV-2026-001', customer:'Fabrikam Inc',    contract:'ERP-2026-001',   total:'$125,000', recognized:'$62,500',  deferred:'$62,500', method:'Straight-line'   as Method, start:'Jan 2026', end:'Dec 2026', status:'Active'    as SchedStatus },
  { no:'REV-2026-002', customer:'Contoso Corp',    contract:'CLOUD-2026-01',  total:'$80,000',  recognized:'$26,667',  deferred:'$53,333', method:'Straight-line'   as Method, start:'Feb 2026', end:'Jan 2027', status:'Active'    as SchedStatus },
  { no:'REV-2026-003', customer:'Adatum Corp',     contract:'MAINT-2026-01',  total:'$18,500',  recognized:'$18,500',  deferred:'$0',      method:'Upon Completion' as Method, start:'Apr 2026', end:'Apr 2026', status:'Completed' as SchedStatus },
  { no:'REV-2026-004', customer:'Northwind',       contract:'SVC-2026-04',    total:'$45,000',  recognized:'$15,000',  deferred:'$30,000', method:'Milestone'       as Method, start:'Jan 2026', end:'Jun 2026', status:'Active'    as SchedStatus },
  { no:'REV-2026-005', customer:'Alpine Ski House', contract:'LIC-2026-05',   total:'$200,000', recognized:'$66,667',  deferred:'$133,333',method:'Straight-line'   as Method, start:'Jan 2026', end:'Dec 2026', status:'Active'    as SchedStatus },
  { no:'REV-2026-006', customer:'Litware Inc',     contract:'IMPL-2026-06',   total:'$55,000',  recognized:'$27,500',  deferred:'$27,500', method:'Milestone'       as Method, start:'Mar 2026', end:'Sep 2026', status:'Active'    as SchedStatus },
  { no:'REV-2026-007', customer:'Coho Winery',     contract:'TRAIN-2026-07',  total:'$12,000',  recognized:'$12,000',  deferred:'$0',      method:'Upon Completion' as Method, start:'Mar 2026', end:'Mar 2026', status:'Completed' as SchedStatus },
  { no:'REV-2026-008', customer:'Tailspin Toys',   contract:'SUPPORT-2026-08',total:'$36,000',  recognized:'$12,000',  deferred:'$24,000', method:'Straight-line'   as Method, start:'Jan 2026', end:'Dec 2026', status:'Active'    as SchedStatus },
  { no:'REV-2026-009', customer:'Wide World',      contract:'INT-2026-09',    total:'$90,000',  recognized:'$30,000',  deferred:'$60,000', method:'Milestone'       as Method, start:'Feb 2026', end:'Jul 2026', status:'Active'    as SchedStatus },
  { no:'REV-2026-010', customer:'Proseware Inc',   contract:'CLOUD-2026-10',  total:'$150,000', recognized:'$50,000',  deferred:'$100,000',method:'Straight-line'   as Method, start:'Jan 2026', end:'Dec 2026', status:'Active'    as SchedStatus },
  { no:'REV-2026-011', customer:'Graphic Design',  contract:'PROJ-2026-11',   total:'$22,000',  recognized:'$22,000',  deferred:'$0',      method:'Upon Delivery'   as Method, start:'Apr 2026', end:'Apr 2026', status:'Completed' as SchedStatus },
  { no:'REV-2026-012', customer:'City Power',      contract:'MAINT-2026-12',  total:'$48,000',  recognized:'$16,000',  deferred:'$32,000', method:'Straight-line'   as Method, start:'Jan 2026', end:'Dec 2026', status:'Active'    as SchedStatus },
]

const JOURNAL_RUNS = [
  { date:'Apr 22, 2026', amount:'$47,083', entries: 8  },
  { date:'Mar 31, 2026', amount:'$52,417', entries: 10 },
  { date:'Feb 28, 2026', amount:'$49,250', entries: 9  },
  { date:'Jan 31, 2026', amount:'$53,667', entries: 11 },
  { date:'Dec 31, 2025', amount:'$81,583', entries: 14 },
]

const MILESTONES = [
  { date:'Apr 25, 2026', contract:'IMPL-2026-06',  milestone:'Phase 2 Delivery',     amount:'$13,750' },
  { date:'Apr 28, 2026', contract:'INT-2026-09',   milestone:'Integration Go-Live',  amount:'$30,000' },
  { date:'Apr 30, 2026', contract:'SVC-2026-04',   milestone:'Final Acceptance',     amount:'$15,000' },
  { date:'May 3, 2026',  contract:'IMPL-2026-06',  milestone:'User Training Complete',amount:'$6,875' },
  { date:'May 10, 2026', contract:'INT-2026-09',   milestone:'Post-Go-Live Support', amount:'$15,000' },
]

// Waterfall data: monthly planned recognition Jan–Dec 2026
const WATERFALL = [
  { month:'Jan', amount:53667, current:false },
  { month:'Feb', amount:49250, current:false },
  { month:'Mar', amount:52417, current:false },
  { month:'Apr', amount:47083, current:true  },
  { month:'May', amount:55000, current:false },
  { month:'Jun', amount:58200, current:false },
  { month:'Jul', amount:42100, current:false },
  { month:'Aug', amount:38400, current:false },
  { month:'Sep', amount:35200, current:false },
  { month:'Oct', amount:29800, current:false },
  { month:'Nov', amount:25600, current:false },
  { month:'Dec', amount:22000, current:false },
]
const MAX_BAR = Math.max(...WATERFALL.map(d => d.amount))

// ── Component ──────────────────────────────────────────────────────────────
export default function RevenueRecognitionPage() {
  const [, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/finance/revenue-recognition').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <TopBar
        title="Revenue Recognition"
        breadcrumb={[
          { label:'Finance', href:'/finance' },
          { label:'Revenue Recognition', href:'/finance/revenue-recognition' },
        ]}
        actions={
          <>
            <button style={btnPrimary}>Create Schedule</button>
            <button style={btnSecondary}>Post Deferrals</button>
            <button style={btnSecondary}>Run Recognition</button>
          </>
        }
      />

      <div style={{ padding:'24px 28px' }}>
        {/* KPI Strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          <KpiCard label="Deferred Revenue"       value="$2.4M"    color="#6366f1" />
          <KpiCard label="Recognized This Month"  value="$284,000" color="#34d399" />
          <KpiCard label="Schedules Active"        value="47"       color="#e2e8f0" />
          <KpiCard label="Next Recognition Run"   value="Apr 30"   color="#94a3b8" />
        </div>

        {/* 2-column layout */}
        <div style={{ display:'grid', gridTemplateColumns:'60% 40%', gap:20 }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Revenue Schedules */}
            <div style={card}>
              <SectionTitle label="Revenue Schedules" color={C.indigo} />
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                  <thead>
                    <tr>
                      {['Schedule #','Customer','Contract','Total','Recognized','Deferred','Method','Start','End','Status'].map(h =>
                        <th key={h} style={{ ...th, textAlign: ['Total','Recognized','Deferred'].includes(h) ? 'right' : 'left' }}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {SCHEDULES.map((s, i) => {
                      const ms = METHOD_STYLE[s.method]
                      const ss = STATUS_STYLE[s.status]
                      return (
                        <tr key={s.no} style={{ background: i%2===0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                          <td style={{ ...td, color:C.indigo, fontWeight:600 }}>{s.no}</td>
                          <td style={td}>{s.customer}</td>
                          <td style={{ ...td, color:C.muted }}>{s.contract}</td>
                          <td style={{ ...td, textAlign:'right', fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{s.total}</td>
                          <td style={{ ...td, textAlign:'right', color:'#34d399', fontVariantNumeric:'tabular-nums' }}>{s.recognized}</td>
                          <td style={{ ...td, textAlign:'right', color:'#f59e0b', fontVariantNumeric:'tabular-nums' }}>{s.deferred}</td>
                          <td style={td}>
                            <span style={{ background:ms.bg, color:ms.color, borderRadius:4, padding:'2px 7px', fontSize:10, fontWeight:600, whiteSpace:'nowrap' }}>{s.method}</span>
                          </td>
                          <td style={{ ...td, color:C.muted }}>{s.start}</td>
                          <td style={{ ...td, color:C.muted }}>{s.end}</td>
                          <td style={td}>
                            <span style={{ background:ss.bg, color:ss.color, borderRadius:4, padding:'2px 7px', fontSize:10, fontWeight:600 }}>{s.status}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recognition Journal FastTab */}
            <details style={card}>
              <summary style={summaryStyle}>Recognition Journal</summary>
              <div style={{ padding:'12px 0 4px' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>
                      {['Run Date','Amount Recognized','Journal Entries'].map(h =>
                        <th key={h} style={{ ...th, textAlign: h==='Amount Recognized' ? 'right' : 'left' }}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {JOURNAL_RUNS.map((r, i) => (
                      <tr key={r.date} style={{ background: i%2===0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                        <td style={td}>{r.date}</td>
                        <td style={{ ...td, textAlign:'right', fontWeight:600, color:'#34d399', fontVariantNumeric:'tabular-nums' }}>{r.amount}</td>
                        <td style={{ ...td, color:C.muted }}>{r.entries} entries</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>

          {/* RIGHT */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Deferred Revenue Waterfall SVG */}
            <div style={card}>
              <SectionTitle label="Deferred Revenue Waterfall 2026" color="#a5b4fc" />
              <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>Planned monthly recognition ($K)</div>
              <svg viewBox="0 0 320 140" style={{ width:'100%', height:'auto' }}>
                {/* Y axis labels */}
                {[0,100,200,300,400].map(v => (
                  <g key={v}>
                    <text x={28} y={130 - (v/400)*110 + 4} style={{ fontSize:8, fill:'#475569', textAnchor:'end' }}>${v}K</text>
                    <line x1={32} y1={130 - (v/400)*110} x2={318} y2={130 - (v/400)*110} stroke="rgba(99,102,241,0.08)" strokeWidth={0.5} />
                  </g>
                ))}
                {/* Bars */}
                {WATERFALL.map((d, i) => {
                  const barH   = (d.amount / 400000) * 110
                  const x      = 35 + i * 24
                  const y      = 130 - barH
                  const fill   = d.current ? '#6366f1' : 'rgba(99,102,241,0.35)'
                  return (
                    <g key={d.month}>
                      <rect x={x} y={y} width={18} height={barH} fill={fill} rx={2} />
                      <text x={x+9} y={138} style={{ fontSize:7, fill:'#94a3b8', textAnchor:'middle' }}>{d.month}</text>
                    </g>
                  )
                })}
                {/* Current month marker */}
                <text x={35 + 3*24 + 9} y={118} style={{ fontSize:7, fill:'#a5b4fc', textAnchor:'middle', fontWeight:'bold' }}>▲</text>
              </svg>
            </div>

            {/* Revenue by Method donut */}
            <div style={card}>
              <SectionTitle label="Revenue by Recognition Method" color="#f59e0b" />
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <svg viewBox="0 0 100 100" style={{ width:100, height:100, flexShrink:0 }}>
                  {/* Donut segments: Straight-line 68%, Milestone 22%, Upon Delivery 10% */}
                  {/* Straight-line: 0 → 244.8deg */}
                  <circle cx={50} cy={50} r={35} fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth={20}
                    strokeDasharray={`${0.68*219.9} ${219.9}`} strokeDashoffset={0}
                    transform="rotate(-90 50 50)" />
                  {/* Milestone: 244.8 → 323.9 */}
                  <circle cx={50} cy={50} r={35} fill="none" stroke="rgba(251,191,36,0.6)" strokeWidth={20}
                    strokeDasharray={`${0.22*219.9} ${219.9}`} strokeDashoffset={`${-(0.68*219.9)}`}
                    transform="rotate(-90 50 50)" />
                  {/* Upon Delivery: 323.9 → 360 */}
                  <circle cx={50} cy={50} r={35} fill="none" stroke="rgba(52,211,153,0.6)" strokeWidth={20}
                    strokeDasharray={`${0.10*219.9} ${219.9}`} strokeDashoffset={`${-(0.90*219.9)}`}
                    transform="rotate(-90 50 50)" />
                  <circle cx={50} cy={50} r={24} fill="#16213e" />
                </svg>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { label:'Straight-line', pct:'68%', color:'#a5b4fc' },
                    { label:'Milestone',     pct:'22%', color:'#fbbf24' },
                    { label:'Upon Delivery', pct:'10%', color:'#34d399' },
                  ].map(m => (
                    <div key={m.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:10, height:10, borderRadius:2, background:m.color, flexShrink:0 }} />
                      <span style={{ fontSize:12, color:C.text }}>{m.label}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:m.color, marginLeft:'auto' }}>{m.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div style={card}>
              <SectionTitle label="Upcoming Milestones (30 days)" color="#22d3ee" />
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr>
                    {['Date','Contract','Milestone','Amount'].map(h =>
                      <th key={h} style={{ ...th, textAlign: h==='Amount' ? 'right' : 'left' }}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {MILESTONES.map((m, i) => (
                    <tr key={i} style={{ background: i%2===0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                      <td style={{ ...td, color:'#22d3ee' }}>{m.date}</td>
                      <td style={{ ...td, color:C.indigo, fontWeight:600 }}>{m.contract}</td>
                      <td style={{ ...td, color:C.muted }}>{m.milestone}</td>
                      <td style={{ ...td, textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{m.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────
function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)', borderRadius:8, padding:'16px 18px' }}>
      <div style={{ fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700, color, fontVariantNumeric:'tabular-nums' }}>{value}</div>
    </div>
  )
}
function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ width:8, height:8, borderRadius:2, background:color, display:'inline-block', flexShrink:0 }} />
      {label}
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background:'#16213e', border:'1px solid rgba(99,102,241,0.15)', borderRadius:8, padding:16,
}
const summaryStyle: React.CSSProperties = {
  cursor:'pointer', fontWeight:700, fontSize:13, color:'#e2e8f0',
  padding:'14px 0', listStyle:'none', display:'flex', alignItems:'center', gap:8,
}
const th: React.CSSProperties = {
  padding:'7px 8px', color:'#94a3b8', fontSize:10, fontWeight:600,
  textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid rgba(99,102,241,0.12)',
}
const td: React.CSSProperties = {
  padding:'8px 8px', color:'#e2e8f0', fontSize:11, borderBottom:'1px solid rgba(99,102,241,0.07)',
}
const btnPrimary: React.CSSProperties = {
  background:'#6366f1', color:'#fff', border:'none', borderRadius:6,
  padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer',
}
const btnSecondary: React.CSSProperties = {
  background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)',
  borderRadius:6, padding:'7px 14px', fontSize:13, fontWeight:500, cursor:'pointer',
}

// suppress unused var warning
void MAX_BAR
