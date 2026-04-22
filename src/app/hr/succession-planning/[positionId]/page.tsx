import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Star, BookOpen } from 'lucide-react'

// TODO: replace with prisma.successionPlan.findUnique once model is in schema

type Candidate = {
  id: string
  name: string
  currentRole: string
  department: string
  yearsExperience: number
  readiness: 'ready-now' | '1-2-years' | '2-plus-years'
  strengths: string[]
  developmentAreas: string[]
  developmentPlan?: string
  performanceRating: number
}

type SuccessionDetail = {
  id: string
  positionTitle: string
  department: string
  incumbentName: string
  incumbentSince: string
  overallReadiness: string
  candidates: Candidate[]
}

const MOCK: Record<string, SuccessionDetail> = {
  'sp-1': {
    id: 'sp-1',
    positionTitle: 'Store Manager',
    department: 'Operations',
    incumbentName: 'Angela Morris',
    incumbentSince: '2021-03-01',
    overallReadiness: 'ready-now',
    candidates: [
      {
        id: 'c1',
        name: 'Jessica Moore',
        currentRole: 'Assistant Store Manager',
        department: 'Operations',
        yearsExperience: 7,
        readiness: 'ready-now',
        strengths: ['Team leadership', 'Customer escalations', 'Scheduling'],
        developmentAreas: ['Budget management', 'Strategic planning'],
        developmentPlan: 'Shadow Angela on quarterly P&L reviews for 2 quarters.',
        performanceRating: 4.5,
      },
      {
        id: 'c2',
        name: 'Carlos Reyes',
        currentRole: 'Warehouse Manager',
        department: 'Warehouse',
        yearsExperience: 9,
        readiness: '1-2-years',
        strengths: ['Operations', 'Inventory control', 'Cross-department coordination'],
        developmentAreas: ['Customer-facing leadership', 'Retail KPIs'],
        developmentPlan: 'Rotate through retail floor management for 6 months.',
        performanceRating: 4.2,
      },
    ],
  },
  'sp-2': {
    id: 'sp-2',
    positionTitle: 'Warehouse Manager',
    department: 'Warehouse',
    incumbentName: 'Carlos Reyes',
    incumbentSince: '2019-06-15',
    overallReadiness: '1-2-years',
    candidates: [
      {
        id: 'c3',
        name: 'Ray Castillo',
        currentRole: 'Warehouse Lead',
        department: 'Warehouse',
        yearsExperience: 4,
        readiness: '1-2-years',
        strengths: ['Receiving processes', 'WMS proficiency', 'Safety compliance'],
        developmentAreas: ['Staff management', 'Vendor relations'],
        developmentPlan: 'Lead Q3 cycle count project as project manager.',
        performanceRating: 3.8,
      },
    ],
  },
}

const READINESS_COLORS: Record<string, string> = {
  'ready-now':    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  '1-2-years':    'bg-amber-500/15 text-amber-400 border-amber-500/20',
  '2-plus-years': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
}

const READINESS_LABELS: Record<string, string> = {
  'ready-now':    'Ready Now',
  '1-2-years':    '1–2 Years',
  '2-plus-years': '2+ Years',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`}
        />
      ))}
      <span className="text-[11px] text-zinc-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export default async function SuccessionDetailPage({
  params,
}: {
  params: Promise<{ positionId: string }>
}) {
  const { positionId } = await params
  const detail = MOCK[positionId]
  if (!detail) notFound()

  return (
    <>
      <TopBar title={detail.positionTitle} />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Back + header */}
        <div>
          <Link href="/hr/succession-planning" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Succession Planning
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-semibold text-zinc-100">{detail.positionTitle}</h1>
              <p className="text-[13px] text-zinc-500 mt-0.5">{detail.department}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[12px] border font-medium ${READINESS_COLORS[detail.overallReadiness] ?? 'bg-zinc-700/40 text-zinc-400'}`}>
              {READINESS_LABELS[detail.overallReadiness] ?? detail.overallReadiness}
            </span>
          </div>
        </div>

        {/* Current incumbent */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium mb-3">Current Incumbent</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-zinc-100">{detail.incumbentName}</p>
              <p className="text-[12px] text-zinc-500">In role since {new Date(detail.incumbentSince).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Succession candidates */}
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-100 mb-3">
            Succession Candidates <span className="text-zinc-500 font-normal">({detail.candidates.length})</span>
          </h2>
          {detail.candidates.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12 text-zinc-500">
              <User className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-[13px]">No candidates identified yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {detail.candidates.map((c, idx) => (
                <div key={c.id} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                        <span className="text-[13px] font-semibold text-zinc-300">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-zinc-100">{c.name}</p>
                        <p className="text-[12px] text-zinc-500">{c.currentRole} · {c.department}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] border font-medium ${READINESS_COLORS[c.readiness]}`}>
                        {READINESS_LABELS[c.readiness]}
                      </span>
                      <StarRating rating={c.performanceRating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">Strengths</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.strengths.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">Development Areas</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.developmentAreas.map(a => (
                          <span key={a} className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {c.developmentPlan && (
                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-md p-3 flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-0.5">Development Plan</p>
                        <p className="text-[12px] text-zinc-400">{c.developmentPlan}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  )
}
