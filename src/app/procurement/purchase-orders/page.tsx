'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Draft:      { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  Confirmed:  { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  Partial:    { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  Received:   { bg: 'rgba(20,184,166,0.15)',  text: '#2dd4bf', border: 'rgba(20,184,166,0.3)' },
  Invoiced:   { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  Cancelled:  { bg: 'rgba(239,68,68,0.15)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
}

const SEED_DATA = [
  { id:'PO-2026-1201', vendor:'Acme Office Supplies',    orderDate:'Apr 1',  delivDate:'Apr 15', amount:4230.00,    recv:100, status:'Invoiced',   buyer:'Mike Johnson'  },
  { id:'PO-2026-1202', vendor:'Fabrikam Electronics',    orderDate:'Apr 3',  delivDate:'Apr 20', amount:18750.00,   recv:65,  status:'Partial',    buyer:'Sarah Chen'    },
  { id:'PO-2026-1203', vendor:'City Power & Light',      orderDate:'Apr 5',  delivDate:'Apr 30', amount:2100.00,    recv:0,   status:'Confirmed',  buyer:'Mike Johnson'  },
  { id:'PO-2026-1204', vendor:'Contoso Supplies',        orderDate:'Apr 6',  delivDate:'Apr 18', amount:47200.00,   recv:100, status:'Received',   buyer:'Alice Brown'   },
  { id:'PO-2026-1205', vendor:'Adatum Manufacturing',    orderDate:'Apr 8',  delivDate:'Apr 25', amount:125000.00,  recv:0,   status:'Draft',      buyer:'Carlos Mendez' },
  { id:'PO-2026-1206', vendor:'Northwind Traders',       orderDate:'Apr 9',  delivDate:'Apr 22', amount:8400.00,    recv:80,  status:'Partial',    buyer:'Sarah Chen'    },
  { id:'PO-2026-1207', vendor:'Tailspin Toys',           orderDate:'Apr 10', delivDate:'Apr 28', amount:3600.00,    recv:0,   status:'Confirmed',  buyer:'Alice Brown'   },
  { id:'PO-2026-1208', vendor:'Wide World Importers',    orderDate:'Apr 10', delivDate:'May 5',  amount:92000.00,   recv:0,   status:'Draft',      buyer:'Carlos Mendez' },
  { id:'PO-2026-1209', vendor:'Lucerne Publishing',      orderDate:'Apr 11', delivDate:'Apr 24', amount:1250.00,    recv:100, status:'Invoiced',   buyer:'Mike Johnson'  },
  { id:'PO-2026-1210', vendor:'School of Fine Art',      orderDate:'Apr 12', delivDate:'Apr 26', amount:6700.00,    recv:50,  status:'Partial',    buyer:'Sarah Chen'    },
  { id:'PO-2026-1211', vendor:'Blue Yonder Airlines',    orderDate:'Apr 12', delivDate:'May 1',  amount:14500.00,   recv:0,   status:'Confirmed',  buyer:'Alice Brown'   },
  { id:'PO-2026-1212', vendor:'Trey Research',           orderDate:'Apr 13', delivDate:'Apr 27', amount:5900.00,    recv:100, status:'Received',   buyer:'Carlos Mendez' },
  { id:'PO-2026-1213', vendor:'Graphic Design Institute',orderDate:'Apr 14', delivDate:'Apr 29', amount:2800.00,    recv:0,   status:'Cancelled',  buyer:'Mike Johnson'  },
  { id:'PO-2026-1214', vendor:'Humongous Insurance',     orderDate:'Apr 14', delivDate:'May 3',  amount:38000.00,   recv:0,   status:'Draft',      buyer:'Sarah Chen'    },
  { id:'PO-2026-1215', vendor:'Margie\'s Travel',        orderDate:'Apr 15', delivDate:'Apr 30', amount:7200.00,    recv:100, status:'Invoiced',   buyer:'Alice Brown'   },
  { id:'PO-2026-1216', vendor:'Wingtip Toys',            orderDate:'Apr 15', delivDate:'May 2',  amount:11300.00,   recv:35,  status:'Partial',    buyer:'Carlos Mendez' },
  { id:'PO-2026-1217', vendor:'Alpine Ski House',        orderDate:'Apr 16', delivDate:'May 7',  amount:68000.00,   recv:0,   status:'Confirmed',  buyer:'Mike Johnson'  },
  { id:'PO-2026-1218', vendor:'Coho Winery',             orderDate:'Apr 16', delivDate:'May 4',  amount:4100.00,    recv:100, status:'Received',   buyer:'Sarah Chen'    },
  { id:'PO-2026-1219', vendor:'Fabrikam Electronics',    orderDate:'Apr 17', delivDate:'May 10', amount:31500.00,   recv:0,   status:'Draft',      buyer:'Alice Brown'   },
  { id:'PO-2026-1220', vendor:'Acme Office Supplies',    orderDate:'Apr 17', delivDate:'May 1',  amount:2900.00,    recv:100, status:'Invoiced',   buyer:'Carlos Mendez' },
  { id:'PO-2026-1221', vendor:'Fourth Coffee',           orderDate:'Apr 18', delivDate:'May 6',  amount:15800.00,   recv:0,   status:'Confirmed',  buyer:'Mike Johnson'  },
  { id:'PO-2026-1222', vendor:'Southridge Video',        orderDate:'Apr 18', delivDate:'May 8',  amount:9400.00,    recv:70,  status:'Partial',    buyer:'Sarah Chen'    },
  { id:'PO-2026-1223', vendor:'Contoso Supplies',        orderDate:'Apr 19', delivDate:'May 12', amount:54000.00,   recv:0,   status:'Draft',      buyer:'Alice Brown'   },
  { id:'PO-2026-1224', vendor:'City Power & Light',      orderDate:'Apr 20', delivDate:'May 15', amount:2100.00,    recv:0,   status:'Confirmed',  buyer:'Carlos Mendez' },
  { id:'PO-2026-1225', vendor:'Adventure Works',         orderDate:'Apr 21', delivDate:'May 9',  amount:76400.00,   recv:0,   status:'Draft',      buyer:'Mike Johnson'  },
]

const PO_LINES: Record<string, { line: number; item: string; desc: string; qtyOrd: number; qtyRecv: number; unitPrice: number; status: string }[]> = {
  'PO-2026-1201': [
    { line:1, item:'OFF-001', desc:'A4 Copy Paper (Box)',     qtyOrd:50, qtyRecv:50, unitPrice:28.50,  status:'Complete'  },
    { line:2, item:'OFF-042', desc:'Ballpoint Pens (Box 12)', qtyOrd:20, qtyRecv:20, unitPrice:8.99,   status:'Complete'  },
    { line:3, item:'OFF-118', desc:'Stapler Heavy Duty',      qtyOrd:10, qtyRecv:10, unitPrice:24.00,  status:'Complete'  },
    { line:4, item:'OFF-205', desc:'Manila Folders (100pk)',  qtyOrd:30, qtyRecv:30, unitPrice:12.75,  status:'Complete'  },
  ],
  'PO-2026-1202': [
    { line:1, item:'ELEC-001',desc:'USB-C Hub 7-Port',        qtyOrd:50, qtyRecv:35, unitPrice:89.00,  status:'Partial'   },
    { line:2, item:'ELEC-022',desc:'Wireless Keyboard',       qtyOrd:30, qtyRecv:20, unitPrice:145.00, status:'Partial'   },
    { line:3, item:'ELEC-055',desc:'27" Monitor 4K',          qtyOrd:10, qtyRecv:5,  unitPrice:620.00, status:'Partial'   },
  ],
}

function StatusChip({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS['Draft']
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.02em' }}>
      {status}
    </span>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? '#4ade80' : pct > 0 ? '#fbbf24' : 'rgba(100,116,139,0.3)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: color, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState(SEED_DATA)
  const [filter, setFilter] = useState({ poNum: '', vendor: '', status: 'All', search: '' })
  const [sortCol, setSortCol] = useState<string>('id')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [drawerPO, setDrawerPO] = useState<string|null>(null)

  useEffect(() => {
    fetch('/api/procurement/purchase-orders')
      .then(r => r.json())
      .then(d => { if (d?.data) setOrders(d.data) })
      .catch(() => {})
  }, [])

  const filtered = orders.filter(o => {
    if (filter.poNum && !o.id.toLowerCase().includes(filter.poNum.toLowerCase())) return false
    if (filter.vendor && !o.vendor.toLowerCase().includes(filter.vendor.toLowerCase())) return false
    if (filter.status !== 'All' && o.status !== filter.status) return false
    if (filter.search && !o.id.toLowerCase().includes(filter.search.toLowerCase()) && !o.vendor.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let av: string|number = (a as any)[sortCol], bv: string|number = (b as any)[sortCol]
    if (sortDir === 'desc') [av, bv] = [bv, av]
    return av < bv ? -1 : av > bv ? 1 : 0
  })

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function toggleAll() {
    if (selected.size === sorted.length) setSelected(new Set())
    else setSelected(new Set(sorted.map(o => o.id)))
  }

  function toggleRow(id: string) {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const drawerData = SEED_DATA.find(o => o.id === drawerPO)
  const drawerLines = drawerPO ? (PO_LINES[drawerPO] ?? [
    { line:1, item:'ITEM-001', desc:'Standard Item A', qtyOrd:10, qtyRecv:0, unitPrice:50.00, status:'Open' },
    { line:2, item:'ITEM-002', desc:'Standard Item B', qtyOrd:5,  qtyRecv:0, unitPrice:120.00,status:'Open' },
  ]) : []

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ opacity: sortCol === col ? 1 : 0.3, marginLeft: 4, fontSize: 10 }}>
      {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  )

  const TH = ({ col, children, right }: { col: string; children: React.ReactNode; right?: boolean }) => (
    <th
      onClick={() => toggleSort(col)}
      style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', textAlign: right ? 'right' : 'left', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      {children}<SortIcon col={col} />
    </th>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Purchase Orders"
        breadcrumb={[{ label: 'Procurement', href: '/purchasing' }]}
        actions={
          <>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>New</button>
            {['Confirm','Receive','Invoice','Cancel'].map(a => (
              <button key={a} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>{a}</button>
            ))}
          </>
        }
      />

      {/* Filter bar */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        {[
          { key: 'poNum',  placeholder: 'PO #' },
          { key: 'vendor', placeholder: 'Vendor' },
          { key: 'search', placeholder: 'Search...' },
        ].map(f => (
          <input
            key={f.key}
            placeholder={f.placeholder}
            value={(filter as any)[f.key]}
            onChange={e => setFilter(p => ({ ...p, [f.key]: e.target.value }))}
            style={{ height: 32, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)', background: '#16213e', color: '#e2e8f0', fontSize: 12, width: 140, outline: 'none' }}
          />
        ))}
        <select
          value={filter.status}
          onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
          style={{ height: 32, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)', background: '#16213e', color: '#e2e8f0', fontSize: 12, cursor: 'pointer', outline: 'none' }}
        >
          {['All','Draft','Confirmed','Partial','Received','Invoiced','Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <input type="date" style={{ height: 32, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)', background: '#16213e', color: '#e2e8f0', fontSize: 12, outline: 'none' }} />
        <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', padding: '0 4px' }}>to</span>
        <input type="date" style={{ height: 32, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)', background: '#16213e', color: '#e2e8f0', fontSize: 12, outline: 'none' }} />
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, marginTop: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
              <tr>
                <th style={{ padding: '10px 12px', width: 36 }}>
                  <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0} onChange={toggleAll} style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                </th>
                <TH col="id">PO #</TH>
                <TH col="vendor">Vendor</TH>
                <TH col="orderDate">Order Date</TH>
                <TH col="delivDate">Delivery Date</TH>
                <TH col="amount" right>Amount</TH>
                <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Received%</th>
                <TH col="status">Status</TH>
                <TH col="buyer">Buyer</TH>
              </tr>
            </thead>
            <tbody>
              {sorted.map((o, i) => (
                <tr
                  key={o.id}
                  onClick={() => setDrawerPO(o.id)}
                  style={{ borderTop: '1px solid rgba(99,102,241,0.08)', cursor: 'pointer', background: selected.has(o.id) ? 'rgba(99,102,241,0.07)' : i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!selected.has(o.id)) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.05)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected.has(o.id) ? 'rgba(99,102,241,0.07)' : i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                >
                  <td style={{ padding: '10px 12px' }} onClick={e => { e.stopPropagation(); toggleRow(o.id) }}>
                    <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleRow(o.id)} style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#a5b4fc', fontWeight: 500 }}>{o.id}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{o.vendor}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>{o.orderDate}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>{o.delivDate}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${o.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '10px 12px', minWidth: 120 }}><ProgressBar pct={o.recv} /></td>
                  <td style={{ padding: '10px 12px' }}><StatusChip status={o.status} /></td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>{o.buyer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
          <span>Showing 1–{sorted.length} of 412 records</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,'...',17].map((p, i) => (
              <button key={i} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid rgba(99,102,241,0.2)', background: p === 1 ? 'rgba(99,102,241,0.2)' : 'transparent', color: p === 1 ? '#a5b4fc' : '#94a3b8', cursor: 'pointer', fontSize: 12 }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {drawerPO && drawerData && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setDrawerPO(null)} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 680, background: '#0f1230', borderLeft: '1px solid rgba(99,102,241,0.2)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#a5b4fc' }}>{drawerData.id}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{drawerData.vendor}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusChip status={drawerData.status} />
                <button onClick={() => setDrawerPO(null)} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid rgba(99,102,241,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>

            {/* PO Header fields */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                {[
                  ['Vendor',          drawerData.vendor],
                  ['Buyer',           drawerData.buyer],
                  ['Order Date',      drawerData.orderDate + ', 2026'],
                  ['Delivery Date',   drawerData.delivDate + ', 2026'],
                  ['Delivery Address','123 Main St, Seattle, WA 98101'],
                  ['Payment Terms',   'Net 30'],
                  ['Currency',        'USD'],
                  ['Total Amount',    '$' + drawerData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, color: '#e2e8f0' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* PO Lines */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Purchase Order Lines</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                    {['Line','Item','Description','Qty Ord','Qty Recv','Unit Price','Amount','Status'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === 'Unit Price' || h === 'Amount' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drawerLines.map(l => (
                    <tr key={l.line} style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                      <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{l.line}</td>
                      <td style={{ padding: '8px 10px', color: '#a5b4fc', fontWeight: 500 }}>{l.item}</td>
                      <td style={{ padding: '8px 10px' }}>{l.desc}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{l.qtyOrd}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{l.qtyRecv}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${l.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${(l.qtyOrd * l.unitPrice).toFixed(2)}</td>
                      <td style={{ padding: '8px 10px' }}><StatusChip status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ marginTop: 16, borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {[
                  ['Subtotal', drawerData.amount * 0.9],
                  ['Tax (10%)', drawerData.amount * 0.1],
                ].map(([label, val]) => (
                  <div key={label as string} style={{ display: 'flex', gap: 32, fontSize: 12 }}>
                    <span style={{ color: '#94a3b8' }}>{label}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 100, textAlign: 'right' }}>${(val as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 700, borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ color: '#e2e8f0' }}>Total</span>
                  <span style={{ color: '#a5b4fc', fontVariantNumeric: 'tabular-nums', minWidth: 100, textAlign: 'right' }}>${drawerData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
