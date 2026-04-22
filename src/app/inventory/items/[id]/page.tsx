'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Item {
  id: string
  itemNo: string
  description: string
  itemGroup: string
  category: string
  status: string
  uom: string
  weight: number
  volume: number
  netWeight: number
  shelfLife: string
  costMethod: string
  standardCost: number
  lastDirectCost: number
  salesPrice: number
  margin: number
  onHand: number
  available: number
  onOrder: number
  preferredVendor: string
  leadTimeDays: number
  minOrderQty: number
  lastPurchasePrice: number
  lastVendor: string
  lastPoDate: string
  priceList: string
  reorderPoint: number
  safetyStock: number
  maxStock: number
  planningMethod: string
  reorderQty: number
  lotSize: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ITEM: Item = {
  id: '1000',
  itemNo: '1000',
  description: 'Widget Assembly A100',
  itemGroup: 'Finished Goods',
  category: 'Finished Goods',
  status: 'Active',
  uom: 'EA',
  weight: 1.2,
  volume: 0.5,
  netWeight: 1.0,
  shelfLife: 'N/A',
  costMethod: 'Standard',
  standardCost: 22.00,
  lastDirectCost: 21.84,
  salesPrice: 34.99,
  margin: 37.1,
  onHand: 450,
  available: 320,
  onOrder: 200,
  preferredVendor: 'V10001 Fabrikam Electronics',
  leadTimeDays: 14,
  minOrderQty: 10,
  lastPurchasePrice: 21.84,
  lastVendor: 'Fabrikam Electronics',
  lastPoDate: 'Apr 8',
  priceList: 'Retail Standard 2026',
  reorderPoint: 100,
  safetyStock: 50,
  maxStock: 600,
  planningMethod: 'Reorder Point',
  reorderQty: 300,
  lotSize: 100,
}

const LOCATION_INVENTORY = [
  { location: 'Main Warehouse', onHand: 280, available: 200, reserved: 80, onOrder: 200 },
  { location: 'East Warehouse', onHand: 120, available: 90, reserved: 30, onOrder: 0 },
  { location: 'Chicago Store', onHand: 50, available: 30, reserved: 20, onOrder: 0 },
]

const CUSTOMER_PRICES = [
  { group: 'Large Corp', price: 32.99 },
  { group: 'Mid Market', price: 33.99 },
  { group: 'Retail', price: 34.99 },
]

const QUALITY_ORDERS = [
  { orderNum: 'QO-2026-0041', date: 'Apr 18', type: 'Incoming Inspection', result: 'Passed', qty: 200 },
  { orderNum: 'QO-2026-0028', date: 'Mar 22', type: 'Production Sample', result: 'Passed', qty: 10 },
  { orderNum: 'QO-2026-0014', date: 'Feb 14', type: 'Incoming Inspection', result: 'Failed', qty: 50 },
]

const RECENT_TXNS = [
  { date: 'Apr 22', type: 'Sale', qty: -8, doc: 'SO-2026-4421' },
  { date: 'Apr 21', type: 'Adjustment', qty: +12, doc: 'ADJ-2026-0891' },
  { date: 'Apr 20', type: 'Sale', qty: -5, doc: 'SO-2026-4388' },
  { date: 'Apr 18', type: 'Purchase Receipt', qty: +200, doc: 'PO-2026-0418' },
  { date: 'Apr 17', type: 'Sale', qty: -3, doc: 'SO-2026-4350' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

function KV({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 13, color: highlight ? '#e2e8f0' : '#cbd5e1', fontWeight: highlight ? 600 : 400 }}>{value}</div>
    </div>
  )
}

