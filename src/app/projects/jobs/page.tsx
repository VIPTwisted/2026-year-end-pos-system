import { Suspense } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import {
  Plus, ChevronRight, ChevronDown, ListChecks, BookOpen, BarChart3, Layers,
  Pencil, Trash2, CheckSquare,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

type Job = {
  id: string
  jobNo: string
  description: string
  customerId: string | null
  firstName: string | null
  lastName: string | null
  responsible: string | null
  status: string
  percentComplete: number
  totalContractPrice: number
  totalScheduleCost: number
  createdAt: string
}

const STATUS_COLOR: Record<string, string> = {
  Planning:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Open:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Completed: 'bg-zinc-700/40 text-zinc-400 border-zinc-700/50',
  Blocked:   'bg-red-500/20 text-red-400 border-red-500/30',
}

async function JobsTable({ search, status, responsible }: { search: string; status: string; responsible: string }) {
  let where = 'WHERE 1=1'
  if (search) where += ` AND (j.jobNo LIKE '%${search.replace(/'/g, "''")}%' OR j.description LIKE '%${search.replace(/'/g, "''")}%')`
  if (status) where += ` AND j.status = '${status.replace(/'/g, "''")}'`
  if (responsible) where += ` AND j.responsible LIKE '%${responsible.replace(/'/g, "''")}%'`

  const jobs = await prisma.$queryRawUnsafe<Job[]>(
    `SELECT j.*, c.firstName, c.lastName FROM "Job" j LEFT JOIN "Customer" c ON c.id = j.customerId ${where} ORDER BY j.createdAt DESC`
  )

  if (!jobs.length) {
    return (
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-600">
        <ListChecks className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-[13px] text-zinc-500 mb-4">No jobs found.</p>
        <Link href="/projects/jobs/new" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-medium text-white transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Job
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800/60">
            <tr>
              {['No.', 'Description', 'Bill-to Customer', 'Person Responsible', 'Status', '% Complete', 'Contract (Total Price)', 'Schedule (Total Cost)', ''].map(h => (
                <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                  ['No.', 'Description', 'Bill-to Customer', 'Person Responsible'].includes(h) ? 'text-left' :
                  h === 'Status' || h === '% Complete' ? 'text-center' : 'text-right'
                }`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="px-4 py-3">
                  <Link href={`/projects/jobs/${job.id}`} className="font-mono text-[11px] text-blue-400 hover:underline">
                    {job.jobNo}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[13px] text-zinc-100 max-w-[200px] truncate">{job.description}</td>
                <td className="px-4 py-3 text-[12px] text-zinc-400">
                  {job.firstName ? (
                    <span>{job.firstName} {job.lastName}</span>
                  ) : <span className="text-zinc-700">—</span>}
                </td>
                <td className="px-4 py-3 text-[12px] text-zinc-400">{job.responsible || <span className="text-zinc-700">—</span>}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLOR[job.status] ?? 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-300 tabular-nums font-medium">{Number(job.percentComplete).toFixed(0)}%</span>
                    <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${Number(job.percentComplete) >= 100 ? 'bg-emerald-500' : Number(job.percentComplete) >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, Number(job.percentComplete))}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">
                  {formatCurrency(Number(job.totalContractPrice))}
                </td>
                <td className="px-4 py-3 text-right text-[12px] text-zinc-400 tabular-nums">
                  {formatCurrency(Number(job.totalScheduleCost))}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/projects/jobs/${job.id}`} className="inline-flex items-center text-zinc-600 group-hover:text-blue-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; responsible?: string }>
}) {
  const sp = await searchParams
  const search = sp.search ?? ''
  const status = sp.status ?? ''
  const responsible = sp.responsible ?? ''

  return (
    <>
      <TopBar title="Jobs" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="flex min-h-0 flex-1">

          {/* Filter Pane */}
          <aside className="w-56 shrink-0 border-r border-zinc-800/60 bg-[#0d0d1a] p-4 space-y-5 overflow-y-auto">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Filters</p>
            </div>
            <form method="GET" className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Search</label>
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Job No or description…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  name="status"
                  defaultValue={status}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                >
                  <option value="">All</option>
                  <option value="Planning">Planning</option>
                  <option value="Open">Open</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Person Responsible</label>
                <input
                  name="responsible"
                  defaultValue={responsible}
                  placeholder="Name…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded transition-colors"
              >
                Apply
              </button>
              <Link
                href="/projects/jobs"
                className="block w-full text-center py-1.5 text-zinc-600 hover:text-zinc-400 text-[11px] transition-colors"
              >
                Clear
              </Link>
            </form>
          </aside>

          {/* Main content */}
          <div className="flex-1 px-6 py-4 space-y-4 overflow-auto">

            {/* Ribbon */}
            <div className="flex items-center gap-1 flex-wrap">
              <Link
                href="/projects/jobs/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </Link>
              <div className="w-px h-5 bg-zinc-700 mx-1" />
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider px-1">Navigate</span>
              <Link
                href="/projects/jobs"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-md transition-colors"
              >
                <ListChecks className="w-3.5 h-3.5" /> Job Tasks
              </Link>
              <Link
                href="/projects/jobs"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-md transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" /> Planning Lines
              </Link>
              <Link
                href="/projects/job-ledger"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-md transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Ledger Entries
              </Link>
              <Link
                href="/projects/jobs"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-md transition-colors"
              >
                <Layers className="w-3.5 h-3.5" /> WIP
              </Link>
              <div className="w-px h-5 bg-zinc-700 mx-1" />
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-md transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Change Status <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            {/* Page heading */}
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-100">Jobs</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">All jobs / projects in the system</p>
            </div>

            <Suspense fallback={<div className="text-zinc-600 text-sm py-8 text-center">Loading…</div>}>
              <JobsTable search={search} status={status} responsible={responsible} />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  )
}
