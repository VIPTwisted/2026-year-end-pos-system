'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch, Plus, Trash2 } from 'lucide-react'

interface OrderLine {
  productId: string
  quantity: number
  unitPrice: number
  fulfillmentType: string
}

export default function NewOrchestrationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    sourceType: 'manual',
    customerId: '',
    priority: 'standard',
    notes: '',
    requestedDate: '',
    promisedDate: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'US',
  })
  const [lines, setLines] = useState<OrderLine[]>([
    { productId: '', quantity: 1, unitPrice: 0, fulfillmentType: 'ship' },
  ])

  const addLine = () => setLines([...lines, { productId: '', quantity: 1, unitPrice: 0, fulfillmentType: 'ship' }])
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: keyof OrderLine, value: string | number) => {
    const updated = [...lines]
    updated[i] = { ...updated[i], [field]: value }
    setLines(updated)
  }

  const orderValue = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/iom/orchestrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: form.sourceType,
          customerId: form.customerId || null,
          priority: form.priority,
          notes: form.notes || null,
          requestedDate: form.requestedDate || null,
          promisedDate: form.promisedDate || null,
          orderValue,
          shippingAddress: {
            street: form.shippingStreet,
            city: form.shippingCity,
            state: form.shippingState,
            zip: form.shippingZip,
            country: form.shippingCountry,
          },
          lines: lines.filter((l) => l.productId),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/iom/orchestrations/${data.id}`)
    } catch {
      alert('Error creating orchestration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-zinc-100">New Order Orchestration</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Order Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Source Type</label>
              <select
                value={form.sourceType}
                onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              >
                <option value="manual">Manual</option>
                <option value="pos">POS</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="call_center">Call Center</option>
                <option value="api">API</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              >
                <option value="standard">Standard</option>
                <option value="expedited">Expedited</option>
                <option value="rush">Rush</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Customer ID (optional)</label>
              <input
                type="text"
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                placeholder="Customer ID"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div />
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Requested Date</label>
              <input
                type="date"
                value={form.requestedDate}
                onChange={(e) => setForm({ ...form, requestedDate: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Promised Date</label>
              <input
                type="date"
                value={form.promisedDate}
                onChange={(e) => setForm({ ...form, promisedDate: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Shipping Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Street</label>
              <input
                type="text"
                value={form.shippingStreet}
                onChange={(e) => setForm({ ...form, shippingStreet: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">City</label>
              <input
                type="text"
                value={form.shippingCity}
                onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">State</label>
              <input
                type="text"
                value={form.shippingState}
                onChange={(e) => setForm({ ...form, shippingState: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">ZIP</label>
              <input
                type="text"
                value={form.shippingZip}
                onChange={(e) => setForm({ ...form, shippingZip: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Country</label>
              <input
                type="text"
                value={form.shippingCountry}
                onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Order Lines */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Order Lines</h2>
            <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              <Plus className="w-3 h-3" /> Add Line
            </button>
          </div>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Product ID</label>}
                  <input
                    type="text"
                    value={line.productId}
                    onChange={(e) => updateLine(i, 'productId', e.target.value)}
                    placeholder="Product ID"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Qty</label>}
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))}
                    min={1}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Unit Price</label>}
                  <input
                    type="number"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(i, 'unitPrice', Number(e.target.value))}
                    step="0.01"
                    min={0}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div className="col-span-3">
                  {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Fulfillment</label>}
                  <select
                    value={line.fulfillmentType}
                    onChange={(e) => updateLine(i, 'fulfillmentType', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100"
                  >
                    <option value="ship">Ship</option>
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
                <div className="col-span-1 flex justify-end">
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)} className="text-red-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-zinc-800 flex justify-end">
            <span className="text-sm text-zinc-300">Total: <strong className="text-zinc-100">${orderValue.toFixed(2)}</strong></span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create Orchestration'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
