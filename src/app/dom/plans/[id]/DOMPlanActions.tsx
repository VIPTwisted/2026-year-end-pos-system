'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Play, Zap } from 'lucide-react'

export function DOMPlanActions({ planId, status }: { planId: string; status: string }) {
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

  return (
    <div className="flex items-center gap-2">
      {status === 'pending' && (
        <Button size="sm" disabled={loading} onClick={() => patch({ status: 'approved' })}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Approving…' : 'Approve Plan'}
        </Button>
      )}
      {status === 'approved' && (
        <Button size="sm" disabled={loading} onClick={() => patch({ action: 'execute' })}>
          <Zap className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Executing…' : 'Execute (Pick All)'}
        </Button>
      )}
      {status === 'executing' && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => patch({ action: 'complete' })}>
          <Play className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Completing…' : 'Mark Complete'}
        </Button>
      )}
    </div>
  )
}
