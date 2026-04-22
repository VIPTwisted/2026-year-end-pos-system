'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, Trash2 } from 'lucide-react'

export function RatingActions({ ratingId, isApproved }: { ratingId: string; isApproved: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const patch = async (data: Record<string, unknown>) => {
    setLoading(true)
    await fetch(`/api/ecommerce/ratings/${ratingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
    setLoading(false)
  }

  const del = async () => {
    if (!confirm('Delete this review?')) return
    setLoading(true)
    await fetch(`/api/ecommerce/ratings/${ratingId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {!isApproved && (
        <Button size="sm" variant="default" className="h-6 px-2 text-xs" disabled={loading} onClick={() => patch({ isApproved: true })}>
          <Check className="w-3 h-3" />
        </Button>
      )}
      {isApproved && (
        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" disabled={loading} onClick={() => patch({ isApproved: false })}>
          <X className="w-3 h-3" />
        </Button>
      )}
      <Button size="sm" variant="destructive" className="h-6 px-2 text-xs" disabled={loading} onClick={del}>
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  )
}
