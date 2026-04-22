'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Eye, Upload, LogIn, Plus, Trash2,
  GripVertical, EyeOff, ChevronUp, ChevronDown,
  X, Loader2, CheckCircle,
  Image, Type, Grid, Megaphone, Zap, Video,
  AlignJustify, Navigation, Footprints, Link2, ShoppingCart,
  Star, Search, User, Code, FileText, Minus,
  AlignLeft, Layers,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SitePageModule {
  id: string
  pageId: string
  moduleType: string
  name: string
  position: number
  parentId?: string | null
  config: string
  hidden: boolean
}

interface SitePage {
  id: string
  name: string
  slug: string
  status: string
  checkedOutBy?: string | null
  pageType: string
}

interface SiteNavMenu {
  id: string
  name: string
  location: string
}

// ─── Module registry ─────────────────────────────────────────────────────────

const MODULE_TYPES: { type: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { type: 'hero', label: 'Hero Banner', icon: Image, color: 'bg-violet-500/20 border-violet-500/30' },
  { type: 'text-block', label: 'Text Block', icon: Type, color: 'bg-blue-500/20 border-blue-500/30' },
  { type: 'product-grid', label: 'Product Grid', icon: Grid, color: 'bg-emerald-500/20 border-emerald-500/30' },
  { type: 'promo-banner', label: 'Promo Banner', icon: Megaphone, color: 'bg-pink-500/20 border-pink-500/30' },
  { type: 'call-to-action', label: 'Call to Action', icon: Zap, color: 'bg-amber-500/20 border-amber-500/30' },
  { type: 'image-gallery', label: 'Image Gallery', icon: Layers, color: 'bg-cyan-500/20 border-cyan-500/30' },
  { type: 'video', label: 'Video', icon: Video, color: 'bg-red-500/20 border-red-500/30' },
  { type: 'carousel', label: 'Carousel', icon: AlignJustify, color: 'bg-indigo-500/20 border-indigo-500/30' },
  { type: 'nav-menu', label: 'Nav Menu', icon: Navigation, color: 'bg-teal-500/20 border-teal-500/30' },
  { type: 'footer', label: 'Footer', icon: Footprints, color: 'bg-zinc-500/20 border-zinc-500/30' },
  { type: 'breadcrumb', label: 'Breadcrumb', icon: Link2, color: 'bg-orange-500/20 border-orange-500/30' },
  { type: 'buy-box', label: 'Buy Box', icon: ShoppingCart, color: 'bg-lime-500/20 border-lime-500/30' },
  { type: 'ratings-reviews', label: 'Ratings & Reviews', icon: Star, color: 'bg-yellow-500/20 border-yellow-500/30' },
  { type: 'related-products', label: 'Related Products', icon: Grid, color: 'bg-fuchsia-500/20 border-fuchsia-500/30' },
  { type: 'recommended', label: 'Recommended', icon: Star, color: 'bg-sky-500/20 border-sky-500/30' },
  { type: 'search-result', label: 'Search Results', icon: Search, color: 'bg-emerald-500/20 border-emerald-500/30' },
  { type: 'cart-icon', label: 'Cart Icon', icon: ShoppingCart, color: 'bg-orange-500/20 border-orange-500/30' },
  { type: 'sign-in', label: 'Sign In', icon: User, color: 'bg-blue-500/20 border-blue-500/30' },
  { type: 'iframe', label: 'iFrame', icon: Code, color: 'bg-zinc-500/20 border-zinc-500/30' },
  { type: 'form', label: 'Form', icon: FileText, color: 'bg-rose-500/20 border-rose-500/30' },
  { type: 'spacer', label: 'Spacer', icon: Minus, color: 'bg-zinc-700/30 border-zinc-600/30' },
]

function getModuleMeta(type: string) {
  return MODULE_TYPES.find(m => m.type === type) ?? { type, label: type, icon: AlignLeft, color: 'bg-zinc-700/30 border-zinc-600/30' }
}

// ─── Config field definitions ─────────────────────────────────────────────────

type FieldDef = { key: string; label: string; type: 'text' | 'textarea' | 'select' | 'boolean' | 'color' | 'number'; options?: { value: string; label: string }[] }

