'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

type Customer = { id: string; firstName: string; lastName: string; email?: string }
type Store = { id: string; name: string }
type Product = { id: string; name: string; sku: string; salePrice: number }
type BSOLine = { productId: string; quantity: number; unitPrice: number; nextShipDate: string }

export default function NewBlanketSOPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [storeId, setStoreId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<BSOLine[]>([{ productId: '', quantity: 1, unitPrice: 0, nextShipDate: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([c, s, p]) => {
      setCustomers(c)
      setStores(s)
      setProducts(p)
      if (s.length > 0) setStoreId(s[0].id)
    })
  }, [])

  const addLine = () => setLines(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, nextShipDate: '' }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: keyof BSOLine, value: string | number) => {
    setLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l
      const updated = { ...l, [field]: value }
      if (field === 'productId') {
        const p = products.find(p => p.id === value)
        if (p) updated.unitPrice = p.salePrice
      }
      return updated
    }))
  }

  const total = lines.reduce((s, l) => s + Number(l.quantity) * Number(l.unitPrice), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) { setError('Customer is required'); return }
    if (!storeId) { setError('Store is required'); return }
    if (lines.some(l => !l.productId)) { setError('All lines must have a product'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/sales/blanket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, storeId, startDate: startDate || null, endDate: endDate || null, notes: notes || null, lines }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      const order = await res.json()
      router.push(`/sales/blanket/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Blanket Sales Order" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">
        <div className="mb-4">
          <Link href="/sales/blanket">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader><CardTitle className="text-base text-zinc-100">Order Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Customer *</label>
                <select value={customerId} onChange={e => setCustomerId(e.target.value)} required
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.email ? ` (${c.email})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Store *</label>
                <select value={storeId} onChange={e => setStoreId(e.target.value)} required
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select store...</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-zinc-400 block mb-1.5">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-zinc-100">Order Lines</CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(total)}</span>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="w-4 h-4 mr-1" />Add Line
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Product *</label>}
                      <select value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)} required
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">Select...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Qty *</label>}
                      <input type="number" min="1" step="0.01" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} required
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Unit Price *</label>}
                      <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', Number(e.target.value))} required
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Next Ship</label>}
                      <input type="date" value={line.nextShipDate} onChange={e => updateLine(i, 'nextShipDate', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-1 text-right">
                      {i === 0 && <div className="text-xs text-zinc-500 mb-1">Total</div>}
                      <div className="py-1.5 text-xs text-emerald-400 font-mono">
                        {formatCurrency(Number(line.quantity) * Number(line.unitPrice))}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(i)} disabled={lines.length === 1} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-md">{error}</div>}
          <div className="flex justify-end gap-3">
            <Link href="/sales/blanket"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? 'Creating...' : 'Create Blanket SO'}</Button>
          </div>
        </form>
      </main>
    </>
  )
}
