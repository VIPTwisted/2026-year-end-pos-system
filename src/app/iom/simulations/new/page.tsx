'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Plus, Trash2, Play } from 'lucide-react'

interface TestOrder { productId: string; quantity: number; region: string; orderValue: number; priority: string }
interface Policy { id: string; name: string; optimizeFor: string }

export default function NewSimulationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [form, setForm] = useState({ name: '', description: '', policyId: '' })
  const [testOrders, setTestOrders] = useState<TestOrder[]>([
    { productId: '', quantity: 1, region: 'US-EAST', orderValue: 100, priority: 'standard' },
  ])

  useEffect(() => {
    fetch('/api/iom/policies').then((r) => r.json()).then(setPolicies)
  }, [])

  const addOrder = () => setTestOrders([...testOrders, { productId: '', quantity: 1, region: 'US-EAST', orderValue: 100, priority: 'standard' }])
  const removeOrder = (i: number) => setTestOrders(testOrders.filter((_, idx) => idx !== i))
  const updateOrder = (i: number, key: keyof TestOrder, val: string | number) => {
    const updated = [...testOrders]
    updated[i] = { ...updated[i], [key]: val }
    setTestOrders(updated)
  }

  const createAndRun = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/iom/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, policyId: form.policyId || null, testOrders }),
      })
      if (!res.ok) throw new Error('Failed')
      const sim = await res.json()

      setRunning(true)
      await fetch(`/api/iom/simulations/${sim.id}/run`, { method: 'POST' })
      router.push(`/iom/simulations/${sim.id}`)
    } catch {
      alert('Error creating simulation')
    } finally {
      setLoading(false)
      setRunning(false)
    }
  }

  const createOnly = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/iom/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, policyId: form.policyId || null, testOrders }),
      })
      if (!res.ok) throw new Error('Failed')
      const sim = await res.json()
      router.push(`/iom/simulations/${sim.id}`)
    } catch {
      alert('Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <FlaskConical className="w-5 h-5 text-pink-400" />
        <h1 className="text-xl font-bold text-zinc-100">New Simulation</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Cost vs Speed comparison" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Policy</label>
              <select value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100">
                <option value="">Default (highest priority active)</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.optimizeFor})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Test Orders</h2>
            <button type="button" onClick={addOrder} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              <Plus className="w-3 h-3" /> Add Order
            </button>
          </div>
          {testOrders.map((order, i) => (
            <div key={i} className="border border-zinc-800 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Test Order #{i + 1}</span>
                {testOrders.length > 1 && (
                  <button type="button" onClick={() => removeOrder(i)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Product ID</label>
                  <input value={order.productId} onChange={(e) => updateOrder(i, 'productId', e.target.value)}
                    placeholder="Optional" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Qty</label>
                  <input type="number" min={1} value={order.quantity} onChange={(e) => updateOrder(i, 'quantity', Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Order Value</label>
                  <input type="number" min={0} value={order.orderValue} onChange={(e) => updateOrder(i, 'orderValue', Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Region</label>
                  <input value={order.region} onChange={(e) => updateOrder(i, 'region', e.target.value)}
                    placeholder="US-EAST" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Priority</label>
                  <select value={order.priority} onChange={(e) => updateOrder(i, 'priority', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100">
                    <option value="standard">Standard</option>
                    <option value="expedited">Expedited</option>
                    <option value="rush">Rush</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={createAndRun}
            disabled={loading || !form.name}
            className="flex items-center gap-2 px-6 py-2 bg-pink-700 hover:bg-pink-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            {running ? 'Running...' : 'Create & Run'}
          </button>
          <button
            onClick={createOnly}
            disabled={loading || !form.name}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-zinc-500 text-sm hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
