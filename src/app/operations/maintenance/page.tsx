'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkOrder {
  id: string
  asset: string
  type: 'Preventive' | 'Corrective' | 'Inspection' | 'Emergency'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  assignedTo: string
  dueDate: string
  dueDateLabel: string
  status: 'Open' | 'Scheduled' | 'In Progress' | 'Overdue' | 'Complete'
  completion: number
  isOverdue?: boolean
}

interface AssetHealth {
  name: string
  health: number
  lastMaint: string
  nextDue: string
}

interface Part {
  name: string
  stock: number
  minStock: number
  status: 'OK' | 'Low' | 'Critical'
}

// ─── Data ────────────────────────────────────────────────────────────────────
const WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-MNT-0841', asset: 'Assembly Line A', type: 'Preventive', priority: 'High', assignedTo: 'John M.', dueDate: 'Apr 24', dueDateLabel: 'Apr 24', status: 'In Progress', completion: 45 },
  { id: 'WO-MNT-0840', asset: 'HVAC Unit 2', type: 'Corrective', priority: 'Critical', assignedTo: 'HVAC Contractor', dueDate: 'Apr 22', dueDateLabel: 'Apr 22 — TODAY', status: 'Scheduled', completion: 0 },
  { id: 'WO-MNT-0839', asset: 'Forklift #3', type: 'Preventive', priority: 'Medium', assignedTo: 'Tom K.', dueDate: 'Apr 25', dueDateLabel: 'Apr 25', status: 'Open', completion: 0 },
  { id: 'WO-MNT-0838', asset: 'Server Room AC', type: 'Inspection', priority: 'Low', assignedTo: 'IT Dept', dueDate: 'Apr 30', dueDateLabel: 'Apr 30', status: 'Open', completion: 0 },
  { id: 'WO-MNT-0837', asset: 'Paint Booth Exhaust', type: 'Corrective', priority: 'High', assignedTo: 'Ext. Vendor', dueDate: 'Apr 21', dueDateLabel: 'Apr 21', status: 'Overdue', completion: 20, isOverdue: true },
  { id: 'WO-MNT-0836', asset: 'Conveyor Belt B', type: 'Preventive', priority: 'Medium', assignedTo: 'Mike R.', dueDate: 'Apr 26', dueDateLabel: 'Apr 26', status: 'Open', completion: 0 },
  { id: 'WO-MNT-0835', asset: 'Compressor Unit 1', type: 'Inspection', priority: 'Low', assignedTo: 'Safety Team', dueDate: 'Apr 28', dueDateLabel: 'Apr 28', status: 'Scheduled', completion: 0 },
  { id: 'WO-MNT-0834', asset: 'Loading Dock Door 2', type: 'Corrective', priority: 'High', assignedTo: 'Facilities', dueDate: 'Apr 23', dueDateLabel: 'Apr 23', status: 'In Progress', completion: 75 },
  { id: 'WO-MNT-0833', asset: 'Fire Suppression System', type: 'Inspection', priority: 'Critical', assignedTo: 'Safety Team', dueDate: 'Apr 29', dueDateLabel: 'Apr 29', status: 'Scheduled', completion: 0 },
  { id: 'WO-MNT-0832', asset: 'Packaging Machine 3', type: 'Preventive', priority: 'Medium', assignedTo: 'Tom K.', dueDate: 'Apr 27', dueDateLabel: 'Apr 27', status: 'Open', completion: 0 },
  { id: 'WO-MNT-0831', asset: 'Electrical Panel B', type: 'Inspection', priority: 'High', assignedTo: 'Electrician', dueDate: 'Apr 25', dueDateLabel: 'Apr 25', status: 'Open', completion: 0 },
  { id: 'WO-MNT-0830', asset: 'Roof HVAC Unit 1', type: 'Preventive', priority: 'Low', assignedTo: 'HVAC Contractor', dueDate: 'May 2', dueDateLabel: 'May 2', status: 'Open', completion: 0 },
]

const ASSETS: AssetHealth[] = [
  { name: 'Assembly Line A', health: 72, lastMaint: '15 days ago', nextDue: 'Apr 24' },
  { name: 'HVAC Unit 2', health: 38, lastMaint: '45 days ago', nextDue: 'TODAY' },
  { name: 'Forklift #3', health: 85, lastMaint: '10 days ago', nextDue: 'Apr 25' },
  { name: 'Server Room AC', health: 91, lastMaint: '5 days ago', nextDue: 'Apr 30' },
  { name: 'Paint Booth Exhaust', health: 24, lastMaint: '62 days ago', nextDue: 'OVERDUE' },
  { name: 'Conveyor Belt B', health: 78, lastMaint: '20 days ago', nextDue: 'Apr 26' },
  { name: 'Compressor Unit 1', health: 88, lastMaint: '8 days ago', nextDue: 'Apr 28' },
  { name: 'Loading Dock Door 2', health: 55, lastMaint: '30 days ago', nextDue: 'Apr 23' },
]

