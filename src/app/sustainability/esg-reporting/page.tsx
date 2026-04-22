export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { FileText, ArrowLeft, Wind, Users, ShieldCheck, Download } from 'lucide-react'

// TODO: Add ESGReport model to prisma schema
// model ESGReport {
//   id          String   @id @default(cuid())
//   name        String
//   period      String   // e.g. "2026-Q1", "2025-Annual"
//   framework   String   // GRI | TCFD | SASB | CDP | internal
//   status      String   @default("draft") // draft | final | published
//   envScore    Float?
//   socialScore Float?
//   govScore    Float?
//   totalScore  Float?
//   notes       String?
//   publishedAt DateTime?
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
// }

const MOCK_REPORTS = [
  { id: '1', name: '2025 Annual ESG Report', period: '2025-Annual', framework: 'GRI', status: 'published', envScore: 72, socialScore: 68, govScore: 81, totalScore: 74, publishedAt: '2026-02-28' },
  { id: '2', name: '2026 Q1 Sustainability Update', period: '2026-Q1', framework: 'Internal', status: 'final', envScore: 75, socialScore: 70, govScore: 82, totalScore: 76, publishedAt: null },
  { id: '3', name: '2026 Q2 Draft', period: '2026-Q2', framework: 'TCFD', status: 'draft', envScore: null, socialScore: null, govScore: null, totalScore: null, publishedAt: null },
]

const STATUS_CHIP: Record<string, string> = {
  draft: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
  final: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const FRAMEWORK_CHIP: Record<string, string> = {
  GRI: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  TCFD: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  SASB: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  CDP: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  Internal: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
}

function ScoreBar({ value, color }: { value: number | null; color: string }) {
  if (value === null) return <span className="text-zinc-600 text-[11px]">—</span>
  const w = `${value}%`
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: w }} />
      </div>
      <span className="text-[12px] font-semibold text-zinc-300 w-8 text-right">{value}</span>
    </div>
  )
}

const envMetrics = [
  { label: 'GHG Emissions (Scope 1+2)', value: '4.12 ktCO₂e', trend: '-8%', good: true },
  { label: 'Renewable Energy Share', value: '42%', trend: '+5pp', good: true },
  { label: 'Water Intensity', value: '3.2 m³/unit', trend: '-2%', good: true },
  { label: 'Waste Diverted from Landfill', value: '71%', trend: '+4pp', good: true },
]

const socialMetrics = [
  { label: 'Lost Time Injury Rate', value: '0.42', trend: '-0.08', good: true },
  { label: 'Employee Turnover', value: '12.3%', trend: '+1.2pp', good: false },
  { label: 'Training Hours / Employee', value: '38 hrs', trend: '+6 hrs', good: true },
  { label: 'Gender Pay Gap', value: '6.1%', trend: '-0.9pp', good: true },
]

const govMetrics = [
  { label: 'Board Independence', value: '67%', trend: 'stable', good: true },
  { label: 'ESG-linked Exec Compensation', value: '15% of bonus', trend: 'stable', good: true },
  { label: 'Data Privacy Incidents', value: '0', trend: 'stable', good: true },
  { label: 'Supplier Code Compliance', value: '94%', trend: '+3pp', good: true },
]

export default async function ESGReportingPage() {
  const latestReport = MOCK_REPORTS[1] // most recent final

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="ESG Reporting" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/sustainability" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Sustainability
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">ESG Dashboard</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Environmental · Social · Governance</p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[
            { label: 'Overall ESG Score', value: latestReport.totalScore, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Environmental', value: latestReport.envScore, icon: Wind, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Social', value: latestReport.socialScore, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
            { label: 'Governance', value: latestReport.govScore, icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`bg-[#16213e] border ${border} rounded-lg p-5`}>
              <div className={`inline-flex w-9 h-9 ${bg} rounded-lg items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-3xl font-bold ${color}`}>
                {value ?? '—'}
                {value !== null && <span className="text-base font-normal text-zinc-500 ml-0.5">/100</span>}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">{label}</p>
              {value !== null && (
                <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${value}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Environmental */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Environmental</h3>
              <span className="ml-auto text-xl font-bold text-emerald-400">{latestReport.envScore}</span>
            </div>
            <div className="space-y-3">
              {envMetrics.map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">{m.label}</span>
                  <div className="text-right">
                    <span className="text-[12px] font-medium text-zinc-300">{m.value}</span>
                    <span className={`text-[10px] ml-1.5 ${m.good ? 'text-emerald-400' : 'text-red-400'}`}>{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Social</h3>
              <span className="ml-auto text-xl font-bold text-violet-400">{latestReport.socialScore}</span>
            </div>
            <div className="space-y-3">
              {socialMetrics.map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">{m.label}</span>
                  <div className="text-right">
                    <span className="text-[12px] font-medium text-zinc-300">{m.value}</span>
                    <span className={`text-[10px] ml-1.5 ${m.good ? 'text-emerald-400' : 'text-red-400'}`}>{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Governance */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Governance</h3>
              <span className="ml-auto text-xl font-bold text-amber-400">{latestReport.govScore}</span>
            </div>
            <div className="space-y-3">
              {govMetrics.map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">{m.label}</span>
                  <div className="text-right">
                    <span className="text-[12px] font-medium text-zinc-300">{m.value}</span>
                    <span className={`text-[10px] ml-1.5 ${m.good ? 'text-emerald-400' : 'text-red-400'}`}>{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reports table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800/30">
            <FileText className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Published Reports</h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                {['Report', 'Period', 'Framework', 'E', 'S', 'G', 'Total', 'Published', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_REPORTS.map(r => (
                <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-2.5 text-zinc-300 font-medium">{r.name}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-500 text-[11px]">{r.period}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${FRAMEWORK_CHIP[r.framework] ?? FRAMEWORK_CHIP.Internal}`}>
                      {r.framework}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 w-28">
                    <ScoreBar value={r.envScore} color="bg-emerald-500" />
                  </td>
                  <td className="px-4 py-2.5 w-28">
                    <ScoreBar value={r.socialScore} color="bg-violet-500" />
                  </td>
                  <td className="px-4 py-2.5 w-28">
                    <ScoreBar value={r.govScore} color="bg-amber-500" />
                  </td>
                  <td className="px-4 py-2.5">
                    {r.totalScore !== null ? (
                      <span className="text-blue-400 font-bold">{r.totalScore}</span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500 text-[11px]">
                    {r.publishedAt ?? <span className="text-zinc-700">Unpublished</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize ${STATUS_CHIP[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
