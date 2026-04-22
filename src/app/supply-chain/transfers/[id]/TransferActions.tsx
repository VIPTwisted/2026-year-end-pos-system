'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Package, Send, Truck } from 'lucide-react'

interface Line {
  id: string
  product: { name: string; sku: string }
  quantity: number
  quantityShipped: number
  quantityReceived: number
  unitOfMeasure: string
}

interface Transfer {
  id: string
  status: string
  lines: Line[]
}

export function TransferActions({ transfer }: { transfer: Transfer }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shippedQtys, setShippedQtys] = useState<Record<string, number>>(
    Object.fromEntries(transfer.lines.map(l => [l.id, l.quantityShipped || l.quantity]))
  )
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>(
    Object.fromEntries(transfer.lines.map(l => [l.id, l.quantityReceived || l.quantityShipped || l.quantity]))
  )

  const patch = async (body: object) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/inventory/transfers/${transfer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (transfer.status === 'closed') {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        Transfer closed
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
        )}

        {transfer.status === 'open' && (
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Open</Badge>
            <Button size="sm" disabled={loading} onClick={() => patch({ status: 'released' })}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Release
            </Button>
          </div>
        )}

        {transfer.status === 'released' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">Enter shipped quantities per line:</p>
            {transfer.lines.map(l => (
              <div key={l.id} className="flex items-center gap-3">
                <span className="text-xs text-zinc-300 flex-1">{l.product.name}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippedQtys[l.id] ?? l.quantity}
                  onChange={e => setShippedQtys(prev => ({ ...prev, [l.id]: parseFloat(e.target.value) || 0 }))}
                  className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <span className="text-xs text-zinc-600">{l.unitOfMeasure}</span>
              </div>
            ))}
            <Button
              size="sm"
              disabled={loading}
              onClick={() =>
                patch({
                  status: 'shipped',
                  lines: transfer.lines.map(l => ({ id: l.id, quantityShipped: shippedQtys[l.id] ?? l.quantity })),
                })
              }
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              Mark Shipped
            </Button>
          </div>
        )}

        {transfer.status === 'shipped' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">Enter received quantities per line:</p>
            {transfer.lines.map(l => (
              <div key={l.id} className="flex items-center gap-3">
                <span className="text-xs text-zinc-300 flex-1">{l.product.name}</span>
                <span className="text-xs text-zinc-500">Shipped: {l.quantityShipped}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={receivedQtys[l.id] ?? l.quantityShipped}
                  onChange={e => setReceivedQtys(prev => ({ ...prev, [l.id]: parseFloat(e.target.value) || 0 }))}
                  className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <span className="text-xs text-zinc-600">{l.unitOfMeasure}</span>
              </div>
            ))}
            <Button
              size="sm"
              disabled={loading}
              onClick={() =>
                patch({
                  status: 'received',
                  receiptDate: new Date().toISOString(),
                  lines: transfer.lines.map(l => ({ id: l.id, quantityReceived: receivedQtys[l.id] ?? l.quantityShipped })),
                })
              }
            >
              <Package className="w-3.5 h-3.5 mr-1.5" />
              Mark Received
            </Button>
          </div>
        )}

        {transfer.status === 'received' && (
          <div className="flex items-center gap-3">
            <Badge variant="success">Received</Badge>
            <Button size="sm" disabled={loading} onClick={() => patch({ status: 'closed' })}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Close Transfer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
