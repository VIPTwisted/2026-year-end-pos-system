'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Package, Plus, Star, Send, Trash2, Search } from 'lucide-react'

interface Product {
  id: string; name: string; sku: string | null; categoryName: string | null
  price: number; salePrice: number | null; status: string; isFeatured: boolean
  _count: { ratings: number }
}

const TABS = ['all', 'draft', 'active', 'inactive', 'featured'] as const
type Tab = typeof TABS[number]

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  active: 'bg-emerald-500/20 text-emerald-400',
  inactive: 'bg-amber-500/20 text-amber-400',
  archived: 'bg-zinc-800 text-zinc-500',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', sku: '', price: '', categoryName: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab === 'featured') params.set('isFeatured', 'true')
    else if (tab !== 'all') params.set('status', tab)
    if (search) params.set('search', search)
    const data = await fetch(`/api/ecom/products?${params}`).then(r => r.json())
    setProducts(Array.isArray(data) ? data : [])
    setSelected(new Set())
    setLoading(false)
  }, [tab, search])

  useEffect(() => { load() }, [load])

  async function createProduct(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await fetch('/api/ecom/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug, price: parseFloat(form.price) || 0 }),
    })
    setForm({ name: '', slug: '', sku: '', price: '', categoryName: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function toggleFeatured(id: string, current: boolean) {
    await fetch(`/api/ecom/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !current }),
    })
    load()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/ecom/products/${id}`, { method: 'DELETE' })
    load()
  }

  async function bulkPublish() {
    await Promise.all([...selected].map(id =>
      fetch(`/api/ecom/products/${id}/publish`, { method: 'POST' })
    ))
    load()
  }

  async function bulkFeature() {
    await Promise.all([...selected].map(id =>
      fetch(`/api/ecom/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: true }),
      })
    ))
    load()
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Product Enrichment</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProduct} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">New Product</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">SKU</label>
              <input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Price</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Category</label>
              <input value={form.categoryName} onChange={e => setForm(p => ({ ...p, categoryName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Product'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-4">
        <div className="flex gap-1 border-b border-zinc-800 flex-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500 w-56" />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-lg">
          <span className="text-sm text-blue-400">{selected.size} selected</span>
          <button onClick={bulkPublish} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg flex items-center gap-1">
            <Send className="w-3 h-3" /> Publish All
          </button>
          <button onClick={bulkFeature} className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-lg flex items-center gap-1">
            <Star className="w-3 h-3" /> Feature All
          </button>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={selected.size === products.length && products.length > 0}
                  onChange={e => setSelected(e.target.checked ? new Set(products.map(p => p.id)) : new Set())}
                  className="rounded border-zinc-600" />
              </th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">SKU</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Category</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-medium">Price</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-medium">Sale</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
              <th className="text-center px-4 py-3 text-zinc-400 font-medium">Featured</th>
              <th className="text-center px-4 py-3 text-zinc-400 font-medium">Reviews</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10} className="text-center py-8 text-zinc-500">Loading...</td></tr>}
            {!loading && products.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-zinc-500">No products found</td></tr>}
            {products.map(p => (
              <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-zinc-600" />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/ecom/products/${p.id}`} className="text-blue-400 hover:text-blue-300 font-medium">{p.name}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">{p.sku ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{p.categoryName ?? '—'}</td>
                <td className="px-4 py-3 text-right text-zinc-300">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-emerald-400">{p.salePrice ? `$${p.salePrice.toFixed(2)}` : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleFeatured(p.id, p.isFeatured)} className={`p-1 rounded transition-colors ${p.isFeatured ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Star className="w-4 h-4" fill={p.isFeatured ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center text-zinc-400">{p._count.ratings}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteProduct(p.id)} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
