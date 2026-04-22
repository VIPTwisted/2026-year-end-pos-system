'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Trash2, AlertTriangle } from 'lucide-react'

const TAX_TYPES = ['sales', 'use', 'vat', 'exempt', 'withholding'] as const

interface TaxCode {
  id:          string
  code:        string
  name:        string
  rate:        number
  taxType:     string
  description: string | null
  isActive:    boolean
  createdAt:   string
}

export default function EditTaxRatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [form, setForm] = useState({
    code:        '',
    name:        '',
    rate:        '',
    taxType:     'sales',
    description: '',
    isActive:    true,
  })
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetch(`/api/settings/tax-rates/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json() as Promise<TaxCode>
      })
      .then((data) => {
        setForm({
          code:        data.code,
          name:        data.name,
          rate:        String(data.rate),
          taxType:     data.taxType,
          description: data.description ?? '',
          isActive:    data.isActive,
        })
      })
      .catch(() => setError('Failed to load tax rate'))
      .finally(() => setLoading(false))
  }, [id])

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
      const res = await fetch(`/api/settings/tax-rates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code:        form.code.trim().toUpperCase(),
          name:        form.name.trim(),
          rate:        rateNum,
          taxType:     form.taxType,
          description: form.description.trim() || null,
          isActive:    form.isActive,
        }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to save')
        return
      }
      router.push('/settings/tax-rates')
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/settings/tax-rates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to delete')
        setShowDeleteModal(false)
        return
      }
      router.push('/settings/tax-rates')
    } catch {
      setError('Network error — please try again')
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">Delete Tax Rate</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-5">
              This will permanently delete <span className="text-zinc-200 font-medium">{form.name}</span>.
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <h1 className="text-base font-semibold text-zinc-100">Edit Tax Rate</h1>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
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
              {saving ? 'Saving…' : 'Save Changes'}
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
