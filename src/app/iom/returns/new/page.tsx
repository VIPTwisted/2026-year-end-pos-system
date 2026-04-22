'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RotateCcw, Plus, Trash2 } from 'lucide-react'
import { Suspense } from 'react'

interface ReturnLine { productId: string; quantity: number; condition: string; disposition: string }

function NewReturnForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customerId: '',
    orchestrationId: searchParams.get('orchestrationId') ?? '',
    reason: '',
    refundMethod: 'original',
  })
  const [lines, setLines] = useState<ReturnLine[]>([{ productId: '', quantity: 1, condition: 'good', disposition: 'restock' }])

  const addLine = () => setLines([...lines, { productId: '', quantity: 1, condition: 'good', disposition: 'restock' }])
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i))
  const updateLine = (i: number, key: keyof ReturnLine, val: string | number) => {
    const updated = [...lines]
    updated[i] = { ...updated[i], [key]: val }
    setLines(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/iom/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          customerId: form.customerId || null,
          orchestrationId: form.orchestrationId || null,
          lines: lines.filter((l) => l.productId),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/iom/returns/${data.id}`)
    } catch {
      alert('Error creating return')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <RotateCcw className="w-5 h-5 text-orange-400" />
        <h1 className="text-xl font-bold text-zinc-100">New Return</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Customer ID</label>
              <input value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                placeholder="Optional" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Linked Orchestration</label>
              <input value={form.orchestrationId} onChange={(e) => setForm({ ...form, orchestrationId: e.target.value })}
                placeholder="Optional" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Reason</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Defective, wrong item, etc." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Refund Method</label>
              <select value={form.refundMethod} onChange={(e) => setForm({ ...form, refundMethod: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100">
                <option value="original">Original Payment</option>
                <option value="store_credit">Store Credit</option>
                <option value="exchange">Exchange</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Return Lines</h2>
            <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              <Plus className="w-3 h-3" /> Add Line
            </button>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Product ID</label>}
                <input value={line.productId} onChange={(e) => updateLine(i, 'productId', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100" />
              </div>
              <div className="col-span-2">
                {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Qty</label>}
                <input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100" />
              </div>
              <div className="col-span-2">
                {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Condition</label>}
                <select value={line.condition} onChange={(e) => updateLine(i, 'condition', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100">
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                  <option value="opened">Opened</option>
                </select>
              </div>
              <div className="col-span-3">
                {i === 0 && <label className="block text-xs text-zinc-400 mb-1">Disposition</label>}
                <select value={line.disposition} onChange={(e) => updateLine(i, 'disposition', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100">
                  <option value="restock">Restock</option>
                  <option value="destroy">Destroy</option>
                  <option value="liquidate">Liquidate</option>
                  <option value="return_to_vendor">Return to Vendor</option>
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

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Creating...' : 'Create Return'}
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

export default function NewReturnPage() {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-400">Loading...</div>}>
      <NewReturnForm />
    </Suspense>
  )
}
