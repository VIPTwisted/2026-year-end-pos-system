'use client'

import { useState } from 'react'
import {
  Calendar, ChevronRight, Search, CheckCircle, XCircle, Clock,
  Plus, Download, ThumbsUp, X, Users,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

type LeaveRequest = {
  id: string
  employee: string
  dept: string
  leaveType: string
  from: string
  to: string
  days: number
  status: 'Pending' | 'Approved' | 'Denied' | 'Cancelled'
  approver: string
  note?: string
}

type ViewMode = 'list' | 'calendar'

const SEED: LeaveRequest[] = [
  { id: 'lr1', employee: 'Aisha Torres',    dept: 'Operations',  leaveType: 'Vacation',    from: '2026-05-05', to: '2026-05-09', days: 5, status: 'Approved',   approver: 'Kim Reyes' },
  { id: 'lr2', employee: 'Marcus Webb',     dept: 'Sales',       leaveType: 'Sick',        from: '2026-04-22', to: '2026-04-23', days: 2, status: 'Pending',    approver: 'Kim Reyes' },
  { id: 'lr3', employee: 'Priya Nair',      dept: 'HR',          leaveType: 'FMLA',        from: '2026-05-01', to: '2026-07-25', days: 84,status: 'Approved',   approver: 'Dana Cole', note: 'FMLA approved per doctor note' },
  { id: 'lr4', employee: 'Jordan Blake',    dept: 'Finance',     leaveType: 'Bereavement', from: '2026-04-24', to: '2026-04-26', days: 3, status: 'Approved',   approver: 'Kim Reyes' },
  { id: 'lr5', employee: 'Sam Okonkwo',     dept: 'Warehouse',   leaveType: 'Jury Duty',   from: '2026-05-12', to: '2026-05-16', days: 5, status: 'Pending',    approver: 'Luis Park' },
  { id: 'lr6', employee: 'Tara Singh',      dept: 'Marketing',   leaveType: 'Vacation',    from: '2026-06-01', to: '2026-06-06', days: 6, status: 'Pending',    approver: 'Dana Cole' },
  { id: 'lr7', employee: 'Devon Morris',    dept: 'Engineering', leaveType: 'Unpaid',      from: '2026-04-28', to: '2026-04-30', days: 3, status: 'Denied',     approver: 'Luis Park', note: 'Insufficient notice' },
  { id: 'lr8', employee: 'Nadia Flores',    dept: 'Retail',      leaveType: 'Sick',        from: '2026-04-21', to: '2026-04-21', days: 1, status: 'Cancelled',  approver: 'Kim Reyes' },
]

const LEAVE_TYPES = ['Vacation', 'Sick', 'FMLA', 'Bereavement', 'Jury Duty', 'Unpaid']

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
  Pending:   { bg: 'bg-amber-500/15',  text: 'text-amber-400',  icon: <Clock className="w-3 h-3" /> },
  Approved:  { bg: 'bg-emerald-500/15',text: 'text-emerald-400',icon: <CheckCircle className="w-3 h-3" /> },
  Denied:    { bg: 'bg-red-500/15',    text: 'text-red-400',    icon: <XCircle className="w-3 h-3" /> },
  Cancelled: { bg: 'bg-zinc-700/40',   text: 'text-zinc-500',   icon: <X className="w-3 h-3" /> },
}

const TYPE_COLOR: Record<string, string> = {
  Vacation:    'bg-blue-500/15 text-blue-300',
  Sick:        'bg-rose-500/15 text-rose-300',
  FMLA:        'bg-violet-500/15 text-violet-300',
  Bereavement: 'bg-zinc-600/40 text-zinc-300',
  'Jury Duty': 'bg-amber-500/15 text-amber-300',
  Unpaid:      'bg-orange-500/15 text-orange-300',
}

const TEAM_OUT = [
  { name: 'Aisha Torres',  dates: [5, 6, 7, 8, 9], color: 'bg-blue-500/20 text-blue-300' },
  { name: 'Priya Nair',    dates: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30], color: 'bg-violet-500/20 text-violet-300' },
  { name: 'Sam Okonkwo',   dates: [12,13,14,15,16], color: 'bg-emerald-500/20 text-emerald-300' },
]

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function MiniCalendar({ month = 4, year = 2026 }: { month?: number; year?: number }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = 22

  const outDates = new Set(TEAM_OUT.flatMap(t => t.dates))

  const cells: (number | null)[] = [...Array(firstDay).fill(null)]
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="text-[11px]">
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-zinc-500 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`text-center py-1.5 rounded transition-colors ${
              !d ? '' :
              d === today ? 'bg-indigo-600 text-white font-semibold' :
              outDates.has(d) ? 'bg-amber-500/20 text-amber-300 font-medium' :
              'text-zinc-400 hover:bg-zinc-800/60'
            }`}
          >
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Cancelled
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
      {s.icon}
      {status}
    </span>
  )
}

