'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Scissors, X } from 'lucide-react'

interface Store { id: string; name: string }

interface Props {
  productId: string
  stores: Store[]
  products: { id: string; name: string; sku: string }[]
}

export function KitActions({ productId, stores }: Props) {
  const router = useRouter()
  const [showDisassemble, setShowDisassemble] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors'

  const handleDisassemble = async () => {
    if (!storeId || !quantity) {
      setError('Store and quantity are required')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/products/kits/${productId}/disassemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseFloat(quantity), storeId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Disassembly failed')
      setSuccess(`Disassembled ${data.disassembledQty} kit(s)`)
      setShowDisassemble(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Actions</div>

          {!showDisassemble ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowDisassemble(true)}
            >
              <Scissors className="w-3.5 h-3.5" />
              Disassemble Kit
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Disassemble Kit</span>
                <button onClick={() => setShowDisassemble(false)} className="text-zinc-600 hover:text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Store</label>
                <select value={storeId} onChange={e => setStoreId(e.target.value)} className={inputCls}>
                  <option value="">Select store…</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className={inputCls}
                />
              </div>
              {error && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1.5">{error}</div>
              )}
              <Button
                size="sm"
                className="w-full"
                onClick={handleDisassemble}
                disabled={loading}
              >
                {loading ? 'Disassembling…' : 'Confirm Disassembly'}
              </Button>
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded px-2 py-1.5 mt-2">{success}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
