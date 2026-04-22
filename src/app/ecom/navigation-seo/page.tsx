'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, GripVertical, Trash2, Globe, Search, ChevronRight, ExternalLink, Save } from 'lucide-react'

interface SiteNavItem {
  id: string
  menuId: string
  label: string
  url: string
  position: number
  parentId: string | null
  openNew: boolean
}

interface SiteNavMenu {
  id: string
  name: string
  location: string
  isActive: boolean
  items: SiteNavItem[]
  createdAt: string
  updatedAt: string
}

interface SeoSettings {
  robotsTxt: string
  sitemapEnabled: boolean
  defaultMetaTitle: string
  defaultMetaDescription: string
  defaultOgImage: string
  canonicalDomain: string
}

const LOCATION_BADGE: Record<string, string> = {
  header: 'bg-blue-500/15 text-blue-300',
  footer: 'bg-zinc-700 text-zinc-300',
  sidebar: 'bg-violet-500/15 text-violet-300',
}

type Tab = 'navigation' | 'seo'

export default function NavigationSeoPage() {
  const [tab, setTab] = useState<Tab>('navigation')
  const [menus, setMenus] = useState<SiteNavMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [newItemUrl, setNewItemUrl] = useState('')
  const [newItemOpenNew, setNewItemOpenNew] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [seo, setSeo] = useState<SeoSettings>({
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapEnabled: true,
    defaultMetaTitle: '',
    defaultMetaDescription: '',
    defaultOgImage: '',
    canonicalDomain: '',
  })
  const [savingSeo, setSavingSeo] = useState(false)
  const [seoSaved, setSeoSaved] = useState(false)

  const loadMenus = () => {
    fetch('/api/site/nav-menus')
      .then(r => r.json())
      .then(d => {
        const arr = Array.isArray(d) ? d : []
        setMenus(arr)
        if (!activeMenuId && arr.length > 0) setActiveMenuId(arr[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMenus()
    // Load SEO settings
    fetch('/api/site/seo-settings').then(r => r.json()).then(d => {
      if (d && typeof d === 'object') setSeo(s => ({ ...s, ...d }))
    }).catch(() => {})
  }, [])

  const activeMenu = menus.find(m => m.id === activeMenuId)
  const items = (activeMenu?.items ?? []).slice().sort((a, b) => a.position - b.position)

  async function handleAddItem() {
    if (!newItemLabel.trim() || !newItemUrl.trim() || !activeMenuId) return
    setAddingItem(true)
    await fetch(`/api/site/nav-menus/${activeMenuId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newItemLabel.trim(), url: newItemUrl.trim(), openNew: newItemOpenNew, position: items.length }),
    }).catch(() => {})
    setNewItemLabel('')
    setNewItemUrl('')
    setNewItemOpenNew(false)
    setAddingItem(false)
    loadMenus()
  }

  async function handleDeleteItem(itemId: string) {
    if (!activeMenuId) return
    await fetch(`/api/site/nav-menus/${activeMenuId}/items/${itemId}`, { method: 'DELETE' }).catch(() => {})
    loadMenus()
  }

  async function handleSaveSeo() {
    setSavingSeo(true)
    await fetch('/api/site/seo-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seo),
    }).catch(() => {})
    setSavingSeo(false)
    setSeoSaved(true)
    setTimeout(() => setSeoSaved(false), 2500)
  }

  return (
    <>
      <TopBar title="Navigation & SEO" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-800/60 rounded-lg p-1 w-fit">
          {([['navigation', 'Navigation Menus'], ['seo', 'SEO Settings']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'navigation' && (
          <div className="flex gap-6">
            {/* Menu list */}
            <div className="w-60 shrink-0 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Menus</h2>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-zinc-800 animate-pulse" />)}</div>
              ) : menus.length === 0 ? (
                <p className="text-xs text-zinc-500">No nav menus found.</p>
              ) : (
                <div className="space-y-1.5">
                  {menus.map(m => (
                    <button key={m.id} onClick={() => setActiveMenuId(m.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${activeMenuId === m.id ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-zinc-100 truncate">{m.name}</span>
                        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded capitalize ${LOCATION_BADGE[m.location] ?? 'bg-zinc-700 text-zinc-300'}`}>{m.location}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">{m.items.length} items</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Menu editor */}
            <div className="flex-1 space-y-4">
              {activeMenu ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-100">{activeMenu.name}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">Location: {activeMenu.location} · {items.length} items</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeMenu.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-700 text-zinc-400'}`}>
                      {activeMenu.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <Card>
                    <CardContent className="pt-0 pb-0 px-0">
                      {items.length === 0 ? (
                        <div className="px-6 py-8 text-center text-zinc-500 text-sm">No items. Add your first navigation link below.</div>
                      ) : (
                        <div className="divide-y divide-zinc-800">
                          {items.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                              <GripVertical className="w-4 h-4 text-zinc-700 cursor-grab shrink-0" />
                              <span className="w-5 text-center text-xs text-zinc-600 font-mono">{idx + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-zinc-100">{item.label}</span>
                                  {item.openNew && <ExternalLink className="w-3 h-3 text-zinc-600" />}
                                </div>
                                <span className="text-xs font-mono text-zinc-500">{item.url}</span>
                              </div>
                              {item.parentId && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                              <button onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded hover:bg-zinc-700 text-zinc-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Add item form */}
                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Add Navigation Item</p>
                      <div className="flex gap-2 flex-wrap">
                        <input value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} placeholder="Label (e.g. Shop)"
                          className="flex-1 min-w-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <input value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder="URL (e.g. /shop)"
                          className="flex-1 min-w-40 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
                        <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                          <input type="checkbox" checked={newItemOpenNew} onChange={e => setNewItemOpenNew(e.target.checked)} className="accent-blue-500" />
                          New tab
                        </label>
                        <button onClick={handleAddItem} disabled={addingItem || !newItemLabel.trim() || !newItemUrl.trim()}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                          <Plus className="w-3.5 h-3.5" />{addingItem ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Globe className="w-10 h-10 text-zinc-700 mb-3" />
                  <p className="text-zinc-500 text-sm">Select a menu to edit</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="max-w-2xl space-y-5">
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">Site-Wide SEO Defaults</h2>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Canonical Domain</label>
                  <input value={seo.canonicalDomain} onChange={e => setSeo(s => ({ ...s, canonicalDomain: e.target.value }))}
                    placeholder="https://yourstore.com"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Default Meta Title</label>
                  <input value={seo.defaultMetaTitle} onChange={e => setSeo(s => ({ ...s, defaultMetaTitle: e.target.value }))}
                    placeholder="My Store — Best Products Online"
                    maxLength={70}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <p className="text-xs text-zinc-600 mt-1">{seo.defaultMetaTitle.length}/70</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Default Meta Description</label>
                  <textarea value={seo.defaultMetaDescription} onChange={e => setSeo(s => ({ ...s, defaultMetaDescription: e.target.value }))}
                    placeholder="Shop the best products..."
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                  <p className="text-xs text-zinc-600 mt-1">{seo.defaultMetaDescription.length}/160</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Default OG Image URL</label>
                  <input value={seo.defaultOgImage} onChange={e => setSeo(s => ({ ...s, defaultOgImage: e.target.value }))}
                    placeholder="https://yourstore.com/og-image.jpg"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">Crawlers & Sitemap</h2>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-200">XML Sitemap</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Auto-generates /sitemap.xml for search engines</p>
                  </div>
                  <button onClick={() => setSeo(s => ({ ...s, sitemapEnabled: !s.sitemapEnabled }))}
                    className={`relative w-10 h-6 rounded-full transition-colors ${seo.sitemapEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${seo.sitemapEnabled ? 'left-4.5' : 'left-0.5'}`}
                      style={{ left: seo.sitemapEnabled ? '1.125rem' : '0.125rem' }} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">robots.txt</label>
                  <textarea value={seo.robotsTxt} onChange={e => setSeo(s => ({ ...s, robotsTxt: e.target.value }))}
                    rows={5}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono text-xs" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <button onClick={handleSaveSeo} disabled={savingSeo}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${seoSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                <Save className="w-4 h-4" />
                {seoSaved ? 'Saved!' : savingSeo ? 'Saving...' : 'Save SEO Settings'}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
