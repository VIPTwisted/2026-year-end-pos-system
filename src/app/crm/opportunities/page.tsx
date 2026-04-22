'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const THEME = {
  bg: '#0d0e24',
  card: '#16213e',
  border: 'rgba(99,102,241,0.15)',
  text: '#e2e8f0',
  muted: '#94a3b8',
}

interface Opportunity {
  id: number
  name: string
  account: string
  revenue: number
  probability: number
  closeDate: string
  stage: 'Qualify' | 'Develop' | 'Propose' | 'Close' | 'Won' | 'Lost'
  owner: string
  health: 'green' | 'amber' | 'red'
  created: string
}

const OPPORTUNITIES: Opportunity[] = [
  { id: 1, name: 'ERP Implementation Phase 2', account: 'Fabrikam Inc', revenue: 125000, probability: 75, closeDate: 'May 31', stage: 'Propose', owner: 'Alice Chen', health: 'green', created: 'Apr 5' },
  { id: 2, name: 'Cloud Migration', account: 'Contoso Ltd', revenue: 200000, probability: 60, closeDate: 'Jun 30', stage: 'Develop', owner: 'Bob Wilson', health: 'amber', created: 'Mar 20' },
  { id: 3, name: 'HR System Upgrade', account: 'Adatum Corp', revenue: 48000, probability: 90, closeDate: 'Apr 30', stage: 'Close', owner: 'Alice Chen', health: 'green', created: 'Apr 1' },
  { id: 4, name: 'Office Supplies Contract', account: 'Litware Inc', revenue: 24000, probability: 40, closeDate: 'May 15', stage: 'Qualify', owner: 'Carlos M.', health: 'red', created: 'Apr 18' },
  { id: 5, name: 'Data Analytics Platform', account: 'Northwind Traders', revenue: 340000, probability: 25, closeDate: 'Aug 31', stage: 'Develop', owner: 'Bob Wilson', health: 'amber', created: 'Apr 10' },
  { id: 6, name: 'Security Audit & Compliance', account: 'Contoso Ltd', revenue: 30000, probability: 80, closeDate: 'May 5', stage: 'Close', owner: 'Alice Chen', health: 'green', created: 'Apr 3' },
  { id: 7, name: 'Supply Chain Optimization', account: 'Fourth Coffee', revenue: 110000, probability: 55, closeDate: 'Jul 15', stage: 'Develop', owner: 'Carlos M.', health: 'amber', created: 'Mar 28' },
  { id: 8, name: 'Marketing Automation Suite', account: 'Trey Research', revenue: 65000, probability: 70, closeDate: 'May 20', stage: 'Propose', owner: 'Bob Wilson', health: 'green', created: 'Apr 8' },
  { id: 9, name: 'HRIS Implementation', account: 'Humongous Insurance', revenue: 90000, probability: 65, closeDate: 'Jun 10', stage: 'Propose', owner: 'Carlos M.', health: 'green', created: 'Apr 6' },
  { id: 10, name: 'IoT Sensor Integration', account: 'Alpine Ski House', revenue: 85000, probability: 50, closeDate: 'Jul 1', stage: 'Develop', owner: 'Alice Chen', health: 'amber', created: 'Apr 9' },
  { id: 11, name: 'WMS Integration', account: 'Relecloud Corp', revenue: 180000, probability: 45, closeDate: 'Aug 15', stage: 'Develop', owner: 'Bob Wilson', health: 'amber', created: 'Apr 7' },
  { id: 12, name: 'R&D Management Platform', account: 'Tailspin Toys', revenue: 95000, probability: 60, closeDate: 'Jun 25', stage: 'Propose', owner: 'Alice Chen', health: 'green', created: 'Apr 11' },
  { id: 13, name: 'ERP Modernization', account: 'Coho Winery', revenue: 220000, probability: 30, closeDate: 'Sep 30', stage: 'Qualify', owner: 'Bob Wilson', health: 'red', created: 'Mar 18' },
  { id: 14, name: 'Customer Success Platform', account: 'Adventure Works', revenue: 40000, probability: 92, closeDate: 'Apr 28', stage: 'Close', owner: 'Carlos M.', health: 'green', created: 'Apr 2' },
  { id: 15, name: 'Campus ERP', account: 'Bellows College', revenue: 260000, probability: 55, closeDate: 'Oct 31', stage: 'Propose', owner: 'Alice Chen', health: 'amber', created: 'Mar 10' },
  { id: 16, name: 'Procurement Automation', account: 'Wide World Importers', revenue: 78000, probability: 70, closeDate: 'May 30', stage: 'Propose', owner: 'Bob Wilson', health: 'green', created: 'Apr 5' },
  { id: 17, name: 'Treasury Module', account: 'Blue Yonder Inc', revenue: 70000, probability: 35, closeDate: 'Jun 15', stage: 'Qualify', owner: 'Carlos M.', health: 'red', created: 'Mar 24' },
  { id: 18, name: 'Compliance Management Pack', account: 'Adatum Corp', revenue: 22000, probability: 88, closeDate: 'Apr 25', stage: 'Close', owner: 'Alice Chen', health: 'green', created: 'Apr 14' },
  { id: 19, name: 'Product Lifecycle Mgmt', account: 'Wingtip Toys', revenue: 55000, probability: 62, closeDate: 'Jun 5', stage: 'Develop', owner: 'Bob Wilson', health: 'amber', created: 'Mar 27' },
  { id: 20, name: 'Travel Booking ERP', account: 'Margie Travel', revenue: 130000, probability: 20, closeDate: 'Nov 30', stage: 'Qualify', owner: 'Carlos M.', health: 'red', created: 'Mar 12' },
]

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  Qualify: { bg: 'rgba(100,116,139,0.2)', text: '#94a3b8' },
  Develop: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8' },
  Propose: { bg: 'rgba(217,119,6,0.2)', text: '#fbbf24' },
  Close: { bg: 'rgba(20,184,166,0.2)', text: '#2dd4bf' },
  Won: { bg: 'rgba(34,197,94,0.2)', text: '#4ade80' },
  Lost: { bg: 'rgba(239,68,68,0.2)', text: '#f87171' },
}

