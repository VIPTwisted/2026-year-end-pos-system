'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

type TransferLine = { productName: string; sku: string; requestedQty: number }

export default function NewTransferPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fromLocation: '', toLocation: '', priority: 'normal', requestedBy: '' })
  const [lines, setLines] = useState<TransferLine[]>([{ productName: '', sku: '', requestedQty: 1 }])
  const [submitting, setSubmitting] = useState(false)

  const addLine = () => setLines(l => [...l, { productName: '', sku: '', requestedQty: 1 }])
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: keyof TransferLine, val: string | number) =>
    setLines(l => l.map((line, idx) => idx === i ? { ...line, [field]: val } : line))

  const submit = async () => {
    setSubmitting(true)
    const res = await fetch('/api/inventory/outbound-transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lines }),
    })
    if (res.ok) router.push('/inventory-ops/transfers')
    else setSubmitting(false)
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory-ops/transfers" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-zinc-100">New Transfer</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300">Transfer Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">From Location</label>
            <input value={form.fromLocation} onChange={e => setForm(p => ({ ...p, fromLocation: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">To Location</label>
            <input value={form.toLocation} onChange={e => setForm(p => ({ ...p, toLocation: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Requested By</label>
            <input value={form.requestedBy} onChange={e => setForm(p => ({ ...p, requestedBy: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">Line Items</h2>
          <button onClick={addLine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Line</button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 px-1">
            <div className="col-span-6">Product Name</div>
            <div className="col-span-3">SKU</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-1"></div>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input placeholder="Product name" value={line.productName}
                onChange={e => updateLine(i, 'productName', e.target.value)}
                className="col-span-6 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <input placeholder="SKU" value={line.sku}
                onChange={e => updateLine(i, 'sku', e.target.value)}
                className="col-span-3 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <input type="number" value={line.requestedQty}
                onChange={e => updateLine(i, 'requestedQty', parseInt(e.target.value) || 0)}
                className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <button onClick={() => removeLine(i)} className="col-span-1 text-red-500 hover:text-red-400 flex justify-center"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link href="/inventory-ops/transfers" className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</Link>
        <button onClick={submit} disabled={submitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
          {submitting ? 'Creating...' : 'Create Transfer'}
        </button>
      </div>
    </div>
  )
}
