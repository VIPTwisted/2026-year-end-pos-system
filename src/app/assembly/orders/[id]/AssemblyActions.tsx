'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Send, Lock } from 'lucide-react'

interface Line {
  id: string
  component: { name: string }
  quantity: number
  quantityPicked: number
  unitOfMeasure: string
}

interface AssemblyOrder {
  id: string
  status: string
  quantity: number
  quantityToAssemble: number
  lines: Line[]
}

export function AssemblyActions({ order }: { order: AssemblyOrder }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pickedQtys, setPickedQtys] = useState<Record<string, number>>(
    Object.fromEntries(order.lines.map(l => [l.id, l.quantityPicked || l.quantity]))
  )
  const [qtyToAssemble, setQtyToAssemble] = useState(order.quantityToAssemble || order.quantity)

  const patch = async (body: object) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/assembly/orders/${order.id}`, {
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

  if (order.status === 'finished') {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <Lock className="w-3.5 h-3.5 text-emerald-500" />
        Assembly finished
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

        {order.status === 'open' && (
          <div className="flex items-center gap-3">
            <Button size="sm" disabled={loading} onClick={() => patch({ status: 'released' })}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Release Order
            </Button>
          </div>
        )}

        {order.status === 'released' && (
          <div className="space-y-4">
            {order.lines.length > 0 && (
              <>
                <p className="text-xs text-zinc-400">Record picked quantities per component:</p>
                {order.lines.map(l => (
                  <div key={l.id} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-300 flex-1">{l.component.name}</span>
                    <span className="text-xs text-zinc-500">of {l.quantity}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pickedQtys[l.id] ?? l.quantity}
                      onChange={e => setPickedQtys(prev => ({ ...prev, [l.id]: parseFloat(e.target.value) || 0 }))}
                      className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    />
                    <span className="text-xs text-zinc-600">{l.unitOfMeasure}</span>
                  </div>
                ))}
              </>
            )}

            <div className="pt-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-400 mb-2">Post Assembly — quantity assembled:</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={qtyToAssemble}
                  onChange={e => setQtyToAssemble(parseFloat(e.target.value) || 0)}
                  className="w-32 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <Button
                  size="sm"
                  disabled={loading}
                  onClick={() =>
                    patch({
                      quantityToAssemble: qtyToAssemble,
                      lines: order.lines.map(l => ({ id: l.id, quantityPicked: pickedQtys[l.id] ?? l.quantity })),
                    })
                  }
                >
                  <Package className="w-3.5 h-3.5 mr-1.5" />
                  Save Progress
                </Button>
                <Button
                  size="sm"
                  disabled={loading}
                  className="bg-emerald-700 hover:bg-emerald-600"
                  onClick={() =>
                    patch({
                      status: 'finished',
                      quantityToAssemble: qtyToAssemble,
                      lines: order.lines.map(l => ({ id: l.id, quantityPicked: pickedQtys[l.id] ?? l.quantity })),
                    })
                  }
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Finish Assembly
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
