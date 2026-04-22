'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Send, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

interface TimesheetActionsProps {
  sheetId: string
  status: string
}

export function TimesheetActions({ sheetId, status }: TimesheetActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const patch = async (action: string, newStatus: string) => {
    setLoading(action)
    try {
      const res = await fetch(`/api/timesheets/${sheetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'open' && (
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={loading !== null}
          onClick={() => patch('submit', 'submitted')}>
          <Send className="w-3 h-3" />
          {loading === 'submit' ? 'Submitting…' : 'Submit'}
        </Button>
      )}
      {status === 'submitted' && (
        <>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs text-emerald-400 border-emerald-900 hover:bg-emerald-950" disabled={loading !== null}
            onClick={() => patch('approve', 'approved')}>
            <CheckCircle className="w-3 h-3" />
            {loading === 'approve' ? 'Approving…' : 'Approve'}
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-red-400 hover:bg-red-950" disabled={loading !== null}
            onClick={() => patch('reject', 'rejected')}>
            <XCircle className="w-3 h-3" />
            {loading === 'reject' ? 'Rejecting…' : 'Reject'}
          </Button>
        </>
      )}
      {(status === 'rejected') && (
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={loading !== null}
          onClick={() => patch('reopen', 'open')}>
          <RotateCcw className="w-3 h-3" />
          {loading === 'reopen' ? 'Reopening…' : 'Reopen'}
        </Button>
      )}
    </div>
  )
}
