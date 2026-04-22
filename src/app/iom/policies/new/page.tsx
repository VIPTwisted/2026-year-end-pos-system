'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

interface Condition { field: string; operator: string; value: string }
interface Provider { id: string; name: string; type: string }

export default function NewPolicyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [providerOrder, setProviderOrder] = useState<string[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    optimizeFor: 'cost',
    priority: 0,
    maxSplitLines: 1,
    isActive: true,
  })

  useEffect(() => {
    fetch('/api/iom/providers').then((r) => r.json()).then((data) => {
      setProviders(data)
      setProviderOrder(data.map((p: Provider) => p.id))
    })
  }, [])

  const addCondition = () => setConditions([...conditions, { field: 'orderValue', operator: 'gt', value: '' }])
  const removeCondition = (i: number) => setConditions(conditions.filter((_, idx) => idx !== i))
  const updateCondition = (i: number, key: keyof Condition, val: string) => {
    const updated = [...conditions]
    updated[i] = { ...updated[i], [key]: val }
    setConditions(updated)
  }

  const moveProvider = (id: string, dir: 'up' | 'down') => {
    const idx = providerOrder.indexOf(id)
    if (dir === 'up' && idx > 0) {
      const arr = [...providerOrder]
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      setProviderOrder(arr)
    } else if (dir === 'down' && idx < providerOrder.length - 1) {
      const arr = [...providerOrder]
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      setProviderOrder(arr)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const conditionsObj = conditions.reduce((acc, c) => {
        if (c.value) acc[c.field] = { [c.operator]: c.value }
        return acc
      }, {} as Record<string, unknown>)

      const res = await fetch('/api/iom/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          conditions: conditions.length > 0 ? conditionsObj : null,
          providerPreferences: providerOrder.length > 0 ? providerOrder : null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      router.push('/iom/policies')
    } catch {
      alert('Error creating policy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-amber-400" />
        <h1 className="text-xl font-bold text-zinc-100">New Fulfillment Policy</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Policy Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Fast Fulfillment Policy" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none" />
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
          </div>

          {/* Optimize For */}
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Optimize For</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'cost', label: 'Cost', desc: 'Minimize fulfillment cost' },
                { value: 'speed', label: 'Speed', desc: 'Fastest delivery time' },
                { value: 'stock', label: 'Stock', desc: 'Highest inventory availability' },
                { value: 'balanced', label: 'Balanced', desc: 'Balance cost and speed' },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.optimizeFor === opt.value ? 'border-blue-500 bg-blue-950/20' : 'border-zinc-700 hover:border-zinc-600'}`}>
                  <input type="radio" name="optimizeFor" value={opt.value} checked={form.optimizeFor === opt.value}
                    onChange={(e) => setForm({ ...form, optimizeFor: e.target.value })} className="mt-0.5 accent-blue-500" />
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{opt.label}</div>
                    <div className="text-xs text-zinc-500">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-500" />
            <label htmlFor="isActive" className="text-sm text-zinc-300">Active</label>
          </div>
        </div>

        {/* Conditions Builder */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Conditions</h2>
            <button type="button" onClick={addCondition} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              <Plus className="w-3 h-3" /> Add Condition
            </button>
          </div>
          {conditions.length === 0 && <p className="text-xs text-zinc-500">No conditions — policy applies to all orders</p>}
          <div className="space-y-3">
            {conditions.map((c, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Field</label>}
                  <select value={c.field} onChange={(e) => updateCondition(i, 'field', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100">
                    <option value="orderValue">Order Value</option>
                    <option value="region">Region</option>
                    <option value="productCategory">Product Category</option>
                    <option value="customerTier">Customer Tier</option>
                  </select>
                </div>
                <div>
                  {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Op</label>}
                  <select value={c.operator} onChange={(e) => updateCondition(i, 'operator', e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100">
                    <option value="gt">{'>'}</option>
                    <option value="lt">{'<'}</option>
                    <option value="eq">{'='}</option>
                    <option value="contains">contains</option>
                  </select>
                </div>
                <div className="flex-1">
                  {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Value</label>}
                  <input value={c.value} onChange={(e) => updateCondition(i, 'value', e.target.value)}
                    placeholder="100" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100" />
                </div>
                <button type="button" onClick={() => removeCondition(i)} className="text-red-500 hover:text-red-400 pb-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Preferences */}
        {providers.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300">Provider Preference Order</h2>
            <p className="text-xs text-zinc-500">Drag to reorder. Top = highest preference.</p>
            <div className="space-y-2">
              {providerOrder.map((pid, idx) => {
                const p = providers.find((x) => x.id === pid)
                if (!p) return null
                return (
                  <div key={pid} className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                    <span className="text-xs text-zinc-500 w-5">{idx + 1}.</span>
                    <span className="flex-1 text-sm text-zinc-300">{p.name}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-zinc-700 text-zinc-400 rounded">{p.type}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveProvider(pid, 'up')} disabled={idx === 0} className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => moveProvider(pid, 'down')} disabled={idx === providerOrder.length - 1} className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Creating...' : 'Create Policy'}
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
