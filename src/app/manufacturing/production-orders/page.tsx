'use client'

import { useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderRow {
  orderNo: string; itemNo: string; description: string
  qtyPlanned: number; qtyReported: number; status: string
  workCenter: string; startDate: string; endDate: string; route: string
}

const ALL_ORDERS: OrderRow[] = [
  { orderNo: 'P-2026-0440', itemNo: 'A100', description: 'Widget Assembly', qtyPlanned: 1000, qtyReported: 1000, status: 'Ended', workCenter: 'Assembly A', startDate: 'Apr 1', endDate: 'Apr 10', route: 'RT-001' },
  { orderNo: 'P-2026-0441', itemNo: 'A100', description: 'Widget Assembly', qtyPlanned: 500, qtyReported: 320, status: 'Started', workCenter: 'Assembly A', startDate: 'Apr 18', endDate: 'Apr 23', route: 'RT-001' },
  { orderNo: 'P-2026-0442', itemNo: 'B200', description: 'Motor Housing', qtyPlanned: 150, qtyReported: 150, status: 'Reported', workCenter: 'Mach 1', startDate: 'Apr 20', endDate: 'Apr 22', route: 'RT-002' },
  { orderNo: 'P-2026-0443', itemNo: 'C300', description: 'Control Panel', qtyPlanned: 200, qtyReported: 80, status: 'Released', workCenter: 'Assembly B', startDate: 'Apr 19', endDate: 'Apr 24', route: 'RT-003' },
  { orderNo: 'P-2026-0444', itemNo: 'D400', description: 'Drive Unit', qtyPlanned: 75, qtyReported: 0, status: 'Created', workCenter: 'Welding', startDate: 'Apr 25', endDate: 'Apr 27', route: 'RT-004' },
  { orderNo: 'P-2026-0445', itemNo: 'E500', description: 'Frame Structure', qtyPlanned: 300, qtyReported: 295, status: 'Started', workCenter: 'Assembly A', startDate: 'Apr 18', endDate: 'Apr 23', route: 'RT-001' },
  { orderNo: 'P-2026-0446', itemNo: 'F600', description: 'Gear Assembly', qtyPlanned: 120, qtyReported: 60, status: 'Started', workCenter: 'Mach 2', startDate: 'Apr 20', endDate: 'Apr 24', route: 'RT-005' },
  { orderNo: 'P-2026-0447', itemNo: 'G700', description: 'Shaft Component', qtyPlanned: 400, qtyReported: 0, status: 'Created', workCenter: 'Welding', startDate: 'Apr 26', endDate: 'Apr 29', route: 'RT-004' },
  { orderNo: 'P-2026-0448', itemNo: 'H800', description: 'Housing Cover', qtyPlanned: 250, qtyReported: 250, status: 'Ended', workCenter: 'Paint Booth', startDate: 'Apr 15', endDate: 'Apr 22', route: 'RT-006' },
  { orderNo: 'P-2026-0449', itemNo: 'J900', description: 'Bearing Block', qtyPlanned: 180, qtyReported: 45, status: 'Released', workCenter: 'Mach 1', startDate: 'Apr 19', endDate: 'Apr 24', route: 'RT-002' },
  { orderNo: 'P-2026-0450', itemNo: 'K100', description: 'End Cap', qtyPlanned: 600, qtyReported: 420, status: 'Started', workCenter: 'Packaging', startDate: 'Apr 20', endDate: 'Apr 23', route: 'RT-007' },
  { orderNo: 'P-2026-0451', itemNo: 'L200', description: 'Valve Assembly', qtyPlanned: 90, qtyReported: 90, status: 'Reported', workCenter: 'Assembly B', startDate: 'Apr 17', endDate: 'Apr 21', route: 'RT-003' },
  { orderNo: 'P-2026-0452', itemNo: 'M300', description: 'Pump Housing', qtyPlanned: 50, qtyReported: 25, status: 'Released', workCenter: 'Mach 1', startDate: 'Apr 21', endDate: 'Apr 26', route: 'RT-002' },
  { orderNo: 'P-2026-0453', itemNo: 'N400', description: 'Flange Set', qtyPlanned: 800, qtyReported: 0, status: 'Created', workCenter: 'Welding', startDate: 'Apr 28', endDate: 'May 2', route: 'RT-004' },
  { orderNo: 'P-2026-0454', itemNo: 'P500', description: 'Cover Plate', qtyPlanned: 350, qtyReported: 350, status: 'Ended', workCenter: 'Paint Booth', startDate: 'Apr 10', endDate: 'Apr 18', route: 'RT-006' },
  { orderNo: 'P-2026-0455', itemNo: 'Q600', description: 'Actuator Body', qtyPlanned: 60, qtyReported: 30, status: 'Started', workCenter: 'Mach 2', startDate: 'Apr 22', endDate: 'Apr 25', route: 'RT-005' },
  { orderNo: 'P-2026-0456', itemNo: 'R700', description: 'Bracket Assembly', qtyPlanned: 1200, qtyReported: 600, status: 'Started', workCenter: 'Assembly A', startDate: 'Apr 19', endDate: 'Apr 26', route: 'RT-001' },
  { orderNo: 'P-2026-0457', itemNo: 'S800', description: 'Roller Unit', qtyPlanned: 100, qtyReported: 0, status: 'Released', workCenter: 'Packaging', startDate: 'Apr 24', endDate: 'Apr 28', route: 'RT-007' },
  { orderNo: 'P-2026-0458', itemNo: 'T900', description: 'Casing Shell', qtyPlanned: 200, qtyReported: 200, status: 'Reported', workCenter: 'Assembly B', startDate: 'Apr 14', endDate: 'Apr 20', route: 'RT-003' },
  { orderNo: 'P-2026-0459', itemNo: 'U100', description: 'Connector Block', qtyPlanned: 500, qtyReported: 0, status: 'Created', workCenter: 'Mach 2', startDate: 'Apr 30', endDate: 'May 5', route: 'RT-005' },
]

const BOM_COMPONENTS = [
  { item: 'STL-SHEET-4MM', qtyReq: 24, qtyIssued: 24 },
  { item: 'BOLT-M8x40', qtyReq: 120, qtyIssued: 120 },
  { item: 'SEAL-OR-25', qtyReq: 8, qtyIssued: 6 },
  { item: 'BEARING-6205', qtyReq: 4, qtyIssued: 4 },
]

const ROUTE_OPS = [
  { opNo: '10', workCenter: 'Assembly A', setupTime: '0.5 hr', runTime: '2.0 hr', opStatus: 'Ended' },
  { opNo: '20', workCenter: 'Machining 1', setupTime: '1.0 hr', runTime: '3.5 hr', opStatus: 'Started' },
  { opNo: '30', workCenter: 'Quality Control', setupTime: '0.25 hr', runTime: '1.0 hr', opStatus: 'Created' },
  { opNo: '40', workCenter: 'Packaging', setupTime: '0.25 hr', runTime: '0.5 hr', opStatus: 'Created' },
]

const STATUS_CHIP: Record<string, { bg: string; color: string; border: string }> = {
  Created:  { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  Released: { bg: 'rgba(249,115,22,0.12)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  Started:  { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  Reported: { bg: 'rgba(20,184,166,0.12)', color: '#2dd4bf', border: 'rgba(20,184,166,0.3)' },
  Ended:    { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
}

const WORK_CENTERS = ['All', 'Assembly A', 'Assembly B', 'Mach 1', 'Mach 2', 'Welding', 'Paint Booth', 'Packaging']
const STATUSES = ['All', 'Created', 'Released', 'Started', 'Reported', 'Ended']

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CHIP[status] ?? STATUS_CHIP['Created']
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: 9999,
      fontSize: 11, fontWeight: 500,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{status}</span>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ order, onClose }: { order: OrderRow; onClose: () => void }) {
  const cellStyle: React.CSSProperties = { padding: '6px 10px', fontSize: 12, borderBottom: '1px solid rgba(99,102,241,0.08)', color: '#e2e8f0' }
  const headStyle: React.CSSProperties = { padding: '6px 10px', fontSize: 11, color: '#94a3b8', fontWeight: 500, borderBottom: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.06)' }
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
      background: '#16213e', borderLeft: '1px solid rgba(99,102,241,0.2)',
      zIndex: 50, overflowY: 'auto', padding: 24,
      boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{order.orderNo}</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{order.description} · {order.itemNo}</p>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
          <X size={18} />
        </button>
      </div>

      {/* Header grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20,
        background: '#0d0e24', borderRadius: 8, padding: 14,
        border: '1px solid rgba(99,102,241,0.12)',
      }}>
        {[
          ['Status', <StatusBadge key="s" status={order.status} />],
          ['Work Center', order.workCenter],
          ['Qty Planned', order.qtyPlanned.toLocaleString()],
          ['Qty Reported', order.qtyReported.toLocaleString()],
          ['Start Date', order.startDate],
          ['End Date', order.endDate],
          ['Route', order.route],
          ['Item No.', order.itemNo],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: 13, color: '#e2e8f0' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* BOM Components */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 10 }}>BOM Components</h3>
      <div style={{ marginBottom: 20, overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headStyle}>Item</th>
              <th style={{ ...headStyle, textAlign: 'right' }}>Qty Required</th>
              <th style={{ ...headStyle, textAlign: 'right' }}>Qty Issued</th>
            </tr>
          </thead>
          <tbody>
            {BOM_COMPONENTS.map((b) => (
              <tr key={b.item}>
                <td style={cellStyle}>{b.item}</td>
                <td style={{ ...cellStyle, color: '#94a3b8', textAlign: 'right' }}>{b.qtyReq}</td>
                <td style={{ ...cellStyle, color: b.qtyIssued < b.qtyReq ? '#f87171' : '#4ade80', textAlign: 'right' }}>{b.qtyIssued}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Route Operations */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 10 }}>Route Operations</h3>
      <div style={{ overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headStyle}>Op #</th>
              <th style={headStyle}>Work Center</th>
              <th style={{ ...headStyle, textAlign: 'right' }}>Setup</th>
              <th style={{ ...headStyle, textAlign: 'right' }}>Run</th>
              <th style={headStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {ROUTE_OPS.map((op) => (
              <tr key={op.opNo}>
                <td style={{ ...cellStyle, color: '#6366f1', fontWeight: 500 }}>{op.opNo}</td>
                <td style={cellStyle}>{op.workCenter}</td>
                <td style={{ ...cellStyle, color: '#94a3b8', textAlign: 'right' }}>{op.setupTime}</td>
                <td style={{ ...cellStyle, color: '#94a3b8', textAlign: 'right' }}>{op.runTime}</td>
                <td style={cellStyle}><StatusBadge status={op.opStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductionOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>(ALL_ORDERS)
  const [filterOrderNo, setFilterOrderNo] = useState('')
  const [filterItem, setFilterItem] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterWC, setFilterWC] = useState('All')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectedRow, setSelectedRow] = useState<OrderRow | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const handleSearch = useCallback(() => {
    let filtered = ALL_ORDERS
    if (filterOrderNo) filtered = filtered.filter(o => o.orderNo.toLowerCase().includes(filterOrderNo.toLowerCase()))
    if (filterItem) filtered = filtered.filter(o => o.itemNo.toLowerCase().includes(filterItem.toLowerCase()) || o.description.toLowerCase().includes(filterItem.toLowerCase()))
    if (filterStatus !== 'All') filtered = filtered.filter(o => o.status === filterStatus)
    if (filterWC !== 'All') filtered = filtered.filter(o => o.workCenter === filterWC)
    setOrders(filtered)
    setPage(1)
  }, [filterOrderNo, filterItem, filterStatus, filterWC, filterFrom, filterTo])

  const toggleSelect = (orderNo: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(orderNo) ? next.delete(orderNo) : next.add(orderNo)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(prev => prev.size === orders.length ? new Set() : new Set(orders.map(o => o.orderNo)))
  }

  const totalPages = Math.ceil(orders.length / PAGE_SIZE)
  const pageOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const inputStyle: React.CSSProperties = {
    background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 6, color: '#e2e8f0', fontSize: 12, padding: '6px 10px', outline: 'none',
  }
  const card: React.CSSProperties = {
    background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10,
  }
  const thStyle: React.CSSProperties = {
    padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 500,
    fontSize: 11, borderBottom: '1px solid rgba(99,102,241,0.15)',
    whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
    background: 'rgba(99,102,241,0.04)',
  }
  const tdStyle: React.CSSProperties = {
    padding: '8px 10px', fontSize: 12, borderBottom: '1px solid rgba(99,102,241,0.07)',
    whiteSpace: 'nowrap',
  }

  const topBarActions = (
    <>
      <button style={{ background: 'rgba(99,102,241,0.9)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>New</button>
      {['Release', 'Start', 'Report as Finished', 'End'].map(lbl => (
        <button key={lbl} style={{ background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{lbl}</button>
      ))}
    </>
  )

  return (
    <div style={{ background: '#0d0e24', minHeight: '100dvh', color: '#e2e8f0' }}>
      <TopBar
        title="Production Orders"
        breadcrumb={[
          { label: 'Manufacturing', href: '/manufacturing' },
          { label: 'Production Orders', href: '/manufacturing/production-orders' },
        ]}
        actions={topBarActions}
      />

      <div style={{ padding: '20px 28px', maxWidth: 1600, margin: '0 auto' }}>

        {/* ── Filter Bar ── */}
        <div style={{
          ...card, padding: '14px 18px', marginBottom: 18,
          display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#64748b' }}>Order #</label>
            <input style={{ ...inputStyle, width: 130 }} value={filterOrderNo} onChange={e => setFilterOrderNo(e.target.value)} placeholder="P-2026-..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#64748b' }}>Item</label>
            <input style={{ ...inputStyle, width: 150 }} value={filterItem} onChange={e => setFilterItem(e.target.value)} placeholder="Item No. or Desc." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#64748b' }}>Status</label>
            <select style={{ ...inputStyle, width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#64748b' }}>Work Center</label>
            <select style={{ ...inputStyle, width: 140 }} value={filterWC} onChange={e => setFilterWC(e.target.value)}>
              {WORK_CENTERS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#64748b' }}>Date From</label>
            <input type="date" style={{ ...inputStyle, width: 140 }} value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#64748b' }}>Date To</label>
            <input type="date" style={{ ...inputStyle, width: 140 }} value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          </div>
          <button
            onClick={handleSearch}
            style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >Search</button>
          <button
            onClick={() => { setFilterOrderNo(''); setFilterItem(''); setFilterStatus('All'); setFilterWC('All'); setFilterFrom(''); setFilterTo(''); setOrders(ALL_ORDERS); setPage(1) }}
            style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}
          >Clear</button>
        </div>

        {/* ── Table ── */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 36 }}>
                    <input type="checkbox" checked={selected.size === orders.length && orders.length > 0}
                      onChange={toggleAll} style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                  </th>
                  {['Order #', 'Item No.', 'Description', 'Qty Planned', 'Qty Reported', 'Status', 'Work Center', 'Start Date', 'End Date', 'Route'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageOrders.map((o) => {
                  const isSelected = selected.has(o.orderNo)
                  const isActive = selectedRow?.orderNo === o.orderNo
                  return (
                    <tr key={o.orderNo}
                      onClick={() => setSelectedRow(isActive ? null : o)}
                      style={{
                        background: isActive ? 'rgba(99,102,241,0.12)' : isSelected ? 'rgba(99,102,241,0.06)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isActive && !isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(99,102,241,0.04)' }}
                      onMouseLeave={e => { if (!isActive && !isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td style={{ ...tdStyle, textAlign: 'center' }} onClick={e => { e.stopPropagation(); toggleSelect(o.orderNo) }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(o.orderNo)}
                          style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                      </td>
                      <td style={{ ...tdStyle, color: '#6366f1', fontWeight: 500 }}>{o.orderNo}</td>
                      <td style={{ ...tdStyle, color: '#94a3b8' }}>{o.itemNo}</td>
                      <td style={{ ...tdStyle, color: '#e2e8f0' }}>{o.description}</td>
                      <td style={{ ...tdStyle, color: '#94a3b8', textAlign: 'right' }}>{o.qtyPlanned.toLocaleString()}</td>
                      <td style={{ ...tdStyle, color: '#94a3b8', textAlign: 'right' }}>{o.qtyReported.toLocaleString()}</td>
                      <td style={tdStyle}><StatusBadge status={o.status} /></td>
                      <td style={{ ...tdStyle, color: '#94a3b8' }}>{o.workCenter}</td>
                      <td style={{ ...tdStyle, color: '#94a3b8' }}>{o.startDate}</td>
                      <td style={{ ...tdStyle, color: '#94a3b8' }}>{o.endDate}</td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{o.route}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid rgba(99,102,241,0.12)',
          }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, orders.length)} of 94 &nbsp;|&nbsp; Rows per page: {PAGE_SIZE}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 6, color: page === 1 ? '#475569' : '#e2e8f0',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                }}
              ><ChevronLeft size={14} /> Prev</button>
              <span style={{
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 6, color: '#818cf8', padding: '4px 12px', fontSize: 12, fontWeight: 600,
              }}>{page}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 6, color: page >= totalPages ? '#475569' : '#e2e8f0',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                }}
              >Next <ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {selectedRow && (
        <DetailDrawer order={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  )
}
