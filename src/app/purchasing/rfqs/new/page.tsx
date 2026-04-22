'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Vendor = { id: string; name: string; vendorCode: string }
type Product = { id: string; name: string; sku: string }

type RFQLine = {
  productId: string
  quantity: number
  unitOfMeasure: string
  neededByDate: string
  description: string
}

export default function NewRFQPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [vendorId, setVendorId] = useState('')
  const [responseDeadline, setResponseDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<RFQLine[]>([
    { productId: '', quantity: 1, unitOfMeasure: 'EACH', neededByDate: '', description: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/vendors').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([v, p]) => {
      setVendors(v)
      setProducts(p)
    })
  }, [])

  const addLine = () =>
    setLines(prev => [...prev, { productId: '', quantity: 1, unitOfMeasure: 'EACH', neededByDate: '', description: '' }])

  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  const updateLine = (i: number, field: keyof RFQLine, value: string | number) =>
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.some(l => !l.productId)) {
      setError('All lines must have a product selected')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/purchasing/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendorId || null,
          responseDeadline: responseDeadline || null,
          notes: notes || null,
          lines,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to create RFQ')
      }
      const rfq = await res.json()
      router.push(`/purchasing/rfqs/${rfq.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating RFQ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Purchase RFQ" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl">
        <div className="mb-4">
          <Link href="/purchasing/rfqs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />Back to RFQs
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base text-zinc-100">RFQ Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Vendor (optional — leave blank for multi-vendor)</label>
                <select
                  value={vendorId}
                  onChange={e => setVendorId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Multi-vendor RFQ --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Response Deadline</label>
                <input
                  type="datetime-local"
                  value={responseDeadline}
                  onChange={e => setResponseDeadline(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-zinc-400 block mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Internal notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Lines card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-zinc-100">Request Lines</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="w-4 h-4 mr-1" />Add Line
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Product *</label>}
                      <select
                        value={line.productId}
                        onChange={e => updateLine(i, 'productId', e.target.value)}
                        required
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Qty *</label>}
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={line.quantity}
                        onChange={e => updateLine(i, 'quantity', Number(e.target.value))}
                        required
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">UOM</label>}
                      <input
                        type="text"
                        value={line.unitOfMeasure}
                        onChange={e => updateLine(i, 'unitOfMeasure', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Needed By</label>}
                      <input
                        type="date"
                        value={line.neededByDate}
                        onChange={e => updateLine(i, 'neededByDate', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="text-xs text-zinc-500 block mb-1">Description</label>}
                      <input
                        type="text"
                        value={line.description}
                        onChange={e => updateLine(i, 'description', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      {i === 0 && <div className="h-5 mb-1" />}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(i)}
                        disabled={lines.length === 1}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/purchasing/rfqs">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Creating...' : 'Create RFQ'}
            </Button>
          </div>
        </form>
      </main>
    </>
  )
}
