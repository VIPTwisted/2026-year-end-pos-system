'use client'

import { use, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, Calculator } from 'lucide-react'

type TaxComponent = {
  id: string
  componentName: string
  taxType: string
  rate: number
  jurisdiction: string | null
  stateCode: string | null
}

type TaxGroup = {
  id: string
  groupCode: string
  groupName: string
  description: string | null
  isActive: boolean
  components: TaxComponent[]
}

type CalcBreakdown = { name: string; rate: number; tax: number }

export default function TaxGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [group, setGroup] = useState<TaxGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ componentName: '', taxType: 'sales', rate: '', jurisdiction: '', stateCode: '' })
  const [saving, setSaving] = useState(false)
  const [calcAmount, setCalcAmount] = useState('')
  const [calcState, setCalcState] = useState('')
  const [calcResult, setCalcResult] = useState<{ totalTax: number; effectiveRate: number; breakdown: CalcBreakdown[] } | null>(null)

  useEffect(() => {
    fetch(`/api/tax/groups/${id}`)
      .then((r) => r.json())
      .then(setGroup)
      .finally(() => setLoading(false))
  }, [id])

  async function handleAddComponent() {
    if (!group) return
    setSaving(true)
    const res = await fetch(`/api/tax/groups/${id}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rate: parseFloat(form.rate) }),
    })
    const comp = await res.json()
    setGroup((g) => g ? { ...g, components: [...g.components, comp] } : g)
    setForm({ componentName: '', taxType: 'sales', rate: '', jurisdiction: '', stateCode: '' })
    setSaving(false)
  }

  async function handleCalculate() {
    const res = await fetch('/api/tax/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stateCode: calcState, subtotal: parseFloat(calcAmount), taxGroupId: id }),
    })
    setCalcResult(await res.json())
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>
  if (!group) return <div className="p-6 text-zinc-400">Group not found</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">{group.groupCode}</span>
          <h1 className="text-2xl font-semibold text-zinc-100">{group.groupName}</h1>
          <span className={cn('text-xs px-2 py-0.5 rounded-full ml-auto', group.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>
            {group.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {group.description && <p className="text-zinc-400 text-sm mt-1">{group.description}</p>}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <h2 className="text-sm font-medium text-zinc-400">Tax Components</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-3">Rate</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-3">Jurisdiction</th>
                </tr>
              </thead>
              <tbody>
                {group.components.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-zinc-500 py-6">No components</td></tr>
                ) : group.components.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-100">{c.componentName}</td>
                    <td className="px-4 py-3 text-zinc-400 capitalize">{c.taxType}</td>
                    <td className="px-4 py-3 text-zinc-100">{c.rate}%</td>
                    <td className="px-4 py-3 text-zinc-400">{c.jurisdiction ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Add Component</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="Component name" value={form.componentName} onChange={(e) => setForm((f) => ({ ...f, componentName: e.target.value }))} />
              <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                value={form.taxType} onChange={(e) => setForm((f) => ({ ...f, taxType: e.target.value }))}>
                <option value="sales">Sales</option>
                <option value="use">Use</option>
                <option value="excise">Excise</option>
                <option value="vat">VAT</option>
              </select>
              <input className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="Rate (%)" type="number" step="0.001" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} />
              <input className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="Jurisdiction" value={form.jurisdiction} onChange={(e) => setForm((f) => ({ ...f, jurisdiction: e.target.value }))} />
              <input className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="State code (e.g. TX)" value={form.stateCode} onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))} />
              <button onClick={handleAddComponent} disabled={saving || !form.componentName || !form.rate}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-medium text-zinc-300">Tax Calculator</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">State Code</label>
              <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g. TX" value={calcState} onChange={(e) => setCalcState(e.target.value.toUpperCase())} maxLength={2} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Subtotal ($)</label>
              <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                placeholder="0.00" type="number" step="0.01" value={calcAmount} onChange={(e) => setCalcAmount(e.target.value)} />
            </div>
            <button onClick={handleCalculate} disabled={!calcState || !calcAmount}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
              Calculate
            </button>
            {calcResult && (
              <div className="border-t border-zinc-800 pt-3 space-y-2">
                {calcResult.breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-zinc-400">{b.name} ({b.rate}%)</span>
                    <span className="text-zinc-200">${b.tax.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium border-t border-zinc-800 pt-2">
                  <span className="text-zinc-300">Total Tax</span>
                  <span className="text-zinc-100">${calcResult.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Effective Rate</span>
                  <span className="text-zinc-400">{calcResult.effectiveRate.toFixed(3)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
