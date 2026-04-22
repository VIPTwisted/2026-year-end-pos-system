'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type LineItem = {
  id: string
  lineType: string
  itemNo: string
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

function FastTab({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 flex items-center justify-between list-none">
        {title} <ChevronDown className="w-4 h-4 text-zinc-500" />
      </summary>
      <div className="px-4 pb-4 grid grid-cols-2 gap-4">{children}</div>
    </details>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-[#0f0f1a] border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600'
const LINE_TYPES = ['Item', 'G/L Account', 'Resource', 'Comment']

function newLine(): LineItem {
  return { id: crypto.randomUUID(), lineType: 'Item', itemNo: '', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
}

export default function NewReturnOrderPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [lines, setLines] = useState<LineItem[]>([newLine()])
  const [form, setForm] = useState({
    sellToCustomerName: '',
    returnDate: new Date().toISOString().slice(0, 10),
    postingDate: new Date().toISOString().slice(0, 10),
    externalDocNo: '',
    salespersonCode: '',
    reasonCode: '',
    applyToDocType: 'Invoice',
    applyToDocNo: '',
    // Ship-to
    shipToName: '',
    shipToAddress: '',
    notes: '',
  })

  function setField(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function updateLine(id: string, k: keyof LineItem, v: string | number) {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l
      const updated = { ...l, [k]: v }
      if (k === 'quantity' || k === 'unitPrice') {
        updated.lineTotal = Number(updated.quantity) * Number(updated.unitPrice)
      }
      return updated
    }))
  }

  function removeLine(id: string) {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)

  async function save() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        returnDate: form.returnDate ? new Date(form.returnDate) : new Date(),
        postingDate: form.postingDate ? new Date(form.postingDate) : new Date(),
        subtotal,
        totalAmount: subtotal,
        status: 'Open',
        lines: lines.map(l => ({
          lineType: l.lineType,
          itemNo: l.itemNo,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
        })),
      }
      const res = await fetch('/api/sales/return-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push('/sales/return-orders')
    } catch (e) {
      alert(`Error: ${e}`)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      {/* TopBar */}
      <div className="border-b border-zinc-800 bg-[#0f0f1a] px-6 py-3 flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/sales/return-orders" className="hover:text-zinc-200 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Return Orders
        </Link>
        <span>/</span>
        <span className="text-zinc-200">New Return Order</span>
      </div>

      {/* Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-6 py-3">
        <h1 className="text-base font-semibold text-zinc-100 mb-3">New Sales Return Order</h1>
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-xs font-medium text-white transition-colors">
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
          </button>
          <Link href="/sales/return-orders"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            Discard
          </Link>
          <button disabled
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] rounded text-xs font-medium text-zinc-500 opacity-40 cursor-not-allowed">
            Release
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4 max-w-5xl">
        {/* General */}
        <FastTab title="General">
          <Field label="Sell-to Customer Name">
            <input value={form.sellToCustomerName} onChange={e => setField('sellToCustomerName', e.target.value)}
              placeholder="Customer name..." className={inputCls} />
          </Field>
          <Field label="Return Date">
            <input type="date" value={form.returnDate} onChange={e => setField('returnDate', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Posting Date">
            <input type="date" value={form.postingDate} onChange={e => setField('postingDate', e.target.value)} className={inputCls} />
          </Field>
          <Field label="External Doc. No.">
            <input value={form.externalDocNo} onChange={e => setField('externalDocNo', e.target.value)}
              placeholder="External reference..." className={inputCls} />
          </Field>
          <Field label="Salesperson Code">
            <input value={form.salespersonCode} onChange={e => setField('salespersonCode', e.target.value)}
              placeholder="SP code..." className={inputCls} />
          </Field>
          <Field label="Reason Code">
            <input value={form.reasonCode} onChange={e => setField('reasonCode', e.target.value)}
              placeholder="Return reason..." className={inputCls} />
          </Field>
        </FastTab>

        {/* Apply-to */}
        <FastTab title="Return Reason" defaultOpen={true}>
          <Field label="Applies-to Doc. Type">
            <select value={form.applyToDocType} onChange={e => setField('applyToDocType', e.target.value)}
              className={inputCls}>
              <option>Invoice</option>
              <option>Credit Memo</option>
              <option>Order</option>
            </select>
          </Field>
          <Field label="Applies-to Doc. No.">
            <input value={form.applyToDocNo} onChange={e => setField('applyToDocNo', e.target.value)}
              placeholder="Doc number..." className={inputCls} />
          </Field>
        </FastTab>

        {/* Shipping */}
        <FastTab title="Shipping" defaultOpen={false}>
          <Field label="Ship-to Name">
            <input value={form.shipToName} onChange={e => setField('shipToName', e.target.value)}
              placeholder="Ship-to name..." className={inputCls} />
          </Field>
          <Field label="Ship-to Address">
            <input value={form.shipToAddress} onChange={e => setField('shipToAddress', e.target.value)}
              placeholder="Ship-to address..." className={inputCls} />
          </Field>
        </FastTab>

        {/* Notes */}
        <FastTab title="Notes" defaultOpen={false}>
          <div className="col-span-2">
            <textarea value={form.notes} onChange={e => setField('notes', e.target.value)}
              rows={3} placeholder="Internal notes..."
              className={`${inputCls} resize-none`} />
          </div>
        </FastTab>

        {/* Lines */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200">Return Lines</span>
            <button onClick={() => setLines(p => [...p, newLine()])}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-xs text-blue-300 transition-colors">
              <Plus className="w-3 h-3" /> Add Line
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0f1829]">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-28">Type</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-28">No.</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Description</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-24">Qty</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-28">Unit Price</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide w-28">Line Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {lines.map(l => (
                  <tr key={l.id} className="group">
                    <td className="px-2 py-1.5">
                      <select value={l.lineType} onChange={e => updateLine(l.id, 'lineType', e.target.value)}
                        className="w-full bg-transparent border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500">
                        {LINE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={l.itemNo} onChange={e => updateLine(l.id, 'itemNo', e.target.value)}
                        placeholder="Item no." className="w-full bg-transparent border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={l.description} onChange={e => updateLine(l.id, 'description', e.target.value)}
                        placeholder="Description..." className="w-full bg-transparent border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" value={l.quantity} min={0} onChange={e => updateLine(l.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border border-zinc-700 rounded px-1.5 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" value={l.unitPrice} min={0} step="0.01" onChange={e => updateLine(l.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border border-zinc-700 rounded px-1.5 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs text-zinc-300">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(l.lineTotal)}
                    </td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => removeLine(l.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700/50 bg-[#0f1829]">
                  <td colSpan={5} className="px-4 py-2 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wide">Total</td>
                  <td className="px-4 py-2 text-right font-mono text-sm font-semibold text-zinc-100">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
