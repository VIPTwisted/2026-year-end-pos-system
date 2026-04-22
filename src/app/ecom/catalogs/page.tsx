'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Plus, ExternalLink, Archive, Send } from 'lucide-react'

interface Catalog {
  id: string
  name: string
  channelName: string | null
  status: string
  publishedAt: string | null
  createdAt: string
  _count: { categories: number; products: number }
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  published: 'bg-emerald-500/20 text-emerald-400',
  archived: 'bg-zinc-800 text-zinc-500',
}

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', channelName: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await fetch('/api/ecom/catalogs').then(r => r.json())
    setCatalogs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createCatalog(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/ecom/catalogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', channelName: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function publish(id: string) {
    await fetch(`/api/ecom/catalogs/${id}/publish`, { method: 'POST' })
    load()
  }

  async function archive(id: string) {
    await fetch(`/api/ecom/catalogs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' }),
    })
    load()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Catalog Management</h1>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Catalog
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCatalog} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">New Catalog</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Catalog Name *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Spring 2026"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Channel Name</label>
              <input
                value={form.channelName}
                onChange={e => setForm(p => ({ ...p, channelName: e.target.value }))}
                placeholder="Online Store"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Catalog'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Channel</th>
              <th className="text-center px-4 py-3 text-zinc-400 font-medium">Categories</th>
              <th className="text-center px-4 py-3 text-zinc-400 font-medium">Products</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Published</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="text-center py-8 text-zinc-500">Loading...</td></tr>
            )}
            {!loading && catalogs.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-zinc-500">No catalogs yet</td></tr>
            )}
            {catalogs.map(c => (
              <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/ecom/catalogs/${c.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">{c.channelName ?? '—'}</td>
                <td className="px-4 py-3 text-center text-zinc-300">{c._count.categories}</td>
                <td className="px-4 py-3 text-center text-zinc-300">{c._count.products}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {c.publishedAt ? new Date(c.publishedAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/ecom/catalogs/${c.id}`} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    {c.status === 'draft' && (
                      <button onClick={() => publish(c.id)} className="p-1.5 hover:bg-zinc-700 rounded text-emerald-400 hover:text-emerald-300" title="Publish">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {c.status !== 'archived' && (
                      <button onClick={() => archive(c.id)} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-300" title="Archive">
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
