import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { FileBarChart, ChevronRight } from 'lucide-react'
import { ReportEditorClient } from './ReportEditorClient'

export const dynamic = 'force-dynamic'

const REPORT_TYPE_LABELS: Record<string, string> = {
  income_statement: 'Income Statement',
  balance_sheet: 'Balance Sheet',
  cash_flow: 'Cash Flow',
  custom: 'Custom',
}
const ROW_TYPE_LABELS: Record<string, string> = {
  header: 'Header', account_range: 'Account Range', formula: 'Formula', total: 'Total', spacer: 'Spacer',
}
const PERIOD_TYPE_LABELS: Record<string, string> = {
  current_month: 'Current Month', ytd: 'YTD', prior_year: 'Prior Year', budget: 'Budget',
}

export default async function ReportBuilderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await prisma.financialReportDefinition.findUnique({ where: { id } })
  if (!report) notFound()

  const rows = report.rowsJson ? JSON.parse(report.rowsJson) : []
  const columns = report.columnsJson ? JSON.parse(report.columnsJson) : []

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={report.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-6xl mx-auto w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
          <Link href="/finance/reports/builder" className="hover:text-zinc-300">Report Builder</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">{report.name}</span>
        </div>

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <FileBarChart className="w-4 h-4 text-zinc-400" />
                <h1 className="text-base font-semibold text-zinc-100">{report.name}</h1>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                  report.isPublished
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-700/40 text-zinc-500 border-zinc-600/40'
                }`}>
                  {report.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] text-zinc-500">Type: <span className="text-zinc-300">{REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}</span></span>
                <span className="text-[11px] text-zinc-500">Rows: <span className="text-zinc-300">{rows.length}</span></span>
                <span className="text-[11px] text-zinc-500">Columns: <span className="text-zinc-300">{columns.length}</span></span>
              </div>
              {report.description && <p className="mt-2 text-[13px] text-zinc-500">{report.description}</p>}
            </div>
            <div className="text-[11px] text-zinc-600">
              {report.lastRunAt && <div>Last run: {new Date(report.lastRunAt).toLocaleString()}</div>}
              <div>Updated: {new Date(report.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Report Structure Preview */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/30">
            <h2 className="text-sm font-semibold text-zinc-200">Report Structure</h2>
          </div>
          {rows.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-zinc-600">No rows defined.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Label</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Row Type</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Account Range</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">Formula</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: { rowType: string; label: string; indent: number; accountFrom?: string; accountTo?: string; formula?: string }, i: number) => (
                  <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2 text-zinc-300" style={{ paddingLeft: `${(row.indent ?? 0) * 16 + 16}px` }}>
                      {row.rowType === 'header' ? <span className="font-semibold text-zinc-100">{row.label}</span> :
                       row.rowType === 'total' ? <span className="font-bold text-emerald-400">{row.label}</span> :
                       row.rowType === 'spacer' ? <span>&nbsp;</span> :
                       row.label}
                    </td>
                    <td className="px-4 py-2 text-zinc-500">{ROW_TYPE_LABELS[row.rowType] ?? row.rowType}</td>
                    <td className="px-4 py-2 font-mono text-[12px] text-zinc-500">
                      {row.accountFrom && row.accountTo ? `${row.accountFrom} – ${row.accountTo}` : '—'}
                    </td>
                    <td className="px-4 py-2 font-mono text-[12px] text-blue-400">{row.formula || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Columns Preview */}
        {columns.length > 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-zinc-200 mb-3">Column Configuration</h2>
            <div className="flex flex-wrap gap-3">
              {columns.map((col: { periodType: string; label: string }, i: number) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-4 py-2 text-center">
                  <p className="text-sm font-medium text-zinc-200">{col.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{PERIOD_TYPE_LABELS[col.periodType] ?? col.periodType}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client actions: Run Report modal + Publish toggle */}
        <ReportEditorClient reportId={report.id} isPublished={report.isPublished} />
      </main>
    </div>
  )
}
