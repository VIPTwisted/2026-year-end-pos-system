'use client'
import { useEffect, useState } from 'react'
import { Image, Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface Banner {
  id: string; name: string; placement: string; imageUrl: string | null
  linkUrl: string | null; title: string | null; subtitle: string | null
  ctaText: string | null; startDate: string | null; endDate: string | null
  position: number; isActive: boolean; channelName: string | null; createdAt: string
}

const PLACEMENTS = [
  { key: 'homepage-hero', label: 'Homepage Hero' },
  { key: 'homepage-secondary', label: 'Homepage Secondary' },
  { key: 'category-top', label: 'Category Top' },
  { key: 'checkout-top', label: 'Checkout Top' },
  { key: 'sidebar', label: 'Sidebar' },
]

interface FormState {
  name: string; placement: string; imageUrl: string; linkUrl: string
  title: string; subtitle: string; ctaText: string; startDate: string; endDate: string; channelName: string
}

const BLANK_FORM: FormState = {
  name: '', placement: 'homepage-hero', imageUrl: '', linkUrl: '',
  title: '', subtitle: '', ctaText: '', startDate: '', endDate: '', channelName: '',
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(BLANK_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await fetch('/api/ecom/banners').then(r => r.json())
    setBanners(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      imageUrl: form.imageUrl || null,
      linkUrl: form.linkUrl || null,
      title: form.title || null,
      subtitle: form.subtitle || null,
      ctaText: form.ctaText || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      channelName: form.channelName || null,
    }
    if (editId) {
      await fetch(`/api/ecom/banners/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/ecom/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    setForm(BLANK_FORM)
    setShowForm(false)
    setEditId(null)
    setSaving(false)
    load()
  }

  function startEdit(b: Banner) {
    setForm({
      name: b.name, placement: b.placement, imageUrl: b.imageUrl ?? '',
      linkUrl: b.linkUrl ?? '', title: b.title ?? '', subtitle: b.subtitle ?? '',
      ctaText: b.ctaText ?? '', channelName: b.channelName ?? '',
      startDate: b.startDate ? b.startDate.slice(0, 10) : '',
      endDate: b.endDate ? b.endDate.slice(0, 10) : '',
    })
    setEditId(b.id)
    setShowForm(true)
  }

  async function toggleActive(b: Banner) {
    await fetch(`/api/ecom/banners/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !b.isActive }),
    })
    load()
  }

  async function deleteBanner(id: string) {
    if (!confirm('Delete this banner?')) return
    await fetch(`/api/ecom/banners/${id}`, { method: 'DELETE' })
    load()
  }

  const grouped = PLACEMENTS.map(p => ({
    ...p,
    banners: banners.filter(b => b.placement === p.key),
  }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Banners & Promotions</h1>
        </div>
        <button onClick={() => { setForm(BLANK_FORM); setEditId(null); setShowForm(v => !v) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">{editId ? 'Edit Banner' : 'New Banner'}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Placement</label>
              <select value={form.placement} onChange={e => setForm(p => ({ ...p, placement: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                {PLACEMENTS.map(pl => <option key={pl.key} value={pl.key}>{pl.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Channel Name</label>
              <input value={form.channelName} onChange={e => setForm(p => ({ ...p, channelName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Image URL</label>
              <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Link URL</label>
              <input value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">CTA Text</label>
              <input value={form.ctaText} onChange={e => setForm(p => ({ ...p, ctaText: e.target.value }))} placeholder="Shop Now"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : editId ? 'Update Banner' : 'Create Banner'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK_FORM) }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {loading && <div className="text-center py-8 text-zinc-500">Loading...</div>}

      {!loading && grouped.map(group => (
        <div key={group.key} className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            {group.label}
            <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{group.banners.length}</span>
          </h2>
          {group.banners.length === 0 && (
            <div className="rounded-xl border border-zinc-800/50 border-dashed bg-zinc-900/40 py-6 text-center text-sm text-zinc-600">
              No banners in this placement
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {group.banners.map(b => (
              <div key={b.id} className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.name} className="w-full h-32 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="w-full h-32 bg-zinc-800 flex items-center justify-center">
                    <Image className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{b.name}</p>
                      {b.title && <p className="text-xs text-zinc-400 truncate">{b.title}</p>}
                      {b.ctaText && <p className="text-xs text-blue-400">{b.ctaText}</p>}
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${b.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {b.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {(b.startDate || b.endDate) && (
                    <p className="text-xs text-zinc-500 mb-2">
                      {b.startDate ? new Date(b.startDate).toLocaleDateString() : '...'} –{' '}
                      {b.endDate ? new Date(b.endDate).toLocaleDateString() : 'ongoing'}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(b)} className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${b.isActive ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800' : 'border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20'}`}>
                      {b.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => startEdit(b)} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteBanner(b.id)} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
