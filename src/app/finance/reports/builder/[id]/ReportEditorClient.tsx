'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Globe, Edit } from 'lucide-react'
import Link from 'next/link'

export function ReportEditorClient({ reportId, isPublished }: { reportId: string; isPublished: boolean }) {
  const router = useRouter()
  const [showRunModal, setShowRunModal] = useState(false)
  const [runDate, setRunDate] = useState(() => new Date().toISOString().split('T')[0])
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<{ message: string } | null>(null)
  const [publishing, setPublishing] = useState(false)

  async function handleRun() {
    setRunning(true)
    try {
      const res = await fetch(`/api/finance/reports/builder/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_preview', asOfDate: runDate }),
      })
      const data = await res.json()
      setRunResult(data)
      router.refresh()
    } finally {
      setRunning(false)
    }
  }

  async function handlePublishToggle() {
    setPublishing(true)
    try {
      await fetch(`/api/finance/reports/builder/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isPublished ? 'unpublish' : 'publish' }),
      })
      router.refresh()
    } finally {
      setPublishing(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3">
        <button onClick={handlePublishToggle} disabled={publishing}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 ${
            isPublished
              ? 'bg-zinc-700/40 border-zinc-600/40 text-zinc-400 hover:bg-zinc-700/60'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}>
          <Globe className="w-3.5 h-3.5" />
          {publishing ? '...' : isPublished ? 'Unpublish' : 'Publish'}
        </button>
        <button onClick={() => setShowRunModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
          <Play className="w-3.5 h-3.5" /> Run Report
        </button>
      </div>

      {/* Run Modal */}
      {showRunModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">Run Report</h3>
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-zinc-500 mb-1">As-Of Date</label>
              <input type="date" value={runDate} onChange={e => setRunDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            {runResult && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-[12px] text-emerald-400">
                Report run logged. Preview data would appear here with live GL integration.
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => { setShowRunModal(false); setRunResult(null) }}
                className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                Close
              </button>
              <button onClick={handleRun} disabled={running}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">
                <Play className="w-3.5 h-3.5" />
                {running ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
