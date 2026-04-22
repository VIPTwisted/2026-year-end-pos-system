import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Clock, CheckCircle } from 'lucide-react'

// TODO: replace mock data with prisma.jobRequisition.findUnique once model is added to schema

type Applicant = {
  id: string
  name: string
  email: string
  appliedDate: string
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
  score?: number
}

type Requisition = {
  id: string
  title: string
  department: string
  positionType: string
  hiringManager: string
  postedDate: string
  targetHireDate: string
  salaryMin: number
  salaryMax: number
  status: string
  description: string
  requirements: string[]
  applicants: Applicant[]
}

const MOCK_REQS: Record<string, Requisition> = {
  'req-1': {
    id: 'req-1',
    title: 'Senior Retail Associate',
    department: 'Sales',
    positionType: 'Full-Time',
    hiringManager: 'Jessica Moore',
    postedDate: '2026-04-01',
    targetHireDate: '2026-05-01',
    salaryMin: 38000,
    salaryMax: 48000,
    status: 'interviewing',
    description: 'We are looking for an experienced Senior Retail Associate to join our Sales team. The ideal candidate will have a proven track record in customer-facing roles and experience with POS systems.',
    requirements: [
      '3+ years retail experience',
      'Strong customer service skills',
      'POS system proficiency',
      'Team leadership experience preferred',
    ],
    applicants: [
      { id: 'a1', name: 'Marcus Thompson', email: 'mthompson@email.com', appliedDate: '2026-04-02', stage: 'interview', score: 87 },
      { id: 'a2', name: 'Priya Sharma', email: 'psharma@email.com', appliedDate: '2026-04-03', stage: 'interview', score: 92 },
      { id: 'a3', name: 'Daniel Lee', email: 'dlee@email.com', appliedDate: '2026-04-04', stage: 'screening', score: 74 },
      { id: 'a4', name: 'Aisha Johnson', email: 'ajohnson@email.com', appliedDate: '2026-04-05', stage: 'applied' },
      { id: 'a5', name: 'Tom Walsh', email: 'twalsh@email.com', appliedDate: '2026-04-06', stage: 'rejected' },
    ],
  },
}

const STAGES = ['applied', 'screening', 'interview', 'offer', 'hired'] as const

const STAGE_COLORS: Record<string, string> = {
  applied:   'bg-zinc-700/40 text-zinc-400',
  screening: 'bg-amber-500/15 text-amber-400',
  interview: 'bg-purple-500/15 text-purple-400',
  offer:     'bg-cyan-500/15 text-cyan-400',
  hired:     'bg-emerald-500/15 text-emerald-400',
  rejected:  'bg-red-500/15 text-red-400',
}

export default async function RequisitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const req = MOCK_REQS[id]
  if (!req) notFound()

  return (
    <>
      <TopBar title={req.title} />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Back + header */}
        <div>
          <Link href="/hr/recruiting" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Recruiting
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-semibold text-zinc-100">{req.title}</h1>
              <p className="text-[13px] text-zinc-500 mt-0.5">{req.department} · {req.positionType} · Posted {new Date(req.postedDate).toLocaleDateString()}</p>
            </div>
            <span className="rounded-full px-3 py-1 text-[12px] font-medium capitalize bg-purple-500/15 text-purple-400 border border-purple-500/20">
              {req.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: details */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 space-y-3">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Requisition Details</h2>
              {[
                { label: 'Hiring Manager', value: req.hiringManager },
                { label: 'Target Hire Date', value: new Date(req.targetHireDate).toLocaleDateString() },
                { label: 'Salary Range', value: `$${req.salaryMin.toLocaleString()} – $${req.salaryMax.toLocaleString()}` },
                { label: 'Position Type', value: req.positionType },
              ].map(d => (
                <div key={d.label}>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide">{d.label}</p>
                  <p className="text-[13px] text-zinc-200 mt-0.5">{d.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 space-y-2">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Description</h2>
              <p className="text-[13px] text-zinc-400 leading-relaxed">{req.description}</p>
            </div>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 space-y-2">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Requirements</h2>
              <ul className="space-y-1.5">
                {req.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Kanban pipeline */}
          <div className="lg:col-span-2">
            <h2 className="text-[13px] font-semibold text-zinc-100 mb-3">Applicant Pipeline</h2>
            <div className="grid grid-cols-5 gap-2 min-h-[400px]">
              {STAGES.map(stage => {
                const cols = req.applicants.filter(a => a.stage === stage)
                return (
                  <div key={stage} className="flex flex-col">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium capitalize">{stage}</span>
                      <span className="text-[10px] text-zinc-600">{cols.length}</span>
                    </div>
                    <div className="flex-1 bg-[#16213e] border border-zinc-800/50 rounded-lg p-2 space-y-2 min-h-[80px]">
                      {cols.map(a => (
                        <div key={a.id} className="bg-zinc-900/60 border border-zinc-800/50 rounded-md p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                              <User className="w-2.5 h-2.5 text-zinc-400" />
                            </div>
                            <p className="text-[11px] font-medium text-zinc-200 leading-tight">{a.name}</p>
                          </div>
                          {a.score != null && (
                            <p className="text-[10px] text-zinc-500">Score: <span className="text-emerald-400 font-semibold">{a.score}</span></p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5 text-zinc-600" />
                            <p className="text-[10px] text-zinc-600">{new Date(a.appliedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rejected applicants */}
            {req.applicants.some(a => a.stage === 'rejected') && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest text-zinc-600 font-medium mb-2">Not Moving Forward</p>
                <div className="flex flex-wrap gap-2">
                  {req.applicants.filter(a => a.stage === 'rejected').map(a => (
                    <span key={a.id} className="px-2.5 py-1 rounded-full text-[11px] bg-red-500/10 text-red-400 border border-red-500/20">
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </>
  )
}
