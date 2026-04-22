'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Layers, GitBranch, Plus, Trash2 } from 'lucide-react'

interface Product { id: string; name: string; sku: string }
interface WorkCenter { id: string; name: string; code: string }

interface BOMLine {
  componentProductId: string
  quantity: string
  unitOfMeasure: string
  scrapPct: string
  type: string
}

interface RoutingStep {
  operationNo: string
  description: string
  workCenterId: string
  setupTime: string
  runTime: string
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'
const cellInputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500'

const emptyBOMLine = (): BOMLine => ({
  componentProductId: '',
  quantity: '1',
  unitOfMeasure: 'EACH',
  scrapPct: '0',
  type: 'item',
})

const emptyRoutingStep = (idx: number): RoutingStep => ({
  operationNo: String((idx + 1) * 10),
  description: '',
  workCenterId: '',
  setupTime: '0',
  runTime: '1',
})

export default function NewBOMRoutingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [activeTab, setActiveTab] = useState<'bom' | 'routing'>('bom')

  const [form, setForm] = useState({
    description: '',
    outputProductId: '',
    unitOfMeasure: 'EACH',
    version: '1',
  })
  const [bomLines, setBomLines] = useState<BOMLine[]>([emptyBOMLine()])
  const [routingSteps, setRoutingSteps] = useState<RoutingStep[]>([emptyRoutingStep(0)])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/manufacturing/work-centers').then(r => r.json()),
    ]).then(([ps, wcs]) => {
      setProducts(Array.isArray(ps) ? ps : ps.products ?? [])
      setWorkCenters(Array.isArray(wcs) ? wcs : wcs.workCenters ?? [])
    })
  }, [])

  const setBomLine = (idx: number, k: keyof BOMLine, val: string) =>
    setBomLines(prev => prev.map((l, i) => i === idx ? { ...l, [k]: val } : l))

  const setRoutingStep = (idx: number, k: keyof RoutingStep, val: string) =>
    setRoutingSteps(prev => prev.map((s, i) => i === idx ? { ...s, [k]: val } : s))

  const addBomLine = () => setBomLines(prev => [...prev, emptyBOMLine()])
  const removeBomLine = (idx: number) => setBomLines(prev => prev.filter((_, i) => i !== idx))

  const addRoutingStep = () => setRoutingSteps(prev => [...prev, emptyRoutingStep(prev.length)])
  const removeRoutingStep = (idx: number) => setRoutingSteps(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { setError('Description is required'); return }
    setLoading(true)
    setError('')
    try {
      const validLines = bomLines.filter(l => l.componentProductId && parseFloat(l.quantity) > 0)
      const res = await fetch('/api/manufacturing/boms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          outputProductId: form.outputProductId || undefined,
          unitOfMeasure: form.unitOfMeasure,
          version: form.version,
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
      router.push(`/manufacturing/bom-routing/${data.id}?type=bom`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New BOM & Routing" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/manufacturing/bom-routing"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to BOMs & Routings
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Output / Parent Item</label>
                    <select value={form.outputProductId} onChange={set('outputProductId')} className={inputCls}>
                      <option value="">None (generic BOM)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Version</label>
                    <input type="text" value={form.version} onChange={set('version')} placeholder="1" className={inputCls} />
                  </div>
                </div>
                <div className="w-40">
                  <label className={labelCls}>Unit of Measure</label>
                  <input type="text" value={form.unitOfMeasure} onChange={set('unitOfMeasure')} placeholder="EACH" className={inputCls} />
                </div>
              </CardContent>
            </Card>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 border-b border-zinc-800/50">
              {[
                { id: 'bom' as const, label: 'Components', icon: Layers },
                { id: 'routing' as const, label: 'Routing Steps', icon: GitBranch },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === id
                      ? 'border-blue-500 text-zinc-100'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className="ml-1 text-[11px] bg-zinc-800 text-zinc-500 rounded-full px-1.5 py-0.5">
                    {id === 'bom' ? bomLines.length : routingSteps.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Components table */}
            {activeTab === 'bom' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    Component Lines
                    <button type="button" onClick={addBomLine} className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Component Item', 'Qty', 'UOM', 'Scrap %', 'Type', ''].map(h => (
                          <th key={h} className="text-left px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bomLines.map((line, idx) => (
                        <tr key={idx} className="border-b border-zinc-800/50 last:border-0">
                          <td className="px-3 py-2">
                            <select value={line.componentProductId} onChange={e => setBomLine(idx, 'componentProductId', e.target.value)} className={cellInputCls}>
                              <option value="">Select item…</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input type="number" min="0.001" step="any" value={line.quantity} onChange={e => setBomLine(idx, 'quantity', e.target.value)} className={cellInputCls} />
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input type="text" value={line.unitOfMeasure} onChange={e => setBomLine(idx, 'unitOfMeasure', e.target.value)} className={cellInputCls} />
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input type="number" min="0" max="100" step="0.01" value={line.scrapPct} onChange={e => setBomLine(idx, 'scrapPct', e.target.value)} className={cellInputCls} />
                          </td>
                          <td className="px-3 py-2 w-32">
                            <select value={line.type} onChange={e => setBomLine(idx, 'type', e.target.value)} className={cellInputCls}>
                              <option value="item">Item</option>
                              <option value="production_bom">Sub-BOM</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 w-10">
                            {bomLines.length > 1 && (
                              <button type="button" onClick={() => removeBomLine(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-3 py-2">
                    <button type="button" onClick={addBomLine} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1">
                      <Plus className="w-3.5 h-3.5" /> Add component line
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Routing steps table */}
            {activeTab === 'routing' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-zinc-400" />
                    Routing Steps
                    <span className="text-xs text-zinc-500 font-normal">(saved separately with the linked routing)</span>
                    <button type="button" onClick={addRoutingStep} className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Step
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Op #', 'Description', 'Work Center', 'Setup (h)', 'Run (h)', ''].map(h => (
                          <th key={h} className="text-left px-3 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {routingSteps.map((step, idx) => (
                        <tr key={idx} className="border-b border-zinc-800/50 last:border-0">
                          <td className="px-3 py-2 w-20">
                            <input type="text" value={step.operationNo} onChange={e => setRoutingStep(idx, 'operationNo', e.target.value)} className={cellInputCls} />
                          </td>
                          <td className="px-3 py-2">
                            <input type="text" value={step.description} onChange={e => setRoutingStep(idx, 'description', e.target.value)} placeholder="Operation description" className={cellInputCls} />
                          </td>
                          <td className="px-3 py-2">
                            <select value={step.workCenterId} onChange={e => setRoutingStep(idx, 'workCenterId', e.target.value)} className={cellInputCls}>
                              <option value="">Select work center…</option>
                              {workCenters.map(wc => (
                                <option key={wc.id} value={wc.id}>{wc.code} — {wc.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input type="number" min="0" step="0.1" value={step.setupTime} onChange={e => setRoutingStep(idx, 'setupTime', e.target.value)} className={cellInputCls} />
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input type="number" min="0.1" step="0.1" value={step.runTime} onChange={e => setRoutingStep(idx, 'runTime', e.target.value)} className={cellInputCls} />
                          </td>
                          <td className="px-3 py-2 w-10">
                            {routingSteps.length > 1 && (
                              <button type="button" onClick={() => removeRoutingStep(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 bg-zinc-900/30 border-t border-zinc-800/30">
                    <p className="text-[11px] text-zinc-600">
                      Routing steps are informational in this view. Create a full routing at{' '}
                      <Link href="/manufacturing/routings/new" className="text-blue-400 hover:underline">Routings &rarr; New Routing</Link>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/manufacturing/bom-routing">
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
