import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Briefcase, Plus } from 'lucide-react'

// TODO: add JobRequisition model to schema with fields:
//   id, title, department, hiringManager, positionType, salaryMin, salaryMax,
//   targetHireDate, postedDate, status, description, requirements

type MockReq = {
  id: string
  title: string
  department: string
  hiringManager: string
  postedDate: string
  applicants: number
  status: 'open' | 'screening' | 'interviewing' | 'offer' | 'filled' | 'closed'
}

const STATUS_COLORS: Record<string, string> = {
  open:         'bg-blue-500/15 text-blue-400 border-blue-500/20',
  screening:    'bg-amber-500/15 text-amber-400 border-amber-500/20',
  interviewing: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  offer:        'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  filled:       'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  closed:       'bg-zinc-700/40 text-zinc-500 border-zinc-700/40',
}

const MOCK_REQS: MockReq[] = [
  { id: 'req-1', title: 'Senior Retail Associate', department: 'Sales', hiringManager: 'Jessica Moore', postedDate: '2026-04-01', applicants: 14, status: 'interviewing' },
  { id: 'req-2', title: 'Warehouse Manager', department: 'Operations', hiringManager: 'Carlos Reyes', postedDate: '2026-04-05', applicants: 8, status: 'screening' },
  { id: 'req-3', title: 'HR Coordinator', department: 'Human Resources', hiringManager: 'Tanya Williams', postedDate: '2026-04-10', applicants: 22, status: 'open' },
  { id: 'req-4', title: 'POS Systems Analyst', department: 'IT', hiringManager: 'Derek Park', postedDate: '2026-03-20', applicants: 11, status: 'offer' },
  { id: 'req-5', title: 'Inventory Control Clerk', department: 'Warehouse', hiringManager: 'Carlos Reyes', postedDate: '2026-03-15', applicants: 19, status: 'filled' },
]

export default async function RecruitingPage() {
  // Fetch employees for hiring manager context
  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, department: true },
    orderBy: { lastName: 'asc' },
  })

  const reqs = MOCK_REQS
  const openCount = reqs.filter(r => r.status === 'open').length
  const totalApplicants = reqs.reduce((sum, r) => sum + r.applicants, 0)
  const interviewingCount = reqs.filter(r => r.status === 'interviewing').length
  const offerCount = reqs.filter(r => r.status === 'offer').length

  return (
    <>
      <TopBar title="Recruiting" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Recruiting</h1>
            <p className="text-[13px] text-zinc-500">Open positions, applicant pipeline, and interviews</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/hr/recruiting/interviews"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
            >
              Interview Schedule
            </Link>
            <Link
              href="/hr/recruiting/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Requisition
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open Requisitions', value: openCount, color: 'text-blue-400' },
            { label: 'Total Applicants', value: totalApplicants, color: 'text-zinc-100' },
            { label: 'Interviews Scheduled', value: interviewingCount, color: 'text-purple-400' },
            { label: 'Offers Extended', value: offerCount, color: 'text-cyan-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Requisitions table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {reqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Briefcase className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[13px] mb-3">No open requisitions</p>
              <Link
                href="/hr/recruiting/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
              >
                Post First Position
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Position Title</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Department</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Hiring Manager</th>
                    <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Posted</th>
                    <th className="text-right px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Applicants</th>
                    <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                    <th className="px-5 pb-3 pt-3" />
                  </tr>
                </thead>
                <tbody>
                  {reqs.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5">
                        <Link href={`/hr/recruiting/${r.id}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">
                          {r.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{r.department}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{r.hiringManager}</td>
                      <td className="px-3 py-2.5 text-zinc-500 text-[12px]">
                        {new Date(r.postedDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-zinc-200">{r.applicants}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] border font-medium capitalize ${STATUS_COLORS[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <Link
                          href={`/hr/recruiting/${r.id}`}
                          className="text-[12px] text-zinc-500 hover:text-zinc-100 transition-colors"
                        >
                          View →
                        </Link>
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
