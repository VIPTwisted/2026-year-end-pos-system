'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

interface PurchasePriceLine {
  productType: string
  productNo: string
  description: string
  unitOfMeasure: string
  minQty: number
  directUnitCost: number
  allowLineDisc: boolean
}

const EMPTY_LINE: PurchasePriceLine = {
  productType: 'Item',
  productNo: '',
  description: '',
  unitOfMeasure: 'each',
  minQty: 0,
  directUnitCost: 0,
  allowLineDisc: true,
}

const FIELD = 'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500'
const LABEL = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

export default function NewPurchasePriceListPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    code: '',
    description: '',
    assignToType: 'All Vendors',
    assignTo: '',
    currency: 'USD',
    startingDate: '',
    endingDate: '',
    status: 'Draft',
  })
  const [lines, setLines] = useState<PurchasePriceLine[]>([{ ...EMPTY_LINE }])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2600)
  }

  const updateLine = (i: number, k: keyof PurchasePriceLine, v: string | number | boolean) =>
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l))

  const save = async () => {
    if (!form.code) { notify('Code is required', 'err'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/purchase/price-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lines }),
      })
      if (!res.ok) throw new Error('Failed to create')
      const data = await res.json()
      notify('Price list created')
      setTimeout(() => router.push(`/purchase/price-lists`), 700)
    } catch (e) {
      notify(String(e), 'err')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Purchase Price List"
        breadcrumb={[{ label: 'Purchase', href: '/purchasing' }, { label: 'Price Lists', href: '/purchase/price-lists' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/purchase/price-lists" className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Cancel</Link>
            <button onClick={save} disabled={saving}
              className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
              {saving ? 'Saving…' : 'Create Price List'}
            </button>
          </div>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* General FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50"><h2 className="text-sm font-semibold text-zinc-100">General</h2></div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Code <span className="text-red-400">*</span></label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="PPL-001" className={FIELD} />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Description</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Vendor Cost List 2026" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={FIELD}>
                <option>Draft</option><option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Assign-to Type</label>
              <select value={form.assignToType} onChange={e => setForm(f => ({ ...f, assignToType: e.target.value }))} className={FIELD}>
                <option>All Vendors</option><option>Vendor</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Assign-to (Vendor No.)</label>
              <input type="text" value={form.assignTo} onChange={e => setForm(f => ({ ...f, assignTo: e.target.value }))} placeholder="V-001" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Currency</label>
              <input type="text" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} placeholder="USD" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Starting Date</label>
              <input type="date" value={form.startingDate} onChange={e => setForm(f => ({ ...f, startingDate: e.target.value }))} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Ending Date</label>
              <input type="date" value={form.endingDate} onChange={e => setForm(f => ({ ...f, endingDate: e.target.value }))} className={FIELD} />
            </div>
          </div>
        </div>

        {/* Lines FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Lines</h2>
            <button onClick={() => setLines(ls => [...ls, { ...EMPTY_LINE }])}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Product Type', 'Product No.', 'Description', 'Unit of Measure', 'Min. Qty', 'Direct Unit Cost', 'Allow Disc%', ''].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {lines.map((l, i) => (
                  <tr key={i} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="px-3 py-2">
                      <select value={l.productType} onChange={e => updateLine(i, 'productType', e.target.value)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                        <option>Item</option><option>Resource</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={l.productNo} onChange={e => updateLine(i, 'productNo', e.target.value)} placeholder="ITEM-001"
                        className="w-28 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={l.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Description"
                        className="w-40 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={l.unitOfMeasure} onChange={e => updateLine(i, 'unitOfMeasure', e.target.value)} placeholder="each"
                        className="w-20 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={l.minQty} onChange={e => updateLine(i, 'minQty', Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 text-right font-mono focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" min="0" value={l.directUnitCost} onChange={e => updateLine(i, 'directUnitCost', Number(e.target.value))}
                        className="w-28 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 text-right font-mono focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={l.allowLineDisc} onChange={e => updateLine(i, 'allowLineDisc', e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      {lines.length > 1 && (
                        <button onClick={() => setLines(ls => ls.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
