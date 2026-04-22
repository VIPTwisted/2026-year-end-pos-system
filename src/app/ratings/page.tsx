'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import Link from 'next/link'

type ProductReview = {
  id: string
  productName: string | null
  customerName: string | null
  rating: number
  title: string | null
  status: string
  createdAt: string
  verifiedPurchase: boolean
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn('w-3.5 h-3.5', s <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700')} />
      ))}
    </div>
  )
}

export default function RatingsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then(setReviews)
      .finally(() => setLoading(false))
  }, [])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch(`/api/reviews/${id}/${action}`, { method: 'POST' })
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r))
  }

  const total = reviews.length
  const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
  const pending = reviews.filter((r) => r.status === 'pending').length
  const approved = reviews.filter((r) => r.status === 'approved').length

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))
  const maxDist = Math.max(...ratingDist.map((d) => d.count), 1)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Ratings &amp; Reviews</h1>
        <p className="text-zinc-400 text-sm mt-1">Moderate customer product reviews</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: total },
          { label: 'Avg Rating', value: avgRating.toFixed(1) },
          { label: 'Pending', value: pending },
          { label: 'Approved', value: approved },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <p className="text-zinc-400 text-sm mb-2">{kpi.label}</p>
            <p className="text-3xl font-bold text-zinc-100">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Rating Distribution</h2>
          <div className="space-y-2">
            {ratingDist.map((d) => (
              <div key={d.star} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-4">{d.star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(d.count / maxDist) * 100}%` }} />
                </div>
                <span className="text-xs text-zinc-500 w-4">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-300">Moderation Queue</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">Product</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">Customer</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">Rating</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">Title</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">Status</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-2 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-zinc-500 py-6 text-xs">Loading...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-zinc-500 py-6 text-xs">No reviews</td></tr>
              ) : reviews.slice(0, 20).map((r) => (
                <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-2 text-zinc-300 text-xs">
                    <Link href={`/ratings/${r.id}`} className="hover:text-blue-400 transition-colors">{r.productName ?? '—'}</Link>
                  </td>
                  <td className="px-4 py-2 text-zinc-400 text-xs">{r.customerName ?? '—'}</td>
                  <td className="px-4 py-2"><StarDisplay rating={r.rating} /></td>
                  <td className="px-4 py-2 text-zinc-400 text-xs max-w-[150px] truncate">{r.title ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full',
                      r.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-red-500/10 text-red-400')}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {r.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleAction(r.id, 'approve')} className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded transition-colors">
                          Approve
                        </button>
                        <button onClick={() => handleAction(r.id, 'reject')} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-0.5 rounded transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
