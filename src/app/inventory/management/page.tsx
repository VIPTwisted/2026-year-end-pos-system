'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; row?: string }> = {
  'In Stock':     { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80', border: 'rgba(34,197,94,0.3)',  row: 'transparent' },
  'Low Stock':    { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)', row: 'rgba(245,158,11,0.04)' },
  'Out of Stock': { bg: 'rgba(239,68,68,0.15)',  text: '#f87171', border: 'rgba(239,68,68,0.3)',  row: 'rgba(239,68,68,0.06)' },
}

const ITEMS_DATA = [
  { no:'1000', desc:'Widget Assembly A100',  cat:'Finished Goods',  uom:'EA', onHand:450,    avail:320,  reorder:100,  cost:24.50,   status:'In Stock'     },
  { no:'1001', desc:'Motor Housing B200',    cat:'Components',      uom:'EA', onHand:28,     avail:28,   reorder:50,   cost:89.00,   status:'Low Stock'    },
  { no:'1002', desc:'Control Panel C300',    cat:'Components',      uom:'EA', onHand:0,      avail:0,    reorder:25,   cost:145.00,  status:'Out of Stock' },
  { no:'1003', desc:'Drive Unit D400',       cat:'Components',      uom:'EA', onHand:75,     avail:60,   reorder:30,   cost:210.00,  status:'In Stock'     },
  { no:'1004', desc:'Standard Bolt M8',      cat:'Raw Materials',   uom:'EA', onHand:12400,  avail:12400,reorder:5000, cost:0.12,    status:'In Stock'     },
  { no:'1005', desc:'PCB Main Controller',   cat:'Components',      uom:'EA', onHand:14,     avail:14,   reorder:20,   cost:320.00,  status:'Low Stock'    },
  { no:'1006', desc:'Aluminum Frame 6061',   cat:'Raw Materials',   uom:'KG', onHand:850,    avail:800,  reorder:200,  cost:3.45,    status:'In Stock'     },
  { no:'1007', desc:'Sealed Bearing 6205',   cat:'Components',      uom:'EA', onHand:0,      avail:0,    reorder:100,  cost:8.75,    status:'Out of Stock' },
  { no:'1008', desc:'Finished Sub-Assy E500',cat:'Finished Goods',  uom:'EA', onHand:220,    avail:200,  reorder:50,   cost:495.00,  status:'In Stock'     },
  { no:'1009', desc:'Copper Wire 12AWG',     cat:'Raw Materials',   uom:'M',  onHand:3200,   avail:3200, reorder:500,  cost:1.20,    status:'In Stock'     },
  { no:'1010', desc:'Power Supply 24V 10A',  cat:'Components',      uom:'EA', onHand:8,      avail:8,    reorder:15,   cost:185.00,  status:'Low Stock'    },
  { no:'1011', desc:'Touch Display 7"',      cat:'Components',      uom:'EA', onHand:0,      avail:0,    reorder:20,   cost:240.00,  status:'Out of Stock' },
  { no:'1012', desc:'Housing Seal Kit',      cat:'Components',      uom:'SET',onHand:95,     avail:85,   reorder:30,   cost:22.50,   status:'In Stock'     },
  { no:'1013', desc:'Stainless Screw M4x12', cat:'Raw Materials',   uom:'EA', onHand:45000,  avail:45000,reorder:10000,cost:0.04,    status:'In Stock'     },
  { no:'1014', desc:'Final Assembly F100',   cat:'Finished Goods',  uom:'EA', onHand:18,     avail:12,   reorder:25,   cost:1240.00, status:'Low Stock'    },
  { no:'1015', desc:'Proximity Sensor NPN',  cat:'Components',      uom:'EA', onHand:32,     avail:32,   reorder:10,   cost:45.00,   status:'In Stock'     },
  { no:'1016', desc:'Packaging Box L',       cat:'Packaging',       uom:'EA', onHand:600,    avail:600,  reorder:200,  cost:2.80,    status:'In Stock'     },
  { no:'1017', desc:'Battery Pack 48V',      cat:'Components',      uom:'EA', onHand:0,      avail:0,    reorder:15,   cost:380.00,  status:'Out of Stock' },
  { no:'1018', desc:'Thermal Paste 50g',     cat:'Consumables',     uom:'TUB',onHand:42,     avail:42,   reorder:20,   cost:14.50,   status:'In Stock'     },
  { no:'1019', desc:'Encoder Disc 500PPR',   cat:'Components',      uom:'EA', onHand:11,     avail:11,   reorder:15,   cost:67.00,   status:'Low Stock'    },
]

const WAREHOUSE_DATA = [
  { name:'Main',   inStock:680, low:18, reserved:95  },
  { name:'East',   inStock:410, low:9,  reserved:45  },
  { name:'West',   inStock:520, low:5,  reserved:62  },
  { name:'Retail', inStock:237, low:2,  reserved:28  },
]

