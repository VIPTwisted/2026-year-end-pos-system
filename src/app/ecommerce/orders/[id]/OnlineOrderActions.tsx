'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const TRANSITIONS: Record<string, { label: string; next: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }[]> = {
  pending: [
    { label: 'Confirm', next: 'confirmed', variant: 'default' },
    { label: 'Cancel', next: 'cancelled', variant: 'destructive' },
  ],
  confirmed: [
    { label: 'Mark Processing', next: 'processing', variant: 'default' },
    { label: 'Cancel', next: 'cancelled', variant: 'destructive' },
  ],
  processing: [
    { label: 'Ship', next: 'shipped', variant: 'default' },
  ],
  shipped: [
    { label: 'Mark Delivered', next: 'delivered', variant: 'default' },
  ],
}

export function OnlineOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState('')
  const [showTracking, setShowTracking] = useState(false)

  const actions = TRANSITIONS[status] ?? []

  const applyAction = async (next: string) => {
    if (next === 'shipped' && !tracking.trim()) {
      setShowTracking(true)
      return
    }
    setLoading(true)
    const body: Record<string, string> = { status: next }
    if (next === 'shipped' && tracking.trim()) body.trackingNumber = tracking.trim()
    const res = await fetch(`/api/ecommerce/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) router.refresh()
    else alert('Update failed')
    setLoading(false)
    setShowTracking(false)
  }

  if (actions.length === 0) return null

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {showTracking && (
        <input
          type="text"
          value={tracking}
          onChange={e => setTracking(e.target.value)}
          placeholder="Enter tracking number"
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 w-52"
        />
      )}
      {actions.map(a => (
        <Button
          key={a.next}
          size="sm"
          variant={a.variant}
          disabled={loading}
          onClick={() => applyAction(a.next)}
        >
          {loading ? 'Updating…' : a.label}
        </Button>
      ))}
    </div>
  )
}
