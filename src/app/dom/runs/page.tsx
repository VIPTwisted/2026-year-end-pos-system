'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Run {
  id: string
  profileName: string
  status: string
  ordersIn: number
  ordersRouted: number
  ordersFailed: number
  duration: number | null
  runAt: string
}

export default function DomRunsPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  async function load(p: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/dom/runs?page=${p}&limit=${limit}`)
      const data = await res.json()
      setRuns(data.runs ?? [])
      setTotal(data.total ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  function statusBadge(status: string) {
    if (status === 'completed') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-400">Completed</span>
    if (status === 'running') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-400">Running</span>
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400">Failed</span>
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
          <Play className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">DOM Run History</h1>
          <p className="text-sm text-zinc-500">{total} total runs</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                <th className="px-4 py-3 font-medium">Run ID</th>
                <th className="px-4 py-3 font-medium">Profile Used</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Orders In</th>
                <th className="px-4 py-3 font-medium">Routed</th>
                <th className="px-4 py-3 font-medium">Failed</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Run Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-600">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading runs…
                </td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-600">No DOM runs yet.</td></tr>
              ) : runs.map((run) => (
                <tr key={run.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/dom/runs/${run.id}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/dom/runs/${run.id}`} onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                      {run.id.slice(0, 16)}…
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300">{run.profileName}</td>
                  <td className="px-4 py-2.5">{statusBadge(run.status)}</td>
                  <td className="px-4 py-2.5 text-zinc-300">{run.ordersIn}</td>
                  <td className="px-4 py-2.5 text-emerald-400 font-medium">{run.ordersRouted}</td>
                  <td className="px-4 py-2.5 text-red-400">{run.ordersFailed}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{run.duration != null ? `${run.duration}ms` : '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-xs">{new Date(run.runAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 transition-colors text-zinc-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 transition-colors text-zinc-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
