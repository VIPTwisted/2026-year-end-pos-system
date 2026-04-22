'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Plus, X, Globe, Archive, FileText } from 'lucide-react'

interface Catalog {
  id: string
  name: string
  channelName: string | null
  status: string
  publishedAt: string | null
  createdAt: string
  _count?: { products: number; categories: number }
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const STATUS_ICONS: Record<string, typeof FileText> = {
  draft: FileText,
  published: Globe,
  archived: Archive,
}

export default function CatalogPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', channelName: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/catalog')
      .then(r => r.json())
      .then(d => { setCatalogs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function create() {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const c = await res.json()
      setCatalogs(prev => [{ ...c, _count: { products: 0, categories: 0 } }, ...prev])
      setShowModal(false)
      setForm({ name: '', channelName: '' })
    }
    setSaving(false)
  }

  async function publish(id: string) {
    const res = await fetch(`/api/catalog/${id}/publish`, { method: 'POST' })
    if (res.ok) {
      const updated = await res.json()
      setCatalogs(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    }
  }

  const published = catalogs.filter(c => c.status === 'published').length
  const draft = catalogs.filter(c => c.status === 'draft').length
  const totalProducts = catalogs.reduce((s, c) => s + (c._count?.products ?? 0), 0)

  return (
    <main className="flex-1 p-6 bg-[#0f0f1a] overflow-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Catalog Management</h1>
          <p className="text-xs text-zinc-500 mt-0.5">D365 Commerce — product catalog publishing workflow</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
        >
          <Plus className="w-3 h-3" /> New Catalog
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Published Catalogs', value: published, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Draft Catalogs', value: draft, color: 'text-zinc-400', bg: 'bg-zinc-800' },
          { label: 'Total Products', value: totalProducts, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} border border-zinc-800 rounded-xl p-4`}>
            <div className="text-xs text-zinc-500 mb-2">{k.label}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{loading ? '—' : k.value}</div>
          </div>
        ))}
      </div>

      {/* Catalog grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-xl h-40" />
          ))
        ) : catalogs.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-zinc-600">
            <BookOpen className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">No catalogs yet. Create your first catalog.</p>
          </div>
        ) : catalogs.map(cat => {
          const StatusIcon = STATUS_ICONS[cat.status] ?? FileText
          return (
            <div key={cat.id} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  <Link href={`/catalog/${cat.id}`} className="text-sm font-semibold text-zinc-100 hover:text-blue-400 transition-colors">
                    {cat.name}
                  </Link>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[cat.status] ?? STATUS_STYLES.draft}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cat.status}
                </span>
              </div>

              <div className="space-y-1 text-xs mb-4">
                {cat.channelName && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Channel</span>
                    <span className="text-zinc-400">{cat.channelName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-600">Products</span>
                  <span className="text-zinc-400">{cat._count?.products ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Categories</span>
                  <span className="text-zinc-400">{cat._count?.categories ?? 0}</span>
                </div>
                {cat.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Published</span>
                    <span className="text-zinc-400">{new Date(cat.publishedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/catalog/${cat.id}`}
                  className="flex-1 py-1.5 text-center text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 rounded transition-colors"
                >
                  Manage
                </Link>
                {cat.status === 'draft' && (
                  <button
                    onClick={() => publish(cat.id)}
                    className="flex-1 py-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 rounded transition-colors"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[420px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-zinc-100">New Catalog</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-zinc-500 hover:text-zinc-300" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Catalog Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Fall 2026 Collection"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Channel (optional)</label>
                <input
                  value={form.channelName}
                  onChange={e => setForm(p => ({ ...p, channelName: e.target.value }))}
                  placeholder="e.g. Online Store"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors"
              >
                {saving ? 'Creating...' : 'Create Catalog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
