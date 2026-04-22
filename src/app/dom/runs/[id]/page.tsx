'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react'

interface DomResult {
  id: string
  orderId: string | null
  orderLine: string | null
  productName: string | null
  qty: number
  assignedTo: string | null
  assignedType: string | null
  routingScore: number
  splitNumber: number
  reason: string | null
  status: string
}

interface Run {
  id: string
  profileName: string
  status: string
  ordersIn: number
  ordersRouted: number
  ordersFailed: number
  duration: number | null
  runAt: string
  results: DomResult[]
}

export default function DomRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [run, setRun] = useState<Run | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/dom/runs/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.error) { setError(data.error); return }; setRun(data) })
      .catch(() => setError('Failed to load run'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 flex items-center gap-2 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>
  if (error || !run) return <div className="p-6 text-red-400">{error || 'Run not found'}</div>

  const routedCount = run.results.filter((r) => r.status === 'routed').length
  const partialCount = run.results.filter((r) => r.status === 'partial').length
  const unroutableCount = run.results.filter((r) => r.status === 'unroutable').length

  function statusBadge(s: string) {
    if (s === 'completed') return <span className="px-2 py-0.5 rounded text-xs bg-emerald-900/50 text-emerald-400">Completed</span>
    if (s === 'running') return <span className="px-2 py-0.5 rounded text-xs bg-blue-900/50 text-blue-400">Running</span>
    return <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-400">Failed</span>
  }

  function resultBadge(s: string) {
    if (s === 'routed') return <span className="px-2 py-0.5 rounded text-xs bg-emerald-900/50 text-emerald-400">Routed</span>
    if (s === 'partial') return <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400">Partial</span>
    return <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-400">Unroutable</span>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dom/runs" className="text-zinc-500 hover:text-zinc-300 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-zinc-100 font-mono">{run.id.slice(0, 20)}…</h1>
            {statusBadge(run.status)}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Profile: {run.profileName} · {new Date(run.runAt).toLocaleString()} · {run.duration != null ? `${run.duration}ms` : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          <div><div className="text-2xl font-bold text-zinc-100">{routedCount}</div><div className="text-xs text-zinc-500">Routed</div></div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <MinusCircle className="w-8 h-8 text-yellow-400 shrink-0" />
          <div><div className="text-2xl font-bold text-zinc-100">{partialCount}</div><div className="text-xs text-zinc-500">Partial</div></div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
          <div><div className="text-2xl font-bold text-zinc-100">{unroutableCount}</div><div className="text-xs text-zinc-500">Unroutable</div></div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300">Routing Decisions ({run.results.length} lines)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                <th className="px-4 py-2 font-medium">Order/Line</th>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Assigned To</th>
                <th className="px-4 py-2 font-medium">Location Type</th>
                <th className="px-4 py-2 font-medium">Routing Score</th>
                <th className="px-4 py-2 font-medium">Split #</th>
                <th className="px-4 py-2 font-medium">Reason</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {run.results.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-600">No results.</td></tr>
              ) : run.results.map((r) => (
                <tr key={r.id} className={`border-b border-zinc-800/40 hover:bg-zinc-800/20 ${r.status === 'unroutable' ? 'bg-red-950/10' : r.status === 'partial' ? 'bg-yellow-950/10' : ''}`}>
                  <td className="px-4 py-2.5 text-zinc-500 font-mono text-xs">{r.orderLine ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-200">{r.productName ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{r.qty}</td>
                  <td className="px-4 py-2.5 text-zinc-300">{r.assignedTo || '—'}</td>
                  <td className="px-4 py-2.5">{r.assignedType ? <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{r.assignedType}</span> : '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {r.routingScore > 0 ? (
                      <span className={r.routingScore >= 0.7 ? 'text-emerald-400' : r.routingScore >= 0.4 ? 'text-yellow-400' : 'text-red-400'}>
                        {r.routingScore.toFixed(3)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">{r.splitNumber}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-xs max-w-xs">{r.reason ?? '—'}</td>
                  <td className="px-4 py-2.5">{resultBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
