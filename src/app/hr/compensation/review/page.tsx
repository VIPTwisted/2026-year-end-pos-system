export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { RefreshCw, Send } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const STATUS_COLORS: Record<string, string> = {
  'Pending':   'bg-amber-500/10 text-amber-400',
  'Approved':  'bg-emerald-500/10 text-emerald-400',
  'Declined':  'bg-red-500/10 text-red-400',
  'On Hold':   'bg-zinc-700 text-zinc-400',
}

const SAMPLE_REVIEWS = [
  { id: '1', employeeNo: 'EMP-001', name: 'John Smith',    title: 'Senior Engineer',  currentSalary: 95000, proposedSalary: 102000, reviewDate: '2026-04-01', status: 'Approved', manager: 'Jane Doe' },
  { id: '2', employeeNo: 'EMP-002', name: 'Maria Garcia',  title: 'Marketing Lead',   currentSalary: 78000, proposedSalary:  83000, reviewDate: '2026-04-01', status: 'Pending',  manager: 'Bob Lee' },
  { id: '3', employeeNo: 'EMP-003', name: 'Chen Wei',      title: 'Dev Manager',      currentSalary: 125000, proposedSalary: 132000, reviewDate: '2026-04-01', status: 'Pending', manager: 'Jane Doe' },
  { id: '4', employeeNo: 'EMP-004', name: 'Aisha Patel',   title: 'QA Analyst',       currentSalary: 62000, proposedSalary:  64000, reviewDate: '2026-04-01', status: 'Approved', manager: 'Chen Wei' },
  { id: '5', employeeNo: 'EMP-005', name: 'Robert Torres', title: 'Warehouse Staff',  currentSalary: 42000, proposedSalary:  44000, reviewDate: '2026-04-01', status: 'On Hold',  manager: 'Bob Lee' },
]

export default function CompensationReviewPage() {
  const totalCurrentBudget = SAMPLE_REVIEWS.reduce((s, r) => s + r.currentSalary, 0)
  const totalProposedBudget = SAMPLE_REVIEWS.reduce((s, r) => s + r.proposedSalary, 0)
  const totalIncrease = totalProposedBudget - totalCurrentBudget

  return (
    <>
      <TopBar
        title="Compensation Review"
        breadcrumb={[
          { label: 'Human Resources', href: '/hr' },
          { label: 'Compensation', href: '/hr/compensation' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Eligibility
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[12px] font-medium rounded transition-colors">
              <Send className="w-3.5 h-3.5" /> Submit for Approval
            </button>
          </div>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Eligible Employees</div>
            <div className="text-2xl font-bold text-zinc-100">{SAMPLE_REVIEWS.length}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Current Budget</div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums">{formatCurrency(totalCurrentBudget)}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Proposed Budget</div>
            <div className="text-xl font-bold text-blue-400 tabular-nums">{formatCurrency(totalProposedBudget)}</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Increase</div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">+{formatCurrency(totalIncrease)}</div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Employee No.</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Title</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Manager</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Current Salary</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Proposed Salary</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Increase</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_REVIEWS.map((r, idx) => {
                const increase = r.proposedSalary - r.currentSalary
                const pct = ((increase / r.currentSalary) * 100).toFixed(1)
                return (
                  <tr key={r.id} className={`hover:bg-zinc-800/30 transition-colors ${idx !== SAMPLE_REVIEWS.length - 1 ? 'border-b border-zinc-800/40' : ''}`}>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-blue-400">{r.employeeNo}</td>
                    <td className="px-4 py-2.5 text-zinc-200 font-medium">{r.name}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{r.title}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-[12px]">{r.manager}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-zinc-300">{formatCurrency(r.currentSalary)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-zinc-200">{formatCurrency(r.proposedSalary)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400 font-semibold">
                      +{formatCurrency(increase)} ({pct}%)
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[12px] text-zinc-500">{SAMPLE_REVIEWS.length} employees in cycle</div>
      </div>
    </>
  )
}
