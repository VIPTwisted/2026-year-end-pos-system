'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface GanttTask {
  id: string
  label: string
  indent: number
  startDay: number  // days from Apr 1
  endDay: number    // days from Apr 1
  status: 'Complete' | 'In Progress' | 'Not Started'
  pct: number
  isMilestone?: boolean
  isPhase?: boolean
  deps?: string[]   // task ids this depends on
}

interface Resource {
  name: string
  role: string
  tasks: number
  hoursPlanned: number
  hoursActual: number
  pctAllocated: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
// Apr 1 = day 0, Jul 15 = day 105
const TASKS: GanttTask[] = [
  { id: 't0', label: 'ERP Implementation', indent: 0, startDay: 0, endDay: 105, status: 'In Progress', pct: 32, isPhase: true },
  { id: 't1', label: 'Phase 1: Discovery', indent: 1, startDay: 0, endDay: 14, status: 'Complete', pct: 100, isPhase: true },
  { id: 't1a', label: 'Kickoff Meeting', indent: 2, startDay: 0, endDay: 0, status: 'Complete', pct: 100, isMilestone: true },
  { id: 't1b', label: 'Requirements Gathering', indent: 2, startDay: 1, endDay: 9, status: 'Complete', pct: 100 },
  { id: 't1c', label: 'Gap Analysis', indent: 2, startDay: 10, endDay: 14, status: 'Complete', pct: 100 },
  { id: 't2', label: 'Phase 2: Design', indent: 1, startDay: 15, endDay: 44, status: 'In Progress', pct: 40, isPhase: true },
  { id: 't2a', label: 'System Architecture', indent: 2, startDay: 15, endDay: 24, status: 'In Progress', pct: 70, deps: ['t1c'] },
  { id: 't2b', label: 'Data Migration Plan', indent: 2, startDay: 25, endDay: 34, status: 'Not Started', pct: 0, deps: ['t2a'] },
  { id: 't2c', label: 'Integration Design', indent: 2, startDay: 35, endDay: 44, status: 'Not Started', pct: 0, deps: ['t2a'] },
  { id: 't3', label: 'Phase 3: Build', indent: 1, startDay: 45, endDay: 90, status: 'Not Started', pct: 0, isPhase: true },
  { id: 't3a', label: 'Core Configuration', indent: 2, startDay: 45, endDay: 60, status: 'Not Started', pct: 0, deps: ['t2b', 't2c'] },
  { id: 't3b', label: 'Custom Development', indent: 2, startDay: 61, endDay: 75, status: 'Not Started', pct: 0, deps: ['t3a'] },
  { id: 't3c', label: 'Testing', indent: 2, startDay: 76, endDay: 90, status: 'Not Started', pct: 0, deps: ['t3b'] },
  { id: 't4', label: 'Phase 4: Go-Live', indent: 1, startDay: 91, endDay: 105, status: 'Not Started', pct: 0, isMilestone: true, isPhase: true, deps: ['t3c'] },
]

const RESOURCES: Resource[] = [
  { name: 'Sarah Chen', role: 'Project Manager', tasks: 8, hoursPlanned: 320, hoursActual: 148, pctAllocated: 100 },
  { name: 'Marcus R.', role: 'Solutions Architect', tasks: 5, hoursPlanned: 240, hoursActual: 92, pctAllocated: 80 },
  { name: 'Dev Team (4)', role: 'Developers', tasks: 3, hoursPlanned: 640, hoursActual: 0, pctAllocated: 0 },
  { name: 'Dana K.', role: 'Business Analyst', tasks: 6, hoursPlanned: 280, hoursActual: 120, pctAllocated: 90 },
  { name: 'IT Dept', role: 'Infrastructure', tasks: 2, hoursPlanned: 80, hoursActual: 12, pctAllocated: 20 },
  { name: 'QA Team (2)', role: 'Quality Assurance', tasks: 2, hoursPlanned: 160, hoursActual: 0, pctAllocated: 0 },
]

// ─── Gantt layout constants ───────────────────────────────────────────────────
const TOTAL_DAYS = 123  // Apr 1 – Aug 1
const TODAY_DAY = 21    // Apr 22
const ROW_H = 28
const LABEL_W = 250
const GANTT_W = 700
const PAD_TOP = 36

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dayX(d: number) {
  return (d / TOTAL_DAYS) * GANTT_W
}

function barColor(s: GanttTask['status']) {
  if (s === 'Complete') return '#4ade80'
  if (s === 'In Progress') return '#fbbf24'
  return '#374151'
}

function barDarker(s: GanttTask['status']) {
  if (s === 'Complete') return '#16a34a'
  if (s === 'In Progress') return '#d97706'
  return '#1f2937'
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProjectPlanningPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/projects/planning')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {})
  }, [])

  const tasks = data?.tasks ?? TASKS

  // Build week tick marks
  const weekTicks: { day: number; label: string }[] = []
  const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug']
  const MONTH_STARTS = [0, 29, 60, 90, 121]  // approx days from Apr 1
  for (let d = 0; d <= TOTAL_DAYS; d += 7) {
    // find which month
    let label = ''
    for (let mi = MONTH_STARTS.length - 1; mi >= 0; mi--) {
      if (d >= MONTH_STARTS[mi]) {
        const dayInMonth = d - MONTH_STARTS[mi] + 1
        if (d === MONTH_STARTS[mi]) label = MONTHS[mi]
        else label = `${MONTHS[mi]} ${dayInMonth}`
        break
      }
    }
    weekTicks.push({ day: d, label })
  }

  const svgH = PAD_TOP + tasks.length * ROW_H + 8
  const totalW = LABEL_W + GANTT_W

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <TopBar
        title="Project Planning"
        breadcrumb={[{ label: 'Projects', href: '/projects' }, { label: 'Planning', href: '/projects/planning' }]}
        actions={
          <>
            <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New Task</button>
            <button style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Assign Resources</button>
            <button style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Baseline</button>
            <button style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Critical Path</button>
          </>
        }
      />

      <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ── Project Selector ── */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', marginRight: 10 }}>Project</label>
          <select defaultValue="erp" style={{ background: '#16213e', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 7, padding: '7px 32px 7px 12px', fontSize: 13, cursor: 'pointer', appearance: 'none', minWidth: 380 }}>
            <option value="erp">PRJ-2026-001 — ERP Implementation — Fabrikam Inc</option>
            <option value="p2">PRJ-2026-002 — Network Upgrade — Contoso Ltd</option>
            <option value="p3">PRJ-2026-003 — Warehouse Expansion — Northwind</option>
          </select>
        </div>

        {/* ── Gantt Chart ── */}
        <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Gantt Chart — PRJ-2026-001</span>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { color: '#4ade80', label: 'Complete' },
                { color: '#fbbf24', label: 'In Progress' },
                { color: '#374151', label: 'Not Started' },
                { color: '#ef4444', label: 'Today' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: l.label === 'Today' ? 2 : 10, height: l.label === 'Today' ? 14 : 10, borderRadius: l.label === 'Today' ? 1 : 2, background: l.color }} />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <svg width={totalW} height={svgH} style={{ display: 'block', minWidth: totalW }}>
              {/* ── Task label panel ── */}
              <rect x={0} y={0} width={LABEL_W} height={svgH} fill="#16213e" />
              <line x1={LABEL_W} y1={0} x2={LABEL_W} y2={svgH} stroke="rgba(99,102,241,0.15)" />

              {/* ── Gantt panel bg ── */}
              <rect x={LABEL_W} y={0} width={GANTT_W} height={svgH} fill="#0d0e24" />

              {/* ── Week tick marks ── */}
              {weekTicks.map(t => {
                const x = LABEL_W + dayX(t.day)
                return (
                  <g key={t.day}>
                    <line x1={x} y1={PAD_TOP - 4} x2={x} y2={svgH} stroke="rgba(99,102,241,0.07)" />
                    <text x={x + 2} y={PAD_TOP - 6} fontSize={9} fill="#475569">{t.label}</text>
                  </g>
                )
              })}

              {/* ── Month separators ── */}
              {MONTH_STARTS.map((d, i) => {
                const x = LABEL_W + dayX(d)
                return (
                  <g key={i}>
                    <line x1={x} y1={0} x2={x} y2={svgH} stroke="rgba(99,102,241,0.12)" strokeWidth={1} />
                    <text x={x + 4} y={14} fontSize={10} fill="#6366f1" fontWeight="600">{MONTHS[i]}</text>
                  </g>
                )
              })}

              {/* ── Today line ── */}
              {(() => {
                const x = LABEL_W + dayX(TODAY_DAY)
                return (
                  <g>
                    <line x1={x} y1={0} x2={x} y2={svgH} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" />
                    <text x={x + 2} y={14} fontSize={9} fill="#ef4444" fontWeight="700">Today</text>
                  </g>
                )
              })()}

              {/* ── Task rows ── */}
              {tasks.map((task: GanttTask, i: number) => {
                const y = PAD_TOP + i * ROW_H
                const rowBg = i % 2 === 0 ? 'rgba(99,102,241,0.03)' : 'transparent'
                const indentPx = task.indent * 14

                // Bar geometry
                const bx = LABEL_W + dayX(task.startDay)
                let bw = dayX(Math.max(1, task.endDay - task.startDay))
                if (task.isMilestone && task.startDay === task.endDay) bw = 0

                const bc = barColor(task.status)
                const bd = barDarker(task.status)
                const fillPx = (task.pct / 100) * bw

                return (
                  <g key={task.id}>
                    {/* Row background */}
                    <rect x={0} y={y} width={totalW} height={ROW_H} fill={rowBg} />
                    <line x1={0} y1={y + ROW_H} x2={totalW} y2={y + ROW_H} stroke="rgba(99,102,241,0.06)" />

                    {/* Label */}
                    <text
                      x={6 + indentPx}
                      y={y + ROW_H / 2 + 4}
                      fontSize={task.isPhase ? 12 : 11}
                      fontWeight={task.isPhase ? '700' : '400'}
                      fill={task.indent === 0 ? '#e2e8f0' : task.indent === 1 ? '#c7d2fe' : '#94a3b8'}
                    >
                      {task.indent > 0 ? '  '.repeat(task.indent) : ''}{task.indent > 0 ? (task.indent === 1 ? '▸ ' : '   · ') : ''}{task.label}
                    </text>

                    {/* Milestone diamond */}
                    {task.isMilestone && task.startDay === task.endDay && (
                      <g transform={`translate(${LABEL_W + dayX(task.startDay)}, ${y + ROW_H / 2})`}>
                        <polygon points="0,-7 7,0 0,7 -7,0" fill={bc} />
                        <text x={10} y={4} fontSize={9} fill="#94a3b8">{task.label.includes('Kickoff') ? 'Apr 1' : 'Jul 15'}</text>
                      </g>
                    )}

                    {/* Bar */}
                    {bw > 0 && !task.isMilestone && (
                      <g>
                        {/* Full bar (background) */}
                        <rect x={bx} y={y + 7} width={bw} height={ROW_H - 14} rx={3} fill={task.isPhase ? `${bc}40` : `${bc}60`} />
                        {/* Completion fill */}
                        {fillPx > 0 && (
                          <rect x={bx} y={y + 7} width={fillPx} height={ROW_H - 14} rx={3} fill={bc} />
                        )}
                        {/* % label inside bar */}
                        {bw > 40 && (
                          <text x={bx + bw / 2} y={y + ROW_H / 2 + 4} textAnchor="middle" fontSize={9} fill={task.status === 'Not Started' ? '#6b7280' : '#0d0e24'} fontWeight="600">
                            {task.pct}%
                          </text>
                        )}
                      </g>
                    )}

                    {/* Dependency arrows (simplified — just line from end of dep to start of this) */}
                    {task.deps?.map((depId: string) => {
                      const depTask = tasks.find((t: GanttTask) => t.id === depId)
                      if (!depTask) return null
                      const depIdx = tasks.findIndex((t: GanttTask) => t.id === depId)
                      const x1 = LABEL_W + dayX(depTask.endDay)
                      const y1v = PAD_TOP + depIdx * ROW_H + ROW_H / 2
                      const x2 = LABEL_W + dayX(task.startDay)
                      const y2v = y + ROW_H / 2
                      return (
                        <g key={depId}>
                          <path d={`M${x1},${y1v} L${x1 + 4},${y1v} L${x1 + 4},${y2v} L${x2},${y2v}`} fill="none" stroke="rgba(100,116,139,0.4)" strokeWidth={1} strokeDasharray="3 2" markerEnd="url(#arr)" />
                        </g>
                      )
                    })}
                  </g>
                )
              })}

              {/* Arrow marker */}
              <defs>
                <marker id="arr" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                  <polygon points="0 0, 5 2.5, 0 5" fill="rgba(100,116,139,0.4)" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>

        {/* ── Resources FastTab ── */}
        <details style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
          <summary style={{ padding: '14px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 14, listStyle: 'none', borderBottom: '1px solid rgba(99,102,241,0.08)', color: '#c7d2fe' }}>
            Resources
          </summary>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  {['Resource', 'Role', 'Tasks', 'Hours Planned', 'Hours Actual', '% Allocated'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map(r => {
                  const allocColor = r.pctAllocated >= 100 ? '#f87171' : r.pctAllocated >= 75 ? '#fbbf24' : '#4ade80'
                  return (
                    <tr key={r.name} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{r.name}</td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{r.role}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{r.tasks}</td>
                      <td style={{ padding: '10px 14px' }}>{r.hoursPlanned}h</td>
                      <td style={{ padding: '10px 14px' }}>{r.hoursActual}h</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 80, height: 6, background: 'rgba(99,102,241,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, r.pctAllocated)}%`, background: allocColor, borderRadius: 3 }} />
                          </div>
                          <span style={{ color: allocColor, fontWeight: 700 }}>{r.pctAllocated}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </details>

      </div>
    </div>
  )
}
