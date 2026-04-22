'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

type Vendor = { id: string; vendorCode: string; name: string; paymentTerms?: string | null }
type LineRow = {
  type: string
  no: string
  description: string
  qty: number
  unitCost: number
  discountPct: number
  amount: number
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [vendorId, setVendorId] = useState('')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10))
  const [expectedDate, setExpectedDate] = useState('')
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('')
  const [purchaser, setPurchaser] = useState('')
  const [shipToLocation, setShipToLocation] = useState('')
  const [notes, setNotes] = useState('')

  const [lines, setLines] = useState<LineRow[]>([
    { type: 'Item', no: '', description: '', qty: 1, unitCost: 0, discountPct: 0, amount: 0 },
  ])

  useEffect(() => {
    fetch('/api/purchasing/vendors').then(r => r.json()).then(setVendors).catch(() => {})
  }, [])

  function updateLine(idx: number, field: keyof LineRow, value: string | number) {
    setLines(prev => {
      const next = [...prev]
      const row = { ...next[idx], [field]: value }
      const disc = field === 'discountPct' ? Number(value) : row.discountPct
      const qty  = field === 'qty'         ? Number(value) : row.qty
      const cost = field === 'unitCost'    ? Number(value) : row.unitCost
      row.amount = qty * cost * (1 - disc / 100)
      next[idx] = row
      return next
    })
  }

  function addLine() {
    setLines(prev => [...prev, { type: 'Item', no: '', description: '', qty: 1, unitCost: 0, discountPct: 0, amount: 0 }])
  }

  function removeLine(idx: number) {
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vendorId) { setError('Select a vendor'); return }
    if (lines.every(l => !l.description)) { setError('Add at least one line item'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/purchasing/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId, orderDate, expectedDate, vendorInvoiceNo, purchaser,
          shipToLocation, notes,
          lines: lines.filter(l => l.description).map(l => ({
            productName: l.description,
            sku: l.no,
            qtyOrdered: l.qty,
            unitCost: l.unitCost,
            lineTotal: l.amount,
          })),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to create PO')
      }
      const po = await res.json()
      router.push(`/purchasing/orders/${po.id}`)
    } catch (err) {
      setError(String(err))
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="New Purchase Order"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
          { label: 'Purchase Orders', href: '/purchasing/orders' },
        ]}
      />

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <Link href="/purchasing/orders">
          <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">
            Discard
          </button>
        </Link>
        {error && <span className="ml-4 text-xs text-red-400">{error}</span>}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-5xl">

        {/* General FastTab */}
        <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">General</summary>
          <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-xs text-zinc-400 mb-1">Buy-from Vendor <span className="text-red-400">*</span></label>
              <select
                value={vendorId}
                onChange={e => setVendorId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200"
              >
                <option value="">— Select vendor —</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.vendorCode} – {v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Order Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Expected Receipt Date</label>
              <input
                type="date"
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Vendor Invoice No.</label>
              <input
                type="text"
                value={vendorInvoiceNo}
                onChange={e => setVendorInvoiceNo(e.target.value)}
                placeholder="Vendor's reference number"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Purchaser</label>
              <input
                type="text"
                value={purchaser}
                onChange={e => setPurchaser(e.target.value)}
                placeholder="Purchaser name"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200"
              />
            </div>
          </div>
        </details>

        {/* Shipping FastTab */}
        <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Shipping</summary>
          <div className="px-4 pb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Ship-to Location</label>
              <input
                type="text"
                value={shipToLocation}
                onChange={e => setShipToLocation(e.target.value)}
                placeholder="Warehouse / location code"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 resize-none"
              />
            </div>
          </div>
        </details>

        {/* Lines FastTab */}
        <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Lines</summary>
          <div className="px-4 pb-4">
            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                  <th className="text-left pb-2 pr-2 font-medium w-24">Type</th>
                  <th className="text-left pb-2 pr-2 font-medium w-28">No.</th>
                  <th className="text-left pb-2 pr-2 font-medium">Description</th>
                  <th className="text-right pb-2 pr-2 font-medium w-20">Qty</th>
                  <th className="text-right pb-2 pr-2 font-medium w-28">Direct Unit Cost</th>
                  <th className="text-right pb-2 pr-2 font-medium w-20">Disc.%</th>
                  <th className="text-right pb-2 pr-2 font-medium w-28">Amount</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 pr-2">
                      <select
                        value={line.type}
                        onChange={e => updateLine(idx, 'type', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200"
                      >
                        <option>Item</option>
                        <option>G/L Account</option>
                        <option>Fixed Asset</option>
                        <option>Charge</option>
                      </select>
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={line.no}
                        onChange={e => updateLine(idx, 'no', e.target.value)}
                        placeholder="Item No."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={e => updateLine(idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={line.qty}
                        onChange={e => updateLine(idx, 'qty', Number(e.target.value))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 text-right"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitCost}
                        onChange={e => updateLine(idx, 'unitCost', Number(e.target.value))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 text-right"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={line.discountPct}
                        onChange={e => updateLine(idx, 'discountPct', Number(e.target.value))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 text-right"
                      />
                    </td>
                    <td className="py-1.5 pr-2 text-right text-emerald-400 font-semibold tabular-nums text-xs">
                      {line.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td className="py-1.5">
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-100 border-t border-zinc-700 pt-1.5">
                  <span>Total Amount</span>
                  <span className="text-emerald-400 tabular-nums">{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>
            </div>
          </div>
        </details>

      </form>
    </div>
  )
}
