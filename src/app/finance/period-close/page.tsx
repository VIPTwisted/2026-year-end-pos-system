'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const THEME = {
  bg: '#0d0e24',
  card: '#16213e',
  border: 'rgba(99,102,241,0.15)',
  accent: 'rgba(99,102,241,0.3)',
  text: '#e2e8f0',
  muted: '#94a3b8',
  indigo: '#6366f1',
  amber: '#f59e0b',
  green: '#22c55e',
  red: '#ef4444',
  gray: '#475569',
}

interface Task {
  done: boolean
  label: string
  user: string
  due: string
  status: 'Complete' | 'Pending' | 'Locked' | 'Grayed'
}

interface ActivityEntry {
  user: string
  action: string
  time: string
}

const PRE_CLOSE_TASKS: Task[] = [
  { done: true, label: 'Post all open journals', user: 'jsmith', due: 'Apr 20', status: 'Complete' },
  { done: true, label: 'Reconcile bank accounts', user: 'adavis', due: 'Apr 20', status: 'Complete' },
  { done: true, label: 'Clear intercompany transactions', user: 'jsmith', due: 'Apr 21', status: 'Complete' },
  { done: true, label: 'Review open purchase orders', user: 'bwilson', due: 'Apr 21', status: 'Complete' },
  { done: true, label: 'Complete expense reports', user: 'adavis', due: 'Apr 21', status: 'Complete' },
  { done: true, label: 'Post depreciation', user: 'jsmith', due: 'Apr 22', status: 'Complete' },
  { done: true, label: 'Accrue unbilled revenue', user: 'jsmith', due: 'Apr 22', status: 'Complete' },
  { done: false, label: 'Management review sign-off', user: 'CFO', due: 'Apr 25', status: 'Pending' },
]

const SYSTEM_TASKS: Task[] = [
  { done: false, label: 'Run currency revaluation', user: 'System', due: 'Apr 26', status: 'Locked' },
  { done: false, label: 'Post closing entries', user: 'System', due: 'Apr 26', status: 'Locked' },
  { done: false, label: 'Generate trial balance', user: 'System', due: 'Apr 26', status: 'Locked' },
  { done: false, label: 'Lock accounting period', user: 'System', due: 'Apr 26', status: 'Locked' },
]

const REPORTING_TASKS: Task[] = [
  { done: false, label: 'Generate P&L statement', user: 'adavis', due: 'Apr 28', status: 'Grayed' },
  { done: false, label: 'Generate balance sheet', user: 'adavis', due: 'Apr 28', status: 'Grayed' },
  { done: false, label: 'Distribute to stakeholders', user: 'CFO', due: 'Apr 30', status: 'Grayed' },
]

const POST_CLOSE_TASKS: Task[] = [
  { done: false, label: 'Verify closed period in subledgers', user: 'jsmith', due: 'May 1', status: 'Grayed' },
  { done: false, label: 'Archive period documents', user: 'adavis', due: 'May 2', status: 'Grayed' },
]

const RECENT_ACTIVITY: ActivityEntry[] = [
  { user: 'jsmith', action: 'Posted depreciation run for April 2026', time: 'Today 14:32' },
  { user: 'adavis', action: 'Completed expense report reconciliation', time: 'Today 13:18' },
  { user: 'bwilson', action: 'Reviewed & closed 47 open POs', time: 'Today 11:45' },
  { user: 'adavis', action: 'Bank reconciliation approved', time: 'Today 09:22' },
  { user: 'jsmith', action: 'Period close checklist opened for April 2026', time: 'Yesterday 17:05' },
]

const CLOSE_PCT = 78

