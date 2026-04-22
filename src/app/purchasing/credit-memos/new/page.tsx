'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

type Vendor = { id: string; vendorCode: string; name: string }
type LineRow = { description: string; qty: number; unitPrice: number; lineAmount: number }

export default function NewCreditMemoPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [vendorId, setVendorId] = useState('')
  const [memoDate, setMemoDate] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [lines, setLines] = useState<LineRow[]>([
    { description: '', qty: 1, unitPrice: 0, lineAmount: 0 },
  ])

  useEffect(() => {
    fetch('/api/purchasing/vendors').then(r => r.json()).then(setVendors).catch(() => {})
  }, [])

  function updateLine(idx: number, field: keyof LineRow, value: string | number) {
    setLines(prev => {
      const next = [...prev]
      const row = { ...next[idx], [field]: value }
      row.lineAmount = -(Math.abs(Number(row.qty)) * Math.abs(Number(row.unitPrice)))
      next[idx] = row
      return next
    })
  }

  const total = lines.reduce((s, l) => s + l.lineAmount, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vendorId) { setError('Select a vendor'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/purchasing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId, invoiceDate: memoDate, dueDate: memoDate, postingDate: memoDate,
          vendorInvoiceNo: `CM-${Date.now()}`,
          notes: reason,
          subtotal: total, taxAmount: 0, totalAmount: total,
          lines: lines.filter(l => l.description).map(l => ({
            description: l.description, quantity: l.qty,
            unitPrice: -Math.abs(l.unitPrice), taxAmount: 0, lineAmount: l.lineAmount,
          })),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      const inv = await res.json()
      router.push(`/purchasing/invoices/${inv.id}`)
    } catch (err) { setError(String(err)); setSaving(false) }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title="New Purchase Credit Memo"
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
          { label: 'Credit Memos', href: '/purchasing/credit-memos' },
        ]}
      />
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button onClick={handleSubmit} disabled={saving} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <Link href="/purchasing/credit-memos"><button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Discard</button></Link>
        {error && <span className="ml-4 text-xs text-red-400">{error}</span>}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-4xl">
        <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">General</summary>
          <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-xs text-zinc-400 mb-1">Vendor <span className="text-red-400">*</span></label>
              <select value={vendorId} onChange={e => setVendorId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200">
                <option value="">— Select vendor —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorCode} – {v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Memo Date</label>
              <input type="date" value={memoDate} onChange={e => setMemoDate(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200" />
            </div>
            <div className="col-span-2 lg:col-span-3">
              <label className="block text-xs text-zinc-400 mb-1">Reason / Notes</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 resize-none" />
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
                  <th className="text-right pb-2 pr-2 font-medium w-28">Credit Amount</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 pr-2"><input type="text" value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} placeholder="Description" className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200" /></td>
                    <td className="py-1.5 pr-2"><input type="number" min="0" step="1" value={line.qty} onChange={e => updateLine(idx, 'qty', Number(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 text-right" /></td>
                    <td className="py-1.5 pr-2"><input type="number" min="0" step="0.01" value={line.unitPrice} onChange={e => updateLine(idx, 'unitPrice', Number(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 text-right" /></td>
                    <td className="py-1.5 pr-2 text-right text-red-400 font-semibold tabular-nums text-xs">{line.lineAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td className="py-1.5"><button type="button" onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={() => setLines(prev => [...prev, { description: '', qty: 1, unitPrice: 0, lineAmount: 0 }])} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
            <div className="mt-4 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between font-bold text-zinc-100 border-t border-zinc-700 pt-1.5 text-sm">
                  <span>Total Credit Amount</span>
                  <span className="text-red-400 tabular-nums">{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>
            </div>
          </div>
        </details>
      </form>
    </div>
  )
}
