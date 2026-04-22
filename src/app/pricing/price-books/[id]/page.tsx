'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronRight, Plus, Trash2, Star, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceBookEntry {
  id: string
  sku: string | null
  productName: string | null
  basePrice: number
  salePrice: number | null
  minQty: number
}

interface PriceBook {
  id: string
  name: string
  description: string | null
  currency: string
  isDefault: boolean
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  entries: PriceBookEntry[]
}

function fmtDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

export default function PriceBookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [book, setBook] = useState<PriceBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', validFrom: '', validTo: '' })
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [entryForm, setEntryForm] = useState({ sku: '', productName: '', basePrice: '', salePrice: '', minQty: '1' })
  const [savingEntry, setSavingEntry] = useState(false)
  const [savingBook, setSavingBook] = useState(false)

  async function load() {
    try {
      const res = await fetch(`/api/pricing/price-books/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setBook(data)
      setEditForm({ name: data.name, validFrom: fmtDate(data.validFrom), validTo: fmtDate(data.validTo) })
    } catch {
      setError('Failed to load price book')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleSaveBook() {
    setSavingBook(true)
    try {
      await fetch(`/api/pricing/price-books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name, validFrom: editForm.validFrom || null, validTo: editForm.validTo || null }),
      })
      setEditing(false)
      await load()
    } catch {
      setError('Failed to save')
    } finally {
      setSavingBook(false)
    }
  }

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault()
    setSavingEntry(true)
    try {
      await fetch(`/api/pricing/price-books/${id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: entryForm.sku || null,
          productName: entryForm.productName || null,
          basePrice: Number(entryForm.basePrice),
          salePrice: entryForm.salePrice ? Number(entryForm.salePrice) : null,
          minQty: Number(entryForm.minQty) || 1,
        }),
      })
      setShowAddEntry(false)
      setEntryForm({ sku: '', productName: '', basePrice: '', salePrice: '', minQty: '1' })
      await load()
    } catch {
      setError('Failed to add entry')
    } finally {
      setSavingEntry(false)
    }
  }

  async function handleDeleteEntry(entryId: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/pricing/price-books/${id}/entries?entryId=${entryId}`, { method: 'DELETE' })
    await load()
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  if (!book || error) {
    return <div className="min-h-[100dvh] bg-zinc-950 p-6"><div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4">{error || 'Not found'}</div></div>
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 text-sm">Pricing</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <Link href="/pricing/price-books" className="text-zinc-500 hover:text-zinc-300 text-sm">Price Books</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <span className="text-zinc-100 font-semibold text-sm">{book.name}</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            {editing ? (
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-lg font-bold focus:outline-none focus:border-blue-500" />
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-100">{book.name}</h1>
                  {book.isDefault && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </div>
                {book.description && <p className="text-zinc-400 text-sm mt-0.5">{book.description}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2 py-1 rounded-full border', book.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-zinc-700 text-zinc-400 border-zinc-600')}>
              {book.isActive ? 'Active' : 'Inactive'}
            </span>
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="text-zinc-500 hover:text-zinc-300 p-1"><X className="w-4 h-4" /></button>
                <button onClick={handleSaveBook} disabled={savingBook} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                  <Check className="w-4 h-4" /> Save
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-lg text-sm">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div><span className="text-zinc-500">Currency: </span><span className="text-zinc-200">{book.currency}</span></div>
          {editing ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">From:</span>
                <input type="date" value={editForm.validFrom} onChange={e => setEditForm(f => ({ ...f, validFrom: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-xs focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">To:</span>
                <input type="date" value={editForm.validTo} onChange={e => setEditForm(f => ({ ...f, validTo: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-xs focus:outline-none focus:border-blue-500" />
              </div>
            </>
          ) : (
            <>
              {book.validFrom && <div><span className="text-zinc-500">From: </span><span className="text-zinc-200">{new Date(book.validFrom).toLocaleDateString()}</span></div>}
              {book.validTo && <div><span className="text-zinc-500">To: </span><span className="text-zinc-200">{new Date(book.validTo).toLocaleDateString()}</span></div>}
            </>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <span className="font-semibold text-zinc-100">Entries <span className="text-zinc-500 text-sm font-normal">({book.entries.length})</span></span>
          <button onClick={() => setShowAddEntry(v => !v)} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>
        {showAddEntry && (
          <form onSubmit={handleAddEntry} className="p-4 border-b border-zinc-800 bg-zinc-800/30">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input value={entryForm.sku} onChange={e => setEntryForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              <input value={entryForm.productName} onChange={e => setEntryForm(f => ({ ...f, productName: e.target.value }))} placeholder="Product Name"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              <input value={entryForm.basePrice} onChange={e => setEntryForm(f => ({ ...f, basePrice: e.target.value }))} placeholder="Base Price *" required type="number" step="0.01" min="0"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              <input value={entryForm.salePrice} onChange={e => setEntryForm(f => ({ ...f, salePrice: e.target.value }))} placeholder="Sale Price" type="number" step="0.01" min="0"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              <div className="flex gap-2">
                <input value={entryForm.minQty} onChange={e => setEntryForm(f => ({ ...f, minQty: e.target.value }))} placeholder="Min Qty" type="number" min="1"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
                <button type="submit" disabled={savingEntry} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded-lg text-sm font-medium transition-colors">
                  {savingEntry ? '…' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        )}
        {book.entries.length === 0 ? (
          <div className="p-10 text-center text-zinc-500"><p className="text-sm">No entries yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Product Name</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-medium">Base Price</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-medium">Sale Price</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-medium">Min Qty</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {book.entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{entry.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-200">{entry.productName ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-zinc-200">${entry.basePrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{entry.salePrice != null ? <span className="text-emerald-400">${entry.salePrice.toFixed(2)}</span> : <span className="text-zinc-600">—</span>}</td>
                    <td className="px-4 py-3 text-center text-zinc-400">{entry.minQty}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteEntry(entry.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