// Circular gauge SVG
function GaugeSVG({ pct }: { pct: number }) {
  const R = 54
  const CX = 72
  const CY = 72
  const circumference = 2 * Math.PI * R
  const dashOffset = circumference * (1 - pct / 100)
  const color = pct >= 90 ? THEME.green : pct >= 60 ? THEME.amber : THEME.red

  return (
    <svg viewBox="0 0 144 144" style={{ width: 144, height: 144 }}>
      {/* Track */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
      {/* Progress */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      {/* Center text */}
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize={22} fontWeight={700} fill={color}>{pct}%</text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize={10} fill={THEME.muted}>complete</text>
    </svg>
  )
}

function TaskRow({ task, grayed }: { task: Task; grayed?: boolean }) {
  const opacity = grayed ? 0.4 : 1
  const statusChip = () => {
    if (task.status === 'Complete') return { bg: 'rgba(34,197,94,0.15)', color: THEME.green, label: 'Done' }
    if (task.status === 'Pending') return { bg: 'rgba(245,158,11,0.15)', color: THEME.amber, label: 'Pending' }
    if (task.status === 'Locked') return { bg: 'rgba(100,116,139,0.15)', color: THEME.gray, label: 'Locked' }
    return { bg: 'rgba(100,116,139,0.1)', color: THEME.gray, label: '—' }
  }
  const chip = statusChip()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${THEME.border}`, opacity }}>
      {/* Checkbox */}
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        background: task.done ? THEME.green : 'transparent',
        border: `2px solid ${task.done ? THEME.green : 'rgba(255,255,255,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {task.done && (
          <svg viewBox="0 0 10 10" width={9} height={9}>
            <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {/* Label */}
      <span style={{ flex: 1, fontSize: 12, color: task.done ? THEME.muted : THEME.text, textDecoration: task.done ? 'line-through' : 'none' }}>
        {task.label}
        {task.status === 'Pending' && (
          <span style={{ marginLeft: 8, fontSize: 10, color: THEME.amber, fontWeight: 600 }}> — PENDING</span>
        )}
      </span>
      <span style={{ fontSize: 10, color: THEME.muted, minWidth: 48 }}>{task.user}</span>
      <span style={{ fontSize: 10, color: THEME.muted, minWidth: 40 }}>{task.due}</span>
      <span style={{ padding: '2px 7px', borderRadius: 8, fontSize: 9.5, fontWeight: 600, background: chip.bg, color: chip.color, minWidth: 44, textAlign: 'center' }}>
        {chip.label}
      </span>
    </div>
  )
}

function Section({ title, tasks, defaultOpen, grayed, badge }: { title: string; tasks: Task[]; defaultOpen?: boolean; grayed?: boolean; badge?: string }) {
  return (
    <details open={defaultOpen} style={{ marginBottom: 16 }}>
      <summary style={{
        listStyle: 'none', cursor: 'pointer', padding: '10px 14px',
        background: THEME.card, border: `1px solid ${THEME.border}`,
        borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 13, fontWeight: 600, color: grayed ? THEME.muted : THEME.text,
        userSelect: 'none',
      }}>
        <svg viewBox="0 0 12 12" width={10} height={10} style={{ transform: 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <polyline points="2,4 6,8 10,4" stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
        {badge && (
          <span style={{ marginLeft: 'auto', padding: '1px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: grayed ? 'rgba(100,116,139,0.15)' : 'rgba(99,102,241,0.2)', color: grayed ? THEME.gray : THEME.indigo }}>
            {badge}
          </span>
        )}
      </summary>
      <div style={{ padding: '4px 8px 4px 12px', borderLeft: `2px solid ${THEME.border}`, marginLeft: 8, marginTop: 4 }}>
        {tasks.map((t, i) => <TaskRow key={i} task={t} grayed={grayed} />)}
      </div>
    </details>
  )
}

export default function PeriodClosePage() {
  const [_data, setData] = useState<unknown>(null)
  const [period, setPeriod] = useState('April 2026')

  const PERIODS = ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026']
  const currentIdx = PERIODS.indexOf(period)

  useEffect(() => {
    fetch('/api/finance/period-close')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null)
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <TopBar
        title="Financial Period Close"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Period Close', href: '/finance/period-close' },
        ]}
        actions={
          <>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
              className="hover:bg-red-700">
              Close Period
            </button>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'transparent', color: THEME.text, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
              Checklist
            </button>
          </>
        }
      />

      {/* Period Selector */}
      <div style={{ padding: '12px 24px', borderBottom: `1px solid ${THEME.border}`, background: THEME.card, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => currentIdx > 0 && setPeriod(PERIODS[currentIdx - 1])}
          disabled={currentIdx === 0}
          style={{ width: 28, height: 28, borderRadius: 6, background: 'transparent', border: `1px solid ${THEME.border}`, color: THEME.text, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg viewBox="0 0 12 12" width={10} height={10}><polyline points="8,2 4,6 8,10" stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{period}</span>
        <button
          onClick={() => currentIdx < PERIODS.length - 1 && setPeriod(PERIODS[currentIdx + 1])}
          disabled={currentIdx === PERIODS.length - 1}
          style={{ width: 28, height: 28, borderRadius: 6, background: 'transparent', border: `1px solid ${THEME.border}`, color: THEME.text, cursor: currentIdx === PERIODS.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIdx === PERIODS.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg viewBox="0 0 12 12" width={10} height={10}><polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: THEME.green }}>Open</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: THEME.muted }}>Fiscal Year 2026</span>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: 24, padding: '20px 24px', alignItems: 'start' }}>
        {/* LEFT — Checklist */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Close Checklist</p>
          <Section title="Pre-Close Tasks" tasks={PRE_CLOSE_TASKS} defaultOpen badge="7 / 8" />
          <Section title="System Closing Tasks" tasks={SYSTEM_TASKS} defaultOpen={false} badge="0 / 4 — locked" />
          <Section title="Reporting Tasks" tasks={REPORTING_TASKS} defaultOpen={false} grayed badge="0 / 3" />
          <Section title="Post-Close Verification" tasks={POST_CLOSE_TASKS} defaultOpen={false} grayed badge="0 / 2" />
        </div>

        {/* RIGHT — Status */}
        <div>
          {/* Gauge */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '16px', marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, alignSelf: 'flex-start' }}>Close Status</p>
            <GaugeSVG pct={CLOSE_PCT} />
            <p style={{ fontSize: 10, color: THEME.muted, marginTop: 6 }}>1 blocking issue remaining</p>
          </div>

          {/* Period Summary */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Period Summary</p>
            {[
              { label: 'Trial Balance Variance', value: '$0', color: THEME.green },
              { label: 'Open Items', value: '1', color: THEME.amber },
              { label: 'Blocking Issues', value: '1', color: THEME.red },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${THEME.border}` }}>
                <span style={{ fontSize: 11, color: THEME.muted }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Recent Activity</p>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, position: 'relative' }}>
                {/* Timeline dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.indigo, marginTop: 3 }} />
                  {i < RECENT_ACTIVITY.length - 1 && <div style={{ width: 1, flex: 1, background: THEME.border, marginTop: 2 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 6 }}>
                  <p style={{ fontSize: 11, color: THEME.text }}>
                    <span style={{ fontWeight: 600, color: THEME.indigo }}>{a.user}</span>{' '}
                    {a.action}
                  </p>
                  <p style={{ fontSize: 10, color: THEME.muted, marginTop: 2 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