const PARTS: Part[] = [
  { name: 'HVAC Filter 20x25', stock: 4, minStock: 10, status: 'Critical' },
  { name: 'Conveyor Belt V-Belt', stock: 2, minStock: 5, status: 'Critical' },
  { name: 'Hydraulic Fluid 5gal', stock: 8, minStock: 6, status: 'OK' },
  { name: 'Forklift Brake Pads', stock: 3, minStock: 4, status: 'Low' },
  { name: 'Paint Booth Fan Motor', stock: 1, minStock: 2, status: 'Critical' },
]

const MONTHLY_COSTS = [
  { month: 'Oct', prev: 4200, corr: 2800 },
  { month: 'Nov', prev: 3800, corr: 5200 },
  { month: 'Dec', prev: 4500, corr: 3100 },
  { month: 'Jan', prev: 5100, corr: 4800 },
  { month: 'Feb', prev: 3900, corr: 2200 },
  { month: 'Mar', prev: 4700, corr: 6100 },
  { month: 'Apr', prev: 3200, corr: 1900 },
]

const APRIL_DAYS = Array.from({ length: 30 }, (_, i) => i + 1)
const APR_1_DOW = 3

// ─── Helpers ──────────────────────────────────────────────────────────────────
function typeStyle(t: WorkOrder['type']) {
  const m: Record<string, { bg: string; text: string }> = {
    Preventive: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
    Corrective: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
    Inspection: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
    Emergency: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  }
  return m[t] ?? m.Inspection
}

function priorityStyle(p: WorkOrder['priority']) {
  const m: Record<string, string> = { Low: '#94a3b8', Medium: '#fbbf24', High: '#fb923c', Critical: '#f87171' }
  return m[p] ?? '#94a3b8'
}

