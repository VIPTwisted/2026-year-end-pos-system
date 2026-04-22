'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

interface Employee {
  id: string
  firstName: string
  lastName: string
}

interface ScoreCategory {
  key: string
  label: string
}

const SCORE_CATEGORIES: ScoreCategory[] = [
  { key: 'attendance', label: 'Attendance & Punctuality' },
  { key: 'performance', label: 'Job Performance' },
  { key: 'teamwork', label: 'Teamwork & Collaboration' },
  { key: 'communication', label: 'Communication' },
  { key: 'initiative', label: 'Initiative & Innovation' },
]

function generateQuarters(): string[] {
  const now = new Date()
  const quarters: string[] = []
  let year = now.getFullYear()
  let q = Math.floor(now.getMonth() / 3) + 1

  for (let i = 0; i < 5; i++) {
    quarters.push(`${year}-Q${q}`)
    q--
    if (q === 0) { q = 4; year-- }
  }
  return quarters
}

function RatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded text-[13px] font-semibold border transition-colors ${
            value === n
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          }`}
        >
          {n}
        </button>
      ))}
      <span className="ml-2 text-[12px] text-zinc-500">{value}/5</span>
    </div>
  )
}

export default function NewPerformanceReviewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const quarters = generateQuarters()

  const defaultScores: Record<string, number> = Object.fromEntries(
    SCORE_CATEGORIES.map(c => [c.key, 3])
  )

  const [form, setForm] = useState({
    employeeId: '',
    reviewerId: '',
    reviewPeriod: quarters[0],
    reviewDate: new Date().toISOString().split('T')[0],
    strengths: '',
    improvements: '',
    goals: '',
  })
  const [scores, setScores] = useState<Record<string, number>>(defaultScores)
  const [overallRating, setOverallRating] = useState(3)
  const [overallManual, setOverallManual] = useState(false)

  useEffect(() => {
    fetch('/api/hr/employees')
      .then(r => r.json())
      .then((d: Employee[] | { employees?: Employee[] }) => {
        if (Array.isArray(d)) setEmployees(d)
        else if (d.employees) setEmployees(d.employees)
      })
      .catch(() => setError('Failed to load employees'))
  }, [])

  const recalcOverall = useCallback((s: Record<string, number>) => {
    const vals = Object.values(s)
    if (vals.length === 0) return
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length
    setOverallRating(Math.round(avg * 10) / 10)
  }, [])

  function updateScore(key: string, value: number) {
    const next = { ...scores, [key]: value }
    setScores(next)
    if (!overallManual) recalcOverall(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.employeeId) { setError('Please select an employee'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/hr/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: form.employeeId,
          reviewerId: form.reviewerId || undefined,
          reviewPeriod: form.reviewPeriod,
          reviewDate: form.reviewDate,
          overallRating,
          scores,
          strengths: form.strengths || undefined,
          improvements: form.improvements || undefined,
          goals: form.goals || undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Failed to create review')
      }
      const review = await res.json() as { id: string }
      router.push(`/hr/performance/${review.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Performance Review" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] font-semibold text-zinc-100">New Performance Review</h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-[13px] text-red-400">
              {error}
            </div>
          )}

          {/* Employee & Period */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Review Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Employee <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.employeeId}
                  onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                  required
                  className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-[13px] text-zinc-100 focus:border-blue-500 outline-none"
                >
                  <option value="">Select employee...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.lastName}, {e.firstName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Reviewer (Manager)
                </label>
                <select
                  value={form.reviewerId}
                  onChange={e => setForm(f => ({ ...f, reviewerId: e.target.value }))}
                  className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-[13px] text-zinc-100 focus:border-blue-500 outline-none"
                >
                  <option value="">Select reviewer...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.lastName}, {e.firstName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Review Period <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.reviewPeriod}
                  onChange={e => setForm(f => ({ ...f, reviewPeriod: e.target.value }))}
                  required
                  className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-[13px] text-zinc-100 focus:border-blue-500 outline-none"
                >
                  {quarters.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Review Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.reviewDate}
                  onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))}
                  required
                  className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-[13px] text-zinc-100 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Category Scores</h2>
            <div className="space-y-4">
              {SCORE_CATEGORIES.map(cat => (
                <div key={cat.key} className="flex items-center justify-between gap-4">
                  <label className="text-[13px] text-zinc-300 min-w-[200px]">{cat.label}</label>
                  <RatingInput
                    value={scores[cat.key] ?? 3}
                    onChange={v => updateScore(cat.key, v)}
                  />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-zinc-800/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-zinc-200">Overall Rating</label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Auto-calculated from categories. Click to override.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RatingInput
                    value={Math.round(overallRating)}
                    onChange={v => { setOverallManual(true); setOverallRating(v) }}
                  />
                  {overallManual && (
                    <button
                      type="button"
                      onClick={() => { setOverallManual(false); recalcOverall(scores) }}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Text sections */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Narrative</h2>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Strengths</label>
              <textarea
                value={form.strengths}
                onChange={e => setForm(f => ({ ...f, strengths: e.target.value }))}
                rows={3}
                placeholder="Key strengths demonstrated this period..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Areas for Improvement</label>
              <textarea
                value={form.improvements}
                onChange={e => setForm(f => ({ ...f, improvements: e.target.value }))}
                rows={3}
                placeholder="Areas needing development or improvement..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Goals for Next Period</label>
              <textarea
                value={form.goals}
                onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
                rows={3}
                placeholder="Targets and objectives for the next review period..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
            >
              {saving ? 'Creating...' : 'Create Review'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
