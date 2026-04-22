'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const VENDOR_DATA = [
  { id:'V10000', name:'Acme Office Supplies',       group:'Office',        country:'US', currency:'USD', terms:'Net 30', balance:'$4,230.00',   hold:'',        lead:5   },
  { id:'V10001', name:'Fabrikam Electronics',       group:'Electronics',   country:'US', currency:'USD', terms:'Net 45', balance:'$18,750.00',  hold:'',        lead:14  },
  { id:'V10002', name:'City Power & Light',         group:'Utilities',     country:'US', currency:'USD', terms:'Net 15', balance:'$2,100.00',   hold:'',        lead:0   },
  { id:'V10003', name:'Contoso Supplies',           group:'Raw Materials', country:'US', currency:'USD', terms:'Net 30', balance:'$0.00',       hold:'',        lead:7   },
  { id:'V10004', name:'Deutsche Metals GmbH',       group:'Raw Materials', country:'DE', currency:'EUR', terms:'Net 60', balance:'€8,420.00',   hold:'',        lead:21  },
  { id:'V10005', name:'HSBC Leasing',               group:'Financial',     country:'GB', currency:'GBP', terms:'Net 30', balance:'£0.00',       hold:'All',     lead:0   },
  { id:'V10006', name:'Northwind Traders',          group:'Food & Bev',    country:'US', currency:'USD', terms:'Net 14', balance:'$1,350.00',   hold:'',        lead:3   },
  { id:'V10007', name:'Tailspin Toys',              group:'Consumer',      country:'US', currency:'USD', terms:'Net 30', balance:'$6,200.00',   hold:'Payment', lead:10  },
  { id:'V10008', name:'Wide World Importers',       group:'Import',        country:'US', currency:'USD', terms:'Net 45', balance:'$0.00',       hold:'',        lead:30  },
  { id:'V10009', name:'Lucerne Publishing',         group:'Media',         country:'CH', currency:'CHF', terms:'Net 30', balance:'CHF 890.00',  hold:'',        lead:14  },
  { id:'V10010', name:'Blue Yonder Airlines',       group:'Transport',     country:'US', currency:'USD', terms:'Net 15', balance:'$0.00',       hold:'',        lead:1   },
  { id:'V10011', name:'Trey Research',              group:'R&D',           country:'US', currency:'USD', terms:'Net 60', balance:'$3,100.00',   hold:'',        lead:21  },
  { id:'V10012', name:'Humongous Insurance',        group:'Insurance',     country:'US', currency:'USD', terms:'Net 30', balance:'$12,000.00',  hold:'Payment', lead:0   },
  { id:'V10013', name:'Margie\'s Travel',           group:'Services',      country:'US', currency:'USD', terms:'Net 30', balance:'$0.00',       hold:'',        lead:2   },
  { id:'V10014', name:'Alpine Ski House',           group:'Consumer',      country:'CH', currency:'CHF', terms:'Net 45', balance:'CHF 4,800.00',hold:'',        lead:28  },
  { id:'V10015', name:'Coho Winery',                group:'Food & Bev',    country:'US', currency:'USD', terms:'Net 30', balance:'$950.00',     hold:'',        lead:7   },
  { id:'V10016', name:'Fourth Coffee',              group:'Food & Bev',    country:'US', currency:'USD', terms:'Net 14', balance:'$2,200.00',   hold:'',        lead:2   },
  { id:'V10017', name:'Southridge Video',           group:'Media',         country:'US', currency:'USD', terms:'Net 30', balance:'$0.00',       hold:'',        lead:5   },
  { id:'V10018', name:'Adventure Works',            group:'Consumer',      country:'US', currency:'USD', terms:'Net 30', balance:'$45,000.00',  hold:'',        lead:14  },
  { id:'V10019', name:'Graphic Design Institute',  group:'Services',      country:'US', currency:'USD', terms:'Net 30', balance:'$0.00',       hold:'All',     lead:0   },
]

