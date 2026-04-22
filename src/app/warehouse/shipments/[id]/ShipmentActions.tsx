'use client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PackageSearch, Truck } from 'lucide-react'

export function ShipmentActions({ shipmentId, status }: { shipmentId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function createPick() {
    setLoading('pick')
    try {
      const res = await fetch(`/api/warehouse/shipments/${shipmentId}/pick`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const activity = await res.json()
      router.push(`/warehouse/activities/${activity.id}`)
    } catch {
      alert('Error creating pick activity')
    } finally {
      setLoading(null)
    }
  }

  async function postShipment() {
    if (!confirm('Post this shipment? This will deduct inventory quantities.')) return
    setLoading('post')
    try {
      const res = await fetch(`/api/warehouse/shipments/${shipmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'post' }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      alert('Error posting shipment')
    } finally {
      setLoading(null)
    }
  }

  if (status === 'posted') {
    return <p className="text-xs text-zinc-500 italic">Shipment posted</p>
  }

  return (
    <div className="flex gap-2">
      {status !== 'picked' && (
        <Button size="sm" variant="outline" onClick={createPick} disabled={loading !== null} className="gap-2">
          <PackageSearch className="w-4 h-4" />
          {loading === 'pick' ? 'Creating…' : 'Create Pick'}
        </Button>
      )}
      <Button size="sm" onClick={postShipment} disabled={loading !== null}
        className="bg-amber-600 hover:bg-amber-500 text-white gap-2">
        <Truck className="w-4 h-4" />
        {loading === 'post' ? 'Posting…' : 'Post Shipment'}
      </Button>
    </div>
  )
}
