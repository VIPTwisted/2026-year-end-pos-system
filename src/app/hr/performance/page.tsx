'use client'

import { useEffect, useState } from 'react'
import { Plus, Star, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Review = {
  id: string
  employeeName?: string | null
  reviewerName?: string | null
  reviewPeriod: string
  reviewDate: string
  overallRating?: number | null
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700/60 text-zinc-400',
  submitted: 'bg-blue-500/15 text-blue-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  closed: 'bg-zinc-600/40 text-zinc-500',
}

function StarRating({ rating }: { rating?: number | null }) {
  if (rating == null) return <span className="text-zinc-600">—</span>
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn('w-3.5 h-3.5', s <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700')} />
      ))}
    </div>
  )
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({
    employeeName: '',
    employeeId: '',
    reviewerName: '',
    reviewerId: '',
    reviewPeriod: '',
    overallRating: '',
    status: 'draft',
    goals: '',
    strengths: '',
    improvements: '',
    notes: '',
  })

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterPeriod) params.set('period', filterPeriod)
    if (filterStatus) params.set('status', filterStatus)
    const res = await fetch(`/api/hr/performance?${params}`)
    setReviews(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [filterPeriod, filterStatus])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      overallRating: form.overallRating ? parseFloat(form.overallRating) : null,
    }
    await fetch('/api/hr/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setShowModal(false)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className="w-7 h-7 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Performance Reviews</h1>
              <p className="text-zinc-400 text-sm mt-0.5">Track employee performance cycles</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Review
          </button>
        </div>

        <div className="flex gap-3 mb-5">
          <input
            placeholder="Filter by period (e.g. Q1-2026)"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 w-52"
          />
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="closed">Closed</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-zinc-500">Loading…</div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left px-4 py-3 font-medium">Employee</th>
                  <th className="text-left px-4 py-3 font-medium">Reviewer</th>
                  <th className="text-left px-4 py-3 font-medium">Period</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Rating</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-zinc-500">No reviews found</td></tr>
                )}
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.employeeName || '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.reviewerName || '—'}</td>
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{r.reviewPeriod}</td>
                    <td className="px-4 py-3 text-zinc-400">{new Date(r.reviewDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><StarRating rating={r.overallRating} /></td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-400')}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/hr/performance/${r.id}`} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-5">New Performance Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Employee Name</label>
                  <input
                    value={form.employeeName}
                    onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Reviewer Name</label>
                  <input
                    value={form.reviewerName}
                    onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Review Period *</label>
                  <input
                    required
                    placeholder="Q2-2026"
                    value={form.reviewPeriod}
                    onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Initial Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={form.overallRating}
                    onChange={(e) => setForm({ ...form, overallRating: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Goals</label>
                <textarea rows={2} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Strengths</label>
                <textarea rows={2} value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Areas for Improvement</label>
                <textarea rows={2} value={form.improvements} onChange={(e) => setForm({ ...form, improvements: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
