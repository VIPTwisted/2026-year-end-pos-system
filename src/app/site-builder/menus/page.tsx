'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Plus, Menu, Trash2, ChevronDown, ChevronUp,
  ExternalLink, Loader2, X, GripVertical,
} from 'lucide-react'

interface SiteNavItem {
  id: string
  menuId: string
  label: string
  url: string
  position: number
  parentId?: string | null
  openNew: boolean
}

interface SiteNavMenu {
  id: string
  name: string
  location: string
  isActive: boolean
  items: SiteNavItem[]
  _count?: { items: number }
  createdAt: string
}

const LOCATIONS = ['header', 'footer', 'sidebar']

export default function MenusPage() {
  const [menus, setMenus] = useState<SiteNavMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const [menuDetail, setMenuDetail] = useState<SiteNavMenu | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [savingItems, setSavingItems] = useState(false)
  const [form, setForm] = useState({ name: '', location: 'header' })
  const [newItem, setNewItem] = useState({ label: '', url: '', openNew: false })
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/site/menus').then(r => r.json()).then(data => {
      setMenus(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function loadMenuDetail(id: string) {
    if (expandedMenu === id) { setExpandedMenu(null); setMenuDetail(null); return }
    setExpandedMenu(id)
    const res = await fetch(`/api/site/menus/${id}`)
    const data = await res.json()
    setMenuDetail(data)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name required'); return }
    setCreating(true)
    const res = await fetch('/api/site/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setCreating(false); return }
    setMenus(prev => [{ ...data, items: [], _count: { items: 0 } }, ...prev])
    setForm({ name: '', location: 'header' })
    setShowCreate(false)
    setCreating(false)
  }

  async function handleDeleteMenu(id: string) {
    await fetch(`/api/site/menus/${id}`, { method: 'DELETE' })
    setMenus(prev => prev.filter(m => m.id !== id))
    if (expandedMenu === id) { setExpandedMenu(null); setMenuDetail(null) }
  }

  async function handleAddItem() {
    if (!menuDetail || !newItem.label.trim() || !newItem.url.trim()) return
    const items = [...(menuDetail.items || []), {
      label: newItem.label,
      url: newItem.url,
      position: menuDetail.items.length,
      openNew: newItem.openNew,
    }]
    setSavingItems(true)
    const res = await fetch(`/api/site/menus/${menuDetail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const data = await res.json()
    if (res.ok) {
      setMenuDetail(data)
      setMenus(prev => prev.map(m => m.id === data.id ? { ...m, _count: { items: data.items.length } } : m))
    }
    setNewItem({ label: '', url: '', openNew: false })
    setSavingItems(false)
  }

  async function handleRemoveItem(itemIdx: number) {
    if (!menuDetail) return
    const items = menuDetail.items.filter((_, i) => i !== itemIdx).map((item, i) => ({ ...item, position: i }))
    setSavingItems(true)
    const res = await fetch(`/api/site/menus/${menuDetail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const data = await res.json()
    if (res.ok) {
      setMenuDetail(data)
      setMenus(prev => prev.map(m => m.id === data.id ? { ...m, _count: { items: data.items.length } } : m))
    }
    setSavingItems(false)
  }

  async function moveItem(idx: number, dir: 'up' | 'down') {
    if (!menuDetail) return
    const items = [...menuDetail.items].sort((a, b) => a.position - b.position)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= items.length) return
    const tmp = items[idx]
    items[idx] = items[swapIdx]
    items[swapIdx] = tmp
    const reindexed = items.map((item, i) => ({ ...item, position: i }))
    setSavingItems(true)
    const res = await fetch(`/api/site/menus/${menuDetail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: reindexed }),
    })
    const data = await res.json()
    if (res.ok) setMenuDetail(data)
    setSavingItems(false)
  }

  const locationBadge = (loc: string) => {
    if (loc === 'header') return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    if (loc === 'footer') return 'bg-zinc-700 text-zinc-300'
    return 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
  }

  const byLocation = LOCATIONS.map(loc => ({
    loc,
    menus: menus.filter(m => m.location === loc),
  })).filter(g => g.menus.length > 0)

  return (
    <>
      <TopBar title="Navigation Menus" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Navigation Menus</h2>
            <p className="text-sm text-zinc-500">Manage header, footer, and sidebar menus</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Menu
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Create Menu</h3>
              <form onSubmit={handleCreate} className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Menu Name <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Main Header Nav" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="w-40">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Location</label>
                  <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {LOCATIONS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </select>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm">Cancel</button>
                  <button type="submit" disabled={creating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && <p className="text-zinc-500 text-sm">Loading...</p>}

        {/* Menus by location */}
        {!loading && menus.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Menu className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No menus created yet.</p>
              <button onClick={() => setShowCreate(true)} className="mt-2 text-sm text-blue-400 hover:text-blue-300">Create your first menu</button>
            </CardContent>
          </Card>
        )}

        {byLocation.map(({ loc, menus: locMenus }) => (
          <div key={loc}>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3 capitalize">{loc} Menus</h3>
            <div className="space-y-3">
              {locMenus.map(menu => (
                <Card key={menu.id} className="border-zinc-800">
                  <CardContent className="pt-4 pb-4">
                    {/* Menu header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg">
                          <Menu className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-100">{menu.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${locationBadge(menu.location)}`}>{menu.location}</span>
                            {!menu.isActive && <span className="text-xs text-zinc-600">Inactive</span>}
                          </div>
                          <p className="text-xs text-zinc-600 mt-0.5">{menu._count?.items ?? menu.items?.length ?? 0} item{(menu._count?.items ?? 0) !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => loadMenuDetail(menu.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-zinc-100 border border-zinc-700 hover:border-zinc-600 rounded-lg text-xs transition-colors">
                          {expandedMenu === menu.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {expandedMenu === menu.id ? 'Collapse' : 'Edit Items'}
                        </button>
                        <button onClick={() => handleDeleteMenu(menu.id)} className="p-1.5 rounded hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded items editor */}
                    {expandedMenu === menu.id && menuDetail?.id === menu.id && (
                      <div className="mt-4 border-t border-zinc-800 pt-4 space-y-3">
                        {/* Item list */}
                        {menuDetail.items.length === 0 && (
                          <p className="text-xs text-zinc-600">No items yet. Add one below.</p>
                        )}
                        {[...menuDetail.items].sort((a, b) => a.position - b.position).map((item, idx) => (
                          <div key={item.id} className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-2">
                            <GripVertical className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-zinc-200 font-medium">{item.label}</p>
                              <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                                {item.url} {item.openNew && <ExternalLink className="w-3 h-3" />}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0 || savingItems} className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 disabled:opacity-20">
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button onClick={() => moveItem(idx, 'down')} disabled={idx === menuDetail.items.length - 1 || savingItems} className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 disabled:opacity-20">
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleRemoveItem(idx)} disabled={savingItems} className="p-1 rounded hover:bg-red-900/40 text-zinc-500 hover:text-red-400">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add item form */}
                        <div className="flex items-end gap-3 border border-dashed border-zinc-700 rounded-lg p-3">
                          <div className="flex-1">
                            <label className="block text-xs text-zinc-500 mb-1">Label</label>
                            <input
                              value={newItem.label}
                              onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))}
                              placeholder="e.g. Products"
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-zinc-500 mb-1">URL</label>
                            <input
                              value={newItem.url}
                              onChange={e => setNewItem(p => ({ ...p, url: e.target.value }))}
                              placeholder="/products"
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-2 pb-0.5">
                            <button
                              type="button"
                              onClick={() => setNewItem(p => ({ ...p, openNew: !p.openNew }))}
                              className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors ${newItem.openNew ? 'bg-blue-600' : 'bg-zinc-700'}`}
                            >
                              <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${newItem.openNew ? 'translate-x-3' : 'translate-x-0'}`} />
                            </button>
                            <span className="text-xs text-zinc-500">New tab</span>
                          </div>
                          <button
                            onClick={handleAddItem}
                            disabled={savingItems || !newItem.label.trim() || !newItem.url.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium disabled:opacity-50 transition-colors"
                          >
                            {savingItems ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  )
}
