export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'

// ── Static mock data ──────────────────────────────────────────────────────────

const kpis = [
  { label: 'Open Transfer Orders', value: '47', delta: '+3 today', up: true },
  { label: 'Planned Orders', value: '128', delta: '12 urgent', up: false },
  { label: 'Shipments Today', value: '23', delta: '19 on-time', up: true },
  { label: 'Coverage Alerts', value: '9', delta: '3 critical', up: false },
]

const navLinks = [
  { label: 'Master Planning', href: '/supply-chain/master-planning' },
  { label: 'Transfers', href: '/supply-chain/transfers' },
  { label: 'Voyages', href: '/supply-chain/voyages' },
  { label: 'Trade Agreements', href: '/supply-chain/trade-agreements' },
  { label: 'Asset Management', href: '/supply-chain/asset-management' },
  { label: 'Costing', href: '/supply-chain/costing' },
  { label: 'Landed Costs', href: '/supply-chain/landed-costs' },
  { label: 'Demand Planning', href: '/supply-chain/demand-planning' },
]

type CoverageStatus = 'Critical' | 'Warning' | 'OK'

const coverageExceptions: {
  itemNo: string
  name: string
  coverageDays: number
  status: CoverageStatus
  action: string
}[] = [
  { itemNo: 'IT-00421', name: 'Steel Rod 12mm', coverageDays: 2, status: 'Critical', action: 'Place emergency PO — 500 units' },
  { itemNo: 'IT-00087', name: 'Copper Wire 2.5mm', coverageDays: 4, status: 'Critical', action: 'Expedite transfer from WH-02' },
  { itemNo: 'IT-00332', name: 'PVC Pipe 50mm', coverageDays: 7, status: 'Warning', action: 'Review demand forecast' },
  { itemNo: 'IT-00215', name: 'Aluminium Sheet 3mm', coverageDays: 8, status: 'Warning', action: 'Consolidate open orders' },
  { itemNo: 'IT-00540', name: 'Circuit Breaker 20A', coverageDays: 9, status: 'Warning', action: 'Reorder point adjustment' },
  { itemNo: 'IT-00178', name: 'Industrial Gasket', coverageDays: 14, status: 'OK', action: 'No action required' },
  { itemNo: 'IT-00093', name: 'Hydraulic Seal Kit', coverageDays: 18, status: 'OK', action: 'No action required' },
  { itemNo: 'IT-00611', name: 'Conveyor Belt 500mm', coverageDays: 22, status: 'OK', action: 'No action required' },
]

const healthMetrics: { label: string; value: number; target: number }[] = [
  { label: 'On-Time Delivery', value: 94, target: 95 },
  { label: 'Fill Rate', value: 97, target: 98 },
  { label: 'Supplier OTD', value: 88, target: 92 },
  { label: 'Inventory Turns', value: 72, target: 80 },
  { label: 'Order Cycle Time', value: 81, target: 85 },
  { label: 'Safety Stock Coverage', value: 91, target: 90 },
]