function statusStyle(s: WorkOrder['status'], overdue?: boolean) {
  if (overdue) return { bg: 'rgba(239,68,68,0.15)', text: '#f87171' }
  const m: Record<string, { bg: string; text: string }> = {
    Open: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
    Scheduled: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
    'In Progress': { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
    Complete: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80' },
    Overdue: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  }
  return m[s] ?? m.Open
}

function healthColor(h: number) {
  if (h >= 80) return '#4ade80'
  if (h >= 50) return '#fbbf24'
  return '#f87171'
}

function woOnDate(day: number) {
  const dateStr = `Apr ${day}`
  return WORK_ORDERS.filter(w => w.dueDate === dateStr)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MaintenancePage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/operations/maintenance')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {})
  }, [])

  const orders = data?.workOrders ?? WORK_ORDERS

  const svgW = 320, svgH = 150, padL = 36, padB = 24, padT = 8, padR = 8
  const chartW = svgW - padL - padR
  const chartH = svgH - padB - padT
  const maxCost = 20000
  const bw = (chartW / MONTHLY_COSTS.length - 8) / 2

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <TopBar
        title="Maintenance Management"
        breadcrumb={[{ label: 'Operations', href: '/operations' }, { label: 'Maintenance', href: '/operations/maintenance' }]}
        actions={
          <>
            <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New Work Order</button>
            <button style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Schedule</button>
            <button style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Parts Request</button>
          </>
        }
      />

      <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ── KPI Strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Open Work Orders', value: '8', color: '#a5b4fc', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Overdue', value: '2', color: '#f87171', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Completed This Month', value: '24', color: '#4ade80', bg: 'rgba(34,197,94,0.08)' },
            { label: 'Avg Response Time', value: '4.2 hrs', color: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Equipment Uptime', value: '97.8%', color: '#4ade80', bg: 'rgba(34,197,94,0.08)' },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.color}25`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* ── Main 2-col ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 20 }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Work Orders Table */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(99,102,241,0.1)', fontWeight: 700, fontSize: 14 }}>Work Orders</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                      {['WO #', 'Asset', 'Type', 'Priority', 'Assigned To', 'Due Date', 'Status', 'Complete'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((wo: WorkOrder) => {
                      const ss = statusStyle(wo.status, wo.isOverdue)
                      const ts = typeStyle(wo.type)
                      return (
                        <tr key={wo.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', borderLeft: wo.isOverdue ? '3px solid #ef4444' : '3px solid transparent' }}>
                          <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11, color: '#818cf8' }}>{wo.id}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap' }}>{wo.asset}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ background: ts.bg, color: ts.text, borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>{wo.type}</span>
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: priorityStyle(wo.priority), whiteSpace: 'nowrap' }}>{wo.priority}</td>
                          <td style={{ padding: '8px 10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{wo.assignedTo}</td>
                          <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: wo.isOverdue ? '#f87171' : '#e2e8f0' }}>{wo.dueDateLabel}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ background: ss.bg, color: ss.text, borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>{wo.status}</span>
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 60, height: 5, background: 'rgba(99,102,241,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${wo.completion}%`, background: wo.completion === 100 ? '#4ade80' : '#6366f1', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>{wo.completion}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Maintenance Calendar */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Maintenance Calendar — April 2026</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#64748b', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '.04em' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {Array.from({ length: APR_1_DOW }).map((_, i) => <div key={`e${i}`} />)}
                {APRIL_DAYS.map(day => {
                  const wos = woOnDate(day)
                  const isToday = day === 22
                  return (
                    <div key={day} style={{ background: isToday ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.04)', border: isToday ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(99,102,241,0.06)', borderRadius: 5, padding: '4px 4px 3px', minHeight: 42 }}>
                      <div style={{ fontSize: 10, color: isToday ? '#a5b4fc' : '#64748b', fontWeight: isToday ? 700 : 400, marginBottom: 2, textAlign: 'right' }}>{day}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {wos.map(wo => (
                          <div key={wo.id} style={{ width: 7, height: 7, borderRadius: '50%', background: wo.isOverdue ? '#ef4444' : wo.type === 'Preventive' ? '#818cf8' : wo.type === 'Corrective' ? '#fbbf24' : '#94a3b8' }} title={`${wo.id} ${wo.asset}`} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Preventive', color: '#818cf8' },
                  { label: 'Corrective', color: '#fbbf24' },
                  { label: 'Inspection', color: '#94a3b8' },
                  { label: 'Overdue', color: '#ef4444' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: l.color }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Asset Health Scorecard */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Asset Health Scorecard</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ASSETS.map(a => {
                  const col = healthColor(a.health)
                  return (
                    <div key={a.name}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{a.health}%</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(99,102,241,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
                        <div style={{ height: '100%', width: `${a.health}%`, background: col, borderRadius: 3, transition: 'width .3s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: '#64748b' }}>Last: {a.lastMaint}</span>
                        <span style={{ fontSize: 10, color: a.nextDue === 'OVERDUE' ? '#f87171' : a.nextDue === 'TODAY' ? '#fbbf24' : '#64748b' }}>Due: {a.nextDue}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Parts Inventory */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Critical Parts Inventory</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Part', 'Stock', 'Min', 'Status'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PARTS.map(p => {
                    const col = p.status === 'OK' ? { bg: 'rgba(34,197,94,0.12)', text: '#4ade80' }
                      : p.status === 'Low' ? { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' }
                      : { bg: 'rgba(239,68,68,0.12)', text: '#f87171' }
                    return (
                      <tr key={p.name} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                        <td style={{ padding: '7px 8px', fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: '7px 8px', fontWeight: 700, color: p.stock < p.minStock ? '#f87171' : '#e2e8f0' }}>{p.stock}</td>
                        <td style={{ padding: '7px 8px', color: '#64748b' }}>{p.minStock}</td>
                        <td style={{ padding: '7px 8px' }}>
                          <span style={{ background: col.bg, color: col.text, borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>{p.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Maintenance Cost YTD Chart */}
            <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Maintenance Cost YTD</div>
              <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`}>
                {[0, 5000, 10000, 15000, 20000].map(v => {
                  const y = padT + chartH - (v / maxCost) * chartH
                  return (
                    <g key={v}>
                      <line x1={padL} x2={svgW - padR} y1={y} y2={y} stroke="rgba(99,102,241,0.1)" />
                      <text x={padL - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#64748b">{v === 0 ? '0' : `$${v / 1000}K`}</text>
                    </g>
                  )
                })}
                {MONTHLY_COSTS.map((m, i) => {
                  const gw = chartW / MONTHLY_COSTS.length
                  const gx = padL + i * gw + 3
                  const prevH = (m.prev / maxCost) * chartH
                  const corrH = (m.corr / maxCost) * chartH
                  return (
                    <g key={m.month}>
                      <rect x={gx} y={padT + chartH - prevH} width={bw} height={prevH} fill="#818cf8" rx={2} opacity={0.85} />
                      <rect x={gx + bw + 1} y={padT + chartH - corrH} width={bw} height={corrH} fill="#fbbf24" rx={2} opacity={0.85} />
                      <text x={gx + bw} y={svgH - 4} textAnchor="middle" fontSize={8} fill="#64748b">{m.month}</text>
                    </g>
                  )
                })}
              </svg>
              <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#818cf8' }} />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Preventive</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#fbbf24' }} />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Corrective</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
