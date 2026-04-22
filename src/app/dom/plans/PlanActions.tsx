'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function PlanActions({ planId, status }: { planId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const patch = async (body: Record<string, string>) => {
    setLoading(true)
    await fetch(`/api/dom/plans/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    router.refresh()
    setLoading(false)
  }

  if (status === 'pending') {
    return (
      <Button size="sm" className="h-6 px-2 text-xs" disabled={loading} onClick={() => patch({ status: 'approved' })}>
        {loading ? '…' : 'Approve'}
      </Button>
    )
  }
  if (status === 'approved') {
    return (
      <Button size="sm" className="h-6 px-2 text-xs" disabled={loading} onClick={() => patch({ action: 'execute' })}>
        {loading ? '…' : 'Execute'}
      </Button>
    )
  }
  if (status === 'executing') {
    return (
      <Button size="sm" variant="outline" className="h-6 px-2 text-xs" disabled={loading} onClick={() => patch({ action: 'complete' })}>
        {loading ? '…' : 'Complete'}
      </Button>
    )
  }
  return null
}
