'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Server } from 'lucide-react'

const CARRIERS = ['UPS', 'FedEx', 'USPS', 'DHL']

export default function NewProviderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'warehouse',
    description: '',
    priority: 0,
    maxCapacity: '',
    avgProcessingDays: 1,
    costPerOrder: 0,
    supportedRegions: '',
    storeId: '',
    isActive: true,
  })
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])

  const toggleCarrier = (c: string) => {
    setSelectedCarriers((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/iom/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null,
          supportedCarriers: selectedCarriers.length > 0 ? JSON.stringify(selectedCarriers) : null,
          supportedRegions: form.supportedRegions
            ? JSON.stringify(form.supportedRegions.split(',').map((r) => r.trim()).filter(Boolean))
            : null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      router.push('/iom/providers')
    } catch {
      alert('Error creating provider')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Server className="w-5 h-5 text-purple-400" />
        <h1 className="text-xl font-bold text-zinc-100">Add Fulfillment Provider</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Code *</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="WH-EAST" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="East Coast Warehouse" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100">
                <option value="warehouse">Warehouse</option>
                <option value="store">Store</option>
                <option value="third_party_logistics">3PL</option>
                <option value="drop_ship">Drop Ship</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Priority</label>
              <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Max Capacity (orders/day)</label>
              <input type="number" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
                placeholder="Leave blank for unlimited" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Avg Processing Days</label>
              <input type="number" step="0.5" min="0.5" value={form.avgProcessingDays} onChange={(e) => setForm({ ...form, avgProcessingDays: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Cost Per Order ($)</label>
              <input type="number" step="0.01" min="0" value={form.costPerOrder} onChange={(e) => setForm({ ...form, costPerOrder: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Store ID (for store-type)</label>
              <input value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                placeholder="Optional" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none" />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Supported Regions (comma-separated)</label>
            <input value={form.supportedRegions} onChange={(e) => setForm({ ...form, supportedRegions: e.target.value })}
              placeholder="US-EAST, US-WEST, CA" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">Supported Carriers</label>
            <div className="flex gap-3">
              {CARRIERS.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCarriers.includes(c)}
                    onChange={() => toggleCarrier(c)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-500" />
            <label htmlFor="isActive" className="text-sm text-zinc-300">Active immediately</label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Creating...' : 'Add Provider'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
