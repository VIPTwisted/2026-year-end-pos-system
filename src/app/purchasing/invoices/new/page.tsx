'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

type Vendor = { id: string; vendorCode: string; name: string; paymentTerms?: string | null }
type LineRow = { description: string; qty: number; unitPrice: number; taxAmount: number; lineAmount: number }

export default function NewPurchaseInvoicePage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [vendorId, setVendorId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState('')
  const [postingDate, setPostingDate] = useState(new Date().toISOString().slice(0, 10))
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('')
  const [notes, setNotes] = useState('')

  const [lines, setLines] = useState<LineRow[]>([
    { description: '', qty: 1, unitPrice: 0, taxAmount: 0, lineAmount: 0 },
  ])

  useEffect(() => {
    fetch('/api/purchasing/vendors').then(r => r.json()).then(setVendors).catch(() => {})
  }, [])

  function updateLine(idx: number, field: keyof LineRow, value: string | number) {
    setLines(prev => {
      const next = [...prev]
      const row = { ...next[idx], [field]: value }
      row.lineAmount = Number(row.qty) * Number(row.unitPrice)
      next[idx] = row
      return next
    })
  }

  const subtotal = lines.reduce((s, l) => s + l.lineAmount, 0)
  const totalTax  = lines.reduce((s, l) => s + Number(l.taxAmount), 0)
  const total = subtotal + totalTax

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vendorId) { setError('Select a vendor'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/purchasing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId, invoiceDate, dueDate, postingDate, vendorInvoiceNo, notes,
          subtotal, taxAmount: totalTax, totalAmount: total,
          lines: lines.filter(l => l.description).map(l => ({
            description: l.description,
            quantity: l.qty,
            unitPrice: l.unitPrice,
            taxAmount: l.taxAmount,
            lineAmount: l.lineAmount,
          })),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      const inv = await res.json()
      router.push(`/purchasing/invoices/${inv.id}`)
    } catch (err) {
      setError(String(err)); setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="New Purchase Invoice"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
          { label: 'Purchase Invoices', href: '/purchasing/invoices' },
        ]}
      />
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button onClick={handleSubmit} disabled={saving} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={handleSubmit} disabled={saving} className="px-3 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium disabled:opacity-50">
          Post
        </button>
        <Link href="/purchasing/invoices"><button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Discard</button></Link>
        {error && <span className="ml-4 text-xs text-red-400">{error}</span>}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-5xl">
        <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">General</summary>
          <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-xs text-zinc-400 mb-1">Buy-from Vendor <span className="text-red-400">*</span></label>
              <select value={vendorId} onChange={e => setVendorId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200">
                <option value="">— Select vendor —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorCode} – {v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Posting Date</label>
              <input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Vendor Invoice No.</label>
              <input type="text" value={vendorInvoiceNo} onChange={e => setVendorInvoiceNo(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200" />
            </div>
            <div className="col-span-2 lg:col-span-3">
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 resize-none" />
            </div>
          </div>
        </details>

        <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Lines</summary>
          <div className="px-4 pb-4">
            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide">
                  <th className="text-left pb-2 pr-2 font-medium">Description</th>
                  <th className="text-right pb-2 pr-2 font-medium w-20">Qty</th>
                  <th className="text-right pb-2 pr-2 font-medium w-28">Unit Price</th>
                  <th className="text-right pb-2 pr-2 font-medium w-24">Tax Amount</th>
                  <th className="text-right pb-2 pr-2 font-medium w-28">Line Amount</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 pr-2"><input type="text" value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} placeholder="Description" className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200" /></td>
                    <td className="py-1.5 pr-2"><input type="number" min="0" step="1" value={line.qty} onChange={e => updateLine(idx, 'qty', Number(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 text-right" /></td>
                    <td className="py-1.5 pr-2"><input type="number" min="0" step="0.01" value={line.unitPrice} onChange={e => updateLine(idx, 'unitPrice', Number(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 text-right" /></td>
                    <td className="py-1.5 pr-2"><input type="number" min="0" step="0.01" value={line.taxAmount} onChange={e => updateLine(idx, 'taxAmount', Number(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 text-right" /></td>
                    <td className="py-1.5 pr-2 text-right text-emerald-400 font-semibold tabular-nums text-xs">{line.lineAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td className="py-1.5"><button type="button" onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={() => setLines(prev => [...prev, { description: '', qty: 1, unitPrice: 0, taxAmount: 0, lineAmount: 0 }])} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Tax Amount</span>
                  <span className="tabular-nums">{totalTax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-100 border-t border-zinc-700 pt-1.5">
                  <span>Total Amount</span>
                  <span className="text-emerald-400 tabular-nums">{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>
            </div>
          </div>
        </details>
      </form>
    </div>
  )
}
