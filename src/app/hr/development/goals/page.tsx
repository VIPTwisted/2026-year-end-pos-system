import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Plus, Target } from 'lucide-react'

// TODO: add EmployeeGoal model to schema with fields:
//   id, employeeId, employeeName, title, description, category,
//   targetDate, progress (Int), status, measurementCriteria, createdAt, updatedAt

type Goal = {
  id: string
  employeeName: string
  title: string
  category: string
  dueDate: string
  progress: number
  status: 'on-track' | 'at-risk' | 'overdue' | 'completed' | 'cancelled'
}

const STATUS_COLORS: Record<string, string> = {
  'on-track':  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'at-risk':   'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'overdue':   'bg-red-500/15 text-red-400 border-red-500/20',
  'completed': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'cancelled': 'bg-zinc-700/40 text-zinc-500 border-zinc-700/40',
}

const CATEGORY_COLORS: Record<string, string> = {
  Performance:  'bg-purple-500/10 text-purple-400',
  Learning:     'bg-cyan-500/10 text-cyan-400',
  Leadership:   'bg-blue-500/10 text-blue-400',
  Operations:   'bg-amber-500/10 text-amber-400',
  Compliance:   'bg-zinc-700/30 text-zinc-400',
  Career:       'bg-emerald-500/10 text-emerald-400',
}

const ALL_GOALS: Goal[] = [
  { id: 'g1', employeeName: 'Jessica Moore', title: 'Complete POS Certification', category: 'Learning', dueDate: '2026-06-30', progress: 65, status: 'on-track' },
  { id: 'g2', employeeName: 'Marcus Thompson', title: 'Improve Customer Satisfaction Score to 4.8', category: 'Performance', dueDate: '2026-05-31', progress: 40, status: 'at-risk' },
  { id: 'g3', employeeName: 'Priya Sharma', title: 'Lead 2 Team Training Sessions', category: 'Leadership', dueDate: '2026-04-15', progress: 20, status: 'overdue' },
  { id: 'g4', employeeName: 'Carlos Reyes', title: 'Reduce Warehouse Receiving Errors by 30%', category: 'Operations', dueDate: '2026-07-01', progress: 80, status: 'on-track' },
  { id: 'g5', employeeName: 'Tanya Williams', title: 'Complete HR Certification Renewal', category: 'Compliance', dueDate: '2026-03-31', progress: 100, status: 'completed' },
  { id: 'g6', employeeName: 'Derek Park', title: 'Implement Automated Patch Management', category: 'Operations', dueDate: '2026-08-01', progress: 15, status: 'on-track' },
  { id: 'g7', employeeName: 'Elena Foster', title: 'Earn SHRM-CP Certification', category: 'Career', dueDate: '2026-09-30', progress: 30, status: 'on-track' },
]

function ProgressBar({ pct, status }: { pct: number; status: string }) {
  const barColor: Record<string, string> = {
    'completed': 'bg-blue-500',
    'overdue': 'bg-red-500',
    'at-risk': 'bg-amber-500',
    'on-track': 'bg-emerald-500',
    'cancelled': 'bg-zinc-600',
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor[status] ?? 'bg-zinc-600'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-zinc-500">{pct}%</span>
    </div>
  )
}

export default function GoalsPage() {
  const goals = ALL_GOALS

  const byStatus = goals.reduce<Record<string, number>>((acc, g) => {
    acc[g.status] = (acc[g.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <TopBar title="Employee Goals" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div>
          <Link href="/hr/development" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Development
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-zinc-100">Employee Goals</h1>
              <p className="text-[13px] text-zinc-500">{goals.length} goals across all employees</p>
            </div>
            <Link
              href="/hr/development/goals/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Goal
            </Link>
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['on-track', 'at-risk', 'overdue', 'completed', 'cancelled'] as const).map(s => {
            const labelMap: Record<string, string> = {
              'on-track': 'On Track', 'at-risk': 'At Risk', 'overdue': 'Overdue',
              'completed': 'Completed', 'cancelled': 'Cancelled',
            }
            return (
              <div key={s} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">{labelMap[s]}</p>
                <p className={`text-xl font-bold ${STATUS_COLORS[s].split(' ')[1]}`}>{byStatus[s] ?? 0}</p>
              </div>
            )
          })}
        </div>

        {/* Goals table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Target className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[13px] mb-3">No goals defined yet</p>
              <Link
                href="/hr/development/goals/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
              >
                Create First Goal
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Goal</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Employee</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Category</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Due Date</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Progress</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map(g => (
                    <tr key={g.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5 max-w-[240px]">
                        <p className="font-medium text-zinc-100 truncate">{g.title}</p>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{g.employeeName}</td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CATEGORY_COLORS[g.category] ?? 'bg-zinc-700/30 text-zinc-400'}`}>
                          {g.category}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500 text-[12px]">
                        {new Date(g.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <ProgressBar pct={g.progress} status={g.status} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] border font-medium capitalize ${STATUS_COLORS[g.status]}`}>
                          {g.status.replace('-', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
