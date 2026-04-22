'use client'

import { TopBar } from '@/components/layout/TopBar'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPayrollPeriodPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    payDate: '',
    notes: '',
  })

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.startDate || !form.endDate || !form.payDate) {
      notify('Please fill in all required fields', 'err')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/payroll/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          payDate: new Date(form.payDate).toISOString(),
          notes: form.notes || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create payroll period')
      }
      const created = await res.json()
      notify('Period created')
      setTimeout(() => router.push(`/payroll/${created.id}`), 600)
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Unknown error', 'err')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Payroll Period"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Payroll', href: '/payroll' },
        ]}
        showBack
      />

      {toast && (
        <div
          className={`fixed top-16 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="max-w-lg mx-auto p-6">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <h2 className="text-[14px] font-semibold text-zinc-100 mb-5">Create Payroll Period</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Period Name <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. April 2026 Bi-Weekly"
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  End Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Pay Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="payDate"
                value={form.payDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Optional notes..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {loading ? 'Creating...' : 'Create Period'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/payroll')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