const recentActivity = [
  { icon: '📦', description: 'Transfer Order TO-00482 shipped from WH-01 → WH-03', time: '2 min ago' },
  { icon: '⚠️', description: 'Coverage alert raised for IT-00421 (Steel Rod 12mm)', time: '8 min ago' },
  { icon: '✅', description: 'Purchase Order PO-00931 received — 1,200 units IT-00087', time: '15 min ago' },
  { icon: '📋', description: 'Master plan run completed — 128 planned orders generated', time: '34 min ago' },
  { icon: '🚢', description: 'Voyage V-00211 departed Port of LA — ETA 14 days', time: '1 hr ago' },
  { icon: '🔄', description: 'Trade agreement TA-00045 renewed — Supplier AluTech Inc.', time: '2 hr ago' },
  { icon: '📉', description: 'Demand drop detected for IT-00540 — forecast revised −18%', time: '3 hr ago' },
  { icon: '✅', description: 'Transfer Order TO-00479 confirmed — 300 units IT-00215', time: '4 hr ago' },
  { icon: '⚠️', description: 'Supplier LATAM Metals flagged 5-day delay on PO-00928', time: '5 hr ago' },
  { icon: '📦', description: 'Shipment SH-00317 delivered to customer — 42 line items', time: '6 hr ago' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(status: CoverageStatus) {
  if (status === 'Critical') return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' }
  if (status === 'Warning') return { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' }
  return { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' }
}

function barColor(value: number, target: number) {
  if (value >= target) return 'rgba(99,102,241,0.85)'
  if (value >= target - 8) return 'rgba(245,158,11,0.85)'
  return 'rgba(239,68,68,0.85)'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SupplyChainPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#0f0f1a', color: '#e2e8f0', fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <TopBar title="Supply Chain" />

      <div style={{ display: 'flex', height: 'calc(100dvh - 48px)' }}>

        {/* ── Left Nav ── */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          background: '#0d0e1f',
          borderRight: '1px solid rgba(99,102,241,0.12)',
          padding: '16px 0',
          overflowY: 'auto',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#6366f1', padding: '0 16px 8px', textTransform: 'uppercase' }}>
            Supply Chain
          </p>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'block',
                padding: '8px 16px',
                fontSize: 13,
                color: '#94a3b8',
                textDecoration: 'none',
                borderLeft: '2px solid transparent',
                transition: 'color 0.15s',
              }}
              className="hover:text-zinc-100 hover:border-l-indigo-500"
            >
              {link.label}
            </Link>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* KPI tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {kpis.map(k => (
              <div key={k.label} style={{
                background: '#16213e',
                border: '1px solid rgba(63,63,70,0.5)',
                borderRadius: 8,
                padding: '14px 16px',
              }}>
                <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{k.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>{k.value}</p>
                <p style={{ fontSize: 11, marginTop: 4, color: k.up ? '#4ade80' : '#f87171' }}>{k.delta}</p>
              </div>
            ))}
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

            {/* Coverage Exceptions */}
            <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Coverage Exceptions</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(15,15,26,0.6)' }}>
                      {['Item No', 'Name', 'Days', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coverageExceptions.map((row, i) => {
                      const c = statusColor(row.status)
                      return (
                        <tr key={row.itemNo} style={{ borderTop: '1px solid rgba(63,63,70,0.35)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                          <td style={{ padding: '8px 12px', color: '#818cf8', fontFamily: 'monospace' }}>{row.itemNo}</td>
                          <td style={{ padding: '8px 12px', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{row.name}</td>
                          <td style={{ padding: '8px 12px', color: row.coverageDays <= 5 ? '#f87171' : '#e2e8f0', fontWeight: row.coverageDays <= 5 ? 700 : 400 }}>{row.coverageDays}d</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 600 }}>
                              {row.status}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.action}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supply Chain Health — SVG bar chart */}
            <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 8, padding: '16px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>Supply Chain Health</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {healthMetrics.map(m => (
                  <div key={m.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{m.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.value >= m.target ? '#4ade80' : '#fbbf24' }}>
                        {m.value}% <span style={{ color: '#4b5563', fontWeight: 400 }}>/ {m.target}%</span>
                      </span>
                    </div>
                    <svg width="100%" height="8" style={{ display: 'block', borderRadius: 4, overflow: 'visible' }}>
                      <rect x="0" y="0" width="100%" height="8" rx="4" fill="rgba(255,255,255,0.06)" />
                      <rect x="0" y="0" width={`${m.value}%`} height="8" rx="4" fill={barColor(m.value, m.target)} />
                      {/* Target marker */}
                      <line
                        x1={`${m.target}%`} y1="-2"
                        x2={`${m.target}%`} y2="10"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1.5"
                        strokeDasharray="2,2"
                      />
                    </svg>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: '#4b5563', marginTop: 14 }}>Dashed line = target threshold</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: '#16213e', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Recent Activity</p>
            </div>
            <div style={{ padding: '8px 0' }}>
              {recentActivity.map((ev, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 16px',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(63,63,70,0.25)' : 'none',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{ev.icon}</span>
                  <span style={{ fontSize: 12, color: '#cbd5e1', flex: 1 }}>{ev.description}</span>
                  <span style={{ fontSize: 11, color: '#4b5563', whiteSpace: 'nowrap' }}>{ev.time}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
