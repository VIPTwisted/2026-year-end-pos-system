'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const STATUS_STYLES: Record<string, string> = {
  'In Progress': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'Planning':    'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  'On Hold':     'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  'Completed':   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'Cancelled':   'bg-red-500/20 text-red-400 border border-red-500/30',
}

type Project = {
  id: string
  name: string
  customer: string
  type: string
  manager: string
  startDate: string
  endDate: string
  budget: number
  billed: number
  status: string
}

type DrawerProject = Project & {
  tasks: { name: string; pct: number }[]
  resources: { name: string; role: string; hours: number }[]
  expenses: { date: string; category: string; amount: number }[]
}

function fmt(n: number) {
  return '$' + n.toLocaleString()
}

function pct(billed: number, budget: number) {
  if (budget === 0) return 0
  return Math.round((billed / budget) * 100)
}

function BubbleChart({ projects }: { projects: Project[] }) {
  const w = 560
  const h = 200
  const pad = 40
  const maxBudget = Math.max(...projects.map(p => p.budget))

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
      {/* axes */}
      <line x1={pad} y1={h - pad} x2={w - 10} y2={h - pad} stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
      <line x1={pad} y1={10} x2={pad} y2={h - pad} stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
      {/* axis labels */}
      <text x={w / 2} y={h - 4} textAnchor="middle" fill="#94a3b8" fontSize="9">Completion %</text>
      <text x={10} y={h / 2} textAnchor="middle" fill="#94a3b8" fontSize="9" transform={`rotate(-90 10 ${h / 2})`}>Budget</text>
      {/* bubbles */}
      {projects.map((p, i) => {
        const completion = pct(p.billed, p.budget)
        const cx = pad + ((completion / 100) * (w - pad - 20))
        const cy = (h - pad) - ((p.budget / maxBudget) * (h - pad - 20))
        const r = Math.max(6, Math.min(22, Math.sqrt(p.budget / maxBudget) * 22))
        const colors: Record<string, string> = {
          'In Progress': 'rgba(59,130,246,0.7)',
          'Planning':    'rgba(148,163,184,0.6)',
          'On Hold':     'rgba(245,158,11,0.7)',
          'Completed':   'rgba(16,185,129,0.7)',
          'Cancelled':   'rgba(239,68,68,0.6)',
        }
        return (
          <g key={p.id}>
            <circle cx={cx} cy={cy} r={r} fill={colors[p.status] || 'rgba(99,102,241,0.6)'} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x={cx} y={cy + 3} textAnchor="middle" fill="#fff" fontSize="7" fontWeight="600">{p.id.slice(-3)}</text>
          </g>
        )
      })}
    </svg>
  )
}

