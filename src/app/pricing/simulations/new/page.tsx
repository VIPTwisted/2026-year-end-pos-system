'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { TrendingUp, Plus, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SimLine {
  item: string
  originalPrice: string
  newPrice: string
}

export default function NewPriceSimulationPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    simulationNo: '',
    description: '',
    simulationType: 'what_if',
    priceList: '',
    dateFrom: '',
    dateTo: '',
  })
  const [lines, setLines] = useState<SimLine[]>([
    { item: '', originalPrice: '', newPrice: '' },
  ])

  function setField(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function setLine(i: number, k: keyof SimLine, v: string) {
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l))
  }

  function addLine() {
    setLines(ls => [...ls, { item: '', originalPrice: '', newPrice: '' }])
  }

  function removeLine(i: number) {
    setLines(ls => ls.filter((_, idx) => idx !== i))
  }

  function calcImpact(line: SimLine): string {
    const orig = parseFloat(line.originalPrice) || 0
    const newP = parseFloat(line.newPrice) || 0
    if (orig === 0) return '—'
    const pct = ((newP - orig) / orig) * 100
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/pricing/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lines }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/pricing/simulations/${data.id}`)
    } catch {
      alert('Failed to create simulation')
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60'
  const labelCls = 'block text-[11px] uppercase tracking-wide text-zinc-500 mb-1'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Price Simulation" />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-zinc-400" />
          <h1 className="text-sm font-semibold text-zinc-200">New Price Simulation</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Simulation No. *</label>
                <input className={inputCls} value={form.simulationNo} onChange={e => setField('simulationNo', e.target.value)} placeholder="SIM-0001" required />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input className={inputCls} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Simulation description" />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select className={inputCls} value={form.simulationType} onChange={e => setField('simulationType', e.target.value)}>
                  <option value="what_if">What-If</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Price List</label>
                <input className={inputCls} value={form.priceList} onChange={e => setField('priceList', e.target.value)} placeholder="e.g. RETAIL-2026" />
              </div>
              <div>
                <label className={labelCls}>Date From</label>
                <input type="date" className={inputCls} value={form.dateFrom} onChange={e => setField('dateFrom', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Date To</label>
                <input type="date" className={inputCls} value={form.dateTo} onChange={e => setField('dateTo', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Simulation Lines FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Simulation Lines</h2>
              <button type="button" onClick={addLine} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30">
                  {['Item / SKU', 'Original Price', 'New Price', 'Change %', ''].map(h => (
                    <th key={h} className="text-left px-2 py-1.5 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-b border-zinc-800/20">
                    <td className="px-2 py-1.5">
                      <input className={inputCls} value={line.item} onChange={e => setLine(i, 'item', e.target.value)} placeholder="SKU or item no." />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" step="0.01" className={inputCls} value={line.originalPrice} onChange={e => setLine(i, 'originalPrice', e.target.value)} placeholder="0.00" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" step="0.01" className={inputCls} value={line.newPrice} onChange={e => setLine(i, 'newPrice', e.target.value)} placeholder="0.00" />
                    </td>
                    <td className="px-2 py-1.5 font-mono text-[12px]">
                      <span className={
                        calcImpact(line).startsWith('+') ? 'text-emerald-400' :
                        calcImpact(line).startsWith('-') ? 'text-red-400' : 'text-zinc-500'
                      }>
                        {calcImpact(line)}
                      </span>
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
              {saving ? 'Creating...' : 'Create Simulation'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
