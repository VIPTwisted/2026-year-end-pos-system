'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

type CallQueue = {
  id: string; name: string; maxLength: number; avgWaitSeconds: number
  agentsAssigned: number; overflowAction: string; isActive: boolean
  createdAt: string; updatedAt: string
}

export default function QueuesPage() {
  const router = useRouter()
  const [queues, setQueues] = useState<CallQueue[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/contact-center/queues')
      .then(r => r.json())
      .then(d => { setQueues(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = queues.filter(q =>
    !search || q.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/contact-center" className="hover:text-white">Contact Center</Link>
          <span>/</span>
          <span className="text-white font-medium">Call Queues</span>
        </div>
        <div className="text-xs text-slate-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        <Link href="/contact-center/queues/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium">+ New</button>
        </Link>
        <button
          onClick={() => selected.length === 1 && router.push(`/contact-center/queues/${selected[0]}`)}
          disabled={selected.length !== 1}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Edit
        </button>
      </div>

      {/* Filter Pane */}
      <div className="bg-[#16213e]/60 border-b border-slate-700/30 px-6 py-3 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search queues..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
        />
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading call queues...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-600 bg-transparent"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map(q => q.id))}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Queue Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Max Queue Length</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Avg Wait Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Agents Assigned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Overflow Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No call queues. <Link href="/contact-center/queues/new" className="text-blue-400 hover:underline">Create one.</Link>
                    </td>
                  </tr>
                ) : filtered.map(q => (
                  <tr key={q.id} className={`hover:bg-slate-700/20 ${selected.includes(q.id) ? 'bg-blue-600/10' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggleSelect(q.id)} className="rounded border-slate-600 bg-transparent" />
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{q.name}</td>
                    <td className="px-4 py-3 text-slate-300">{q.maxLength}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {q.avgWaitSeconds > 0 ? `${Math.floor(q.avgWaitSeconds / 60)}:${String(q.avgWaitSeconds % 60).padStart(2, '0')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{q.agentsAssigned}</td>
                    <td className="px-4 py-3 text-slate-300 capitalize">{q.overflowAction}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${q.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                        {q.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {queues.length} records</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-slate-700 disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-slate-700 disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