const PROB_COLOR = (p: number) => p >= 75 ? '#4ade80' : p >= 50 ? '#fbbf24' : '#f87171'

const HEALTH_DOT: Record<string, string> = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' }

function fmt(n: number) {
  return '$' + n.toLocaleString()
}

function ownerInitials(owner: string) {
  return owner.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

type SortDir = 'asc' | 'desc'
type ViewMode = 'list' | 'kanban'

const COLS = ['Opportunity', 'Account', 'Est. Revenue', 'Probability', 'Close Date', 'Stage', 'Owner', 'Health', 'Created']

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" style={{ opacity: active ? 1 : 0.3 }}>
      <path d="M5 1L9 5H1L5 1Z" fill={active && dir === 'asc' ? '#6366f1' : THEME.muted} />
      <path d="M5 11L1 7H9L5 11Z" fill={active && dir === 'desc' ? '#6366f1' : THEME.muted} />
    </svg>
  )
}

const KPI_STAGES = ['Qualify', 'Develop', 'Propose', 'Close'] as const

function kpiTotal(stage?: string) {
  const items = stage ? OPPORTUNITIES.filter(o => o.stage === stage) : OPPORTUNITIES
  return items.reduce((s, o) => s + o.revenue, 0)
}

export default function OpportunitiesPage() {
  const [view, setView] = useState<ViewMode>('list')
  const [opps, setOpps] = useState<Opportunity[]>(OPPORTUNITIES)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sortCol, setSortCol] = useState('Opportunity')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [drawer, setDrawer] = useState<Opportunity | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let result = [...OPPORTUNITIES]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(o => o.name.toLowerCase().includes(q) || o.account.toLowerCase().includes(q) || o.owner.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      const map: Record<string, keyof Opportunity> = {
        'Opportunity': 'name', 'Account': 'account', 'Est. Revenue': 'revenue',
        'Probability': 'probability', 'Close Date': 'closeDate', 'Stage': 'stage',
        'Owner': 'owner', 'Health': 'health', 'Created': 'created',
      }
      const key = map[sortCol] || 'name'
      const va = a[key], vb = b[key]
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    setOpps(result)
  }, [search, sortCol, sortDir])

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const allSelected = opps.length > 0 && opps.every(o => selected.has(o.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(opps.map(o => o.id)))
  const toggleOne = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const btnStyle = (primary?: boolean, active?: boolean) => ({
    background: primary ? '#4f46e5' : active ? 'rgba(99,102,241,0.2)' : 'transparent',
    border: `1px solid ${primary ? '#4f46e5' : active ? 'rgba(99,102,241,0.5)' : THEME.border}`,
    borderRadius: 6,
    color: primary ? '#fff' : active ? '#818cf8' : THEME.text,
    fontSize: 12,
    padding: '6px 14px',
    cursor: 'pointer',
    fontWeight: primary || active ? 600 : 400,
  })

  const stageChip = (stage: string) => {
    const c = STAGE_COLORS[stage] || STAGE_COLORS.Qualify
    return <span style={{ background: c.bg, color: c.text, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{stage}</span>
  }

  const kanbanStages = ['Qualify', 'Develop', 'Propose', 'Close'] as const

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'Geist, Satoshi, system-ui, sans-serif' }}>
      <TopBar
        title="Opportunities"
        breadcrumb={[{ label: 'CRM', href: '/crm' }, { label: 'Opportunities', href: '/crm/opportunities' }]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnStyle(true)}>New Opportunity</button>
            <button style={btnStyle()}>Qualify</button>
            <button style={btnStyle()}>Close as Won</button>
            <button style={btnStyle()}>Close as Lost</button>
          </div>
        }
      />

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: '16px 24px', borderBottom: `1px solid ${THEME.border}` }}>
        {[
          { label: 'Total Pipeline', value: fmt(kpiTotal()), color: '#818cf8' },
          ...KPI_STAGES.map(s => ({ label: s, value: fmt(kpiTotal(s)), color: STAGE_COLORS[s].text })),
        ].map(kpi => (
          <div key={kpi.label} style={{ background: THEME.card, borderRadius: 8, padding: '12px 16px', border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: 11, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* View toggle + search */}
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${THEME.border}`, background: THEME.card }}>
        <div style={{ display: 'flex', border: `1px solid ${THEME.border}`, borderRadius: 6, overflow: 'hidden' }}>
          <button onClick={() => setView('list')} style={{ ...btnStyle(false, view === 'list'), borderRadius: 0, border: 'none', padding: '5px 14px' }}>List</button>
          <button onClick={() => setView('kanban')} style={{ ...btnStyle(false, view === 'kanban'), borderRadius: 0, border: 'none', padding: '5px 14px', borderLeft: `1px solid ${THEME.border}` }}>Kanban Board</button>
        </div>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={THEME.muted} strokeWidth="2" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search opportunities..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: 6, color: THEME.text, fontSize: 12, padding: '5px 10px 5px 28px', outline: 'none', width: 200 }} />
        </div>
      </div>

      {view === 'list' ? (
        <div style={{ padding: '0 24px 24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.border}` }}>
                <th style={{ width: 32, padding: '8px 12px', textAlign: 'center' }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: '#4f46e5', cursor: 'pointer' }} />
                </th>
                {COLS.map(col => (
                  <th key={col} onClick={() => toggleSort(col)} style={{ padding: '8px 12px', textAlign: 'left', color: THEME.muted, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col}
                      <SortIcon active={sortCol === col} dir={sortDir} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opps.map((o, i) => (
                <tr key={o.id} onClick={() => setDrawer(o)} style={{ borderBottom: `1px solid ${THEME.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(22,33,62,0.3)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(22,33,62,0.3)')}>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }} onClick={e => { e.stopPropagation(); toggleOne(o.id) }}>
                    <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} style={{ accentColor: '#4f46e5', cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '10px 12px' }}><span style={{ color: '#818cf8', fontWeight: 500 }}>{o.name}</span></td>
                  <td style={{ padding: '10px 12px' }}>{o.account}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: THEME.text }}>{fmt(o.revenue)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: `rgba(${o.probability >= 75 ? '74,222,128' : o.probability >= 50 ? '251,191,36' : '248,113,113'},0.15)`, color: PROB_COLOR(o.probability), borderRadius: 4, padding: '2px 7px', fontSize: 12, fontWeight: 600 }}>{o.probability}%</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{o.closeDate}</td>
                  <td style={{ padding: '10px 12px' }}>{stageChip(o.stage)}</td>
                  <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{o.owner}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: HEALTH_DOT[o.health], display: 'inline-block', boxShadow: o.health === 'red' ? '0 0 4px #ef4444' : undefined }} />
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: THEME.muted, fontSize: 12 }}>{o.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 0', color: THEME.muted, fontSize: 12 }}>{opps.length} opportunities {selected.size > 0 && `· ${selected.size} selected`}</div>
        </div>
      ) : (
        /* Kanban Board */
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, overflowX: 'auto' }}>
          {kanbanStages.map(stage => {
            const cards = OPPORTUNITIES.filter(o => o.stage === stage)
            const total = cards.reduce((s, c) => s + c.revenue, 0)
            const c = STAGE_COLORS[stage]
            return (
              <div key={stage} style={{ background: THEME.card, borderRadius: 10, border: `1px solid ${THEME.border}`, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: c.text }}>{stage}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.text }}>{fmt(total)}</div>
                    <div style={{ fontSize: 10, color: THEME.muted }}>{cards.length} deal{cards.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cards.map(card => (
                    <div key={card.id} onClick={() => setDrawer(card)} style={{ background: THEME.bg, borderRadius: 8, padding: '10px 12px', border: `1px solid ${THEME.border}`, cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = THEME.border)}>
                      <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: THEME.text }}>{card.name}</div>
                      <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 6 }}>{card.account}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#818cf8' }}>{fmt(card.revenue)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, color: THEME.muted }}>{card.closeDate}</span>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{ownerInitials(card.owner)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Opportunity Detail Drawer */}
      {drawer && (
        <>
          <div onClick={() => setDrawer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 460, background: THEME.card, borderLeft: `1px solid ${THEME.border}`, zIndex: 50, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{drawer.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {stageChip(drawer.stage)}
                  <span style={{ color: THEME.muted, fontSize: 12 }}>{drawer.account}</span>
                </div>
              </div>
              <button onClick={() => setDrawer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.muted, padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* BPF Stepper */}
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${THEME.border}` }}>
              <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sales Process</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {(['Qualify', 'Develop', 'Propose', 'Close'] as const).map((s, i) => {
                  const stages = ['Qualify', 'Develop', 'Propose', 'Close', 'Won', 'Lost']
                  const currentIdx = stages.indexOf(drawer.stage)
                  const stepIdx = stages.indexOf(s)
                  const isDone = stepIdx < currentIdx
                  const isActive = s === drawer.stage
                  const c = STAGE_COLORS[s]
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: isDone ? 'rgba(99,102,241,0.15)' : isActive ? c.bg : 'transparent', borderRadius: 4, border: `1px solid ${isActive ? c.text : THEME.border}`, fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? c.text : isDone ? '#818cf8' : THEME.muted }}>
                        {s}
                      </div>
                      {i < 3 && <div style={{ width: 12, height: 1, background: THEME.border, flexShrink: 0 }} />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ padding: '16px 24px', flex: 1 }}>
              {/* Key fields */}
              <section style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 10, fontWeight: 600 }}>Opportunity Details</div>
                {[
                  ['Est. Revenue', fmt(drawer.revenue)],
                  ['Probability', `${drawer.probability}%`],
                  ['Close Date', drawer.closeDate],
                  ['Owner', drawer.owner],
                  ['Health', drawer.health.charAt(0).toUpperCase() + drawer.health.slice(1)],
                  ['Created', drawer.created],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${THEME.border}`, fontSize: 13 }}>
                    <span style={{ color: THEME.muted }}>{label}</span>
                    <span style={{ color: label === 'Est. Revenue' ? '#818cf8' : label === 'Health' ? HEALTH_DOT[drawer.health] : THEME.text, fontWeight: label === 'Est. Revenue' ? 700 : 400 }}>{value}</span>
                  </div>
                ))}
              </section>

              {/* Related Contacts */}
              <section style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 10, fontWeight: 600 }}>Related Contacts</div>
                {['Primary Contact', 'Technical Lead', 'Decision Maker'].map((role, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: `1px solid ${THEME.border}` }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {['JD', 'MR', 'SK'][i]}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{['Jane Doe', 'Mike Rodriguez', 'Sarah Kim'][i]}</div>
                      <div style={{ fontSize: 11, color: THEME.muted }}>{role}</div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Activity Feed */}
              <section>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: THEME.muted, marginBottom: 12, fontWeight: 600 }}>Activity Timeline</div>
                <div style={{ position: 'relative', paddingLeft: 20 }}>
                  <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1, background: THEME.border }} />
                  {[
                    { date: drawer.created, text: 'Opportunity created' },
                    { date: 'Apr 8', text: 'Discovery call completed — 45 min' },
                    { date: 'Apr 12', text: 'Proposal sent to stakeholders' },
                    { date: 'Apr 16', text: 'Follow-up email sent — awaiting response' },
                    { date: 'Apr 20', text: 'Demo scheduled for next week' },
                  ].map((t, i) => (
                    <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
                      <div style={{ position: 'absolute', left: -14, top: 3, width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', border: `2px solid ${THEME.card}` }} />
                      <div style={{ fontSize: 11, color: '#818cf8', marginBottom: 2 }}>{t.date}</div>
                      <div style={{ fontSize: 12, color: THEME.text }}>{t.text}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div style={{ padding: '16px 24px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: 8 }}>
              <button style={{ background: '#4f46e5', border: '1px solid #4f46e5', borderRadius: 6, color: '#fff', fontSize: 12, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, flex: 1 }}>Edit</button>
              <button style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, color: '#4ade80', fontSize: 12, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, flex: 1 }}>Close Won</button>
              <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#f87171', fontSize: 12, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, flex: 1 }}>Close Lost</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
