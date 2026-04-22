'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Zap, ArrowLeft, Save } from 'lucide-react'

type Dimension = { name: string; values: string }
type Variant = {
  id: string
  sku: string
  barcode?: string
  dimensions: string
  costPrice: number
  salePrice: number
  stockQty: number
  isActive: boolean
}
type VariantGroup = {
  id: string
  productId: string
  dimensions: { id: string; name: string; values: string; sortOrder: number }[]
  variants: Variant[]
}

const PRESET_DIMS = ['Size', 'Color', 'Style', 'Configuration', 'Material', 'Finish']

export default function VariantMatrixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [group, setGroup] = useState<VariantGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [dims, setDims] = useState<Dimension[]>([{ name: 'Size', values: 'S,M,L,XL' }])
  const [edits, setEdits] = useState<Record<string, Partial<Variant>>>({})
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkCost, setBulkCost] = useState('')
  const [bulkStock, setBulkStock] = useState('')

  async function load() {
    setLoading(true)
    const r = await fetch(`/api/products/${id}/variant-matrix`)
    if (r.ok) {
      const data = await r.json()
      setGroup(data)
      if (data) {
        setDims(data.dimensions.map((d: { name: string; values: string }) => ({ name: d.name, values: d.values })))
      }
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  function addDim() { setDims(prev => [...prev, { name: '', values: '' }]) }
  function removeDim(i: number) { setDims(prev => prev.filter((_, idx) => idx !== i)) }
  function updateDim(i: number, field: keyof Dimension, val: string) {
    setDims(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d))
  }

  async function generateVariants() {
    if (dims.some(d => !d.name || !d.values)) return
    setSaving(true)
    await fetch(`/api/products/${id}/variant-matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dimensions: dims }),
    })
    setSaving(false)
    load()
  }

  function setEdit(variantId: string, field: keyof Variant, val: string | number | boolean) {
    setEdits(prev => ({ ...prev, [variantId]: { ...prev[variantId], [field]: val } }))
  }

  async function saveEdits() {
    if (!group) return
    const updates = group.variants.filter(v => edits[v.id]).map(v => ({ id: v.id, ...edits[v.id] }))
    if (!updates.length) return
    setSaving(true)
    await fetch(`/api/products/${id}/variant-matrix`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    setEdits({})
    setSaving(false)
    load()
  }

  function applyBulk() {
    if (!group) return
    const bulk: Partial<Variant> = {}
    if (bulkPrice !== '') bulk.salePrice = Number(bulkPrice)
    if (bulkCost !== '') bulk.costPrice = Number(bulkCost)
    if (bulkStock !== '') bulk.stockQty = Number(bulkStock)
    const newEdits: Record<string, Partial<Variant>> = { ...edits }
    group.variants.forEach(v => { newEdits[v.id] = { ...(newEdits[v.id] ?? {}), ...bulk } })
    setEdits(newEdits)
    setBulkPrice(''); setBulkCost(''); setBulkStock('')
  }

  function getVal<K extends keyof Variant>(v: Variant, field: K): Variant[K] {
    return (edits[v.id]?.[field] as Variant[K]) ?? v[field]
  }

  const parsedDims = (v: Variant) => {
    try { return JSON.parse(v.dimensions) as Record<string, string> } catch { return {} }
  }

  return (
    <>
      <TopBar title="Variant Matrix" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Variant Matrix</h2>
            <p className="text-sm text-zinc-500">Product ID: <code className="font-mono text-xs bg-zinc-800 px-1 rounded">{id}</code></p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-zinc-200">Variant Dimensions</div>
              <Button size="sm" variant="outline" onClick={addDim}><Plus className="w-3 h-3 mr-1" /> Add Dimension</Button>
            </div>
            <div className="space-y-3 mb-4">
              {dims.map((d, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-40">
                    <select
                      value={d.name}
                      onChange={e => updateDim(i, 'name', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      {PRESET_DIMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <Input className="flex-1" placeholder="S,M,L,XL or Red,Blue,Green" value={d.values} onChange={e => updateDim(i, 'values', e.target.value)} />
                  <button onClick={() => removeDim(i)} className="p-2 rounded hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <Button onClick={generateVariants} disabled={saving || dims.some(d => !d.name || !d.values)}>
                <Zap className="w-4 h-4 mr-1" /> Generate Matrix
              </Button>
              {group && <span>{group.variants.length} variants &bull; {group.dimensions.length} dimensions</span>}
            </div>
          </CardContent>
        </Card>

        {group && group.variants.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="text-sm font-semibold text-zinc-200 mb-3">Bulk Update All Variants</div>
              <div className="flex gap-3 items-end">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Sale Price</label>
                  <Input className="w-28" type="number" step="0.01" placeholder="0.00" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Cost Price</label>
                  <Input className="w-28" type="number" step="0.01" placeholder="0.00" value={bulkCost} onChange={e => setBulkCost(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Stock</label>
                  <Input className="w-28" type="number" placeholder="0" value={bulkStock} onChange={e => setBulkStock(e.target.value)} />
                </div>
                <Button variant="outline" onClick={applyBulk}>Apply to All</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-sm text-zinc-500 py-8 text-center">Loading...</div>
        ) : group && group.variants.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                <span className="text-sm font-medium text-zinc-200">{group.variants.length} Variants</span>
                {Object.keys(edits).length > 0 && (
                  <Button size="sm" onClick={saveEdits} disabled={saving}>
                    <Save className="w-3 h-3 mr-1" /> Save Changes ({Object.keys(edits).length})
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-medium">SKU</th>
                      {group.dimensions.map(d => (
                        <th key={d.id} className="text-left px-4 py-3 font-medium">{d.name}</th>
                      ))}
                      <th className="text-right px-4 py-3 font-medium">Cost</th>
                      <th className="text-right px-4 py-3 font-medium">Price</th>
                      <th className="text-right px-4 py-3 font-medium">Stock</th>
                      <th className="text-center px-4 py-3 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {group.variants.map(v => {
                      const dimVals = parsedDims(v)
                      const isDirty = !!edits[v.id]
                      return (
                        <tr key={v.id} className={`hover:bg-zinc-900/50 ${isDirty ? 'bg-blue-950/20' : ''}`}>
                          <td className="px-5 py-2.5 font-mono text-xs text-zinc-400">{v.sku}</td>
                          {group.dimensions.map(d => (
                            <td key={d.id} className="px-4 py-2.5">
                              <span className="text-xs text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">{dimVals[d.name] ?? '-'}</span>
                            </td>
                          ))}
                          <td className="px-4 py-2.5 text-right">
                            <Input type="number" step="0.01" className="h-7 w-24 text-xs text-right"
                              value={String(getVal(v, 'costPrice'))} onChange={e => setEdit(v.id, 'costPrice', Number(e.target.value))} />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Input type="number" step="0.01" className="h-7 w-24 text-xs text-right"
                              value={String(getVal(v, 'salePrice'))} onChange={e => setEdit(v.id, 'salePrice', Number(e.target.value))} />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Input type="number" className="h-7 w-20 text-xs text-right"
                              value={String(getVal(v, 'stockQty'))} onChange={e => setEdit(v.id, 'stockQty', Number(e.target.value))} />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button onClick={() => setEdit(v.id, 'isActive', !getVal(v, 'isActive'))} className="focus:outline-none">
                              <Badge variant={getVal(v, 'isActive') ? 'success' : 'secondary'}>
                                {getVal(v, 'isActive') ? 'Active' : 'Off'}
                              </Badge>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Zap className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No variants generated yet</p>
              <p className="text-xs text-zinc-600 mt-1">Define dimensions above and click Generate Matrix</p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