// Radar chart data
const RADAR_THIS  = [88, 92, 75, 84, 90]  // On-Time, Quality, Price, Comm, Invoice
const RADAR_LAST  = [82, 87, 78, 79, 85]
const RADAR_AXES  = ['On-Time Delivery','Quality Score','Price Competitiveness','Communication','Invoice Accuracy']
const N = RADAR_AXES.length

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function radarPath(values: number[], max: number, cx: number, cy: number, maxR: number) {
  return values.map((v, i) => {
    const angle = (360 / N) * i
    const r = (v / max) * maxR
    const { x, y } = polarToXY(angle, r, cx, cy)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ') + ' Z'
}

function RadarChart() {
  const cx = 160, cy = 150, maxR = 110, steps = [20,40,60,80,100]
  return (
    <svg width={320} height={300} viewBox="0 0 320 300">
      {/* Grid rings */}
      {steps.map(s => (
        <polygon key={s}
          points={Array.from({ length: N }, (_, i) => {
            const { x, y } = polarToXY((360/N)*i, (s/100)*maxR, cx, cy)
            return `${x.toFixed(1)},${y.toFixed(1)}`
          }).join(' ')}
          fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth={1}
        />
      ))}
      {/* Axes */}
      {RADAR_AXES.map((_, i) => {
        const { x, y } = polarToXY((360/N)*i, maxR, cx, cy)
        return <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke="rgba(99,102,241,0.15)" strokeWidth={1} />
      })}
      {/* Last year path */}
      <path d={radarPath(RADAR_LAST,100,cx,cy,maxR)} fill="rgba(148,163,184,0.08)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" />
      {/* This year path */}
      <path d={radarPath(RADAR_THIS,100,cx,cy,maxR)} fill="rgba(45,212,191,0.12)" stroke="#2dd4bf" strokeWidth={2} />
      {/* Axis labels */}
      {RADAR_AXES.map((label, i) => {
        const { x, y } = polarToXY((360/N)*i, maxR + 20, cx, cy)
        return (
          <text key={i} x={x.toFixed(1)} y={y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={9} fontFamily="system-ui">{label}</text>
        )
      })}
    </svg>
  )
}

function HoldChip({ hold }: { hold: string }) {
  if (!hold) return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
  const color = hold === 'All' ? { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' } : { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' }
  return <span style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{hold}</span>
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState(VENDOR_DATA)
  const [filter, setFilter] = useState({ num: '', name: '', group: '', country: '', hold: '', search: '' })
  const [sortCol, setSortCol] = useState('id')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/procurement/vendors')
      .then(r => r.json())
      .then(d => { if (d?.data) setVendors(d.data) })
      .catch(() => {})
  }, [])

  const filtered = vendors.filter(v => {
    if (filter.num    && !v.id.toLowerCase().includes(filter.num.toLowerCase())) return false
    if (filter.name   && !v.name.toLowerCase().includes(filter.name.toLowerCase())) return false
    if (filter.group  && !v.group.toLowerCase().includes(filter.group.toLowerCase())) return false
    if (filter.country&& v.country !== filter.country) return false
    if (filter.hold   && filter.hold !== 'All' && v.hold !== filter.hold) return false
    if (filter.search && !v.id.toLowerCase().includes(filter.search.toLowerCase()) && !v.name.toLowerCase().includes(filter.search.toLowerCase())) return false
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

  function toggleAll() {
    if (selected.size === sorted.length) setSelected(new Set())
    else setSelected(new Set(sorted.map(v => v.id)))
  }

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ opacity: sortCol === col ? 1 : 0.3, marginLeft: 4, fontSize: 10 }}>{sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
  )

  const TH = ({ col, children, right }: { col: string; children: React.ReactNode; right?: boolean }) => (
    <th onClick={() => toggleSort(col)} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', textAlign: right ? 'right' : 'left', userSelect: 'none', whiteSpace: 'nowrap' }}>
      {children}<SortIcon col={col} />
    </th>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Vendors"
        breadcrumb={[{ label: 'Procurement', href: '/purchasing' }]}
        actions={
          <>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>New</button>
            {['Transactions','Statistics'].map(a => (
              <button key={a} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>{a}</button>
            ))}
          </>
        }
      />

      {/* Filter bar */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        {[
          { key: 'num',    placeholder: 'Vendor No.' },
          { key: 'name',   placeholder: 'Name' },
          { key: 'group',  placeholder: 'Vendor Group' },
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
        <select value={filter.country} onChange={e => setFilter(p => ({ ...p, country: e.target.value }))}
          style={{ height: 32, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)', background: '#16213e', color: '#e2e8f0', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
          <option value="">All Countries</option>
          {['US','DE','GB','CH'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filter.hold} onChange={e => setFilter(p => ({ ...p, hold: e.target.value }))}
          style={{ height: 32, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)', background: '#16213e', color: '#e2e8f0', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
          <option value="">On Hold: Any</option>
          <option value="">Not on Hold</option>
          <option value="Payment">Payment Hold</option>
          <option value="All">All Hold</option>
        </select>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        {/* Table */}
        <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, marginTop: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
              <tr>
                <th style={{ padding: '10px 12px', width: 36 }}>
                  <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0} onChange={toggleAll} style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                </th>
                <TH col="id">Vendor No.</TH>
                <TH col="name">Name</TH>
                <TH col="group">Vendor Group</TH>
                <TH col="country">Country</TH>
                <TH col="currency">Currency</TH>
                <TH col="terms">Payment Terms</TH>
                <TH col="balance" right>Balance</TH>
                <TH col="hold">On Hold</TH>
                <TH col="lead" right>Lead Time (days)</TH>
              </tr>
            </thead>
            <tbody>
              {sorted.map((v, i) => (
                <tr
                  key={v.id}
                  onClick={() => window.location.href = `/procurement/vendors/${v.id}`}
                  style={{ borderTop: '1px solid rgba(99,102,241,0.08)', cursor: 'pointer', background: selected.has(v.id) ? 'rgba(99,102,241,0.07)' : i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!selected.has(v.id)) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.05)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected.has(v.id) ? 'rgba(99,102,241,0.07)' : i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                >
                  <td style={{ padding: '10px 12px' }} onClick={e => { e.stopPropagation(); const s = new Set(selected); s.has(v.id) ? s.delete(v.id) : s.add(v.id); setSelected(s) }}>
                    <input type="checkbox" checked={selected.has(v.id)} readOnly style={{ accentColor: '#6366f1', cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#a5b4fc', fontWeight: 500 }}>{v.id}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{v.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>{v.group}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>
                    <span style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', borderRadius: 3, padding: '1px 6px', fontSize: 11, fontWeight: 600 }}>{v.country}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>{v.currency}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>{v.terms}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v.balance}</td>
                  <td style={{ padding: '10px 12px' }}><HoldChip hold={v.hold} /></td>
                  <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', color: '#94a3b8' }}>{v.lead === 0 && !v.group.includes('Utilities') ? 'N/A' : v.lead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
          <span>Showing 1–{sorted.length} of 847 records</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,'...',43].map((p, i) => (
              <button key={i} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid rgba(99,102,241,0.2)', background: p === 1 ? 'rgba(99,102,241,0.2)' : 'transparent', color: p === 1 ? '#a5b4fc' : '#94a3b8', cursor: 'pointer', fontSize: 12 }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Vendor Performance */}
        <div style={{ marginTop: 32, border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, background: '#16213e', padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Vendor Performance</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Aggregate scorecard across active vendors — 5-axis performance radar</div>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            <RadarChart />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Legend</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 2, background: '#2dd4bf', borderRadius: 1 }} />
                    <span style={{ fontSize: 12, color: '#e2e8f0' }}>This Year (2026)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width={24} height={2}><line x1={0} y1={1} x2={24} y2={1} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" /></svg>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Last Year (2025)</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 20 }}>
                {RADAR_AXES.map((axis, i) => (
                  <div key={axis}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: '#94a3b8' }}>{axis}</span>
                      <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{RADAR_THIS[i]}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ width: `${RADAR_THIS[i]}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6366f1,#2dd4bf)' }} />
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
