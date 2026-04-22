'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Plus, ChevronRight, Star, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceBook {
  id: string
  name: string
  description: string | null
  currency: string
  isDefault: boolean
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  _count: { entries: number }
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export default function PriceBooksPage() {
  const [books, setBooks] = useState<PriceBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', currency: 'USD', validFrom: '', validTo: '', isDefault: false })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/pricing/price-books')
      const data = await res.json()
      setBooks(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load price books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/pricing/price-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          currency: form.currency,
          isDefault: form.isDefault,
          validFrom: form.validFrom || null,
          validTo: form.validTo || null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setShowModal(false)
      setForm({ name: '', description: '', currency: 'USD', validFrom: '', validTo: '', isDefault: false })
      await load()
    } catch {
      setError('Failed to create price book')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(book: PriceBook) {
    await fetch(`/api/pricing/price-books/${book.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !book.isActive }),
    })
    await load()
  }

  async function setDefault(book: PriceBook) {
    await fetch(`/api/pricing/price-books/${book.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    await load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 text-sm">Pricing</Link>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <span className="text-zinc-100 font-semibold">Price Books</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Price Book
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-zinc-100">Price Books</span>
          <span className="text-zinc-500 text-sm ml-1">({books.length})</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />)}
          </div>
        ) : books.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No price books found</p>
            <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto">
              <Plus className="w-4 h-4" /> Create your first price book
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Currency</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium">Entries</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Valid From</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Valid To</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium">Default</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {books.map(book => (
                  <tr key={book.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/pricing/price-books/${book.id}`} className="text-zinc-100 hover:text-blue-400 font-medium flex items-center gap-2">
                        {book.name}
                        {book.isDefault && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      </Link>
                      {book.description && <div className="text-xs text-zinc-500 mt-0.5">{book.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{book.currency}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-zinc-200 font-medium">{book._count.entries}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{fmtDate(book.validFrom)}</td>
                    <td className="px-4 py-3 text-zinc-400">{fmtDate(book.validTo)}</td>
                    <td className="px-4 py-3 text-center">
                      {book.isDefault ? (
                        <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">Default</span>
                      ) : (
                        <button onClick={() => setDefault(book)} className="text-xs text-zinc-500 hover:text-amber-400 transition-colors">Set default</button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(book)} className="text-zinc-400 hover:text-zinc-200 transition-colors">
                        {book.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/pricing/price-books/${book.id}`} className="text-zinc-500 hover:text-zinc-300">
                        <ChevronRight className="w-4 h-4" />
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
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">New Price Book</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Retail Standard" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                    <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Valid To</label>
                  <input type="date" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="accent-blue-500" />
                <span className="text-sm text-zinc-300">Set as default price book</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className={cn('flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors', saving && 'opacity-50')}>
                  {saving ? 'Creating…' : 'Create Price Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
