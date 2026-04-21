'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export function POActions({ poId }: { poId: string }) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')

  async function handleCancel() {
    if (!confirm('Cancel this purchase order? This cannot be undone.')) return
    setCancelling(true)
    setError('')
    try {
      const res = await fetch(`/api/purchasing/${poId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to cancel PO.')
        setCancelling(false)
        return
      }
      router.refresh()
    } catch {
      setError('Network error.')
      setCancelling(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleCancel}
        disabled={cancelling}
      >
        <XCircle className="w-4 h-4 mr-1" />
        {cancelling ? 'Cancelling…' : 'Cancel PO'}
      </Button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
