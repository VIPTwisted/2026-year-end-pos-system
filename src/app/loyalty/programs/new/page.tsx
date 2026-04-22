'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewLoyaltyProgramPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: '',
  })

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Program name is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/loyalty/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          status: form.status,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const program = await res.json()
      router.push(`/loyalty/programs/${program.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create program')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Loyalty Program" />
      <main className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh]">
        <div className="max-w-xl mx-auto">
          <Link
            href="/loyalty/programs"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Programs
          </Link>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-5">Create Loyalty Program</h2>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-[13px] text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Program Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handle}
                  placeholder="e.g. NovaPOS Rewards"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handle}
                  rows={3}
                  placeholder="Optional description..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handle}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handle}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handle}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] h-9 px-4 rounded transition-colors font-medium"
                >
                  {saving ? 'Creating...' : 'Create Program'}
                </button>
                <Link
                  href="/loyalty/programs"
                  className="px-4 h-9 inline-flex items-center text-[13px] text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
