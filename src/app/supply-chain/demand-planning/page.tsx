export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ── Static mock data ──────────────────────────────────────────────────────────

const kpis = [
  { label: 'Forecast Accuracy', value: '91.4%', delta: '+1.2% vs last month', up: true },
  { label: 'Demand Coverage', value: '34 days', delta: '-2d vs target', up: false },
  { label: 'Overstock Items', value: '17', delta: '4 high-risk', up: false },
  { label: 'Stockout Risk', value: '5', delta: '2 critical', up: false },
  { label: 'Active Forecasts', value: '243', delta: '12 pending review', up: true },
]

const forecastModels = [
  { name: 'Moving Average (12M)', active: true, accuracy: '89%' },
  { name: 'Exponential Smooth', active: false, accuracy: '91%' },
  { name: 'Croston (Intermittent)', active: false, accuracy: '84%' },
  { name: 'Box-Jenkins ARIMA', active: false, accuracy: '93%' },
  { name: 'Machine Learning (XGB)', active: false, accuracy: '96%' },
]

// Chart data: 6 months, forecast vs actual for 5 items aggregated
const chartMonths = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
const chartData: { month: string; forecast: number; actual: number }[] = [
  { month: 'Nov', forecast: 3200, actual: 3050 },
  { month: 'Dec', forecast: 4100, actual: 4320 },
  { month: 'Jan', forecast: 3800, actual: 3650 },
  { month: 'Feb', forecast: 3500, actual: 3480 },
  { month: 'Mar', forecast: 3900, actual: 3720 },
  { month: 'Apr', forecast: 4200, actual: 0 }, // current month — no actual yet
]

const maxChartValue = 4800

type ActionType = 'Increase' | 'Decrease' | 'Cancel' | 'New'
type Priority = 'High' | 'Medium' | 'Low'

const actionMessages: {
  type: ActionType
  item: string
  qtyChange: string
  dueDate: string
  priority: Priority
}[] = [
  { type: 'Increase', item: 'Steel Rod 12mm', qtyChange: '+500 units', dueDate: 'Apr 25', priority: 'High' },
  { type: 'New', item: 'Copper Wire 2.5mm', qtyChange: '+800 units', dueDate: 'Apr 28', priority: 'High' },
  { type: 'Decrease', item: 'PVC Pipe 50mm', qtyChange: '-200 units', dueDate: 'May 01', priority: 'Medium' },
  { type: 'Increase', item: 'Circuit Breaker 20A', qtyChange: '+150 units', dueDate: 'May 03', priority: 'High' },
  { type: 'Cancel', item: 'Nylon Washer 8mm', qtyChange: '-300 units', dueDate: 'May 05', priority: 'Low' },
  { type: 'Decrease', item: 'Aluminium Sheet 3mm', qtyChange: '-100 units', dueDate: 'May 06', priority: 'Medium' },
  { type: 'New', item: 'Hydraulic Seal Kit', qtyChange: '+60 units', dueDate: 'May 08', priority: 'High' },
  { type: 'Increase', item: 'Conveyor Belt 500mm', qtyChange: '+25 units', dueDate: 'May 10', priority: 'Medium' },
  { type: 'Cancel', item: 'Bolt M12x50', qtyChange: '-1,000 units', dueDate: 'May 12', priority: 'Low' },
  { type: 'New', item: 'Industrial Gasket A4', qtyChange: '+200 units', dueDate: 'May 14', priority: 'Medium' },
  { type: 'Decrease', item: 'Steel Rod 8mm', qtyChange: '-150 units', dueDate: 'May 15', priority: 'Low' },
  { type: 'Increase', item: 'PVC Fitting 50mm', qtyChange: '+400 units', dueDate: 'May 18', priority: 'High' },
]

type ItemStatus = 'Critical' | 'Warning' | 'OK'

