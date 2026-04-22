'use client'

import { use, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'

type ListItem = {
  id: string
  productName: string | null
  sku: string | null
  rank: number
  score: number
}

type RecommendationList = {
  id: string
  listName: string
  listType: string
  description: string | null
  isActive: boolean
  lastRefreshedAt: string | null
  items: ListItem[]
}

export default function RecommendationListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [list, setList] = useState<RecommendationList | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState({ productName: '', sku: '', rank: '', score: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/recommendations/lists/${id}`)
      .then((r) => r.json())
      .then(setList)
      .finally(() => setLoading(false))
  }, [id])

  async function handleRefresh() {
    setRefreshing(true)
    const res = await fetch(`/api/recommendations/lists/${id}/refresh`, { method: 'POST' })
    const updated = await res.json()
    setList((l) => l ? { ...l, lastRefreshedAt: updated.lastRefreshedAt } : l)
    setRefreshing(false)
  }

  async function handleAddItem() {
    setSaving(true)
    const res = await fetch(`/api/recommendations/lists/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rank: parseInt(form.rank), score: parseFloat(form.score) }),
    })
    const item = await res.json()
    setList((l) => l ? { ...l, items: [...l.items, item].sort((a, b) => a.rank - b.rank) } : l)
    setForm({ productName: '', sku: '', rank: '', score: '' })
    setSaving(false)
  }

  async function handleDelete(itemId: string) {
    setList((l) => l ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l)
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>
  if (!list) return <div className="p-6 text-zinc-400">List not found</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{list.listName}</h1>
          <p className="text-zinc-400 text-sm mt-1 capitalize">{list.listType.replace('_', ' ')}</p>
          {list.description && <p className="text-zinc-500 text-xs mt-1">{list.description}</p>}
          <p className="text-xs text-zinc-600 mt-1">
            {list.lastRefreshedAt ? `Last refreshed: ${new Date(list.lastRefreshedAt).toLocaleString()}` : 'Never refreshed'}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          Refresh List
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Rank</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Product Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">SKU</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3 w-48">Score</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.items.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-zinc-500 py-8">No items in this list</td></tr>
            ) : list.items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="px-4 py-3">
                  <span className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {item.rank}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-100">{item.productName ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{item.sku ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(item.score, 100)}%` }} />
                    </div>
                    <span className="text-xs text-zinc-400 w-8">{item.score.toFixed(0)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(item.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Product Name</label>
            <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              value={form.productName} onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))} placeholder="Widget Pro" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">SKU</label>
            <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="WGT-PRO-001" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Rank</label>
            <input type="number" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              value={form.rank} onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value }))} placeholder={String((list.items.length + 1))} min="1" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Score (0-100)</label>
            <input type="number" min="0" max="100" step="0.1" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              value={form.score} onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))} placeholder="85.0" />
          </div>
        </div>
        <button onClick={handleAddItem} disabled={saving || !form.productName || !form.rank}
          className="mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> {saving ? 'Adding...' : 'Add to List'}
        </button>
      </div>
    </div>
  )
}
