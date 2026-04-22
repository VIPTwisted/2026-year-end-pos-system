'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

type Project  = { id: string; projectNo: string; description: string }
type Customer = { id: string; firstName: string; lastName: string }

type LineItem = {
  description: string
  quantity:    number
  rate:        number
  amount:      number
}

export default function NewProformaPage() {
  const router = useRouter()
  const [projects,  setProjects]  = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [saving,    setSaving]    = useState(false)

  const [form, setForm] = useState({
    projectId:   '',
    customerId:  '',
    invoiceDate: new Date().toISOString().split('T')[0],
    taxRate:     0,
    notes:       '',
  })

  const [lines, setLines] = useState<LineItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ])

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {})
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(() => {})
  }, [])

  function updateLine(i: number, field: keyof LineItem, val: string | number) {
    setLines(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: val }
      if (field === 'quantity' || field === 'rate') {
        next[i].amount = next[i].quantity * next[i].rate
      }
      return next
    })
  }

  function addLine() {
    setLines(prev => [...prev, { description: '', quantity: 1, rate: 0, amount: 0 }])
  }

  function removeLine(i: number) {
    setLines(prev => prev.filter((_, idx) => idx !== i))
  }

  const subtotal  = lines.reduce((s, l) => s + l.amount, 0)
  const taxAmount = subtotal * (form.taxRate / 100)
  const total     = subtotal + taxAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const invoiceNumber = `PF-${Date.now()}`
      const res = await fetch('/api/projects/invoicing/proforma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          projectId:   form.projectId,
          customerId:  form.customerId || null,
          invoiceDate: new Date(form.invoiceDate).toISOString(),
          subtotal,
          taxAmount,
          total,
          notes:       form.notes || null,
          linesJson:   JSON.stringify(lines),
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/projects/invoicing/proforma')
    } catch {
      alert('Failed to save proforma invoice.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Proforma Invoice" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5 max-w-4xl">

          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects / Invoicing / Proforma</p>
            <h2 className="text-[18px] font-semibold text-zinc-100">New Proforma Invoice</h2>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Project *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select project…</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectNo} — {p.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Customer</label>
                <select
                  value={form.customerId}
                  onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Invoice Date *</label>
                <input
                  type="date"
                  required
                  value={form.invoiceDate}
                  onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.taxRate}
                  onChange={e => setForm(f => ({ ...f, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Billing Lines */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-300">Billing Lines</h3>
              <button type="button" onClick={addLine} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs">
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left py-2 text-xs text-zinc-500">Description</th>
                  <th className="text-right py-2 text-xs text-zinc-500 w-20">Qty</th>
                  <th className="text-right py-2 text-xs text-zinc-500 w-28">Rate</th>
                  <th className="text-right py-2 text-xs text-zinc-500 w-28">Amount</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-b border-zinc-800/20">
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={e => updateLine(i, 'description', e.target.value)}
                        placeholder="Description…"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.quantity}
                        onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 text-right focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.rate}
                        onChange={e => updateLine(i, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 text-right focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 text-right text-zinc-300 font-mono text-xs">
                      ${line.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 pl-2">
                      {lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="pt-2 space-y-1 text-sm text-right border-t border-zinc-800/50">
              <div className="flex justify-end gap-8">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-300 font-mono w-28">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-zinc-500">Tax ({form.taxRate}%)</span>
                <span className="text-zinc-300 font-mono w-28">${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-end gap-8 pt-1 border-t border-zinc-700">
                <span className="text-zinc-200 font-semibold">Total</span>
                <span className="text-white font-bold font-mono w-28">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
            <label className="block text-xs text-zinc-500 mb-1">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Create Proforma Invoice'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/projects/invoicing/proforma')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
