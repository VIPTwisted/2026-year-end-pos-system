'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

interface PreviewPeriod {
  periodNumber: number
  name: string
  startDate: string
  endDate: string
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toInputDate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function buildPreview(startDate: string, endDate: string): PreviewPeriod[] {
  if (!startDate || !endDate) return []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return []

  const periods: PreviewPeriod[] = []
  for (let i = 0; i < 12; i++) {
    const periodStart = addMonths(new Date(start.getFullYear(), start.getMonth(), 1), i)
    const rawEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0)
    const periodEnd = rawEnd > end ? end : rawEnd
    const clampedStart = periodStart < start ? start : periodStart

    const monthName = clampedStart.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    periods.push({
      periodNumber: i + 1,
      name: monthName,
      startDate: formatDateDisplay(clampedStart),
      endDate: formatDateDisplay(periodEnd),
    })
  }
  return periods
}

export default function NewFiscalYearPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [preview, setPreview] = useState<PreviewPeriod[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  // Auto-calculate end date when start changes
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00')
      if (!isNaN(start.getTime())) {
        const autoEnd = addDays(addMonths(start, 12), -1)
        setEndDate(toInputDate(autoEnd))
      }
    }
  }, [startDate])

  // Rebuild preview whenever dates change
  useEffect(() => {
    setPreview(buildPreview(startDate, endDate))
  }, [startDate, endDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) {
      notify('All fields are required', 'err')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/fiscal-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), startDate, endDate }),
      })
      const data = await res.json() as { fiscalYear?: { id: string }; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to create fiscal year')
        notify(data.error ?? 'Failed to create fiscal year', 'err')
        return
      }
      notify('Fiscal year created')
      router.push(`/finance/fiscal-years/${data.fiscalYear!.id}`)
    } catch {
      setError('Network error')
      notify('Network error', 'err')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Create Fiscal Year"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Fiscal Periods', href: '/finance/fiscal-years' },
        ]}
        showBack
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-16 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="max-w-3xl mx-auto w-full p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form card */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Fiscal Year Details
            </h2>

            {error && (
              <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="FY 2027"
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Periods Preview — 12 Monthly Periods
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-2.5">#</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-2.5">Name</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-2.5">Start</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-2.5">End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((p) => (
                      <tr key={p.periodNumber} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                        <td className="px-4 py-2.5 font-mono text-zinc-500 text-[12px]">{String(p.periodNumber).padStart(2, '0')}</td>
                        <td className="px-4 py-2.5 text-zinc-200">{p.name}</td>
                        <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">{p.startDate}</td>
                        <td className="px-4 py-2.5 text-zinc-400 font-mono text-[12px]">{p.endDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 bg-zinc-800/50 hover:bg-zinc-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            >
              {loading ? 'Creating...' : 'Create Fiscal Year'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
