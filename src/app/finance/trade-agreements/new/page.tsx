'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save } from 'lucide-react'

const TYPES = [
  { value: 'SALES_PRICE', label: 'Sales Price' },
  { value: 'PURCHASE_PRICE', label: 'Purchase Price' },
  { value: 'LINE_DISCOUNT', label: 'Line Discount' },
  { value: 'MULTI_LINE_DISCOUNT', label: 'Multi-Line Discount' },
  { value: 'TOTAL_DISCOUNT', label: 'Total Discount' },
]

type Line = {
  productId: string
  categoryId: string
  quantityMin: number
  quantityMax: string
  unitOfMeasure: string
  amount: number
  pct: string
  fromDate: string
  toDate: string
}

const emptyLine = (): Line => ({
  productId: '',
  categoryId: '',
  quantityMin: 0,
  quantityMax: '',
  unitOfMeasure: 'EACH',
  amount: 0,
  pct: '',
  fromDate: '',
  toDate: '',
})

export default function NewTradeAgreementPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'SALES_PRICE',
    relation: 'all',
    customerId: '',
    vendorId: '',
    currencyCode: 'USD',
    isActive: true,
    startDate: '',
    endDate: '',
  })
  const [lines, setLines] = useState<Line[]>([emptyLine()])

  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))
  const updateLine = (idx: number, field: keyof Line, value: unknown) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        customerId: form.relation === 'customer' && form.customerId ? form.customerId : null,
        vendorId: form.relation === 'vendor' && form.vendorId ? form.vendorId : null,
      }

      const res = await fetch('/api/trade-agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const agreement = await res.json()

      // Create lines
      for (const line of lines) {
        if (!line.amount) continue
        await fetch(`/api/trade-agreements/${agreement.id}/lines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...line,
            productId: line.productId || null,
            categoryId: line.categoryId || null,
            quantityMax: line.quantityMax ? parseFloat(line.quantityMax) : null,
            pct: line.pct ? parseFloat(line.pct) : null,
            fromDate: line.fromDate ? new Date(line.fromDate).toISOString() : null,
            toDate: line.toDate ? new Date(line.toDate).toISOString() : null,
          }),
        })
      }

      router.push(`/finance/trade-agreements/${agreement.id}`)
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="New Trade Agreement" />
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Fields */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Agreement Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Code *</label>
                <input className={inp} required value={form.code} onChange={e => update('code', e.target.value)} placeholder="TA-001" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Currency</label>
                <input className={inp} value={form.currencyCode} onChange={e => update('currencyCode', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Description *</label>
                <input className={inp} required value={form.description} onChange={e => update('description', e.target.value)} placeholder="Agreement description" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Type *</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update('type', t.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.type === t.value
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Relation</label>
                <select className={inp} value={form.relation} onChange={e => update('relation', e.target.value)}>
                  <option value="all">All</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              {form.relation === 'customer' && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Customer ID</label>
                  <input className={inp} value={form.customerId} onChange={e => update('customerId', e.target.value)} placeholder="Customer ID" />
                </div>
              )}
              {form.relation === 'vendor' && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Vendor ID</label>
                  <input className={inp} value={form.vendorId} onChange={e => update('vendorId', e.target.value)} placeholder="Vendor ID" />
                </div>
              )}
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Start Date</label>
                <input type="date" className={inp} value={form.startDate} onChange={e => update('startDate', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">End Date</label>
                <input type="date" className={inp} value={form.endDate} onChange={e => update('endDate', e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={e => update('isActive', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-zinc-300">Active</label>
              </div>
            </div>
          </div>

          {/* Lines */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Agreement Lines</h2>
              <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => setLines(l => [...l, emptyLine()])}>
                <Plus className="w-3 h-3" /> Add Line
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-zinc-800">
                  <tr className="text-zinc-400">
                    {['Product ID', 'Min Qty', 'Max Qty', 'UOM', 'Amount', 'Disc %', 'From', 'To', ''].map(h => (
                      <th key={h} className="pb-2 px-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {lines.map((line, idx) => (
                    <tr key={idx}>
                      {(['productId', 'quantityMin', 'quantityMax', 'unitOfMeasure', 'amount', 'pct', 'fromDate', 'toDate'] as const).map(field => (
                        <td key={field} className="py-2 px-2">
                          <input
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                            type={['quantityMin', 'quantityMax', 'amount', 'pct'].includes(field) ? 'number' : field.includes('Date') ? 'date' : 'text'}
                            value={line[field] as string | number}
                            onChange={e => updateLine(idx, field, e.target.value)}
                            step="any"
                          />
                        </td>
                      ))}
                      <td className="py-2 px-2">
                        <button type="button" onClick={() => setLines(l => l.filter((_, i) => i !== idx))} className="text-zinc-500 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Agreement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
