'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const TAX_TYPES = ['sales', 'use', 'vat', 'exempt', 'withholding'] as const

export default function NewTaxRatePage() {
  const router = useRouter()

  const [form, setForm] = useState({
    code:        '',
    name:        '',
    rate:        '',
    taxType:     'sales',
    description: '',
    isActive:    true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const rateNum = parseFloat(form.rate)
    if (!form.code.trim()) { setError('Code is required'); return }
    if (!form.name.trim()) { setError('Name is required'); return }
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setError('Rate must be a number between 0 and 100')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/settings/tax-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code:        form.code.trim().toUpperCase(),
          name:        form.name.trim(),
          rate:        rateNum,
          taxType:     form.taxType,
          description: form.description.trim() || undefined,
          isActive:    form.isActive,
        }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to create tax rate')
        return
      }
      router.push('/settings/tax-rates')
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link
          href="/settings/tax-rates"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Tax Rates
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-base font-semibold text-zinc-100">New Tax Rate</h1>
      </header>

      <main className="px-6 py-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Code */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              placeholder="e.g. TX-SALES-8"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Texas State Sales Tax"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Rate */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Rate (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              max="100"
              value={form.rate}
              onChange={(e) => set('rate', e.target.value)}
              placeholder="e.g. 8.25"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-[11px] text-zinc-600 mt-1">Enter as a percentage (e.g. 8.25 for 8.25%)</p>
          </div>

          {/* Tax Type */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Tax Type
            </label>
            <select
              value={form.taxType}
              onChange={(e) => set('taxType', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            >
              {TAX_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <label htmlFor="isActive" className="text-sm text-zinc-300 select-none cursor-pointer">
              Active (included in tax calculations)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? 'Creating…' : 'Create Tax Rate'}
            </button>
            <Link
              href="/settings/tax-rates"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </Link>
          </div>

        </form>
      </main>
    </div>
  )
}
