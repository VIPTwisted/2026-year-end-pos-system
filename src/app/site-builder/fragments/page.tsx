'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Puzzle, Trash2, Edit2, Loader2, X, Check } from 'lucide-react'

interface SiteFragment {
  id: string
  name: string
  slug: string
  description?: string | null
  moduleType: string
  config: string
  usageCount: number
  createdAt: string
}

const MODULE_TYPES = [
  'hero', 'text-block', 'product-grid', 'promo-banner', 'call-to-action',
  'image-gallery', 'video', 'carousel', 'nav-menu', 'footer', 'breadcrumb',
  'buy-box', 'ratings-reviews', 'related-products', 'recommended',
  'search-result', 'cart-icon', 'sign-in', 'iframe', 'form', 'spacer',
]

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface EditModalProps {
  fragment: SiteFragment
  onClose: () => void
  onSaved: (f: SiteFragment) => void
}

function EditModal({ fragment, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState({ name: fragment.name, description: fragment.description || '', moduleType: fragment.moduleType })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/site/fragments/${fragment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) { onSaved(data); onClose() }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-100">Edit Fragment</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Module Type</label>
            <select value={form.moduleType} onChange={e => setForm(p => ({ ...p, moduleType: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
              {MODULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FragmentsPage() {
  const [fragments, setFragments] = useState<SiteFragment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingFragment, setEditingFragment] = useState<SiteFragment | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', moduleType: 'hero' })
  const [slugManual, setSlugManual] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/site/fragments').then(r => r.json()).then(data => {
      setFragments(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function handleNameChange(name: string) {
    setForm(prev => ({ ...prev, name, slug: slugManual ? prev.slug : slugify(name) }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name required'); return }
    setCreating(true)
    const res = await fetch('/api/site/fragments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setCreating(false); return }
    setFragments(prev => [data, ...prev])
    setForm({ name: '', slug: '', description: '', moduleType: 'hero' })
    setSlugManual(false)
    setShowCreate(false)
    setCreating(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/site/fragments/${id}`, { method: 'DELETE' })
    setFragments(prev => prev.filter(f => f.id !== id))
  }

  return (
    <>
      <TopBar title="Fragments Library" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Reusable Fragments</h2>
            <p className="text-sm text-zinc-500">Shared modules that can be placed on multiple pages</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Fragment
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Create Fragment</h3>
              <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Name <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Global Header" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Slug</label>
                  <input value={form.slug} onChange={e => { setSlugManual(true); setForm(p => ({ ...p, slug: e.target.value })) }} placeholder="global-header" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Module Type</label>
                  <select value={form.moduleType} onChange={e => setForm(p => ({ ...p, moduleType: e.target.value }))} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {MODULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                  <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What this fragment is for" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                {error && <div className="col-span-2 text-sm text-red-400">{error}</div>}
                <div className="col-span-2 flex gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm">Cancel</button>
                  <button type="submit" disabled={creating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Fragment
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Fragment grid */}
        {loading && <p className="text-zinc-500 text-sm">Loading...</p>}
        {!loading && fragments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Puzzle className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No fragments yet.</p>
              <button onClick={() => setShowCreate(true)} className="mt-2 text-sm text-blue-400 hover:text-blue-300">Create your first fragment</button>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {fragments.map(f => (
            <Card key={f.id} className="border border-zinc-800">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                    <Puzzle className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingFragment(f)} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-0.5">{f.name}</h3>
                <p className="text-xs text-zinc-500 font-mono mb-2">/{f.slug}</p>
                {f.description && <p className="text-xs text-zinc-600 mb-3">{f.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{f.moduleType}</span>
                  <span className="text-xs text-zinc-600">{f.usageCount} use{f.usageCount !== 1 ? 's' : ''}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {editingFragment && (
        <EditModal
          fragment={editingFragment}
          onClose={() => setEditingFragment(null)}
          onSaved={updated => setFragments(prev => prev.map(f => f.id === updated.id ? updated : f))}
        />
      )}
    </>
  )
}