const FAST_MOVERS = [
  { name:'Widget Assembly A100',  units:1240 },
  { name:'Standard Bolt M8',      units:980  },
  { name:'Finished Sub-Assy E500',units:870  },
  { name:'PCB Main Controller',   units:650  },
  { name:'Final Assembly F100',   units:540  },
  { name:'Drive Unit D400',       units:490  },
  { name:'Control Panel C300',    units:430  },
  { name:'Motor Housing B200',    units:380  },
  { name:'Proximity Sensor NPN',  units:340  },
  { name:'Sealed Bearing 6205',   units:310  },
]

const REORDER_ALERTS = [
  { no:'1002', name:'Control Panel C300',    status:'Out of Stock', qty:25  },
  { no:'1007', name:'Sealed Bearing 6205',   status:'Out of Stock', qty:100 },
  { no:'1011', name:'Touch Display 7"',      status:'Out of Stock', qty:20  },
  { no:'1017', name:'Battery Pack 48V',      status:'Out of Stock', qty:15  },
  { no:'1001', name:'Motor Housing B200',    status:'Low Stock',    qty:50  },
  { no:'1005', name:'PCB Main Controller',   status:'Low Stock',    qty:20  },
  { no:'1010', name:'Power Supply 24V 10A',  status:'Low Stock',    qty:15  },
  { no:'1019', name:'Encoder Disc 500PPR',   status:'Low Stock',    qty:15  },
]