function FastTab({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: '#0d0e24', borderRadius: 8, border: '1px solid rgba(99,102,241,0.1)', marginBottom: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
      >
        {title}
        <span style={{ fontSize: 10, color: '#94a3b8' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  )
}

// ─── Inventory Projection Chart ───────────────────────────────────────────────

function ProjectionChart({ item }: { item: Item }) {
  const days = 90
  const chartW = 560, chartH = 120
  const pad = { l: 40, r: 10, t: 10, b: 24 }
  const w = chartW - pad.l - pad.r
  const h = chartH - pad.t - pad.b

  // Simulate: start at onHand, deplete 2/day, reorder at reorderPoint, receive reorderQty after leadTime
  const series: number[] = []
  let qty = item.onHand
  let pendingReceipt = 0
  let daysUntilReceipt = -1

  for (let d = 0; d <= days; d++) {
    if (d > 0) {
      qty -= 2
      if (pendingReceipt > 0) daysUntilReceipt--
      if (daysUntilReceipt === 0) { qty += pendingReceipt; pendingReceipt = 0; daysUntilReceipt = -1 }
      if (qty <= item.reorderPoint && pendingReceipt === 0) {
        pendingReceipt = item.reorderQty
        daysUntilReceipt = item.leadTimeDays
      }
    }
    series.push(Math.max(0, qty))
  }

  const maxY = Math.max(...series, item.reorderPoint + 20)
  const xScale = (d: number) => pad.l + (d / days) * w
  const yScale = (v: number) => pad.t + h - (v / maxY) * h

  const pathD = series.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ')
  const areaD = `${pathD} L${xScale(days)},${(pad.t + h).toFixed(1)} L${xScale(0)},${(pad.t + h).toFixed(1)} Z`

  const rpY = yScale(item.reorderPoint)
  const ssY = yScale(item.safetyStock)

  const dayLabels = [0, 15, 30, 45, 60, 75, 90]

  return (
    <svg width={chartW} height={chartH} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(99,102,241,0.4)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.02)" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(l => {
        const y = pad.t + h - l * h
        const v = Math.round(l * maxY)
        return (
          <g key={l}>
            <line x1={pad.l} y1={y} x2={chartW - pad.r} y2={y} stroke="rgba(99,102,241,0.08)" strokeWidth={1} />
            <text x={pad.l - 4} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize={8}>{v}</text>
          </g>
        )
      })}
      {/* Reorder point line */}
      <line x1={pad.l} y1={rpY} x2={chartW - pad.r} y2={rpY} stroke="rgba(251,191,36,0.6)" strokeWidth={1} strokeDasharray="4,3" />
      <text x={chartW - pad.r + 2} y={rpY + 3} fill="#fbbf24" fontSize={8}>ROP</text>
      {/* Safety stock line */}
      <line x1={pad.l} y1={ssY} x2={chartW - pad.r} y2={ssY} stroke="rgba(239,68,68,0.5)" strokeWidth={1} strokeDasharray="3,3" />
      <text x={chartW - pad.r + 2} y={ssY + 3} fill="#f87171" fontSize={8}>SS</text>
      {/* Area + line */}
      <path d={areaD} fill="url(#projGrad)" />
      <path d={pathD} fill="none" stroke="rgba(99,102,241,0.8)" strokeWidth={1.5} />
      {/* X axis labels */}
      {dayLabels.map(d => (
        <text key={d} x={xScale(d)} y={pad.t + h + 14} textAnchor="middle" fill="#94a3b8" fontSize={8}>Day {d}</text>
      ))}
    </svg>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Item | null>(null)
  const [activeTab, setActiveTab] = useState('General')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/inventory/items/${params.id}`)
      .then(r => r.json())
      .catch(() => ({ item: MOCK_ITEM }))
      .then(d => { setItem(d.item ?? MOCK_ITEM); setLoading(false) })
  }, [params.id])

  const it = item ?? MOCK_ITEM

  const thStyle: React.CSSProperties = { padding: '8px 12px', color: '#94a3b8', fontSize: 11, fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(99,102,241,0.1)', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '9px 12px', fontSize: 12, color: '#e2e8f0', borderBottom: '1px solid rgba(99,102,241,0.06)' }

  const TABS = ['General', 'Purchase', 'Sales', 'Inventory', 'Planning', 'BOM', 'Quality']
  const margin = ((it.salesPrice - it.standardCost) / it.salesPrice * 100).toFixed(1)

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title={loading ? 'Item Detail' : it.description}
        breadcrumb={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Items', href: '/inventory/items' },
          { label: it.description, href: `/inventory/items/${params.id}` },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: 'rgba(99,102,241,0.85)', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
            {['Create PO', 'Check Inventory', 'Price', 'Statistics'].map(a => (
              <button key={a} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#a5b4fc', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>{a}</button>
            ))}
          </div>
        }
      />

      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          {/* Header FactBox */}
          <div style={{ background: '#16213e', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)', padding: 20, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', marginBottom: 2 }}>{it.itemNo}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{it.description}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{it.itemGroup}</div>
            </div>
            <div>
              <KV label="Standard Cost" value={fmt(it.standardCost)} />
              <KV label="Sales Price" value={fmt(it.salesPrice)} />
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Margin</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>{margin}%</div>
              </div>
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[['On Hand', it.onHand, '#e2e8f0'], ['Available', it.available, '#4ade80'], ['On Order', it.onOrder, '#a5b4fc']].map(([label, val, color]) => (
                  <div key={label as string} style={{ background: '#0d0e24', borderRadius: 6, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: color as string }}>{val}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>EA (Each)</div>
            </div>
          </div>

          {/* Tab Strip */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid rgba(99,102,241,0.12)', flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '8px 14px',
                  fontSize: 13, fontWeight: activeTab === t ? 600 : 400,
                  color: activeTab === t ? '#a5b4fc' : '#94a3b8',
                  borderBottom: activeTab === t ? '2px solid rgba(99,102,241,0.8)' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* General Tab */}
          {activeTab === 'General' && (
            <>
              <FastTab title="Item Information">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <KV label="Item No." value={it.itemNo} />
                    <KV label="Description" value={it.description} />
                    <KV label="Base UOM" value={it.uom} />
                  </div>
                  <div>
                    <KV label="Item Group" value={it.itemGroup} />
                    <KV label="Category" value={it.category} />
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                      <span style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{it.status}</span>
                    </div>
                  </div>
                </div>
              </FastTab>
              <FastTab title="Physical Dimensions">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  <KV label="Weight" value={`${it.weight} kg`} />
                  <KV label="Volume" value={`${it.volume} L`} />
                  <KV label="Net Weight" value={`${it.netWeight} kg`} />
                  <KV label="Shelf Life" value={it.shelfLife} />
                </div>
              </FastTab>
              <FastTab title="Costing">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  <KV label="Cost Method" value={it.costMethod} />
                  <KV label="Standard Cost" value={fmt(it.standardCost)} highlight />
                  <KV label="Last Direct Cost" value={fmt(it.lastDirectCost)} />
                </div>
              </FastTab>
            </>
          )}

          {/* Purchase Tab */}
          {activeTab === 'Purchase' && (
            <FastTab title="Purchase Information">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <KV label="Preferred Vendor" value={it.preferredVendor} />
                  <KV label="Lead Time" value={`${it.leadTimeDays} days`} />
                  <KV label="Min Order Qty" value={String(it.minOrderQty)} />
                </div>
                <div>
                  <KV label="Last Purchase Price" value={fmt(it.lastPurchasePrice)} />
                  <KV label="Last Vendor" value={it.lastVendor} />
                  <KV label="Last PO Date" value={it.lastPoDate} />
                </div>
              </div>
            </FastTab>
          )}

          {/* Sales Tab */}
          {activeTab === 'Sales' && (
            <>
              <FastTab title="Sales Pricing">
                <KV label="Base Sales Price" value={fmt(it.salesPrice)} highlight />
                <KV label="Price List" value={it.priceList} />
              </FastTab>
              <FastTab title="Customer Group Prices">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                      {['Customer Group', 'Price'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {CUSTOMER_PRICES.map(cp => (
                      <tr key={cp.group}>
                        <td style={tdStyle}>{cp.group}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#4ade80' }}>{fmt(cp.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </FastTab>
            </>
          )}

          {/* Inventory Tab */}
          {activeTab === 'Inventory' && (
            <>
              <FastTab title="Inventory by Location">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                      {['Location', 'On Hand', 'Available', 'Reserved', 'On Order'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {LOCATION_INVENTORY.map(row => (
                      <tr key={row.location}>
                        <td style={tdStyle}>{row.location}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{row.onHand}</td>
                        <td style={{ ...tdStyle, color: '#4ade80' }}>{row.available}</td>
                        <td style={{ ...tdStyle, color: '#fbbf24' }}>{row.reserved}</td>
                        <td style={{ ...tdStyle, color: '#a5b4fc' }}>{row.onOrder || '—'}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'rgba(99,102,241,0.06)', fontWeight: 700 }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#94a3b8' }}>Total</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{LOCATION_INVENTORY.reduce((s, r) => s + r.onHand, 0)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#4ade80' }}>{LOCATION_INVENTORY.reduce((s, r) => s + r.available, 0)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#fbbf24' }}>{LOCATION_INVENTORY.reduce((s, r) => s + r.reserved, 0)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#a5b4fc' }}>{LOCATION_INVENTORY.reduce((s, r) => s + r.onOrder, 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </FastTab>
              <FastTab title="Reorder Parameters">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[['Reorder Point', it.reorderPoint, '#fbbf24'], ['Safety Stock', it.safetyStock, '#f87171'], ['Max Stock', it.maxStock, '#4ade80']].map(([label, val, color]) => (
                    <div key={label as string} style={{ background: '#16213e', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: color as string }}>{val}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </FastTab>
            </>
          )}

          {/* Planning Tab */}
          {activeTab === 'Planning' && (
            <>
              <FastTab title="Planning Parameters">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <KV label="Planning Method" value={it.planningMethod} />
                    <KV label="Reorder Qty" value={String(it.reorderQty)} highlight />
                    <KV label="Lot Size" value={String(it.lotSize)} />
                  </div>
                  <div>
                    <KV label="Lead Time" value={`${it.leadTimeDays} days`} />
                    <KV label="Reorder Point" value={String(it.reorderPoint)} />
                    <KV label="Safety Stock" value={String(it.safetyStock)} />
                  </div>
                </div>
              </FastTab>
              <FastTab title="Inventory Projection — Next 90 Days">
                <div style={{ overflowX: 'auto' }}>
                  <ProjectionChart item={it} />
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 24, height: 2, background: 'rgba(99,102,241,0.8)' }} />On Hand
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 24, height: 2, background: 'rgba(251,191,36,0.6)', borderTop: '1px dashed rgba(251,191,36,0.6)' }} />Reorder Point
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 24, height: 2, background: 'rgba(239,68,68,0.5)', borderTop: '1px dashed rgba(239,68,68,0.5)' }} />Safety Stock
                  </span>
                </div>
              </FastTab>
            </>
          )}

          {/* BOM Tab */}
          {activeTab === 'BOM' && (
            <FastTab title="Bill of Materials">
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                  Bill of Materials for <strong style={{ color: '#e2e8f0' }}>{it.description}</strong> is managed in Manufacturing.
                </div>
                <a href="/manufacturing/bom" style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#a5b4fc', padding: '8px 18px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  Open BOM in Manufacturing
                </a>
              </div>
            </FastTab>
          )}

          {/* Quality Tab */}
          {activeTab === 'Quality' && (
            <FastTab title="Recent Quality Orders">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                    {['Order #', 'Date', 'Type', 'Qty', 'Result'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {QUALITY_ORDERS.map(qo => (
                    <tr key={qo.orderNum}>
                      <td style={{ ...tdStyle, color: '#a5b4fc', fontWeight: 600 }}>{qo.orderNum}</td>
                      <td style={tdStyle}>{qo.date}</td>
                      <td style={tdStyle}>{qo.type}</td>
                      <td style={tdStyle}>{qo.qty}</td>
                      <td style={tdStyle}>
                        <span style={{
                          background: qo.result === 'Passed' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: qo.result === 'Passed' ? '#4ade80' : '#f87171',
                          border: `1px solid ${qo.result === 'Passed' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                          borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                        }}>{qo.result}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </FastTab>
          )}
        </div>

        {/* FactBox Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#16213e', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)', padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Snapshot</div>
            {[
              { label: 'On Hand', value: `${it.onHand} EA`, color: '#e2e8f0' },
              { label: 'Available', value: `${it.available} EA`, color: '#4ade80' },
              { label: 'Reserved', value: `${it.onHand - it.available} EA`, color: '#fbbf24' },
              { label: 'On Order', value: `${it.onOrder} EA`, color: '#a5b4fc' },
              { label: 'Reorder Point', value: `${it.reorderPoint} EA`, color: '#94a3b8' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#16213e', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)', padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Transactions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RECENT_TXNS.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.qty > 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.6)', marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, color: '#e2e8f0' }}>{t.type} <span style={{ color: t.qty > 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>{t.qty > 0 ? `+${t.qty}` : t.qty}</span></div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{t.date} · {t.doc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
