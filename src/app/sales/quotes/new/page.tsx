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
  discountPct: number
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
  return { id: crypto.randomUUID(), lineType: 'Item', itemNo: '', description: '', quantity: 1, unitPrice: 0, discountPct: 0, lineTotal: 0 }
}

export default function NewSalesQuotePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [header, setHeader] = useState({
    sellToCustomerName: '',
    postingDate: new Date().toISOString().split('T')[0],
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    externalDocNo: '',
    salespersonCode: '',
    status: 'Open',
  })

  const [shipping, setShipping] = useState({
    shipToName: '',
    shipToAddress: '',
    shippingAgentCode: '',
  })

  const [billing, setBilling] = useState({
    billToCustomerName: '',
  })

  const [lines, setLines] = useState<LineItem[]>([newLine()])

  function updateLine(id: string, field: keyof LineItem, value: string | number) {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l
      const updated = { ...l, [field]: value }
      updated.lineTotal = updated.quantity * updated.unitPrice * (1 - updated.discountPct / 100)
      return updated
    }))
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const taxAmount = subtotal * 0.0825
  const total = subtotal + taxAmount

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/sales/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...header,
          ...shipping,
          ...billing,
          subtotal,
          taxAmount,
          total,
          quoteNumber: `SQ-${Date.now()}`,
          lines: lines.map(({ id: _id, ...rest }) => rest),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/sales/quotes/${data.id}`)
    } catch {
      alert('Failed to create sales quote.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      {/* TopBar */}
      <div className="border-b border-zinc-800 bg-[#0f0f1a] px-6 py-3 flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/sales" className="hover:text-zinc-200">Sales</Link>
        <span>/</span>
        <Link href="/sales/quotes" className="hover:text-zinc-200">Sales Quotes</Link>
        <span>/</span>
        <span className="text-zinc-200">New</span>
      </div>

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-6 py-3 flex items-center gap-2">
        <Link href="/sales/quotes" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-xs font-medium text-white transition-colors">
          <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
        </button>
        <div className="h-4 w-px bg-zinc-700 mx-1" />
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">Open</span>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <FastTab title="General">
          <Field label="Sell-to Customer Name">
            <input value={header.sellToCustomerName} onChange={e => setHeader(p => ({ ...p, sellToCustomerName: e.target.value }))} className={inputCls} placeholder="Customer name" />
          </Field>
          <Field label="Quote Date">
            <input type="date" value={header.quoteDate} onChange={e => setHeader(p => ({ ...p, quoteDate: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Posting Date">
            <input type="date" value={header.postingDate} onChange={e => setHeader(p => ({ ...p, postingDate: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Valid Until">
            <input type="date" value={header.validUntil} onChange={e => setHeader(p => ({ ...p, validUntil: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="External Document No.">
            <input value={header.externalDocNo} onChange={e => setHeader(p => ({ ...p, externalDocNo: e.target.value }))} className={inputCls} placeholder="External doc no." />
          </Field>
          <Field label="Salesperson Code">
            <input value={header.salespersonCode} onChange={e => setHeader(p => ({ ...p, salespersonCode: e.target.value }))} className={inputCls} placeholder="Salesperson code" />
          </Field>
        </FastTab>

        <FastTab title="Shipping" defaultOpen={false}>
          <Field label="Ship-to Name">
            <input value={shipping.shipToName} onChange={e => setShipping(p => ({ ...p, shipToName: e.target.value }))} className={inputCls} placeholder="Ship-to name" />
          </Field>
          <Field label="Shipping Agent Code">
            <input value={shipping.shippingAgentCode} onChange={e => setShipping(p => ({ ...p, shippingAgentCode: e.target.value }))} className={inputCls} placeholder="Agent code" />
          </Field>
          <Field label="Address">
            <input value={shipping.shipToAddress} onChange={e => setShipping(p => ({ ...p, shipToAddress: e.target.value }))} className={inputCls} placeholder="Address" />
          </Field>
        </FastTab>

        <FastTab title="Billing" defaultOpen={false}>
          <Field label="Bill-to Customer Name">
            <input value={billing.billToCustomerName} onChange={e => setBilling(p => ({ ...p, billToCustomerName: e.target.value }))} className={inputCls} placeholder="Same as sell-to" />
          </Field>
        </FastTab>

        {/* Lines */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200">Lines</span>
            <button onClick={() => setLines(p => [...p, newLine()])} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0f1829]">
                  <th className="text-left px-3 py-2 text-zinc-500 font-medium w-32">Type</th>
                  <th className="text-left px-3 py-2 text-zinc-500 font-medium w-28">No.</th>
                  <th className="text-left px-3 py-2 text-zinc-500 font-medium">Description</th>
                  <th className="text-right px-3 py-2 text-zinc-500 font-medium w-20">Qty</th>
                  <th className="text-right px-3 py-2 text-zinc-500 font-medium w-28">Unit Price</th>
                  <th className="text-right px-3 py-2 text-zinc-500 font-medium w-20">Disc %</th>
                  <th className="text-right px-3 py-2 text-zinc-500 font-medium w-28">Amount</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {lines.map(line => (
                  <tr key={line.id} className="hover:bg-zinc-800/20">
                    <td className="px-3 py-2">
                      <select value={line.lineType} onChange={e => updateLine(line.id, 'lineType', e.target.value)}
                        className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500">
                        {LINE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input value={line.itemNo} onChange={e => updateLine(line.id, 'itemNo', e.target.value)}
                        className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500" placeholder="Item no." />
                    </td>
                    <td className="px-3 py-2">
                      <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)}
                        className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500" placeholder="Description" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={line.quantity} onChange={e => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={line.unitPrice} onChange={e => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={line.discountPct} onChange={e => updateLine(line.id, 'discountPct', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0f0f1a] border border-zinc-700 rounded px-2 py-1 text-xs text-right text-zinc-200 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2 text-right text-zinc-200 font-mono">{line.lineTotal.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => setLines(p => p.filter(l => l.id !== line.id))} className="text-zinc-600 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-zinc-800 px-4 py-3 flex justify-end">
            <div className="w-56 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-400"><span>Tax (8.25%)</span><span className="font-mono">${taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-200 font-semibold text-sm border-t border-zinc-700 pt-1">
                <span>Total</span><span className="font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
