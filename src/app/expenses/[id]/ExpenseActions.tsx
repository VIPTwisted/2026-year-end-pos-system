'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Send, CheckCircle, XCircle } from 'lucide-react'

interface ExpenseActionsProps {
  reportId: string
  status: string
}

export function ExpenseActions({ reportId, status }: ExpenseActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const run = async (action: string) => {
    setLoading(action)
    setMsg('')
    try {
      const res = await fetch(`/api/expenses/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')
      setMsg('Updated')
      router.refresh()
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(null)
    }
  }

  const canSubmit  = status === 'draft'
  const canApprove = status === 'submitted'
  const canReject  = status === 'submitted'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSubmit && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          disabled={loading !== null}
          onClick={() => run('submit')}
        >
          <Send className="w-3 h-3" />
          {loading === 'submit' ? 'Submitting…' : 'Submit for Approval'}
        </Button>
      )}
      {canApprove && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs text-emerald-400 border-emerald-900 hover:bg-emerald-950"
          disabled={loading !== null}
          onClick={() => run('approve')}
        >
          <CheckCircle className="w-3 h-3" />
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </Button>
      )}
      {canReject && (
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs text-red-400 hover:bg-red-950"
          disabled={loading !== null}
          onClick={() => {
            if (confirm('Reject this expense report?')) run('reject')
          }}
        >
          <XCircle className="w-3 h-3" />
          {loading === 'reject' ? 'Rejecting…' : 'Reject'}
        </Button>
      )}
      {msg && <span className="text-xs text-zinc-400 ml-2">{msg}</span>}
    </div>
  )
}
