'use client'

import { use, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Star, ThumbsUp, Flag, CheckCircle, XCircle } from 'lucide-react'

type ProductReview = {
  id: string
  productName: string | null
  sku: string | null
  customerName: string | null
  rating: number
  title: string | null
  body: string | null
  verifiedPurchase: boolean
  status: string
  helpfulVotes: number
  reportCount: number
  createdAt: string
  moderatedAt: string | null
  moderatedBy: string | null
}

function StarDisplay({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn(cls, s <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700')} />
      ))}
    </div>
  )
}

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [review, setReview] = useState<ProductReview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reviews/${id}`)
      .then((r) => r.json())
      .then(setReview)
      .finally(() => setLoading(false))
  }, [id])

  async function handleAction(action: 'approve' | 'reject') {
    await fetch(`/api/reviews/${id}/${action}`, { method: 'POST' })
    setReview((r) => r ? { ...r, status: action === 'approve' ? 'approved' : 'rejected', moderatedAt: new Date().toISOString() } : r)
  }

  async function addHelpful() {
    if (!review) return
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpfulVotes: review.helpfulVotes + 1 }),
    })
    setReview((r) => r ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r)
  }

  async function addFlag() {
    if (!review) return
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportCount: review.reportCount + 1 }),
    })
    setReview((r) => r ? { ...r, reportCount: r.reportCount + 1 } : r)
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>
  if (!review) return <div className="p-6 text-zinc-400">Review not found</div>

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">{review.title ?? 'Untitled Review'}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StarDisplay rating={review.rating} size="lg" />
            <span className="text-zinc-400 text-sm">{review.rating}/5</span>
          </div>
        </div>
        <span className={cn('text-sm px-3 py-1 rounded-full',
          review.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
          review.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
          'bg-red-500/10 text-red-400')}>
          {review.status}
        </span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 text-xs mb-1">Product</p>
            <p className="text-zinc-200">{review.productName ?? '—'}</p>
            {review.sku && <p className="text-xs text-zinc-500 font-mono mt-0.5">{review.sku}</p>}
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1">Customer</p>
            <p className="text-zinc-200">{review.customerName ?? 'Anonymous'}</p>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-0.5">
                <CheckCircle className="w-3 h-3" /> Verified Purchase
              </span>
            )}
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1">Submitted</p>
            <p className="text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
          {review.moderatedAt && (
            <div>
              <p className="text-zinc-500 text-xs mb-1">Moderated</p>
              <p className="text-zinc-400">{new Date(review.moderatedAt).toLocaleDateString()}{review.moderatedBy && ` by ${review.moderatedBy}`}</p>
            </div>
          )}
        </div>

        {review.body && (
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-zinc-500 text-xs mb-2">Review Body</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{review.body}</p>
          </div>
        )}

        <div className="border-t border-zinc-800 pt-4 flex items-center gap-4">
          <button onClick={addHelpful} className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-sm transition-colors">
            <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpfulVotes})
          </button>
          <button onClick={addFlag} className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 text-sm transition-colors">
            <Flag className="w-4 h-4" /> Report ({review.reportCount})
          </button>
        </div>
      </div>

      {review.status === 'pending' && (
        <div className="flex gap-3">
          <button onClick={() => handleAction('approve')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-lg transition-colors">
            <CheckCircle className="w-4 h-4" /> Approve Review
          </button>
          <button onClick={() => handleAction('reject')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm px-5 py-2.5 rounded-lg transition-colors">
            <XCircle className="w-4 h-4" /> Reject Review
          </button>
        </div>
      )}
    </div>
  )
}
