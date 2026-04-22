'use client'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Warehouse, Plus, X, Trash2, ChevronDown, ChevronUp,
  MapPin, Store, Truck, Package, ToggleLeft, ToggleRight,
  Settings,
} from 'lucide-react'

type FulfillmentStore = {
  id: string
  storeName: string | null
  storeId: string | null
  priority: number
  maxDistance: number | null
  createdAt: string
}

type FulfillmentGroup = {
  id: string
  name: string
  description: string | null
  sourceChannelName: string | null
  fulfillmentType: string
  isActive: boolean
  createdAt: string
  stores: FulfillmentStore[]
  _count: { stores: number }
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pickup:    { label: 'Store Pickup',  icon: Store,     color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  warehouse: { label: 'Warehouse',     icon: Warehouse, color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
  dropship:  { label: 'Drop-Ship',     icon: Truck,     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  third_pl:  { label: '3PL',           icon: Package,   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
}

const FULFILLMENT_TYPES = ['pickup', 'warehouse', 'dropship', 'third_pl']

const emptyForm = {
  name: '', description: '', sourceChannelName: '', fulfillmentType: 'warehouse',
  isActive: true,
}

export default function FulfillmentSourcesPage() {
  const [groups, setGroups]             = useState<FulfillmentGroup[]>([])
  const [loading, setLoading]           = useState(true)
  const [filterType, setFilterType]     = useState('all')
  const [expanded, setExpanded]         = useState<string | null>(null)
  const [showNew, setShowNew]           = useState(false)
  const [form, setForm]                 = useState(emptyForm)
  const [saving, setSaving]             = useState(false)
  const [addStoreName, setAddStoreName] = useState<string | null>(null)
  const [storeInput, setStoreInput]     = useState({ storeName: '', priority: 1, maxDistance: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const params = filterType !== 'all' ? `?fulfillmentType=${filterType}` : ''
    const res = await fetch(`/api/iom/sources${params}`)
    setGroups(await res.json())
    setLoading(false)
  }, [filterType])

  useEffect(() => { load() }, [load])

  async function createGroup(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/iom/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        description:       form.description || null,
        sourceChannelName: form.sourceChannelName || null,
      }),
    })
    setShowNew(false)
    setForm(emptyForm)
    setSaving(false)
    load()
  }

  async function toggleActive(g: FulfillmentGroup) {
    await fetch(`/api/iom/sources/${g.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !g.isActive }),
    })
    load()
  }

  async function deleteGroup(id: string) {
    if (!confirm('Delete this fulfillment source?')) return
    await fetch(`/api/iom/sources/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = filterType === 'all'
    ? groups
    : groups.filter(g => g.fulfillmentType === filterType)

  const totalActive   = groups.filter(g => g.isActive).length
  const totalSources  = groups.reduce((a, g) => a + g._count.stores, 0)
  const byType        = FULFILLMENT_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = groups.filter(g => g.fulfillmentType === t).length
    return acc
  }, {})

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
            <Warehouse className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Fulfillment Sources</h1>
            <p className="text-xs text-zinc-500">Warehouses · store pickup · drop-ship · 3PL networks</p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Source
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pb-0">
        {[
          { label: 'Active Networks', value: totalActive, color: 'text-emerald-400' },
          { label: 'Total Locations', value: totalSources, color: 'text-blue-400' },
          { label: 'Warehouses', value: byType.warehouse ?? 0, color: 'text-violet-400' },
          { label: 'Drop-Ship / 3PL', value: (byType.dropship ?? 0) + (byType.third_pl ?? 0), color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{label}</p>
            <p className={cn('text-2xl font-bold tabular-nums', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="px-6 pt-5 pb-0 flex gap-1">
        {['all', ...FULFILLMENT_TYPES].map(t => {
          const meta = TYPE_META[t]
          return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                filterType === t
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              )}
            >
              {meta?.label ?? 'All'}
            </button>
          )
        })}
      </div>

      {/* Group list */}
      <div className="p-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <Warehouse className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>No fulfillment sources. Add one to route orders.</p>
          </div>
        ) : filtered.map(g => {
          const meta = TYPE_META[g.fulfillmentType] ?? TYPE_META['warehouse']
          const Icon = meta.icon
          const isExpanded = expanded === g.id

          return (
            <div key={g.id} className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={cn('p-2 rounded-lg border', meta.bg)}>
                  <Icon className={cn('w-4 h-4', meta.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-zinc-100">{g.name}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border', meta.bg, meta.color)}>
                      {meta.label}
                    </span>
                    {g.sourceChannelName && (
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                        {g.sourceChannelName}
                      </span>
                    )}
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      g.isActive
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-500'
                    )}>
                      {g.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {g.description && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-md">{g.description}</p>
                  )}
                  <p className="text-xs text-zinc-600 mt-0.5">{g._count.stores} location{g._count.stores !== 1 ? 's' : ''}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(g)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                    title={g.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {g.isActive
                      ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                      : <ToggleLeft className="w-5 h-5 text-zinc-600" />}
                  </button>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : g.id)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteGroup(g.id)}
                    className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Locations list */}
              {isExpanded && (
                <div className="border-t border-zinc-800">
                  {g.stores.length === 0 ? (
                    <p className="text-center text-xs text-zinc-600 py-4">No locations configured.</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-800/60 text-[11px] text-zinc-500 uppercase tracking-wide">
                          <th className="px-5 py-2.5 text-left">Location</th>
                          <th className="px-4 py-2.5 text-left">Store ID</th>
                          <th className="px-4 py-2.5 text-left">Priority</th>
                          <th className="px-4 py-2.5 text-left">Max Distance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40">
                        {g.stores.map(s => (
                          <tr key={s.id} className="hover:bg-zinc-800/20 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <span className="text-sm text-zinc-200">{s.storeName ?? 'Unnamed'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-zinc-500 font-mono">{s.storeId ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded font-medium',
                                s.priority === 1 ? 'bg-blue-500/15 text-blue-400' :
                                s.priority === 2 ? 'bg-zinc-700 text-zinc-400' : 'bg-zinc-800 text-zinc-500'
                              )}>
                                P{s.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                              {s.maxDistance != null ? `${s.maxDistance} mi` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* New Source Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-violet-400" /> New Fulfillment Source
              </h2>
              <button onClick={() => setShowNew(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. East Coast DC, Downtown Store"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Fulfillment Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {FULFILLMENT_TYPES.map(t => {
                    const meta = TYPE_META[t]
                    const Icon = meta.icon
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, fulfillmentType: t }))}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                          form.fulfillmentType === t
                            ? cn('border-violet-500 bg-violet-600/20 text-violet-300')
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                        )}
                      >
                        <Icon className="w-4 h-4" /> {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Optional description"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Source Channel</label>
                <input value={form.sourceChannelName} onChange={e => setForm(f => ({ ...f, sourceChannelName: e.target.value }))}
                  placeholder="e.g. Web, POS, Shopify"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-violet-500" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-zinc-400">Active</label>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    form.isActive ? 'bg-violet-600' : 'bg-zinc-700'
                  )}
                >
                  <span className={cn(
                    'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                    form.isActive ? 'translate-x-4' : 'translate-x-1'
                  )} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNew(false)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Creating…' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
