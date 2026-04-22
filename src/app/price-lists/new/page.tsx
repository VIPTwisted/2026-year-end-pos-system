'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, DollarSign, Plus, Trash2 } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

const CUSTOMER_GROUPS = ['New', 'Active', 'VIP', 'Wholesale', 'Employee']

type PriceListLine = {
  productId: string
  unitPrice: string
  minQuantity: string
  startDate: string
  endDate: string
}

export default function NewPriceListPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    currency: 'USD',
    isDefault: false,
    isActive: true,
    startDate: '',
    endDate: '',
  })
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [lines, setLines] = useState<PriceListLine[]>([])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const toggleGroup = (g: string) =>
    setSelectedGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const addLine = () =>
    setLines(prev => [...prev, { productId: '', unitPrice: '', minQuantity: '1', startDate: '', endDate: '' }])

  const setLine = (i: number, k: keyof PriceListLine) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [k]: e.target.value } : l))

  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/price-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          currency: form.currency,
          isDefault: form.isDefault,
          isActive: form.isActive,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          customerGroups: selectedGroups,
        }),
      })
      const pl = await res.json()
      if (!res.ok) throw new Error(pl.error ?? 'Create failed')

      // Add lines
      for (const line of lines) {
        if (!line.productId.trim() || !line.unitPrice) continue
        await fetch(`/api/price-lists/${pl.id}/lines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(line),
        })
      }

      router.push(`/price-lists/${pl.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Price List" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link href="/price-lists" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Price Lists
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic info */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  Price List Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="VIP Pricing Q1 2026" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Internal notes…" className={inputCls + ' resize-none'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Currency</label>
                    <select value={form.currency} onChange={set('currency')} className={inputCls + ' cursor-pointer'}>
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — Pound Sterling</option>
                      <option value="CAD">CAD — Canadian Dollar</option>
                      <option value="MXN">MXN — Mexican Peso</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-3 justify-end pb-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-zinc-300">Set as Default Price List</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
                      <span className="text-sm text-zinc-300">Active</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input type="datetime-local" value={form.startDate} onChange={set('startDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input type="datetime-local" value={form.endDate} onChange={set('endDate')} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Customer Groups (blank = all)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {CUSTOMER_GROUPS.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGroup(g)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          selectedGroups.includes(g)
                            ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {selectedGroups.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-1.5">Applies to: {selectedGroups.join(', ')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price lines */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Price Lines</CardTitle>
                  <Button type="button" variant="outline" size="sm" className="gap-1 text-xs" onClick={addLine}>
                    <Plus className="w-3.5 h-3.5" />
                    Add Line
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lines.length === 0 ? (
                  <p className="text-xs text-zinc-600 py-4 text-center">No lines yet. Add lines to override product prices.</p>
                ) : (
                  <div className="space-y-3">
                    {lines.map((line, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          {i === 0 && <label className={labelCls}>Product ID</label>}
                          <input
                            type="text"
                            value={line.productId}
                            onChange={setLine(i, 'productId')}
                            placeholder="Product cuid…"
                            className={inputCls + ' font-mono text-xs'}
                          />
                        </div>
                        <div className="col-span-2">
                          {i === 0 && <label className={labelCls}>Unit Price</label>}
                          <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={setLine(i, 'unitPrice')} placeholder="0.00" className={inputCls} />
                        </div>
                        <div className="col-span-2">
                          {i === 0 && <label className={labelCls}>Min Qty</label>}
                          <input type="number" min="1" step="1" value={line.minQuantity} onChange={setLine(i, 'minQuantity')} placeholder="1" className={inputCls} />
                        </div>
                        <div className="col-span-2">
                          {i === 0 && <label className={labelCls}>Start</label>}
                          <input type="date" value={line.startDate} onChange={setLine(i, 'startDate')} className={inputCls} />
                        </div>
                        <div className="col-span-1">
                          {i === 0 && <label className={labelCls}>End</label>}
                          <input type="date" value={line.endDate} onChange={setLine(i, 'endDate')} className={inputCls} />
                        </div>
                        <div className="col-span-1 flex items-end pb-0.5">
                          <button type="button" onClick={() => removeLine(i)} className="text-red-500 hover:text-red-300 transition-colors p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {error && <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</p>}

            <div className="flex items-center justify-end gap-3">
              <Link href="/price-lists">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Creating…' : 'Create Price List'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
