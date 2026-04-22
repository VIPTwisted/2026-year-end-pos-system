'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type FraudReview = {
  id: string
  orderNumber: string | null
  customerEmail: string | null
  riskScore: number
  status: string
  orderAmount: number | null
  createdAt: string
  notes: string | null
}

function RiskBadge({ score }: { score: number }) {
  const cls = score <= 25 ? 'bg-emerald-500/10 text-emerald-400' :
    score <= 50 ? 'bg-yellow-500/10 text-yellow-400' :
    score <= 75 ? 'bg-orange-500/10 text-orange-400' :
    'bg-red-500/10 text-red-400'
  return <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', cls)}>{score}</span>
}

const STATUS_TABS = ['All', 'pending', 'approved', 'rejected']

export default function FraudReviewsPage() {
  const [reviews, setReviews] = useState<FraudReview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')

  function load(status?: string) {
    const params = status && status !== 'All' ? `?status=${status}` : ''
    fetch(`/api/fraud/reviews${params}`)
      .then((r) => r.json())
      .then(setReviews)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(activeTab) }, [activeTab])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch(`/api/fraud/reviews/${id}/${action}`, { method: 'POST' })
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r))
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Fraud Reviews</h1>
        <p className="text-zinc-400 text-sm mt-1">Review and action flagged orders</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {STATUS_TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 text-sm capitalize transition-colors', activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400 hover:text-zinc-200')}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Order</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Customer</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Amount</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Risk Score</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-zinc-500 py-8">Loading...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-zinc-500 py-8">No reviews</td></tr>
            ) : reviews.map((r) => (
              <tr key={r.id} className={cn('border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors', r.riskScore >= 75 && 'border-l-2 border-l-red-500')}>
                <td className="px-4 py-3 font-mono text-zinc-300 text-xs">{r.orderNumber ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{r.customerEmail ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{r.orderAmount != null ? `$${r.orderAmount.toFixed(2)}` : '—'}</td>
                <td className="px-4 py-3"><RiskBadge score={r.riskScore} /></td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize',
                    r.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                    r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-red-500/10 text-red-400')}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(r.id, 'approve')}
                        className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded transition-colors">Approve</button>
                      <button onClick={() => handleAction(r.id, 'reject')}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded transition-colors">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
