'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  segmentIds: string | null
  predictedChurnScore: number | null
  predictedCLV: number | null
  lastActivityAt: string | null
  totalSpend: number
}

function churnColor(score: number | null) {
  if (score === null) return 'text-zinc-500'
  if (score < 30) return 'text-emerald-400'
  if (score < 60) return 'text-amber-400'
  return 'text-red-400'
}

function churnBg(score: number | null) {
  if (score === null) return 'bg-zinc-800 text-zinc-500'
  if (score < 30) return 'bg-emerald-500/10 text-emerald-400'
  if (score < 60) return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

export default function ProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const TAKE = 50

  const load = useCallback((s: string, sk: number) => {
    setLoading(true)
    const params = new URLSearchParams({ skip: sk.toString() })
    if (s) params.set('search', s)
    fetch(`/api/customer-insights/profiles?${params}`)
      .then(r => r.json())
      .then(d => { setProfiles(Array.isArray(d.profiles) ? d.profiles : []); setTotal(d.total ?? 0); setLoading(false) })
  }, [])

  useEffect(() => { load(search, skip) }, [load, search, skip])

  function handleSearch(v: string) { setSearch(v); setSkip(0) }

  const segIds = (s: string | null) => {
    if (!s) return []
    try { return JSON.parse(s) as string[] } catch { return s.split(',').filter(Boolean) }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl font-bold">Customer Profiles</h1>
          <span className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">{total.toLocaleString()} total</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Email</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Segments</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Churn Score</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">CLV</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
            ) : profiles.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">No profiles found</td></tr>
            ) : profiles.map(p => {
              const segs = segIds(p.segmentIds)
              const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Unknown'
              return (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/customer-insights/profiles/${p.id}`)}
                  className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-zinc-100">{name}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {segs.slice(0, 3).map((s, i) => (
                        <span key={i} className="bg-purple-500/20 text-purple-300 text-xs px-1.5 py-0.5 rounded">{s.slice(0, 12)}</span>
                      ))}
                      {segs.length > 3 && <span className="text-zinc-500 text-xs">+{segs.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.predictedChurnScore !== null ? (
                      <span className={cn('text-xs px-2 py-0.5 rounded font-mono', churnBg(p.predictedChurnScore))}>
                        {p.predictedChurnScore.toFixed(0)}%
                      </span>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-300 font-mono">
                    {p.predictedCLV != null ? `$${p.predictedCLV.toFixed(0)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {p.lastActivityAt ? new Date(p.lastActivityAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>Showing {skip + 1}–{Math.min(skip + TAKE, total)} of {total.toLocaleString()}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSkip(s => Math.max(0, s - TAKE))}
            disabled={skip === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={() => setSkip(s => s + TAKE)}
            disabled={skip + TAKE >= total}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded-lg transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
