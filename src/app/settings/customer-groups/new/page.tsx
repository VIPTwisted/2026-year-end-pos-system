'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewCustomerGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [discountPct, setDiscountPct] = useState('0')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Group name is required.')
      return
    }
    const pct = parseFloat(discountPct)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setError('Discount must be between 0 and 100.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/customers/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, discountPct: pct }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        setError(d.error ?? 'Failed to create group')
        return
      }
      const group = await res.json() as { id: string }
      router.push(`/settings/customer-groups/${group.id}`)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
      <div className="px-6 py-4 max-w-xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings/customer-groups"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Customer Groups
          </Link>
          <span className="text-zinc-700">/</span>
          <h2 className="text-base font-semibold text-zinc-100">New Group</h2>
        </div>

        {/* Form card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Group Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VIP Wholesale"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Flat Discount % (0–100)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 pr-8 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
              </div>
              <p className="text-[11px] text-zinc-600">
                Applied to all products unless overridden by a specific rule.
              </p>
            </div>

            {error && (
              <div className="rounded bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {saving ? 'Creating...' : 'Create Group'}
              </button>
              <Link
                href="/settings/customer-groups"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

      </div>
    </main>
  )
}
