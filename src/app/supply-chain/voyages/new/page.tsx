'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Ship, Plus, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CostLine {
  costType: string
  description: string
  amount: string
  allocationMethod: string
}

const COST_TYPES = ['freight', 'customs', 'insurance', 'handling', 'other']
const ALLOC_METHODS = [
  { value: 'by_value', label: 'By Value' },
  { value: 'by_qty', label: 'By Qty' },
  { value: 'by_cbm', label: 'By CBM' },
  { value: 'equally', label: 'Equally' },
]

export default function NewVoyagePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    voyageNo: '',
    description: '',
    vendorNo: '',
    shipDate: '',
    estimatedArrival: '',
    currency: 'USD',
  })
  const [lines, setLines] = useState<CostLine[]>([
    { costType: 'freight', description: '', amount: '', allocationMethod: 'by_value' },
  ])

  function setField(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function setLine(i: number, k: keyof CostLine, v: string) {
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l))
  }

  function addLine() {
    setLines(ls => [...ls, { costType: 'freight', description: '', amount: '', allocationMethod: 'by_value' }])
  }

  function removeLine(i: number) {
    setLines(ls => ls.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/supply-chain/voyages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lines }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/supply-chain/voyages/${data.id}`)
    } catch {
      alert('Failed to create voyage')
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60'
  const labelCls = 'block text-[11px] uppercase tracking-wide text-zinc-500 mb-1'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Voyage" />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">

        <div className="flex items-center gap-2">
          <Ship className="w-4 h-4 text-zinc-400" />
          <h1 className="text-sm font-semibold text-zinc-200">New Landed Cost Voyage</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Voyage No. *</label>
                <input className={inputCls} value={form.voyageNo} onChange={e => setField('voyageNo', e.target.value)} placeholder="VOY-0001" required />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input className={inputCls} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Voyage description" />
              </div>
              <div>
                <label className={labelCls}>Vendor No.</label>
                <input className={inputCls} value={form.vendorNo} onChange={e => setField('vendorNo', e.target.value)} placeholder="V-001" />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select className={inputCls} value={form.currency} onChange={e => setField('currency', e.target.value)}>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>CNY</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Ship Date</label>
                <input type="date" className={inputCls} value={form.shipDate} onChange={e => setField('shipDate', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Estimated Arrival</label>
                <input type="date" className={inputCls} value={form.estimatedArrival} onChange={e => setField('estimatedArrival', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Cost Lines FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Cost Lines</h2>
              <button type="button" onClick={addLine} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30">
                  {['Cost Type', 'Description', 'Amount', 'Allocation Method', ''].map(h => (
                    <th key={h} className="text-left px-2 py-1.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-b border-zinc-800/20">
                    <td className="px-2 py-1.5">
                      <select className={inputCls} value={line.costType} onChange={e => setLine(i, 'costType', e.target.value)}>
                        {COST_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input className={inputCls} value={line.description} onChange={e => setLine(i, 'description', e.target.value)} placeholder="Description" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" step="0.01" className={inputCls} value={line.amount} onChange={e => setLine(i, 'amount', e.target.value)} placeholder="0.00" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select className={inputCls} value={line.allocationMethod} onChange={e => setLine(i, 'allocationMethod', e.target.value)}>
                        {ALLOC_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <button type="button" onClick={() => removeLine(i)} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Voyage'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
