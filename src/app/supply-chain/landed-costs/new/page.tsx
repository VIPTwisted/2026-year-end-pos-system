'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Plus, Trash2 } from 'lucide-react'

interface PO { id: string; poNumber: string }
interface Product { id: string; name: string; sku: string }

interface LandedLine {
  productId: string
  quantity: string
  allocatedAmount: string
}

export default function NewLandedCostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [form, setForm] = useState({
    purchaseOrderId: '',
    vendor: '',
    description: '',
    amount: '',
    currency: 'USD',
    costType: 'freight',
    allocationMethod: 'by_value',
  })
  const [lines, setLines] = useState<LandedLine[]>([
    { productId: '', quantity: '1', allocatedAmount: '0' },
  ])
  const [autoPopulate, setAutoPopulate] = useState(true)

  useEffect(() => {
    fetch('/api/purchasing').then(r => r.json()).then((d) => {
      const pos = Array.isArray(d) ? d : d.purchaseOrders ?? d.data ?? []
      setPurchaseOrders(pos)
    }).catch(() => setPurchaseOrders([]))
    fetch('/api/products').then(r => r.json()).then((d) => setProducts(Array.isArray(d) ? d : d.products ?? [])).catch(() => setProducts([]))
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const setLine = (i: number, k: keyof LandedLine, v: string) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [k]: v } : l))

  const addLine = () => setLines(prev => [...prev, { productId: '', quantity: '1', allocatedAmount: '0' }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Amount must be greater than 0'); return }

    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        purchaseOrderId: form.purchaseOrderId || null,
        vendor: form.vendor || null,
        description: form.description,
        amount: parseFloat(form.amount),
        currency: form.currency,
        costType: form.costType,
        allocationMethod: form.allocationMethod,
      }

      // If no PO or not auto-populating, send manual lines
      if (!form.purchaseOrderId || !autoPopulate) {
        const validLines = lines.filter(l => l.productId && parseFloat(l.quantity) > 0)
        if (validLines.length > 0) {
          body.lines = validLines.map(l => ({
            productId: l.productId,
            quantity: parseFloat(l.quantity),
            allocatedAmount: parseFloat(l.allocatedAmount) || 0,
          }))
        }
      }

      const res = await fetch('/api/landed-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/supply-chain/landed-costs/${data.id}`)
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
      <TopBar title="New Landed Cost" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/supply-chain/landed-costs"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Landed Costs
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  Landed Cost Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Linked Purchase Order</label>
                    <select value={form.purchaseOrderId} onChange={set('purchaseOrderId')} className={inputCls}>
                      <option value="">— None —</option>
                      {purchaseOrders.map(p => <option key={p.id} value={p.id}>{p.poNumber}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Vendor</label>
                    <input type="text" value={form.vendor} onChange={set('vendor')} placeholder="Vendor name" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input type="text" value={form.description} onChange={set('description')} placeholder="e.g. Ocean freight charges Jan 2026" className={inputCls} required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Amount <span className="text-red-400">*</span></label>
                    <input type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Currency</label>
                    <select value={form.currency} onChange={set('currency')} className={inputCls}>
                      {['USD', 'EUR', 'GBP', 'CAD', 'CNY', 'JPY'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Cost Type</label>
                    <select value={form.costType} onChange={set('costType')} className={inputCls}>
                      <option value="freight">Freight</option>
                      <option value="customs">Customs</option>
                      <option value="insurance">Insurance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Allocation Method</label>
                  <select value={form.allocationMethod} onChange={set('allocationMethod')} className={inputCls}>
                    <option value="by_value">By Value</option>
                    <option value="by_quantity">By Quantity</option>
                    <option value="by_weight">By Weight</option>
                  </select>
                </div>

                {form.purchaseOrderId && (
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPopulate}
                      onChange={e => setAutoPopulate(e.target.checked)}
                      className="accent-blue-500 w-4 h-4"
                    />
                    Auto-populate lines from selected PO
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Manual lines if no PO or auto-populate off */}
            {(!form.purchaseOrderId || !autoPopulate) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    Cost Lines
                    <Button type="button" variant="outline" size="sm" className="ml-auto text-xs" onClick={addLine}>
                      <Plus className="w-3 h-3 mr-1" />Add Row
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Product', 'Qty', 'Allocated Amount', ''].map(h => (
                          <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, i) => (
                        <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                          <td className="px-4 py-2.5">
                            <select value={line.productId} onChange={e => setLine(i, 'productId', e.target.value)} className={inputCls}>
                              <option value="">— Select Product —</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2.5 w-28">
                            <input type="number" min="0" step="0.01" value={line.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} className={inputCls} />
                          </td>
                          <td className="px-4 py-2.5 w-36">
                            <input type="number" min="0" step="0.01" value={line.allocatedAmount} onChange={e => setLine(i, 'allocatedAmount', e.target.value)} className={inputCls} />
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
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/supply-chain/landed-costs">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Creating…' : 'Create Landed Cost'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
