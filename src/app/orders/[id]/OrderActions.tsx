'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const voidOrder = async () => {
    if (!confirm('Void this order? This cannot be undone.')) return
    setLoading(true)
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'voided' }),
    })
    if (res.ok) router.refresh()
    else alert('Failed to void order')
    setLoading(false)
  }

  if (!['pending', 'paid'].includes(status)) return null

  return (
    <Button variant="destructive" size="sm" onClick={voidOrder} disabled={loading}>
      {loading ? 'Voiding…' : 'Void Order'}
    </Button>
  )
}
