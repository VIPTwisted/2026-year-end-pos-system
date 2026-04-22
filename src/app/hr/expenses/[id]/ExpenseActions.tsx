'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Send, Check, X, BookOpen } from 'lucide-react'

export default function ExpenseActions({
  id,
  status,
}: {
  id: string
  status: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const action = async (actionName: string, extra?: Record<string, string>) => {
    setBusy(true)
    await fetch(`/api/expenses/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionName, ...extra }),
    })
    router.refresh()
    setBusy(false)
  }

  return (
    <div className="flex gap-2">
      {status === 'draft' && (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => action('submit')}
          className="gap-2 text-blue-400 border-blue-500/30"
        >
          <Send className="w-4 h-4" /> Submit
        </Button>
      )}
      {status === 'submitted' && (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => action('reject')}
            className="gap-2 text-red-400 border-red-500/30"
          >
            <X className="w-4 h-4" /> Reject
          </Button>
          <Button
            size="sm"
            disabled={busy}
            onClick={() => action('approve', { approvedBy: 'Manager' })}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-4 h-4" /> Approve
          </Button>
        </>
      )}
      {status === 'approved' && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => action('post')}
          className="gap-2 bg-violet-600 hover:bg-violet-700"
        >
          <BookOpen className="w-4 h-4" /> Post to GL
        </Button>
      )}
    </div>
  )
}