export default function LeaveAbsencePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(SEED)
  const [view, setView] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = requests.filter(r => {
    const matchQ = !search || r.employee.toLowerCase().includes(search.toLowerCase())
    const matchT = !typeFilter || r.leaveType === typeFilter
    const matchS = !statusFilter || r.status === statusFilter
    return matchQ && matchT && matchS
  })

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const massApprove = () => {
    setRequests(prev => prev.map(r =>
      selected.has(r.id) && r.status === 'Pending' ? { ...r, status: 'Approved' } : r
    ))
    setSelected(new Set())
  }

  const pendingCount = requests.filter(r => r.status === 'Pending').length

  return (
    <>
      <TopBar
        title="Leave & Absence"
        breadcrumb={[{ label: 'HR', href: '/hr' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Human Resources</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Leave & Absence</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{pendingCount} pending requests</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-zinc-500">HR</span>
              <ChevronRight className="w-3 h-3 text-zinc-700" />
              <span className="text-zinc-300">Leave & Absence</span>
            </div>
          </div>

          {/* Leave Balance Bar */}
          <div className="bg-[#13142b] border border-indigo-900/30 rounded-xl p-4">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3">My Leave Balances</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'PTO / Vacation', days: 12, total: 15, color: 'bg-blue-500' },
                { label: 'Sick Leave',     days: 8,  total: 10, color: 'bg-rose-500' },
                { label: 'FMLA',           days: 84, total: 84, color: 'bg-violet-500' },
              ].map(({ label, days, total, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-zinc-400">{label}</span>
                    <span className="text-[11px] font-medium text-zinc-200">{days}<span className="text-zinc-500">/{total} days</span></span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${(days / total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Ribbon */}
          <div className="flex items-center gap-1.5 py-2 border-y border-zinc-800/60 flex-wrap">
            {[
              { label: '+ Request Leave', primary: true },
              { label: 'Approve',         primary: false },
              { label: 'Deny',            primary: false },
              { label: 'Cancel',          primary: false },
              { label: 'Mass Approve',    primary: false, action: massApprove },
              { label: 'Export',          primary: false },
            ].map(({ label, primary, action }) => (
              <button
                key={label}
                onClick={action}
                className={`px-3 py-1.5 text-[11px] rounded-md font-medium transition-colors ${
                  primary
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              {(['list', 'calendar'] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-[11px] rounded-md font-medium capitalize transition-colors ${
                    view === v ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Main content + right panel */}
          <div className="flex gap-4 items-start">

            {/* Leave Requests Table */}
            <div className="flex-1 min-w-0 bg-[#13142b] border border-indigo-900/30 rounded-xl overflow-hidden">
              {/* Filters */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 flex-wrap">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search employee..."
                    className="pl-8 pr-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 w-full"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="bg-zinc-800/60 border border-zinc-700/40 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Types</option>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-zinc-800/60 border border-zinc-700/40 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  {['Pending', 'Approved', 'Denied', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {view === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-zinc-800/60">
                        <th className="w-8 px-4 py-2.5 text-left">
                          <input type="checkbox" className="accent-indigo-500" />
                        </th>
                        {['Employee', 'Leave Type', 'From', 'To', 'Days', 'Status', 'Approver'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-zinc-500 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, i) => (
                        <tr
                          key={r.id}
                          className={`border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                        >
                          <td className="px-4 py-2.5">
                            <input
                              type="checkbox"
                              checked={selected.has(r.id)}
                              onChange={() => toggleSelect(r.id)}
                              className="accent-indigo-500"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-medium text-zinc-100">{r.employee}</div>
                            <div className="text-zinc-500 text-[10px]">{r.dept}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLOR[r.leaveType] ?? 'bg-zinc-700/40 text-zinc-400'}`}>
                              {r.leaveType}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-zinc-300 whitespace-nowrap">{r.from}</td>
                          <td className="px-3 py-2.5 text-zinc-300 whitespace-nowrap">{r.to}</td>
                          <td className="px-3 py-2.5 font-medium text-zinc-100">{r.days}</td>
                          <td className="px-3 py-2.5">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-3 py-2.5 text-zinc-400">{r.approver}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-4">
                  <p className="text-[11px] text-zinc-500 mb-3">May 2026</p>
                  <div className="grid grid-cols-7 gap-1 text-[11px]">
                    {DAYS_OF_WEEK.map(d => (
                      <div key={d} className="text-center text-zinc-500 font-medium py-1">{d}</div>
                    ))}
                    {[null,null,null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((d, i) => (
                      <div
                        key={i}
                        className={`text-center py-2 rounded ${
                          !d ? '' :
                          [5,6,7,8,9].includes(d) ? 'bg-blue-500/20 text-blue-300' :
                          [12,13,14,15,16].includes(d) ? 'bg-emerald-500/20 text-emerald-300' :
                          'text-zinc-400 hover:bg-zinc-800/60'
                        }`}
                      >
                        {d || ''}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/30 inline-block" />Aisha Torres (Vacation)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 inline-block" />Sam Okonkwo (Jury Duty)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Team Calendar Panel */}
            <div className="w-60 shrink-0 bg-[#13142b] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <p className="text-[11px] font-semibold text-zinc-300">Team Calendar</p>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">May 2026</p>
              <MiniCalendar month={4} year={2026} />
              <div className="mt-4 space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Out This Month</p>
                {TEAM_OUT.map(t => (
                  <div key={t.name} className={`rounded-lg px-2.5 py-1.5 ${t.color} text-[10px] font-medium`}>
                    {t.name}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
