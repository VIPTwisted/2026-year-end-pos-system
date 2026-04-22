'use client'

import { useEffect, useState } from 'react'
import {
  Shield, Plus, Pencil, Users, Download, UserPlus, Ban, RefreshCw,
  ChevronRight, Search, CheckCircle, AlertTriangle, Clock,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

type Plan = {
  id: string
  planName: string
  planType: string
  provider: string | null
  enrollment: number
  employeeCost: number
  employerCost: number
  effectiveDate: string
  status: 'Active' | 'Inactive' | 'Expiring'
}

type EnrollmentRow = {
  id: string
  employee: string
  dept: string
  medical: boolean
  dental: boolean
  vision: boolean
  life: boolean
  retirement: boolean
  fsa: boolean
  hsa: boolean
}

const SEED_PLANS: Plan[] = [
  { id: '1', planName: 'Blue Shield PPO 2000',    planType: 'Medical',         provider: 'Blue Shield',         enrollment: 38, employeeCost: 220, employerCost: 580, effectiveDate: '2026-01-01', status: 'Active' },
  { id: '2', planName: 'Delta Dental Plus',        planType: 'Dental',          provider: 'Delta Dental',        enrollment: 41, employeeCost: 32,  employerCost: 88,  effectiveDate: '2026-01-01', status: 'Active' },
  { id: '3', planName: 'VSP Vision Care',          planType: 'Vision',          provider: 'VSP',                 enrollment: 35, employeeCost: 8,   employerCost: 22,  effectiveDate: '2026-01-01', status: 'Active' },
  { id: '4', planName: 'MetLife Basic Life 50k',   planType: 'Life Insurance',  provider: 'MetLife',             enrollment: 48, employeeCost: 0,   employerCost: 15,  effectiveDate: '2026-01-01', status: 'Active' },
  { id: '5', planName: 'Fidelity 401k Plus',       planType: '401k',            provider: 'Fidelity',            enrollment: 44, employeeCost: 0,   employerCost: 0,   effectiveDate: '2026-01-01', status: 'Active' },
  { id: '6', planName: 'Health FSA 2026',          planType: 'FSA',             provider: 'WageWorks',           enrollment: 18, employeeCost: 0,   employerCost: 0,   effectiveDate: '2026-01-01', status: 'Expiring' },
  { id: '7', planName: 'HSA High-Deductible Plan', planType: 'HSA',             provider: 'Optum Bank',          enrollment: 12, employeeCost: 180, employerCost: 420, effectiveDate: '2026-03-01', status: 'Active' },
]

const SEED_ENROLLMENTS: EnrollmentRow[] = [
  { id: 'e1', employee: 'Aisha Torres',    dept: 'Operations',  medical: true,  dental: true,  vision: true,  life: true,  retirement: true,  fsa: false, hsa: false },
  { id: 'e2', employee: 'Marcus Webb',     dept: 'Sales',       medical: true,  dental: false, vision: false, life: true,  retirement: true,  fsa: true,  hsa: false },
  { id: 'e3', employee: 'Priya Nair',      dept: 'HR',          medical: false, dental: true,  vision: true,  life: true,  retirement: false, fsa: false, hsa: true  },
  { id: 'e4', employee: 'Jordan Blake',    dept: 'Finance',     medical: true,  dental: true,  vision: false, life: true,  retirement: true,  fsa: false, hsa: false },
  { id: 'e5', employee: 'Sam Okonkwo',     dept: 'Warehouse',   medical: true,  dental: true,  vision: true,  life: false, retirement: true,  fsa: false, hsa: false },
]

const TYPE_COLOR: Record<string, string> = {
  'Medical':        'bg-blue-500/15 text-blue-300',
  'Dental':         'bg-cyan-500/15 text-cyan-300',
  'Vision':         'bg-violet-500/15 text-violet-300',
  'Life Insurance': 'bg-amber-500/15 text-amber-300',
  '401k':           'bg-emerald-500/15 text-emerald-300',
  'FSA':            'bg-orange-500/15 text-orange-300',
  'HSA':            'bg-teal-500/15 text-teal-300',
}

const STATUS_COLOR: Record<string, string> = {
  Active:   'bg-emerald-500/15 text-emerald-400',
  Inactive: 'bg-zinc-700/40 text-zinc-400',
  Expiring: 'bg-amber-500/15 text-amber-400',
}

function Pill({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}>{label}</span>
}

function KpiTile({ label, value, sub, color = 'text-zinc-100' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-[#13142b] border border-indigo-900/30 rounded-xl p-4">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function BenefitsPage() {
  const [plans, setPlans] = useState<Plan[]>(SEED_PLANS)
  const [enrollments] = useState<EnrollmentRow[]>(SEED_ENROLLMENTS)
  const [search, setSearch] = useState('')
  const [enrollSearch, setEnrollSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [openEnrollPeriod] = useState(true)

  const filtered = plans.filter(p =>
    p.planName.toLowerCase().includes(search.toLowerCase()) ||
    p.planType.toLowerCase().includes(search.toLowerCase())
  )

  const filteredEnroll = enrollments.filter(e =>
    e.employee.toLowerCase().includes(enrollSearch.toLowerCase()) ||
    e.dept.toLowerCase().includes(enrollSearch.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const expiringCount = plans.filter(p => p.status === 'Expiring').length
  const enrolledCount = plans.reduce((acc, p) => Math.max(acc, p.enrollment), 0)

  return (
    <>
      <TopBar
        title="Benefits Management"
        breadcrumb={[{ label: 'HR', href: '/hr' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Human Resources</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Benefits Management</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Manage benefit plans, enrollment, and coverage</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-zinc-500">HR</span>
              <ChevronRight className="w-3 h-3 text-zinc-700" />
              <span className="text-zinc-300">Benefits</span>
            </div>
          </div>

          {/* KPI Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiTile label="Enrolled Employees" value={enrolledCount} sub="across all plans" />
            <KpiTile
              label="Open Enrollment"
              value={openEnrollPeriod ? 'Active' : 'Inactive'}
              sub={openEnrollPeriod ? 'Ends Jun 30, 2026' : 'Next: Jan 2027'}
              color={openEnrollPeriod ? 'text-emerald-400' : 'text-zinc-500'}
            />
            <KpiTile label="Plans Expiring" value={expiringCount} sub="within 60 days" color="text-amber-400" />
            <KpiTile label="Pending Enrollments" value={5} sub="awaiting approval" color="text-indigo-400" />
          </div>

          {/* Action Ribbon */}
          <div className="flex items-center gap-1.5 py-2 border-y border-zinc-800/60 flex-wrap">
            {[
              { label: '+ Add Plan',        primary: true },
              { label: 'Edit',              primary: false },
              { label: 'Enroll Employee',   primary: false },
              { label: 'Terminate Coverage',primary: false },
              { label: 'Open Enrollment',   primary: false },
              { label: 'Export',            primary: false },
            ].map(({ label, primary }) => (
              <button
                key={label}
                className={`px-3 py-1.5 text-[11px] rounded-md font-medium transition-colors ${
                  primary
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Plans Table */}
          <div className="bg-[#13142b] border border-indigo-900/30 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
              <p className="text-[12px] font-semibold text-zinc-300">Benefit Plans</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search plans..."
                  className="pl-8 pr-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 w-48"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="w-8 px-4 py-2.5 text-left">
                      <input type="checkbox" className="accent-indigo-500" />
                    </th>
                    {['Plan Name', 'Plan Type', 'Provider', 'Enrollment', 'Employee Cost', 'Employer Cost', 'Effective Date', 'Status'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-zinc-500 font-medium whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-3 py-2.5 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                    >
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="accent-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-2.5 font-medium text-zinc-100">{p.planName}</td>
                      <td className="px-3 py-2.5">
                        <Pill label={p.planType} color={TYPE_COLOR[p.planType] ?? 'bg-zinc-700/40 text-zinc-400'} />
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{p.provider ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-zinc-500" />
                          <span className="text-zinc-200">{p.enrollment}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-200">${p.employeeCost.toLocaleString()}<span className="text-zinc-500">/mo</span></td>
                      <td className="px-3 py-2.5 text-zinc-200">${p.employerCost.toLocaleString()}<span className="text-zinc-500">/mo</span></td>
                      <td className="px-3 py-2.5 text-zinc-400 whitespace-nowrap">{p.effectiveDate}</td>
                      <td className="px-3 py-2.5">
                        <Pill label={p.status} color={STATUS_COLOR[p.status]} />
                      </td>
                      <td className="px-3 py-2.5">
                        <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Enrollment Section */}
          <div className="bg-[#13142b] border border-indigo-900/30 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
              <p className="text-[12px] font-semibold text-zinc-300">Employee Enrollment Status</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  value={enrollSearch}
                  onChange={e => setEnrollSearch(e.target.value)}
                  placeholder="Search employees..."
                  className="pl-8 pr-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 w-48"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Employee</th>
                    <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Dept</th>
                    {['Medical', 'Dental', 'Vision', 'Life', '401k', 'FSA', 'HSA'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{h}</th>
                    ))}
                    <th className="px-3 py-2.5 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {filteredEnroll.map((e, i) => {
                    const flags = [e.medical, e.dental, e.vision, e.life, e.retirement, e.fsa, e.hsa]
                    return (
                      <tr key={e.id} className={`border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                        <td className="px-4 py-2.5 font-medium text-zinc-100">{e.employee}</td>
                        <td className="px-3 py-2.5 text-zinc-400">{e.dept}</td>
                        {flags.map((v, fi) => (
                          <td key={fi} className="px-3 py-2.5 text-center">
                            {v
                              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                              : <span className="w-3.5 h-0.5 bg-zinc-700 block mx-auto rounded" />
                            }
                          </td>
                        ))}
                        <td className="px-3 py-2.5">
                          <button className="text-zinc-600 hover:text-indigo-400 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
