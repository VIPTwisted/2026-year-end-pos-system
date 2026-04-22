'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Layers, Plus, Trash2 } from 'lucide-react'

interface Product { id: string; name: string; sku: string }

interface BOMLine {
  componentProductId: string
  quantity: string
  unitOfMeasure: string
  scrapPct: string
  type: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'
const cellInputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500'
const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

const emptyLine = (): BOMLine => ({
  componentProductId: '',
  quantity: '1',
  unitOfMeasure: 'EACH',
  scrapPct: '0',
  type: 'Item',
})

export default function NewBOMPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState({
    description: '',
    outputProductId: '',
    unitOfMeasure: 'EACH',
  })
  const [lines, setLines] = useState<BOMLine[]>([emptyLine()])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => {
      setProducts(Array.isArray(data) ? data : data.products ?? [])
    }).catch(() => {})
  }, [])

  const setLine = (idx: number, k: keyof BOMLine, value: string) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [k]: value } : l))
  }

  const addLine = () => setLines(prev => [...prev, emptyLine()])
  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }
    const validLines = lines.filter(l => l.componentProductId && parseFloat(l.quantity) > 0)
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/manufacturing/boms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          outputProductId: form.outputProductId || undefined,
          unitOfMeasure: form.unitOfMeasure,
          lines: validLines.map((l, i) => ({
            componentProductId: l.componentProductId,
            lineNo: i + 1,
            quantity: parseFloat(l.quantity),
            unitOfMeasure: l.unitOfMeasure,
            scrapPct: parseFloat(l.scrapPct) || 0,
            type: l.type.toLowerCase().replace(' ', '_'),
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/manufacturing/boms/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Production BOM" />
      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-5">

          <Link
            href="/manufacturing/boms"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to BOMs
          </Link>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">New Production BOM</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className={sectionCls}>
              <div className={tabHeaderCls}>
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                Header
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Assembly BOM for Widget v1"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Output Product</label>
                  <select value={form.outputProductId} onChange={set('outputProductId')} className={inputCls}>
                    <option value="">None (generic BOM)</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Unit of Measure</label>
                  <input type="text" value={form.unitOfMeasure} onChange={set('unitOfMeasure')} placeholder="EACH" className={inputCls} />
                </div>
              </div>
            </div>

            {/* Lines */}
            <div className={sectionCls}>
              <div className={tabHeaderCls}>
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                Lines
                <button
                  type="button"
                  onClick={addLine}
                  className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      {['Type', 'No.', 'Description', 'Quantity', 'Unit of Measure', 'Scrap %', ''].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] uppercase text-zinc-600 font-medium tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => {
                      const selectedProduct = products.find(p => p.id === line.componentProductId)
                      return (
                        <tr key={idx} className="border-b border-zinc-800/30 last:border-0">
                          <td className="px-3 py-2 w-28">
                            <select value={line.type} onChange={e => setLine(idx, 'type', e.target.value)} className={cellInputCls}>
                              <option value="Item">Item</option>
                              <option value="Production BOM">Production BOM</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 min-w-[180px]">
                            <select
                              value={line.componentProductId}
                              onChange={e => setLine(idx, 'componentProductId', e.target.value)}
                              className={cellInputCls}
                            >
                              <option value="">Select…</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.sku}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-zinc-400 min-w-[160px]">
                            {selectedProduct?.name ?? '—'}
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input
                              type="number"
                              min="0.001"
                              step="any"
                              value={line.quantity}
                              onChange={e => setLine(idx, 'quantity', e.target.value)}
                              className={cellInputCls}
                            />
                          </td>
                          <td className="px-3 py-2 w-28">
                            <input
                              type="text"
                              value={line.unitOfMeasure}
                              onChange={e => setLine(idx, 'unitOfMeasure', e.target.value)}
                              className={cellInputCls}
                            />
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={line.scrapPct}
                              onChange={e => setLine(idx, 'scrapPct', e.target.value)}
                              className={cellInputCls}
                            />
                          </td>
                          <td className="px-3 py-2 w-10">
                            {lines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLine(idx)}
                                className="text-zinc-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t border-zinc-800/30">
                <button
                  type="button"
                  onClick={addLine}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add component line
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/manufacturing/boms"
                className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
              >
                {loading ? 'Creating…' : 'Create BOM'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
