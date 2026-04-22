import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, Briefcase, ListChecks, BarChart3, BookOpen, DollarSign,
  ChevronRight, Target,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

type Job = {
  id: string; jobNo: string; description: string; customerId: string | null
  firstName: string | null; lastName: string | null; responsible: string | null
  status: string; percentComplete: number; totalContractPrice: number; totalScheduleCost: number
  createdAt: string; updatedAt: string
}
type JobTask = {
  id: string; jobId: string; taskNo: string; description: string; taskType: string
  percentComplete: number; scheduleTotalCost: number; usageTotalCost: number
}
type PlanningLine = {
  id: string; entryType: string; resourceNo: string | null; description: string | null
  planningDate: string | null; quantity: number; unitPrice: number; totalPrice: number; lineType: string
  taskNo: string | null
}

const STATUS_COLOR: Record<string, string> = {
  Planning:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Open:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Completed: 'bg-zinc-700/40 text-zinc-400 border-zinc-700/50',
  Blocked:   'bg-red-500/20 text-red-400 border-red-500/30',
}

const TASK_TYPE_COLOR: Record<string, string> = {
  Posting:     'bg-blue-500/20 text-blue-400',
  Heading:     'bg-purple-500/20 text-purple-400',
  Total:       'bg-amber-500/20 text-amber-400',
  'Begin-Total': 'bg-zinc-700/40 text-zinc-400',
  'End-Total': 'bg-zinc-700/40 text-zinc-400',
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [jobRows, tasks, planningLines] = await Promise.all([
    prisma.$queryRawUnsafe<Job[]>(
      `SELECT j.*, c.firstName, c.lastName FROM "Job" j LEFT JOIN "Customer" c ON c.id = j.customerId WHERE j.id = ?`, id
    ),
    prisma.$queryRawUnsafe<JobTask[]>(`SELECT * FROM "JobTask" WHERE jobId = ? ORDER BY taskNo ASC`, id),
    prisma.$queryRawUnsafe<PlanningLine[]>(
      `SELECT p.*, t.taskNo FROM "JobPlanningLine" p LEFT JOIN "JobTask" t ON t.id = p.taskId WHERE p.jobId = ? ORDER BY p.planningDate ASC`, id
    ),
  ])

  if (!jobRows.length) notFound()
  const job = jobRows[0]

  const budgetTotal = planningLines.filter(l => l.lineType === 'Budget' || l.lineType === 'Both Budget and Billable').reduce((s, l) => s + Number(l.totalPrice), 0)
  const billableTotal = planningLines.filter(l => l.lineType === 'Billable' || l.lineType === 'Both Budget and Billable').reduce((s, l) => s + Number(l.totalPrice), 0)
  const pct = Number(job.percentComplete)

  return (
    <>
      <TopBar title={job.jobNo} />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] space-y-5">

        <Link href="/projects/jobs" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Jobs
        </Link>

        {/* Header Card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[20px] font-bold font-mono text-zinc-100">{job.jobNo}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLOR[job.status] ?? 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50'}`}>
                  {job.status}
                </span>
              </div>
              <p className="text-[14px] text-zinc-300">{job.description}</p>
              <div className="flex flex-wrap gap-4 text-[11px] text-zinc-500">
                {job.firstName && <span>Bill-to: <span className="text-zinc-300">{job.firstName} {job.lastName}</span></span>}
                {job.responsible && <span>Responsible: <span className="text-zinc-300">{job.responsible}</span></span>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 text-center">
              {[
                { label: 'Contract', value: formatCurrency(Number(job.totalContractPrice)) },
                { label: 'Schedule Cost', value: formatCurrency(Number(job.totalScheduleCost)) },
                { label: 'Budget Lines', value: formatCurrency(budgetTotal) },
                { label: 'Billable Lines', value: formatCurrency(billableTotal), highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="bg-[#0d0d1a] rounded-lg p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-[15px] font-bold tabular-nums ${highlight ? 'text-emerald-400' : 'text-zinc-200'}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2">
              <span>% Complete</span>
              <span className="font-mono font-medium text-zinc-300">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Link href={`/projects/jobs/${id}/tasks`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-md transition-colors">
              <ListChecks className="w-3.5 h-3.5" /> Job Tasks
            </Link>
            <Link href={`/projects/jobs/${id}/planning`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-md transition-colors">
              <BarChart3 className="w-3.5 h-3.5" /> Planning Lines
            </Link>
            <Link href="/projects/job-ledger" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-md transition-colors">
              <BookOpen className="w-3.5 h-3.5" /> Ledger Entries
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Job Tasks */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-zinc-400" />
                  <span className="text-[13px] font-semibold text-zinc-200">Job Tasks</span>
                  <span className="text-[10px] text-zinc-600">({tasks.length})</span>
                </div>
                <Link href={`/projects/jobs/${id}/tasks`} className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {tasks.length === 0 ? (
                <p className="px-5 py-4 text-[12px] text-zinc-600">No tasks yet. <Link href={`/projects/jobs/${id}/tasks`} className="text-blue-400 hover:underline">Add tasks</Link></p>
              ) : (
                <table className="w-full">
                  <thead className="border-b border-zinc-800/40">
                    <tr>
                      {['Task No', 'Description', 'Type', '% Complete', 'Schedule Cost', 'Usage Cost'].map(h => (
                        <th key={h} className={`px-4 py-2.5 text-[10px] uppercase tracking-wider text-zinc-500 font-medium ${['Task No', 'Description'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {tasks.slice(0, 8).map(task => (
                      <tr key={task.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-300">{task.taskNo}</td>
                        <td className="px-4 py-2.5 text-[12px] text-zinc-200 max-w-[160px] truncate">{task.description}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium ${TASK_TYPE_COLOR[task.taskType] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {task.taskType}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-zinc-300 tabular-nums">{Number(task.percentComplete).toFixed(0)}%</td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-zinc-400 tabular-nums">{formatCurrency(Number(task.scheduleTotalCost))}</td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-emerald-400 tabular-nums">{formatCurrency(Number(task.usageTotalCost))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Planning Lines */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  <span className="text-[13px] font-semibold text-zinc-200">Planning Lines</span>
                  <span className="text-[10px] text-zinc-600">({planningLines.length})</span>
                </div>
                <Link href={`/projects/jobs/${id}/planning`} className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {planningLines.length === 0 ? (
                <p className="px-5 py-4 text-[12px] text-zinc-600">No planning lines yet.</p>
              ) : (
                <table className="w-full">
                  <thead className="border-b border-zinc-800/40">
                    <tr>
                      {['Type', 'No.', 'Description', 'Date', 'Qty', 'Unit Price', 'Total Price', 'Line Type'].map(h => (
                        <th key={h} className={`px-4 py-2.5 text-[10px] uppercase tracking-wider text-zinc-500 font-medium ${['Type', 'No.', 'Description'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {planningLines.slice(0, 8).map(line => (
                      <tr key={line.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2.5 text-[11px] text-zinc-400">{line.entryType}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-300">{line.resourceNo || '—'}</td>
                        <td className="px-4 py-2.5 text-[12px] text-zinc-200 max-w-[140px] truncate">{line.description || '—'}</td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-zinc-500">{line.planningDate || '—'}</td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-zinc-300 tabular-nums">{Number(line.quantity)}</td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-zinc-400 tabular-nums">{formatCurrency(Number(line.unitPrice))}</td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-emerald-400 font-semibold tabular-nums">{formatCurrency(Number(line.totalPrice))}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-[9px] text-zinc-500">{line.lineType}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* FactBox */}
          <div className="space-y-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[12px] font-semibold text-zinc-200">Job Details</span>
              </div>
              <div className="p-4 space-y-3 text-[11px]">
                {[
                  ['Job No.', job.jobNo],
                  ['Status', job.status],
                  ['Responsible', job.responsible ?? '—'],
                  ['% Complete', `${Number(job.percentComplete).toFixed(1)}%`],
                  ['Contract Price', formatCurrency(Number(job.totalContractPrice))],
                  ['Schedule Cost', formatCurrency(Number(job.totalScheduleCost))],
                  ['Tasks', tasks.length.toString()],
                  ['Planning Lines', planningLines.length.toString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-zinc-500 uppercase tracking-wide">{label}</span>
                    <span className="text-zinc-300 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[12px] font-semibold text-zinc-200">Budget vs. Actual</span>
              </div>
              <div className="p-4 space-y-3 text-[11px]">
                {[
                  { label: 'Contract (Budget)', value: formatCurrency(Number(job.totalContractPrice)), color: 'text-zinc-300' },
                  { label: 'Schedule (Usage)', value: formatCurrency(Number(job.totalScheduleCost)), color: 'text-zinc-300' },
                  { label: 'Planning (Budget)', value: formatCurrency(budgetTotal), color: 'text-zinc-300' },
                  { label: 'Planning (Billable)', value: formatCurrency(billableTotal), color: 'text-emerald-400' },
                  {
                    label: 'Variance',
                    value: formatCurrency(Number(job.totalContractPrice) - Number(job.totalScheduleCost)),
                    color: Number(job.totalContractPrice) - Number(job.totalScheduleCost) >= 0 ? 'text-emerald-400' : 'text-red-400',
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-zinc-500">{label}</span>
                    <span className={`font-semibold tabular-nums ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60">
                <span className="text-[12px] font-semibold text-zinc-200">Actions</span>
              </div>
              <div className="p-3 space-y-1.5">
                {[
                  { href: `/projects/jobs/${id}/tasks`, label: 'Job Tasks', icon: ListChecks },
                  { href: `/projects/jobs/${id}/planning`, label: 'Planning Lines', icon: BarChart3 },
                  { href: '/projects/job-ledger', label: 'Job Ledger Entries', icon: BookOpen },
                  { href: '/projects/bc-timesheets', label: 'Time Sheets', icon: DollarSign },
                ].map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors text-[11px]">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
