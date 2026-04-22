'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const BG = '#0d0e24'
const CARD_BG = '#16213e'
const BORDER = 'rgba(99,102,241,0.15)'
const TEXT = '#e2e8f0'
const MUTED = '#94a3b8'
const CARD = { background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '10px' }

type Position = { id: string; title: string; dept: string; reportsTo: string; employee: string; fte: number; location: string; status: string; effectiveDate: string }
type Data = { total: number; positions: Position[] }

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Active: { bg: '#16a34a22', color: '#16a34a', border: '#16a34a44' },
    Open: { bg: '#d9770622', color: '#d97706', border: '#d9770644' },
    Closed: { bg: '#94a3b822', color: '#94a3b8', border: '#94a3b844' },
  }
  const s = map[status] ?? map.Closed
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{status}</span>
  )
}

function OrgChart() {
  // SVG hierarchical org chart — top 3 levels
  // CEO → VP Ops, CFO, VP Eng, VP Sales, VP Marketing, VP HR
  // VP Ops → Ops Analyst, Mfg Supervisor
  const BX = 130; const BY = 36; const GAP_X = 16; const GAP_Y = 56
  const COLS = 6
  const totalW = COLS * (BX + GAP_X) - GAP_X + 40
  const totalH = 3 * (BY + GAP_Y) - GAP_Y + 20

  const ceo = { x: totalW / 2 - BX / 2, y: 10, name: 'John Williams', title: 'CEO' }
  const vps = [
    { name: 'David Kim', title: 'VP Operations' },
    { name: 'Maria Santos', title: 'CFO' },
    { name: 'Ryan Patel', title: 'VP Engineering' },
    { name: 'Brian Mitchell', title: 'VP Sales' },
    { name: 'Diane Foster', title: 'VP Marketing' },
    { name: 'Camille Dubois', title: 'VP HR' },
  ].map((v, i) => ({ ...v, x: 20 + i * (BX + GAP_X), y: 10 + BY + GAP_Y }))

  const dirs = [
    { name: 'Tom Bradley', title: 'Ops Analyst', parent: 0 },
    { name: 'Lisa Park', title: 'Mfg Supervisor', parent: 0 },
    { name: 'Alice Chen', title: 'Finance Mgr', parent: 1 },
    { name: 'Grace Huang', title: 'Payroll Spec.', parent: 1 },
    { name: '', title: 'Sr. SWE (Open)', parent: 2 },
    { name: 'Marcus Torres', title: 'Sales Manager', parent: 3 },
    { name: '', title: 'Mktg Coord (Open)', parent: 4 },
    { name: 'Sandra Lee', title: 'HR Manager', parent: 5 },
  ].map((d, i) => {
    const pvp = vps[d.parent]
    const siblings = [0, 0, 1, 1, 2, 3, 4, 5].filter(p => p === d.parent)
    const idx = [0, 0, 1, 1, 2, 3, 4, 5].slice(0, i + 1).filter(p => p === d.parent).length - 1
    const spread = siblings.length > 1 ? (idx - (siblings.length - 1) / 2) * (BX + 8) : 0
    return { ...d, x: pvp.x + spread, y: pvp.y + BY + GAP_Y }
  })

  const boxStyle = (open: boolean) => ({
    fill: open ? 'rgba(217,119,6,0.08)' : CARD_BG,
    stroke: open ? 'rgba(217,119,6,0.4)' : 'rgba(99,102,241,0.3)',
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(totalW, 900)} height={totalH + 40} viewBox={`0 0 ${Math.max(totalW, 900)} ${totalH + 40}`} style={{ display: 'block' }}>
        {/* CEO box */}
        <rect x={ceo.x} y={ceo.y} width={BX} height={BY} rx={6} fill={CARD_BG} stroke="rgba(99,102,241,0.5)" strokeWidth={1.5} />
        <text x={ceo.x + BX / 2} y={ceo.y + 14} textAnchor="middle" fill={TEXT} fontSize={11} fontWeight={600}>{ceo.name}</text>
        <text x={ceo.x + BX / 2} y={ceo.y + 27} textAnchor="middle" fill={MUTED} fontSize={9.5}>{ceo.title}</text>

        {/* VP lines and boxes */}
        {vps.map((v, i) => (
          <g key={i}>
            <line x1={ceo.x + BX / 2} y1={ceo.y + BY} x2={v.x + BX / 2} y2={v.y} stroke="rgba(99,102,241,0.4)" strokeWidth={1} />
            <rect x={v.x} y={v.y} width={BX} height={BY} rx={6} fill={CARD_BG} stroke="rgba(99,102,241,0.3)" strokeWidth={1} />
            <text x={v.x + BX / 2} y={v.y + 14} textAnchor="middle" fill={TEXT} fontSize={10} fontWeight={500}>{v.name}</text>
            <text x={v.x + BX / 2} y={v.y + 27} textAnchor="middle" fill={MUTED} fontSize={8.5}>{v.title}</text>
          </g>
        ))}

        {/* Director lines and boxes */}
        {dirs.map((d, i) => {
          const pvp = vps[d.parent]
          const isOpen = !d.name
          const bs = boxStyle(isOpen)
          return (
            <g key={i}>
              <line x1={pvp.x + BX / 2} y1={pvp.y + BY} x2={d.x + BX / 2} y2={d.y} stroke="rgba(99,102,241,0.25)" strokeWidth={1} />
              <rect x={d.x} y={d.y} width={BX} height={BY} rx={5} fill={bs.fill} stroke={bs.stroke} strokeWidth={1} />
              <text x={d.x + BX / 2} y={d.y + 14} textAnchor="middle" fill={isOpen ? '#d97706' : TEXT} fontSize={9.5} fontWeight={isOpen ? 400 : 500} fontStyle={isOpen ? 'italic' : 'normal'}>{d.name || d.title}</text>
              {d.name && <text x={d.x + BX / 2} y={d.y + 26} textAnchor="middle" fill={MUTED} fontSize={8.5}>{d.title}</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

const COLS_DEF = ['', 'Position ID', 'Title', 'Department', 'Reports To', 'Employee', 'FTE', 'Location', 'Status', 'Effective Date']

export default function PositionsPage() {
  const [data, setData] = useState<Data | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [filters, setFilters] = useState({ position: '', dept: '', title: '', location: '', status: 'All', reportsTo: '', search: '' })

  useEffect(() => {
    fetch('/api/hr/positions').then(r => r.json()).then(setData)
  }, [])

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const toggleAll = () => {
    if (!data) return
    if (selected.size === data.positions.length) setSelected(new Set())
    else setSelected(new Set(data.positions.map(p => p.id)))
  }
  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(a => !a)
    else { setSortCol(col); setSortAsc(true) }
  }

  if (!data) return (
    <div style={{ minHeight: '100dvh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: MUTED, fontSize: 14 }}>Loading Positions...</div>
    </div>
  )

  const positions = [...data.positions].filter(p => {
    if (filters.status !== 'All' && p.status !== filters.status) return false
    if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase()) && !p.id.toLowerCase().includes(filters.search.toLowerCase()) && !p.employee.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.dept && !p.dept.toLowerCase().includes(filters.dept.toLowerCase())) return false
    return true
  })

  if (sortCol) {
    const key = sortCol as keyof Position
    positions.sort((a, b) => {
      const av = String(a[key] ?? ''); const bv = String(b[key] ?? '')
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }

  return (
    <div style={{ minHeight: '100dvh', background: BG, color: TEXT, fontFamily: 'Geist, Inter, system-ui, sans-serif' }}>
      <TopBar
        title="Positions"
        breadcrumb={[{ label: 'Human Resources', href: '/hr' }, { label: 'Positions', href: '/hr/positions' }]}
        actions={
          <>
            <button style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>New Position</button>
            <button style={{ padding: '6px 14px', borderRadius: 6, background: 'transparent', color: TEXT, border: `1px solid ${BORDER}`, fontSize: 12, cursor: 'pointer' }}>Mass Hire</button>
            <button style={{ padding: '6px 14px', borderRadius: 6, background: 'transparent', color: TEXT, border: `1px solid ${BORDER}`, fontSize: 12, cursor: 'pointer' }}>Org Chart</button>
          </>
        }
      />

      <div style={{ padding: '20px 28px', maxWidth: 1600, margin: '0 auto' }}>

        {/* Filter Bar */}
        <div style={{ ...CARD, padding: '12px 16px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {[
            { ph: 'Position ID', key: 'position' },
            { ph: 'Department', key: 'dept' },
            { ph: 'Job Title', key: 'title' },
            { ph: 'Location', key: 'location' },
            { ph: 'Reports To', key: 'reportsTo' },
          ].map(f => (
            <input
              key={f.key}
              placeholder={f.ph}
              value={filters[f.key as keyof typeof filters]}
              onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
              style={{ background: 'rgba(99,102,241,0.06)', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '5px 10px', color: TEXT, fontSize: 12, outline: 'none', width: 120 }}
            />
          ))}
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '5px 10px', color: TEXT, fontSize: 12, outline: 'none' }}
          >
            {['All', 'Active', 'Open', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            placeholder="Search..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ background: 'rgba(99,102,241,0.06)', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '5px 10px', color: TEXT, fontSize: 12, outline: 'none', width: 160 }}
          />
        </div>

        {/* Table */}
        <div style={{ ...CARD, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', width: 32 }}>
                    <input type="checkbox" checked={selected.size === data.positions.length} onChange={toggleAll}
                      style={{ accentColor: '#6366f1', width: 14, height: 14 }} />
                  </th>
                  {COLS_DEF.slice(1).map(col => (
                    <th key={col} onClick={() => handleSort(col)}
                      style={{ padding: '10px 14px', textAlign: 'left', color: MUTED, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                      {col} {sortCol === col ? (sortAsc ? ' ↑' : ' ↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => {
                  const isOpen = p.status === 'Open'
                  const rowBg = isOpen ? 'rgba(217,119,6,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(99,102,241,0.02)'
                  return (
                    <tr key={p.id}
                      style={{ borderBottom: `1px solid rgba(99,102,241,0.06)`, background: rowBg, transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.07)')}
                      onMouseLeave={e => (e.currentTarget.style.background = rowBg)}>
                      <td style={{ padding: '9px 14px' }}>
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                          style={{ accentColor: '#6366f1', width: 14, height: 14 }} />
                      </td>
                      <td style={{ padding: '9px 14px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: 11 }}>{p.id}</td>
                      <td style={{ padding: '9px 14px', color: TEXT, fontWeight: 500 }}>{p.title}</td>
                      <td style={{ padding: '9px 14px', color: MUTED }}>{p.dept}</td>
                      <td style={{ padding: '9px 14px', color: MUTED }}>{p.reportsTo}</td>
                      <td style={{ padding: '9px 14px', color: isOpen ? '#d97706' : TEXT, fontStyle: isOpen ? 'italic' : 'normal' }}>
                        {p.employee || '(open)'}
                      </td>
                      <td style={{ padding: '9px 14px', color: MUTED, textAlign: 'center' }}>{p.fte.toFixed(1)}</td>
                      <td style={{ padding: '9px 14px', color: MUTED }}>{p.location}</td>
                      <td style={{ padding: '9px 14px' }}><StatusChip status={p.status} /></td>
                      <td style={{ padding: '9px 14px', color: MUTED, whiteSpace: 'nowrap' }}>{p.effectiveDate}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 12, color: MUTED }}>Showing 1–{positions.length} of {data.total}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, '...', 15].map((p, i) => (
                <button key={i} style={{ padding: '4px 10px', borderRadius: 5, background: p === 1 ? 'rgba(99,102,241,0.2)' : 'transparent', color: p === 1 ? '#a5b4fc' : MUTED, border: `1px solid ${BORDER}`, fontSize: 11, cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Org Chart Preview */}
        <div style={{ ...CARD, padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 14 }}>Org Chart Preview — Top 3 Levels</div>
          <OrgChart />
        </div>
      </div>
    </div>
  )
}