function getFields(moduleType: string, menus: SiteNavMenu[]): FieldDef[] {
  switch (moduleType) {
    case 'hero': return [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'text' },
      { key: 'imageUrl', label: 'Image URL', type: 'text' },
      { key: 'ctaText', label: 'CTA Button Text', type: 'text' },
      { key: 'ctaUrl', label: 'CTA URL', type: 'text' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color' },
    ]
    case 'text-block': return [
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'alignment', label: 'Alignment', type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }] },
    ]
    case 'product-grid': return [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'columns', label: 'Columns', type: 'select', options: [{ value: '2', label: '2 Columns' }, { value: '3', label: '3 Columns' }, { value: '4', label: '4 Columns' }] },
      { key: 'productCount', label: 'Product Count', type: 'number' },
      { key: 'categoryFilter', label: 'Category Filter', type: 'text' },
    ]
    case 'promo-banner': return [
      { key: 'text', label: 'Banner Text', type: 'text' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'linkUrl', label: 'Link URL', type: 'text' },
    ]
    case 'call-to-action': return [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'buttonText', label: 'Button Text', type: 'text' },
      { key: 'buttonUrl', label: 'Button URL', type: 'text' },
      { key: 'alignment', label: 'Alignment', type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }] },
    ]
    case 'image-gallery': return [
      { key: 'images', label: 'Image URLs (one per line)', type: 'textarea' },
      { key: 'columns', label: 'Columns', type: 'select', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    ]
    case 'video': return [
      { key: 'videoUrl', label: 'Video URL', type: 'text' },
      { key: 'autoplay', label: 'Autoplay', type: 'boolean' },
      { key: 'controls', label: 'Show Controls', type: 'boolean' },
    ]
    case 'spacer': return [
      { key: 'height', label: 'Height (px)', type: 'number' },
    ]
    case 'nav-menu': return [
      { key: 'menuId', label: 'Menu', type: 'select', options: menus.map(m => ({ value: m.id, label: `${m.name} (${m.location})` })) },
      { key: 'style', label: 'Style', type: 'select', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }] },
    ]
    case 'footer': return [
      { key: 'showLogo', label: 'Show Logo', type: 'boolean' },
      { key: 'showLinks', label: 'Show Links', type: 'boolean' },
      { key: 'copyrightText', label: 'Copyright Text', type: 'text' },
    ]
    case 'carousel': return [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'autoPlay', label: 'Auto Play', type: 'boolean' },
      { key: 'interval', label: 'Interval (ms)', type: 'number' },
    ]
    case 'buy-box': return [
      { key: 'showRating', label: 'Show Rating', type: 'boolean' },
      { key: 'showStock', label: 'Show Stock Status', type: 'boolean' },
    ]
    case 'iframe': return [
      { key: 'src', label: 'iFrame URL', type: 'text' },
      { key: 'height', label: 'Height (px)', type: 'number' },
    ]
    case 'form': return [
      { key: 'formTitle', label: 'Form Title', type: 'text' },
      { key: 'submitLabel', label: 'Submit Button Label', type: 'text' },
      { key: 'successMessage', label: 'Success Message', type: 'text' },
    ]
    default: return []
  }
}

// ─── Canvas card ──────────────────────────────────────────────────────────────