const MOCK_TASKS = [
  { name: 'Requirements Gathering', pct: 100 },
  { name: 'System Design', pct: 100 },
  { name: 'Core Development', pct: 65 },
  { name: 'Testing & QA', pct: 20 },
  { name: 'Deployment & Go-Live', pct: 0 },
]
const MOCK_RESOURCES = [
  { name: 'Sarah Chen', role: 'Project Manager', hours: 120 },
  { name: 'James Wu', role: 'Lead Developer', hours: 280 },
  { name: 'Lisa Torres', role: 'Business Analyst', hours: 160 },
]
const MOCK_EXPENSES = [
  { date: 'Apr 18', category: 'Travel', amount: 840 },
  { date: 'Apr 15', category: 'Software Licenses', amount: 2400 },
  { date: 'Apr 10', category: 'Consulting', amount: 1200 },
]

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'id', dir: 'asc' })
  const [drawer, setDrawer] = useState<DrawerProject | null>(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/projects/list')
      .then(r => r.json())
      .then(d => { setProjects(d.projects); setTotal(d.total) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase()) && !p.customer.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function toggleSort(col: string) {
    setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  const sorted = [...filtered].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1
    const map: Record<string, (x: Project) => string | number> = {
      id: x => x.id,
      name: x => x.name,
      customer: x => x.customer,
      manager: x => x.manager,
      budget: x => x.budget,
      billed: x => x.billed,
      status: x => x.status,
    }
    const fn = map[sort.col] || (x => x.id)
    const av = fn(a); const bv = fn(b)
    return av < bv ? -dir : av > bv ? dir : 0
  })

  function openDrawer(p: Project) {
    setDrawer({ ...p, tasks: MOCK_TASKS, resources: MOCK_RESOURCES, expenses: MOCK_EXPENSES })
  }

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ color: sort.col === col ? '#6366f1' : '#475569', marginLeft: 4, fontSize: 10 }}>
      {sort.col === col ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <TopBar
        title="Projects"
        breadcrumb={[{ label: 'Projects', href: '/projects' }, { label: 'All Projects', href: '/projects/list' }]}
        actions={
          <>
            <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New Project</button>
            <button style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Import</button>
            <button style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Project Templates</button>
          </>
        }
      />

      {/* Filter bar */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        {(['Project ID','Name','Customer','Project Manager'] as const).map(label => (
          <input key={label} placeholder={label} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, color: '#e2e8f0', fontSize: 12, padding: '5px 10px', width: 130 }} />
        ))}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, color: '#e2e8f0', fontSize: 12, padding: '5px 10px' }}>
          {['All','In Progress','Planning','On Hold','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <input placeholder="Type" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, color: '#e2e8f0', fontSize: 12, padding: '5px 10px', width: 110 }} />
        <input type="date" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, color: '#e2e8f0', fontSize: 12, padding: '5px 8px' }} />
        <span style={{ color: '#475569', fontSize: 11 }}>to</span>
        <input type="date" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, color: '#e2e8f0', fontSize: 12, padding: '5px 8px' }} />
        <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, color: '#e2e8f0', fontSize: 12, padding: '5px 10px', width: 160, marginLeft: 'auto' }} />
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left', color: '#475569', fontWeight: 500, width: 32 }}>
                  <input type="checkbox" style={{ accentColor: '#6366f1' }} />
                </th>
                {[['id','Project ID'],['id','Proj ID'],['name','Project Name'],['customer','Customer'],['type','Type'],['manager','Project Manager'],['startDate','Start Date'],['endDate','End Date'],['budget','Budget'],['billed','Billed'],['remaining','Remaining%'],['status','Status']].filter((_,i) => i !== 1).map(([col, label]) => (
                  <th key={col + label} onClick={() => toggleSort(col)} style={{ padding: '8px 10px', textAlign: 'left', color: '#475569', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    {label}<SortIcon col={col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Loading…</td></tr>
              ) : sorted.map((p, i) => {
                const completion = pct(p.billed, p.budget)
                const isSelected = selected.includes(p.id)
                return (
                  <tr key={p.id} onClick={() => openDrawer(p)} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)', background: isSelected ? 'rgba(99,102,241,0.06)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isSelected ? 'rgba(99,102,241,0.06)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                  >
                    <td style={{ padding: '8px 6px' }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => setSelected(s => isSelected ? s.filter(x => x !== p.id) : [...s, p.id])} style={{ accentColor: '#6366f1' }} />
                    </td>
                    <td style={{ padding: '8px 10px', color: '#6366f1', fontWeight: 600, fontFamily: 'monospace' }}>{p.id}</td>
                    <td style={{ padding: '8px 10px', color: '#e2e8f0', fontWeight: 500, maxWidth: 200 }}>{p.name}</td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{p.customer}</td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{p.type}</td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{p.manager}</td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(p.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(p.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                    <td style={{ padding: '8px 10px', color: '#e2e8f0', textAlign: 'right' }}>{fmt(p.budget)}</td>
                    <td style={{ padding: '8px 10px', color: '#e2e8f0', textAlign: 'right' }}>{fmt(p.billed)}</td>
                    <td style={{ padding: '8px 10px', minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${completion}%`, background: completion === 100 ? '#10b981' : completion > 50 ? '#6366f1' : '#3b82f6', borderRadius: 3, transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 28, textAlign: 'right' }}>{completion}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, ...Object.fromEntries(Object.entries(STATUS_STYLES[p.status] || 'bg-slate-500/20 text-slate-400').filter(() => false)) }}
                        className={STATUS_STYLES[p.status] || 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}
                      >{p.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '10px 0', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <span style={{ fontSize: 12, color: '#475569' }}>1–20 of {total} projects</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} style={{ width: 28, height: 28, borderRadius: 4, border: n === 1 ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(99,102,241,0.15)', background: n === 1 ? 'rgba(99,102,241,0.2)' : 'transparent', color: n === 1 ? '#a5b4fc' : '#475569', fontSize: 12, cursor: 'pointer' }}>{n}</button>
            ))}
            <button style={{ padding: '0 10px', height: 28, borderRadius: 4, border: '1px solid rgba(99,102,241,0.15)', background: 'transparent', color: '#475569', fontSize: 12, cursor: 'pointer' }}>Next →</button>
          </div>
        </div>

        {/* Portfolio Summary Chart */}
        <div style={{ marginTop: 24, background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>Project Portfolio Summary</h3>
          <p style={{ fontSize: 11, color: '#475569', marginBottom: 12 }}>Budget size vs. completion % — bubble area = budget</p>
          {projects.length > 0 && <BubbleChart projects={projects} />}
          <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            {Object.entries({ 'In Progress': '#3b82f6', 'Planning': '#94a3b8', 'On Hold': '#f59e0b', 'Completed': '#10b981', 'Cancelled': '#ef4444' }).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {drawer && (
        <>
          <div onClick={() => setDrawer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, background: '#0f1631', borderLeft: '1px solid rgba(99,102,241,0.2)', zIndex: 50, overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: '#6366f1', fontFamily: 'monospace', fontWeight: 600, marginBottom: 4 }}>{drawer.id}</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{drawer.name}</h2>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{drawer.customer}</div>
              </div>
              <button onClick={() => setDrawer(null)} style={{ background: 'rgba(99,102,241,0.15)', border: 'none', borderRadius: 6, color: '#94a3b8', cursor: 'pointer', padding: '6px 10px', fontSize: 14 }}>✕</button>
            </div>

            {/* Header info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['Type', drawer.type],
                ['Manager', drawer.manager],
                ['Start', new Date(drawer.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})],
                ['End', new Date(drawer.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})],
                ['Budget', fmt(drawer.budget)],
                ['Billed', fmt(drawer.billed)],
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#16213e', borderRadius: 6, padding: '10px 14px', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Tasks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {drawer.tasks.map(t => (
                  <div key={t.name} style={{ background: '#16213e', borderRadius: 6, padding: '10px 14px', border: '1px solid rgba(99,102,241,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#e2e8f0' }}>{t.name}</span>
                      <span style={{ color: t.pct === 100 ? '#10b981' : '#6366f1', fontWeight: 600 }}>{t.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${t.pct}%`, background: t.pct === 100 ? '#10b981' : '#6366f1', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Resource Assignments</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                    {['Name','Role','Hours'].map(h => <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#475569', fontWeight: 500 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {drawer.resources.map(r => (
                    <tr key={r.name} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{r.name}</td>
                      <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{r.role}</td>
                      <td style={{ padding: '7px 10px', color: '#a5b4fc', textAlign: 'right' }}>{r.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expenses */}
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Recent Expenses</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                    {['Date','Category','Amount'].map(h => <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#475569', fontWeight: 500 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {drawer.expenses.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td style={{ padding: '7px 10px', color: '#94a3b8' }}>{e.date}</td>
                      <td style={{ padding: '7px 10px', color: '#e2e8f0' }}>{e.category}</td>
                      <td style={{ padding: '7px 10px', color: '#e2e8f0', textAlign: 'right' }}>{fmt(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
