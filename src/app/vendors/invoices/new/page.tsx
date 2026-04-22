'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  vendorCode: string
}

interface LineItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
  taxAmount: string
  accountCode: string
}

function newLine(): LineItem {
  return {
    id: Math.random().toString(36).slice(2),
    description: '',
    quantity: '1',
    unitPrice: '0.00',
    taxAmount: '0.00',
    accountCode: '',
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function NewVendorInvoicePage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorId, setVendorId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [postingDate, setPostingDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineItem[]>([newLine()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/vendors')
      .then(r => r.json())
      .then(data => setVendors(Array.isArray(data) ? data : []))
      .catch(() => setVendors([]))
  }, [])

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, [field]: value } : l)))
  }, [])

  const removeLine = useCallback((id: string) => {
    setLines(prev => (prev.length > 1 ? prev.filter(l => l.id !== id) : prev))
  }, [])

  const lineAmount = (l: LineItem) =>
    (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0)

  const subtotal = lines.reduce((s, l) => s + lineAmount(l), 0)
  const totalTax = lines.reduce((s, l) => s + (parseFloat(l.taxAmount) || 0), 0)
  const total = subtotal + totalTax

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vendorId) { setError('Select a vendor.'); return }
    if (lines.every(l => !l.description.trim())) { setError('Add at least one line item.'); return }
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/vendors/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          invoiceDate,
          dueDate,
          postingDate,
          notes: notes.trim() || undefined,
          lines: lines
            .filter(l => l.description.trim())
            .map(l => ({
              description: l.description,
              quantity: parseFloat(l.quantity) || 1,
              unitPrice: parseFloat(l.unitPrice) || 0,
              lineAmount: lineAmount(l),
              taxAmount: parseFloat(l.taxAmount) || 0,
              accountCode: l.accountCode.trim() || undefined,
            })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create invoice.')
        setSaving(false)
        return
      }

      router.push('/vendors/invoices')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Vendor Invoice" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh] space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/vendors/invoices"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Vendor Invoices
            </Link>
            <h2 className="text-lg font-semibold text-zinc-100">Create Vendor Invoice</h2>
            <p className="text-sm text-zinc-500">Enter vendor, dates, and line items</p>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save Draft'}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Header Fields */}
        <Card className="bg-[#16213e] border border-zinc-800/50">
          <CardContent className="pt-5 pb-5 grid grid-cols-2 gap-6">

            <div className="col-span-2 md:col-span-1">
              <label className={labelCls}>Vendor <span className="text-red-400">*</span></label>
              <select
                value={vendorId}
                onChange={e => setVendorId(e.target.value)}
                className={inputCls}
              >
                <option value="">— Select Vendor —</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    [{v.vendorCode}] {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Invoice Date <span className="text-red-400">*</span></label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Due Date <span className="text-red-400">*</span></label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Posting Date</label>
              <input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} className={inputCls} />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional internal notes..."
                className={inputCls + ' resize-none'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="bg-[#16213e] border border-zinc-800/50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Line Items</h3>
              <Button variant="outline" size="sm" onClick={() => setLines(p => [...p, newLine()])}>
                <Plus className="w-3 h-3 mr-1" />Add Line
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium w-[35%]">Description</th>
                    <th className="text-left pb-3 font-medium w-[12%]">Account</th>
                    <th className="text-right pb-3 font-medium w-[8%]">Qty</th>
                    <th className="text-right pb-3 font-medium w-[13%]">Unit Price</th>
                    <th className="text-right pb-3 font-medium w-[12%]">Tax ($)</th>
                    <th className="text-right pb-3 font-medium w-[13%]">Line Amount</th>
                    <th className="text-right pb-3 font-medium w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {lines.map(line => (
                    <tr key={line.id}>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={e => updateLine(line.id, 'description', e.target.value)}
                          placeholder="Item description..."
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={line.accountCode}
                          onChange={e => updateLine(line.id, 'accountCode', e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={e => updateLine(line.id, 'quantity', e.target.value)}
                          min="0"
                          step="1"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={e => updateLine(line.id, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={line.taxAmount}
                          onChange={e => updateLine(line.id, 'taxAmount', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-2 text-right text-emerald-400 font-semibold font-mono text-xs">
                        {fmt(lineAmount(line))}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2 border-t border-zinc-800 pt-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Tax</span>
                  <span className="font-mono">{fmt(totalTax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-100 border-t border-zinc-700 pt-2 mt-2">
                  <span>Total</span>
                  <span className="font-mono text-emerald-400">{fmt(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pb-4">
          <Link href="/vendors/invoices">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save Draft'}
          </Button>
        </div>

      </main>
    </>
  )
}
