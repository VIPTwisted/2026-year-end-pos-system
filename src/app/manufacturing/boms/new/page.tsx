'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Layers, Plus, Trash2 } from 'lucide-react'

interface Product { id: string; name: string; sku: string }

interface BOMLine {
  componentProductId: string
  quantity: string
  unitOfMeasure: string
  scrapPct: string
  type: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'
const cellInputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500'

const emptyLine = (): BOMLine => ({
  componentProductId: '',
  quantity: '1',
  unitOfMeasure: 'EACH',
  scrapPct: '0',
  type: 'item',
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
    })
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
            type: l.type,
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
    <>
      <TopBar title="New Bill of Material" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/manufacturing/boms"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Bills of Material
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  BOM Header
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input type="text" value={form.description} onChange={set('description')} placeholder="Assembled Widget v2" className={inputCls} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Output Product</label>
                    <select value={form.outputProductId} onChange={set('outputProductId')} className={inputCls}>
                      <option value="">None (generic BOM)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Unit of Measure</label>
                    <input type="text" value={form.unitOfMeasure} onChange={set('unitOfMeasure')} placeholder="EACH" className={inputCls} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Component Lines */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  Component Lines
                  <button
                    type="button"
                    onClick={addLine}
                    className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Component Product', 'Qty', 'UOM', 'Scrap %', 'Type', ''].map(h => (
                        <th key={h} className="text-left px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => (
                      <tr key={idx} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-3 py-2">
                          <select value={line.componentProductId} onChange={e => setLine(idx, 'componentProductId', e.target.value)} className={cellInputCls}>
                            <option value="">Select…</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 w-24">
                          <input type="number" min="0.001" step="any" value={line.quantity} onChange={e => setLine(idx, 'quantity', e.target.value)} className={cellInputCls} />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <input type="text" value={line.unitOfMeasure} onChange={e => setLine(idx, 'unitOfMeasure', e.target.value)} className={cellInputCls} />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <input type="number" min="0" max="100" step="0.01" value={line.scrapPct} onChange={e => setLine(idx, 'scrapPct', e.target.value)} className={cellInputCls} />
                        </td>
                        <td className="px-3 py-2 w-32">
                          <select value={line.type} onChange={e => setLine(idx, 'type', e.target.value)} className={cellInputCls}>
                            <option value="item">Item</option>
                            <option value="production_bom">Sub-BOM</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 w-10">
                          {lines.length > 1 && (
                            <button type="button" onClick={() => removeLine(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-2">
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add component line
                  </button>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/manufacturing/boms">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Creating…' : 'Create BOM'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