function CanvasCard({
  module: m,
  selected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onToggleHidden,
  onDelete,
  isFirst,
  isLast,
}: {
  module: SitePageModule
  selected: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleHidden: () => void
  onDelete: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const meta = getModuleMeta(m.moduleType)
  const Icon = meta.icon
  return (
    <div
      onClick={onSelect}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
        selected ? 'ring-2 ring-blue-500 border-blue-500/50 bg-blue-500/10' : `${meta.color} hover:opacity-90`
      } ${m.hidden ? 'opacity-40' : ''}`}
    >
      <GripVertical className="w-4 h-4 text-zinc-600 shrink-0" />
      <div className={`p-1.5 rounded ${meta.color}`}>
        <Icon className="w-4 h-4 text-zinc-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">{m.name}</p>
        <p className="text-xs text-zinc-500">{meta.label}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 disabled:opacity-20">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 disabled:opacity-20">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button onClick={onToggleHidden} className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200">
          {m.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-900/40 text-zinc-500 hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Properties pane ─────────────────────────────────────────────────────────

function PropertiesPane({
  module: m,
  menus,
  onSave,
  saving,
}: {
  module: SitePageModule | null
  menus: SiteNavMenu[]
  onSave: (config: Record<string, unknown>) => Promise<void>
  saving: boolean
}) {
  const [localCfg, setLocalCfg] = useState<Record<string, unknown>>({})
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (m) {
      try { setLocalCfg(JSON.parse(m.config)) } catch { setLocalCfg({}) }
      setDirty(false)
    }
  }, [m?.id, m?.config])

  if (!m) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-sm gap-2 p-6">
        <AlignLeft className="w-8 h-8 opacity-30" />
        <p>Select a module to edit its properties</p>
      </div>
    )
  }

  const fields = getFields(m.moduleType, menus)

  function update(key: string, value: unknown) {
    setLocalCfg(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wide">Properties</p>
        <p className="text-sm font-medium text-zinc-200 mt-0.5">{m.name}</p>
        <p className="text-xs text-zinc-600">{m.moduleType}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {fields.length === 0 && (
          <p className="text-sm text-zinc-600">No configurable properties for this module type.</p>
        )}
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-zinc-400 mb-1">{field.label}</label>
            {field.type === 'text' && (
              <input
                value={(localCfg[field.key] as string) ?? ''}
                onChange={e => update(field.key, e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                value={(localCfg[field.key] as string) ?? ''}
                onChange={e => update(field.key, e.target.value)}
                rows={4}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            )}
            {field.type === 'select' && (
              <select
                value={(localCfg[field.key] as string) ?? ''}
                onChange={e => update(field.key, e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— select —</option>
                {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            {field.type === 'color' && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(localCfg[field.key] as string) ?? '#000000'}
                  onChange={e => update(field.key, e.target.value)}
                  className="w-10 h-8 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
                />
                <input
                  value={(localCfg[field.key] as string) ?? ''}
                  onChange={e => update(field.key, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
            {field.type === 'boolean' && (
              <button
                type="button"
                onClick={() => update(field.key, !localCfg[field.key])}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${localCfg[field.key] ? 'bg-blue-600' : 'bg-zinc-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${localCfg[field.key] ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            )}
            {field.type === 'number' && (
              <input
                type="number"
                value={(localCfg[field.key] as number) ?? ''}
                onChange={e => update(field.key, Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>
      {dirty && (
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => onSave(localCfg)}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Save Config
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Module picker modal ──────────────────────────────────────────────────────

function ModulePicker({ onPick, onClose }: { onPick: (type: string, label: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-[680px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Add Module</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Select a module to add to the page</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <div className="grid grid-cols-3 gap-3">
            {MODULE_TYPES.map(mod => {
              const Icon = mod.icon
              return (
                <button
                  key={mod.type}
                  onClick={() => onPick(mod.type, mod.label)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center hover:scale-[1.02] transition-transform ${mod.color}`}
                >
                  <div className={`p-2.5 rounded-lg ${mod.color}`}>
                    <Icon className="w-5 h-5 text-zinc-200" />
                  </div>
                  <span className="text-xs font-medium text-zinc-200 leading-tight">{mod.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [page, setPage] = useState<SitePage | null>(null)
  const [modules, setModules] = useState<SitePageModule[]>([])
  const [menus, setMenus] = useState<SiteNavMenu[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [topMsg, setTopMsg] = useState('')
  const [configSaving, setConfigSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const selected = modules.find(m => m.id === selectedId) ?? null

  // Load page + modules + menus
  useEffect(() => {
    Promise.all([
      fetch(`/api/site/pages/${id}`).then(r => r.json()),
      fetch('/api/site/menus').then(r => r.json()),
    ]).then(([pageData, menuData]) => {
      setPage(pageData)
      setModules(Array.isArray(pageData.modules) ? [...pageData.modules].sort((a, b) => a.position - b.position) : [])
      setMenus(Array.isArray(menuData) ? menuData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const flash = (msg: string) => {
    setTopMsg(msg)
    setTimeout(() => setTopMsg(''), 2500)
  }

  // Check in
  async function handleCheckin() {
    const res = await fetch(`/api/site/pages/${id}/checkin`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) { setPage(data); flash('Checked in') }
  }

  // Publish
  async function handlePublish() {
    const res = await fetch(`/api/site/pages/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publishedBy: 'Admin' }),
    })
    const data = await res.json()
    if (res.ok) { setPage(data); flash('Published!') }
  }

  // Add module
  async function handleAddModule(moduleType: string, label: string) {
    setShowPicker(false)
    const res = await fetch(`/api/site/pages/${id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleType, name: label }),
    })
    const m = await res.json()
    if (res.ok) {
      setModules(prev => [...prev, m].sort((a, b) => a.position - b.position))
      setSelectedId(m.id)
    }
  }

  // Delete module
  async function handleDeleteModule(mid: string) {
    await fetch(`/api/site/pages/${id}/modules/${mid}`, { method: 'DELETE' })
    setModules(prev => prev.filter(m => m.id !== mid))
    if (selectedId === mid) setSelectedId(null)
  }

  // Toggle hidden
  async function handleToggleHidden(m: SitePageModule) {
    const res = await fetch(`/api/site/pages/${id}/modules/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hidden: !m.hidden }),
    })
    const updated = await res.json()
    if (res.ok) setModules(prev => prev.map(x => x.id === m.id ? updated : x))
  }

  // Move up / down
  const moveModule = useCallback(async (mod: SitePageModule, dir: 'up' | 'down') => {
    const sorted = [...modules].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(m => m.id === mod.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const swapWith = sorted[swapIdx]
    const newPos = swapWith.position
    const oldPos = mod.position

    // Optimistic update
    setModules(prev => prev.map(m => {
      if (m.id === mod.id) return { ...m, position: newPos }
      if (m.id === swapWith.id) return { ...m, position: oldPos }
      return m
    }))

    await Promise.all([
      fetch(`/api/site/pages/${id}/modules/${mod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPos }),
      }),
      fetch(`/api/site/pages/${id}/modules/${swapWith.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: oldPos }),
      }),
    ])
  }, [modules, id])

  // Save config
  async function handleSaveConfig(cfg: Record<string, unknown>) {
    if (!selected) return
    setConfigSaving(true)
    const res = await fetch(`/api/site/pages/${id}/modules/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: JSON.stringify(cfg) }),
    })
    const updated = await res.json()
    if (res.ok) {
      setModules(prev => prev.map(m => m.id === selected.id ? updated : m))
      flash('Config saved')
    }
    setConfigSaving(false)
  }

  const sortedModules = [...modules].sort((a, b) => a.position - b.position)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  const isCheckedOut = page?.status === 'checked-out'
  const isPublished = page?.status === 'published'

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/site-builder/${id}`)} className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="w-px h-5 bg-zinc-700" />
          <div>
            <span className="text-sm font-semibold text-zinc-100">{page?.name}</span>
            {page?.status && (
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                page.status === 'checked-out' ? 'bg-yellow-500/20 text-yellow-300' :
                page.status === 'published' ? 'bg-emerald-500/20 text-emerald-300' :
                page.status === 'checked-in' ? 'bg-blue-500/20 text-blue-300' :
                'bg-zinc-700 text-zinc-300'
              }`}>{page.status}</span>
            )}
          </div>
          {topMsg && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {topMsg}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/site-builder/${id}/preview`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-lg text-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </Link>
          {isCheckedOut && (
            <button
              onClick={handleCheckin}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-lg text-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" /> Check In
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={isCheckedOut || isPublished}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Publish
          </button>
        </div>
      </div>

      {/* 3-panel body */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Page outline */}
        <div className="w-[250px] shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Page Outline</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {sortedModules.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-8">No modules yet. Add one below.</p>
            )}
            {sortedModules.map((m, idx) => {
              const meta = getModuleMeta(m.moduleType)
              const Icon = meta.icon
              const isSelected = m.id === selectedId
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-blue-600/20 text-blue-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  } ${m.hidden ? 'opacity-40' : ''}`}
                >
                  <GripVertical className="w-3 h-3 text-zinc-600 shrink-0" />
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="flex-1 truncate">{m.name}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={() => moveModule(m, 'up')} disabled={idx === 0} className="p-0.5 hover:text-zinc-100 disabled:opacity-20">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveModule(m, 'down')} disabled={idx === sortedModules.length - 1} className="p-0.5 hover:text-zinc-100 disabled:opacity-20">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleToggleHidden(m)} className="p-0.5 hover:text-zinc-100">
                      {m.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button onClick={() => handleDeleteModule(m.id)} className="p-0.5 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-3 border-t border-zinc-800">
            <button
              onClick={() => setShowPicker(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-zinc-700 hover:border-blue-500 text-zinc-500 hover:text-blue-400 rounded-lg text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Module
            </button>
          </div>
        </div>

        {/* CENTER — Canvas */}
        <div className="flex-1 bg-zinc-950 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {sortedModules.length === 0 && (
              <div className="border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center py-24 text-zinc-600">
                <Layers className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">This page has no modules yet</p>
                <button onClick={() => setShowPicker(true)} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add your first module
                </button>
              </div>
            )}
            {sortedModules.map((m, idx) => (
              <CanvasCard
                key={m.id}
                module={m}
                selected={m.id === selectedId}
                onSelect={() => setSelectedId(m.id)}
                onMoveUp={() => moveModule(m, 'up')}
                onMoveDown={() => moveModule(m, 'down')}
                onToggleHidden={() => handleToggleHidden(m)}
                onDelete={() => handleDeleteModule(m.id)}
                isFirst={idx === 0}
                isLast={idx === sortedModules.length - 1}
              />
            ))}
            {sortedModules.length > 0 && (
              <button
                onClick={() => setShowPicker(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-zinc-800 hover:border-blue-500 text-zinc-600 hover:text-blue-400 rounded-xl text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Module
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — Properties */}
        <div className="w-[300px] shrink-0 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden">
          <PropertiesPane
            module={selected}
            menus={menus}
            onSave={handleSaveConfig}
            saving={configSaving}
          />
        </div>
      </div>

      {/* Module picker modal */}
      {showPicker && (
        <ModulePicker onPick={handleAddModule} onClose={() => setShowPicker(false)} />
      )}
    </div>
  )
}
