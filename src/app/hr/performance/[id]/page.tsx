'use client'

import { use, useEffect, useState } from 'react'
import { Star, ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Review = {
  id: string
  employeeName?: string | null
  employeeId?: string | null
  reviewerName?: string | null
  reviewerId?: string | null
  reviewPeriod: string
  reviewDate: string
  overallRating?: number | null
  status: string
  goals?: string | null
  strengths?: string | null
  improvements?: string | null
  notes?: string | null
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700/60 text-zinc-400',
  submitted: 'bg-blue-500/15 text-blue-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  closed: 'bg-zinc-600/40 text-zinc-500',
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110"
        >
          <Star className={cn('w-6 h-6', (hover || value) >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-700')} />
        </button>
      ))}
      <span className="ml-2 text-sm text-zinc-400 self-center">{value > 0 ? `${value}/5` : 'Not rated'}</span>
    </div>
  )
}

export default function PerformanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    overallRating: 0,
    goals: '',
    strengths: '',
    improvements: '',
    notes: '',
  })

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/hr/performance/${id}`)
    const data: Review = await res.json()
    setReview(data)
    setForm({
      overallRating: data.overallRating ?? 0,
      goals: data.goals ?? '',
      strengths: data.strengths ?? '',
      improvements: data.improvements ?? '',
      notes: data.notes ?? '',
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function patch(extra: Record<string, unknown> = {}) {
    setSaving(true)
    await fetch(`/api/hr/performance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, overallRating: form.overallRating || null, ...extra }),
    })
    setSaving(false)
    load()
  }

  if (loading) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Loading…</div>
  if (!review) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Not found</div>

  const isClosed = review.status === 'closed'

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/hr/performance" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Reviews
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">{review.employeeName || 'Unknown Employee'}</h1>
              <p className="text-zinc-400 text-sm mt-0.5">
                Reviewed by {review.reviewerName || 'Unknown'} · Period: <span className="font-mono">{review.reviewPeriod}</span>
              </p>
              <p className="text-zinc-500 text-xs mt-1">{new Date(review.reviewDate).toLocaleDateString()}</p>
            </div>
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', STATUS_COLORS[review.status] ?? 'bg-zinc-700 text-zinc-400')}>
              {review.status}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Overall Rating</label>
            <StarPicker value={form.overallRating} onChange={(v) => setForm({ ...form, overallRating: v })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Goals</label>
            <textarea
              disabled={isClosed}
              rows={3}
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Strengths</label>
            <textarea
              disabled={isClosed}
              rows={3}
              value={form.strengths}
              onChange={(e) => setForm({ ...form, strengths: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Areas for Improvement</label>
            <textarea
              disabled={isClosed}
              rows={3}
              value={form.improvements}
              onChange={(e) => setForm({ ...form, improvements: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Notes</label>
            <textarea
              disabled={isClosed}
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50"
            />
          </div>

          {!isClosed && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => patch()}
                disabled={saving}
                className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              {review.status === 'draft' && (
                <button
                  onClick={() => patch({ status: 'submitted' })}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Submit Review
                </button>
              )}
              {review.status === 'submitted' && (
                <button
                  onClick={() => patch({ status: 'approved' })}
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              )}
              {(review.status === 'submitted' || review.status === 'approved') && (
                <button
                  onClick={() => patch({ status: 'closed' })}
                  disabled={saving}
                  className="flex items-center gap-2 bg-zinc-600 hover:bg-zinc-500 text-zinc-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
