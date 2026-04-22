'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, ChevronDown, FolderOpen, Folder, Plus, RefreshCw, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  color: string | null
  icon: string | null
  sortOrder: number
  isActive: boolean
  _count: { products: number }
  children: Category[]
}

function CategoryNode({
  cat, depth, onAddChild
}: {
  cat: Category
  depth: number
  onAddChild: (parentId: string, parentName: string) => void
}) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = cat.children.length > 0

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors group cursor-pointer`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => setExpanded(v => !v)}
      >
        {hasChildren ? (
          expanded
            ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            : <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        ) : (
          <span className="w-3.5 h-3.5 shrink-0" />
        )}
        {hasChildren ? (
          <FolderOpen className="w-4 h-4 shrink-0 text-amber-400" />
        ) : (
          <Folder className="w-4 h-4 shrink-0 text-zinc-600" />
        )}
        <span className={`text-sm flex-1 ${cat.isActive ? 'text-zinc-200' : 'text-zinc-600 line-through'}`}>
          {cat.name}
        </span>
        {cat.color && (
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
        )}
        <span className="text-xs text-zinc-600 tabular-nums shrink-0">{cat._count.products} items</span>
        <button
          onClick={ev => { ev.stopPropagation(); onAddChild(cat.id, cat.name) }}
          className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-indigo-500/20 text-indigo-400 transition-all"
          title="Add subcategory"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      {expanded && hasChildren && (
        <div>
          {cat.children.map(child => (
            <CategoryNode key={child.id} cat={child} depth={depth + 1} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HierarchyPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [parentName, setParentName] = useState('')
  const [form, setForm] = useState({ name: '', slug: '', color: '#6366f1' })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/hierarchy')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openAddChild(pid: string, pName: string) {
    setParentId(pid)
    setParentName(pName)
    setForm({ name: '', slug: '', color: '#6366f1' })
    setShowForm(true)
  }

  function openAddRoot() {
    setParentId(null)
    setParentName('')
    setForm({ name: '', slug: '', color: '#6366f1' })
    setShowForm(true)
  }

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/hierarchy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || autoSlug(form.name),
          parentId: parentId || undefined,
          color: form.color,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create'); return }
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const totalCategories = (cats: Category[]): number =>
    cats.reduce((s, c) => s + 1 + totalCategories(c.children), 0)

  return (
    <>
      <TopBar title="Product Hierarchy" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Product Hierarchy</h1>
            <p className="text-sm text-zinc-500">{totalCategories(categories)} categories in tree</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openAddRoot}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Root Category
            </button>
          </div>
        </div>

        {showForm && (
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                {parentId ? `New subcategory under "${parentName}"` : 'New Root Category'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Category Name *</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Apparel" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                    required autoFocus />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Slug</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-400 font-mono focus:outline-none focus:border-indigo-500"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" className="w-10 h-9 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
                      value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                    <span className="text-xs font-mono text-zinc-500">{form.color}</span>
                  </div>
                </div>
                {error && <p className="col-span-3 text-xs text-rose-400">{error}</p>}
                <div className="col-span-3 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    {saving ? 'Saving…' : 'Create Category'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="py-0 px-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-zinc-600">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading hierarchy…
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                <Tag className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No product categories yet.</p>
                <button onClick={openAddRoot} className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">
                  Create your first category
                </button>
              </div>
            ) : (
              <div className="py-2">
                {categories.map(cat => (
                  <CategoryNode key={cat.id} cat={cat} depth={0} onAddChild={openAddChild} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
