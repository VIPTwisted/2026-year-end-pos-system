'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, PlayCircle, Send, PackageCheck, Flag } from 'lucide-react'

interface Props {
  orderId: string
  status: string
  quantity: number
  quantityFinished: number
}

const TRANSITION_LABELS: Record<string, { label: string; next: string; icon: React.ElementType; variant: 'default' | 'outline' | 'destructive' }> = {
  simulated: { label: 'Plan Order', next: 'planned', icon: PlayCircle, variant: 'outline' },
  planned: { label: 'Firm Plan', next: 'firm_planned', icon: CheckCircle, variant: 'outline' },
  firm_planned: { label: 'Release', next: 'released', icon: Send, variant: 'default' },
}

export function ProductionOrderActions({ orderId, status, quantity, quantityFinished }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPostOutput, setShowPostOutput] = useState(false)
  const [outputQty, setOutputQty] = useState(String(quantity - quantityFinished))

  const transition = TRANSITION_LABELS[status]

  const patchOrder = async (body: Record<string, unknown>) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/manufacturing/production-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handlePostOutput = async () => {
    const qty = parseFloat(outputQty)
    if (isNaN(qty) || qty <= 0) {
      setError('Enter a valid quantity')
      return
    }
    await patchOrder({ quantityFinished: quantityFinished + qty })
    setShowPostOutput(false)
  }

  const handleFinish = async () => {
    if (quantityFinished <= 0) {
      setError('Post output quantity before finishing')
      return
    }
    await patchOrder({ status: 'finished', quantityFinished })
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Status transition button */}
        {transition && (
          <Button
            variant={transition.variant}
            size="sm"
            disabled={loading}
            onClick={() => patchOrder({ status: transition.next })}
          >
            <transition.icon className="w-3.5 h-3.5 mr-1.5" />
            {transition.label}
          </Button>
        )}

        {/* Post Output button — available when released */}
        {status === 'released' && (
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => setShowPostOutput(v => !v)}
          >
            <PackageCheck className="w-3.5 h-3.5 mr-1.5" />
            Post Output
          </Button>
        )}

        {/* Finish button — released + has output */}
        {status === 'released' && (
          <Button
            variant="default"
            size="sm"
            disabled={loading || quantityFinished <= 0}
            onClick={handleFinish}
          >
            <Flag className="w-3.5 h-3.5 mr-1.5" />
            Finish Order
          </Button>
        )}
      </div>

      {/* Post Output Modal */}
      {showPostOutput && (
        <div className="mt-3 p-4 bg-zinc-900 border border-zinc-700 rounded-lg space-y-3">
          <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Post Output Quantity</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0.001"
              step="any"
              value={outputQty}
              onChange={e => setOutputQty(e.target.value)}
              className="w-36 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
            <Button size="sm" onClick={handlePostOutput} disabled={loading}>
              {loading ? 'Posting…' : 'Confirm'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowPostOutput(false)}>Cancel</Button>
          </div>
          <p className="text-xs text-zinc-600">
            Already finished: {quantityFinished} / {quantity}
          </p>
        </div>
      )}
    </div>
  )
}
