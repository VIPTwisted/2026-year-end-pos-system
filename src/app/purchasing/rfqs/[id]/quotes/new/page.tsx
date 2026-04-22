'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

type Vendor = { id: string; name: string; vendorCode: string }
type Product = { id: string; name: string; sku: string }
type QuoteLine = { productId: string; quantity: number; unitPrice: number; leadTimeDays: string }

export default function NewQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rfqId } = use(params)
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [rfq, setRfq] = useState<{ rfqNumber: string; lines: Array<{ productId: string; product: Product; quantity: number }> } | null>(null)
  const [vendorId, setVendorId] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [leadTimeDays, setLeadTimeDays] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<QuoteLine[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/vendors').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
      fetch(`/api/purchasing/rfqs/${rfqId}`).then(r => r.json()),
    ]).then(([v, p, r]) => {
      setVendors(v)
      setProducts(p)
      setRfq(r)
      // Pre-populate lines from RFQ lines
      if (r.lines && Array.isArray(r.lines)) {
        setLines(r.lines.map((l: { productId: string; quantity: number }) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: 0,
          leadTimeDays: '',
        })))
      }
    })
  }, [rfqId])

  const addLine = () => setLines(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, leadTimeDays: '' }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: keyof QuoteLine, value: string | number) =>
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) * Number(l.unitPrice)), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendorId) { setError('Please select a vendor'); return }
    if (lines.some(l => !l.productId)) { setError('All lines must have a product'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/purchasing/rfqs/${rfqId}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          validUntil: validUntil || null,
          leadTimeDays: leadTimeDays ? Number(leadTimeDays) : null,
          notes: notes || null,
          lines: lines.map(l => ({ ...l, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) })),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      router.push(`/purchasing/rfqs/${rfqId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title={`Add Quote — ${rfq?.rfqNumber ?? '...'}`} />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">
        <div className="mb-4">
          <Link href={`/purchasing/rfqs/${rfqId}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back to RFQ</Button>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader><CardTitle className="text-base text-zinc-100">Quote Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-zinc-400 block mb-1.5">Vendor *</label>
                <select value={vendorId} onChange={e => setVendorId(e.target.value)} required
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select vendor...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Valid Until</label>
                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Lead Time (days)</label>
                <input type="number" min="0" value={leadTimeDays} onChange={e => setLeadTimeDays(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 7" />
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
                <CardTitle className="text-base text-zinc-100">Quote Lines</CardTitle>
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
                    <div className="col-span-5">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Product *</label>}
                      <select value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)} required
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">Select...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Qty *</label>}
                      <input type="number" min="0.01" step="0.01" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} required
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Unit Price *</label>}
                      <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', Number(e.target.value))} required
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Line Total</label>}
                      <div className="px-2 py-1.5 text-sm text-emerald-400 font-mono">
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
            <Link href={`/purchasing/rfqs/${rfqId}`}><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Submit Quote'}
            </Button>
          </div>
        </form>
      </main>
    </>
  )
}
