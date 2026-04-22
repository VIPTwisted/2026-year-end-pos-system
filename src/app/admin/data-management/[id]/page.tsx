import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Download, RotateCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-zinc-700 text-zinc-300',
  running: 'bg-blue-500/20 text-blue-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  failed: 'bg-red-500/20 text-red-300',
  cancelled: 'bg-zinc-600/20 text-zinc-400',
}

export default async function DataJobDetailPage({ params }: { params: { id: string } }) {
  const job = await prisma.dataManagementJob.findUnique({ where: { id: params.id } })
  if (!job) notFound()

  let errors: Array<{ row?: number; field?: string; message: string }> = []
  try {
    if (job.errorsJson) errors = JSON.parse(job.errorsJson)
  } catch { /* ignore */ }

  const timeline = [
    { label: 'Created', time: job.createdAt, done: true },
    { label: 'Started', time: job.startedAt, done: !!job.startedAt },
    { label: 'Completed', time: job.completedAt, done: !!job.completedAt },
  ]

  return (
    <>
      <TopBar
        title={job.jobName}
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Data Management', href: '/admin/data-management' },
        ]}
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen space-y-6">
        <Link href="/admin/data-management" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Data Management
        </Link>

        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">{job.jobName}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                <span className="capitalize">{job.jobType}</span>
                <span>·</span>
                <span>{job.entityName}</span>
                <span>·</span>
                <span className="uppercase font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{job.fileFormat}</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status] ?? ''}`}>
              {job.status}
            </span>
          </div>

          {/* Record counts */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500">Total Records</p>
              <p className="text-xl font-bold text-zinc-100 mt-0.5">{job.recordCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Success</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{job.successCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Errors</p>
              <p className={`text-xl font-bold mt-0.5 ${job.errorCount > 0 ? 'text-red-400' : 'text-zinc-600'}`}>
                {job.errorCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {job.recordCount > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${Math.round((job.successCount / job.recordCount) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                {Math.round((job.successCount / job.recordCount) * 100)}% successful
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Status Timeline</h3>
          <div className="flex items-center gap-0">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done ? 'bg-emerald-600' : 'bg-zinc-700'}`}>
                    {step.done
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      : <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    }
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">{step.label}</p>
                  <p className="text-[10px] text-zinc-600">
                    {step.time ? new Date(step.time).toLocaleString() : '—'}
                  </p>
                </div>
                {i < timeline.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-5 ${step.done ? 'bg-emerald-700' : 'bg-zinc-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error log */}
        {errors.length > 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Error Log</h3>
              <span className="ml-auto text-xs text-red-400">{errors.length} errors</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Row</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Error</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-2 text-xs text-zinc-400 font-mono">{err.row ?? i + 1}</td>
                    <td className="px-4 py-2 text-xs text-zinc-400">{err.field ?? '—'}</td>
                    <td className="px-4 py-2 text-xs text-red-300">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {job.fileUrl && (
            <a href={job.fileUrl} target="_blank" rel="noreferrer">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </a>
          )}
          {(job.status === 'failed' || job.status === 'cancelled') && (
            <form action={`/api/admin/data-management/${job.id}`} method="PATCH">
              <button
                type="button"
                onClick={async () => {
                  await fetch(`/api/admin/data-management/${job.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'retry' }),
                  })
                  window.location.reload()
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-xs text-blue-300 border border-blue-800/50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry Job
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  )
}
