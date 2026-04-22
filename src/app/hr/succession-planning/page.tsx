import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Shield } from 'lucide-react'

// TODO: add SuccessionPlan model with fields:
//   id, positionId, positionTitle, incumbentId, incumbentName,
//   readiness, candidates (json), department

type SuccessionEntry = {
  id: string
  positionTitle: string
  department: string
  incumbentName: string
  readiness: 'ready-now' | '1-2-years' | '2-plus-years' | 'no-successor'
  candidateCount: number
}

type NineBoxEmployee = {
  name: string
  performance: 1 | 2 | 3   // 1=low, 2=med, 3=high
  potential: 1 | 2 | 3
}

const READINESS_COLORS: Record<string, string> = {
  'ready-now':    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  '1-2-years':    'bg-amber-500/15 text-amber-400 border-amber-500/20',
  '2-plus-years': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'no-successor': 'bg-red-500/15 text-red-400 border-red-500/20',
}

const READINESS_LABELS: Record<string, string> = {
  'ready-now':    'Ready Now',
  '1-2-years':    '1–2 Years',
  '2-plus-years': '2+ Years',
  'no-successor': 'No Successor',
}

const MOCK_ENTRIES: SuccessionEntry[] = [
  { id: 'sp-1', positionTitle: 'Store Manager', department: 'Operations', incumbentName: 'Angela Morris', readiness: 'ready-now', candidateCount: 2 },
  { id: 'sp-2', positionTitle: 'Warehouse Manager', department: 'Warehouse', incumbentName: 'Carlos Reyes', readiness: '1-2-years', candidateCount: 3 },
  { id: 'sp-3', positionTitle: 'HR Director', department: 'Human Resources', incumbentName: 'Tanya Williams', readiness: '2-plus-years', candidateCount: 1 },
  { id: 'sp-4', positionTitle: 'IT Manager', department: 'IT', incumbentName: 'Derek Park', readiness: 'no-successor', candidateCount: 0 },
  { id: 'sp-5', positionTitle: 'Finance Controller', department: 'Finance', incumbentName: 'Maria Nguyen', readiness: '1-2-years', candidateCount: 2 },
]

const NINE_BOX: NineBoxEmployee[] = [
  { name: 'Priya S.', performance: 3, potential: 3 },
  { name: 'Marcus T.', performance: 2, potential: 3 },
  { name: 'Jessica M.', performance: 3, potential: 2 },
  { name: 'Daniel L.', performance: 2, potential: 2 },
  { name: 'Aisha J.', performance: 1, potential: 3 },
  { name: 'Tom W.', performance: 1, potential: 1 },
  { name: 'Elena F.', performance: 3, potential: 1 },
  { name: 'Ray C.', performance: 2, potential: 1 },
  { name: 'Sam K.', performance: 1, potential: 2 },
]

const NINE_BOX_LABELS: Record<string, string> = {
  '3-3': 'Star',
  '2-3': 'Future Leader',
  '1-3': 'High Potential',
  '3-2': 'Strong Performer',
  '2-2': 'Core Player',
  '1-2': 'Inconsistent',
  '3-1': 'Expert',
  '2-1': 'Specialist',
  '1-1': 'Under Performer',
}

const NINE_BOX_BG: Record<string, string> = {
  '3-3': 'bg-emerald-500/20 border-emerald-500/30',
  '2-3': 'bg-blue-500/20 border-blue-500/30',
  '1-3': 'bg-cyan-500/20 border-cyan-500/30',
  '3-2': 'bg-teal-500/20 border-teal-500/30',
  '2-2': 'bg-zinc-700/40 border-zinc-700/40',
  '1-2': 'bg-amber-500/15 border-amber-500/20',
  '3-1': 'bg-zinc-700/30 border-zinc-700/30',
  '2-1': 'bg-zinc-700/20 border-zinc-700/20',
  '1-1': 'bg-red-500/15 border-red-500/20',
}

function NineBoxGrid() {
  const cells = []
  for (let potential = 3; potential >= 1; potential--) {
    for (let performance = 1; performance <= 3; performance++) {
      const key = `${performance}-${potential}`
      const employees = NINE_BOX.filter(e => e.performance === performance && e.potential === potential)
      cells.push(
        <div
          key={key}
          className={`border rounded-lg p-2.5 min-h-[80px] ${NINE_BOX_BG[key] ?? 'bg-zinc-800/20 border-zinc-800/50'}`}
        >
          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-medium mb-1.5">{NINE_BOX_LABELS[key]}</p>
          <div className="flex flex-wrap gap-1">
            {employees.map(e => (
              <span key={e.name} className="px-1.5 py-0.5 rounded bg-zinc-900/60 text-[10px] text-zinc-300">
                {e.name}
              </span>
            ))}
          </div>
        </div>
      )
    }
  }
  return (
    <div>
      {/* Axis labels */}
      <div className="flex items-center mb-1">
        <div className="w-20 shrink-0" />
        <div className="flex-1 grid grid-cols-3 gap-2 text-center">
          {['Low Performance', 'Mid Performance', 'High Performance'].map(l => (
            <p key={l} className="text-[9px] uppercase tracking-widest text-zinc-600">{l}</p>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {/* Y axis */}
        <div className="w-20 shrink-0 grid grid-rows-3 gap-2 text-right">
          {['High Potential', 'Mid Potential', 'Low Potential'].map(l => (
            <div key={l} className="flex items-center justify-end">
              <p className="text-[9px] uppercase tracking-widest text-zinc-600 leading-tight text-right">{l}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-2">
          {cells}
        </div>
      </div>
    </div>
  )
}

export default async function SuccessionPlanningPage() {
  // Load positions for context; succession data is mocked until model exists
  const positions = await prisma.hRPosition.findMany({
    where: { status: 'active' },
    orderBy: { title: 'asc' },
  })

  const entries = MOCK_ENTRIES
  const readyNow = entries.filter(e => e.readiness === 'ready-now').length
  const noSuccessor = entries.filter(e => e.readiness === 'no-successor').length
  const covered = entries.filter(e => e.readiness !== 'no-successor').length

  return (
    <>
      <TopBar title="Succession Planning" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Succession Planning</h1>
            <p className="text-[13px] text-zinc-500">Key positions, readiness ratings, and 9-box talent grid</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Key Positions', value: entries.length, color: 'text-zinc-100' },
            { label: 'Ready Now', value: readyNow, color: 'text-emerald-400' },
            { label: 'Positions Covered', value: covered, color: 'text-blue-400' },
            { label: 'No Successor', value: noSuccessor, color: 'text-red-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Key positions table */}
          <div className="lg:col-span-2">
            <h2 className="text-[13px] font-semibold text-zinc-100 mb-3">Key Positions</h2>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <Shield className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-[13px]">No succession plans defined</p>
                </div>
              ) : (
                <div>
                  {entries.map(e => (
                    <Link
                      key={e.id}
                      href={`/hr/succession-planning/${e.id}`}
                      className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-zinc-100 truncate">{e.positionTitle}</p>
                        <p className="text-[11px] text-zinc-500">{e.department} · {e.incumbentName}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] text-zinc-600">{e.candidateCount} candidates</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] border font-medium ${READINESS_COLORS[e.readiness]}`}>
                          {READINESS_LABELS[e.readiness]}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 9-box grid */}
          <div className="lg:col-span-3">
            <h2 className="text-[13px] font-semibold text-zinc-100 mb-3">9-Box Talent Grid</h2>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <NineBoxGrid />
            </div>
          </div>

        </div>

      </main>
    </>
  )
}
