'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PackageCheck } from 'lucide-react'

interface POItem {
  id: string
  productName: string
  sku: string
  orderedQty: number
  receivedQty: number
}

interface PurchaseOrder {
  id: string
  poNumber: string
  status: string
  items: POItem[]
}

export default function ReceiveItemsPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [po, setPO] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [qtys, setQtys] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [receivedBy, setReceivedBy] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/purchasing/${id}`)
      .then(r => r.json())
      .then((data: PurchaseOrder) => {
        setPO(data)
        // Default qty inputs to outstanding amounts
        const defaults: Record<string, string> = {}
        for (const item of data.items) {
          const outstanding = Math.max(0, item.orderedQty - item.receivedQty)
          defaults[item.id] = outstanding > 0 ? String(outstanding) : '0'
        }
        setQtys(defaults)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load purchase order.')
        setLoading(false)
      })
  }, [id])

  async function submit() {
    if (!po) return
    const lines = po.items
      .map(item => ({
        poItemId: item.id,
        quantityReceived: parseFloat(qtys[item.id] ?? '0') || 0,
      }))
      .filter(l => l.quantityReceived > 0)

    if (lines.length === 0) {
      setError('Enter at least one quantity to receive.')
      return
    }

    // Validate none exceed outstanding
    for (const item of po.items) {
      const outstanding = item.orderedQty - item.receivedQty
      const entered = parseFloat(qtys[item.id] ?? '0') || 0
      if (entered > outstanding) {
        setError(`Qty for "${item.productName}" exceeds outstanding (${outstanding}).`)
        return
      }
    }

    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/purchasing/${id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines,
          notes: notes.trim() || undefined,
          receivedBy: receivedBy.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to record receipt.')
        setSaving(false)
        return
      }

      router.push(`/purchasing/${id}`)
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Receive Items" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">Loading...</p>
        </main>
      </>
    )
  }

  if (!po) {
    return (
      <>
        <TopBar title="Receive Items" />
        <main className="flex-1 p-6">
          <p className="text-red-400 text-sm">{error || 'Purchase order not found.'}</p>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar title={`Receive Items — ${po.poNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Record Receipt</h2>
            <p className="text-sm text-zinc-500">
              PO {po.poNumber} · Enter quantities received for each line
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/purchasing/${id}`)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              <PackageCheck className="w-4 h-4 mr-1" />
              {saving ? 'Saving…' : 'Confirm Receipt'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Receipt metadata */}
        <Card>
          <CardContent className="pt-5 pb-5 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Received By</label>
              <input
                type="text"
                value={receivedBy}
                onChange={e => setReceivedBy(e.target.value)}
                placeholder="Your name or employee ID..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional receiving notes..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Items to Receive</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Product</th>
                    <th className="text-left pb-3 font-medium">SKU</th>
                    <th className="text-right pb-3 font-medium">Ordered</th>
                    <th className="text-right pb-3 font-medium">Already Received</th>
                    <th className="text-right pb-3 font-medium">Outstanding</th>
                    <th className="text-right pb-3 font-medium w-[140px]">Qty Receiving Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {po.items.map(item => {
                    const outstanding = Math.max(0, item.orderedQty - item.receivedQty)
                    const fullyReceived = outstanding === 0
                    return (
                      <tr key={item.id} className={fullyReceived ? 'opacity-40' : 'hover:bg-zinc-900/50'}>
                        <td className="py-3 pr-4 text-zinc-100">{item.productName}</td>
                        <td className="py-3 pr-4 text-zinc-400 font-mono text-xs">{item.sku}</td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{item.orderedQty}</td>
                        <td className="py-3 pr-4 text-right text-emerald-400">{item.receivedQty}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className={outstanding > 0 ? 'text-amber-400' : 'text-zinc-500'}>
                            {outstanding}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <input
                            type="number"
                            value={qtys[item.id] ?? '0'}
                            onChange={e => setQtys(prev => ({ ...prev, [item.id]: e.target.value }))}
                            min="0"
                            max={outstanding}
                            step="1"
                            disabled={fullyReceived}
                            className="w-24 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40 ml-auto block"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pb-4">
          <Button variant="outline" onClick={() => router.push(`/purchasing/${id}`)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            <PackageCheck className="w-4 h-4 mr-1" />
            {saving ? 'Saving…' : 'Confirm Receipt'}
          </Button>
        </div>

      </main>
    </>
  )
}
