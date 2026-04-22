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
type MovementLine = {
  actionType: 'Take' | 'Place'
  productId: string
  description: string
  quantity: number
  unitOfMeasure: string
  fromZoneCode: string
  fromBinCode: string
  toZoneCode: string
  toBinCode: string
}

const emptyLine = (): MovementLine => ({
  actionType: 'Take',
  productId: '',
  description: '',
  quantity: 1,
  unitOfMeasure: 'EACH',
  fromZoneCode: '',
  fromBinCode: '',
  toZoneCode: '',
  toBinCode: '',
})

export default function NewMovementPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    storeId: '',
    locationCode: '',
    description: '',
    assignedUserId: '',
  })
  const [lines, setLines] = useState<MovementLine[]>([emptyLine()])

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(setStores)
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])

  const setField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const setLine = (i: number, k: string, v: unknown) =>
    setLines(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l))
  const addLine = () => setLines(p => [...p, emptyLine()])
  const removeLine = (i: number) => setLines(p => p.filter((_, idx) => idx !== i))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/warehouse/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lines: lines.filter(l => l.productId || l.description) }),
      })
      if (!res.ok) throw new Error('Failed')
      const doc = await res.json()
      router.push(`/warehouse/movements/${doc.id}`)
    } catch {
      alert('Error creating movement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Warehouse Movement" />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Header FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <div className="px-4 py-3 border-b border-zinc-800/40">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">General</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Location Code *</Label>
                <select
                  required
                  value={form.storeId}
                  onChange={e => setField('storeId', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select location…</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Assigned User ID</Label>
                <Input value={form.assignedUserId} onChange={e => setField('assignedUserId', e.target.value)} placeholder="User ID…" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs text-zinc-400">Description</Label>
                <Input value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Movement description…" />
              </div>
            </div>
          </div>

          {/* Lines FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/40">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Lines</h3>
              <Button type="button" size="sm" variant="outline" onClick={addLine} className="gap-1.5 h-7 text-xs">
                <Plus className="w-3 h-3" /> Add Line
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/40">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-zinc-500">Action Type</Label>
                    <select
                      value={line.actionType}
                      onChange={e => setLine(i, 'actionType', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Take">Take</option>
                      <option value="Place">Place</option>
                    </select>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs text-zinc-500">Item</Label>
                    <select
                      value={line.productId}
                      onChange={e => setLine(i, 'productId', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select item…</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs text-zinc-500">Qty</Label>
                    <Input type="number" min={0.01} step={0.01} value={line.quantity} onChange={e => setLine(i, 'quantity', Number(e.target.value))} className="h-8 text-xs" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs text-zinc-500">UOM</Label>
                    <Input value={line.unitOfMeasure} onChange={e => setLine(i, 'unitOfMeasure', e.target.value.toUpperCase())} className="h-8 text-xs" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs text-zinc-500">From Zone</Label>
                    <Input value={line.fromZoneCode} onChange={e => setLine(i, 'fromZoneCode', e.target.value)} className="h-8 text-xs" placeholder="ZONE" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs text-zinc-500">From Bin</Label>
                    <Input value={line.fromBinCode} onChange={e => setLine(i, 'fromBinCode', e.target.value)} className="h-8 text-xs" placeholder="BIN" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs text-zinc-500">To Zone</Label>
                    <Input value={line.toZoneCode} onChange={e => setLine(i, 'toZoneCode', e.target.value)} className="h-8 text-xs" placeholder="ZONE" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-xs text-zinc-500">To Bin</Label>
                    <Input value={line.toBinCode} onChange={e => setLine(i, 'toBinCode', e.target.value)} className="h-8 text-xs" placeholder="BIN" />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button" variant="ghost" size="icon"
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
              {saving ? 'Creating…' : 'Create Movement'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
