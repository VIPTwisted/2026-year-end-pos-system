'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Star, Check, X, Flag, Trash2 } from 'lucide-react'

interface Rating {
  id: string
  productId: string
  product: { id: string; name: string; slug: string }
  reviewerName: string | null
  email: string | null
  rating: number
  title: string | null
  body: string | null
  status: string
  isVerified: boolean
  helpfulCount: number
  createdAt: string
}

const TABS = ['all', 'pending', 'approved', 'rejected', 'flagged'] as const
type Tab = typeof TABS[number]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-rose-500/20 text-rose-400',
  flagged: 'bg-orange-500/20 text-orange-400',
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400' : 'text-zinc-700'}`} fill={s <= rating ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [tab, setTab] = useState<Tab>('pending')
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab !== 'all') params.set('status', tab)
    if (starFilter !== null) params.set('rating', String(starFilter))
    const data = await fetch(`/api/ecom/ratings?${params}`).then(r => r.json())
    setRatings(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [tab, starFilter])

  useEffect(() => { load() }, [load])

  // compute stats from all ratings (no status filter)
  const [allRatings, setAllRatings] = useState<Rating[]>([])
  useEffect(() => {
    fetch('/api/ecom/ratings').then(r => r.json()).then(d => setAllRatings(Array.isArray(d) ? d : []))
  }, [])

  const computedStats = {
    total: allRatings.length,
    pending: allRatings.filter(r => r.status === 'pending').length,
    avgRating: allRatings.length ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1) : '0.0',
    verified: allRatings.filter(r => r.isVerified).length,
  }

  async function moderate(id: string, newStatus: string) {
    await fetch(`/api/ecom/ratings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

  async function deleteRating(id: string) {
    if (!confirm('Delete this review?')) return
    await fetch(`/api/ecom/ratings/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Star className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-zinc-100">Ratings & Reviews</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: computedStats.total, color: 'text-zinc-100' },
          { label: 'Pending Moderation', value: computedStats.pending, color: 'text-amber-400' },
          { label: 'Avg Rating', value: computedStats.avgRating, color: 'text-amber-400' },
          { label: 'Verified Purchases', value: computedStats.verified, color: 'text-emerald-400' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className={`text-3xl font-bold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-zinc-400">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 border-b border-zinc-800 flex-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <span className="text-xs text-zinc-500 self-center">Stars:</span>
          {[null, 5, 4, 3, 2, 1].map(s => (
            <button key={String(s)} onClick={() => setStarFilter(prev => prev === s ? null : s)}
              className={`px-2 py-1 text-xs rounded transition-colors ${starFilter === s ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              {s === null ? 'All' : `${s}★`}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Product</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Reviewer</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Rating</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Review</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-8 text-zinc-500">Loading...</td></tr>}
            {!loading && ratings.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-zinc-500">No reviews found</td></tr>}
            {ratings.map(r => (
              <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/ecom/products/${r.productId}`} className="text-blue-400 hover:text-blue-300 text-xs">
                    {r.product?.name ?? r.productId}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-zinc-200 text-xs font-medium">{r.reviewerName ?? 'Anonymous'}</div>
                  {r.isVerified && <div className="text-xs text-emerald-400">Verified</div>}
                </td>
                <td className="px-4 py-3"><StarRow rating={r.rating} /></td>
                <td className="px-4 py-3 max-w-[200px]">
                  {r.title && <div className="text-xs font-medium text-zinc-200 truncate">{r.title}</div>}
                  {r.body && <div className="text-xs text-zinc-400 truncate">{r.body}</div>}
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {r.status !== 'approved' && (
                      <button onClick={() => moderate(r.id, 'approved')} className="p-1 hover:bg-zinc-700 rounded text-emerald-400 hover:text-emerald-300" title="Approve">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button onClick={() => moderate(r.id, 'rejected')} className="p-1 hover:bg-zinc-700 rounded text-rose-400 hover:text-rose-300" title="Reject">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {r.status !== 'flagged' && (
                      <button onClick={() => moderate(r.id, 'flagged')} className="p-1 hover:bg-zinc-700 rounded text-amber-400 hover:text-amber-300" title="Flag">
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteRating(r.id)} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
