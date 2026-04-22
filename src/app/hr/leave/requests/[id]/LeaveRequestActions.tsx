'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Ban } from 'lucide-react'

export default function LeaveRequestActions({
  requestId,
  currentStatus,
}: {
  requestId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [denialReason, setDenialReason] = useState('')
  const [showDenyInput, setShowDenyInput] = useState(false)

  async function doAction(action: string, extra?: Record<string, unknown>) {
    setLoading(true)
    await fetch(`/api/hr/leave/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    setLoading(false)
    router.refresh()
  }

  if (currentStatus === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => doAction('approve')} disabled={loading}>
          <CheckCircle className="w-4 h-4 mr-1.5" />Approve
        </Button>
        {showDenyInput ? (
          <div className="flex items-center gap-2">
            <input
              value={denialReason}
              onChange={e => setDenialReason(e.target.value)}
              placeholder="Denial reason..."
              className="h-9 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none"
            />
            <Button size="sm" variant="destructive" onClick={() => doAction('deny', { denialReason })} disabled={loading}>
              Confirm Deny
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setShowDenyInput(true)} disabled={loading}>
            <XCircle className="w-4 h-4 mr-1.5" />Deny
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => doAction('cancel')} disabled={loading}>
          <Ban className="w-4 h-4 mr-1.5" />Cancel
        </Button>
      </div>
    )
  }
  if (currentStatus === 'approved') {
    return (
      <Button size="sm" variant="ghost" onClick={() => doAction('cancel')} disabled={loading}>
        <Ban className="w-4 h-4 mr-1.5" />Cancel
      </Button>
    )
  }
  return null
}
