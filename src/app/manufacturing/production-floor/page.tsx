'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { AlertTriangle, Activity } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkCenter { name: string; utilization: number }
interface OEE { availability: number; performance: number; quality: number; overall: number }
interface QualityAlert { id: number; severity: string; message: string; order: string }
interface ProductionOrderRow {
  id: string; item: string; qtyPlanned: number; qtyDone: number
  status: string; workCenter: string; due: string
}
interface GanttOrder { id: string; label: string; startHour: number; endHour: number; color: string }
interface FloorData {
  kpis: { activeOrders: number; onSchedule: number; delayed: number; oeePct: number; unitsProduced: number }
  workCenters: WorkCenter[]
  oee: OEE
  qualityAlerts: QualityAlert[]
  productionOrders: ProductionOrderRow[]
  ganttOrders: GanttOrder[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function barColor(pct: number): string {
  if (pct > 85) return '#ef4444'
  if (pct >= 70) return '#f59e0b'
  return '#0891b2'
}

const STATUS_CHIP: Record<string, string> = {
  'Completed':   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'In Progress': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'Delayed':     'bg-red-500/15 text-red-400 border-red-500/30',
  'Planned':     'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
}

// ─── Circular Gauge SVG ───────────────────────────────────────────────────────

function CircularGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 32
  const circ = 2 * Math.PI * r
  const dashOffset = circ - (value / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="8" />
        <circle
          cx="42" cy="42" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
        />
        <text x="42" y="46" textAnchor="middle" fontSize="14" fontWeight="600" fill="#e2e8f0">{value}%</text>
      </svg>
      <span style={{ color: '#94a3b8', fontSize: 11 }}>{label}</span>
    </div>
  )
}

// ─── Work Center Bar Chart ─────────────────────────────────────────────────────

function WorkCenterChart({ data }: { data: WorkCenter[] }) {
  const maxW = 340
  return (
    <div className="space-y-2.5">
      {data.map((wc) => (
        <div key={wc.name} className="flex items-center gap-3">
          <span style={{ color: '#94a3b8', fontSize: 12, width: 140, flexShrink: 0, textAlign: 'right' }}>{wc.name}</span>
          <div style={{ flex: 1, background: 'rgba(99,102,241,0.08)', borderRadius: 4, height: 20, position: 'relative', maxWidth: maxW }}>
            <div style={{
              width: `${wc.utilization}%`, height: '100%',
              background: barColor(wc.utilization),
              borderRadius: 4,
              transition: 'width 0.6s ease',
            }} />
            <span style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              color: '#e2e8f0', fontSize: 11, fontWeight: 600,
            }}>{wc.utilization}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Gantt Chart ──────────────────────────────────────────────────────────────

function GanttChart({ orders }: { orders: GanttOrder[] }) {
  const START = 6; const END = 22; const totalH = END - START
  const hours = Array.from({ length: totalH + 1 }, (_, i) => START + i)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" viewBox={`0 0 ${600} ${orders.length * 28 + 30}`} style={{ minWidth: 420 }}>
        {/* Hour ticks */}
        {hours.map((h, i) => {
          const x = 40 + (i / totalH) * 540
          return (
            <g key={h}>
              <line x1={x} y1={0} x2={x} y2={orders.length * 28 + 10} stroke="rgba(99,102,241,0.15)" strokeWidth="1" />
              <text x={x} y={orders.length * 28 + 24} textAnchor="middle" fontSize="9" fill="#64748b">
                {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
              </text>
            </g>
          )
        })}
        {/* Bars */}
        {orders.map((o, i) => {
          const xStart = 40 + ((o.startHour - START) / totalH) * 540
          const barW = ((o.endHour - o.startHour) / totalH) * 540
          const y = i * 28 + 4
          return (
            <g key={o.id}>
              <rect x={xStart} y={y} width={barW} height={18} rx={3}
                fill={o.color} opacity={0.75} />
              <text x={xStart + barW / 2} y={y + 12} textAnchor="middle" fontSize="10" fill="#e2e8f0" fontWeight="500">
                {o.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductionFloorPage() {
  const [data, setData] = useState<FloorData | null>(null)

  useEffect(() => {
    fetch('/api/manufacturing/production-floor')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const topBarActions = (
    <>
      <button
        style={{
          background: 'rgba(99,102,241,0.9)', color: '#fff',
          border: 'none', borderRadius: 6, padding: '5px 14px',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}
      >New Production Order</button>
      <button
        style={{
          background: 'transparent', color: '#e2e8f0',
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '5px 14px',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}
      >Schedule</button>
    </>
  )

  const card: React.CSSProperties = {
    background: '#16213e',
    border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: 10,
    padding: 20,
  }

  return (
    <div style={{ background: '#0d0e24', minHeight: '100dvh', color: '#e2e8f0' }}>
      <TopBar
        title="Production Floor Management"
        breadcrumb={[
          { label: 'Manufacturing', href: '/manufacturing' },
          { label: 'Production Floor', href: '/manufacturing/production-floor' },
        ]}
        actions={topBarActions}
      />

      <div style={{ padding: '24px 28px', maxWidth: 1440, margin: '0 auto' }}>

        {/* ── KPI Strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Active Orders', value: data?.kpis.activeOrders ?? 14, color: '#6366f1', badge: false },
            { label: 'On Schedule', value: data?.kpis.onSchedule ?? 11, color: '#22c55e', badge: false },
            { label: 'Delayed', value: data?.kpis.delayed ?? 3, color: '#ef4444', badge: true },
            { label: 'OEE Today', value: data ? `${data.kpis.oeePct}%` : '84.2%', color: '#0891b2', badge: false },
            { label: 'Units Produced', value: data?.kpis.unitsProduced?.toLocaleString() ?? '2,847', color: '#64748b', badge: false },
          ].map((kpi) => (
            <div key={kpi.label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{kpi.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: kpi.color }}>{kpi.value}</span>
                {kpi.badge && (
                  <span style={{
                    background: '#ef4444', color: '#fff', borderRadius: 10,
                    fontSize: 11, fontWeight: 600, padding: '1px 7px',
                  }}>!</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main 2-col ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 20 }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Work Center Utilization */}
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#e2e8f0' }}>Work Center Utilization</h2>
              <WorkCenterChart data={data?.workCenters ?? [
                { name: 'Assembly Line A', utilization: 92 },
                { name: 'Assembly Line B', utilization: 78 },
                { name: 'Machining Center 1', utilization: 85 },
                { name: 'Machining Center 2', utilization: 67 },
                { name: 'Welding Station', utilization: 71 },
                { name: 'Paint Booth', utilization: 45 },
                { name: 'Quality Control', utilization: 88 },
                { name: 'Packaging', utilization: 63 },
              ]} />
              <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                {[
                  { color: '#0891b2', label: '< 70% normal' },
                  { color: '#f59e0b', label: '70–85% caution' },
                  { color: '#ef4444', label: '> 85% over capacity' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Production Orders table */}
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#e2e8f0' }}>Active Production Orders</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                      {['Order #', 'Item', 'Qty Planned', 'Qty Done', 'Status', 'Work Center', 'Due'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.productionOrders ?? [
                      { id: 'P-2026-0441', item: 'Widget Assembly A100', qtyPlanned: 500, qtyDone: 320, status: 'In Progress', workCenter: 'Assembly A', due: 'Apr 23' },
                      { id: 'P-2026-0442', item: 'Motor Housing B200', qtyPlanned: 150, qtyDone: 150, status: 'Completed', workCenter: 'Machining 1', due: 'Apr 22' },
                      { id: 'P-2026-0443', item: 'Control Panel C300', qtyPlanned: 200, qtyDone: 80, status: 'Delayed', workCenter: 'Assembly B', due: 'Apr 21' },
                      { id: 'P-2026-0444', item: 'Drive Unit D400', qtyPlanned: 75, qtyDone: 0, status: 'Planned', workCenter: 'Welding', due: 'Apr 25' },
                      { id: 'P-2026-0445', item: 'Frame Structure E500', qtyPlanned: 300, qtyDone: 295, status: 'In Progress', workCenter: 'Assembly A', due: 'Apr 23' },
                      { id: 'P-2026-0446', item: 'Gear Assembly F600', qtyPlanned: 120, qtyDone: 60, status: 'In Progress', workCenter: 'Machining 2', due: 'Apr 24' },
                      { id: 'P-2026-0447', item: 'Shaft Component G700', qtyPlanned: 400, qtyDone: 0, status: 'Planned', workCenter: 'Welding', due: 'Apr 26' },
                      { id: 'P-2026-0448', item: 'Housing Cover H800', qtyPlanned: 250, qtyDone: 250, status: 'Completed', workCenter: 'Paint Booth', due: 'Apr 22' },
                      { id: 'P-2026-0449', item: 'Bearing Block J900', qtyPlanned: 180, qtyDone: 45, status: 'Delayed', workCenter: 'Machining 1', due: 'Apr 21' },
                      { id: 'P-2026-0450', item: 'End Cap K100', qtyPlanned: 600, qtyDone: 420, status: 'In Progress', workCenter: 'Packaging', due: 'Apr 23' },
                    ]).map((o) => (
                      <tr key={o.id}
                        style={{
                          borderBottom: '1px solid rgba(99,102,241,0.08)',
                          background: o.status === 'Delayed' ? 'rgba(245,158,11,0.06)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '7px 10px', color: '#6366f1', fontWeight: 500 }}>{o.id}</td>
                        <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{o.item}</td>
                        <td style={{ padding: '7px 10px', color: '#94a3b8', textAlign: 'right' }}>{o.qtyPlanned.toLocaleString()}</td>
                        <td style={{ padding: '7px 10px', color: '#94a3b8', textAlign: 'right' }}>{o.qtyDone.toLocaleString()}</td>
                        <td style={{ padding: '7px 10px' }}>
                          <span style={{ display: 'inline-flex', borderRadius: 9999, padding: '2px 8px', fontSize: 11, fontWeight: 500, border: '1px solid' }}
                            className={STATUS_CHIP[o.status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{o.workCenter}</td>
                        <td style={{ padding: '7px 10px', color: o.status === 'Delayed' ? '#f87171' : '#94a3b8' }}>{o.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* OEE Dashboard */}
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#e2e8f0' }}>OEE Dashboard</h2>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
                Overall Equipment Effectiveness — Today
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, justifyItems: 'center', marginBottom: 16 }}>
                <CircularGauge value={data?.oee.availability ?? 91} label="Availability" color="#22c55e" />
                <CircularGauge value={data?.oee.performance ?? 87} label="Performance" color="#6366f1" />
                <CircularGauge value={data?.oee.quality ?? 97} label="Quality" color="#0891b2" />
              </div>
              <div style={{
                background: 'rgba(99,102,241,0.1)',
                borderRadius: 8, padding: '10px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={16} style={{ color: '#6366f1' }} />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>OEE Score</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#6366f1' }}>
                  {data?.oee.overall ?? 84.2}%
                </span>
              </div>
            </div>

            {/* Production Schedule Gantt */}
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#e2e8f0' }}>Production Schedule — Today</h2>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>6 AM – 10 PM active window</p>
              <GanttChart orders={data?.ganttOrders ?? [
                { id: 'P-2026-0441', label: 'P-0441', startHour: 6, endHour: 18, color: '#6366f1' },
                { id: 'P-2026-0443', label: 'P-0443', startHour: 7, endHour: 14, color: '#ef4444' },
                { id: 'P-2026-0445', label: 'P-0445', startHour: 8, endHour: 20, color: '#6366f1' },
                { id: 'P-2026-0446', label: 'P-0446', startHour: 9, endHour: 17, color: '#0891b2' },
                { id: 'P-2026-0450', label: 'P-0450', startHour: 12, endHour: 22, color: '#0891b2' },
              ]} />
            </div>

            {/* Quality Alerts */}
            <div style={card}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#e2e8f0' }}>Quality Alerts</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(data?.qualityAlerts ?? [
                  { id: 1, severity: 'amber', message: 'Defect rate on P-0443 elevated — 4.2% vs 2% target', order: 'P-2026-0443' },
                  { id: 2, severity: 'amber', message: 'Rework required P-0441 batch 3 — 12 units flagged', order: 'P-2026-0441' },
                  { id: 3, severity: 'red', message: 'Material shortage warning P-0447 — steel sheet stock < 10%', order: 'P-2026-0447' },
                ]).map((alert) => (
                  <div key={alert.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: alert.severity === 'red' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${alert.severity === 'red' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                  }}>
                    <AlertTriangle size={14} style={{ color: alert.severity === 'red' ? '#ef4444' : '#f59e0b', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 500, display: 'block', marginBottom: 2 }}>{alert.order}</span>
                      <span style={{ fontSize: 12, color: '#e2e8f0' }}>{alert.message}</span>
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
