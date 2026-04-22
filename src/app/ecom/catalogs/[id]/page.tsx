'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, Trash2, ChevronRight } from 'lucide-react'

interface Category {
  id: string; name: string; slug: string; description: string | null
  parentId: string | null; imageUrl: string | null; position: number; isActive: boolean; productCount: number
}
interface Product {
  id: string; name: string; slug: string; sku: string | null; price: number; status: string; isFeatured: boolean
}
interface Catalog {
  id: string; name: string; channelName: string | null; status: string; publishedAt: string | null
  categories: Category[]; products: Product[]
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  published: 'bg-emerald-500/20 text-emerald-400',
  archived: 'bg-zinc-800 text-zinc-500',
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function CatalogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [tab, setTab] = useState<'categories' | 'products'>('categories')
  const [loading, setLoading] = useState(true)
  const [showCatForm, setShowCatForm] = useState(false)
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', parentId: '', imageUrl: '', position: '0' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await fetch(`/api/ecom/catalogs/${id}`).then(r => r.json())
    setCatalog(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function publish() {
    await fetch(`/api/ecom/catalogs/${id}/publish`, { method: 'POST' })
    load()
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/ecom/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogId: id,
        name: catForm.name,
        slug: catForm.slug || slugify(catForm.name),
        description: catForm.description || null,
        parentId: catForm.parentId || null,
        imageUrl: catForm.imageUrl || null,
        position: parseInt(catForm.position) || 0,
      }),
    })
    setCatForm({ name: '', slug: '', description: '', parentId: '', imageUrl: '', position: '0' })
    setShowCatForm(false)
    setSaving(false)
    load()
  }

  async function deleteCategory(cid: string) {
    if (!confirm('Delete this category?')) return
    await fetch(`/api/ecom/categories/${cid}`, { method: 'DELETE' })
    load()
  }

  if (loading || !catalog) {
    return <div className="p-6 text-zinc-400">Loading...</div>
  }

  const roots = catalog.categories.filter(c => !c.parentId)
  const children = (parentId: string) => catalog.categories.filter(c => c.parentId === parentId)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ecom/catalogs" className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-100">{catalog.name}</h1>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[catalog.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
              {catalog.status}
            </span>
            {catalog.channelName && <span className="text-xs text-zinc-500">{catalog.channelName}</span>}
          </div>
          {catalog.publishedAt && (
            <p className="text-xs text-zinc-500 mt-0.5">Published {new Date(catalog.publishedAt).toLocaleDateString()}</p>
          )}
        </div>
        {catalog.status === 'draft' && (
          <button onClick={publish} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg">
            <Send className="w-4 h-4" /> Publish
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {(['categories', 'products'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {t} {t === 'categories' ? `(${catalog.categories.length})` : `(${catalog.products.length})`}
          </button>
        ))}
      </div>

      {tab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowCatForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={addCategory} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300">New Category</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Name *</label>
                  <input required value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Slug</label>
                  <input value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Parent Category</label>
                  <select value={catForm.parentId} onChange={e => setCatForm(p => ({ ...p, parentId: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option value="">— None (root) —</option>
                    {catalog.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Description</label>
                  <input value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Position</label>
                  <input type="number" value={catForm.position} onChange={e => setCatForm(p => ({ ...p, position: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-zinc-400 mb-1">Image URL</label>
                  <input value={catForm.imageUrl} onChange={e => setCatForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Category'}
                </button>
                <button type="button" onClick={() => setShowCatForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg">Cancel</button>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
            {catalog.categories.length === 0 && (
              <div className="py-8 text-center text-zinc-500 text-sm">No categories yet</div>
            )}
            {roots.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40">
                  <span className="text-zinc-100 font-medium text-sm">{cat.name}</span>
                  <span className="text-xs text-zinc-500">/{cat.slug}</span>
                  {!cat.isActive && <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 rounded">Inactive</span>}
                  <span className="text-xs text-zinc-500 ml-auto">{cat.productCount} products</span>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {children(cat.id).map(child => (
                  <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 pl-10 bg-zinc-950/30 hover:bg-zinc-800/30 border-t border-zinc-800/50">
                    <ChevronRight className="w-3 h-3 text-zinc-600" />
                    <span className="text-zinc-300 text-sm">{child.name}</span>
                    <span className="text-xs text-zinc-600">/{child.slug}</span>
                    <span className="text-xs text-zinc-500 ml-auto">{child.productCount} products</span>
                    <button onClick={() => deleteCategory(child.id)} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          <div className="text-sm text-zinc-400">{catalog.products.length} products in this catalog</div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {catalog.products.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-zinc-500">No products in this catalog</td></tr>
                )}
                {catalog.products.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <Link href={`/ecom/products/${p.id}`} className="text-blue-400 hover:text-blue-300">{p.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{p.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