function StatusChip({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS['In Stock']
  return <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>
}

const MAX_BAR = 1500

function StackedBar({ d }: { d: typeof WAREHOUSE_DATA[0] }) {
  const total = d.inStock + d.low + d.reserved
  const scale = MAX_BAR
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 44, fontSize: 11, color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>{d.name}</div>
      <div style={{ flex: 1, height: 20, display: 'flex', borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
        <div title={`In Stock: ${d.inStock}`} style={{ width: `${(d.inStock/scale)*100}%`, background: '#2dd4bf', minWidth: d.inStock > 0 ? 2 : 0 }} />
        <div title={`Low: ${d.low}`}          style={{ width: `${(d.low/scale)*100}%`,     background: '#fbbf24', minWidth: d.low > 0 ? 2 : 0 }} />
        <div title={`Reserved: ${d.reserved}`}style={{ width: `${(d.reserved/scale)*100}%`,background: '#6366f1', minWidth: d.reserved > 0 ? 2 : 0 }} />
      </div>
      <div style={{ fontSize: 11, color: '#64748b', minWidth: 36, textAlign: 'right' }}>{total}</div>
    </div>
  )
}

export default function InventoryManagementPage() {
  const [items, setItems] = useState(ITEMS_DATA)
  const [filter, setFilter] = useState({ itemNo: '', desc: '', cat: '', warehouse: '', status: 'All', search: '' })
  const [sortCol, setSortCol] = useState('no')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/inventory/management')
      .then(r => r.json())
      .then(d => { if (d?.data) setItems(d.data) })
      .catch(() => {})
  }, [])

  const filtered = items.filter(it => {
    if (filter.itemNo && !it.no.toLowerCase().includes(filter.itemNo.toLowerCase())) return false
    if (filter.desc   && !it.desc.toLowerCase().includes(filter.desc.toLowerCase())) return false
    if (filter.cat    && !it.cat.toLowerCase().includes(filter.cat.toLowerCase())) return false
    if (filter.status !== 'All' && it.status !== filter.status) return false
    if (filter.search && !it.no.toLowerCase().includes(filter.search.toLowerCase()) && !it.desc.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let av: any = (a as any)[sortCol], bv: any = (b as any)[sortCol]
    if (sortDir === 'desc') [av, bv] = [bv, av]
    return av < bv ? -1 : av > bv ? 1 : 0
  })

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ opacity: sortCol === col ? 1 : 0.3, marginLeft: 4, fontSize: 10 }}>{sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
  )

  const TH = ({ col, children, right }: { col: string; children: React.ReactNode; right?: boolean }) => (
    <th onClick={() => toggleSort(col)} style={{ padding: '9px 10px', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', textAlign: right ? 'right' : 'left', userSelect: 'none', whiteSpace: 'nowrap' }}>
      {children}<SortIcon col={col} />
    </th>
  )

  const maxFast = FAST_MOVERS[0].units

  const KPI_TILES = [
    { label: 'Total SKUs',      value: '2,847',  color: '#a5b4fc', accent: '' },
    { label: 'Low Stock Items', value: '34',     color: '#fbbf24', accent: 'rgba(245,158,11,0.1)' },
    { label: 'Out of Stock',    value: '8',      color: '#f87171', accent: 'rgba(239,68,68,0.1)'  },
    { label: 'Inventory Value', value: '$4.2M',  color: '#4ade80', accent: '' },
    { label: 'Turns YTD',       value: '6.8x',   color: '#2dd4bf', accent: '' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Inventory Management"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }]}
        actions={
          <>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>Inventory Adjustment</button>
            {['Transfer Order','Count Journal'].map(a => (
              <button key={a} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>{a}</button>
            ))}
          </>
        }
      />

      {/* KPI Strip */}
      <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {KPI_TILES.map(kpi => (
          <div key={kpi.label} style={{ background: kpi.accent || '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: kpi.color, fontVariantNumeric: 'tabular-nums' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div style={{ padding: '0 24px 32px', display: 'grid', gridTemplateColumns: '65% 35%', gap: 20 }}>

        {/* LEFT: filter + table */}
        <div>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {[
              { key:'itemNo', placeholder:'Item No.' },
              { key:'desc',   placeholder:'Description' },
              { key:'cat',    placeholder:'Category' },
              { key:'warehouse', placeholder:'Warehouse' },
              { key:'search', placeholder:'Search...' },
            ].map(f => (
              <input key={f.key} placeholder={f.placeholder} value={(filter as any)[f.key]}
                onChange={e => setFilter(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ height: 30, padding: '0 9px', borderRadius: 5, border: '1px solid rgba(99,102,241,0.2)', background: '#16213e', color: '#e2e8f0', fontSize: 12, width: 120, outline: 'none' }} />
            ))}
            <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
              style={{ height: 30, padding: '0 7px', borderRadius: 5, border: '1px solid rgba(99,102,241,0.2)', background: '#16213e', color: '#e2e8f0', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
              {['All','In Stock','Low Stock','Out of Stock'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
                <tr>
                  <th style={{ padding: '9px 10px', width: 32 }}>
                    <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0}
                      onChange={() => selected.size === sorted.length ? setSelected(new Set()) : setSelected(new Set(sorted.map(it => it.no)))}
                      style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                  </th>
                  <TH col="no">Item No.</TH>
                  <TH col="desc">Description</TH>
                  <TH col="cat">Category</TH>
                  <TH col="uom">UOM</TH>
                  <TH col="onHand" right>On Hand</TH>
                  <TH col="avail" right>Available</TH>
                  <TH col="reorder" right>Reorder Pt.</TH>
                  <TH col="cost" right>Unit Cost</TH>
                  <TH col="status">Status</TH>
                </tr>
              </thead>
              <tbody>
                {sorted.map((it, idx) => {
                  const sc = STATUS_COLORS[it.status]
                  return (
                    <tr key={it.no} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: sc?.row ?? 'transparent', transition: 'background 0.15s', cursor: 'default' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = '' }}>
                      <td style={{ padding: '8px 10px' }} onClick={e => { e.stopPropagation(); const s = new Set(selected); s.has(it.no) ? s.delete(it.no) : s.add(it.no); setSelected(s) }}>
                        <input type="checkbox" checked={selected.has(it.no)} readOnly style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#a5b4fc', fontWeight: 500 }}>{it.no}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12 }}>{it.desc}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#94a3b8' }}>{it.cat}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#94a3b8' }}>{it.uom}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{it.onHand.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{it.avail.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{it.reorder.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${it.cost.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px' }}><StatusChip status={it.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stock by Warehouse */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Stock by Warehouse</div>
            {/* Y-axis labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 4 }}>
              {[1500,1000,500,0].map(y => (
                <div key={y} style={{ display: 'flex', alignItems: 'center', gap: 6, height: y === 0 ? 0 : 20 }}>
                  <span style={{ fontSize: 9, color: '#475569', width: 28, textAlign: 'right', lineHeight: '1' }}>{y}</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.06)' }} />
                </div>
              ))}
            </div>
            {WAREHOUSE_DATA.map(w => <StackedBar key={w.name} d={w} />)}
            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              {[['#2dd4bf','In Stock'],['#fbbf24','Low Stock'],['#6366f1','Reserved']].map(([color,label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Fast-Moving */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Top 10 Fast-Moving Items</div>
            {FAST_MOVERS.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 3, background: i < 3 ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.1)', color: i < 3 ? '#a5b4fc' : '#6366f1', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#e2e8f0', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ width: `${(item.units/maxFast)*100}%`, height: '100%', borderRadius: 2, background: i < 3 ? '#6366f1' : 'rgba(99,102,241,0.5)' }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>{item.units}</div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>units/month sold</div>
          </div>

          {/* Reorder Alerts */}
          <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Reorder Alerts</div>
              <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>{REORDER_ALERTS.length}</span>
            </div>
            {REORDER_ALERTS.map(alert => {
              const isOut = alert.status === 'Out of Stock'
              return (
                <div key={alert.no} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                  <span style={{
                    background: isOut ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: isOut ? '#f87171' : '#fbbf24',
                    border: `1px solid ${isOut ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    borderRadius: 3, padding: '1px 5px', fontSize: 9, fontWeight: 700, flexShrink: 0
                  }}>{isOut ? 'OOS' : 'LOW'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.name}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Reorder qty: {alert.qty}</div>
                  </div>
                  <button style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer', flexShrink: 0 }}>Create PO</button>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
