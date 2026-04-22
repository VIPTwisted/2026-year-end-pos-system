'use client'
import { useState, useEffect, use } from 'react'
import { Play, Download, Printer, Clock, Share2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type Report = { id: string; name: string; description: string | null; reportType: string; isShared: boolean; lastRunAt: string | null; schedule: string | null }
type ReportRow = Record<string, string | number>

const SCHEDULES = [{ value: '', label: 'No Schedule' }, { value: 'daily', label: 'Daily' }, { value: 'weekly-monday', label: 'Weekly (Monday)' }, { value: 'monthly-1st', label: 'Monthly (1st)' }]
function fmt$(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

function GenericTable({ data }: { data: ReportRow[] }) {
  if (!data.length) return null
  const keys = Object.keys(data[0])
  return (
    <table className="w-full text-xs">
      <thead><tr className="border-b border-zinc-800">{keys.map(k => <th key={k} className="text-left text-zinc-500 pb-2 pr-4 font-medium capitalize">{k}</th>)}</tr></thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/50">
            {keys.map(k => <td key={k} className="py-2 pr-4 text-zinc-300">{typeof row[k] === 'number' && Number(row[k]) > 100 ? fmt$(Number(row[k])) : String(row[k] ?? '')}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function ReportViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [report, setReport] = useState<Report | null>(null)
  const [data, setData] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [schedule, setSchedule] = useState('')

  useEffect(() => {
    fetch(`/api/analytics/reports/${id}`).then(r => r.json()).then(r => { setReport(r); setSchedule(r.schedule ?? ''); setLoading(false) })
  }, [id])

  const runReport = async () => {
    setRunning(true)
    const res = await fetch(`/api/analytics/reports/${id}/run`, { method: 'POST' })
    const result = await res.json()
    setData(result.data)
    setReport(r => r ? { ...r, lastRunAt: result.ranAt } : r)
    setRunning(false)
  }

  const saveSchedule = async () => {
    await fetch(`/api/analytics/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schedule }) })
  }

  const exportCsv = () => {
    if (!data.length) return
    const keys = Object.keys(data[0])
    const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${report?.name ?? 'report'}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  if (loading) return <div className="p-6 text-zinc-500 text-sm">Loading...</div>
  if (!report) return <div className="p-6 text-red-400 text-sm">Report not found.</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/advanced-analytics/reports" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-2 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">{report.name}</h1>
          {report.description && <p className="text-sm text-zinc-400 mt-1">{report.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
            <span className="capitalize px-2 py-0.5 bg-zinc-800 rounded">{report.reportType}</span>
            {report.lastRunAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(report.lastRunAt).toLocaleString()}</span>}
            {report.isShared && <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> Shared</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <select value={schedule} onChange={e => { setSchedule(e.target.value); saveSchedule() }} className="bg-transparent text-xs text-zinc-300 outline-none">
              {SCHEDULES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button onClick={exportCsv} disabled={!data.length} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 rounded-lg text-xs transition-colors disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 rounded-lg text-xs transition-colors">
            <Printer className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={runReport} disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            <Play className="w-4 h-4" /> {running ? 'Running...' : 'Run Report'}
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-zinc-500 text-sm">Click &quot;Run Report&quot; to generate results</div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-medium text-zinc-100">{data.length} rows</span>
            <span className="text-xs text-zinc-500 capitalize">{report.reportType} report</span>
          </div>
          <div className="p-5 overflow-x-auto">
            <GenericTable data={data} />
          </div>
        </div>
      )}
    </div>
  )
}