const demandSupplyTable: {
  itemNo: string
  name: string
  currentStock: number
  forecastDemand30d: number
  netRequirement: number
  plannedSupply: number
  coverageDays: number
  status: ItemStatus
}[] = [
  { itemNo: 'IT-00421', name: 'Steel Rod 12mm', currentStock: 120, forecastDemand30d: 680, netRequirement: 560, plannedSupply: 600, coverageDays: 5, status: 'Critical' },
  { itemNo: 'IT-00087', name: 'Copper Wire 2.5mm', currentStock: 250, forecastDemand30d: 900, netRequirement: 650, plannedSupply: 800, coverageDays: 8, status: 'Critical' },
  { itemNo: 'IT-00332', name: 'PVC Pipe 50mm', currentStock: 480, forecastDemand30d: 720, netRequirement: 240, plannedSupply: 300, coverageDays: 20, status: 'Warning' },
  { itemNo: 'IT-00215', name: 'Aluminium Sheet 3mm', currentStock: 310, forecastDemand30d: 500, netRequirement: 190, plannedSupply: 200, coverageDays: 18, status: 'Warning' },
  { itemNo: 'IT-00540', name: 'Circuit Breaker 20A', currentStock: 95, forecastDemand30d: 320, netRequirement: 225, plannedSupply: 250, coverageDays: 9, status: 'Critical' },
  { itemNo: 'IT-00178', name: 'Industrial Gasket', currentStock: 820, forecastDemand30d: 600, netRequirement: 0, plannedSupply: 0, coverageDays: 41, status: 'OK' },
  { itemNo: 'IT-00093', name: 'Hydraulic Seal Kit', currentStock: 140, forecastDemand30d: 220, netRequirement: 80, plannedSupply: 100, coverageDays: 19, status: 'Warning' },
  { itemNo: 'IT-00611', name: 'Conveyor Belt 500mm', currentStock: 30, forecastDemand30d: 40, netRequirement: 10, plannedSupply: 25, coverageDays: 22, status: 'OK' },
  { itemNo: 'IT-00044', name: 'Nylon Washer 8mm', currentStock: 5200, forecastDemand30d: 4000, netRequirement: 0, plannedSupply: 0, coverageDays: 39, status: 'OK' },
  { itemNo: 'IT-00302', name: 'Bolt M12x50', currentStock: 8100, forecastDemand30d: 6000, netRequirement: 0, plannedSupply: 0, coverageDays: 40, status: 'OK' },
  { itemNo: 'IT-00519', name: 'PVC Fitting 50mm', currentStock: 180, forecastDemand30d: 560, netRequirement: 380, plannedSupply: 400, coverageDays: 10, status: 'Warning' },
  { itemNo: 'IT-00073', name: 'Steel Rod 8mm', currentStock: 640, forecastDemand30d: 480, netRequirement: 0, plannedSupply: 0, coverageDays: 40, status: 'OK' },
  { itemNo: 'IT-00448', name: 'Copper Cable 6mm²', currentStock: 70, forecastDemand30d: 290, netRequirement: 220, plannedSupply: 240, coverageDays: 7, status: 'Critical' },
  { itemNo: 'IT-00185', name: 'Rubber Seal Ring', currentStock: 1100, forecastDemand30d: 900, netRequirement: 0, plannedSupply: 0, coverageDays: 37, status: 'OK' },
  { itemNo: 'IT-00367', name: 'Stainless Flange DN80', currentStock: 55, forecastDemand30d: 140, netRequirement: 85, plannedSupply: 100, coverageDays: 12, status: 'Warning' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusChip(status: ItemStatus) {
  const map = {
    Critical: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
    Warning: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    OK: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  }
  return map[status]
}

function actionBadge(type: ActionType) {
  const map = {
    Increase: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
    Decrease: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    Cancel: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
    New: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  }
  return map[type]
}

function priorityDot(priority: Priority) {
  if (priority === 'High') return '#f87171'
  if (priority === 'Medium') return '#fbbf24'
  return '#4ade80'
}

// ── SVG Chart constants ───────────────────────────────────────────────────────
const CHART_W = 520
const CHART_H = 360
const PAD_L = 52
const PAD_R = 16
const PAD_T = 20
const PAD_B = 40
const innerW = CHART_W - PAD_L - PAD_R
const innerH = CHART_H - PAD_T - PAD_B
const months = chartData.length
const groupW = innerW / months
const BAR_W = (groupW * 0.38)
const yTicks = [0, 1000, 2000, 3000, 4000]

function yPos(val: number) {
  return PAD_T + innerH - (val / maxChartValue) * innerH
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DemandPlanningPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#0f0f1a', color: '#e2e8f0', fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <TopBar
        title="Demand Planning"
        breadcrumb={[{ label: 'Supply Chain', href: '/supply-chain' }]}
      />

      <main style={{ padding: '20px 24px' }}>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
          {kpis.map(k => (
            <div key={k.label} style={{
              background: '#16213e',
              border: '1px solid rgba(63,63,70,0.5)',
              borderRadius: 8,
              padding: '12px 14px',
            }}>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{k.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: 11, marginTop: 4, color: k.up ? '#4ade80' : '#f87171' }}>{k.delta}</p>
            </div>
          ))}
        </div>

        {/* 3-panel layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: 16, marginBottom: 20 }}>

          {/* Left panel — Forecast config */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 8, padding: '16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Models */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 10 }}>Forecast Models</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {forecastModels.map(m => (
                  <div key={m.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: 6,
                    background: m.active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: m.active ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(63,63,70,0.4)',
                    cursor: 'default',
                  }}>
                    <span style={{ fontSize: 12, color: m.active ? '#c7d2fe' : '#64748b' }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: m.active ? '#818cf8' : '#4b5563', fontWeight: 600 }}>{m.accuracy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time horizon */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 10 }}>Time Horizon</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(['Weekly', 'Monthly', 'Quarterly'] as const).map((h, i) => (
                  <div key={h} style={{
                    padding: '7px 10px',
                    borderRadius: 6,
                    background: i === 1 ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: i === 1 ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(63,63,70,0.4)',
                    fontSize: 12,
                    color: i === 1 ? '#c7d2fe' : '#64748b',
                    cursor: 'default',
                  }}>
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 10 }}>Filter by Category</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['All Categories', 'Raw Materials', 'Electrical', 'Mechanical', 'Hydraulics'].map((cat, i) => (
                  <div key={cat} style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: i === 0 ? 'rgba(99,102,241,0.12)' : 'transparent',
                    border: i === 0 ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    fontSize: 12,
                    color: i === 0 ? '#a5b4fc' : '#4b5563',
                    cursor: 'default',
                  }}>
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center — SVG Grouped Bar Chart */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 8, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Forecast vs Actual Demand — Top 5 Items (Units)</p>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(99,102,241,0.85)', display: 'inline-block' }} />
                  <span style={{ color: '#94a3b8' }}>Forecast</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(34,197,94,0.75)', display: 'inline-block' }} />
                  <span style={{ color: '#94a3b8' }}>Actual</span>
                </span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              width="100%"
              style={{ display: 'block', overflow: 'visible' }}
            >
              {/* Y-axis grid lines + labels */}
              {yTicks.map(tick => {
                const y = yPos(tick)
                return (
                  <g key={tick}>
                    <line
                      x1={PAD_L} y1={y}
                      x2={CHART_W - PAD_R} y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                    <text
                      x={PAD_L - 6}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#4b5563"
                    >
                      {tick === 0 ? '0' : `${tick / 1000}k`}
                    </text>
                  </g>
                )
              })}

              {/* Bars */}
              {chartData.map((d, i) => {
                const groupX = PAD_L + i * groupW
                const fH = (d.forecast / maxChartValue) * innerH
                const aH = d.actual > 0 ? (d.actual / maxChartValue) * innerH : 0
                const fX = groupX + (groupW - BAR_W * 2 - 3) / 2
                const aX = fX + BAR_W + 3

                return (
                  <g key={d.month}>
                    {/* Forecast bar */}
                    <rect
                      x={fX}
                      y={PAD_T + innerH - fH}
                      width={BAR_W}
                      height={fH}
                      rx="2"
                      fill="rgba(99,102,241,0.85)"
                    />
                    {/* Actual bar */}
                    {d.actual > 0 && (
                      <rect
                        x={aX}
                        y={PAD_T + innerH - aH}
                        width={BAR_W}
                        height={aH}
                        rx="2"
                        fill="rgba(34,197,94,0.75)"
                      />
                    )}
                    {/* Forecast value label */}
                    <text
                      x={fX + BAR_W / 2}
                      y={PAD_T + innerH - fH - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#818cf8"
                    >
                      {(d.forecast / 1000).toFixed(1)}k
                    </text>
                    {/* Actual value label */}
                    {d.actual > 0 && (
                      <text
                        x={aX + BAR_W / 2}
                        y={PAD_T + innerH - aH - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#4ade80"
                      >
                        {(d.actual / 1000).toFixed(1)}k
                      </text>
                    )}
                    {/* X-axis month label */}
                    <text
                      x={groupX + groupW / 2}
                      y={CHART_H - PAD_B + 16}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                    >
                      {d.month}
                    </text>
                  </g>
                )
              })}

              {/* X-axis baseline */}
              <line
                x1={PAD_L} y1={PAD_T + innerH}
                x2={CHART_W - PAD_R} y2={PAD_T + innerH}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Right panel — Action Messages */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Action Messages</p>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>12 items requiring review</p>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 400, padding: '8px 0' }}>
              {actionMessages.map((msg, i) => {
                const ab = actionBadge(msg.type)
                return (
                  <div key={i} style={{
                    padding: '9px 14px',
                    borderBottom: i < actionMessages.length - 1 ? '1px solid rgba(63,63,70,0.25)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: ab.bg,
                        color: ab.text,
                        border: `1px solid ${ab.border}`,
                        borderRadius: 4,
                        padding: '1px 6px',
                      }}>
                        {msg.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 10, color: '#4b5563' }}>{msg.dueDate}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 2 }}>{msg.item}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{msg.qtyChange}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4b5563' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: priorityDot(msg.priority), display: 'inline-block' }} />
                        {msg.priority}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Demand vs Supply table */}
        <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Demand vs Supply — All Items</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(15,15,26,0.6)' }}>
                  {['Item No', 'Item Name', 'Current Stock', 'Forecast 30d', 'Net Requirement', 'Planned Supply', 'Coverage Days', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demandSupplyTable.map((row, i) => {
                  const chip = statusChip(row.status)
                  return (
                    <tr key={row.itemNo} style={{
                      borderTop: '1px solid rgba(63,63,70,0.35)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    }}>
                      <td style={{ padding: '8px 12px', color: '#818cf8', fontFamily: 'monospace' }}>{row.itemNo}</td>
                      <td style={{ padding: '8px 12px', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{row.name}</td>
                      <td style={{ padding: '8px 12px', color: '#94a3b8', textAlign: 'right' }}>{row.currentStock.toLocaleString()}</td>
                      <td style={{ padding: '8px 12px', color: '#94a3b8', textAlign: 'right' }}>{row.forecastDemand30d.toLocaleString()}</td>
                      <td style={{ padding: '8px 12px', color: row.netRequirement > 0 ? '#fbbf24' : '#4ade80', textAlign: 'right', fontWeight: 600 }}>
                        {row.netRequirement > 0 ? row.netRequirement.toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#94a3b8', textAlign: 'right' }}>
                        {row.plannedSupply > 0 ? row.plannedSupply.toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', color: row.coverageDays <= 10 ? '#f87171' : '#94a3b8', textAlign: 'right', fontWeight: row.coverageDays <= 10 ? 700 : 400 }}>
                        {row.coverageDays}d
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          background: chip.bg,
                          color: chip.text,
                          border: `1px solid ${chip.border}`,
                          borderRadius: 4,
                          padding: '2px 7px',
                          fontSize: 11,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}
