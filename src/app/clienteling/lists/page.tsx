'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, X, Users2, Calendar, Star, RotateCcw, ShoppingBag, Layers } from 'lucide-react'

interface ClientList {
  id: string
  name: string
  description: string | null
  assignedTo: string | null
  listType: string
  status: string
  entries: { status: string }[]
  _count: { entries: number; activities: number }
  updatedAt: string
}

const LIST_TYPES = ['all', 'general', 'vip', 'birthday', 'anniversary', 'lapsed', 'product-interest']

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  vip: Star,
  birthday: Calendar,
  anniversary: Calendar,
  lapsed: RotateCcw,
  'product-interest': ShoppingBag,
  general: Layers,
}

const TYPE_COLORS: Record<string, string> = {
  vip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  birthday: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  anniversary: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  lapsed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'product-interest': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  general: 'bg-zinc-700/50 text-zinc-300 border-zinc-600',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  archived: 'bg-zinc-700/50 text-zinc-500 border-zinc-600',
}

export default function ClientelingListsPage() {
  const [lists, setLists] = useState<ClientList[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', listType: 'general', assignedTo: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const params = filter !== 'all' ? `?listType=${filter}` : ''
    const res = await fetch(`/api/clienteling/lists${params}`)
    setLists(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function createList() {
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/clienteling/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', description: '', listType: 'general', assignedTo: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  function getProgressCounts(entries: { status: string }[]) {
    const pending = entries.filter(e => e.status === 'pending').length
    const contacted = entries.filter(e => e.status === 'contacted').length
    const converted = entries.filter(e => e.status === 'converted').length
    const total = entries.length
    return { pending, contacted, converted, total }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Lists</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage associate clienteling outreach lists</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New List
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New Clienteling List</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">List Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g. VIP Spring Outreach" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Assigned To</label>
              <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="Associate name" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">List Type</label>
              <select value={form.listType} onChange={e => setForm({ ...form, listType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                {LIST_TYPES.filter(t => t !== 'all').map(t => (
                  <option key={t} value={t}>{t.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="Optional description" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={createList} disabled={saving || !form.name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Creating...' : 'Create List'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {LIST_TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'
            }`}>{t.replace('-', ' ')}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-500">Loading...</div>
      ) : lists.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Users2 className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p>No lists found. Create your first clienteling list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {lists.map(list => {
            const { pending, contacted, converted, total } = getProgressCounts(list.entries)
            const Icon = TYPE_ICONS[list.listType] || Layers
            return (
              <div key={list.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-semibold text-zinc-100 text-sm">{list.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[list.status] || STATUS_COLORS.active}`}>{list.status}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[list.listType] || TYPE_COLORS.general}`}>
                    {list.listType.replace('-', ' ')}
                  </span>
                  {list.assignedTo && <span className="text-xs text-zinc-500">{list.assignedTo}</span>}
                </div>
                {list.description && <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{list.description}</p>}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                    <span>{total} entries</span>
                    <span>{converted} converted</span>
                  </div>
                  {total > 0 && (
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-800 gap-0.5">
                      {converted > 0 && <div className="bg-green-500 rounded-full" style={{ width: `${(converted / total) * 100}%` }} />}
                      {contacted > 0 && <div className="bg-blue-500 rounded-full" style={{ width: `${(contacted / total) * 100}%` }} />}
                      {pending > 0 && <div className="bg-zinc-600 rounded-full" style={{ width: `${(pending / total) * 100}%` }} />}
                    </div>
                  )}
                  <div className="flex gap-3 mt-1.5 text-xs">
                    <span className="text-zinc-500">{pending} pending</span>
                    <span className="text-blue-400">{contacted} contacted</span>
                    <span className="text-green-400">{converted} converted</span>
                  </div>
                </div>
                <Link href={`/clienteling/lists/${list.id}`}
                  className="block w-full text-center py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-300 transition-colors">
                  Open List
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
