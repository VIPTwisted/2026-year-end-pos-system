'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'

interface Store {
  id: string
  name: string
}

export default function NewPhysicalCountPage() {
  const router = useRouter()

  const [stores, setStores] = useState<Store[]>([])
  const [storeId, setStoreId] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then((data: Store[] | { stores: Store[] }) => {
        const list = Array.isArray(data) ? data : (data as { stores: Store[] }).stores ?? []
        setStores(list)
        if (list.length > 0) setStoreId(list[0].id)
      })
      .catch(() => setError('Failed to load stores'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/inventory/counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, notes: notes.trim() || undefined }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to create count')
      }

      const count = await res.json() as { id: string }
      notify('Count created')
      router.push(`/inventory/counts/${count.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      notify(msg, 'err')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${
            toast.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/40' : 'bg-red-500/20 text-red-300 border border-red-600/40'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link
          href="/inventory/counts"
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Physical Inventory Counts
        </Link>
        <h1 className="text-base font-semibold text-zinc-100">New Count</h1>
      </header>

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-xl mx-auto p-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-zinc-100 mb-1">Create Physical Inventory Count</h2>
            <p className="text-xs text-zinc-500 mb-6">
              All active products at the selected store will be auto-populated with their current system quantities.
            </p>

            {error && (
              <div className="mb-4 px-3 py-2 rounded bg-red-500/10 border border-red-600/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Store *
                </label>
                <select
                  value={storeId}
                  onChange={e => setStoreId(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a store…</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Reason for count, zone, or other notes…"
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !storeId}
                  className="flex items-center gap-2 px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Creating…' : 'Create Count'}
                </button>
                <Link
                  href="/inventory/counts"
                  className="px-4 py-2 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-sm transition-colors"
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
