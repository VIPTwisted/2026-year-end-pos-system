'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Filter, Trash2 } from 'lucide-react'

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    optimizeFor: 'cost',
    priority: 0,
    maxSplitLines: 1,
    isActive: true,
  })

  useEffect(() => {
    fetch(`/api/iom/policies/${id}`).then((r) => r.json()).then((data) => {
      setForm({
        name: data.name ?? '',
        description: data.description ?? '',
        optimizeFor: data.optimizeFor ?? 'cost',
        priority: data.priority ?? 0,
        maxSplitLines: data.maxSplitLines ?? 1,
        isActive: data.isActive ?? true,
      })
    })
  }, [id])

  const handleSave = async () => {
    setLoading(true)
    try {
      await fetch(`/api/iom/policies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      router.push('/iom/policies')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this policy?')) return
    await fetch(`/api/iom/policies/${id}`, { method: 'DELETE' })
    router.push('/iom/policies')
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-zinc-100">Edit Policy</h1>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-zinc-400 mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-zinc-400 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Optimize For</label>
            <select value={form.optimizeFor} onChange={(e) => setForm({ ...form, optimizeFor: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100">
              <option value="cost">Cost</option>
              <option value="speed">Speed</option>
              <option value="stock">Stock</option>
              <option value="balanced">Balanced</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Priority</label>
            <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Max Split Lines</label>
            <input type="number" min={1} value={form.maxSplitLines} onChange={(e) => setForm({ ...form, maxSplitLines: Number(e.target.value) })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-500" />
            <label htmlFor="isActive" className="text-sm text-zinc-300">Active</label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => router.back()}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
