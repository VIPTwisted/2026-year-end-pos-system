import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react'

// TODO: add CompensationReviewCycle model to schema with fields:
//   id, name, planId, planName, status, startDate, endDate,
//   managersSubmitted, totalManagers, approvedCount

type ReviewCycle = {
  id: string
  name: string
  planName: string
  status: 'draft' | 'in-progress' | 'review' | 'approved' | 'closed'
  startDate: string
  endDate: string
  managersSubmitted: number
  totalManagers: number
  approvedCount: number
}

const STATUS_COLORS: Record<string, string> = {
  draft:       'bg-zinc-700/40 text-zinc-400 border-zinc-700/40',
  'in-progress': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  review:      'bg-amber-500/15 text-amber-400 border-amber-500/20',
  approved:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  closed:      'bg-zinc-600/30 text-zinc-500 border-zinc-600/30',
}

const MOCK_CYCLES: ReviewCycle[] = [
  {
    id: 'cyc-1',
    name: '2026 Annual Merit Review',
    planName: 'Retail Sales Pay Grades',
    status: 'in-progress',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    managersSubmitted: 6,
    totalManagers: 10,
    approvedCount: 4,
  },
  {
    id: 'cyc-2',
    name: 'Q1 2026 Bonus Cycle',
    planName: 'Annual Performance Bonus',
    status: 'review',
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    managersSubmitted: 10,
    totalManagers: 10,
    approvedCount: 7,
  },
  {
    id: 'cyc-3',
    name: '2025 Year-End Merit Review',
    planName: 'Retail Sales Pay Grades',
    status: 'closed',
    startDate: '2025-11-01',
    endDate: '2025-12-15',
    managersSubmitted: 10,
    totalManagers: 10,
    approvedCount: 10,
  },
]

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-zinc-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function CompensationProcessPage() {
  const cycles = MOCK_CYCLES

  const active      = cycles.filter(c => c.status === 'in-progress').length
  const inReview    = cycles.filter(c => c.status === 'review').length
  const totalApproved = cycles.reduce((s, c) => s + c.approvedCount, 0)

  return (
    <>
      <TopBar title="Compensation Review Process" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div>
          <Link href="/hr/compensation" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Compensation
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-zinc-100">Compensation Review Process</h1>
              <p className="text-[13px] text-zinc-500">Merit and bonus cycles, manager submissions, approvals</p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              New Cycle
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Cycles', value: active, color: 'text-blue-400' },
            { label: 'Pending Review', value: inReview, color: 'text-amber-400' },
            { label: 'Total Approved', value: totalApproved, color: 'text-emerald-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Cycles */}
        <div className="space-y-3">
          {cycles.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-500">
              <RefreshCw className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[13px]">No compensation cycles yet</p>
            </div>
          ) : (
            cycles.map(c => (
              <div key={c.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[15px] font-semibold text-zinc-100">{c.name}</h3>
                    <p className="text-[12px] text-zinc-500 mt-0.5">Plan: {c.planName}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] border font-medium capitalize ${STATUS_COLORS[c.status]}`}>
                    {c.status.replace('-', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: 'Start Date', value: new Date(c.startDate).toLocaleDateString() },
                    { label: 'End Date', value: new Date(c.endDate).toLocaleDateString() },
                    { label: 'Managers Submitted', value: `${c.managersSubmitted} / ${c.totalManagers}` },
                    { label: 'Approved', value: `${c.approvedCount}` },
                  ].map(d => (
                    <div key={d.label}>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">{d.label}</p>
                      <p className="text-[13px] font-medium text-zinc-200">{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Submission progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-zinc-500">Manager Submissions</p>
                    <p className="text-[11px] text-zinc-500">{c.managersSubmitted}/{c.totalManagers}</p>
                  </div>
                  <ProgressBar value={c.managersSubmitted} max={c.totalManagers} />
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </>
  )
}
