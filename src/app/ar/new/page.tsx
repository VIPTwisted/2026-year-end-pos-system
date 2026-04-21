'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, Send } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  creditStatus: string
}

interface LineItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
  taxRate: string
}

function newLine(): LineItem {
  return {
    id: Math.random().toString(36).slice(2),
    description: '',
    quantity: '1',
    unitPrice: '0.00',
    taxRate: '0',
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function NewARInvoicePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [invoiceType, setInvoiceType] = useState<'sales' | 'free_text'>('sales')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [lines, setLines] = useState<LineItem[]>([newLine()])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => setCustomers(Array.isArray(data) ? data : data.customers ?? []))
      .catch(() => setCustomers([]))
  }, [])

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, [field]: value } : l)))
  }, [])

  const removeLine = useCallback((id: string) => {
    setLines(prev => (prev.length > 1 ? prev.filter(l => l.id !== id) : prev))
  }, [])

  const lineAmount = (l: LineItem) =>
    (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0)

  const lineTax = (l: LineItem) =>
    lineAmount(l) * ((parseFloat(l.taxRate) || 0) / 100)

  const subtotal = lines.reduce((s, l) => s + lineAmount(l), 0)
  const totalTax = lines.reduce((s, l) => s + lineTax(l), 0)
  const total = subtotal + totalTax

  async function submit(postAfter: boolean) {
    if (!customerId) { setError('Select a customer.'); return }
    if (lines.every(l => !l.description.trim())) { setError('Add at least one line item.'); return }
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/ar/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          invoiceType,
          invoiceDate,
          dueDate,
          notes: notes.trim() || undefined,
          lines: lines
            .filter(l => l.description.trim())
            .map(l => ({
              description: l.description,
              quantity: parseFloat(l.quantity) || 1,
              unitPrice: parseFloat(l.unitPrice) || 0,
              taxRate: parseFloat(l.taxRate) || 0,
            })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create invoice.')
        setSaving(false)
        return
      }

      const invoice = await res.json()

      if (postAfter) {
        await fetch(`/api/ar/invoices/${invoice.id}/post`, { method: 'POST' })
      }

      router.push('/ar')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Customer Invoice" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Create Invoice</h2>
            <p className="text-sm text-zinc-500">Fill in customer, dates, and line items</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => submit(false)} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />Save Draft
            </Button>
            <Button onClick={() => submit(true)} disabled={saving}>
              <Send className="w-4 h-4 mr-1" />Post Invoice
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Header Fields */}
        <Card>
          <CardContent className="pt-5 pb-5 grid grid-cols-2 gap-6">
            {/* Customer */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Customer *</label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— Select Customer —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}{c.email ? ` (${c.email})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Type */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Invoice Type</label>
              <div className="flex gap-4 mt-2">
                {(['sales', 'free_text'] as const).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="invoiceType"
                      value={t}
                      checked={invoiceType === t}
                      onChange={() => setInvoiceType(t)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-zinc-300 capitalize">
                      {t === 'free_text' ? 'Free Text' : 'Sales'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Invoice Date *</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional internal notes..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
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
                    <th className="text-left pb-3 font-medium w-[40%]">Description</th>
                    <th className="text-right pb-3 font-medium w-[10%]">Qty</th>
                    <th className="text-right pb-3 font-medium w-[15%]">Unit Price</th>
                    <th className="text-right pb-3 font-medium w-[10%]">Tax %</th>
                    <th className="text-right pb-3 font-medium w-[15%]">Line Amount</th>
                    <th className="text-right pb-3 font-medium w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {lines.map(line => (
                    <tr key={line.id}>
                      <td className="py-2 pr-3">
                        <input
                          type="text"
                          value={line.description}
                          onChange={e => updateLine(line.id, 'description', e.target.value)}
                          placeholder="Item description..."
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={e => updateLine(line.id, 'quantity', e.target.value)}
                          min="0"
                          step="1"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={e => updateLine(line.id, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          value={line.taxRate}
                          onChange={e => updateLine(line.id, 'taxRate', e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-3 text-right text-emerald-400 font-semibold font-mono text-xs">
                        {fmt(lineAmount(line))}
                      </td>
                      <td className="py-2 text-right">
                        <button
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

        {/* Actions footer */}
        <div className="flex justify-end gap-3 pb-4">
          <Button variant="outline" onClick={() => router.push('/ar')} disabled={saving}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => submit(false)} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button onClick={() => submit(true)} disabled={saving}>
            <Send className="w-4 h-4 mr-1" />{saving ? 'Posting…' : 'Post Invoice'}
          </Button>
        </div>

      </main>
    </>
  )
}
