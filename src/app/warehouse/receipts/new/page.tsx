'use client'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

type Store = { id: string; name: string }
type Product = { id: string; name: string; sku: string }
type ReceiptLine = {
  productId: string
  qtyExpected: number
  unitOfMeasure: string
  lotNo: string
  serialNo: string
}

export default function NewReceiptPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    storeId: '',
    sourceType: '',
    sourceId: '',
    expectedDate: '',
  })
  const [lines, setLines] = useState<ReceiptLine[]>([
    { productId: '', qtyExpected: 1, unitOfMeasure: 'EACH', lotNo: '', serialNo: '' },
  ])

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(setStores)
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])

  const setFormField = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))
  const setLine = (i: number, k: string, v: unknown) => setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [k]: v } : l))
  const addLine = () => setLines(prev => [...prev, { productId: '', qtyExpected: 1, unitOfMeasure: 'EACH', lotNo: '', serialNo: '' }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/warehouse/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lines: lines.filter(l => l.productId),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const receipt = await res.json()
      router.push(`/warehouse/receipts/${receipt.id}`)
    } catch {
      alert('Error creating receipt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="New Warehouse Receipt" />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Receipt Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Store *</Label>
                <select
                  required
                  value={form.storeId}
                  onChange={e => setFormField('storeId', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select store…</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Expected Date</Label>
                <Input type="date" value={form.expectedDate} onChange={e => setFormField('expectedDate', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Source Type</Label>
                <select
                  value={form.sourceType}
                  onChange={e => setFormField('sourceType', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  <option value="purchase_order">Purchase Order</option>
                  <option value="transfer">Transfer</option>
                  <option value="return">Return</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Source Reference</Label>
                <Input value={form.sourceId} onChange={e => setFormField('sourceId', e.target.value)} placeholder="PO # or reference" />
              </div>
            </div>
          </div>

          {/* Lines */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-200">Lines</h2>
              <Button type="button" size="sm" variant="outline" onClick={addLine} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Line
              </Button>
            </div>
            <div className="space-y-3">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-end p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/50">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs text-zinc-500">Product</Label>
                    <select
                      required
                      value={line.productId}
                      onChange={e => setLine(i, 'productId', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select product…</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-zinc-500">Qty Expected</Label>
                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={line.qtyExpected}
                      onChange={e => setLine(i, 'qtyExpected', Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-zinc-500">UOM</Label>
                    <Input value={line.unitOfMeasure} onChange={e => setLine(i, 'unitOfMeasure', e.target.value.toUpperCase())} className="h-8 text-xs" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-zinc-500">Lot #</Label>
                    <Input value={line.lotNo} onChange={e => setLine(i, 'lotNo', e.target.value)} className="h-8 text-xs" placeholder="Optional" />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                      className="h-8 w-8 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
              {saving ? 'Creating…' : 'Create Receipt'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
