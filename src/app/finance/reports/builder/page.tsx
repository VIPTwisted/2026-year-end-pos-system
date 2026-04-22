import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { FileBarChart, Plus, Play } from 'lucide-react'

export const dynamic = 'force-dynamic'

const REPORT_TYPE_LABELS: Record<string, string> = {
  income_statement: 'Income Statement',
  balance_sheet: 'Balance Sheet',
  cash_flow: 'Cash Flow',
  custom: 'Custom',
}

function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${
      published
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : 'bg-zinc-700/40 text-zinc-500 border-zinc-600/40'
    }`}>
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

export default async function ReportBuilderPage() {
  const reports = await prisma.financialReportDefinition.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  const total = reports.length
  const published = reports.filter(r => r.isPublished).length
  const lastRun = reports.find(r => r.lastRunAt)

  const kpis = [
    { label: 'Total Reports', value: total, color: 'text-zinc-300' },
    { label: 'Published', value: published, color: 'text-emerald-400' },
    { label: 'Last Run', value: lastRun?.lastRunAt ? new Date(lastRun.lastRunAt).toLocaleDateString() : '—', color: 'text-blue-400' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Financial Report Builder" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Report Definitions</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {reports.length}
            </span>
          </div>
          <Link href="/finance/reports/builder/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Report
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map(({ label, value, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {reports.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No report definitions yet. Create your first report.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Name', 'Type', 'Status', 'Last Run', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/finance/reports/builder/${r.id}`} className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
                        {r.name}
                      </Link>
                      {r.description && <p className="text-[11px] text-zinc-600 mt-0.5 truncate max-w-[200px]">{r.description}</p>}
                    </td>
                    <td className="px-4 py-2 text-zinc-500">{REPORT_TYPE_LABELS[r.reportType] ?? r.reportType}</td>
                    <td className="px-4 py-2"><PublishedBadge published={r.isPublished} /></td>
                    <td className="px-4 py-2 text-zinc-500">
                      {r.lastRunAt ? new Date(r.lastRunAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/finance/reports/builder/${r.id}`} className="text-xs text-zinc-500 hover:text-zinc-300">Edit</Link>
                        <Link href={`/finance/reports/builder/${r.id}?run=1`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:bg-blue-600/30 transition-colors">
                          <Play className="w-2.5 h-2.5" /> Run
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
