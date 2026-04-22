'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Send, Eye, CheckCircle } from 'lucide-react'

const ACTIONS: Record<string, { label: string; action: string; icon: React.ComponentType<{ className?: string }>; variant?: 'default' | 'outline' | 'ghost' }[]> = {
  draft: [{ label: 'Start Review', action: 'start', icon: Play }],
  in_progress: [{ label: 'Submit for Employee Review', action: 'submit', icon: Send }],
  employee_review: [{ label: 'Send to Manager', action: 'manager_review', icon: Eye }],
  manager_review: [{ label: 'Complete Review', action: 'complete', icon: CheckCircle }],
}

export default function ReviewActions({ reviewId, currentStatus }: { reviewId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const actions = ACTIONS[currentStatus] ?? []
  if (actions.length === 0) return null

  async function doAction(action: string) {
    setLoading(true)
    await fetch(`/api/hr/performance/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map(a => (
        <Button key={a.action} size="sm" variant={a.variant ?? 'default'} onClick={() => doAction(a.action)} disabled={loading}>
          <a.icon className="w-4 h-4 mr-1.5" />
          {a.label}
        </Button>
      ))}
    </div>
  )
}
