'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ArrowLeftRight, Plus, Trash2 } from 'lucide-react'

interface Store { id: string; name: string }
interface Product { id: string; name: string; sku: string }

interface LineItem {
  productId: string
  quantity: string
  unitOfMeasure: string
}

export default function NewTransferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [form, setForm] = useState({
    fromStoreId: '',
    toStoreId: '',
    shipmentDate: '',
    notes: '',
  })
  const [lines, setLines] = useState<LineItem[]>([
    { productId: '', quantity: '1', unitOfMeasure: 'EACH' },
  ])

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(setStores).catch(() => setStores([]))
    fetch('/api/products').then(r => r.json()).then((d) => setProducts(Array.isArray(d) ? d : d.products ?? [])).catch(() => setProducts([]))
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const setLine = (i: number, k: keyof LineItem, v: string) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [k]: v } : l))

  const addLine = () => setLines(prev => [...prev, { productId: '', quantity: '1', unitOfMeasure: 'EACH' }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fromStoreId || !form.toStoreId) { setError('From and To store are required'); return }
    if (form.fromStoreId === form.toStoreId) { setError('From and To store must be different'); return }
    const validLines = lines.filter(l => l.productId && parseFloat(l.quantity) > 0)
    if (validLines.length === 0) { setError('Add at least one line item'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/inventory/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStoreId: form.fromStoreId,
          toStoreId: form.toStoreId,
          shipmentDate: form.shipmentDate || null,
          notes: form.notes || null,
          lines: validLines.map(l => ({
            productId: l.productId,
            quantity: parseFloat(l.quantity),
            unitOfMeasure: l.unitOfMeasure,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/supply-chain/transfers/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Transfer Order" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/supply-chain/transfers"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Transfers
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
                  Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>From Store <span className="text-red-400">*</span></label>
                    <select value={form.fromStoreId} onChange={set('fromStoreId')} className={inputCls} required>
                      <option value="">— Select Store —</option>
                      {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>To Store <span className="text-red-400">*</span></label>
                    <select value={form.toStoreId} onChange={set('toStoreId')} className={inputCls} required>
                      <option value="">— Select Store —</option>
                      {stores.filter(s => s.id !== form.fromStoreId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Shipment Date</label>
                  <input type="date" value={form.shipmentDate} onChange={set('shipmentDate')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Internal notes…" className={inputCls + ' resize-none'} />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  Line Items
                  <Button type="button" variant="outline" size="sm" className="ml-auto text-xs" onClick={addLine}>
                    <Plus className="w-3 h-3 mr-1" />Add Row
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Product', 'Qty', 'UOM', ''].map(h => (
                        <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-4 py-2.5">
                          <select
                            value={line.productId}
                            onChange={e => setLine(i, 'productId', e.target.value)}
                            className={inputCls}
                            required
                          >
                            <option value="">— Select Product —</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 w-28">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={line.quantity}
                            onChange={e => setLine(i, 'quantity', e.target.value)}
                            className={inputCls}
                            required
                          />
                        </td>
                        <td className="px-4 py-2.5 w-28">
                          <select value={line.unitOfMeasure} onChange={e => setLine(i, 'unitOfMeasure', e.target.value)} className={inputCls}>
                            {['EACH', 'CASE', 'BOX', 'PACK', 'LB', 'KG'].map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 w-10">
                          {lines.length > 1 && (
                            <button type="button" onClick={() => removeLine(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/supply-chain/transfers">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Creating…' : 'Create Transfer'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
