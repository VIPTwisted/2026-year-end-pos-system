'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'

interface Worker {
  id: string
  empNo: string
  fullName: string
  initials: string
  jobTitle: string
  department: string
  manager: string
  hireDate: string
  status: string
  location: string
  deptColor: string
}

const DEPT_COLORS: Record<string, string> = {
  Executive: '#6366f1',
  Finance: '#10b981',
  Operations: '#f59e0b',
  Procurement: '#3b82f6',
  HR: '#ec4899',
  Sales: '#8b5cf6',
  IT: '#06b6d4',
}

const WORKERS: Worker[] = [
  { id: 'W001', empNo: 'EMP-001', fullName: 'John Williams', initials: 'JW', jobTitle: 'CEO', department: 'Executive', manager: '—', hireDate: 'Jan 12, 2020', status: 'Active', location: 'Chicago HQ', deptColor: '#6366f1' },
  { id: 'W002', empNo: 'EMP-002', fullName: 'Maria Santos', initials: 'MS', jobTitle: 'CFO', department: 'Finance', manager: 'John Williams', hireDate: 'Mar 5, 2021', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W003', empNo: 'EMP-003', fullName: 'David Kim', initials: 'DK', jobTitle: 'VP Operations', department: 'Operations', manager: 'John Williams', hireDate: 'Jun 22, 2019', status: 'Active', location: 'Chicago HQ', deptColor: '#f59e0b' },
  { id: 'W004', empNo: 'EMP-004', fullName: 'Alice Chen', initials: 'AC', jobTitle: 'Finance Manager', department: 'Finance', manager: 'Maria Santos', hireDate: 'Jan 8, 2022', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W005', empNo: 'EMP-005', fullName: 'Bob Wilson', initials: 'BW', jobTitle: 'Sr. Purchasing Agent', department: 'Procurement', manager: 'David Kim', hireDate: 'Apr 30, 2020', status: 'Active', location: 'Chicago HQ', deptColor: '#3b82f6' },
  { id: 'W006', empNo: 'EMP-006', fullName: 'Rachel Lopez', initials: 'RL', jobTitle: 'HR Manager', department: 'HR', manager: 'David Kim', hireDate: 'Sep 14, 2021', status: 'Active', location: 'Chicago HQ', deptColor: '#ec4899' },
  { id: 'W007', empNo: 'EMP-007', fullName: 'Carlos Mendez', initials: 'CM', jobTitle: 'Sales Rep', department: 'Sales', manager: 'David Kim', hireDate: 'Feb 17, 2023', status: 'Active', location: 'New York', deptColor: '#8b5cf6' },
  { id: 'W008', empNo: 'EMP-008', fullName: 'Sarah Kim', initials: 'SK', jobTitle: 'IT Admin', department: 'IT', manager: 'David Kim', hireDate: 'Nov 3, 2022', status: 'Active', location: 'Remote', deptColor: '#06b6d4' },
  { id: 'W009', empNo: 'EMP-009', fullName: 'Tom Jackson', initials: 'TJ', jobTitle: 'Sr. Accountant', department: 'Finance', manager: 'Alice Chen', hireDate: 'Aug 22, 2020', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W010', empNo: 'EMP-010', fullName: 'Mary Lee', initials: 'ML', jobTitle: 'Payroll Specialist', department: 'Finance', manager: 'Alice Chen', hireDate: 'Jul 1, 2023', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W011', empNo: 'EMP-011', fullName: 'James Parker', initials: 'JP', jobTitle: 'Sr. Sales Rep', department: 'Sales', manager: 'David Kim', hireDate: 'Mar 15, 2020', status: 'Active', location: 'New York', deptColor: '#8b5cf6' },
  { id: 'W012', empNo: 'EMP-012', fullName: 'Priya Sharma', initials: 'PS', jobTitle: 'Procurement Analyst', department: 'Procurement', manager: 'Bob Wilson', hireDate: 'Oct 11, 2022', status: 'Active', location: 'Chicago HQ', deptColor: '#3b82f6' },
  { id: 'W013', empNo: 'EMP-013', fullName: 'Kevin O\'Brien', initials: 'KO', jobTitle: 'HR Generalist', department: 'HR', manager: 'Rachel Lopez', hireDate: 'Jan 25, 2023', status: 'Active', location: 'Chicago HQ', deptColor: '#ec4899' },
  { id: 'W014', empNo: 'EMP-014', fullName: 'Diana Foster', initials: 'DF', jobTitle: 'IT Systems Admin', department: 'IT', manager: 'Sarah Kim', hireDate: 'Jun 5, 2021', status: 'On Leave', location: 'Remote', deptColor: '#06b6d4' },
  { id: 'W015', empNo: 'EMP-015', fullName: 'Marcus Johnson', initials: 'MJ', jobTitle: 'Operations Analyst', department: 'Operations', manager: 'David Kim', hireDate: 'Sep 9, 2020', status: 'Active', location: 'Chicago HQ', deptColor: '#f59e0b' },
  { id: 'W016', empNo: 'EMP-016', fullName: 'Elena Vasquez', initials: 'EV', jobTitle: 'Sales Manager', department: 'Sales', manager: 'David Kim', hireDate: 'Feb 1, 2019', status: 'Active', location: 'Los Angeles', deptColor: '#8b5cf6' },
  { id: 'W017', empNo: 'EMP-017', fullName: 'Nathan Reed', initials: 'NR', jobTitle: 'Financial Analyst', department: 'Finance', manager: 'Alice Chen', hireDate: 'Aug 14, 2023', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W018', empNo: 'EMP-018', fullName: 'Olivia Brooks', initials: 'OB', jobTitle: 'Marketing Coordinator', department: 'Sales', manager: 'Elena Vasquez', hireDate: 'Apr 3, 2022', status: 'On Leave', location: 'New York', deptColor: '#8b5cf6' },
  { id: 'W019', empNo: 'EMP-019', fullName: 'Raj Patel', initials: 'RP', jobTitle: 'Sr. IT Developer', department: 'IT', manager: 'Sarah Kim', hireDate: 'Nov 28, 2020', status: 'Active', location: 'Remote', deptColor: '#06b6d4' },
  { id: 'W020', empNo: 'EMP-020', fullName: 'Chloe Bennett', initials: 'CB', jobTitle: 'Supply Chain Analyst', department: 'Operations', manager: 'David Kim', hireDate: 'Jan 16, 2024', status: 'Active', location: 'Chicago HQ', deptColor: '#f59e0b' },
  { id: 'W021', empNo: 'EMP-021', fullName: 'Tyler Hudson', initials: 'TH', jobTitle: 'Accounts Receivable', department: 'Finance', manager: 'Alice Chen', hireDate: 'Mar 22, 2021', status: 'Active', location: 'Chicago HQ', deptColor: '#10b981' },
  { id: 'W022', empNo: 'EMP-022', fullName: 'Samantha Wright', initials: 'SW', jobTitle: 'Talent Acquisition', department: 'HR', manager: 'Rachel Lopez', hireDate: 'Jul 7, 2022', status: 'Active', location: 'Chicago HQ', deptColor: '#ec4899' },
  { id: 'W023', empNo: 'EMP-023', fullName: 'Derek Cole', initials: 'DC', jobTitle: 'Procurement Manager', department: 'Procurement', manager: 'David Kim', hireDate: 'Oct 1, 2018', status: 'Active', location: 'Chicago HQ', deptColor: '#3b82f6' },
  { id: 'W024', empNo: 'EMP-024', fullName: 'Fatima Hassan', initials: 'FH', jobTitle: 'Sr. Sales Analyst', department: 'Sales', manager: 'Elena Vasquez', hireDate: 'May 19, 2022', status: 'Active', location: 'New York', deptColor: '#8b5cf6' },
  { id: 'W025', empNo: 'EMP-025', fullName: 'Greg Monroe', initials: 'GM', jobTitle: 'Operations Manager', department: 'Operations', manager: 'David Kim', hireDate: 'Feb 14, 2017', status: 'Terminated', location: 'Chicago HQ', deptColor: '#f59e0b' },
]

const STATUS_CHIP: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  'On Leave': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Terminated: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

function Avatar({ initials, color, size = 28 }: { initials: string; color: string; size?: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: color + '33', border: `1.5px solid ${color}55`,
      fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0,
    }}>
      {initials}
    </span>
  )
}

const DRAWER_TABS = ['Employment', 'Compensation', 'Benefits', 'Leave', 'Performance', 'Documents']

function WorkerDrawer({ worker, onClose }: { worker: Worker; onClose: () => void }) {
  const [tab, setTab] = useState('Employment')

  const seniority = (() => {
    const parts = worker.hireDate.split(' ')
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
    const hire = new Date(parseInt(parts[2]), months[parts[0]], parseInt(parts[1].replace(',', '')))
    const now = new Date(2026, 3, 22)
    const years = Math.floor((now.getTime() - hire.getTime()) / (365.25 * 24 * 3600 * 1000))
    const months2 = Math.floor(((now.getTime() - hire.getTime()) % (365.25 * 24 * 3600 * 1000)) / (30.44 * 24 * 3600 * 1000))
    return `${years} years ${months2} months`
  })()

  return (
    <div className="fixed inset-y-0 right-0 w-[520px] z-50 flex flex-col shadow-2xl"
      style={{ background: '#0d0e24', borderLeft: '1px solid rgba(99,102,241,0.2)' }}>
      {/* Header */}
      <div className="flex items-start gap-4 p-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        <Avatar initials={worker.initials} color={worker.deptColor} size={56} />
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-zinc-100">{worker.fullName}</div>
          <div className="text-sm" style={{ color: '#94a3b8' }}>{worker.jobTitle}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs" style={{ color: '#94a3b8' }}>{worker.department}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-xs" style={{ color: '#94a3b8' }}>{worker.hireDate}</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_CHIP[worker.status]}`}>
              {worker.status}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none mt-0.5">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        {DRAWER_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-xs font-medium whitespace-nowrap transition flex-shrink-0"
            style={tab === t
              ? { color: '#a5b4fc', borderBottom: '2px solid #6366f1' }
              : { color: '#475569' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5 text-xs">
        {tab === 'Employment' && (
          <div className="flex flex-col gap-0">
            {[
              ['Position', worker.jobTitle],
              ['Department', worker.department],
              ['Reports To', worker.manager],
              ['Direct Reports', worker.department === 'Finance' && worker.empNo === 'EMP-004' ? '3' : '0'],
              ['Work Location', worker.location],
              ['Work Schedule', 'Monday–Friday 9:00–17:00'],
              ['Employment Type', 'Full-Time'],
              ['Start Date', worker.hireDate],
              ['Seniority', seniority],
              ['Employee No.', worker.empNo],
            ].map(([k, v]) => (
              <div key={k} className="flex py-2.5" style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                <span className="w-36 flex-shrink-0" style={{ color: '#94a3b8' }}>{k}</span>
                <span className="text-zinc-200">{v}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Compensation' && (
          <div className="flex flex-col gap-0">
            {[
              ['Pay Type', 'Salary'],
              ['Annual Salary', '••••••'],
              ['Pay Frequency', 'Bi-weekly'],
              ['Last Review Date', 'Jan 2026'],
              ['Next Review Date', 'Jan 2027'],
              ['Bonus Eligible', 'Yes'],
              ['Last Increase', '3.5%'],
            ].map(([k, v]) => (
              <div key={k} className="flex py-2.5" style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                <span className="w-40 flex-shrink-0" style={{ color: '#94a3b8' }}>{k}</span>
                <span className="text-zinc-200">{v}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Benefits' && (
          <div className="flex flex-col gap-3">
            {[
              { plan: 'Medical', provider: 'BlueCross PPO', status: 'Enrolled', coverage: 'Employee + Family' },
              { plan: 'Dental', provider: 'Delta Dental', status: 'Enrolled', coverage: 'Employee + Family' },
              { plan: 'Vision', provider: 'VSP', status: 'Enrolled', coverage: 'Employee Only' },
              { plan: '401(k)', provider: 'Fidelity', status: 'Enrolled', coverage: '6% contribution' },
              { plan: 'Life Insurance', provider: 'MetLife', status: 'Enrolled', coverage: '2x Annual Salary' },
            ].map(b => (
              <div key={b.plan} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
                className="rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-zinc-200">{b.plan}</div>
                  <div style={{ color: '#94a3b8' }}>{b.provider} — {b.coverage}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">{b.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Leave' && (
          <div>
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: '#475569' }}>Leave Balances</div>
              {[
                { type: 'Vacation', earned: 18, used: 5, remaining: 13 },
                { type: 'Sick Leave', earned: 10, used: 2, remaining: 8 },
                { type: 'Personal', earned: 3, used: 1, remaining: 2 },
              ].map(l => (
                <div key={l.type} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                  <span style={{ color: '#94a3b8' }}>{l.type}</span>
                  <div className="flex gap-4">
                    <span style={{ color: '#475569' }}>Earned: {l.earned}</span>
                    <span style={{ color: '#fca5a5' }}>Used: {l.used}</span>
                    <span style={{ color: '#6ee7b7' }}>Remaining: <b>{l.remaining}</b></span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: '#475569' }}>Recent Requests</div>
            {[
              { dates: 'Mar 17–18, 2026', type: 'Vacation', status: 'Approved' },
              { dates: 'Feb 6, 2026', type: 'Sick Leave', status: 'Approved' },
              { dates: 'Jan 2, 2026', type: 'Personal', status: 'Approved' },
            ].map(r => (
              <div key={r.dates} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                <span style={{ color: '#94a3b8' }}>{r.dates}</span>
                <span style={{ color: '#94a3b8' }}>{r.type}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400">{r.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Performance' && (
          <div className="flex flex-col gap-3">
            {[
              { period: 'Annual Review 2025', rating: 'Exceeds Expectations', score: 4.3, reviewer: worker.manager, date: 'Jan 15, 2026' },
              { period: 'Mid-Year 2025', rating: 'Meets Expectations', score: 3.8, reviewer: worker.manager, date: 'Jul 12, 2025' },
              { period: 'Annual Review 2024', rating: 'Exceeds Expectations', score: 4.1, reviewer: worker.manager, date: 'Jan 20, 2025' },
            ].map(r => (
              <div key={r.period} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}
                className="rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-zinc-200">{r.period}</span>
                  <span className="text-indigo-400 font-bold">{r.score}/5.0</span>
                </div>
                <div style={{ color: '#94a3b8' }}>{r.rating}</div>
                <div className="mt-1" style={{ color: '#475569' }}>Reviewed by {r.reviewer} · {r.date}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Documents' && (
          <div className="flex flex-col gap-2">
            {[
              { name: 'Form I-9', type: 'Compliance', date: worker.hireDate },
              { name: 'Form W-4', type: 'Tax', date: worker.hireDate },
              { name: 'Offer Letter', type: 'Employment', date: worker.hireDate },
              { name: 'NDA Agreement', type: 'Legal', date: worker.hireDate },
              { name: 'Benefits Enrollment Form', type: 'Benefits', date: worker.hireDate },
            ].map(doc => (
              <div key={doc.name} style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.12)' }}
                className="rounded-lg px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="rgba(99,102,241,0.5)" strokeWidth="1.2"/>
                    <path d="M5 5h6M5 8h6M5 11h4" stroke="rgba(99,102,241,0.4)" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <div className="text-zinc-200">{doc.name}</div>
                    <div style={{ color: '#475569' }}>{doc.type}</div>
                  </div>
                </div>
                <span style={{ color: '#94a3b8' }}>{doc.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4" style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
        <Link href={`/hr/workers/${worker.id}`}
          className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition">
          Open full worker profile →
        </Link>
      </div>
    </div>
  )
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(WORKERS)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol] = useState<keyof Worker>('empNo')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [drawerWorker, setDrawerWorker] = useState<Worker | null>(null)

  useEffect(() => {
    fetch('/api/hr/workers')
      .then(r => r.json())
      .then(data => { if (data?.workers?.length) setWorkers(data.workers) })
      .catch(() => {})
  }, [])

  const depts = ['All', ...Array.from(new Set(WORKERS.map(w => w.department))).sort()]

  const filtered = workers.filter(w => {
    const matchSearch = search === '' ||
      w.fullName.toLowerCase().includes(search.toLowerCase()) ||
      w.empNo.toLowerCase().includes(search.toLowerCase()) ||
      w.jobTitle.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'All' || w.department === deptFilter
    const matchStatus = statusFilter === 'All' || w.status === statusFilter
    return matchSearch && matchDept && matchStatus
  })

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortCol], bv = b[sortCol]
    const cmp = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  function toggleSort(col: keyof Worker) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function toggleAll() {
    if (selected.size === sorted.length) setSelected(new Set())
    else setSelected(new Set(sorted.map(w => w.id)))
  }

  function toggleOne(id: string) {
    const s = new Set(selected)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelected(s)
  }

  const SortIcon = ({ col }: { col: keyof Worker }) => (
    <span className="ml-1 opacity-40 text-[10px]">
      {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  )

  const actions = (
    <>
      <button style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}
        className="px-3 py-1.5 rounded text-xs font-medium hover:opacity-90 transition">
        + Hire Worker
      </button>
      {['Mass Update', 'Export'].map(lbl => (
        <button key={lbl}
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
          className="px-3 py-1.5 rounded text-xs font-medium hover:opacity-80 transition">
          {lbl}
        </button>
      ))}
    </>
  )

  return (
    <div className="min-h-[100dvh]" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Workers"
        breadcrumb={[{ label: 'Human Resources', href: '/hr' }]}
        actions={actions}
      />

      {/* Filter Bar */}
      <div className="px-6 pt-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, ID, or title…"
          className="px-3 py-1.5 rounded text-xs outline-none w-52"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
        />
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-1.5 rounded text-xs outline-none"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
          {depts.map(d => (
            <option key={d} value={d} style={{ background: '#16213e' }}>{d === 'All' ? 'Department: All' : d}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded text-xs outline-none"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
          {['All', 'Active', 'Terminated', 'On Leave'].map(s => (
            <option key={s} value={s} style={{ background: '#16213e' }}>{s === 'All' ? 'Status: All' : s}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Manager"
          className="px-3 py-1.5 rounded text-xs outline-none w-36"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
        />
        <div className="flex gap-1">
          <input type="date" className="px-2 py-1.5 rounded text-xs outline-none"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }} />
          <input type="date" className="px-2 py-1.5 rounded text-xs outline-none"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }} />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pt-4 pb-8">
        <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }} className="rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  <th className="w-8 py-2.5 px-3">
                    <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0}
                      onChange={toggleAll} className="accent-indigo-500" />
                  </th>
                  <th className="py-2.5 px-3 w-12" style={{ color: '#94a3b8' }}>Photo</th>
                  {([
                    ['empNo', 'Employee #'],
                    ['fullName', 'Full Name'],
                    ['jobTitle', 'Job Title'],
                    ['department', 'Department'],
                    ['manager', 'Manager'],
                    ['hireDate', 'Hire Date'],
                    ['status', 'Status'],
                    ['location', 'Location'],
                  ] as [keyof Worker, string][]).map(([col, label]) => (
                    <th key={col} onClick={() => toggleSort(col)}
                      className="py-2.5 px-3 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                      style={{ color: '#94a3b8' }}>
                      {label}<SortIcon col={col} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(worker => (
                  <tr key={worker.id}
                    style={{
                      borderBottom: '1px solid rgba(99,102,241,0.08)',
                      opacity: worker.status === 'Terminated' ? 0.5 : 1
                    }}
                    className="hover:bg-indigo-500/5 transition-colors cursor-pointer"
                    onClick={() => setDrawerWorker(worker)}>
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(worker.id)} onChange={() => toggleOne(worker.id)} className="accent-indigo-500" />
                    </td>
                    <td className="py-2.5 px-3">
                      <Avatar initials={worker.initials} color={worker.deptColor} />
                    </td>
                    <td className="py-2.5 px-3 font-mono" style={{ color: '#94a3b8' }}>{worker.empNo}</td>
                    <td className="py-2.5 px-3">
                      <Link href={`/hr/workers/${worker.id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                        {worker.fullName}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300">{worker.jobTitle}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: worker.deptColor, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ color: '#94a3b8' }}>{worker.department}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{worker.manager}</td>
                    <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{worker.hireDate}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_CHIP[worker.status]}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>{worker.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
            <span className="text-xs" style={{ color: '#94a3b8' }}>1-25 of 342 records</span>
            <div className="flex gap-1">
              {['‹', '1', '2', '3', '...', '14', '›'].map((p, i) => (
                <button key={i}
                  className="w-7 h-7 rounded text-xs flex items-center justify-center transition"
                  style={p === '1'
                    ? { background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }
                    : { background: 'rgba(99,102,241,0.06)', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.1)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Worker Drawer */}
      {drawerWorker && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDrawerWorker(null)} />
          <WorkerDrawer worker={drawerWorker} onClose={() => setDrawerWorker(null)} />
        </>
      )}
    </div>
  )
}
